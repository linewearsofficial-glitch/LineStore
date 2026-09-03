import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import ImageUploader from '@/components/features/ImageUploader';
import { Product, ProductVariant, ProductImage } from '@/types';
import { slugify } from '@/lib/utils';
import { PRODUCT_STATUSES } from '@/constants';
import { toast } from 'sonner';

const emptyVariant = (): Partial<ProductVariant> => ({ color: '', size: '', price_modifier: 0, stock: 0, cj_variant_id: '', sku: '' });

export default function AdminProductEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [form, setForm] = useState<Partial<Product>>({
    name: '', slug: '', description: '', price: 0, compare_at_price: undefined,
    cost: undefined, shipping_cost: undefined, material: '', fit: '',
    care_instructions: '', shipping_info: '', return_info: '',
    sku: '', cj_product_id: '', status: 'draft', featured: false,
    size_chart_image: '', fit_photo: '',
  });

  useEffect(() => {
    if (!isNew && id) {
      supabase.from('products').select('*, images:product_images(*), variants:product_variants(*)').eq('id', id).single()
        .then(({ data }) => {
          if (data) {
            const { images: imgs, variants: vars, ...rest } = data as Product & { images: ProductImage[], variants: ProductVariant[] };
            setForm(rest);
            setImages(imgs || []);
            setVariants(vars || []);
          }
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const setField = (key: keyof Product, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: isNew ? slugify(name) : f.slug }));
  };

  const addImageUrl = async (url: string) => {
    if (!url) return;
    if (id) {
      const { data } = await supabase.from('product_images').insert({ product_id: id, url, sort_order: images.length }).select().single();
      if (data) setImages((prev) => [...prev, data as ProductImage]);
    } else {
      setImages((prev) => [...prev, { id: `temp-${Date.now()}`, product_id: '', url, alt: '', sort_order: prev.length }]);
    }
  };

  const removeImage = async (imgId: string, url: string) => {
    if (imgId.startsWith('temp-')) {
      setImages((prev) => prev.filter((i) => i.id !== imgId));
      return;
    }
    await supabase.from('product_images').delete().eq('id', imgId);
    setImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  const saveVariants = async (productId: string) => {
    await supabase.from('product_variants').delete().eq('product_id', productId);
    if (variants.length > 0) {
      const rows = variants.map((v) => ({ ...v, product_id: productId }));
      await supabase.from('product_variants').insert(rows);
    }
  };

  const saveImages = async (productId: string) => {
    const tempImages = images.filter((i) => i.id.startsWith('temp-'));
    if (tempImages.length > 0) {
      const rows = tempImages.map((img, idx) => ({ product_id: productId, url: img.url, alt: img.alt || '', sort_order: idx }));
      await supabase.from('product_images').insert(rows);
    }
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Product name is required'); return; }
    if (!form.slug) { toast.error('Slug is required'); return; }
    if (!form.price || form.price <= 0) { toast.error('Price must be greater than 0'); return; }
    setSaving(true);
    if (isNew) {
      const created = await createProduct.mutateAsync(form);
      if (created?.id) {
        await saveImages(created.id);
        await saveVariants(created.id);
        navigate(`/admin/products/${created.id}/edit`);
      }
    } else {
      await updateProduct.mutateAsync({ id: id!, ...form });
      await saveVariants(id!);
      toast.success('Product saved');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-line-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/products')} className="text-line-gray hover:text-line-black"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-display text-4xl">{isNew ? 'NEW PRODUCT' : 'EDIT PRODUCT'}</h1>
          {form.name && <p className="font-sans text-sm text-line-gray">{form.name}</p>}
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="admin-card space-y-4">
            <h2 className="font-display text-2xl border-b border-line-border pb-3">BASIC INFO</h2>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Product Name *</label>
              <input value={form.name || ''} onChange={(e) => handleNameChange(e.target.value)} className="input-box" placeholder="e.g. Oversized Linen Shirt" />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Slug (URL) *</label>
              <input value={form.slug || ''} onChange={(e) => setField('slug', e.target.value)} className="input-box" placeholder="oversized-linen-shirt" />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Description</label>
              <textarea value={form.description || ''} onChange={(e) => setField('description', e.target.value)} rows={4} className="input-box resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Price (USD) *</label>
                <input type="number" step="0.01" min="0" value={form.price || ''} onChange={(e) => setField('price', parseFloat(e.target.value) || 0)} className="input-box" />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Compare At Price</label>
                <input type="number" step="0.01" min="0" value={form.compare_at_price || ''} onChange={(e) => setField('compare_at_price', parseFloat(e.target.value) || undefined)} className="input-box" />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Cost (Supplier)</label>
                <input type="number" step="0.01" min="0" value={form.cost || ''} onChange={(e) => setField('cost', parseFloat(e.target.value) || undefined)} className="input-box" />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Shipping Cost</label>
                <input type="number" step="0.01" min="0" value={form.shipping_cost || ''} onChange={(e) => setField('shipping_cost', parseFloat(e.target.value) || undefined)} className="input-box" />
              </div>
            </div>
            {form.price && form.cost ? (
              <p className="font-sans text-xs text-green-600">
                Est. Margin: ${(form.price - (form.cost || 0) - (form.shipping_cost || 0)).toFixed(2)} ({Math.round(((form.price - (form.cost || 0) - (form.shipping_cost || 0)) / form.price) * 100)}%)
              </p>
            ) : null}
          </div>

          {/* Product details */}
          <div className="admin-card space-y-4">
            <h2 className="font-display text-2xl border-b border-line-border pb-3">PRODUCT DETAILS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Material</label>
                <input value={form.material || ''} onChange={(e) => setField('material', e.target.value)} className="input-box" placeholder="100% Linen" />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Fit</label>
                <input value={form.fit || ''} onChange={(e) => setField('fit', e.target.value)} className="input-box" placeholder="Oversized / Relaxed" />
              </div>
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Care Instructions</label>
              <input value={form.care_instructions || ''} onChange={(e) => setField('care_instructions', e.target.value)} className="input-box" />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Shipping Info</label>
              <textarea value={form.shipping_info || ''} onChange={(e) => setField('shipping_info', e.target.value)} rows={2} className="input-box resize-none" />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Return Info</label>
              <textarea value={form.return_info || ''} onChange={(e) => setField('return_info', e.target.value)} rows={2} className="input-box resize-none" />
            </div>
          </div>

          {/* Images */}
          <div className="admin-card space-y-4">
            <h2 className="font-display text-2xl border-b border-line-border pb-3">PRODUCT IMAGES</h2>
            <p className="font-sans text-xs text-line-gray">Upload multiple images. The first image is the main product photo.</p>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-[3/4]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id, img.url)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <div className="aspect-[3/4]">
                <ImageUploader
                  bucket="product-images"
                  folder={id || 'new'}
                  onUpload={addImageUrl}
                  label="Add Image"
                  className="h-full"
                />
              </div>
            </div>

            {/* Size chart & fit photo */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line-border">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Size Chart Image</label>
                <ImageUploader
                  bucket="product-images"
                  folder={`${id || 'new'}/sizing`}
                  currentUrl={form.size_chart_image}
                  onUpload={(url) => setField('size_chart_image', url)}
                  label="Upload Size Chart"
                />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">Fit Photo (Model)</label>
                <ImageUploader
                  bucket="product-images"
                  folder={`${id || 'new'}/sizing`}
                  currentUrl={form.fit_photo}
                  onUpload={(url) => setField('fit_photo', url)}
                  label="Upload Fit Photo"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between border-b border-line-border pb-3">
              <h2 className="font-display text-2xl">VARIANTS</h2>
              <button
                onClick={() => setVariants((v) => [...v, emptyVariant()])}
                className="btn-outline text-xs py-2 px-4 flex items-center gap-1"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>
            {variants.length === 0 ? (
              <p className="font-sans text-xs text-line-gray text-center py-4">No variants. Add color/size combinations with optional price adjustments.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2 font-sans text-xs uppercase tracking-widest text-line-gray">
                  <span>Color</span><span>Size</span><span>Price Adj.</span><span>Stock</span><span>CJ Variant ID</span><span>SKU</span>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 items-center">
                    <input value={v.color || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, color: e.target.value } : vv))} className="input-box text-xs py-2" placeholder="Black" />
                    <input value={v.size || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, size: e.target.value } : vv))} className="input-box text-xs py-2" placeholder="M" />
                    <input type="number" step="0.01" value={v.price_modifier || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, price_modifier: parseFloat(e.target.value) || 0 } : vv))} className="input-box text-xs py-2" placeholder="0.00" />
                    <input type="number" value={v.stock || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))} className="input-box text-xs py-2" placeholder="0" />
                    <input value={v.cj_variant_id || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, cj_variant_id: e.target.value } : vv))} className="input-box text-xs py-2 font-mono" placeholder="CJ ID" />
                    <div className="flex gap-1">
                      <input value={v.sku || ''} onChange={(e) => setVariants((vs) => vs.map((vv, ii) => ii === i ? { ...vv, sku: e.target.value } : vv))} className="input-box text-xs py-2 flex-1" placeholder="SKU" />
                      <button onClick={() => setVariants((vs) => vs.filter((_, ii) => ii !== i))} className="text-red-500 hover:text-red-700 px-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <h2 className="font-display text-2xl border-b border-line-border pb-3">STATUS</h2>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">Product Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)} className="select-line w-full">
                {PRODUCT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">SKU</label>
              <input value={form.sku || ''} onChange={(e) => setField('sku', e.target.value)} className="input-box" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured || false} onChange={(e) => setField('featured', e.target.checked)} className="w-4 h-4" />
              <span className="font-sans text-sm">Featured on homepage</span>
            </label>
          </div>

          <div className="admin-card space-y-4">
            <h2 className="font-display text-2xl border-b border-line-border pb-3">CJ DROPSHIPPING</h2>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">CJ Product ID</label>
              <input value={form.cj_product_id || ''} onChange={(e) => setField('cj_product_id', e.target.value)} className="input-box font-mono text-xs" placeholder="CJ product ID" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
