import api from './api.js'

export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  searchProducts: (q) => api.get('/products/search', { params: { q } }),
  getCategories: () => api.get('/products/categories'),
}