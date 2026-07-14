import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus, faTrash, faXmark, faCheck, faSpinner,
  faTriangleExclamation, faTag, faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import './Coupons.css'

function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}` }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Create Modal ──────────────────────────────────────────────────────────
function CouponModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '',
    min_cart_value: '', expiry: '', usage_limit: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, val) {
    setForm(p => ({ ...p, [field]: val }))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.code.trim()) return setError('Code is required')
    if (!form.value) return setError('Value is required')

    setSaving(true)
    setError(null)
    try {
      await adminService.createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        min_cart_value: form.min_cart_value ? Number(form.min_cart_value) : 0,
        expiry: form.expiry || null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      })
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to create coupon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="co__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="co__modal">
        <div className="co__modal-header">
          <h2 className="co__modal-title">Create Coupon</h2>
          <button className="co__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="co__modal-body">
          {error && (
            <div className="co__modal-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          <div className="co__field">
            <label className="co__label">Code *</label>
            <input className="co__input co__input--mono" value={form.code}
              onChange={e => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10" />
          </div>

          <div className="co__row">
            <div className="co__field">
              <label className="co__label">Type</label>
              <select className="co__input co__select" value={form.type}
                onChange={e => handleChange('type', e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div className="co__field">
              <label className="co__label">Value *</label>
              <input className="co__input co__input--mono" type="number" value={form.value}
                onChange={e => handleChange('value', e.target.value)}
                placeholder={form.type === 'percentage' ? '10' : '500'} min="0" />
            </div>
          </div>

          <div className="co__row">
            <div className="co__field">
              <label className="co__label">Min Cart Value (₹)</label>
              <input className="co__input co__input--mono" type="number" value={form.min_cart_value}
                onChange={e => handleChange('min_cart_value', e.target.value)}
                placeholder="Optional" min="0" />
            </div>
            <div className="co__field">
              <label className="co__label">Usage Limit</label>
              <input className="co__input co__input--mono" type="number" value={form.usage_limit}
                onChange={e => handleChange('usage_limit', e.target.value)}
                placeholder="Optional" min="0" />
            </div>
          </div>

          <div className="co__field">
            <label className="co__label">Expiry Date</label>
            <input className="co__input" type="date" value={form.expiry}
              onChange={e => handleChange('expiry', e.target.value)} />
          </div>
        </div>

        <div className="co__modal-footer">
          <button className="co__cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="co__save-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving…</>
              : <><FontAwesomeIcon icon={faCheck} /> Create</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ─────────────────────────────────────────────────────────
function DeleteConfirm({ coupon, onClose, onConfirm, deleting }) {
  return (
    <div className="co__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="co__modal co__modal--sm">
        <div className="co__modal-header">
          <h2 className="co__modal-title">Delete Coupon?</h2>
          <button className="co__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="co__modal-body">
          <p className="co__confirm-text">
            <strong>"{coupon.code}"</strong> will be permanently deleted. This cannot be undone.
          </p>
        </div>
        <div className="co__modal-footer">
          <button className="co__cancel-btn" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="co__delete-btn" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Deleting…</>
              : <><FontAwesomeIcon icon={faTrash} /> Delete</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Coupons Page ──────────────────────────────────────────────────────
export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getCoupons()
      setCoupons(res.data?.coupons || [])
    } catch {
      setError('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteCoupon(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch {
      // silently fail, matches Products.jsx pattern
    } finally {
      setDeleting(false)
    }
  }

  const isExpired = (expiry) => expiry && new Date(expiry) < new Date()

  return (
    <div className="co__page">
      <div className="co__header">
        <div>
          <h1 className="co__title">Coupons</h1>
          <p className="co__sub">{coupons.length} total coupons</p>
        </div>
        <button className="co__add-btn" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Coupon
        </button>
      </div>

      <div className="co__filters">
        <button className="co__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      <div className="co__card">
        {loading ? (
          <div className="co__state">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="co__state co__state--error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="co__state">
            <FontAwesomeIcon icon={faTag} />
            <p>No coupons created yet</p>
          </div>
        ) : (
          <div className="co__table-wrap">
            <table className="co__table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Cart</th>
                  <th>Usage Limit</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const expired = isExpired(c.expiry)
                  return (
                    <tr key={c.id}>
                      <td className="co__code">{c.code}</td>
                      <td className="co__td-muted co__capitalize">{c.type}</td>
                      <td className="co__td-mono">
                        {c.type === 'percentage' ? `${c.value}%` : fmt(c.value)}
                      </td>
                      <td className="co__td-mono">{c.min_cart_value ? fmt(c.min_cart_value) : '—'}</td>
                      <td className="co__td-muted">{c.usage_limit || 'Unlimited'}</td>
                      <td>
                        <span className={`co__expiry ${expired ? 'co__expiry--expired' : ''}`}>
                          {fmtDate(c.expiry)}
                        </span>
                      </td>
                      <td>
                        <button className="co__action-btn co__action-btn--danger"
                          onClick={() => setDeleteTarget(c)} aria-label="Delete">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CouponModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          coupon={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}