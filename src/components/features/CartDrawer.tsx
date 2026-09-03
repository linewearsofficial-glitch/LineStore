import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/constants';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getSubtotal, getShipping, getTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-border">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <span className="font-display text-xl tracking-widest">YOUR BAG ({getItemCount()})</span>
          </div>
          <button onClick={closeCart} className="p-1 hover:opacity-60"><X size={20} /></button>
        </div>

        {/* Free shipping bar */}
        {remaining > 0 && (
          <div className="px-6 py-3 bg-line-light">
            <p className="text-xs font-sans tracking-wide text-center text-line-gray">
              Add <span className="font-semibold text-line-black">{formatPrice(remaining)}</span> more for free shipping
            </p>
            <div className="mt-2 h-0.5 bg-line-border">
              <div
                className="h-full bg-line-black transition-all duration-500"
                style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {remaining <= 0 && subtotal > 0 && (
          <div className="px-6 py-3 bg-line-black text-white text-center">
            <p className="text-xs font-sans tracking-widest uppercase">🎉 You've unlocked free shipping!</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <ShoppingBag size={48} className="text-line-border" />
              <p className="font-sans text-line-gray tracking-wide">Your bag is empty</p>
              <button onClick={() => { closeCart(); navigate('/shop'); }} className="btn-primary text-sm px-6 py-3">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.productId}-${item.variantId}-${item.size}-${item.color}-${idx}`} className="flex gap-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-28 object-cover flex-shrink-0 bg-line-light" />
                ) : (
                  <div className="w-24 h-28 bg-line-light flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-sm leading-tight truncate">{item.name}</p>
                  <p className="font-sans text-xs text-line-gray mt-1">
                    {[item.color, item.size].filter(Boolean).join(' / ')}
                  </p>
                  <p className="font-sans font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.size, item.color)}
                      className="w-6 h-6 border border-line-border flex items-center justify-center hover:bg-line-black hover:text-white transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-sans text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.size, item.color)}
                      className="w-6 h-6 border border-line-border flex items-center justify-center hover:bg-line-black hover:text-white transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId, item.size, item.color)}
                      className="ml-auto text-line-gray hover:text-line-black text-xs uppercase tracking-widest font-sans"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-line-border px-6 py-5 space-y-3">
            <div className="flex justify-between font-sans text-sm">
              <span className="text-line-gray">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-line-gray">Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-sans font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-center mt-2">
              Checkout
            </button>
            <button onClick={() => { closeCart(); navigate('/cart'); }} className="btn-outline w-full text-center text-sm">
              View Full Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
