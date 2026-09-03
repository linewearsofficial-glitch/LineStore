import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { formatPrice, getStatusBadgeClass } from '@/lib/utils';

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts(true);
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">PRODUCTS</h1>
          <p className="font-sans text-sm text-line-gray">{products.length} products in catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full font-sans text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-line-border">
              {['Product', 'SKU', 'Price', 'Status', 'CJ ID', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-widest text-line-gray pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-line-gray">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <p className="font-sans text-line-gray mb-4">No products yet.</p>
                  <Link to="/admin/products/new" className="btn-primary inline-block">Add Your First Product</Link>
                </td>
              </tr>
            ) : products.map((product) => (
              <tr key={product.id} className="border-b border-line-border last:border-0 hover:bg-line-light">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className="w-10 h-12 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-12 bg-line-light flex-shrink-0" />
                    )}
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-line-gray font-mono text-xs">{product.sku || '—'}</td>
                <td className="py-3 pr-4">
                  <span className="font-medium">{formatPrice(product.price)}</span>
                  {product.compare_at_price && (
                    <span className="text-line-gray line-through ml-2 text-xs">{formatPrice(product.compare_at_price)}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={getStatusBadgeClass(product.status)}>{product.status}</span>
                </td>
                <td className="py-3 pr-4 text-line-gray font-mono text-xs">{product.cj_product_id || '—'}</td>
                <td className="py-3 pr-4">
                  <div className="flex gap-2">
                    <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-line-gray hover:text-line-black" title="View">
                      <Eye size={15} />
                    </a>
                    <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 text-line-gray hover:text-line-black" title="Edit">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-line-gray hover:text-red-600" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
