import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data || []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value || ''; });
  return map;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_settings'] });
      toast.success('Setting saved');
    },
    onError: () => toast.error('Failed to save setting'),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_settings'] });
      toast.success('Settings saved successfully');
    },
    onError: () => toast.error('Failed to save settings'),
  });
}
