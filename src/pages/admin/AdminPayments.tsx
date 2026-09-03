import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PaymentTransaction } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

async function fetchTransactions(): Promise<PaymentTransaction[]> {
  const { data } = await supabase
    .from('payment_transactions')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as PaymentTransaction[];
}

export default function AdminPayments() {
  const { data: transactions = [], isLoading } = useQuery({ queryKey: ['admin_payments'], queryFn: fetchTransactions });

  const total = transactions.filter((t) => t.status === 'success').reduce((s, t) => s + (t.amount || 0), 0);
  const failed = transactions.filter((t) => t.status === 'failed').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">PAYMENTS</h1>
        <p className="font-sans text-sm text-line-gray">{transactions.length} transactions</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Processed', value: formatPrice(total) },
          { label: 'Failed Transactions', value: failed.toString() },
          { label: 'Total Transactions', value: transactions.length.toString() },
        ].map((s) => (
          <div key={s.label} className="admin-card">
            <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-1">{s.label}</p>
            <p className="font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-line-border">
              {['Provider', 'Transaction ID', 'Reference', 'Amount', 'Status', 'Webhook', 'Date'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={7} className="py-12 text-center text-line-gray">Loading...</td></tr>
              : transactions.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-line-gray">No transactions yet</td></tr>
              : transactions.map((t) => (
                <tr key={t.id} className="border-b border-line-border last:border-0">
                  <td className="py-3 pr-4 capitalize font-medium">{t.provider}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-line-gray truncate max-w-[120px]">{t.transaction_id || '—'}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-line-gray truncate max-w-[120px]">{t.reference || '—'}</td>
                  <td className="py-3 pr-4">{t.amount ? formatPrice(t.amount) : '—'}</td>
                  <td className="py-3 pr-4"><span className={`badge-${t.status}`}>{t.status}</span></td>
                  <td className="py-3 pr-4">
                    <span className={t.webhook_received ? 'text-green-600 text-xs font-medium' : 'text-line-gray text-xs'}>
                      {t.webhook_received ? '✓ Received' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-line-gray">{t.created_at ? formatDate(t.created_at) : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
