import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { sendOtpEmail } from '../services/emailService.js'
import {
  logout, forgotPassword, resetPassword, getMe,
  requestRegisterOtp, verifyRegisterOtp,
  requestLoginOtp, verifyLoginOtp, resendOtp,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/logout', logout)

router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
)

router.post('/reset-password',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  resetPassword
)

router.post('/register/request-otp',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  requestRegisterOtp
)

router.post('/register/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit code'),
  ],
  validate,
  verifyRegisterOtp
)

router.post('/login/request-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  requestLoginOtp
)

router.post('/login/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit code'),
  ],
  validate,
  verifyLoginOtp
)

router.post('/otp/resend',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose').isIn(['login', 'register']).withMessage('Invalid purpose'),
  ],
  validate,
  resendOtp
)

router.get('/me', authenticate, getMe)

export default router