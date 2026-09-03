import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, DollarSign, Package, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Order } from '@/types';

async function fetchDashboardData() {
  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, price, status'),
    supabase.from('customers').select('id'),
  ]);
  return {
    orders: (ordersRes.data || []) as Order[],
    products: ordersRes.data?.length || 0,
    productList: productsRes.data || [],
    customers: (customersRes.data || []).length,
  };
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin_dashboard'], queryFn: fetchDashboardData });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-line-black border-t-transparent rounded-full animate-spin" /></div>;

  const orders = data?.orders || [];
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingFulfillment = orders.filter((o) => o.payment_status === 'paid' && o.fulfillment_status === 'awaiting_fulfillment').length;
  const aov = paidOrders.length > 0 ? revenue / paidOrders.length : 0;
  const recentOrders = orders.slice(0, 6);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(revenue), icon: DollarSign, sub: `${paidOrders.length} paid orders` },
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, sub: `${pendingFulfillment} pending fulfillment` },
    { label: 'Avg Order Value', value: formatPrice(aov), icon: TrendingUp, sub: 'Per paid order' },
    { label: 'Customers', value: (data?.customers || 0).toString(), icon: Users, sub: 'Registered accounts' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">DASHBOARD</h1>
        <p className="font-sans text-sm text-line-gray mt-1">Lin°e Admin Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card">
            <div className="flex justify-between items-start mb-3">
              <span className="font-sans text-xs uppercase tracking-widest text-line-gray">{stat.label}</span>
              <div className="bg-line-light p-2">
                <stat.icon size={14} className="text-line-black" />
              </div>
            </div>
            <p className="font-display text-3xl">{stat.value}</p>
            <p className="font-sans text-xs text-line-gray mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {pendingFulfillment > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3 mb-6">
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
          <p className="font-sans text-sm">
            <strong>{pendingFulfillment} order{pendingFulfillment !== 1 ? 's' : ''}</strong> paid and awaiting fulfillment.{' '}
            <Link to="/admin/fulfillment" className="underline">Process now →</Link>
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div className="admin-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl">RECENT ORDERS</h2>
          <Link to="/admin/orders" className="font-sans text-xs uppercase tracking-widest hover:text-line-gray">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-line-border">
                <th className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray">Order</th>
                <th className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray">Customer</th>
                <th className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray">Amount</th>
                <th className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray">Payment</th>
                <th className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-line-gray">No orders yet</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="table-row-hover border-b border-line-border last:border-0">
                  <td className="py-3">
                    <Link to="/admin/orders" className="font-medium text-line-black hover:underline">{order.order_number}</Link>
                  </td>
                  <td className="py-3 text-line-gray">{order.email}</td>
                  <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="py-3"><span className={`badge-${order.payment_status}`}>{order.payment_status}</span></td>
                  <td className="py-3"><span className={`badge-${order.fulfillment_status}`}>{order.fulfillment_status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
