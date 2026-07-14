import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { getProductReviews, createReview, getReviewEligibility } from '../services/reviewService.js'

export const getReviews = async (req, res) => {
  try {
    const result = await getProductReviews(req.params.productId)
    return sendSuccess(res, 'Reviews fetched', result)
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 500)
  }
}

export const postReview = async (req, res) => {
  try {
    const { productId, orderItemId, rating, title, comment } = req.body
    const review = await createReview({
      userId: req.user.id,
      productId, orderItemId, rating, title, comment,
    })
    return sendSuccess(res, 'Review submitted', review, 201)
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 500)
  }
}

export const getEligibility = async (req, res) => {
  try {
    const result = await getReviewEligibility(req.user.id, req.params.productId)
    return sendSuccess(res, 'Eligibility checked', result)
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 500)
  }
}