import { supabase } from '../config/supabase.js'

export async function getCategoryFallback({ categoryId, excludeProductId, basePrice }) {
  const priceMin = basePrice * 0.6
  const priceMax = basePrice * 1.6

  let { data: related } = await supabase
    .from('products')
    .select(`id, name, slug, base_price, sale_price, product_images(url, is_primary)`)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .eq('status', 'active')
    .neq('id', excludeProductId)
    .gte('base_price', priceMin)
    .lte('base_price', priceMax)
    .order('created_at', { ascending: false })
    .limit(8)

  if (!related || related.length < 4) {
    const { data: fallback } = await supabase
      .from('products')
      .select(`id, name, slug, base_price, sale_price, product_images(url, is_primary)`)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .eq('status', 'active')
      .neq('id', excludeProductId)
      .order('created_at', { ascending: false })
      .limit(8)
    related = fallback || []
  }

  return await filterInStock(related)
}

export async function filterInStock(products) {
  if (!products.length) return []
  const { data: inStockVariants } = await supabase
    .from('product_variants')
    .select('product_id')
    .gt('stock', 0)
  const inStockIds = new Set((inStockVariants || []).map(v => v.product_id))
  return products.filter(p => inStockIds.has(p.id)).slice(0, 4)
}

// Weighted category affinity: purchases > wishlist ≈ reviews > views
export async function getUserAffinityCategories(userId) {
  const weights = {}
  const bump = (categoryId, weight) => {
    if (!categoryId) return
    weights[categoryId] = (weights[categoryId] || 0) + weight
  }

  // ── Purchases: orders → order_items → product_variants → products ──
  const { data: userOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)

  const orderIds = (userOrders || []).map(o => o.id)

  let orderItems = []
  if (orderIds.length) {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_variants(product_id, products(category_id))')
      .in('order_id', orderIds)

    if (error) {
      // Nested embed failed — likely missing FK constraint, not a code bug.
      // Log and continue with zero purchase-weight rather than crashing the whole endpoint.
      console.error('order_items nested embed failed:', error.message)
    } else {
      orderItems = data || []
    }
  }

  // ── Wishlist ──
  const { data: wishlistItems } = await supabase
    .from('wishlists')
    .select('products(category_id)')
    .eq('user_id', userId)

  // ── Reviews ──
  const { data: userReviews } = await supabase
    .from('reviews')
    .select('products(category_id)')
    .eq('user_id', userId)

  // ── Recent views (last 20) ──
  const { data: views } = await supabase
    .from('product_views')
    .select('products(category_id)')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(20)

  orderItems.forEach(o => bump(o.product_variants?.products?.category_id, 3))
  wishlistItems?.forEach(w => bump(w.products?.category_id, 2))
  userReviews?.forEach(r => bump(r.products?.category_id, 2))
  views?.forEach(v => bump(v.products?.category_id, 1))

  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([categoryId]) => categoryId)
}

export async function getProductsByCategories(categoryIds, excludeProductId) {
  if (!categoryIds.length) return []
  const { data } = await supabase
    .from('products')
    .select(`id, name, slug, base_price, sale_price, product_images(url, is_primary)`)
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .eq('status', 'active')
    .neq('id', excludeProductId)
    .order('created_at', { ascending: false })
    .limit(8)
  return await filterInStock(data || [])
}

export const productService = {
  // GET /products — supports: category_id, min_price, max_price, sort, page, limit, available
  // NOTE: backend 'category' filter by slug is broken (Supabase joined-table filter limitation).
  // We pass category_id instead and filter correctly.
  getProducts: (params = {}) => api.get('/products', { params }),

  // GET /products/:slug
  getProductBySlug: (slug) => api.get(`/products/${slug}`),

  // GET /products/search?q=
  searchProducts: (q) => api.get('/products/search', { params: { q } }),

  // GET /categories
  getCategories: () => api.get('/products/categories'),

  getBySlug: (slug) => api.get(`/products/${slug}`),
}

