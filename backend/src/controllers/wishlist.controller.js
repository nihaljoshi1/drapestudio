import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Get Wishlist ─────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        products(
          id, name, slug, base_price, sale_price,
          product_images(url, is_primary),
          product_variants(id, size, colour, stock)
        )
      `)
      .eq('user_id', req.user.id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Wishlist fetched', { wishlist: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch wishlist', 500)
  }
}

// ─── Add to Wishlist ──────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body

    // Check product exists
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (!product) return sendError(res, 'Product not found', 404)

    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: req.user.id, product_id })
      .select()

    if (error) {
      // Unique constraint — already in wishlist
      if (error.code === '23505') return sendError(res, 'Already in wishlist', 409)
      return sendError(res, error.message, 400)
    }

    return sendSuccess(res, 'Added to wishlist', { item: data[0] }, 201)
  } catch (err) {
    return sendError(res, 'Failed to add to wishlist', 500)
  }
}

// ─── Remove from Wishlist ─────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Removed from wishlist')
  } catch (err) {
    return sendError(res, 'Failed to remove from wishlist', 500)
  }
}

// ─── Check if Product is in Wishlist ─────────────────────
export const checkWishlist = async (req, res) => {
  try {
    const { product_id } = req.params

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .single()

    return sendSuccess(res, 'Wishlist status', { inWishlist: !!data })
  } catch (err) {
    return sendSuccess(res, 'Wishlist status', { inWishlist: false })
  }
}