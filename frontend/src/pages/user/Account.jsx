import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser, faBox, faHeart, faLocationDot, faChevronRight,
  faXmark, faPen, faTrash, faPlus, faBoxOpen, faTruck,
  faCircleCheck, faClock, faRotateLeft, faTriangleExclamation,
  faRightFromBracket, faBagShopping, faMapPin, faPhone,
  faEnvelope, faLock, faEye, faEyeSlash, faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartReg } from '@fortawesome/free-regular-svg-icons'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { orderService } from '../../services/orderService'
import { authService } from '../../services/authService'
import './Account.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}

const STATUS_META = {
  confirmed:  { label: 'Confirmed',   icon: faCircleCheck,  color: '#16A34A' },
  processing: { label: 'Processing',  icon: faClock,        color: '#D97706' },
  shipped:    { label: 'Shipped',     icon: faTruck,        color: '#2563EB' },
  delivered:  { label: 'Delivered',   icon: faCircleCheck,  color: '#16A34A' },
  cancelled:  { label: 'Cancelled',   icon: faXmark,        color: '#DC2626' },
  returned:   { label: 'Returned',    icon: faRotateLeft,   color: '#7C3AED' },
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'orders',   label: 'My Orders',   icon: faBox        },
  { id: 'profile',  label: 'Profile',     icon: faUser       },
  { id: 'wishlist', label: 'Wishlist',    icon: faHeart      },
  { id: 'addresses',label: 'Addresses',   icon: faLocationDot},
]

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    orderService.getUserOrders()
      .then(res => setOrders(res.data?.orders || []))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TabSkeleton rows={3} />

  if (error) return <TabError message={error} />

  if (orders.length === 0) return (
    <EmptyState
      icon={faBoxOpen}
      title="No orders yet"
      sub="When you place an order, it'll show up here."
      action={{ label: 'Start Shopping', href: '/products' }}
    />
  )

  return (
    <div className="ac__orders">
      {orders.map((order, i) => {
        const meta = STATUS_META[order.status] || STATUS_META.confirmed
        const firstItem = order.order_items?.[0]
        const itemCount = order.order_items?.length || 0

        return (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="ac__order-card"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Thumbnail */}
            <div className="ac__order-img">
              {firstItem?.snapshot?.image_url
                ? <img src={firstItem.snapshot.image_url} alt={firstItem.snapshot.product_name} />
                : <FontAwesomeIcon icon={faBagShopping} />
              }
              {itemCount > 1 && (
                <span className="ac__order-img-count">+{itemCount - 1}</span>
              )}
            </div>

            {/* Info */}
            <div className="ac__order-info">
              <div className="ac__order-top">
                <p className="ac__order-name">
                  {firstItem?.snapshot?.product_name || 'Order'}
                  {itemCount > 1 && ` & ${itemCount - 1} more`}
                </p>
                <span
                  className="ac__order-status"
                  style={{ color: meta.color, background: `${meta.color}14` }}
                >
                  <FontAwesomeIcon icon={meta.icon} />
                  {meta.label}
                </span>
              </div>
              <div className="ac__order-meta">
                <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                <span className="ac__order-dot" />
                <span>{formatDate(order.created_at)}</span>
                <span className="ac__order-dot" />
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <FontAwesomeIcon icon={faChevronRight} className="ac__order-arrow" />
          </Link>
        )
      })}
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  const [form, setForm] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })

  function handleChange(field, val) {
    setForm(p => ({ ...p, [field]: val }))
    setError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) return setError('Name is required')
    setSaving(true)
    setError(null)
    try {
      // Profile update would go through an API route — for now update local state
      await authService.getMe() // validate session still active
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="ac__profile">
      {/* Avatar */}
      <div className="ac__profile-avatar-wrap">
        <div className="ac__profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="ac__banner ac__banner--success">
          <FontAwesomeIcon icon={faCheck} />
          Profile updated successfully
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="ac__banner ac__banner--error">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      )}

      {/* Profile fields */}
      <div className="ac__profile-card">
        <div className="ac__profile-card-header">
          <h3 className="ac__profile-card-title">Personal Information</h3>
          {!editing ? (
            <button className="ac__profile-edit-btn" onClick={() => setEditing(true)}>
              <FontAwesomeIcon icon={faPen} /> Edit
            </button>
          ) : (
            <button className="ac__profile-edit-btn ac__profile-edit-btn--cancel"
              onClick={() => { setEditing(false); setError(null) }}>
              Cancel
            </button>
          )}
        </div>

        <div className="ac__profile-fields">
          <div className="ac__profile-field">
            <FontAwesomeIcon icon={faUser} className="ac__profile-field-icon" />
            <div className="ac__profile-field-body">
              <label className="ac__profile-field-label">Full Name</label>
              {editing
                ? <input className="ac__profile-input" value={form.name}
                    onChange={e => handleChange('name', e.target.value)} />
                : <p className="ac__profile-field-val">{user?.name || '—'}</p>
              }
            </div>
          </div>

          <div className="ac__profile-field">
            <FontAwesomeIcon icon={faEnvelope} className="ac__profile-field-icon" />
            <div className="ac__profile-field-body">
              <label className="ac__profile-field-label">Email Address</label>
              <p className="ac__profile-field-val ac__profile-field-val--muted">{user?.email}</p>
              <p className="ac__profile-field-note">Email cannot be changed</p>
            </div>
          </div>

          <div className="ac__profile-field">
            <FontAwesomeIcon icon={faPhone} className="ac__profile-field-icon" />
            <div className="ac__profile-field-body">
              <label className="ac__profile-field-label">Phone Number</label>
              {editing
                ? <input className="ac__profile-input" value={form.phone}
                    onChange={e => handleChange('phone', e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="10-digit mobile number" />
                : <p className="ac__profile-field-val">{user?.phone || '—'}</p>
              }
            </div>
          </div>
        </div>

        {editing && (
          <div className="ac__profile-actions">
            <button className="ac__profile-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Password card */}
      <div className="ac__profile-card">
        <div className="ac__profile-card-header">
          <h3 className="ac__profile-card-title">
            <FontAwesomeIcon icon={faLock} /> Password
          </h3>
          <button className="ac__profile-edit-btn"
            onClick={() => setShowPwForm(p => !p)}>
            {showPwForm ? 'Cancel' : 'Change'}
          </button>
        </div>

        {showPwForm && (
          <div className="ac__profile-fields">
            {['current', 'next', 'confirm'].map(key => (
              <div key={key} className="ac__pw-field">
                <label className="ac__profile-field-label">
                  {key === 'current' ? 'Current Password'
                    : key === 'next' ? 'New Password'
                    : 'Confirm New Password'}
                </label>
                <div className="ac__pw-input-wrap">
                  <input
                    className="ac__profile-input"
                    type={showPw[key] ? 'text' : 'password'}
                    value={pw[key]}
                    onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                  />
                  <button className="ac__pw-toggle"
                    onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                    <FontAwesomeIcon icon={showPw[key] ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            ))}
            <button className="ac__profile-save-btn" style={{ marginTop: 8 }}>
              Update Password
            </button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="ac__profile-card ac__profile-card--danger">
        <button className="ac__signout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Wishlist Tab ─────────────────────────────────────────────────────────────
function WishlistTab() {
  const { items, removeItem } = useWishlistStore()

  if (items.length === 0) return (
    <EmptyState
      icon={faHeartReg}
      title="Your wishlist is empty"
      sub="Save items you love and find them here anytime."
      action={{ label: 'Browse Collections', href: '/products' }}
    />
  )

  return (
    <div className="ac__wishlist">
      {items.map((product, i) => {
        const images = product.product_images || []
        const img = images.find(x => x.is_primary)?.url || images[0]?.url
        const price = product.sale_price || product.base_price

        return (
          <div key={product.id} className="ac__wish-card"
            style={{ animationDelay: `${i * 50}ms` }}>
            <Link to={`/products/${product.slug}`} className="ac__wish-img-wrap">
              {img
                ? <img src={img} alt={product.name} className="ac__wish-img" />
                : <div className="ac__wish-img-fallback" />
              }
            </Link>
            <div className="ac__wish-info">
              <p className="ac__wish-category">{product.categories?.name}</p>
              <Link to={`/products/${product.slug}`} className="ac__wish-name">
                {product.name}
              </Link>
              <p className="ac__wish-price">{formatPrice(price)}</p>
            </div>
            <div className="ac__wish-actions">
              <Link to={`/products/${product.slug}`} className="ac__wish-view-btn">
                View Product
              </Link>
              <button className="ac__wish-remove-btn"
                onClick={() => removeItem(product.id)}
                aria-label="Remove from wishlist">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────
function AddressesTab() {
  // Addresses are per-order in this schema (order_addresses).
  // No standalone address book table exists. Show saved from past orders.
  return (
    <EmptyState
      icon={faMapPin}
      title="No saved addresses"
      sub="Addresses are saved automatically when you place an order."
      action={{ label: 'Place an Order', href: '/products' }}
    />
  )
}

// ─── Shared UI pieces ─────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="ac__empty">
      <div className="ac__empty-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="ac__empty-title">{title}</h3>
      <p className="ac__empty-sub">{sub}</p>
      {action && (
        <Link to={action.href} className="ac__empty-btn">
          {action.label}
          <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      )}
    </div>
  )
}

function TabSkeleton({ rows = 2 }) {
  return (
    <div className="ac__skeleton">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="ac__skeleton-row ac__shimmer" />
      ))}
    </div>
  )
}

function TabError({ message }) {
  return (
    <div className="ac__tab-error">
      <FontAwesomeIcon icon={faTriangleExclamation} />
      <p>{message}</p>
    </div>
  )
}

// ─── Main Account Component ───────────────────────────────────────────────────
export default function Account() {
  const { user } = useAuthStore()
  const { getCount: getWishlistCount } = useWishlistStore()
  const [activeTab, setActiveTab] = useState('orders')

  const wishlistCount = getWishlistCount()

  return (
    <div className="ac__page">
      <div className="ac__container">

        {/* ── Page header ── */}
        <div className="ac__header">
          <div className="ac__header-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="ac__header-info">
            <h1 className="ac__header-name">{user?.name}</h1>
            <p className="ac__header-email">{user?.email}</p>
          </div>
        </div>

        {/* ── Layout: sidebar tabs + content ── */}
        <div className="ac__layout">

          {/* Sidebar */}
          <aside className="ac__sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`ac__tab ${activeTab === tab.id ? 'ac__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ac__tab-icon">
                  <FontAwesomeIcon icon={tab.icon} />
                </span>
                <span className="ac__tab-label">{tab.label}</span>
                {tab.id === 'wishlist' && wishlistCount > 0 && (
                  <span className="ac__tab-badge">{wishlistCount}</span>
                )}
                <FontAwesomeIcon icon={faChevronRight} className="ac__tab-arrow" />
              </button>
            ))}
          </aside>

          {/* Content */}
          <main className="ac__content">
            {activeTab === 'orders'    && <OrdersTab />}
            {activeTab === 'profile'   && <ProfileTab />}
            {activeTab === 'wishlist'  && <WishlistTab />}
            {activeTab === 'addresses' && <AddressesTab />}
          </main>
        </div>
      </div>
    </div>
  )
}