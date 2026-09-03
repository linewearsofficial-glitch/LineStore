import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Apple } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import BrandLogo from '@/components/features/BrandLogo';
import CustomSelect from '@/components/features/CustomSelect';
import { useCartStore } from '@/stores/cartStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber, generateReference, loadScript } from '@/lib/utils';
import { US_STATES, SHIPPING_COST } from '@/constants';
import { toast } from 'sonner';
import { CheckoutForm } from '@/types';

declare global {
  interface Window {
    PaystackPop: { setup: (config: Record<string, unknown>) => { openIframe: () => void } };
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
    ApplePaySession?: { canMakePayments: () => boolean; new(version: number, request: unknown): ApplePaySessionInstance };
  }
}
interface ApplePaySessionInstance {
  onpaymentauthorized: (fn: (event: { payment: unknown }) => void) => void;
  begin: () => void;
  completePayment: (status: number) => void;
}

const FIELD_LABELS: Record<string, string> = {
  email: 'Email', first_name: 'First Name', last_name: 'Last Name',
  phone: 'Phone', address_line1: 'Address', city: 'City', state: 'State', zip: 'ZIP Code',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getShipping, getTotal, clearCart } = useCartStore();
  const { data: settings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    email: '', first_name: '', last_name: '', phone: '',
    address_line1: '', address_line2: '', city: '', state: '', zip: '', country: 'US',
  });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  useEffect(() => {
    const checkApplePay = async () => {
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setApplePayAvailable(true);
      }
    };
    checkApplePay();
  }, []);

  const validate = (): boolean => {
    const required = ['email', 'first_name', 'last_name', 'phone', 'address_line1', 'city', 'state', 'zip'];
    const newErrors: Partial<CheckoutForm> = {};
    let valid = true;
    required.forEach((field) => {
      if (!form[field as keyof CheckoutForm]) {
        newErrors[field as keyof CheckoutForm] = `${FIELD_LABELS[field] || field} is required`;
        valid = false;
      }
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleContinue = () => {
    if (validate()) setStep('payment');
  };

  const createOrder = async (reference: string, provider: string): Promise<string> => {
    const orderNumber = generateOrderNumber();
    const idempotencyKey = `${orderNumber}-${reference}`;

    // Upsert or find customer
    const { data: customer } = await supabase
      .from('customers')
      .upsert({ email: form.email, first_name: form.first_name, last_name: form.last_name, phone: form.phone }, { onConflict: 'email' })
      .select()
      .single();

    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_id: customer?.id,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
      subtotal,
      shipping_cost: shipping,
      total,
      payment_provider: provider,
      payment_reference: reference,
      payment_status: 'pending',
      fulfillment_status: 'awaiting_fulfillment',
      idempotency_key: idempotencyKey,
    }).select().single();

    if (error) throw error;

    // Insert order items
    const orderItemsData = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      cj_product_id: item.cjProductId,
      cj_variant_id: item.cjVariantId,
      image_url: item.imageUrl,
    }));
    await supabase.from('order_items').insert(orderItemsData);

    return order.id;
  };

  const verifyPayment = async (reference: string, provider: string, orderId: string) => {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { reference, provider, orderId },
    });
    if (error) {
      let msg = 'Payment verification failed. Contact support with ref: ' + reference;
      try {
        const text = await (error as { context?: { text?: () => Promise<string> } }).context?.text?.();
        if (text) msg = text;
      } catch {}
      console.error('Payment verify error:', msg);
      toast.error(msg);
      return false;
    }
    return data?.verified === true;
  };

  const payWithPaystack = async () => {
    const pk = settings?.['paystack_public_key'];
    if (!pk) { toast.error('Payment not configured. Contact support.'); return; }
    setLoading(true);
    await loadScript('https://js.paystack.co/v1/inline.js');
    const reference = generateReference();
    const orderId = await createOrder(reference, 'paystack');
    setLoading(false);
    const handler = window.PaystackPop.setup({
      key: pk,
      email: form.email,
      amount: Math.round(total * 100),
      currency: 'USD',
      ref: reference,
      metadata: { order_id: orderId, custom_fields: [{ display_name: 'Order', variable_name: 'order_id', value: orderId }] },
      onSuccess: async (transaction: { reference: string }) => {
        setLoading(true);
        const verified = await verifyPayment(transaction.reference, 'paystack', orderId);
        setLoading(false);
        if (verified) {
          clearCart();
          navigate(`/order-confirmation/${orderId}`);
        }
      },
      onCancel: () => { toast.error('Payment cancelled'); },
    });
    handler.openIframe();
  };

  const payWithFlutterwave = async () => {
    const pk = settings?.['flutterwave_public_key'];
    if (!pk) { toast.error('Payment not configured. Contact support.'); return; }
    setLoading(true);
    await loadScript('https://checkout.flutterwave.com/v3.js');
    const reference = generateReference();
    const orderId = await createOrder(reference, 'flutterwave');
    setLoading(false);
    window.FlutterwaveCheckout({
      public_key: pk,
      tx_ref: reference,
      amount: total,
      currency: 'USD',
      customer: { email: form.email, name: `${form.first_name} ${form.last_name}`, phone_number: form.phone },
      customizations: { title: "Lin°e", description: 'Fashion Order', logo: '' },
      callback: async (response: { status: string; transaction_id: string; tx_ref: string }) => {
        if (response.status === 'successful') {
          setLoading(true);
          const verified = await verifyPayment(response.tx_ref, 'flutterwave', orderId);
          setLoading(false);
          if (verified) {
            clearCart();
            navigate(`/order-confirmation/${orderId}`);
          }
        }
      },
      onclose: () => {},
    });
  };

  const payWithApplePay = async () => {
    if (!window.ApplePaySession) { toast.error('Apple Pay not available'); return; }
    const request = {
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: { label: "Lin°e", amount: total.toFixed(2) },
    };
    const session = new (window.ApplePaySession as unknown as new(v: number, r: unknown) => ApplePaySessionInstance)(3, request);
    session.onpaymentauthorized = async (event) => {
      const reference = generateReference();
      const orderId = await createOrder(reference, 'apple_pay');
      const verified = await verifyPayment(reference, 'apple_pay', orderId);
      session.completePayment(verified ? 0 : 1);
      if (verified) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      }
    };
    session.begin();
  };

  const paystackEnabled = settings?.['paystack_enabled'] !== 'false';
  const flutterwaveEnabled = settings?.['flutterwave_enabled'] !== 'false';

  const setField = (key: keyof CheckoutForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-line-light">
      <AnnouncementBar />
      <div className="bg-white border-b border-line-border py-4 px-6 flex items-center justify-between">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-2 text-line-gray">
          <Lock size={14} />
          <span className="font-sans text-xs">Secure Checkout</span>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 grid lg:grid-cols-2 gap-10">
        {/* Left: Form */}
        <div className="bg-white border border-line-border p-6 md:p-8">
          {step === 'info' ? (
            <>
              <h2 className="font-display text-3xl mb-8">CONTACT & SHIPPING</h2>
              <div className="space-y-5">
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`input-box ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-1">First Name *</label>
                    <input value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} className={`input-box ${errors.first_name ? 'border-red-500' : ''}`} />
                    {errors.first_name && <p className="font-sans text-xs text-red-500 mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-1">Last Name *</label>
                    <input value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} className={`input-box ${errors.last_name ? 'border-red-500' : ''}`} />
                    {errors.last_name && <p className="font-sans text-xs text-red-500 mt-1">{errors.last_name}</p>}
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+1 (555) 000-0000" className={`input-box ${errors.phone ? 'border-red-500' : ''}`} />
                  {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-1">Address *</label>
                  <input value={form.address_line1} onChange={(e) => setField('address_line1', e.target.value)} placeholder="123 Main St" className={`input-box ${errors.address_line1 ? 'border-red-500' : ''}`} />
                  {errors.address_line1 && <p className="font-sans text-xs text-red-500 mt-1">{errors.address_line1}</p>}
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-1">Apartment, Suite, Unit</label>
                  <input value={form.address_line2} onChange={(e) => setField('address_line2', e.target.value)} placeholder="Apt 4B (optional)" className="input-box" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-1">City *</label>
                    <input value={form.city} onChange={(e) => setField('city', e.target.value)} className={`input-box ${errors.city ? 'border-red-500' : ''}`} />
                    {errors.city && <p className="font-sans text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-1">ZIP Code *</label>
                    <input value={form.zip} onChange={(e) => setField('zip', e.target.value)} className={`input-box ${errors.zip ? 'border-red-500' : ''}`} />
                    {errors.zip && <p className="font-sans text-xs text-red-500 mt-1">{errors.zip}</p>}
                  </div>
                </div>
                <CustomSelect
                  label="State *"
                  options={US_STATES}
                  value={form.state}
                  onChange={(v) => setField('state', v)}
                  placeholder="Select your state"
                  error={errors.state}
                  required
                />
              </div>
              <button onClick={handleContinue} className="btn-primary w-full mt-8">
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setStep('info')} className="text-line-gray hover:text-line-black font-sans text-sm underline">← Edit Info</button>
                <h2 className="font-display text-3xl">PAYMENT</h2>
              </div>

              {/* Summary strip */}
              <div className="bg-line-light p-4 mb-6 text-sm font-sans">
                <p className="font-medium">{form.first_name} {form.last_name}</p>
                <p className="text-line-gray text-xs">{form.address_line1}, {form.city}, {form.state} {form.zip}</p>
              </div>

              <div className="space-y-4">
                {/* Apple Pay */}
                {applePayAvailable && (
                  <div>
                    <button
                      onClick={payWithApplePay}
                      disabled={loading}
                      className="w-full h-14 bg-black text-white flex items-center justify-center gap-3 font-sans font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Apple size={20} fill="white" />
                      Pay with Apple Pay
                    </button>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-line-border" />
                      <span className="font-sans text-xs text-line-gray">or</span>
                      <div className="flex-1 h-px bg-line-border" />
                    </div>
                  </div>
                )}

                {/* Paystack */}
                {paystackEnabled && (
                  <button
                    onClick={payWithPaystack}
                    disabled={loading}
                    className="w-full border-2 border-line-black py-4 flex items-center justify-center gap-3 font-sans font-semibold text-sm uppercase tracking-widest hover:bg-line-black hover:text-white transition-all disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    Pay with Card (Paystack)
                  </button>
                )}

                {/* Flutterwave */}
                {flutterwaveEnabled && (
                  <button
                    onClick={payWithFlutterwave}
                    disabled={loading}
                    className="w-full border-2 border-line-nude py-4 flex items-center justify-center gap-3 font-sans font-semibold text-sm uppercase tracking-widest text-line-nude hover:bg-line-nude hover:text-white transition-all disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    Pay with Card (Flutterwave)
                  </button>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-5 h-5 border-2 border-line-black border-t-transparent rounded-full animate-spin" />
                    <span className="font-sans text-sm text-line-gray">Processing...</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-line-gray">
                <Lock size={12} />
                <span className="font-sans text-xs">Your payment is encrypted and secure</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="bg-white border border-line-border p-6 md:p-8 sticky top-24">
            <h2 className="font-display text-2xl mb-6">ORDER SUMMARY</h2>
            <div className="space-y-4 mb-6">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex gap-3">
                  <div className="relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover bg-line-light" />
                    ) : (
                      <div className="w-16 h-20 bg-line-light" />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 bg-line-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm font-medium leading-tight">{item.name}</p>
                    <p className="font-sans text-xs text-line-gray">{[item.color, item.size].filter(Boolean).join(' / ')}</p>
                    <p className="font-sans text-sm font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line-border pt-4 space-y-3">
              <div className="flex justify-between font-sans text-sm">
                <span className="text-line-gray">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-line-gray">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-line-border pt-3 flex justify-between font-sans font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
