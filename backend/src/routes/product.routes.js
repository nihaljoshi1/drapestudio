import { Router } from 'express'
import {
  getProducts,
  getProductBySlug,
  searchProducts,
  getCategories,
  getCategoryBySlug,
} from '../controllers/product.controller.js'

const router = Router()

// These must come BEFORE /:slug
router.get('/search', searchProducts)
router.get('/categories', getCategories)
router.get('/categories/:slug', getCategoryBySlug)

// This must come LAST
router.get('/', getProducts)
router.get('/:slug', getProductBySlug)

export default router