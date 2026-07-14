import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import {
  faPlus, faPen, faTrash, faMagnifyingGlass,
  faTriangleExclamation, faArrowsRotate, faSpinner,
  faXmark, faCheck, faChevronLeft, faChevronRight,
  faImage, faBoxOpen,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import { productService } from '../../services/productService'
import './Products.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}` }

const STATUS_COLORS = {
  active: { bg: '#F0FDF4', text: '#16A34A' },
  inactive: { bg: '#FEF2F2', text: '#DC2626' },
  archived: { bg: '#F4F4F5', text: '#71717A' },
}

// ─── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSave }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    base_price: product?.base_price || '',
    sale_price: product?.sale_price || '',
    status: product?.status || 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, val) {
    setForm(p => ({ ...p, [field]: val }))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.name.trim()) return setError('Name is required')
    if (!form.base_price) return setError('Base price is required')
    if (!form.category_id) return setError('Category is required')

    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        base_price: Number(form.base_price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
      }

      if (isEdit) {
        await adminService.updateProduct(product.id, payload)
      } else {
        await adminService.createProduct({ ...payload, variants: [], images: [] })
      }
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pm__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm__modal">
        <div className="pm__header">
          <h2 className="pm__title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button className="pm__close" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="pm__body">
          {error && (
            <div className="pm__error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          <div className="pm__field">
            <label className="pm__label">Product Name *</label>
            <input className="pm__input" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="e.g. Linen Slip Dress" />
          </div>

          <div className="pm__field">
            <label className="pm__label">Description</label>
            <textarea className="pm__input pm__textarea" value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Product description..." rows={3} />
          </div>

          <div className="pm__row">
            <div className="pm__field">
              <label className="pm__label">Category *</label>
              <select className="pm__input pm__select" value={form.category_id}
                onChange={e => handleChange('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="pm__field">
              <label className="pm__label">Status</label>
              <select className="pm__input pm__select" value={form.status}
                onChange={e => handleChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pm__row">
            <div className="pm__field">
              <label className="pm__label">Base Price (₹) *</label>
              <input className="pm__input pm__input--mono" type="number" value={form.base_price}
                onChange={e => handleChange('base_price', e.target.value)}
                placeholder="2499" min="0" />
            </div>
            <div className="pm__field">
              <label className="pm__label">Sale Price (₹)</label>
              <input className="pm__input pm__input--mono" type="number" value={form.sale_price}
                onChange={e => handleChange('sale_price', e.target.value)}
                placeholder="Optional" min="0" />
            </div>
          </div>

          {!isEdit && (
            <p className="pm__note">
              After creating the product, manage variants and images directly in Supabase.
            </p>
          )}
        </div>

        <div className="pm__footer">
          <button className="pm__cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="pm__save-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving…</>
              : <><FontAwesomeIcon icon={faCheck} /> {isEdit ? 'Update' : 'Create'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ product, onClose, onConfirm, deleting }) {
  return (
    <div className="pm__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm__modal pm__modal--sm">
        <div className="pm__header">
          <h2 className="pm__title">Archive Product?</h2>
          <button className="pm__close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="pm__body">
          <p className="pm__confirm-text">
            <strong>"{product.name}"</strong> will be archived and hidden from the store.
            You can restore it later from Supabase.
          </p>
        </div>
        <div className="pm__footer">
          <button className="pm__cancel-btn" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="pm__delete-btn" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Archiving…</>
              : <><FontAwesomeIcon icon={faTrash} /> Archive</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Products Page ───────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const [modalProduct, setModalProduct] = useState(undefined) // undefined = closed, null = new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 15 }
      if (search) params.search = search
      if (filterCategory) params.category = filterCategory
      if (filterStatus) params.status = filterStatus

      const res = await adminService.getProducts(params)
      setProducts(res.data?.products || [])
      setPagination(res.data?.pagination || {})
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterCategory, filterStatus])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data?.categories || []))
      .catch(() => { })
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch {
      // silently fail — real app would show error
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="pr__page">

      {/* ── Header ── */}
      <div className="pr__header">
        <div>
          <h1 className="pr__title">Products</h1>
          <p className="pr__sub">{pagination.total || 0} total products</p>
        </div>
        <button className="pr__add-btn" onClick={() => setModalProduct(null)}>
          <FontAwesomeIcon icon={faPlus} /> Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="pr__filters">
        <div className="pr__search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pr__search-icon" />
          <input
            className="pr__search"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="pr__search-clear" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <select className="pr__select" value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select className="pr__select" value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>

        <button className="pr__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="pr__card">
        {loading ? (
          <div className="pr__loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="pr__error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="pr__empty">
            <FontAwesomeIcon icon={faBoxOpen} />
            <p>No products found</p>
          </div>
        ) : (
          <div className="pr__table-wrap">
            <table className="pr__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const img = p.product_images?.find(i => i.is_primary)?.url || p.product_images?.[0]?.url
                  const totalStock = p.product_variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0
                  const colors = STATUS_COLORS[p.status] || STATUS_COLORS.active

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="pr__product-cell">
                          <div className="pr__product-img">
                            {img
                              ? <img src={img} alt={p.name} />
                              : <FontAwesomeIcon icon={faImage} />
                            }
                          </div>
                          <div>
                            <p className="pr__product-name">{p.name}</p>
                            <p className="pr__product-slug">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="pr__td-muted">{p.categories?.name || '—'}</td>
                      <td>
                        <p className="pr__td-mono">{fmt(p.base_price)}</p>
                        {p.sale_price && (
                          <p className="pr__td-sale">{fmt(p.sale_price)}</p>
                        )}
                      </td>
                      <td>
                        <span className={`pr__stock ${totalStock === 0 ? 'pr__stock--out' : totalStock <= 10 ? 'pr__stock--low' : ''}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td>
                        <span className="pr__status-pill"
                          style={{ background: colors.bg, color: colors.text }}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="pr__actions">
                          <button className="pr__action-btn" onClick={() => setModalProduct(p)}
                            aria-label="Edit">
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <Link to={`/admin/products/${p.id}/manage`} className="pr__action-btn" aria-label="Manage variants & images">
                            <FontAwesomeIcon icon={faLayerGroup} />
                          </Link>
                          <button className="pr__action-btn pr__action-btn--danger"
                            onClick={() => setDeleteTarget(p)} aria-label="Archive">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="pr__pagination">
            <button className="pr__page-btn" onClick={() => setPage(p => p - 1)}
              disabled={page === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="pr__page-info">
              Page {page} of {pagination.totalPages}
            </span>
            <button className="pr__page-btn" onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.totalPages}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined)}
          onSave={() => { setModalProduct(undefined); load() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}