import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faPlus, faTrash, faSpinner, faTriangleExclamation,
  faXmark, faCheck, faStar, faImage, faUpload, faStarHalfStroke,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import { productService } from '../../services/productService'
import './ManageVariants.css'

// ─── Add Variant Row ────────────────────────────────────────────────────────
function AddVariantForm({ productId, onAdded }) {
  const [form, setForm] = useState({ size: '', colour: '', colour_hex: '#000000', stock: 0, sku: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleAdd() {
    if (!form.size.trim() || !form.colour.trim()) return setError('Size and colour required')
    setSaving(true)
    setError(null)
    try {
      await adminService.createVariant(productId, {
        ...form,
        stock: Number(form.stock) || 0,
        sku: form.sku || undefined,
      })
      setForm({ size: '', colour: '', colour_hex: '#000000', stock: 0, sku: '' })
      onAdded()
    } catch (err) {
      setError(err.message || 'Failed to add variant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mv__add-row">
      {error && <p className="mv__add-error">{error}</p>}
      <div className="mv__add-fields">
        <input className="mv__add-input" placeholder="Size (e.g. M)" value={form.size}
          onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
        <input className="mv__add-input" placeholder="Colour (e.g. Ivory)" value={form.colour}
          onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} />
        <input className="mv__add-color" type="color" value={form.colour_hex}
          onChange={e => setForm(f => ({ ...f, colour_hex: e.target.value }))} />
        <input className="mv__add-input mv__add-input--num" type="number" placeholder="Stock" value={form.stock}
          onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" />
        <input className="mv__add-input" placeholder="SKU (optional)" value={form.sku}
          onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
        <button className="mv__add-btn" onClick={handleAdd} disabled={saving}>
          {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Variant Row ────────────────────────────────────────────────────────────
function VariantRow({ variant, onUpdate, onDelete }) {
  const [stock, setStock] = useState(variant.stock)
  const [saving, setSaving] = useState(false)

  async function handleStockBlur() {
    if (Number(stock) === variant.stock) return
    setSaving(true)
    try {
      await onUpdate(variant.id, { stock: Number(stock) || 0 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr>
      <td>
        <span className="mv__swatch" style={{ background: variant.colour_hex || '#D6D0C4' }} />
        {variant.colour}
      </td>
      <td>{variant.size}</td>
      <td className="mv__td-mono">{variant.sku}</td>
      <td>
        <input
          className="mv__stock-input"
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          onBlur={handleStockBlur}
          min="0"
        />
        {saving && <FontAwesomeIcon icon={faSpinner} spin className="mv__stock-saving" />}
      </td>
      <td>
        <button className="mv__row-delete" onClick={() => onDelete(variant.id)} aria-label="Delete variant">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </td>
    </tr>
  )
}

// ─── Image Card ─────────────────────────────────────────────────────────────
function ImageCard({ image, productId, onSetPrimary, onDelete }) {
  return (
    <div className={`mv__img-card ${image.is_primary ? 'mv__img-card--primary' : ''}`}>
      <img src={image.url} alt="" />
      {image.is_primary && (
        <span className="mv__img-primary-badge">
          <FontAwesomeIcon icon={faStarSolid} /> Primary
        </span>
      )}
      <div className="mv__img-actions">
        {!image.is_primary && (
          <button onClick={() => onSetPrimary(image.id)} title="Set as primary">
            <FontAwesomeIcon icon={faStar} />
          </button>
        )}
        <button onClick={() => onDelete(image.id)} title="Delete" className="mv__img-delete">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ManageVariants() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, variantRes] = await Promise.all([
        adminService.getProducts({ page: 1, limit: 1 }), // placeholder, replaced below
        adminService.getVariants(id),
      ])
      setVariants(variantRes.data?.variants || [])
    } catch {
      setError('Failed to load product data')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Load product detail + images separately since adminGetProducts is a list endpoint,
  // not a single-product fetch — reuse the public productService for read-only display data.
  const loadProduct = useCallback(async () => {
    try {
      const res = await productService.getById(id)
      setProduct(res.data?.product || null)
      setImages(res.data?.product?.product_images || [])
    } catch {
      // fallback: leave product null, page still shows variants
    }
  }, [id])

  useEffect(() => {
    loadProduct()
    adminService.getVariants(id)
      .then(res => setVariants(res.data?.variants || []))
      .catch(() => setError('Failed to load variants'))
      .finally(() => setLoading(false))
  }, [id, loadProduct])

  async function handleUpdateVariant(variantId, updates) {
    await adminService.updateVariant(variantId, updates)
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, ...updates } : v))
  }

  async function handleDeleteVariant(variantId) {
    if (!confirm('Delete this variant?')) return
    await adminService.deleteVariant(variantId)
    setVariants(prev => prev.filter(v => v.id !== variantId))
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await adminService.uploadImage(id, formData)
      setImages(prev => [...prev, res.data.image])
    } catch {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSetPrimary(imageId) {
    await adminService.setPrimaryImage(imageId, id)
    setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })))
  }

  async function handleDeleteImage(imageId) {
    if (!confirm('Delete this image?')) return
    await adminService.deleteImage(imageId)
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  if (loading) {
    return <div className="mv__page"><div className="mv__state"><FontAwesomeIcon icon={faSpinner} spin /> Loading…</div></div>
  }

  return (
    <div className="mv__page">
      <button className="mv__back" onClick={() => navigate('/admin/products')}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
      </button>

      <h1 className="mv__title">{product?.name || 'Manage Product'}</h1>
      <p className="mv__sub">Variants, stock, and images</p>

      {error && (
        <div className="mv__error-banner">
          <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
        </div>
      )}

      {/* ── Images ── */}
      <section className="mv__section">
        <h2 className="mv__section-title">Images</h2>
        <div className="mv__img-grid">
          {images.map(img => (
            <ImageCard
              key={img.id}
              image={img}
              productId={id}
              onSetPrimary={handleSetPrimary}
              onDelete={handleDeleteImage}
            />
          ))}
          <button className="mv__img-upload" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading
              ? <FontAwesomeIcon icon={faSpinner} spin />
              : <><FontAwesomeIcon icon={faUpload} /><span>Upload Image</span></>
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
        </div>
      </section>

      {/* ── Variants ── */}
      <section className="mv__section">
        <h2 className="mv__section-title">Variants & Stock</h2>
        <div className="mv__card">
          {variants.length === 0 ? (
            <div className="mv__state">
              <FontAwesomeIcon icon={faImage} />
              <p>No variants yet — add one below</p>
            </div>
          ) : (
            <table className="mv__table">
              <thead>
                <tr>
                  <th>Colour</th>
                  <th>Size</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variants.map(v => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    onUpdate={handleUpdateVariant}
                    onDelete={handleDeleteVariant}
                  />
                ))}
              </tbody>
            </table>
          )}
          <AddVariantForm productId={id} onAdded={() => {
            adminService.getVariants(id).then(res => setVariants(res.data?.variants || []))
          }} />
        </div>
      </section>
    </div>
  )
}