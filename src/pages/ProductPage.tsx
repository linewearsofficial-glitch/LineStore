import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Ruler, ChevronDown, ChevronUp, Truck, RotateCcw, Star } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/features/ProductGallery';
import SizeGuideModal from '@/components/features/SizeGuideModal';
import ProductCard from '@/components/features/ProductCard';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: allProducts = [] } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar /><Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-line-black border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar /><Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <h1 className="font-display text-5xl">NOT FOUND</h1>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const finalPrice = product.price + (selectedVariant?.price_modifier || 0);

  const handleAddToBag = () => {
    if (colors.length > 0 && !selectedColor) { toast.error('Please select a color'); return; }
    if (sizes.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: finalPrice,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity,
      imageUrl: images[0]?.url,
      cjProductId: product.cj_product_id,
      cjVariantId: selectedVariant?.cj_variant_id,
    });
    openCart();
  };

  const accordionSections = [
    { key: 'details', label: 'Product Details', content: product.description || 'Premium quality piece crafted for the intentional woman.' },
    { key: 'material', label: 'Material & Care', content: [product.material && `Material: ${product.material}`, product.fit && `Fit: ${product.fit}`, product.care_instructions && `Care: ${product.care_instructions}`].filter(Boolean).join('\n') || 'See label for care instructions.' },
    { key: 'shipping', label: 'Shipping', content: product.shipping_info || 'Standard shipping 7-14 business days. Free on orders over $75.' },
    { key: 'returns', label: 'Returns', content: product.return_info || '30-day returns on unworn, unwashed items with original tags attached.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-4 pb-2">
          <nav className="font-sans text-xs text-line-gray flex items-center gap-2">
            <Link to="/" className="hover:text-line-black">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-line-black">Shop</Link>
            <span>/</span>
            <span className="text-line-black">{product.name}</span>
          </nav>
        </div>

        {/* Main product area */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Gallery */}
          <ProductGallery images={images} productName={product.name} />

          {/* Product info */}
          <div className="flex flex-col">
            {/* Mobile: sticky add to bag at bottom */}
            <div>
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray">{product.status === 'winner' ? 'Bestseller' : 'Lin°e Collection'}</span>
              <h1 className="font-display text-4xl md:text-5xl mt-1 mb-3 leading-tight">{product.name.toUpperCase()}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl">{formatPrice(finalPrice)}</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="font-sans text-line-gray line-through">{formatPrice(product.compare_at_price)}</span>
                )}
                {selectedVariant?.price_modifier !== 0 && selectedVariant && (
                  <span className="font-sans text-xs text-line-gray">(variant price)</span>
                )}
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < 4 ? 'text-line-nude fill-line-nude' : 'text-line-border'} />
                ))}
                <span className="font-sans text-xs text-line-gray ml-2">4.0 (reviews)</span>
              </div>

              {/* Color selector */}
              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="font-sans text-xs uppercase tracking-widest mb-2">
                    Color: <span className="font-semibold text-line-black">{selectedColor || 'Select'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          'font-sans text-xs px-3 py-1.5 border transition-all',
                          selectedColor === c
                            ? 'border-line-black bg-line-black text-white'
                            : 'border-line-border hover:border-line-black'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-sans text-xs uppercase tracking-widest">
                      Size: <span className="font-semibold text-line-black">{selectedSize || 'Select'}</span>
                    </p>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 font-sans text-xs text-line-gray hover:text-line-black underline"
                    >
                      <Ruler size={12} /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          'font-sans text-xs w-12 h-10 border transition-all',
                          selectedSize === s
                            ? 'border-line-black bg-line-black text-white'
                            : 'border-line-border hover:border-line-black'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="font-sans text-xs uppercase tracking-widest mb-2">Quantity</p>
                <div className="flex items-center border border-line-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-line-light"
                  >−</button>
                  <span className="w-12 text-center font-sans text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-line-light"
                  >+</button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mb-8">
                <button onClick={handleAddToBag} className="btn-primary flex items-center justify-center gap-3 w-full py-4">
                  <ShoppingBag size={18} />
                  Add to Bag
                </button>
                <button
                  onClick={() => {
                    handleAddToBag();
                  }}
                  className="btn-outline w-full py-4 text-center"
                >
                  Buy Now
                </button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-3 mb-8 border-y border-line-border py-4">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-line-gray flex-shrink-0" />
                  <span className="font-sans text-xs text-line-gray">Free shipping $75+</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-line-gray flex-shrink-0" />
                  <span className="font-sans text-xs text-line-gray">30-day returns</span>
                </div>
              </div>

              {/* Accordion */}
              {accordionSections.map((section) => (
                <div key={section.key} className="border-b border-line-border">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                    className="w-full flex items-center justify-between py-4"
                  >
                    <span className="font-sans text-sm uppercase tracking-widest font-medium">{section.label}</span>
                    {expandedSection === section.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === section.key && (
                    <div className="pb-4">
                      <p className="font-sans text-sm text-line-gray leading-relaxed whitespace-pre-line">{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-16 border-t border-line-border">
            <h2 className="font-display text-4xl md:text-5xl mb-8">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>

      {showSizeGuide && (
        <SizeGuideModal
          onClose={() => setShowSizeGuide(false)}
          sizeChartImage={product.size_chart_image}
          fitPhoto={product.fit_photo}
        />
      )}
      <Footer />
    </div>
  );
}
