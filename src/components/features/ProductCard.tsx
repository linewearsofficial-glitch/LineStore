import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const images = product.images || [];
  const firstImage = images[0]?.url;
  const secondImage = images[1]?.url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: firstImage,
      cjProductId: product.cj_product_id,
    });
    toast.success(`${product.name} added to bag`);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      {/* Image area */}
      <div className="relative overflow-hidden bg-line-light aspect-[3/4]">
        {firstImage ? (
          <>
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            {secondImage && (
              <img
                src={secondImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-line-light flex items-center justify-center">
            <span className="font-display text-4xl text-line-border">LIN°E</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="bg-line-black text-white font-sans text-[10px] tracking-widest uppercase px-2 py-1">
              Sale
            </span>
          )}
          {product.status === 'winner' && (
            <span className="bg-line-nude text-white font-sans text-[10px] tracking-widest uppercase px-2 py-1">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 left-0 right-0 bg-line-black text-white font-sans text-xs tracking-widest uppercase py-3 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>

      {/* Product info */}
      <div className="mt-3 px-1">
        <h3 className="font-sans font-medium text-sm text-line-black leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-sans text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="font-sans text-xs text-line-gray line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
