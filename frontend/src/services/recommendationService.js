import api from './api.js'

export const recommendationService = {
  logView: (productId) => api.post('/products/view', { product_id: productId }),
  getRecommendations: (productId) => api.get(`/products/${productId}/recommendations`),
}