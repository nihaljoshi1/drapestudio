import { supabase } from '../config/supabase.js'

export async function getProductReviews(productId) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, rating, title, comment, created_at, user_id')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const userIds = [...new Set(reviews.map(r => r.user_id))]
  let profilesById = {}

  if (userIds.length) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds)

    if (profileError) throw profileError
    profilesById = Object.fromEntries(profiles.map(p => [p.id, p.name]))
  }

  const enriched = reviews.map(r => ({ ...r, reviewer_name: profilesById[r.user_id] || 'Anonymous' }))

  const count = enriched.length
  const average = count
    ? enriched.reduce((sum, r) => sum + r.rating, 0) / count
    : 0

  return { reviews: enriched, count, average: Math.round(average * 10) / 10 }
}

export async function createReview({ userId, productId, orderItemId, rating, title, comment }) {
  const { data: verified, error: verifyError } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_id, status), product_variants!inner(product_id)')
    .eq('id', orderItemId)
    .eq('orders.user_id', userId)
    .eq('orders.status', 'delivered')
    .eq('product_variants.product_id', productId)
    .maybeSingle()

  if (verifyError) throw verifyError
  if (!verified) {
    const err = new Error('You can only review products from a delivered order.')
    err.statusCode = 403
    throw err
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, product_id: productId, order_item_id: orderItemId, rating, title, comment })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      const err = new Error('You have already reviewed this purchase.')
      err.statusCode = 409
      throw err
    }
    throw error
  }
  return data
}

export async function getReviewEligibility(userId, productId) {
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_id, status), product_variants!inner(product_id)')
    .eq('orders.user_id', userId)
    .eq('orders.status', 'delivered')
    .eq('product_variants.product_id', productId)

  if (error) throw error
  if (!orderItems.length) return { eligible: false, orderItemId: null, alreadyReviewed: false }

  const orderItemIds = orderItems.map(oi => oi.id)
  const { data: existing, error: reviewError } = await supabase
    .from('reviews')
    .select('order_item_id')
    .in('order_item_id', orderItemIds)

  if (reviewError) throw reviewError
  const reviewed = new Set(existing.map(r => r.order_item_id))
  const available = orderItems.find(oi => !reviewed.has(oi.id))

  return available
    ? { eligible: true, orderItemId: available.id, alreadyReviewed: false }
    : { eligible: false, orderItemId: null, alreadyReviewed: true }
}