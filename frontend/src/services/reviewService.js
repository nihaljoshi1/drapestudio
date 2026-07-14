import api from './api.js'

export const reviewService = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  getEligibility: (productId) => api.get(`/products/${productId}/review-eligibility`),
  submitReview: (data) => api.post('/reviews', data),
}