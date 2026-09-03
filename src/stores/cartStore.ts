import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { CartItem } from '@/types';
import { CART_STORAGE_KEY, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, size?: string, color?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === newItem.productId &&
              i.variantId === newItem.variantId &&
              i.size === newItem.size &&
              i.color === newItem.color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId &&
                i.variantId === newItem.variantId &&
                i.size === newItem.size &&
                i.color === newItem.color
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, variantId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.variantId === variantId &&
                i.size === size &&
                i.color === color
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId, size, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.variantId === variantId &&
            i.size === size &&
            i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping: () => {
        const sub = get().getSubtotal();
        return sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },
      getTotal: () => get().getSubtotal() + get().getShipping(),
    }),
    { name: CART_STORAGE_KEY }
  )
);
