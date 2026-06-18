import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'
import {
  getOverview,
  getRevenueChart,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetInventory,
  adminAdjustStock,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetCustomers,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../controllers/admin.controller.js'

const router = Router()

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin)

// Analytics
router.get('/analytics/overview', getOverview)
router.get('/analytics/revenue', getRevenueChart)

// Products
router.get('/products', adminGetProducts)
router.post('/products',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('base_price').isNumeric().withMessage('Base price is required'),
    body('category_id').notEmpty().withMessage('Category is required'),
  ],
  validate,
  adminCreateProduct
)
router.patch('/products/:id', adminUpdateProduct)
router.delete('/products/:id', adminDeleteProduct)

// Orders
router.get('/orders', adminGetOrders)
router.patch('/orders/:id/status',
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  adminUpdateOrderStatus
)

// Inventory
router.get('/inventory', adminGetInventory)
router.patch('/inventory/:id/adjust',
  [body('change').isInt().withMessage('Change must be an integer')],
  validate,
  adminAdjustStock
)

// Coupons
router.get('/coupons', adminGetCoupons)
router.post('/coupons',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('type').isIn(['percentage', 'flat']).withMessage('Type must be percentage or flat'),
    body('value').isNumeric().withMessage('Value is required'),
  ],
  validate,
  adminCreateCoupon
)
router.patch('/coupons/:id', adminUpdateCoupon)
router.delete('/coupons/:id', adminDeleteCoupon)

// Customers
router.get('/customers', adminGetCustomers)

// Categories
router.post('/categories',
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  adminCreateCategory
)
router.patch('/categories/:id', adminUpdateCategory)
router.delete('/categories/:id', adminDeleteCategory)

export default router