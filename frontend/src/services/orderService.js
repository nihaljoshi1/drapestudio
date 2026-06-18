import api from './api.js'

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  validateCoupon: (data) => api.post('/orders/validate-coupon', data),
  createPaymentOrder: (amount) => api.post('/payments/create-order', { amount }),
  verifyPayment: (data) => api.post('/payments/verify', data),
}