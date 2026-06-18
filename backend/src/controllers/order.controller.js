import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Create Order ─────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      items,           // [{ variant_id, quantity, unit_price }]
      address,         // { name, phone, line1, line2, city, state, pincode }
      payment_id,
      payment_method,
      coupon_id,
      total,
    } = req.body

    if (!items || items.length === 0) return sendError(res, 'No items in order', 400)
    if (!address) return sendError(res, 'Delivery address is required', 400)
    if (!payment_id) return sendError(res, 'Payment ID is required', 400)

    // Validate stock for all items before creating order
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock, products(name)')
        .eq('id', item.variant_id)
        .single()

      if (!variant) return sendError(res, `Variant not found`, 404)
      if (variant.stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${variant.products.name}`, 400)
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user?.id || null,
        total,
        coupon_id: coupon_id || null,
        payment_id,
        payment_method: payment_method || 'card',
        payment_status: 'paid',
        status: 'confirmed',
      })
      .select()
      .single()

    if (orderError) return sendError(res, orderError.message, 400)

    // Create order items with product snapshot
    const orderItems = await Promise.all(items.map(async (item) => {
      const { data: variant } = await supabase
        .from('product_variants')
        .select(`
          id, size, colour, sku,
          products(id, name, slug,
            product_images(url, is_primary)
          )
        `)
        .eq('id', item.variant_id)
        .single()

      const primaryImage = variant.products.product_images
        ?.find(img => img.is_primary)?.url || variant.products.product_images?.[0]?.url

      return {
        order_id: order.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        snapshot: {
          product_name: variant.products.name,
          product_slug: variant.products.slug,
          size: variant.size,
          colour: variant.colour,
          sku: variant.sku,
          image_url: primaryImage || null,
        }
      }
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) return sendError(res, itemsError.message, 400)

    // Save delivery address
    const { error: addressError } = await supabase
      .from('order_addresses')
      .insert({ order_id: order.id, ...address })

    if (addressError) return sendError(res, addressError.message, 400)

    // Log order status
    await supabase.from('order_status_logs').insert({
      order_id: order.id,
      old_status: null,
      new_status: 'confirmed',
      note: 'Order placed successfully',
      changed_by: req.user?.id || null,
    })

    // Deduct stock for each variant
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant_id)
        .single()

      await supabase
        .from('product_variants')
        .update({ stock: variant.stock - item.quantity })
        .eq('id', item.variant_id)

      await supabase.from('inventory_logs').insert({
        variant_id: item.variant_id,
        change: -item.quantity,
        reason: `Order ${order.id}`,
        changed_by: req.user?.id || null,
      })
    }

    // Clear cart if logged in
    if (req.user?.id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', req.user.id)
    }

    return sendSuccess(res, 'Order placed successfully', { order }, 201)
  } catch (err) {
    return sendError(res, 'Failed to create order', 500)
  }
}

// ─── Get User Orders ──────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, status, total, payment_status, payment_method, created_at,
        order_items(
          quantity, unit_price, snapshot
        ),
        order_addresses(name, city, state)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Orders fetched', { orders: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch orders', 500)
  }
}

// ─── Get Single Order ─────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(quantity, unit_price, snapshot),
        order_addresses(*),
        order_status_logs(new_status, note, created_at)
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error || !data) return sendError(res, 'Order not found', 404)

    return sendSuccess(res, 'Order fetched', { order: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch order', 500)
  }
}

// ─── Validate Coupon ──────────────────────────────────────
export const validateCoupon = async (req, res) => {
  try {
    const { code, cart_total } = req.body

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) return sendError(res, 'Invalid coupon code', 404)

    // Check expiry
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return sendError(res, 'Coupon has expired', 400)
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return sendError(res, 'Coupon usage limit reached', 400)
    }

    // Check minimum cart value
    if (cart_total < coupon.min_cart_value) {
      return sendError(res, `Minimum cart value of ₹${coupon.min_cart_value} required`, 400)
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (cart_total * coupon.value) / 100
    } else {
      discount = coupon.value
    }

    discount = Math.min(discount, cart_total)

    return sendSuccess(res, 'Coupon applied', {
      coupon_id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
      final_total: Math.round(cart_total - discount),
    })
  } catch (err) {
    return sendError(res, 'Failed to validate coupon', 500)
  }
}