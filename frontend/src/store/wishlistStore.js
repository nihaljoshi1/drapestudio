import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './authStore.js'
import { wishlistService } from '../services/wishlistService.js'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product) => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) {
          console.warn('Must be logged in to use wishlist')
          return { success: false, message: 'Login required' }
        }

        const exists = get().items.find((i) => i.id === product.id)
        if (exists) return { success: true }

        set({ items: [...get().items, product] }) // optimistic
        try {
          await wishlistService.addToWishlist(product.id)
          return { success: true }
        } catch (err) {
          set({ items: get().items.filter((i) => i.id !== product.id) }) // rollback
          console.error('Failed to sync wishlist add:', err)
          return { success: false, message: err.message }
        }
      },

      removeItem: async (product_id) => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return { success: false, message: 'Login required' }

        const prevItems = get().items
        set({ items: get().items.filter((i) => i.id !== product_id) }) // optimistic
        try {
          await wishlistService.removeFromWishlist(product_id)
          return { success: true }
        } catch (err) {
          set({ items: prevItems }) // rollback
          console.error('Failed to sync wishlist remove:', err)
          return { success: false, message: err.message }
        }
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

      // New — hydrate local state from server on login. Not called automatically anywhere yet.
      syncFromServer: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return
        try {
          const res = await wishlistService.getWishlist()
          const products = (res.data.wishlist || []).map(w => w.products)
          set({ items: products })
        } catch (err) {
          console.error('Failed to sync wishlist from server:', err)
        }
      },
    }),
    { name: 'wishlist-store' }
  )
)