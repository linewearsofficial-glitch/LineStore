import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrderProgressTracker from '@/components/features/OrderProgressTracker';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function OrderTrackingPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [searchNumber, setSearchNumber] = useState(orderNumber === 'lookup' ? '' : orderNumber || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!searchNumber || !email) return;
    setLoading(true);
    setNotFound(false);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', searchNumber.toUpperCase())
      .eq('email', email.toLowerCase())
      .single();
    setLoading(false);
    if (data) {
      setOrder(data as Order);
    } else {
      setNotFound(true);
      setOrder(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-line-gray block mb-2">Delivery</span>
            <h1 className="font-display text-5xl md:text-7xl leading-none mb-4">TRACK ORDER</h1>
            <p className="font-serif italic text-line-gray">Enter your order number and email to see your delivery status.</p>
          </div>

          {/* Search form */}
          <div className="border border-line-border p-6 md:p-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Order Number</label>
                <input
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
                  placeholder="LN-XXXXXX-XXXX"
                  className="input-box"
                />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-box"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchNumber || !email}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Track My Order
              </button>
            </div>
          </div>

          {notFound && (
            <div className="border border-red-200 bg-red-50 p-6 text-center mb-8">
              <p className="font-sans text-sm text-red-600">
                No order found with that number and email. Please check your details or contact us.
              </p>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Order header */}
              <div className="border border-line-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-line-gray">Order</p>
                    <p className="font-display text-2xl">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-xs uppercase tracking-widest text-line-gray">Total</p>
                    <p className="font-sans font-bold text-lg">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div>
                    <span className="font-sans text-xs uppercase tracking-widest text-line-gray block mb-1">Payment</span>
                    <span className={`badge-${order.payment_status}`}>{order.payment_status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-sans text-xs uppercase tracking-widest text-line-gray block mb-1">Fulfillment</span>
                    <span className={`badge-${order.fulfillment_status}`}>{order.fulfillment_status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Progress */}
                <OrderProgressTracker status={order.fulfillment_status} />
              </div>

              {/* Tracking info */}
              {order.tracking_number && (
                <div className="border border-line-border p-6">
                  <h3 className="font-display text-xl tracking-widest mb-4">TRACKING INFO</h3>
                  <div className="grid grid-cols-2 gap-4 font-sans text-sm">
                    <div>
                      <p className="text-line-gray text-xs uppercase tracking-widest mb-1">Carrier</p>
                      <p className="font-medium">{order.carrier || '—'}</p>
                    </div>
                    <div>
                      <p className="text-line-gray text-xs uppercase tracking-widest mb-1">Tracking Number</p>
                      <p className="font-medium font-mono">{order.tracking_number}</p>
                    </div>
                    {order.estimated_delivery && (
                      <div>
                        <p className="text-line-gray text-xs uppercase tracking-widest mb-1">Est. Delivery</p>
                        <p className="font-medium">{order.estimated_delivery}</p>
                      </div>
                    )}
                  </div>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 btn-outline inline-flex items-center gap-2 text-sm py-2 px-4"
                    >
                      <ExternalLink size={14} />
                      Track on Carrier Site
                    </a>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="border border-line-border p-6">
                <h3 className="font-display text-xl tracking-widest mb-4">ITEMS</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between font-sans text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-line-gray text-xs">{[item.color, item.size].filter(Boolean).join(' / ')} × {item.quantity}</p>
                      </div>
                      <p>{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div className="border border-line-border p-6">
                <h3 className="font-display text-xl tracking-widest mb-3">SHIPPING TO</h3>
                <p className="font-sans text-sm">{order.first_name} {order.last_name}</p>
                <p className="font-sans text-sm text-line-gray">{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
                <p className="font-sans text-sm text-line-gray">{order.city}, {order.state} {order.zip}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
