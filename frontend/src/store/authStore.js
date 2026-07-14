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

      requestRegisterOtp: async (payload) => {
        set({ isLoading: true })
        try {
          await authService.requestRegisterOtp(payload)
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      verifyRegisterOtp: async (email, code) => {
        set({ isLoading: true })
        try {
          const res = await authService.verifyRegisterOtp({ email, code })
          set({ isLoading: false })
          return { success: true, user: res.data?.user }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      requestLoginOtp: async (email, password) => {
        set({ isLoading: true })
        try {
          await authService.requestLoginOtp({ email, password })
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      verifyLoginOtp: async (email, code) => {
        set({ isLoading: true })
        try {
          const res = await authService.verifyLoginOtp({ email, code })
          const { token, user } = res.data
          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message }
        }
      },

      resendOtp: async (email, purpose) => {
        try {
          await authService.resendOtp({ email, purpose })
          return { success: true }
        } catch (err) {
          return { success: false, message: err.message }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // server-side logout failure shouldn't block client cleanup
        }
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