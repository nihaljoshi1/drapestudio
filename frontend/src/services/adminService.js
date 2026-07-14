import api from './api.js'

export const adminService = {
  // Analytics
  getOverview: () => api.get('/admin/analytics/overview'),
  getRevenueChart: (days = 30) => api.get(`/admin/analytics/revenue?days=${days}`),

  // Products
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Variants
  getVariants: (productId) => api.get(`/admin/products/${productId}/variants`),
  createVariant: (productId, data) => api.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (id, data) => api.patch(`/admin/variants/${id}`, data),
  deleteVariant: (id) => api.delete(`/admin/variants/${id}`),

  // Images
  uploadImage: (productId, formData) => api.post(`/admin/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  setPrimaryImage: (imageId, productId) => api.patch(`/admin/images/${imageId}/primary`, { productId }),
  deleteImage: (imageId) => api.delete(`/admin/images/${imageId}`),

  // Orders
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),

  // Inventory
  getInventory: (params = {}) => api.get('/admin/inventory', { params }),
  adjustStock: (id, data) => api.patch(`/admin/inventory/${id}/adjust`, data),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.patch(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Customers
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
}