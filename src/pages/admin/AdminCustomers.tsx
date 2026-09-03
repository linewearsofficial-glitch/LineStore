import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Customer } from '@/types';

async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  return (data || []) as Customer[];
}

export default function AdminCustomers() {
  const { data: customers = [], isLoading } = useQuery({ queryKey: ['admin_customers'], queryFn: fetchCustomers });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl">CUSTOMERS</h1>
        <p className="font-sans text-sm text-line-gray">{customers.length} registered customers</p>
      </div>
      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-line-border">
              {['Name', 'Email', 'Phone', 'Joined'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="py-12 text-center text-line-gray">Loading...</td></tr>
              : customers.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-line-gray">No customers yet</td></tr>
              : customers.map((c) => (
                <tr key={c.id} className="border-b border-line-border last:border-0 hover:bg-line-light">
                  <td className="py-3 pr-4">{c.first_name} {c.last_name}</td>
                  <td className="py-3 pr-4 text-line-gray">{c.email}</td>
                  <td className="py-3 pr-4 text-line-gray">{c.phone || '—'}</td>
                  <td className="py-3 pr-4 text-line-gray">{c.created_at ? formatDate(c.created_at) : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
