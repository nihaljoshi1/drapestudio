import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartReg, faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'

import {
  faHeart,
  faChevronRight,
  faChevronDown,
  faMinus,
  faPlus,
  faLeaf,
  faTruck,
  faRotateLeft,
  faTag,
  faArrowLeft,
  faCircleCheck,
  faLock,
  faExpand,
  faXmark,
  faBagShopping,
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import ProductGrid from '../../components/product/ProductGrid'
import { productService } from '../../services/productService'
import './ProductDetail.css'
import { colourToHex } from '../../utils/helpers.js'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { reviewService } from '../../services/reviewService'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="pd__skeleton">
      <div className="pd__skeleton-gallery">
        <div className="pd__skeleton-thumbs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pd__skeleton-thumb pd__shimmer" />
          ))}
        </div>
        <div className="pd__skeleton-main pd__shimmer" />
      </div>
      <div className="pd__skeleton-info">
        <div className="pd__shimmer pd__skeleton-line pd__skeleton-line--sm" />
        <div className="pd__shimmer pd__skeleton-line pd__skeleton-line--lg" />
        <div className="pd__shimmer pd__skeleton-line pd__skeleton-line--md" />
        <div className="pd__shimmer pd__skeleton-line pd__skeleton-line--price" />
        <div className="pd__shimmer pd__skeleton-swatches" />
        <div className="pd__shimmer pd__skeleton-sizes" />
        <div className="pd__shimmer pd__skeleton-btn" />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { addItem, openCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // ── Data state ──
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Gallery state ──
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // ── Variant state ──
  const [selectedColour, setSelectedColour] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // ── ATC feedback ──
  const [atcState, setAtcState] = useState('idle') // idle | adding | added

  // ── Sticky ATC bar visibility ──
  const [stickyVisible, setStickyVisible] = useState(false)
  const atcRef = useRef(null)

  // ── Review state ──
  const [reviews, setReviews] = useState([])
  const [reviewCount, setReviewCount] = useState(0)
  const [reviewAverage, setReviewAverage] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [eligibility, setEligibility] = useState({ eligible: false, orderItemId: null, alreadyReviewed: false })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState('')
  const [formComment, setFormComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // ── Fetch product ──
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setActiveImageIdx(0)
      setImageLoaded(false)
      setSelectedColour(null)
      setSelectedSize(null)
      setQuantity(1)
      setAtcState('idle')

      try {
        const res = await productService.getBySlug(slug)
        if (cancelled) return
        const { product: p, related: r } = res.data
        setProduct(p)
        setRelated(r || [])

        const variants = p.product_variants || []
        const firstAvailable = variants.find(v => v.stock > 0)
        if (firstAvailable) {
          setSelectedColour(firstAvailable.colour)
        } else if (variants.length > 0) {
          setSelectedColour(variants[0].colour)
        }
      } catch (err) {
        console.error('ProductDetail fetch error:', err)
        if (!cancelled) setError('This product could not be loaded.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    

    load()
    return () => { cancelled = true }
  }, [slug])

  // ── Sticky ATC bar: show when main ATC scrolls out of view ──
  useEffect(() => {
    if (!atcRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    observer.observe(atcRef.current)
    return () => observer.disconnect()
  }, [product]) // re-attach after product loads


  useEffect(() => {
    if (!product?.id) return
    let cancelled = false

    async function loadReviews() {
      setReviewsLoading(true)
      try {
        const res = await reviewService.getProductReviews(product.id)
        if (cancelled) return
        setReviews(res.data.reviews)
        setReviewCount(res.data.count)
        setReviewAverage(res.data.average)
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }

    loadReviews()
    return () => { cancelled = true }
  }, [product?.id])

  useEffect(() => {
    if (!product?.id || !isAuthenticated) return
    let cancelled = false

    async function loadEligibility() {
      try {
        const res = await reviewService.getEligibility(product.id)
        if (!cancelled) setEligibility(res.data)
      } catch (err) {
        console.error('Failed to check review eligibility:', err)
      }
    }

    loadEligibility()
    return () => { cancelled = true }
  }, [product?.id, isAuthenticated])

  // ── Derived data ──
  const variants = product?.product_variants || []
  const images = product?.product_images || []

  const colours = [...new Map(variants.map(v => [v.colour, v])).values()]

  const sizesForColour = selectedColour
    ? [...new Set(
      variants
        .filter(v => v.colour === selectedColour)
        .map(v => v.size)
        .filter(Boolean)
    )]
    : [...new Set(variants.map(v => v.size).filter(Boolean))]

  const allSizes = [...new Set(variants.map(v => v.size).filter(Boolean))]

  function isSizeInStock(size) {
    return variants.some(
      v => v.colour === selectedColour && v.size === size && v.stock > 0
    )
  }

  const selectedVariant = selectedColour && selectedSize
    ? variants.find(v => v.colour === selectedColour && v.size === selectedSize)
    : null

  const selectedVariantInStock = selectedVariant ? selectedVariant.stock > 0 : false
  const anyInStock = variants.some(v => v.stock > 0)

  const price = product?.sale_price || product?.base_price
  const originalPrice = product?.sale_price ? product?.base_price : null
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  const primaryImage =
    images.find(i => i.is_primary)?.url ||
    images[0]?.url ||
    null

  const wishlisted = product ? isInWishlist(product.id) : false
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length
    return { star, count, pct: reviewCount ? Math.round((count / reviewCount) * 100) : 0 }
  })

  function getInitials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const atcDisabled = !selectedVariant || !selectedVariantInStock || !anyInStock || atcState !== 'idle'

  // ── Handlers ──
  const handleColourSelect = useCallback((colour) => {
    setSelectedColour(colour)
    setSelectedSize(null)
  }, [])

  const handleSizeSelect = useCallback((size) => {
    if (!isSizeInStock(size)) return
    setSelectedSize(prev => prev === size ? null : size)
  }, [selectedColour, variants])

  const handleQuantityChange = useCallback((delta) => {
    setQuantity(prev => {
      const max = selectedVariant?.stock || 10
      return Math.max(1, Math.min(max, prev + delta))
    })
  }, [selectedVariant])

  const handleWishlist = useCallback(() => {
    if (product) toggleItem(product)
  }, [product, toggleItem])

  const handleAddToCart = useCallback(() => {
    if (atcDisabled) return
    setAtcState('adding')
    setTimeout(() => {
      addItem(product, selectedVariant, quantity, primaryImage)
      setAtcState('added')
      setTimeout(() => {
        setAtcState('idle')
        openCart()
      }, 1000)
    }, 300)
  }, [atcDisabled, product, selectedVariant, quantity, primaryImage, addItem, openCart])

  const handleImageSelect = useCallback((idx) => {
    if (idx === activeImageIdx) return
    setImageLoaded(false)
    setActiveImageIdx(idx)
  }, [activeImageIdx])

  const handleSubmitReview = useCallback(async () => {
    if (!formRating) {
      setSubmitError('Please select a rating.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await reviewService.submitReview({
        productId: product.id,
        orderItemId: eligibility.orderItemId,
        rating: formRating,
        title: formTitle,
        comment: formComment,
      })
      setSubmitSuccess(true)
      setShowReviewForm(false)
      setEligibility(prev => ({ ...prev, eligible: false, alreadyReviewed: true }))
      const res = await reviewService.getProductReviews(product.id)
      setReviews(res.data.reviews)
      setReviewCount(res.data.count)
      setReviewAverage(res.data.average)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }, [product, eligibility, formRating, formTitle, formComment])

  // ── Lightbox keyboard ──
  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setActiveImageIdx(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setActiveImageIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, images.length])

  // ── Scroll lock for lightbox ──
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  // ── ATC button label ──
  function atcLabel() {
    if (atcState === 'added') return <><FontAwesomeIcon icon={faCircleCheck} /> Added to Cart</>
    if (atcState === 'adding') return <span className="pd__atc-spinner" />
    if (!anyInStock) return 'Out of Stock'
    if (!selectedSize) return 'Select a Size'
    return 'Add to Cart'
  }

  // ── Render states ──
  if (loading) {
    return (
      <div className="pd__page">
        <div className="pd__container">
          <ProductDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pd__page">
        <div className="pd__container">
          <div className="pd__error">
            <p className="pd__error-msg">{error || 'Product not found.'}</p>
            <button className="pd__error-back" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeImage = images[activeImageIdx]

  return (
    <div className="pd__page">
      <div className="pd__container">

        {/* ── Breadcrumb ── */}
        <nav className="pd__breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="pd__breadcrumb-link">Home</Link>
          <FontAwesomeIcon icon={faChevronRight} className="pd__breadcrumb-sep" />
          {product.categories?.name && (
            <>
              <Link
                to={`/products?category=${product.category_id}`}
                className="pd__breadcrumb-link"
              >
                {product.categories.name}
              </Link>
              <FontAwesomeIcon icon={faChevronRight} className="pd__breadcrumb-sep" />
            </>
          )}
          <span className="pd__breadcrumb-current">{product.name}</span>
        </nav>

        {/* ── Main layout ── */}
        <div className="pd__layout">

          {/* ── Gallery ── */}
          <div className="pd__gallery">
            {/* Thumbnail strip — always rendered for layout consistency */}
            <div className="pd__thumbs" role="list" aria-label="Product images">
              {images.length > 0
                ? images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    className={`pd__thumb ${idx === activeImageIdx ? 'pd__thumb--active' : ''}`}
                    onClick={() => handleImageSelect(idx)}
                    aria-label={`View image ${idx + 1}`}
                    role="listitem"
                  >
                    <img src={img.url} alt="" loading="lazy" />
                  </button>
                ))
                : [...Array(3)].map((_, i) => (
                  <div key={i} className="pd__thumb pd__thumb--ghost" />
                ))
              }
            </div>

            {/* Main image */}
            <div className="pd__main-img-wrap">
              {activeImage ? (
                <>
                  <img
                    key={activeImageIdx}
                    src={activeImage.url}
                    alt={product.name}
                    className={`pd__main-img ${imageLoaded ? 'pd__main-img--loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <button
                    className="pd__expand"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Expand image"
                  >
                    <FontAwesomeIcon icon={faExpand} />
                    <span>Zoom</span>
                  </button>
                </>
              ) : (
                <div className="pd__img-fallback">
                  <span>No image available</span>
                </div>
              )}

              <div className="pd__img-badges">
                {discount && (
                  <span className="pd__badge pd__badge--sale">−{discount}%</span>
                )}
                {!anyInStock && (
                  <span className="pd__badge pd__badge--oos">Sold Out</span>
                )}
              </div>

              {/* Image counter dot nav */}
              {images.length > 1 && (
                <div className="pd__img-dots">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`pd__img-dot ${idx === activeImageIdx ? 'pd__img-dot--active' : ''}`}
                      onClick={() => handleImageSelect(idx)}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="pd__info">

            {/* Category + wishlist row */}
            <div className="pd__info-top">
              {product.categories?.name && (
                <Link
                  to={`/products?category=${product.category_id}`}
                  className="pd__category-label"
                >
                  {product.categories.name}
                </Link>
              )}
              <button
                className={`pd__wishlist-icon ${wishlisted ? 'pd__wishlist-icon--active' : ''}`}
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <FontAwesomeIcon icon={wishlisted ? faHeart : faHeartReg} />
              </button>
            </div>

            {/* Product name */}
            <h1 className="pd__name">{product.name}</h1>

            {/* Price row */}
            <div className="pd__price-row">
              <span className="pd__price">₹{price?.toLocaleString('en-IN')}</span>
              {originalPrice && (
                <span className="pd__price-original">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount && (
                <span className="pd__price-badge">
                  <FontAwesomeIcon icon={faTag} />
                  {discount}% off
                </span>
              )}
            </div>
            <p className="pd__tax-note">Inclusive of all taxes · Free delivery above ₹999</p>

            <div className="pd__divider" />

            {/* ── Colour picker ── */}
            {colours.length > 0 && (
              <div className="pd__section">
                <div className="pd__section-label">
                  <span>Colour</span>
                  {selectedColour && (
                    <span className="pd__section-value">{selectedColour}</span>
                  )}
                </div>
                <div className="pd__colours">
                  {colours.map((v) => {
                    const hasStock = variants.some(
                      vv => vv.colour === v.colour && vv.stock > 0
                    )
                    return (
                      <button
                        key={v.id}
                        className={`pd__colour-swatch ${selectedColour === v.colour ? 'pd__colour-swatch--active' : ''} ${!hasStock ? 'pd__colour-swatch--oos' : ''}`}
                        style={{ background: v.colour_hex || colourToHex(v.colour) }}
                        onClick={() => handleColourSelect(v.colour)}
                        title={v.colour + (!hasStock ? ' (out of stock)' : '')}
                        aria-label={v.colour + (!hasStock ? ', out of stock' : '')}
                        aria-pressed={selectedColour === v.colour}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Size picker ── */}
            {allSizes.length > 0 && (
              <div className="pd__section pd__section--size">
                <div className="pd__section-label">
                  <span>Size</span>
                  {selectedSize && (
                    <span className="pd__section-value">{selectedSize}</span>
                  )}
                </div>
                <div className="pd__sizes">
                  {allSizes.map((size) => {
                    const available = sizesForColour.includes(size)
                    const inStock = available && isSizeInStock(size)
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        className={`pd__size-btn
                          ${isSelected ? 'pd__size-btn--active' : ''}
                          ${!inStock ? 'pd__size-btn--oos' : ''}
                          ${!available ? 'pd__size-btn--na' : ''}
                        `}
                        onClick={() => inStock && handleSizeSelect(size)}
                        disabled={!inStock}
                        aria-pressed={isSelected}
                        aria-label={`Size ${size}${!inStock ? ', out of stock' : ''}`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {!selectedSize && anyInStock && (
                  <p className="pd__size-hint">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* ── Stock warning — directly under size picker ── */}
            {selectedVariant && selectedVariantInStock && selectedVariant.stock <= 5 && (
              <p className="pd__stock-warn">
                <span className="pd__stock-warn-dot" />
                Only {selectedVariant.stock} left in this size
              </p>
            )}

            <div className="pd__divider" />

            {/* ── Quantity + ATC ── */}
            <div className="pd__atc-row" ref={atcRef}>
              <div className="pd__qty">
                <button
                  className="pd__qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="pd__qty-val">{quantity}</span>
                <button
                  className="pd__qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedVariant?.stock || 10)}
                  aria-label="Increase quantity"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              <button
                className={`pd__atc-btn
                  ${atcState === 'added' ? 'pd__atc-btn--added' : ''}
                  ${atcDisabled && atcState === 'idle' ? 'pd__atc-btn--disabled' : ''}
                `}
                onClick={handleAddToCart}
                disabled={atcDisabled}
                aria-label="Add to cart"
              >
                {atcLabel()}
              </button>
            </div>

            {/* Wishlist full button */}
            <button
              className={`pd__wishlist-btn ${wishlisted ? 'pd__wishlist-btn--active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <FontAwesomeIcon icon={wishlisted ? faHeart : faHeartReg} />
              {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            <div className="pd__divider" />

            {/* ── Trust strip ── */}
            <div className="pd__trust">
              <div className="pd__trust-item">
                <FontAwesomeIcon icon={faTruck} className="pd__trust-icon" />
                <span>Free Delivery over ₹999</span>
              </div>
              <div className="pd__trust-item">
                <FontAwesomeIcon icon={faRotateLeft} className="pd__trust-icon" />
                <span>15-day Returns</span>
              </div>
              <div className="pd__trust-item">
                <FontAwesomeIcon icon={faLeaf} className="pd__trust-icon" />
                <span>Natural Fibres</span>
              </div>
              <div className="pd__trust-item">
                <FontAwesomeIcon icon={faLock} className="pd__trust-icon" />
                <span>Secure Checkout</span>
              </div>
            </div>

            <div className="pd__divider" />

            {/* ── Accordion ── */}
            <ProductAccordion product={product} />

          </div>
        </div>

        <section className="pd__reviews">
          <div className="pd__reviews-top">
            <h2 className="pd__reviews-title">Reviews</h2>

            {reviewCount > 0 && (
              <div className="pd__reviews-summary">
                <div className="pd__reviews-summary-score">
                  <span className="pd__reviews-avg-num">{reviewAverage}</span>
                  <div className="pd__reviews-stars-lg">
                    {[1, 2, 3, 4, 5].map(n => (
                      <FontAwesomeIcon key={n} icon={n <= formRating ? faStar : faStarOutline} className={n <= formRating ? 'pd__star--filled' : 'pd__star--empty'} />
                    ))}
                  </div>
                  <span className="pd__reviews-count-label">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="pd__reviews-breakdown">
                  {ratingBreakdown.map(({ star, count, pct }) => (
                    <div className="pd__breakdown-row" key={star}>
                      <span className="pd__breakdown-label">{star}</span>
                      <FontAwesomeIcon icon={faStar} className="pd__breakdown-star" />
                      <div className="pd__breakdown-track">
                        <div className="pd__breakdown-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pd__breakdown-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pd__reviews-actions">
            {isAuthenticated && eligibility.eligible && !showReviewForm && (
              <button className="pd__review-cta" onClick={() => setShowReviewForm(true)}>
                <FontAwesomeIcon icon={faStar} />
                Write a Review
              </button>
            )}

            {isAuthenticated && eligibility.alreadyReviewed && (
              <p className="pd__review-note">
                <FontAwesomeIcon icon={faCircleCheck} />
                You've already reviewed this product
              </p>
            )}

            {submitSuccess && (
              <p className="pd__review-thanks">
                <FontAwesomeIcon icon={faCircleCheck} />
                Thanks — your review is now live
              </p>
            )}
          </div>

          {showReviewForm && (
            <div className="pd__review-form">
              <p className="pd__review-form-label">Your Rating</p>
              <div className="pd__review-form-stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setFormRating(n)} aria-label={`Rate ${n} stars`}>
                    <FontAwesomeIcon icon={faStar} className={n <= formRating ? 'pd__star--filled' : 'pd__star--empty'} />
                  </button>
                ))}
              </div>
              <input
                className="pd__review-input"
                type="text"
                placeholder="Give your review a title"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                maxLength={100}
              />
              <textarea
                className="pd__review-textarea"
                placeholder="Tell others what you thought — fit, fabric, quality..."
                value={formComment}
                onChange={e => setFormComment(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              {submitError && <p className="pd__review-error">{submitError}</p>}
              <div className="pd__review-form-actions">
                <button className="pd__review-cancel" onClick={() => setShowReviewForm(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="pd__review-submit" onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          <div className="pd__divider" />

          {reviewsLoading ? (
            <p className="pd__reviews-loading">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <div className="pd__reviews-empty">
              <FontAwesomeIcon icon={faStar} className="pd__reviews-empty-icon" />
              <p>No reviews yet — be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="pd__reviews-list">
              {reviews.map((r, i) => (
                <div key={r.id} className="pd__review-item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="pd__review-item-avatar">{getInitials(r.reviewer_name)}</div>
                  <div className="pd__review-item-body">
                    <div className="pd__review-item-header">
                      <span className="pd__review-item-author">{r.reviewer_name}</span>
                      <span className="pd__review-item-verified">
                        <FontAwesomeIcon icon={faCircleCheck} /> Verified Purchase
                      </span>
                    </div>
                    <div className="pd__review-item-stars">
                      {[1, 2, 3, 4, 5].map(n => (
                        <FontAwesomeIcon key={n} icon={n <= formRating ? faStar : faStarOutline} className={n <= formRating ? 'pd__star--filled' : 'pd__star--empty'} />
                      ))}
                      <span className="pd__review-item-date">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {r.title && <p className="pd__review-item-title">{r.title}</p>}
                    {r.comment && <p className="pd__review-item-comment">{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="pd__related">
            <div className="pd__related-header">
              <h2 className="pd__related-title">You May Also Like</h2>
              {product.categories?.name && (
                <Link
                  to={`/products?category=${product.category_id}`}
                  className="pd__related-link"
                >
                  View all {product.categories.name}
                  <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              )}
            </div>
            <ProductGrid products={related} loading={false} />
          </section>
        )}
      </div>

      {/* ── Sticky ATC bar ── */}


      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="pd__lightbox"
          onClick={(e) => e.target === e.currentTarget && setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            className="pd__lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image viewer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <div className="pd__lightbox-content">
            {images[activeImageIdx] && (
              <img
                src={images[activeImageIdx].url}
                alt={product.name}
                className="pd__lightbox-img"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="pd__lightbox-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd__lightbox-thumb ${idx === activeImageIdx ? 'pd__lightbox-thumb--active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="pd__lightbox-counter">
            {activeImageIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`pd__acc-item ${open ? 'pd__acc-item--open' : ''}`}>
      <button
        className="pd__acc-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`pd__acc-chevron ${open ? 'pd__acc-chevron--open' : ''}`}
        />
      </button>
      <div className="pd__acc-body">
        <div className="pd__acc-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

function ProductAccordion({ product }) {
  const variants = product.product_variants || []
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))]

  return (
    <div className="pd__accordion">
      {product.description && (
        <AccordionItem title="Product Details" defaultOpen={true}>
          <p className="pd__acc-desc">{product.description}</p>
        </AccordionItem>
      )}
      {product.material && (
        <AccordionItem title="Material & Care">
          <p className="pd__acc-desc">{product.material}</p>
        </AccordionItem>
      )}
      {sizes.length > 0 && (
        <AccordionItem title="Size Guide">
          <div className="pd__size-guide">
            <p className="pd__acc-desc">
              Our garments are cut for a relaxed, conscious fit. Between sizes? Size up.
            </p>
            <table className="pd__size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(size => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>{sizeChart[size]?.chest || '—'}</td>
                    <td>{sizeChart[size]?.waist || '—'}</td>
                    <td>{sizeChart[size]?.hip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>
      )}
      <AccordionItem title="Shipping & Returns">
        <ul className="pd__acc-list">
          <li>Free delivery on orders above ₹999</li>
          <li>Standard delivery: 4–7 business days</li>
          <li>Express delivery: 1–2 business days (₹149)</li>
          <li>Easy 15-day returns for unworn, unwashed items</li>
          <li>Exchange available for size/colour within 30 days</li>
        </ul>
      </AccordionItem>
    </div>
  )
}

const sizeChart = {
  XS: { chest: '32–33', waist: '24–25', hip: '34–35' },
  S: { chest: '34–35', waist: '26–27', hip: '36–37' },
  M: { chest: '36–37', waist: '28–29', hip: '38–39' },
  L: { chest: '38–40', waist: '30–32', hip: '40–42' },
  XL: { chest: '41–43', waist: '33–35', hip: '43–45' },
  XXL: { chest: '44–46', waist: '36–38', hip: '46–48' },
}