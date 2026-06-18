import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from '../controllers/cart.controller.js'

const router = Router()

// All cart routes require auth
router.use(authenticate)

router.get('/', getCart)
router.post('/',
  [
    body('variant_id').notEmpty().withMessage('Variant ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart
)
router.patch('/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  validate,
  updateCartItem
)
router.delete('/clear', clearCart)
router.delete('/:id', removeFromCart)
router.post('/sync',
  [body('items').isArray().withMessage('Items must be an array')],
  validate,
  syncCart
)

export default router