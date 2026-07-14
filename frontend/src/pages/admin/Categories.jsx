import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus, faPen, faTrash, faXmark, faCheck, faSpinner,
  faTriangleExclamation, faLayerGroup, faArrowsRotate, faImage,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import './Categories.css'

// ─── Create/Edit Modal ──────────────────────────────────────────────────────
function CategoryModal({ category, onClose, onSave }) {
  const isEdit = !!category
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    display_order: category?.display_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, val) {
    setForm(p => ({ ...p, [field]: val }))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.name.trim()) return setError('Name is required')

    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 0 }
      if (isEdit) {
        await adminService.updateCategory(category.id, payload)
      } else {
        await adminService.createCategory(payload)
      }
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ct__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ct__modal">
        <div className="ct__modal-header">
          <h2 className="ct__modal-title">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button className="ct__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="ct__modal-body">
          {error && (
            <div className="ct__modal-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          <div className="ct__field">
            <label className="ct__label">Name *</label>
            <input className="ct__input" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="e.g. Dresses" />
          </div>

          <div className="ct__field">
            <label className="ct__label">Description</label>
            <textarea className="ct__input ct__textarea" value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Category description..." rows={3} />
          </div>

          <div className="ct__field">
            <label className="ct__label">Image URL</label>
            <input className="ct__input" value={form.image_url}
              onChange={e => handleChange('image_url', e.target.value)}
              placeholder="https://..." />
          </div>

          <div className="ct__field">
            <label className="ct__label">Display Order</label>
            <input className="ct__input ct__input--mono" type="number" value={form.display_order}
              onChange={e => handleChange('display_order', e.target.value)}
              min="0" />
          </div>
        </div>

        <div className="ct__modal-footer">
          <button className="ct__cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ct__save-btn" onClick={handleSubmit} disabled={saving}>
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

// ─── Delete confirm ─────────────────────────────────────────────────────────
function DeleteConfirm({ category, onClose, onConfirm, deleting }) {
  return (
    <div className="ct__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ct__modal ct__modal--sm">
        <div className="ct__modal-header">
          <h2 className="ct__modal-title">Deactivate Category?</h2>
          <button className="ct__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="ct__modal-body">
          <p className="ct__confirm-text">
            <strong>"{category.name}"</strong> will be marked inactive and hidden from the store.
          </p>
        </div>
        <div className="ct__modal-footer">
          <button className="ct__cancel-btn" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="ct__delete-btn" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Deactivating…</>
              : <><FontAwesomeIcon icon={faTrash} /> Deactivate</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Categories Page ───────────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalCategory, setModalCategory] = useState(undefined) // undefined=closed, null=new, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getCategories()
      setCategories(res.data?.categories || [])
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch {
      // silently fail, matches Products.jsx pattern
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="ct__page">
      <div className="ct__header">
        <div>
          <h1 className="ct__title">Categories</h1>
          <p className="ct__sub">{categories.length} total categories</p>
        </div>
        <button className="ct__add-btn" onClick={() => setModalCategory(null)}>
          <FontAwesomeIcon icon={faPlus} /> Add Category
        </button>
      </div>

      <div className="ct__filters">
        <button className="ct__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      <div className="ct__card">
        {loading ? (
          <div className="ct__state">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="ct__state ct__state--error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="ct__state">
            <FontAwesomeIcon icon={faLayerGroup} />
            <p>No categories yet</p>
          </div>
        ) : (
          <div className="ct__table-wrap">
            <table className="ct__table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="ct__cat-cell">
                        <div className="ct__cat-img">
                          {c.image_url
                            ? <img src={c.image_url} alt={c.name} />
                            : <FontAwesomeIcon icon={faImage} />
                          }
                        </div>
                        <p className="ct__cat-name">{c.name}</p>
                      </div>
                    </td>
                    <td className="ct__td-mono">{c.slug}</td>
                    <td className="ct__td-muted">{c.display_order}</td>
                    <td>
                      <span className={`ct__status-pill ${c.is_active === false ? 'ct__status-pill--inactive' : ''}`}>
                        {c.is_active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="ct__actions">
                        <button className="ct__action-btn" onClick={() => setModalCategory(c)} aria-label="Edit">
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button className="ct__action-btn ct__action-btn--danger"
                          onClick={() => setDeleteTarget(c)} aria-label="Deactivate">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCategory !== undefined && (
        <CategoryModal
          category={modalCategory}
          onClose={() => setModalCategory(undefined)}
          onSave={() => { setModalCategory(undefined); load() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}