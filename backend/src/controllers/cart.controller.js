import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Get Cart ─────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variants(
          id, size, colour, stock, sku,
          products(id, name, slug, base_price, sale_price,
            product_images(url, is_primary)
          )
        )
      `)
      .eq('user_id', req.user.id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Cart fetched', { cart: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch cart', 500)
  }
}

// ─── Add to Cart ──────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body

    // Check variant exists and has stock
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, stock')
      .eq('id', variant_id)
      .single()

    if (variantError || !variant) return sendError(res, 'Variant not found', 404)
    if (variant.stock < quantity) return sendError(res, 'Insufficient stock', 400)

    // Upsert — if already in cart, update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: req.user.id,
        variant_id,
        quantity,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,variant_id' })
      .select()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Added to cart', { item: data[0] }, 201)
  } catch (err) {
    return sendError(res, 'Failed to add to cart', 500)
  }
}

// ─── Update Cart Item Quantity ─────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (quantity < 1) return sendError(res, 'Quantity must be at least 1', 400)

    // Verify ownership
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, variant_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (!existing) return sendError(res, 'Cart item not found', 404)

    // Check stock
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', existing.variant_id)
      .single()

    if (variant.stock < quantity) return sendError(res, 'Insufficient stock', 400)

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Cart updated', { item: data[0] })
  } catch (err) {
    return sendError(res, 'Failed to update cart', 500)
  }
}

// ─── Remove from Cart ─────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Item removed from cart')
  } catch (err) {
    return sendError(res, 'Failed to remove from cart', 500)
  }
}

// ─── Clear Cart ───────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Cart cleared')
  } catch (err) {
    return sendError(res, 'Failed to clear cart', 500)
  }
}

// ─── Sync Guest Cart on Login ─────────────────────────────
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body
    // items: [{ variant_id, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendSuccess(res, 'Nothing to sync')
    }

    const upsertData = items.map((item) => ({
      user_id: req.user.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('cart_items')
      .upsert(upsertData, { onConflict: 'user_id,variant_id' })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Cart synced')
  } catch (err) {
    return sendError(res, 'Failed to sync cart', 500)
  }
}