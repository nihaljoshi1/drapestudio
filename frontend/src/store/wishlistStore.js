import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id)
        if (!exists) set({ items: [...get().items, product] })
      },

      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.id !== product_id) })
      },

      isInWishlist: (product_id) => {
        return get().items.some((i) => i.id === product_id)
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      getCount: () => get().items.length,
    }),
    { name: 'wishlist-store' }
  )
)