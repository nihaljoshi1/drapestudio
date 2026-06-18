import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import './FeaturedProducts.css'

const FALLBACK_PRODUCTS = [
  {
    id: '1', name: 'Classic White Tee', slug: 'classic-white-tee',
    base_price: 999, sale_price: 799, tag: 'Best Seller',
    product_images: [{ url: 'https://sugandh.co/cdn/shop/files/PeachMistCo-ordSet_1_1024x1024.webp?v=1750998799', is_primary: true }],
    product_variants: [{ size: 'XS', stock: 5 }, { size: 'S', stock: 3 }, { size: 'M', stock: 8 }, { size: 'L', stock: 2 }],
    categories: { name: 'T-Shirts' },
  },
  {
    id: '2', name: 'Linen Slip Dress', slug: 'linen-slip-dress',
    base_price: 2499, sale_price: null, tag: 'New',
    product_images: [{ url: 'https://sugandh.co/cdn/shop/files/PeachMistCo-ordSet_1_1024x1024.webp?v=1750998799', is_primary: true }],
    product_variants: [{ size: 'XS', stock: 2 }, { size: 'S', stock: 6 }, { size: 'M', stock: 4 }],
    categories: { name: 'Dresses' },
  },
  {
    id: '3', name: 'Oversized Blazer', slug: 'oversized-blazer',
    base_price: 3999, sale_price: 3199, tag: 'Trending',
    product_images: [{ url: 'https://sugandh.co/cdn/shop/files/PeachMistCo-ordSet_1_1024x1024.webp?v=1750998799', is_primary: true }],
    product_variants: [{ size: 'S', stock: 1 }, { size: 'M', stock: 5 }, { size: 'L', stock: 3 }, { size: 'XL', stock: 7 }],
    categories: { name: 'Outerwear' },
  },
  {
    id: '4', name: 'Floral Co-Ord Set', slug: 'floral-coord-set',
    base_price: 2999, sale_price: null, tag: 'New',
    product_images: [{ url: 'https://sugandh.co/cdn/shop/files/PeachMistCo-ordSet_1_1024x1024.webp?v=1750998799', is_primary: true }],
    product_variants: [{ size: 'XS', stock: 3 }, { size: 'S', stock: 5 }, { size: 'M', stock: 0 }],
    categories: { name: 'Co-Ord Sets' },
  },
  {
    id: '5', name: 'Minimal Knit Top', slug: 'minimal-knit-top',
    base_price: 1499, sale_price: 1199, tag: null,
    product_images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=720&q=90&fit=crop&crop=top', is_primary: true }],
    product_variants: [{ size: 'XS', stock: 2 }, { size: 'S', stock: 4 }, { size: 'M', stock: 6 }, { size: 'L', stock: 1 }],
    categories: { name: 'Tops' },
  },
  {
    id: '6', name: 'Wide Leg Trousers', slug: 'wide-leg-trousers',
    base_price: 2199, sale_price: null, tag: 'Best Seller',
    product_images: [{ url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=720&q=90&fit=crop&crop=top', is_primary: true }],
    product_variants: [{ size: 'S', stock: 3 }, { size: 'M', stock: 5 }, { size: 'L', stock: 2 }],
    categories: { name: 'Bottoms' },
  },
]

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Best Sellers', value: 'best-seller' },
  { label: 'On Sale', value: 'sale' },
]

export default function FeaturedProducts() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [activeTab, setActiveTab] = useState('all')
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)
  const { addItem, toggleCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()

  useEffect(() => {
    productService.getProducts({ limit: 6 })
      .then(res => {
        const p = res.data?.products
        if (p?.length > 0) setProducts(p)
      }).catch(() => { })
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const filtered = products.filter(p => {
    if (activeTab === 'all') return true
    if (activeTab === 'new') return p.tag === 'New'
    if (activeTab === 'best-seller') return p.tag === 'Best Seller'
    if (activeTab === 'sale') return !!p.sale_price
    return true
  })

  const handleCart = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    const v = product.product_variants?.find(v => (v.stock ?? 1) > 0)
    if (!v) return
    addItem(product, v, 1)
    toggleCart()
  }

  const handleWish = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    toggleItem(product)
  }

  const disc = (b, s) => s ? Math.round(((b - s) / b) * 100) : null

  return (
    <section className="fp" ref={sectionRef}>

      {/* ── Aesthetic background ── */}
      <div className="fp__bg" aria-hidden="true">
        <div className="fp__bg-top" />
        <div className="fp__bg-blob fp__bg-blob--a" />
        <div className="fp__bg-blob fp__bg-blob--b" />
        <div className="fp__bg-texture" />
      </div>

      <div className="fp__wrap">

        {/* ── Header ── */}
        <div className={`fp__hd ${visible ? 'fp__hd--in' : ''}`}>
          <div className="fp__hd-left">
            <p className="fp__kicker">
              <svg width="20" height="1" viewBox="0 0 20 1"><line x1="0" y1="0.5" x2="20" y2="0.5" stroke="#C9A96E" strokeWidth="1.5" /></svg>
              Featured Collection
            </p>
            <h2 className="fp__headline">
              Picked <em>For You</em>
            </h2>
          </div>

          <div className="fp__tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.value}
                role="tab"
                aria-selected={activeTab === t.value}
                className={`fp__tab ${activeTab === t.value ? 'fp__tab--on' : ''}`}
                onClick={() => setActiveTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="fp__grid">
          {(filtered.length > 0 ? filtered : products).slice(0, 6).map((p, i) => {
            const img = p.product_images?.find(x => x.is_primary)?.url || p.product_images?.[0]?.url
            const wished = isInWishlist(p.id)
            const off = disc(p.base_price, p.sale_price)
            const sizes = [...new Set(p.product_variants?.map(v => v.size) || [])]
            const hasStock = p.product_variants?.some(v => (v.stock ?? 1) > 0)

            return (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className={`fp-card ${visible ? 'fp-card--in' : ''}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {/* ── Image ── */}
                <div className="fp-card__media">
                  <img
                    src={img}
                    alt={p.name}
                    className="fp-card__img"
                    loading={i < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                  />

                  {/* Gradient for bottom legibility */}
                  <div className="fp-card__media-grad" />

                  {/* Tags top-left */}
                  <div className="fp-card__badges">
                    {p.tag === 'New' && <span className="fp-badge fp-badge--new">New</span>}
                    {p.tag === 'Trending' && <span className="fp-badge fp-badge--trend">Trending</span>}
                    {p.tag === 'Best Seller' && <span className="fp-badge fp-badge--best">★ Best Seller</span>}
                    {off && <span className="fp-badge fp-badge--sale">{off}% off</span>}
                    {!hasStock && <span className="fp-badge fp-badge--oos">Sold Out</span>}
                  </div>

                  {/* Wishlist top-right */}
                  <button
                    className={`fp-card__wish ${wished ? 'fp-card__wish--on' : ''}`}
                    onClick={e => handleWish(e, p)}
                    aria-label="Wishlist"
                  >
                    <svg viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <path d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />
                    </svg>
                  </button>

                  {/* Quick add — slides up on hover */}
                  {hasStock && (
                    <div className="fp-card__quick">
                      <div className="fp-card__quick-sizes">
                        {sizes.slice(0, 4).map(s => (
                          <button
                            key={s}
                            className="fp-card__qs"
                            onClick={e => {
                              e.preventDefault(); e.stopPropagation()
                              const v = p.product_variants?.find(v => v.size === s && (v.stock ?? 1) > 0)
                              if (v) { addItem(p, v, 1); toggleCart() }
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button className="fp-card__atc" onClick={e => handleCart(e, p)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Add to Bag
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Info ── */}
                <div className="fp-card__info">
                  <div className="fp-card__info-top">
                    <span className="fp-card__cat">{p.categories?.name}</span>
                    <div className="fp-card__price">
                      {p.sale_price
                        ? <>
                          <span className="fp-card__price-now">₹{p.sale_price.toLocaleString()}</span>
                          <span className="fp-card__price-was">₹{p.base_price.toLocaleString()}</span>
                        </>
                        : <span className="fp-card__price-now">₹{p.base_price.toLocaleString()}</span>
                      }
                    </div>
                  </div>
                  <h3 className="fp-card__name">{p.name}</h3>
                </div>

              </Link>
            )
          })}
        </div>

        {/* ── Footer CTA ── */}
        <div className={`fp__foot ${visible ? 'fp__foot--in' : ''}`}>
          <Link to="/products" className="fp__view-all">
            <span className="fp__view-all-text">View All Products</span>
            <span className="fp__view-all-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
          <span className="fp__shipping-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="1.5" />
              <circle cx="18.5" cy="18.5" r="1.5" />
            </svg>
            Free shipping on orders above ₹999
          </span>
        </div>

      </div>
    </section>
  )
}