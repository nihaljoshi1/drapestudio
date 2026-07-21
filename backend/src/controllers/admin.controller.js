import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { sendOrderStatusEmail } from '../services/emailService.js'

// ═══════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════

export const getOverview = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Total revenue MTD
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid')
      .gte('created_at', startOfMonth)

    const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0

    // Total orders MTD
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)

    // New customers MTD
    const { count: newCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)

    // Products in stock
    const { count: productsInStock } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Recent 10 orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id, total, status, payment_status, created_at,
        profiles(name),
        order_addresses(name, city)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Low stock variants (stock <= 5)
    const { data: lowStock } = await supabase
      .from('product_variants')
      .select(`
    id, size, colour, colour_hex, stock, sku,
    products(id, name, slug)
  `)
      .lte('stock', 5)
      .order('stock', { ascending: true })

    return sendSuccess(res, 'Overview fetched', {
      kpis: {
        totalRevenue,
        totalOrders,
        newCustomers,
        productsInStock,
      },
      recentOrders,
      lowStock,
    })
  } catch (err) {
    return sendError(res, 'Failed to fetch overview', 500)
  }
}

export const getRevenueChart = async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) return sendError(res, error.message, 400)

    // Group by date
    const grouped = {}
    data?.forEach((order) => {
      const date = order.created_at.split('T')[0]
      grouped[date] = (grouped[date] || 0) + Number(order.total)
    })

    const chart = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }))

    return sendSuccess(res, 'Revenue chart fetched', { chart })
  } catch (err) {
    return sendError(res, 'Failed to fetch revenue chart', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name),
        product_images(url, is_primary),
        product_variants(id, size, colour, stock)
      `, { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category_id', category)
    if (status) query = query.eq('status', status)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

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

export const adminCreateProduct = async (req, res) => {
  try {
    const {
      name, description, category_id,
      base_price, sale_price, status = 'active',
      variants, images,
    } = req.body

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) return sendError(res, 'Product with this name already exists', 409)

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name, slug, description, category_id,
        base_price, sale_price,
        status,
        is_active: status === 'active',
      })
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    // Insert variants
    if (variants && variants.length > 0) {
      const variantRows = variants.map((v) => ({
        product_id: product.id,
        size: v.size,
        colour: v.colour,
        stock: v.stock || 0,
        sku: v.sku || `${slug}-${v.size}-${v.colour}`.toUpperCase(),
      }))

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantRows)

      if (variantError) return sendError(res, variantError.message, 400)
    }

    // Insert images
    if (images && images.length > 0) {
      const imageRows = images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        is_primary: index === 0,
        display_order: index,
      }))

      await supabase.from('product_images').insert(imageRows)
    }

    return sendSuccess(res, 'Product created', { product }, 201)
  } catch (err) {
    return sendError(res, 'Failed to create product', 500)
  }
}

export const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (updates.status) {
      updates.is_active = updates.status === 'active'
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Product updated', { product: data })
  } catch (err) {
    return sendError(res, 'Failed to update product', 500)
  }
}

export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .update({ is_active: false, status: 'archived' })
      .eq('id', id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Product archived')
  } catch (err) {
    return sendError(res, 'Failed to delete product', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// VARIANT MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetVariants = async (req, res) => {
  try {
    const { productId } = req.params

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size', { ascending: true })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Variants fetched', { variants: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch variants', 500)
  }
}

export const adminCreateVariant = async (req, res) => {
  try {
    const { productId } = req.params
    const { size, colour, colour_hex, stock, sku } = req.body

    if (!size || !colour) return sendError(res, 'Size and colour are required', 400)

    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single()

    if (!product) return sendError(res, 'Product not found', 404)

    const generatedSku = sku || `${product.slug}-${size}-${colour}`.toUpperCase()

    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        size, colour,
        colour_hex: colour_hex || null,
        stock: stock || 0,
        sku: generatedSku,
      })
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Variant created', { variant: data }, 201)
  } catch (err) {
    return sendError(res, 'Failed to create variant', 500)
  }
}

export const adminUpdateVariant = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Variant updated', { variant: data })
  } catch (err) {
    return sendError(res, 'Failed to update variant', 500)
  }
}

export const adminDeleteVariant = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Variant deleted')
  } catch (err) {
    return sendError(res, 'Failed to delete variant', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// IMAGE MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminUploadImage = async (req, res) => {
  try {
    const { productId } = req.params

    if (!req.file) return sendError(res, 'No image file provided', 400)

    const ext = req.file.originalname.split('.').pop()
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (uploadError) return sendError(res, uploadError.message, 400)

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // If this is the first image for the product, mark it primary
    const { count: existingCount } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: urlData.publicUrl,
        storage_path: fileName,
        is_primary: (existingCount || 0) === 0,
        display_order: existingCount || 0,
      })
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Image uploaded', { image: data }, 201)
  } catch (err) {
    return sendError(res, 'Failed to upload image', 500)
  }
}

export const adminSetPrimaryImage = async (req, res) => {
  try {
    const { id } = req.params
    const { productId } = req.body

    if (!productId) return sendError(res, 'productId is required', 400)

    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    const { data, error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Primary image set', { image: data })
  } catch (err) {
    return sendError(res, 'Failed to set primary image', 500)
  }
}

export const adminDeleteImage = async (req, res) => {
  try {
    const { id } = req.params

    const { data: image } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!image) return sendError(res, 'Image not found', 404)

    if (image.storage_path) {
      await supabase.storage.from('product-images').remove([image.storage_path])
    }

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Image deleted')
  } catch (err) {
    return sendError(res, 'Failed to delete image', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment_status } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles(name, phone),
        order_addresses(name, phone, city, state),
        order_items(quantity, unit_price, snapshot)
      `, { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (payment_status) query = query.eq('payment_status', payment_status)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    const { data, error, count } = await query

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Orders fetched', {
      orders: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      }
    })
  } catch (err) {
    return sendError(res, 'Failed to fetch orders', 500)
  }
}

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, note, tracking_number } = req.body

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid status', 400)
    }

    // Get current status
    const { data: current } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (!current) return sendError(res, 'Order not found', 404)

    const updateData = { status, updated_at: new Date().toISOString() }
    if (tracking_number) updateData.notes = tracking_number

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    // Log status change
    await supabase.from('order_status_logs').insert({
      order_id: id,
      old_status: current.status,
      new_status: status,
      note: note || null,
      changed_by: req.user.id,
    })

    sendOrderStatusEmail(data, current.status, status, note).catch(err => console.error('Status email failed:', err))

    return sendSuccess(res, 'Order status updated', { order: data })
  } catch (err) {
    return sendError(res, 'Failed to update order status', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════

export const adminGetInventory = async (req, res) => {
  try {
    const { low_stock } = req.query

    let query = supabase
      .from('product_variants')
      .select(`
        id, size, colour, stock, sku,
        products(id, name, slug, status)
      `)
      .order('stock', { ascending: true })

    if (low_stock === 'true') query = query.lte('stock', 5)

    const { data, error } = await query

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Inventory fetched', { inventory: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch inventory', 500)
  }
}

export const adminAdjustStock = async (req, res) => {
  try {
    const { id } = req.params
    const { change, reason } = req.body

    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', id)
      .single()

    if (!variant) return sendError(res, 'Variant not found', 404)

    const newStock = variant.stock + change
    if (newStock < 0) return sendError(res, 'Stock cannot go below 0', 400)

    const { data, error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    await supabase.from('inventory_logs').insert({
      variant_id: id,
      change,
      reason: reason || 'Manual adjustment',
      changed_by: req.user.id,
    })

    return sendSuccess(res, 'Stock adjusted', { variant: data })
  } catch (err) {
    return sendError(res, 'Failed to adjust stock', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// COUPON MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetCoupons = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Coupons fetched', { coupons: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch coupons', 500)
  }
}

export const adminCreateCoupon = async (req, res) => {
  try {
    const { code, type, value, min_cart_value, expiry, usage_limit } = req.body

    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) return sendError(res, 'Coupon code already exists', 409)

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        type, value,
        min_cart_value: min_cart_value || 0,
        expiry: expiry || null,
        usage_limit: usage_limit || null,
      })
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Coupon created', { coupon: data }, 201)
  } catch (err) {
    return sendError(res, 'Failed to create coupon', 500)
  }
}

export const adminUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Coupon updated', { coupon: data })
  } catch (err) {
    return sendError(res, 'Failed to update coupon', 500)
  }
}

export const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Coupon deleted')
  } catch (err) {
    return sendError(res, 'Failed to delete coupon', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('profiles')
      .select(`id, name, phone, role, created_at`, { count: 'exact' })
      .eq('role', 'user')

    if (search) query = query.ilike('name', `%${search}%`)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    const { data, error, count } = await query

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Customers fetched', {
      customers: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      }
    })
  } catch (err) {
    return sendError(res, 'Failed to fetch customers', 500)
  }
}

// ═══════════════════════════════════════════════════════════
// CATEGORY MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const adminGetCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Categories fetched', { categories: data })
  } catch (err) {
    return sendError(res, 'Failed to fetch categories', 500)
  }
}


export const adminCreateCategory = async (req, res) => {
  try {
    const { name, description, image_url, display_order } = req.body

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, description, image_url, display_order: display_order || 0 })
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Category created', { category: data }, 201)
  } catch (err) {
    return sendError(res, 'Failed to create category', 500)
  }
}

export const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Category updated', { category: data })
  } catch (err) {
    return sendError(res, 'Failed to update category', 500)
  }
}

export const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Category deleted')
  } catch (err) {
    return sendError(res, 'Failed to delete category', 500)
  }
}