import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  createOrder,
  getUserOrders,
  getOrderById,
  validateCoupon,
} from '../controllers/order.controller.js'

const router = Router()

router.post('/validate-coupon',
  [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('cart_total').isNumeric().withMessage('Cart total is required'),
  ],
  validate,
  validateCoupon
)

router.use(authenticate)

router.post('/',
  [
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('payment_id').notEmpty().withMessage('Payment ID is required'),
    body('total').isNumeric().withMessage('Total is required'),
  ],
  validate,
  createOrder
)

router.get('/', getUserOrders)
router.get('/:id', getOrderById)

export default router