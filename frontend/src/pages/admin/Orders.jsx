import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faArrowsRotate, faSpinner,
  faTriangleExclamation, faXmark, faCheck,
  faChevronLeft, faChevronRight, faCircleCheck,
  faClock, faTruck, faRotateLeft, faBoxOpen,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import './Orders.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}` }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const STATUS_META = {
  pending:    { label: 'Pending',    icon: faClock,       color: '#71717A' },
  confirmed:  { label: 'Confirmed',  icon: faCircleCheck, color: '#16A34A' },
  processing: { label: 'Processing', icon: faClock,       color: '#D97706' },
  shipped:    { label: 'Shipped',    icon: faTruck,       color: '#2563EB' },
  delivered:  { label: 'Delivered',  icon: faCircleCheck, color: '#16A34A' },
  cancelled:  { label: 'Cancelled',  icon: faXmark,       color: '#DC2626' },
  refunded:   { label: 'Refunded',   icon: faRotateLeft,  color: '#7C3AED' },
}

const VALID_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']

// ─── Status Update Modal ──────────────────────────────────────────────────────
function StatusModal({ order, onClose, onSave }) {
  const [status, setStatus]   = useState(order.status)
  const [note, setNote]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  async function handleSave() {
    if (status === order.status) return onClose()
    setSaving(true)
    setError(null)
    try {
      await adminService.updateOrderStatus(order.id, { status, note: note || undefined })
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="or__overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="or__modal">
        <div className="or__modal-header">
          <h2 className="or__modal-title">Update Order Status</h2>
          <button className="or__modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="or__modal-body">
          <p className="or__modal-order-id">
            Order #{order.id.slice(0,8).toUpperCase()}
          </p>

          {error && (
            <div className="or__modal-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          <div className="or__modal-field">
            <label className="or__modal-label">New Status</label>
            <div className="or__status-options">
              {VALID_STATUSES.map(s => {
                const meta = STATUS_META[s]
                return (
                  <button
                    key={s}
                    className={`or__status-option ${status === s ? 'or__status-option--active' : ''}`}
                    onClick={() => setStatus(s)}
                    style={status === s ? { borderColor: meta.color, color: meta.color, background: `${meta.color}12` } : {}}
                  >
                    <FontAwesomeIcon icon={meta.icon} />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="or__modal-field">
            <label className="or__modal-label">Note (optional)</label>
            <input
              className="or__modal-input"
              type="text"
              placeholder="e.g. Tracking: DTDC12345678"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="or__modal-footer">
          <button className="or__cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="or__save-btn" onClick={handleSave} disabled={saving}>
            {saving
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving…</>
              : <><FontAwesomeIcon icon={faCheck} /> Update Status</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders]       = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const [filterStatus, setFilterStatus]   = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [search, setSearch]               = useState('')
  const [page, setPage]                   = useState(1)

  const [updateTarget, setUpdateTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 15 }
      if (filterStatus) params.status = filterStatus
      if (filterPayment) params.payment_status = filterPayment
      const res = await adminService.getOrders(params)
      setOrders(res.data?.orders || [])
      setPagination(res.data?.pagination || {})
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, filterPayment])

  useEffect(() => { load() }, [load])

  // Client-side search filter
  const filtered = search.trim()
    ? orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.order_addresses?.[0]?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="or__page">

      {/* ── Header ── */}
      <div className="or__header">
        <div>
          <h1 className="or__title">Orders</h1>
          <p className="or__sub">{pagination.total || 0} total orders</p>
        </div>
        <button className="or__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="or__filters">
        <div className="or__search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="or__search-icon" />
          <input
            className="or__search"
            type="text"
            placeholder="Search by order ID or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="or__search-clear" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <select className="or__select" value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {VALID_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>

        <select className="or__select" value={filterPayment}
          onChange={e => { setFilterPayment(e.target.value); setPage(1) }}>
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="or__card">
        {loading ? (
          <div className="or__state">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="or__state or__state--error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="or__state">
            <FontAwesomeIcon icon={faBoxOpen} />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="or__table-wrap">
            <table className="or__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const meta = STATUS_META[order.status] || STATUS_META.pending
                  const customer = order.order_addresses?.[0]?.name || order.profiles?.name || 'Guest'
                  const itemCount = order.order_items?.length || 0
                  const firstItem = order.order_items?.[0]

                  return (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} className="or__order-id">
                          #{order.id.slice(0,8).toUpperCase()}
                        </Link>
                        <span className="or__order-date">{fmtDate(order.created_at)}</span>
                      </td>
                      <td>
                        <p className="or__customer-name">{customer}</p>
                        {order.order_addresses?.[0]?.city && (
                          <p className="or__customer-city">
                            {order.order_addresses[0].city}
                          </p>
                        )}
                      </td>
                      <td>
                        <p className="or__items-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        {firstItem?.snapshot?.product_name && (
                          <p className="or__items-first">
                            {firstItem.snapshot.product_name}
                            {itemCount > 1 ? ` +${itemCount - 1}` : ''}
                          </p>
                        )}
                      </td>
                      <td className="or__td-mono">{fmt(order.total)}</td>
                      <td>
                        <span className={`or__pay-pill or__pay-pill--${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className="or__status-pill"
                          style={{ color: meta.color, background: `${meta.color}14` }}>
                          <FontAwesomeIcon icon={meta.icon} />
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className="or__update-btn"
                          onClick={() => setUpdateTarget(order)}
                          aria-label="Update status"
                        >
                          Update
                          <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="or__pagination">
            <button className="or__page-btn"
              onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="or__page-info">Page {page} of {pagination.totalPages}</span>
            <button className="or__page-btn"
              onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* Status modal */}
      {updateTarget && (
        <StatusModal
          order={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onSave={() => { setUpdateTarget(null); load() }}
        />
      )}
    </div>
  )
}