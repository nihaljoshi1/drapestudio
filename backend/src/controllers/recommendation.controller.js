import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import {
  getCategoryFallback,
  getUserAffinityCategories,
  getProductsByCategories,
} from '../services/productService.js'

export const logView = async (req, res) => {
  try {
    if (!req.user) return sendSuccess(res, 'Skipped (guest)', null)
    const { product_id } = req.body
    if (!product_id) return sendError(res, 'product_id required', 400)

    const { error } = await supabase.from('product_views').insert({ user_id: req.user.id, product_id })
    if (error) {
      console.error('product_views insert failed:', error.message)
      return sendError(res, error.message, 400)
    }

    return sendSuccess(res, 'View logged', null)
  } catch (err) {
    return sendError(res, 'Failed to log view', 500)
  }
}

export const getRecommendations = async (req, res) => {
  try {
    const { id } = req.params

    const { data: product, error } = await supabase
      .from('products')
      .select('id, category_id, base_price')
      .eq('id', id)
      .single()

    if (error || !product) return sendError(res, 'Product not found', 404)

    let recommendations = []
    let source = 'category' // for debugging/logging which tier fired

    if (req.user) {
      const categories = await getUserAffinityCategories(req.user.id)
      if (categories.length) {
        recommendations = await getProductsByCategories(categories, product.id)
        if (recommendations.length) source = 'personalized'
      }
    }

    if (!recommendations.length) {
      recommendations = await getCategoryFallback({
        categoryId: product.category_id,
        excludeProductId: product.id,
        basePrice: product.base_price,
      })
      source = recommendations.length ? 'category' : source
    }

    return sendSuccess(res, 'Recommendations fetched', { recommendations, source })
  } catch (err) {
    return sendError(res, 'Failed to fetch recommendations', 500)
  }
}