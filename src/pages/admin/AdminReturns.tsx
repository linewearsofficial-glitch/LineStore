import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Return } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

async function fetchReturns(): Promise<Return[]> {
  const { data } = await supabase.from('returns').select('*').order('created_at', { ascending: false });
  return (data || []) as Return[];
}

export default function AdminReturns() {
  const qc = useQueryClient();
  const { data: returns = [], isLoading } = useQuery({ queryKey: ['admin_returns'], queryFn: fetchReturns });

  const updateReturn = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Return> }) => {
      const { error } = await supabase.from('returns').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_returns'] }); toast.success('Return updated'); },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">RETURNS</h1>
        <p className="font-sans text-sm text-line-gray">{returns.length} return requests</p>
      </div>
      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-line-border">
              {['Customer', 'Product', 'Reason', 'Status', 'Refund', 'Date', 'Action'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={7} className="py-12 text-center text-line-gray">Loading...</td></tr>
              : returns.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-line-gray">No returns yet</td></tr>
              : returns.map((r) => (
                <tr key={r.id} className="border-b border-line-border last:border-0">
                  <td className="py-3 pr-4">{r.customer_email}</td>
                  <td className="py-3 pr-4">{r.product_name}</td>
                  <td className="py-3 pr-4 max-w-[150px] truncate text-line-gray">{r.reason}</td>
                  <td className="py-3 pr-4"><span className={`badge-${r.status}`}>{r.status}</span></td>
                  <td className="py-3 pr-4">{r.refund_amount ? `$${r.refund_amount}` : '—'}</td>
                  <td className="py-3 pr-4 text-line-gray">{r.created_at ? formatDate(r.created_at) : '—'}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={r.status}
                      onChange={(e) => updateReturn.mutate({ id: r.id, updates: { status: e.target.value as Return['status'] } })}
                      className="select-line text-xs py-1"
                    >
                      {['pending','approved','rejected','refunded','replacement_sent'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
