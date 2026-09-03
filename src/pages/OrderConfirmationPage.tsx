import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';
import BrandLogo from '@/components/features/BrandLogo';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setOrder(data as Order);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-line-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar /><Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <h1 className="font-display text-4xl">Order not found</h1>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-line-gray block mb-2">
              Order Confirmed
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-none mb-4">THANK YOU</h1>
            <p className="font-serif italic text-line-gray text-lg">
              Your order is confirmed and being prepared.
            </p>
            <div className="mt-4 inline-block bg-line-light px-6 py-3">
              <span className="font-sans text-xs uppercase tracking-widest text-line-gray">Order Number</span>
              <p className="font-display text-2xl text-line-black">{order.order_number}</p>
            </div>
          </div>

          {/* Confirmation email notice */}
          <div className="bg-line-light p-4 text-center mb-8">
            <p className="font-sans text-sm text-line-gray">
              A confirmation has been sent to <strong className="text-line-black">{order.email}</strong>
            </p>
          </div>

          {/* Order details */}
          <div className="border border-line-border">
            <div className="px-6 py-4 border-b border-line-border bg-line-light">
              <h2 className="font-display text-xl tracking-widest">ORDER DETAILS</h2>
            </div>
            <div className="p-6 space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between font-sans text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-line-gray text-xs">{[item.color, item.size].filter(Boolean).join(' / ')} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.total_price)}</p>
                </div>
              ))}
              <div className="border-t border-line-border pt-4 space-y-2">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-line-gray">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-line-gray">Shipping</span>
                  <span>{order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-sans font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="border border-line-border mt-4">
            <div className="px-6 py-4 border-b border-line-border bg-line-light">
              <h2 className="font-display text-xl tracking-widest">SHIPPING TO</h2>
            </div>
            <div className="p-6 font-sans text-sm space-y-1">
              <p className="font-medium">{order.first_name} {order.last_name}</p>
              <p className="text-line-gray">{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
              <p className="text-line-gray">{order.city}, {order.state} {order.zip}</p>
              <p className="text-line-gray">{order.country}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to={`/track/${order.order_number}`} className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
              <Package size={16} />
              Track Order
            </Link>
            <Link to="/shop" className="btn-outline flex-1 text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
