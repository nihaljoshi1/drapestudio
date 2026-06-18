import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const [hovered, setHovered] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  // ── Image resolution ──
  const images = product.product_images || []
  const primaryImage = images.find((i) => i.is_primary)?.url || images[0]?.url || null
  const hoverImage   = images.length > 1
    ? images.find((i) => !i.is_primary)?.url || null
    : null

  // ── Price ──
  const price        = product.sale_price || product.base_price
  const originalPrice = product.sale_price ? product.base_price : null
  const discount     = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  // ── Variants ──
  const variants   = product.product_variants || []
  const inStock    = variants.some((v) => v.stock > 0)
  const colours    = [...new Map(variants.map((v) => [v.colour, v])).values()]
  const sizes      = [...new Set(variants.map((v) => v.size).filter(Boolean))]

  // ── Wishlist ──
  const wishlisted = isInWishlist(product.id)

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
  }

  // ── Quick Add — adds first available variant ──
  function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    const firstAvailable = variants.find((v) => v.stock > 0)
    if (!firstAvailable) return
    addItem(product, firstAvailable, 1, primaryImage)
    setAddedFeedback(true)
    setTimeout(() => {
      setAddedFeedback(false)
      openCart()
    }, 800)
  }

  return (
    <article
      className={`pc ${!inStock ? 'pc--oos' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="pc__link" tabIndex={-1} aria-hidden="true">
        {/* ── Image ── */}
        <div className="pc__img-wrap">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                className={`pc__img pc__img--primary ${hovered && hoverImage ? 'pc__img--fade' : ''}`}
                loading="lazy"
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  className={`pc__img pc__img--hover ${hovered ? 'pc__img--hover-on' : ''}`}
                  loading="lazy"
                  aria-hidden="true"
                />
              )}
            </>
          ) : (
            <div className="pc__img-fallback" aria-hidden="true">
              <IconHanger />
            </div>
          )}

          {/* Badges */}
          <div className="pc__badges">
            {discount && <span className="pc__badge pc__badge--sale">−{discount}%</span>}
            {!inStock && <span className="pc__badge pc__badge--oos">Sold Out</span>}
            {inStock && product.created_at && isNew(product.created_at) && (
              <span className="pc__badge pc__badge--new">New</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            className={`pc__wishlist ${wishlisted ? 'pc__wishlist--on' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <IconHeart filled={wishlisted} />
          </button>

          {/* Quick add — appears on hover */}
          {inStock && (
            <button
              className={`pc__quick-add ${hovered ? 'pc__quick-add--show' : ''} ${addedFeedback ? 'pc__quick-add--added' : ''}`}
              onClick={handleQuickAdd}
              aria-label="Quick add to cart"
            >
              {addedFeedback ? (
                <><IconCheck /> Added</>
              ) : (
                <>Quick Add</>
              )}
            </button>
          )}
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="pc__info">
        {product.categories?.name && (
          <p className="pc__category">{product.categories.name}</p>
        )}

        <Link to={`/products/${product.slug}`} className="pc__name-link">
          <h3 className="pc__name">{product.name}</h3>
        </Link>

        {/* Colour swatches */}
        {colours.length > 0 && (
          <div className="pc__colours" aria-label="Available colours">
            {colours.slice(0, 5).map((v) => (
              <span
                key={v.id}
                className="pc__colour"
                title={v.colour}
                style={{ background: v.colour_hex || colourToHex(v.colour) }}
                aria-label={v.colour}
              />
            ))}
            {colours.length > 5 && (
              <span className="pc__colour-more">+{colours.length - 5}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="pc__price-row">
          <span className="pc__price">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="pc__price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Size availability strip */}
        {sizes.length > 0 && (
          <div className="pc__sizes">
            {sizes.map((size) => {
              const hasStock = variants.some((v) => v.size === size && v.stock > 0)
              return (
                <span
                  key={size}
                  className={`pc__size ${!hasStock ? 'pc__size--oos' : ''}`}
                >
                  {size}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isNew(createdAt) {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return days <= 30
}

// Basic colour name → hex fallback for common colours.
// If your DB stores hex codes in colour_hex, this is ignored.
function colourToHex(name = '') {
  const map = {
    white: '#F5F5F5', black: '#1A1A1A', ivory: '#F7F5F2',
    grey: '#9E9E9E', gray: '#9E9E9E', navy: '#1B2A4A',
    blue: '#3B6FD4', red: '#E8315A', green: '#4CAF72',
    yellow: '#F5C842', pink: '#F48FB1', brown: '#6D4C41',
    beige: '#D6C9A8', cream: '#FFF8E7', olive: '#7D8A2E',
    orange: '#E8813A', purple: '#7B4EA0', khaki: '#C3B277',
  }
  return map[name.toLowerCase()] || '#D6D0C4'
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconHeart({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconHanger() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4a2 2 0 0 1 2 2c0 1-1 1.5-2 2L3 14h18L12 8" />
      <path d="M3 14v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
    </svg>
  )
}