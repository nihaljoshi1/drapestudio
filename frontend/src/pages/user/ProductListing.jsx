import { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import ProductGrid from '../../components/product/ProductGrid'
import './ProductListing.css'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const PRICE_RANGES = [
  { label: 'Under ₹500',        min: '',    max: '500' },
  { label: '₹500 – ₹1,000',    min: '500', max: '1000' },
  { label: '₹1,000 – ₹2,500',  min: '1000',max: '2500' },
  { label: '₹2,500 – ₹5,000',  min: '2500',max: '5000' },
  { label: 'Above ₹5,000',      min: '5000',max: '' },
]

export default function ProductListing() {
  const {
    products, pagination, categories,
    loading, error, filters,
    setFilter, setPage, clearFilters, hasActiveFilters,
  } = useProducts()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Active price range key for highlighting
  const activePriceKey = `${filters.min_price}-${filters.max_price}`

  function handlePriceRange(min, max) {
    const isActive = filters.min_price === min && filters.max_price === max
    if (isActive) {
      setFilter('min_price', '')
      setFilter('max_price', '')
    } else {
      setFilter('min_price', min)
      setFilter('max_price', max)
    }
  }

  return (
    <div className="pl">
      {/* ── Page Header ── */}
      <div className="pl__header">
        <div className="pl__header-inner">
          <div className="pl__header-text">
            <h1 className="pl__title">
              {filters.category
                ? categories.find(c => c.id === filters.category)?.name || 'Collection'
                : 'All Collections'}
            </h1>
            {pagination && !loading && (
              <p className="pl__count">
                {pagination.total} {pagination.total === 1 ? 'piece' : 'pieces'}
              </p>
            )}
          </div>

          {/* ── Toolbar ── */}
          <div className="pl__toolbar">
            {/* Filter toggle (mobile) */}
            <button
              className="pl__filter-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
            >
              <IconFilter />
              Filters
              {hasActiveFilters && <span className="pl__filter-dot" />}
            </button>

            {/* Sort dropdown */}
            <div className="pl__sort-wrap">
              <label className="pl__sort-label" htmlFor="sort-select">Sort</label>
              <select
                id="sort-select"
                className="pl__sort"
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <IconChevron />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="pl__chips">
            {filters.category && (
              <FilterChip
                label={categories.find(c => c.id === filters.category)?.name || 'Category'}
                onRemove={() => setFilter('category', '')}
              />
            )}
            {(filters.min_price || filters.max_price) && (
              <FilterChip
                label={PRICE_RANGES.find(r => r.min === filters.min_price && r.max === filters.max_price)?.label || 'Price range'}
                onRemove={() => { setFilter('min_price', ''); setFilter('max_price', '') }}
              />
            )}
            {filters.available && (
              <FilterChip
                label="In Stock Only"
                onRemove={() => setFilter('available', '')}
              />
            )}
            <button className="pl__chip-clear" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Layout ── */}
      <div className="pl__layout">
        {/* ── Sidebar (desktop always visible, mobile overlay) ── */}
        <>
          <div
            className={`pl__overlay ${sidebarOpen ? 'pl__overlay--on' : ''}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <aside className={`pl__sidebar ${sidebarOpen ? 'pl__sidebar--open' : ''}`}>
            <div className="pl__sidebar-head">
              <h2 className="pl__sidebar-title">Filters</h2>
              <button
                className="pl__sidebar-close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
              >
                <IconClose />
              </button>
              {hasActiveFilters && (
                <button className="pl__sidebar-clear" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>

            {/* Category filter */}
            <FilterSection title="Category">
              <ul className="pl__filter-list">
                <li>
                  <button
                    className={`pl__filter-opt ${!filters.category ? 'pl__filter-opt--active' : ''}`}
                    onClick={() => setFilter('category', '')}
                  >
                    All
                    <span className="pl__filter-opt-check"><IconCheck /></span>
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      className={`pl__filter-opt ${filters.category === cat.id ? 'pl__filter-opt--active' : ''}`}
                      onClick={() => setFilter('category', filters.category === cat.id ? '' : cat.id)}
                    >
                      {cat.name}
                      <span className="pl__filter-opt-check"><IconCheck /></span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterSection>

            {/* Price range */}
            <FilterSection title="Price Range">
              <ul className="pl__filter-list">
                {PRICE_RANGES.map(range => {
                  const isActive = filters.min_price === range.min && filters.max_price === range.max
                  return (
                    <li key={range.label}>
                      <button
                        className={`pl__filter-opt ${isActive ? 'pl__filter-opt--active' : ''}`}
                        onClick={() => handlePriceRange(range.min, range.max)}
                      >
                        {range.label}
                        <span className="pl__filter-opt-check"><IconCheck /></span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
              <button
                className={`pl__toggle-filter ${filters.available ? 'pl__toggle-filter--on' : ''}`}
                onClick={() => setFilter('available', filters.available ? '' : 'true')}
                role="switch"
                aria-checked={!!filters.available}
              >
                <span className="pl__toggle-track">
                  <span className="pl__toggle-thumb" />
                </span>
                In stock only
              </button>
            </FilterSection>

            {/* Mobile: Apply button */}
            <div className="pl__sidebar-apply">
              <button
                className="pl__apply-btn"
                onClick={() => setSidebarOpen(false)}
              >
                {pagination && !loading
                  ? `Show ${pagination.total} results`
                  : 'Apply Filters'}
              </button>
            </div>
          </aside>
        </>

        {/* ── Main content ── */}
        <main className="pl__main">
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            skeletonCount={12}
          />

          {/* ── Pagination ── */}
          {!loading && pagination && pagination.totalPages > 1 && (
            <nav className="pl__pagination" aria-label="Pagination">
              <button
                className="pl__page-btn pl__page-btn--prev"
                disabled={filters.page <= 1}
                onClick={() => setPage(filters.page - 1)}
                aria-label="Previous page"
              >
                <IconArrowLeft />
                Prev
              </button>

              <div className="pl__page-nums">
                {buildPageNumbers(filters.page, pagination.totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="pl__page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`pl__page-num ${p === filters.page ? 'pl__page-num--active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={p === filters.page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                className="pl__page-btn pl__page-btn--next"
                disabled={filters.page >= pagination.totalPages}
                onClick={() => setPage(filters.page + 1)}
                aria-label="Next page"
              >
                Next
                <IconArrowRight />
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="pl__filter-section">
      <button
        className="pl__filter-section-head"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`pl__filter-section-icon ${open ? 'pl__filter-section-icon--open' : ''}`}>
          <IconChevron />
        </span>
      </button>
      {open && <div className="pl__filter-section-body">{children}</div>}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="pl__chip">
      {label}
      <button className="pl__chip-x" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <IconClose size={10} />
      </button>
    </span>
  )
}

// Build page number array with ellipsis: [1, 2, 3, '...', 10]
function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconFilter() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconClose({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}