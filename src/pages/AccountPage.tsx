import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package } from 'lucide-react';

export default function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const lookupOrders = async () => {
    if (!email) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false });
    setOrders((data || []) as Order[]);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl md:text-7xl mb-4">MY ACCOUNT</h1>
            <p className="font-serif italic text-line-gray">Enter your email to view your order history.</p>
          </div>

          <div className="border border-line-border p-6 mb-8">
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-box flex-1"
              />
              <button onClick={lookupOrders} disabled={loading} className="btn-primary px-6 py-3">
                {loading ? '...' : 'Look Up'}
              </button>
            </div>
          </div>

          {searched && orders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-line-border mb-4" />
              <p className="font-sans text-line-gray">No orders found for that email.</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="border border-line-border mb-4">
              <div className="px-6 py-4 bg-line-light flex justify-between items-center">
                <div>
                  <p className="font-display text-xl">{order.order_number}</p>
                  <p className="font-sans text-xs text-line-gray">{order.created_at ? formatDate(order.created_at) : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-bold">{formatPrice(order.total)}</p>
                  <span className={`badge-${order.fulfillment_status} text-xs`}>{order.fulfillment_status.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="p-6">
                {order.order_items?.slice(0, 2).map((item) => (
                  <p key={item.id} className="font-sans text-sm">{item.product_name} × {item.quantity}</p>
                ))}
                <button
                  onClick={() => navigate(`/track/${order.order_number}`)}
                  className="mt-3 font-sans text-xs uppercase tracking-widest text-line-black underline hover:text-line-gray"
                >
                  Track Order →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
