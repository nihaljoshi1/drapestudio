import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../services/productService'

const DEFAULT_LIMIT = 12

export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Derive filter state from URL params (source of truth) ──
  const filters = {
    category:  searchParams.get('category')  || '',
    sort:      searchParams.get('sort')      || 'newest',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    available: searchParams.get('available') || '',
    page:      Number(searchParams.get('page')) || 1,
  }

  const [products, setProducts]   = useState([])
  const [pagination, setPagination] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const abortRef = useRef(null)

  // ── Fetch products whenever URL params change ──
  useEffect(() => {
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          sort:  filters.sort,
          page:  filters.page,
          limit: DEFAULT_LIMIT,
        }
        if (filters.category)  params.category  = filters.category
        if (filters.min_price) params.min_price = filters.min_price
        if (filters.max_price) params.max_price = filters.max_price
        if (filters.available) params.available = filters.available

        const res = await productService.getProducts(params)
        // api.js interceptor returns response.data directly
        // so res = { success, message, data: { products, pagination } }
        setProducts(res.data?.products || [])
        setPagination(res.data?.pagination || null)
      } catch (err) {
        if (err?.name === 'CanceledError') return
        setError('Failed to load products. Please try again.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams.toString()])

  // ── Fetch categories once ──
  useEffect(() => {
    productService.getCategories()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
  }, [])

  // ── Filter setters — update URL params, reset to page 1 ──
  const setFilter = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('page') // reset page on any filter change
      return next
    })
  }, [setSearchParams])

  const setPage = useCallback((page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', page)
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  const hasActiveFilters = !!(
    filters.category ||
    filters.min_price ||
    filters.max_price ||
    filters.available
  )

  return {
    products,
    pagination,
    categories,
    loading,
    error,
    filters,
    setFilter,
    setPage,
    clearFilters,
    hasActiveFilters,
  }
}