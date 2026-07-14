import api from './api.js'

export const authService = {
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  requestRegisterOtp: (data) => api.post('/auth/register/request-otp', data),
  verifyRegisterOtp: (data) => api.post('/auth/register/verify-otp', data),
  requestLoginOtp: (data) => api.post('/auth/login/request-otp', data),
  verifyLoginOtp: (data) => api.post('/auth/login/verify-otp', data),
  resendOtp: (data) => api.post('/auth/otp/resend', data),
}