import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { toast } from 'sonner';

async function fetchProducts(includeAll = false): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`*, images:product_images(*), variants:product_variants(*)`)
    .order('created_at', { ascending: false });
  if (!includeAll) {
    query = query.in('status', ['active', 'winner']);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Product[];
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, images:product_images(*), variants:product_variants(*)`)
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as Product;
}

export function useProducts(includeAll = false) {
  return useQuery({
    queryKey: ['products', includeAll],
    queryFn: () => fetchProducts(includeAll),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { error } = await supabase.from('products').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
