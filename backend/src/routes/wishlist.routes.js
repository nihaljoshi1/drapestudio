import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controllers/wishlist.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', getWishlist)
router.post('/',
  [body('product_id').notEmpty().withMessage('Product ID is required')],
  validate,
  addToWishlist
)
router.get('/check/:product_id', checkWishlist)
router.delete('/:product_id', removeFromWishlist)

export default router