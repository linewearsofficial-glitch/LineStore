import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/features/ProductCard';
import { useCartStore } from '@/stores/cartStore';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getTotal } = useCartStore();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const crossSell = products.filter((p) => !items.some((i) => i.productId === p.id)).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="text-line-gray hover:text-line-black">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display text-4xl md:text-6xl">YOUR BAG</h1>
            <span className="font-sans text-line-gray text-sm">({items.length} items)</span>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center">
              <ShoppingBag size={64} className="mx-auto text-line-border mb-6" />
              <h2 className="font-display text-4xl mb-4">YOUR BAG IS EMPTY</h2>
              <p className="font-sans text-line-gray mb-8">Add some pieces and come back.</p>
              <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Free shipping progress */}
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="bg-line-light p-4">
                    <p className="font-sans text-sm text-center mb-2">
                      Add <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> more for free shipping
                    </p>
                    <div className="h-0.5 bg-line-border">
                      <div
                        className="h-full bg-line-black transition-all"
                        style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {items.map((item, idx) => (
                  <div key={`${item.productId}-${item.size}-${item.color}-${idx}`} className="flex gap-5 py-5 border-b border-line-border">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-28 h-36 object-cover flex-shrink-0 bg-line-light" />
                    ) : (
                      <div className="w-28 h-36 bg-line-light flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-sans font-medium">{item.name}</p>
                          <p className="font-sans text-xs text-line-gray mt-0.5">
                            {[item.color, item.size].filter(Boolean).join(' / ')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId, item.size, item.color)}
                          className="text-line-gray hover:text-line-black p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="font-sans font-semibold mt-2">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.size, item.color)}
                          className="w-8 h-8 border border-line-border flex items-center justify-center hover:bg-line-black hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-sans text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.size, item.color)}
                          className="w-8 h-8 border border-line-border flex items-center justify-center hover:bg-line-black hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <span className="font-sans text-sm text-line-gray ml-4">
                          Subtotal: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div>
                <div className="border border-line-border p-6 sticky top-24">
                  <h2 className="font-display text-2xl mb-6">ORDER SUMMARY</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between font-sans text-sm">
                      <span className="text-line-gray">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-sans text-sm">
                      <span className="text-line-gray">Shipping</span>
                      <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
                    </div>
                    <div className="border-t border-line-border pt-3 flex justify-between font-sans font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/checkout')} className="btn-primary w-full text-center">
                    Proceed to Checkout
                  </button>
                  <Link to="/shop" className="btn-outline w-full text-center mt-3 block text-sm">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Cross-sell */}
          {crossSell.length > 0 && items.length > 0 && (
            <div className="mt-16 border-t border-line-border pt-12">
              <h2 className="font-display text-3xl md:text-4xl mb-8">COMPLETE YOUR LOOK</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 max-w-xl">
                {crossSell.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
