import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await authService.login({ email, password })
          const { token, user } = res.data
          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          await authService.register({ name, email, password })
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      logout: async () => {
        await authService.logout()
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        try {
          const res = await authService.getMe()
          set({ user: res.data, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)