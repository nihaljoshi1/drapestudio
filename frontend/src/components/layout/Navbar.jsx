import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faXmark, faBagShopping, faHeart,
  faUser, faChevronDown, faChevronRight, faBars,
  faArrowRight, faShieldHalved, faRotateLeft, faTruck,
  faTag, faFire, faLayerGroup, faRightFromBracket,
  faGear, faTableCells, faBoxOpen, faUsers, faStore,
  faCircleUser, faCartShopping
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartReg, faUser as faUserReg } from '@fortawesome/free-regular-svg-icons'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { productService } from '../../services/productService'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getCount, toggleCart }          = useCartStore()
  const { getCount: getWishlistCount }    = useWishlistStore()

  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching,     setSearching]     = useState(false)
  const [accountOpen,   setAccountOpen]   = useState(false)
  const [megaOpen,      setMegaOpen]      = useState(false)
  const [categories,    setCategories]    = useState([])

  const searchRef   = useRef(null)
  const accountRef  = useRef(null)
  const megaRef     = useRef(null)
  const searchTimer = useRef(null)
  const megaTimer   = useRef(null)

  const cartCount     = getCount()
  const wishlistCount = getWishlistCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setAccountOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
  }, [])

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
      } catch { setSearchResults([]) }
      finally  { setSearching(false) }
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [searchQuery])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 150)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = (searchOpen || menuOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, menuOpen])

  const handleLogout = async () => { await logout(); navigate('/') }

  function handleMegaEnter() {
    clearTimeout(megaTimer.current)
    setMegaOpen(true)
  }
  function handleMegaLeave() {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 140)
  }

  const isActive = (href) => {
    if (!href.includes('?')) return location.pathname === href
    return `${location.pathname}${location.search}` === href
  }

  const categoryMeta = {
    'T-Shirts':    { icon: faStore,      desc: 'Everyday essentials' },
    'Dresses':     { icon: faLayerGroup, desc: 'Effortless silhouettes' },
    'Outerwear':   { icon: faShieldHalved, desc: 'Layer with intent' },
    'Co-Ord Sets': { icon: faTableCells, desc: 'Coordinated looks' },
    'Tops':        { icon: faBoxOpen,    desc: 'Studio to street' },
    'Bottoms':     { icon: faUsers,      desc: 'Grounded in craft' },
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
          <nav className="nb__nav" role="navigation" aria-label="Main navigation">

            {/* Collections + mega menu */}
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
                  <FontAwesomeIcon icon={faChevronDown} />
                </span>
              </Link>

              <div
                className={`nb__mega ${megaOpen ? 'nb__mega--open' : ''}`}
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <div className="nb__mega-inner">

                  {/* Left — categories grid */}
                  <div className="nb__mega-cats">
                    <p className="nb__mega-heading">
                      <FontAwesomeIcon icon={faLayerGroup} />
                      Shop by Category
                    </p>
                    <div className="nb__mega-grid">
                      {categories.map((cat, i) => {
                        const meta = categoryMeta[cat.name] || { icon: faStore, desc: 'Explore the collection' }
                        return (
                          <Link
                            key={cat.id}
                            to={`/products?category=${cat.id}`}
                            className="nb__mega-item"
                            style={{ animationDelay: megaOpen ? `${i * 35}ms` : '0ms' }}
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="nb__mega-item-icon">
                              <FontAwesomeIcon icon={meta.icon} />
                            </span>
                            <div className="nb__mega-item-text">
                              <span className="nb__mega-item-name">{cat.name}</span>
                              <span className="nb__mega-item-desc">{meta.desc}</span>
                            </div>
                            <span className="nb__mega-item-arrow">
                              <FontAwesomeIcon icon={faChevronRight} />
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right — featured + quick links */}
                  <div className="nb__mega-featured">
                    <p className="nb__mega-heading">
                      <FontAwesomeIcon icon={faFire} />
                      Trending Now
                    </p>
                    <div className="nb__mega-qlinks">
                      <Link to="/products?sort=newest" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-icon nb__mega-qlink-icon--new">
                          <FontAwesomeIcon icon={faFire} />
                        </span>
                        <div>
                          <span className="nb__mega-qlink-label">New Arrivals</span>
                          <span className="nb__mega-qlink-sub">Fresh this week</span>
                        </div>
                      </Link>
                      <Link to="/products?sale=true" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-icon nb__mega-qlink-icon--sale">
                          <FontAwesomeIcon icon={faTag} />
                        </span>
                        <div>
                          <span className="nb__mega-qlink-label">On Sale</span>
                          <span className="nb__mega-qlink-sub">Up to 40% off</span>
                        </div>
                      </Link>
                      <Link to="/products?available=true" className="nb__mega-qlink" onClick={() => setMegaOpen(false)}>
                        <span className="nb__mega-qlink-icon nb__mega-qlink-icon--stock">
                          <FontAwesomeIcon icon={faBoxOpen} />
                        </span>
                        <div>
                          <span className="nb__mega-qlink-label">In Stock</span>
                          <span className="nb__mega-qlink-sub">Ready to ship</span>
                        </div>
                      </Link>
                    </div>

                    <div className="nb__mega-trust">
                      <span className="nb__mega-trust-item">
                        <FontAwesomeIcon icon={faTruck} /> Free shipping ₹999+
                      </span>
                      <span className="nb__mega-trust-item">
                        <FontAwesomeIcon icon={faRotateLeft} /> 30-day returns
                      </span>
                    </div>

                    <Link to="/products" className="nb__mega-all" onClick={() => setMegaOpen(false)}>
                      View all collections
                      <FontAwesomeIcon icon={faArrowRight} />
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

          {/* ── Icon strip ── */}
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
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>

              <button
                className={`nb__icon-btn nb__search-btn ${searchOpen ? 'nb__search-btn--active' : ''}`}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? 'Close search' : 'Search'}
              >
                <FontAwesomeIcon icon={searchOpen ? faXmark : faMagnifyingGlass} />
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
                              {image
                                ? <img src={image} alt={product.name} />
                                : <FontAwesomeIcon icon={faBagShopping} />
                              }
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
              <FontAwesomeIcon icon={faHeartReg} />
              {wishlistCount > 0 && (
                <span className="nb__badge">{wishlistCount > 9 ? '9+' : wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <button className="nb__icon-btn" onClick={toggleCart} aria-label="Cart">
              <FontAwesomeIcon icon={faCartShopping} />
              {cartCount > 0 && (
                <span className="nb__badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>

            {/* Account */}
            <div className="nb__account nb__icon-btn--hide-mobile" ref={accountRef}>
              <button
                className="nb__icon-btn"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-label="Account"
              >
                {isAuthenticated
                  ? <div className="nb__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                  : <FontAwesomeIcon icon={faUserReg} />
                }
              </button>

              {accountOpen && (
                <div className="nb__dropdown">
                  {isAuthenticated ? (
                    <>
                      <div className="nb__dropdown-head">
                        <div className="nb__dropdown-avatar">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="nb__dropdown-greeting">{user?.name?.split(' ')[0]}</p>
                          <p className="nb__dropdown-email">{user?.email}</p>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="nb__dropdown-item nb__dropdown-item--admin">
                          <span className="nb__dropdown-item-icon">
                            <FontAwesomeIcon icon={faTableCells} />
                          </span>
                          Admin Dashboard
                          <FontAwesomeIcon icon={faChevronRight} className="nb__dropdown-item-arrow" />
                        </Link>
                      )}
                      <div className="nb__dropdown-section">
                        <Link to="/account" className="nb__dropdown-item">
                          <span className="nb__dropdown-item-icon">
                            <FontAwesomeIcon icon={faBagShopping} />
                          </span>
                          My Orders
                          <FontAwesomeIcon icon={faChevronRight} className="nb__dropdown-item-arrow" />
                        </Link>
                        <Link to="/account" className="nb__dropdown-item">
                          <span className="nb__dropdown-item-icon">
                            <FontAwesomeIcon icon={faHeartReg} />
                          </span>
                          Wishlist
                          {wishlistCount > 0 && <span className="nb__dropdown-badge">{wishlistCount}</span>}
                          <FontAwesomeIcon icon={faChevronRight} className="nb__dropdown-item-arrow" />
                        </Link>
                        <Link to="/account" className="nb__dropdown-item">
                          <span className="nb__dropdown-item-icon">
                            <FontAwesomeIcon icon={faGear} />
                          </span>
                          Settings
                          <FontAwesomeIcon icon={faChevronRight} className="nb__dropdown-item-arrow" />
                        </Link>
                      </div>
                      <div className="nb__dropdown-divider" />
                      <button onClick={handleLogout} className="nb__dropdown-item nb__dropdown-item--danger">
                        <span className="nb__dropdown-item-icon">
                          <FontAwesomeIcon icon={faRightFromBracket} />
                        </span>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="nb__dropdown-head nb__dropdown-head--guest">
                        <div className="nb__dropdown-guest-icon">
                          <FontAwesomeIcon icon={faCircleUser} />
                        </div>
                        <div>
                          <p className="nb__dropdown-greeting">Welcome</p>
                          <p className="nb__dropdown-email">Sign in for the best experience</p>
                        </div>
                      </div>
                      <div className="nb__dropdown-auth">
                        <Link to="/login" className="nb__dropdown-auth-btn nb__dropdown-auth-btn--fill">
                          <FontAwesomeIcon icon={faUser} />
                          Sign In
                        </Link>
                        <Link to="/register" className="nb__dropdown-auth-btn nb__dropdown-auth-btn--outline">
                          Create Account
                        </Link>
                      </div>
                      <div className="nb__dropdown-perks">
                        <span className="nb__dropdown-perk">
                          <FontAwesomeIcon icon={faTruck} /> Free shipping
                        </span>
                        <span className="nb__dropdown-perk">
                          <FontAwesomeIcon icon={faRotateLeft} /> Easy returns
                        </span>
                      </div>
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
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="mob-drawer__nav">
          {categories.length > 0 && (
            <div className="mob-drawer__section">
              <p className="mob-drawer__section-label">
                <FontAwesomeIcon icon={faLayerGroup} /> Categories
              </p>
              {categories.map((cat, i) => {
                const meta = categoryMeta[cat.name] || { icon: faStore, desc: '' }
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="mob-drawer__link mob-drawer__link--cat"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="mob-drawer__link-icon">
                      <FontAwesomeIcon icon={meta.icon} />
                    </span>
                    <span>{cat.name}</span>
                    <FontAwesomeIcon icon={faChevronRight} className="mob-drawer__link-arrow" />
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mob-drawer__section">
            <p className="mob-drawer__section-label">
              <FontAwesomeIcon icon={faFire} /> Explore
            </p>
            {[
              { label: 'New Arrivals', href: '/products?sort=newest', icon: faFire },
              { label: 'Sale',         href: '/products?sale=true',   icon: faTag },
              { label: 'About',        href: '/about',                icon: faStore },
            ].map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                className="mob-drawer__link"
                style={{ animationDelay: `${(categories.length + i) * 40}ms` }}
              >
                <span className="mob-drawer__link-icon">
                  <FontAwesomeIcon icon={link.icon} />
                </span>
                <span>{link.label}</span>
                <FontAwesomeIcon icon={faChevronRight} className="mob-drawer__link-arrow" />
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
              <button onClick={handleLogout} className="mob-drawer__signout">
                <FontAwesomeIcon icon={faRightFromBracket} /> Sign Out
              </button>
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
          <FontAwesomeIcon icon={faMagnifyingGlass} className="mob-search__bar-icon" />
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
            ? <button className="mob-search__clear" onClick={() => setSearchQuery('')}><FontAwesomeIcon icon={faXmark} /></button>
            : <button className="mob-search__close" onClick={() => setSearchOpen(false)}>Cancel</button>
          }
        </div>
        <div className="mob-search__body">
          {!searchQuery && (
            <div className="mob-search__empty">
              <div className="mob-search__empty-icon">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
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
                      {image ? <img src={image} alt={product.name} /> : <FontAwesomeIcon icon={faBagShopping} />}
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