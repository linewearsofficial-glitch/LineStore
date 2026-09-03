import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
}

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['admin_orders'], queryFn: fetchOrders });
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateOrder = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_orders'] }); toast.success('Order updated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const retryFulfillment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('cj-fulfillment', { body: { orderId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_orders'] }); toast.success('Fulfillment retry submitted'); },
    onError: (e: Error) => toast.error('Retry failed: ' + e.message),
  });

  const filtered = orders.filter((o) =>
    !search ||
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl">ORDERS</h1>
          <p className="font-sans text-sm text-line-gray">{orders.length} total orders</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-line-gray" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or email..."
            className="input-box pl-9 w-full md:w-72"
          />
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-line-border">
              {['Order #', 'Customer', 'Date', 'Amount', 'Payment', 'Fulfillment', 'CJ Order', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="py-12 text-center text-line-gray">Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-line-gray">No orders found</td></tr>
            ) : filtered.map((order) => (
              <tr key={order.id} className="border-b border-line-border last:border-0 hover:bg-line-light cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="py-3 pr-4 font-medium">{order.order_number}</td>
                <td className="py-3 pr-4 text-line-gray truncate max-w-[140px]">{order.email}</td>
                <td className="py-3 pr-4 text-line-gray whitespace-nowrap">{order.created_at ? formatDate(order.created_at) : '—'}</td>
                <td className="py-3 pr-4 font-medium">{formatPrice(order.total)}</td>
                <td className="py-3 pr-4"><span className={getStatusBadgeClass(order.payment_status)}>{order.payment_status}</span></td>
                <td className="py-3 pr-4"><span className={getStatusBadgeClass(order.fulfillment_status)}>{order.fulfillment_status.replace(/_/g, ' ')}</span></td>
                <td className="py-3 pr-4 text-xs text-line-gray font-mono">{order.cj_order_id || '—'}</td>
                <td className="py-3 pr-4">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-line-gray hover:text-line-black p-1">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {order.fulfillment_status === 'fulfillment_error' && (
                      <button
                        onClick={() => retryFulfillment.mutate(order.id)}
                        className="text-line-gray hover:text-line-black p-1"
                        title="Retry fulfillment"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-line-border flex justify-between">
              <h2 className="font-display text-2xl">{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="font-sans text-sm text-line-gray hover:text-line-black">Close</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                <div>
                  <p className="text-xs uppercase tracking-widest text-line-gray mb-1">Customer</p>
                  <p>{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-line-gray">{selectedOrder.email}</p>
                  <p className="text-line-gray">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-line-gray mb-1">Shipping Address</p>
                  <p>{selectedOrder.address_line1}</p>
                  {selectedOrder.address_line2 && <p>{selectedOrder.address_line2}</p>}
                  <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-line-gray mb-3 font-sans">Items</p>
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-line-border font-sans text-sm">
                    <div>
                      <p>{item.product_name}</p>
                      <p className="text-line-gray text-xs">{[item.color, item.size].filter(Boolean).join(' / ')} × {item.quantity}</p>
                    </div>
                    <p>{formatPrice(item.total_price)}</p>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-sans font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status update */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-2">Payment Status</label>
                  <select
                    className="select-line w-full"
                    value={selectedOrder.payment_status}
                    onChange={(e) => updateOrder.mutate({ id: selectedOrder.id, updates: { payment_status: e.target.value as Order['payment_status'] } })}
                  >
                    {['pending','paid','failed','refunded','partially_refunded','chargeback'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-2">Fulfillment Status</label>
                  <select
                    className="select-line w-full"
                    value={selectedOrder.fulfillment_status}
                    onChange={(e) => updateOrder.mutate({ id: selectedOrder.id, updates: { fulfillment_status: e.target.value as Order['fulfillment_status'] } })}
                  >
                    {['awaiting_fulfillment','sent_to_cj','cj_processing','shipped','in_transit','delivered','fulfillment_error','cancelled'].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tracking update */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-2">Tracking Number</label>
                  <input
                    defaultValue={selectedOrder.tracking_number || ''}
                    className="input-box"
                    onBlur={(e) => updateOrder.mutate({ id: selectedOrder.id, updates: { tracking_number: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest block mb-2">Carrier</label>
                  <input
                    defaultValue={selectedOrder.carrier || ''}
                    className="input-box"
                    onBlur={(e) => updateOrder.mutate({ id: selectedOrder.id, updates: { carrier: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Tracking URL</label>
                <input
                  defaultValue={selectedOrder.tracking_url || ''}
                  className="input-box"
                  onBlur={(e) => updateOrder.mutate({ id: selectedOrder.id, updates: { tracking_url: e.target.value } })}
                />
              </div>

              {selectedOrder.cj_error && (
                <div className="bg-red-50 border border-red-200 p-4">
                  <p className="font-sans text-xs text-red-600 font-semibold mb-1">CJ Error:</p>
                  <p className="font-sans text-xs text-red-600">{selectedOrder.cj_error}</p>
                  <button
                    onClick={() => retryFulfillment.mutate(selectedOrder.id)}
                    className="mt-3 btn-primary text-xs py-2 px-4 inline-flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Retry CJ Fulfillment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
