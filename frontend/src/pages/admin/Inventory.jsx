import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faArrowsRotate, faSpinner,
  faTriangleExclamation, faXmark, faCheck, faBoxOpen,
  faPlus, faMinus, faWarehouse,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import './Inventory.css'

// ─── Adjust Stock Modal ────────────────────────────────────────────────────
function AdjustModal({ variant, onClose, onSave }) {
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const newStock = variant.stock + delta

  async function handleSave() {
    if (delta === 0) return setError('Enter a non-zero change')
    if (newStock < 0) return setError('Stock cannot go below 0')

    setSaving(true)
    setError(null)
    try {
      await adminService.adjustStock(variant.id, { change: delta, reason: reason || undefined })
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="in__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="in__modal">
        <div className="in__modal-header">
          <h2 className="in__modal-title">Adjust Stock</h2>
          <button className="in__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="in__modal-body">
          <p className="in__modal-product">
            {variant.products?.name} — {variant.size} / {variant.colour}
          </p>
          <p className="in__modal-sku">{variant.sku}</p>

          {error && (
            <div className="in__modal-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          <div className="in__modal-field">
            <label className="in__modal-label">Change</label>
            <div className="in__delta-row">
              <button className="in__delta-btn" onClick={() => setDelta(d => d - 1)}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                className="in__delta-input"
                type="number"
                value={delta}
                onChange={e => setDelta(Number(e.target.value))}
              />
              <button className="in__delta-btn" onClick={() => setDelta(d => d + 1)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <p className="in__delta-preview">
              {variant.stock} → <strong className={newStock < 0 ? 'in__preview-bad' : ''}>{newStock}</strong>
            </p>
          </div>

          <div className="in__modal-field">
            <label className="in__modal-label">Reason (optional)</label>
            <input
              className="in__modal-input"
              type="text"
              placeholder="e.g. Restock, damaged, correction"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="in__modal-footer">
          <button className="in__cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="in__save-btn" onClick={handleSave} disabled={saving}>
            {saving
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving…</>
              : <><FontAwesomeIcon icon={faCheck} /> Save</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Inventory Page ───────────────────────────────────────────────────
export default function Inventory() {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (lowStockOnly) params.low_stock = 'true'
      const res = await adminService.getInventory(params)
      setVariants(res.data?.inventory || [])
    } catch {
      setError('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [lowStockOnly])

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? variants.filter(v =>
        v.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.sku?.toLowerCase().includes(search.toLowerCase())
      )
    : variants

  return (
    <div className="in__page">
      <div className="in__header">
        <div>
          <h1 className="in__title">Inventory</h1>
          <p className="in__sub">{filtered.length} variants</p>
        </div>
        <button className="in__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      <div className="in__filters">
        <div className="in__search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="in__search-icon" />
          <input
            className="in__search"
            type="text"
            placeholder="Search by product or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="in__search-clear" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <label className="in__toggle">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
          />
          Low stock only
        </label>
      </div>

      <div className="in__card">
        {loading ? (
          <div className="in__state">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="in__state in__state--error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="in__state">
            <FontAwesomeIcon icon={faWarehouse} />
            <p>No variants found</p>
          </div>
        ) : (
          <div className="in__table-wrap">
            <table className="in__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <p className="in__product-name">{v.products?.name || '—'}</p>
                      <p className="in__product-status">{v.products?.status}</p>
                    </td>
                    <td className="in__td-muted">{v.size} / {v.colour}</td>
                    <td className="in__td-mono">{v.sku}</td>
                    <td>
                      <span className={`in__stock ${v.stock === 0 ? 'in__stock--out' : v.stock <= 5 ? 'in__stock--low' : ''}`}>
                        {v.stock}
                      </span>
                    </td>
                    <td>
                      <button className="in__adjust-btn" onClick={() => setAdjustTarget(v)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjustTarget && (
        <AdjustModal
          variant={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSave={() => { setAdjustTarget(null); load() }}
        />
      )}
    </div>
  )
}