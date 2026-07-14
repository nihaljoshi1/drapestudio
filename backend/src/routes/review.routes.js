import express from 'express'
import { getReviews, postReview, getEligibility } from '../controllers/review.controller.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/products/:productId/reviews', getReviews)
router.post('/reviews', authenticate, postReview)
router.get('/products/:productId/review-eligibility', authenticate, getEligibility)

export default router