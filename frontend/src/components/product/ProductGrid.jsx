import ProductCard from './ProductCard'
import './ProductGrid.css'

// ── Skeleton card for loading state ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="pg__skeleton" aria-hidden="true">
      <div className="pg__skeleton-img" />
      <div className="pg__skeleton-body">
        <div className="pg__skeleton-line pg__skeleton-line--short" />
        <div className="pg__skeleton-line" />
        <div className="pg__skeleton-line pg__skeleton-line--price" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading, error, skeletonCount = 12 }) {
  if (error) {
    return (
      <div className="pg__error" role="alert">
        <p className="pg__error-title">Something went wrong</p>
        <p className="pg__error-sub">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pg__grid" aria-label="Loading products" aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!loading && products.length === 0) {
    return (
      <div className="pg__empty">
        <div className="pg__empty-icon" aria-hidden="true">
          <IconEmpty />
        </div>
        <p className="pg__empty-title">No products found</p>
        <p className="pg__empty-sub">Try adjusting your filters or browse all collections.</p>
      </div>
    )
  }

  return (
    <div
      className="pg__grid"
      aria-label={`${products.length} products`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}