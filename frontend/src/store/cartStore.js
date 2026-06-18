import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api.js'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],        // { variant_id, quantity, product, variant, imageUrl }
      isOpen: false,
      isLoading: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      // imageUrl: pass the resolved primary image URL at call-site so the cart
      // doesn't need to re-fetch or dig into nested relations later.
      // Caller pattern: addItem(product, variant, quantity, primaryImageUrl)
      addItem: (product, variant, quantity = 1, imageUrl = null) => {
        const items = get().items
        const existing = items.find((i) => i.variant_id === variant.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.variant_id === variant.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              { variant_id: variant.id, quantity, product, variant, imageUrl },
            ],
          })
        }
      },

      removeItem: (variant_id) => {
        set({ items: get().items.filter((i) => i.variant_id !== variant_id) })
      },

      updateQuantity: (variant_id, quantity) => {
        if (quantity < 1) return get().removeItem(variant_id)
        set({
          items: get().items.map((i) =>
            i.variant_id === variant_id ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.product?.sale_price || item.product?.base_price || 0
          return sum + price * item.quantity
        }, 0)
      },

      getCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
)