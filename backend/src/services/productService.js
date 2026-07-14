import api from './api.js'

export const productService = {
  // GET /products — supports: category_id, min_price, max_price, sort, page, limit, available
  // NOTE: backend 'category' filter by slug is broken (Supabase joined-table filter limitation).
  // We pass category_id instead and filter correctly.
  getProducts: (params = {}) => api.get('/products', { params }),

  // GET /products/:slug
  getProductBySlug: (slug) => api.get(`/products/${slug}`),

  // GET /products/search?q=
  searchProducts: (q) => api.get('/products/search', { params: { q } }),

  // GET /categories
  getCategories: () => api.get('/products/categories'),

  getBySlug: (slug) => api.get(`/products/${slug}`),
}

