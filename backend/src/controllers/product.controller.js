import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Get All Products (with filter, sort, pagination) ─────
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      size,
      colour,
      min_price,
      max_price,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20,
      available,
    } = req.query

    const offset = (page - 1) * limit

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(url, is_primary, display_order),
        product_variants(id, size, colour, stock, sku)
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('status', 'active')

    if (category) query = query.eq('category_id', category)
    if (min_price) query = query.gte('base_price', min_price)
    if (max_price) query = query.lte('base_price', max_price)

    // ── Variant-based filters (must use subquery — can't filter on joined tables) ──
    if (available === 'true') {
      const { data: inStockVariants } = await supabase
        .from('product_variants')
        .select('product_id')
        .gt('stock', 0)

      const inStockIds = [...new Set(inStockVariants?.map(v => v.product_id) || [])]
      if (inStockIds.length > 0) query = query.in('id', inStockIds)
    }

    if (size || colour) {
      let variantQuery = supabase.from('product_variants').select('product_id')
      if (size) variantQuery = variantQuery.eq('size', size)
      if (colour) variantQuery = variantQuery.ilike('colour', colour)

      const { data: matchingVariants } = await variantQuery
      const matchingIds = [...new Set(matchingVariants?.map(v => v.product_id) || [])]
      query = query.in('id', matchingIds.length > 0
        ? matchingIds
        : ['00000000-0000-0000-0000-000000000000']
      )
    }

    // ── Sort ──────────────────────────────────────────────
    const sortMap = {
      newest: { col: 'created_at', asc: false },
      price_asc: { col: 'base_price', asc: true },
      price_desc: { col: 'base_price', asc: false },
    }
    const sortConfig = sortMap[sort] || { col: 'created_at', asc: false }
    query = query.order(sortConfig.col, { ascending: sortConfig.asc })

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Products fetched', {
      products: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      }
    })
  } catch (err) {
    return sendError(res, 'Failed to fetch products', 500)
  }
}

// ─── Get Single Product by Slug ───────────────────────────
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(id, url, is_primary, display_order),
        product_variants(id, size, colour, stock, sku)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return sendError(res, 'Product not found', 404)

    // Sort images by display_order
    data.product_images?.sort((a, b) => a.display_order - b.display_order)

    // Get related products (same category, exclude current)
    const { data: related } = await supabase
      .from('products')
      .select(`
        id, name, slug, base_price, sale_price,
        product_images(url, is_primary)
      `)
      .eq('category_id', data.category_id)
      .eq('is_active', true)
      .neq('id', data.id)
      .limit(4)

    return sendSuccess(res, 'Product fetched', { product: data, related: related || [] })
  } catch (err) {
    return sendError(res, 'Failed to fetch product', 500)
  }
}

// ─── Search Products ──────────────────────────────────────
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return sendError(res, 'Search query must be at least 2 characters', 400)
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, base_price, sale_price,
        product_images(url, is_primary),
        categories(name, slug)
      `)
      .textSearch('name', q, { type: 'websearch' })
      .eq('is_active', true)
      .limit(20)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Search results', { products: data, query: q })
  } catch (err) {
    return sendError(res, 'Search failed', 500)
  }
}

// ─── Get All Categories ───────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Categories fetched', { categories: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch categories', 500)
  }
}

// ─── Get Single Category ──────────────────────────────────
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return sendError(res, 'Category not found', 404)

    return sendSuccess(res, 'Category fetched', { category: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch category', 500)
  }
}