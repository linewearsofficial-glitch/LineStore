import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

async function fetchPendingFulfillment(): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('payment_status', 'paid')
    .in('fulfillment_status', ['awaiting_fulfillment', 'fulfillment_error'])
    .order('created_at', { ascending: false });
  return (data || []) as Order[];
}

async function fetchAllFulfillment(): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .not('fulfillment_status', 'eq', 'awaiting_fulfillment')
    .order('updated_at', { ascending: false })
    .limit(50);
  return (data || []) as Order[];
}

export default function AdminFulfillment() {
  const qc = useQueryClient();
  const { data: pending = [], isLoading: pendingLoading } = useQuery({ queryKey: ['pending_fulfillment'], queryFn: fetchPendingFulfillment });
  const { data: fulfilled = [] } = useQuery({ queryKey: ['all_fulfillment'], queryFn: fetchAllFulfillment });

  const submitToC = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('cj-fulfillment', { body: { orderId } });
      if (error) {
        let msg = error.message || 'Unknown error';
        try {
          const text = await (error as { context?: { text?: () => Promise<string> } }).context?.text?.();
          if (text) msg = text;
        } catch {}
        throw new Error(msg);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending_fulfillment'] });
      qc.invalidateQueries({ queryKey: ['all_fulfillment'] });
      toast.success('Order submitted to CJ Dropshipping');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">FULFILLMENT</h1>
        <p className="font-sans text-sm text-line-gray">Manage CJ Dropshipping order submissions</p>
      </div>

      {/* Pending */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">NEEDS FULFILLMENT ({pending.length})</h2>
        </div>
        {pendingLoading ? <p className="text-center py-8 text-line-gray font-sans text-sm">Loading...</p>
          : pending.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-sans text-line-gray">All caught up! No orders awaiting fulfillment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((order) => (
                <div key={order.id} className="border border-line-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl">{order.order_number}</p>
                      <p className="font-sans text-xs text-line-gray">{order.email} · {formatDate(order.created_at || '')}</p>
                      <p className="font-sans text-sm mt-1">{order.first_name} {order.last_name} — {order.city}, {order.state}</p>
                      <div className="mt-2 space-y-1">
                        {order.order_items?.map((item) => (
                          <p key={item.id} className="font-sans text-xs text-line-gray">
                            {item.product_name} / {item.color} / {item.size} × {item.quantity} — CJ: {item.cj_product_id || '⚠ No CJ ID'}
                          </p>
                        ))}
                      </div>
                      {order.cj_error && (
                        <div className="mt-2 flex items-center gap-1 text-red-600">
                          <AlertTriangle size={12} />
                          <p className="font-sans text-xs">{order.cj_error}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans font-bold">{formatPrice(order.total)}</p>
                      <span className={`badge-${order.fulfillment_status} block mt-1`}>{order.fulfillment_status.replace(/_/g, ' ')}</span>
                      <button
                        onClick={() => submitToC.mutate(order.id)}
                        disabled={submitToC.isPending}
                        className="mt-3 btn-primary text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-50"
                      >
                        {submitToC.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                        Submit to CJ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Recent fulfillment */}
      <div className="admin-card">
        <h2 className="font-display text-2xl mb-6">RECENT FULFILLMENT HISTORY</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-line-border">
                {['Order', 'Customer', 'CJ Order ID', 'Status', 'Tracking'].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fulfilled.map((o) => (
                <tr key={o.id} className="border-b border-line-border last:border-0">
                  <td className="py-3 pr-4 font-medium">{o.order_number}</td>
                  <td className="py-3 pr-4 text-line-gray">{o.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{o.cj_order_id || '—'}</td>
                  <td className="py-3 pr-4"><span className={`badge-${o.fulfillment_status}`}>{o.fulfillment_status.replace(/_/g, ' ')}</span></td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {o.tracking_number ? (
                      o.tracking_url ? <a href={o.tracking_url} target="_blank" rel="noreferrer" className="underline">{o.tracking_number}</a> : o.tracking_number
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
