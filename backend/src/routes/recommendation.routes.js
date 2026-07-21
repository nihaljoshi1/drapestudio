import { Router } from 'express'
import { logView, getRecommendations } from '../controllers/recommendation.controller.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

const router = Router()

router.post('/view', optionalAuth, logView)
router.get('/:id/recommendations', optionalAuth, getRecommendations)

export default router