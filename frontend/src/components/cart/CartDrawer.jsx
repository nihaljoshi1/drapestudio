import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import CartItem from './CartItem'
import './CartDrawer.css'

const FREE_SHIPPING_THRESHOLD = 999

export default function CartDrawer() {
  const { items, isOpen, closeCart, clearCart, getTotal, getCount } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const drawerRef = useRef(null)

  const total = getTotal()
  const count = getCount()
  const shippingGap = FREE_SHIPPING_THRESHOLD - total
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const hasFreeShipping = total >= FREE_SHIPPING_THRESHOLD

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeCart])

  // Focus trap — bring focus into drawer when it opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector('button, a, input')
      firstFocusable?.focus()
    }
  }, [isOpen])

  function handleCheckout() {
    closeCart()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
  }

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`cd-overlay ${isOpen ? 'cd-overlay--on' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <aside
        ref={drawerRef}
        className={`cd ${isOpen ? 'cd--open' : ''}`}
        aria-label="Shopping cart"
        aria-modal="true"
        role="dialog"
      >
        {/* ── Header ── */}
        <div className="cd__header">
          <div className="cd__header-left">
            <h2 className="cd__title">Your Bag</h2>
            {count > 0 && (
              <span className="cd__count">{count} {count === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <div className="cd__header-right">
            {items.length > 0 && (
              <button
                className="cd__clear"
                onClick={clearCart}
                aria-label="Clear cart"
              >
                Clear all
              </button>
            )}
            <button
              className="cd__close"
              onClick={closeCart}
              aria-label="Close cart"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* ── Free shipping progress bar ── */}
        {items.length > 0 && (
          <div className="cd__shipping-bar">
            <div className="cd__shipping-track">
              <div
                className="cd__shipping-fill"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
            <p className="cd__shipping-msg">
              {hasFreeShipping
                ? <><span className="cd__shipping-icon">✦</span> You've unlocked free shipping!</>
                : <>Add <strong>₹{shippingGap.toLocaleString('en-IN')}</strong> more for free shipping</>
              }
            </p>
          </div>
        )}

        {/* ── Body ── */}
        <div className="cd__body">
          {items.length === 0 ? (
            /* Empty state */
            <div className="cd__empty">
              <div className="cd__empty-icon" aria-hidden="true">
                <IconEmptyBag />
              </div>
              <p className="cd__empty-title">Your bag is empty</p>
              <p className="cd__empty-sub">
                Discover pieces made to last, not to trend.
              </p>
              <Link to="/products" className="cd__empty-cta" onClick={closeCart}>
                Explore Collection
                <IconArrow />
              </Link>
            </div>
          ) : (
            /* Items list */
            <div className="cd__items">
              {items.map((item) => (
                <CartItem key={item.variant_id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer (only when items exist) ── */}
        {items.length > 0 && (
          <div className="cd__footer">
            {/* Order summary */}
            <div className="cd__summary">
              <div className="cd__summary-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="cd__summary-row cd__summary-row--muted">
                <span>Shipping</span>
                <span>{hasFreeShipping ? 'Free' : 'Calculated at checkout'}</span>
              </div>
              <div className="cd__summary-row cd__summary-row--total">
                <span>Estimated Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="cd__ctas">
              <button className="cd__checkout-btn" onClick={handleCheckout}>
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                <IconArrow />
              </button>
              <Link to="/products" className="cd__continue" onClick={closeCart}>
                Continue Shopping
              </Link>
            </div>

            {/* Trust signals */}
            <div className="cd__trust">
              <span className="cd__trust-item">
                <IconLock /> Secure checkout
              </span>
              <span className="cd__trust-item">
                <IconReturn /> 30-day returns
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

/* ── Local SVG icons ── */
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function IconEmptyBag() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconReturn() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l4-4-4-4" />
      <path d="M7 5H16a5 5 0 0 1 0 10H4" />
    </svg>
  )
}