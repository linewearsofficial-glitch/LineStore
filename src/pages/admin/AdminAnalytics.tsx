import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

async function fetchAnalytics() {
  const { data: orders } = await supabase.from('orders').select('*');
  return (orders || []) as Order[];
}

export default function AdminAnalytics() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['admin_analytics'], queryFn: fetchAnalytics });

  const paid = orders.filter((o) => o.payment_status === 'paid');
  const failed = orders.filter((o) => o.payment_status === 'failed');
  const refunded = orders.filter((o) => o.payment_status === 'refunded');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const aov = paid.length ? revenue / paid.length : 0;
  const refundRate = orders.length ? (refunded.length / orders.length) * 100 : 0;

  // Revenue by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayOrders = paid.filter((o) => o.created_at?.startsWith(key));
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
  });

  const maxRevenue = Math.max(...last7.map((d) => d.revenue), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">ANALYTICS</h1>
        <p className="font-sans text-sm text-line-gray">Store performance overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue', value: formatPrice(revenue) },
          { label: 'Paid Orders', value: paid.length.toString() },
          { label: 'Avg Order Value', value: formatPrice(aov) },
          { label: 'Refund Rate', value: refundRate.toFixed(1) + '%' },
          { label: 'Failed Payments', value: failed.length.toString() },
          { label: 'Total Orders', value: orders.length.toString() },
          { label: 'Refunded', value: refunded.length.toString() },
          { label: 'Conversion', value: orders.length ? ((paid.length / orders.length) * 100).toFixed(1) + '%' : '0%' },
        ].map((s) => (
          <div key={s.label} className="admin-card">
            <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-1">{s.label}</p>
            <p className="font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="admin-card mb-6">
        <h2 className="font-display text-2xl mb-6">REVENUE — LAST 7 DAYS</h2>
        <div className="flex items-end gap-3 h-40">
          {last7.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="font-sans text-xs text-line-gray">{d.revenue > 0 ? formatPrice(d.revenue) : ''}</span>
              <div
                className="w-full bg-line-black transition-all duration-500"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '0' }}
              />
              <span className="font-sans text-xs text-line-gray">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment provider breakdown */}
      <div className="admin-card">
        <h2 className="font-display text-2xl mb-4">PAYMENT PROVIDERS</h2>
        {['paystack', 'flutterwave', 'apple_pay'].map((provider) => {
          const providerOrders = paid.filter((o) => o.payment_provider === provider);
          const providerRevenue = providerOrders.reduce((s, o) => s + o.total, 0);
          return (
            <div key={provider} className="flex justify-between items-center py-3 border-b border-line-border last:border-0 font-sans text-sm">
              <span className="capitalize">{provider.replace('_', ' ')}</span>
              <span>{providerOrders.length} orders — {formatPrice(providerRevenue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
