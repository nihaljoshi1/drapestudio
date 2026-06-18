import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { createOrder, verifyPayment } from '../controllers/payment.controller.js'

const router = Router()

router.post('/create-order',
  [body('amount').isNumeric().withMessage('Amount is required')],
  validate,
  createOrder
)

router.post('/verify',
  [
    body('card_number').notEmpty().withMessage('Card number is required'),
    body('expiry').notEmpty().withMessage('Expiry is required'),
    body('cvv').notEmpty().withMessage('CVV is required'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validate,
  verifyPayment
)

export default router