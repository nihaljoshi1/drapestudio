import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { productService } from '../../services/productService'
import './Navbar.css'

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getCount, toggleCart }          = useCartStore()
  const { getCount: getWishlistCount }    = useWishlistStore()

  const [scrolled,       setScrolled]       = useState(false)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [searching,      setSearching]      = useState(false)
  const [accountOpen,    setAccountOpen]    = useState(false)
  const [megaOpen,       setMegaOpen]       = useState(false)
  const [categories,     setCategories]     = useState([])

  const searchRef   = useRef(null)
  const accountRef  = useRef(null)
  const megaRef     = useRef(null)
  const searchTimer = useRef(null)
  const megaTimer   = useRef(null)

  const cartCount     = getCount()
  const wishlistCount = getWishlistCount()

  // ── Scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Close everything on route change ──
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setAccountOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

  // ── Account dropdown outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch categories for mega menu (once) ──
  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
  }, [])

  // ── Search debounce ──
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    clearTimeout(searchTimer.current)
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await productService.searchProducts(searchQuery)
        setSearchResults(res.data?.products || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [searchQuery])

  // ── Search open: focus + clear ──
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 150)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [searchOpen])

  // ── Single body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = (searchOpen || menuOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Mega menu: delay close so mouse can move into it
  function handleMegaEnter() {
    clearTimeout(megaTimer.current)
    setMegaOpen(true)
  }
  function handleMegaLeave() {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 120)
  }

  const currentPath = `${location.pathname}${location.search}`
  const isActive = (href) => {
    if (!href.includes('?')) return location.pathname === href
    return currentPath === href
  }

  // Category icons (emoji fallback — swap for real images if you add them to DB)
  const categoryMeta = {
    'T-Shirts':   { emoji: '👕', desc: 'Everyday essentials' },
    'Dresses':    { emoji: '👗', desc: 'Effortless silhouettes' },
    'Outerwear':  { emoji: '🧥', desc: 'Layer with intent' },
    'Co-Ord Sets':{ emoji: '✨', desc: 'Coordinated looks' },
    'Tops':       { emoji: '🎽', desc: 'Studio to street' },
    'Bottoms':    { emoji: '👖', desc: 'Grounded in craft' },
  }

  return (
    <>
      <header className={`nb ${scrolled ? 'nb--scrolled' : ''}`}>
        <div className="nb__wrap">

          {/* ── Logo ── */}
          <Link to="/" className="nb__logo">
            <div className="nb__logo-text">
              <span className="nb__logo-name">DRAPE</span>
              <span className="nb__logo-sub">STUDIO</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="nb__nav">
            {/* Collections — with mega menu */}
            <div
              className="nb__mega-wrap"
              ref={megaRef}
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <Link
                to="/products"
                className={`nb__link nb__link--mega ${isActive('/products') ? 'nb__link--active' : ''}`}
              >
                Collections
                <span className={`nb__mega-caret ${megaOpen ? 'nb__mega-caret--open' : ''}`}>
                  <IconChevron size={10} />
                </span>
              </Link>

              {/* Mega menu panel */}
              <div className={`nb__mega ${megaOpen ? 'nb__mega--open' : ''}`}>
                <div className="nb__mega-inner">
                  <div className="nb__mega-cats">
                    <p className="nb__mega-heading">Shop by Category</p>
                    <div className="nb__mega-grid">
                      {categories.map((cat, i) => {
                        const meta = categoryMeta[cat.name] || { emoji: '🛍️', desc: 'Explore the collection' }
                        return (
                          <Link
                            key={cat.id}
                            to={`/products?category=${cat.id}`}
                            className="nb__mega-item"
                            style={{ animationDelay: megaOpen ? `${i * 40}ms` : '0ms' }}
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="nb__mega-item-emoji">{meta.emoji}</span>
                            <div className="nb__mega-item-text">
                              <span className="nb__mega-item-name">{cat.name}</span>
                              <span className="nb__mega-item-desc">{meta.desc}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  <div className="nb__mega-featured">
                    <p className="nb__mega-heading">Quick Links</p>
                    <div className="nb__mega-links">
                      <Link to="/products?sort=newest" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-dot nb__mega-qlink-dot--new" />
                        New Arrivals
                      </Link>
                      <Link to="/products?sale=true" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-dot nb__mega-qlink-dot--sale" />
                        On Sale
                      </Link>
                      <Link to="/products?available=true" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-dot nb__mega-qlink-dot--stock" />
                        In Stock
                      </Link>
                    </div>
                    <Link
                      to="/products"
                      className="nb__mega-all"
                      onClick={() => setMegaOpen(false)}
                    >
                      View all collections →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/products?sort=newest" className={`nb__link ${isActive('/products?sort=newest') ? 'nb__link--active' : ''}`}>
              New Arrivals
            </Link>
            <Link to="/products?sale=true" className={`nb__link ${isActive('/products?sale=true') ? 'nb__link--active' : ''}`}>
              Sale
            </Link>
            <Link to="/about" className={`nb__link ${isActive('/about') ? 'nb__link--active' : ''}`}>
              About
            </Link>
          </nav>

          {/* ── Icons ── */}
          <div className="nb__icons">
            {/* Search */}
            <div className="nb__search-wrap">
              <div className={`nb__search-inline ${searchOpen ? 'nb__search-inline--open' : ''}`}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="nb__search-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchOpen(false)
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
                      setSearchOpen(false)
                    }
                  }}
                />
                {searchQuery && (
                  <button className="nb__search-clear" onClick={() => setSearchQuery('')} aria-label="Clear">
                    <IconClose size={14} />
                  </button>
                )}
              </div>

              <button
                className={`nb__icon-btn nb__search-btn ${searchOpen ? 'nb__search-btn--active' : ''}`}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? 'Close search' : 'Search'}
              >
                {searchOpen ? <IconClose size={18} /> : <IconSearch size={18} />}
              </button>

              {searchOpen && (searchQuery.length >= 2 || searching) && (
                <div className="nb__search-results">
                  {searching && (
                    <div className="nb__search-hint">
                      <span className="srch-dot-loader"><span /><span /><span /></span>
                      Searching...
                    </div>
                  )}
                  {!searching && searchResults.length > 0 && (
                    <div className="nb__search-list">
                      {searchResults.map((product) => {
                        const image = product.product_images?.find(i => i.is_primary)?.url
                          || product.product_images?.[0]?.url
                        return (
                          <button
                            key={product.id}
                            className="nb__search-item"
                            onClick={() => { navigate(`/products/${product.slug}`); setSearchOpen(false) }}
                          >
                            <div className="nb__search-item-img">
                              {image ? <img src={image} alt={product.name} /> : <IconBag />}
                            </div>
                            <div className="nb__search-item-info">
                              <p className="nb__search-item-name">{product.name}</p>
                              <p className="nb__search-item-cat">{product.categories?.name}</p>
                            </div>
                            <p className="nb__search-item-price">
                              ₹{(product.sale_price || product.base_price).toLocaleString('en-IN')}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <p className="nb__search-hint">No results for "<strong>{searchQuery}</strong>"</p>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/account" className="nb__icon-btn nb__icon-btn--hide-mobile" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />
              </svg>
              {wishlistCount > 0 && <span className="nb__badge">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <button className="nb__icon-btn" onClick={toggleCart} aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 7.5h9l-1.5 8.5H9L7.5 7.5z" />
                <path d="M5 5h1.5l1 2.5" />
                <circle cx="10" cy="19" r="1" fill="currentColor" stroke="none" />
                <circle cx="16" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
              {cartCount > 0 && <span className="nb__badge">{cartCount > 9 ? '9+' : cartCount}</span>}
            </button>

            {/* Account */}
            <div className="nb__account nb__icon-btn--hide-mobile" ref={accountRef}>
              <button className="nb__icon-btn" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account">
                {isAuthenticated ? (
                  <div className="nb__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                )}
              </button>
              {accountOpen && (
                <div className="nb__dropdown">
                  {isAuthenticated ? (
                    <>
                      <div className="nb__dropdown-head">
                        <p className="nb__dropdown-greeting">Hello, {user?.name?.split(' ')[0]} 👋</p>
                        <p className="nb__dropdown-email">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="nb__dropdown-item nb__dropdown-item--admin">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Link to="/account" className="nb__dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M9 12h6M9 8h6M7 16h10M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /></svg>
                        My Orders
                      </Link>
                      <Link to="/account" className="nb__dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                        Profile
                      </Link>
                      <div className="nb__dropdown-divider" />
                      <button onClick={handleLogout} className="nb__dropdown-item nb__dropdown-item--danger">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="nb__dropdown-head">
                        <p className="nb__dropdown-greeting">Welcome back</p>
                        <p className="nb__dropdown-email">Sign in to your account</p>
                      </div>
                      <Link to="/login" className="nb__dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                        Sign In
                      </Link>
                      <Link to="/register" className="nb__dropdown-item nb__dropdown-item--gold">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button className="nb__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span className={menuOpen ? 'open-1' : ''} />
              <span className={menuOpen ? 'open-2' : ''} />
              <span className={menuOpen ? 'open-3' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`mob-overlay ${menuOpen ? 'mob-overlay--on' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`mob-drawer ${menuOpen ? 'mob-drawer--on' : ''}`}>
        <div className="mob-drawer__top">
          <Link to="/" className="nb__logo">
            <div className="nb__logo-text">
              <span className="nb__logo-name">DRAPE</span>
              <span className="nb__logo-sub">STUDIO</span>
            </div>
          </Link>
          <button className="nb__icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close">
            <IconClose size={20} />
          </button>
        </div>

        <nav className="mob-drawer__nav">
          {/* Category links in mobile */}
          {categories.length > 0 && (
            <div className="mob-drawer__section">
              <p className="mob-drawer__section-label">Categories</p>
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="mob-drawer__link mob-drawer__link--cat"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span>{cat.name}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
          <div className="mob-drawer__section">
            <p className="mob-drawer__section-label">Explore</p>
            {[
              { label: 'New Arrivals', href: '/products?sort=newest' },
              { label: 'Sale',         href: '/products?sale=true' },
              { label: 'About',        href: '/about' },
            ].map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                className="mob-drawer__link"
                style={{ animationDelay: `${(categories.length + i) * 40}ms` }}
              >
                <span>{link.label}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </nav>

        <div className="mob-drawer__bottom">
          {isAuthenticated ? (
            <>
              <div className="mob-drawer__user">
                <div className="nb__avatar nb__avatar--lg">{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="mob-drawer__user-name">{user?.name}</p>
                  <p className="mob-drawer__user-email">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="mob-drawer__signout">Sign Out</button>
            </>
          ) : (
            <div className="mob-drawer__auth">
              <Link to="/login" className="mob-drawer__btn mob-drawer__btn--outline">Sign In</Link>
              <Link to="/register" className="mob-drawer__btn mob-drawer__btn--fill">Create Account</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile search bottom sheet ── */}
      <div className={`mob-search ${searchOpen ? 'mob-search--on' : ''}`}>
        <div className="mob-search__handle" />
        <div className="mob-search__bar">
          <IconSearch size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, styles..."
            className="mob-search__input"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchOpen(false)
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
                setSearchOpen(false)
              }
            }}
          />
          {searchQuery
            ? <button className="mob-search__clear" onClick={() => setSearchQuery('')}><IconClose size={15} /></button>
            : <button className="mob-search__close" onClick={() => setSearchOpen(false)}>Cancel</button>
          }
        </div>
        <div className="mob-search__body">
          {!searchQuery && (
            <div className="mob-search__empty">
              <div className="mob-search__empty-icon"><IconSearch size={28} /></div>
              <p className="mob-search__empty-title">Discover your style</p>
              <p className="mob-search__empty-sub">Search across all our collections</p>
              <div className="mob-search__tags">
                {categories.slice(0, 6).map(cat => (
                  <button key={cat.id} className="mob-search__tag" onClick={() => setSearchQuery(cat.name)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {searching && (
            <div className="mob-search__loading">
              <span className="srch-dot-loader"><span /><span /><span /></span>
              Searching...
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="mob-search__results">
              {searchResults.map((product) => {
                const image = product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url
                return (
                  <button key={product.id} className="mob-search__result-item"
                    onClick={() => { navigate(`/products/${product.slug}`); setSearchOpen(false) }}>
                    <div className="mob-search__result-img">
                      {image ? <img src={image} alt={product.name} /> : <IconBag />}
                    </div>
                    <div className="mob-search__result-info">
                      <p className="mob-search__result-name">{product.name}</p>
                      <p className="mob-search__result-cat">{product.categories?.name}</p>
                    </div>
                    <p className="mob-search__result-price">₹{(product.sale_price || product.base_price).toLocaleString('en-IN')}</p>
                  </button>
                )
              })}
            </div>
          )}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="mob-search__no-result">
              <p>No results for "<strong>{searchQuery}</strong>"</p>
              <p style={{ fontSize: '0.8rem', color: '#8C8880', marginTop: 6 }}>Try different keywords</p>
            </div>
          )}
        </div>
      </div>
      <div className={`mob-search-overlay ${searchOpen ? 'mob-search-overlay--on' : ''}`} onClick={() => setSearchOpen(false)} />

      <div style={{ height: '72px' }} />
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSearch({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4.5-4.5" />
    </svg>
  )
}

function IconClose({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconBag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IconChevron({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}