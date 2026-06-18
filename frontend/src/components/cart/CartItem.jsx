import { useCartStore } from '../../store/cartStore'
import './CartItem.css'

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()

  const { product, variant, quantity, variant_id } = item
  const price = product?.sale_price || product?.base_price || 0
  const originalPrice = product?.sale_price ? product?.base_price : null
  // imageUrl is stored flat on the item at addItem() time.
  // Fallback: item.imageUrl → nested product_images (if caller passed full product) → null
  const image = item.imageUrl
    || product?.product_images?.find((i) => i.is_primary)?.url
    || product?.product_images?.[0]?.url
    || null
  const lineTotal = price * quantity

  return (
    <div className="ci">
      {/* ── Thumbnail ── */}
      <div className="ci__img">
        {image
          ? <img src={image} alt={product?.name} loading="lazy" />
          : <div className="ci__img-fallback"><IconBag /></div>
        }
        {product?.sale_price && <span className="ci__sale-dot" aria-label="On sale" />}
      </div>

      {/* ── Info ── */}
      <div className="ci__body">
        <div className="ci__top">
          <div className="ci__meta">
            <p className="ci__name">{product?.name}</p>
            <div className="ci__attrs">
              {variant?.colour && (
                <span className="ci__attr">
                  <span
                    className="ci__colour-dot"
                    style={{ background: variant.colour_hex || variant.colour }}
                  />
                  {variant.colour}
                </span>
              )}
              {variant?.size && (
                <span className="ci__attr ci__attr--size">{variant.size}</span>
              )}
            </div>
          </div>

          {/* Remove */}
          <button
            className="ci__remove"
            onClick={() => removeItem(variant_id)}
            aria-label={`Remove ${product?.name}`}
          >
            <IconTrash />
          </button>
        </div>

        <div className="ci__bottom">
          {/* Quantity stepper */}
          <div className="ci__qty">
            <button
              className="ci__qty-btn"
              onClick={() => updateQuantity(variant_id, quantity - 1)}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="ci__qty-val">{quantity}</span>
            <button
              className="ci__qty-btn"
              onClick={() => updateQuantity(variant_id, quantity + 1)}
              aria-label="Increase quantity"
              disabled={quantity >= (variant?.stock ?? 99)}
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="ci__price-wrap">
            {originalPrice && (
              <span className="ci__price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
            <span className="ci__price">₹{lineTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}