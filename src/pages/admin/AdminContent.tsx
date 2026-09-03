import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ContentEntry } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

async function fetchContent(): Promise<ContentEntry[]> {
  const { data } = await supabase.from('content_tracker').select('*').order('posted_at', { ascending: false });
  return (data || []) as ContentEntry[];
}

const emptyEntry = (): Partial<ContentEntry> => ({
  video_url: '', hook: '', posted_at: new Date().toISOString().split('T')[0],
  views: 0, likes: 0, comments: 0, shares: 0, saves: 0, profile_visits: 0,
  link_clicks: 0, orders: 0, revenue: 0, notes: '',
});

export default function AdminContent() {
  const qc = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({ queryKey: ['admin_content'], queryFn: fetchContent });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ContentEntry>>(emptyEntry());

  const createEntry = useMutation({
    mutationFn: async (data: Partial<ContentEntry>) => {
      const { error } = await supabase.from('content_tracker').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_content'] }); setShowForm(false); setForm(emptyEntry()); toast.success('Entry added'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => { await supabase.from('content_tracker').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_content'] }),
  });

  const totalViews = entries.reduce((s, e) => s + e.views, 0);
  const totalOrders = entries.reduce((s, e) => s + e.orders, 0);
  const totalRevenue = entries.reduce((s, e) => s + e.revenue, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">TIKTOK CONTENT</h1>
          <p className="font-sans text-sm text-line-gray">{entries.length} videos tracked</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString() },
          { label: 'Orders from TikTok', value: totalOrders.toString() },
          { label: 'TikTok Revenue', value: `$${totalRevenue.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="admin-card">
            <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-1">{s.label}</p>
            <p className="font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="admin-card mb-6 space-y-4">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">ADD VIDEO</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Video URL</label>
              <input value={form.video_url || ''} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="input-box" placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Hook / Title</label>
              <input value={form.hook || ''} onChange={(e) => setForm({ ...form, hook: e.target.value })} className="input-box" />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Date Posted</label>
              <input type="date" value={form.posted_at || ''} onChange={(e) => setForm({ ...form, posted_at: e.target.value })} className="input-box" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(['views', 'likes', 'comments', 'shares', 'saves', 'profile_visits', 'link_clicks', 'orders'] as const).map((field) => (
              <div key={field}>
                <label className="font-sans text-xs uppercase tracking-widest block mb-1 capitalize">{field.replace('_', ' ')}</label>
                <input type="number" min="0" value={(form as Record<string, unknown>)[field] as number || ''} onChange={(e) => setForm({ ...form, [field]: parseInt(e.target.value) || 0 })} className="input-box" />
              </div>
            ))}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-1">Revenue ($)</label>
              <input type="number" step="0.01" min="0" value={form.revenue || ''} onChange={(e) => setForm({ ...form, revenue: parseFloat(e.target.value) || 0 })} className="input-box" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createEntry.mutate(form)} disabled={createEntry.isPending} className="btn-primary disabled:opacity-50">Save Video</button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-line-border">
              {['Hook', 'Date', 'Views', 'Likes', 'Shares', 'Link Clicks', 'Orders', 'Revenue', ''].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={9} className="py-12 text-center text-line-gray">Loading...</td></tr>
              : entries.length === 0 ? <tr><td colSpan={9} className="py-12 text-center text-line-gray">No videos tracked yet</td></tr>
              : entries.map((e) => (
                <tr key={e.id} className="border-b border-line-border last:border-0 hover:bg-line-light">
                  <td className="py-3 pr-3">
                    {e.video_url ? <a href={e.video_url} target="_blank" rel="noreferrer" className="underline text-line-black hover:text-line-gray">{e.hook || 'View'}</a> : e.hook || '—'}
                  </td>
                  <td className="py-3 pr-3 text-line-gray">{e.posted_at ? formatDate(e.posted_at) : '—'}</td>
                  <td className="py-3 pr-3">{e.views.toLocaleString()}</td>
                  <td className="py-3 pr-3">{e.likes.toLocaleString()}</td>
                  <td className="py-3 pr-3">{e.shares.toLocaleString()}</td>
                  <td className="py-3 pr-3">{e.link_clicks.toLocaleString()}</td>
                  <td className="py-3 pr-3 font-medium">{e.orders}</td>
                  <td className="py-3 pr-3 font-medium">${e.revenue.toFixed(2)}</td>
                  <td className="py-3">
                    <button onClick={() => deleteEntry.mutate(e.id)} className="text-line-gray hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
