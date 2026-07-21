import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { reviewService } from '../../services/reviewService'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import {
  faArrowLeft, faCircleCheck, faClock, faTruck,
  faXmark, faRotateLeft, faLocationDot, faCreditCard,
  faTriangleExclamation, faBagShopping,
} from '@fortawesome/free-solid-svg-icons'
import { orderService } from '../../services/orderService'
import './OrderDetail.css'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered']

const STATUS_META = {
  confirmed: { label: 'Confirmed', icon: faCircleCheck, color: '#16A34A' },
  processing: { label: 'Processing', icon: faClock, color: '#D97706' },
  shipped: { label: 'Shipped', icon: faTruck, color: '#2563EB' },
  delivered: { label: 'Delivered', icon: faCircleCheck, color: '#16A34A' },
  cancelled: { label: 'Cancelled', icon: faXmark, color: '#DC2626' },
  returned: { label: 'Returned', icon: faRotateLeft, color: '#7C3AED' },
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewEligibility, setReviewEligibility] = useState({})

  useEffect(() => {
    orderService.getOrderById(id)
      .then(res => setOrder(res.data?.order))
      .catch(() => setError('Order not found or you don\'t have access to it.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!order || order.status !== 'delivered') return
    const itemsWithProductId = (order.order_items || []).filter(item => item.snapshot?.product_id)
    if (itemsWithProductId.length === 0) return

    let cancelled = false
    async function checkEligibility() {
      const results = await Promise.all(
        itemsWithProductId.map(item =>
          reviewService.getEligibility(item.snapshot.product_id)
            .then(res => [item.snapshot.product_id, res.data])
            .catch(() => [item.snapshot.product_id, null])
        )
      )
      if (!cancelled) {
        setReviewEligibility(Object.fromEntries(results.filter(([, v]) => v !== null)))
      }
    }
    checkEligibility()
    return () => { cancelled = true }
  }, [order])


  if (loading) return (
    <div className="od__page">
      <div className="od__container">
        <div className="od__skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="od__shimmer od__skeleton-block" />
          ))}
        </div>
      </div>
    </div>
  )

  if (error || !order) return (
    <div className="od__page">
      <div className="od__container">
        <div className="od__error">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <p>{error || 'Order not found.'}</p>
          <Link to="/account" className="od__error-btn">Back to Account</Link>
        </div>
      </div>
    </div>
  )

  const meta = STATUS_META[order.status] || STATUS_META.confirmed
  const isCancelled = order.status === 'cancelled' || order.status === 'returned'
  const currentStep = STATUS_STEPS.indexOf(order.status)
  const addr = order.order_addresses?.[0]
  const subtotal = order.order_items?.reduce(
    (sum, item) => sum + item.unit_price * item.quantity, 0
  ) || order.total

  return (
    <div className="od__page">
      <div className="od__container">

        {/* Back */}
        <Link to="/account" className="od__back">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="od__header">
          <div>
            <p className="od__order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="od__order-date">Placed on {formatDate(order.created_at)}</p>
          </div>
          <span
            className="od__status-badge"
            style={{ color: meta.color, background: `${meta.color}14` }}
          >
            <FontAwesomeIcon icon={meta.icon} />
            {meta.label}
          </span>
        </div>

        {/* Progress tracker — only for active orders */}
        {!isCancelled && (
          <div className="od__tracker">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStep
              const active = idx === currentStep
              const stepMeta = STATUS_META[step]
              return (
                <div key={step} className={`od__tracker-step ${done ? 'od__tracker-step--done' : ''} ${active ? 'od__tracker-step--active' : ''}`}>
                  <div className="od__tracker-bubble">
                    <FontAwesomeIcon icon={stepMeta.icon} />
                  </div>
                  <p className="od__tracker-label">{stepMeta.label}</p>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`od__tracker-line ${done && idx < currentStep ? 'od__tracker-line--done' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="od__body">

          {/* Items */}
          <div className="od__section">
            <h2 className="od__section-title">
              <FontAwesomeIcon icon={faBagShopping} />
              Items Ordered
            </h2>
            <div className="od__items">
              <div className="od__items-header">
                <FontAwesomeIcon icon={faBagShopping} />
                Items Ordered
              </div>
              {order.order_items?.map((item, i) => (
                <div key={i} className="od__item">
                  <div className="od__item-img">
                    {item.snapshot?.image_url
                      ? <img src={item.snapshot.image_url} alt={item.snapshot.product_name} />
                      : <FontAwesomeIcon icon={faBagShopping} />
                    }
                  </div>
                  <div className="od__item-info">
                    <p className="od__item-name">{item.snapshot?.product_name}</p>
                    <p className="od__item-variant">
                      {item.snapshot?.colour} · {item.snapshot?.size}
                      {item.snapshot?.sku && <span className="od__item-sku"> · {item.snapshot.sku}</span>}
                    </p>
                    <p className="od__item-qty">Qty: {item.quantity}</p>
                    {order.status === 'delivered' && item.snapshot?.product_id && (
                      reviewEligibility[item.snapshot.product_id]?.eligible ? (
                        <Link
                          to={`/products/${item.snapshot.product_slug}#reviews`}
                          className="od__review-link"
                        >
                          <FontAwesomeIcon icon={faStar} /> Write a Review
                        </Link>
                      ) : reviewEligibility[item.snapshot.product_id]?.alreadyReviewed ? (
                        <span className="od__review-done">
                          <FontAwesomeIcon icon={faCircleCheck} /> Reviewed
                        </span>
                      ) : null
                    )}
                  </div>
                  <p className="od__item-price">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="od__sidebar">

            {/* Price breakdown */}
            <div className="od__section od__section--card">
              <h2 className="od__section-title">Order Summary</h2>
              <div className="od__summary-rows">
                <div className="od__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="od__summary-row">
                  <span>Shipping</span>
                  <span className={order.total <= subtotal ? 'od__free' : ''}>
                    {order.total <= subtotal ? 'Free' : formatPrice(order.total - subtotal)}
                  </span>
                </div>
                <div className="od__summary-divider" />
                <div className="od__summary-row od__summary-row--total">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {addr && (
              <div className="od__section od__section--card">
                <h2 className="od__section-title">
                  <FontAwesomeIcon icon={faLocationDot} />
                  Delivery Address
                </h2>
                <div className="od__address">
                  <p className="od__address-name">{addr.name}</p>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="od__address-phone">{addr.phone}</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="od__section od__section--card">
              <h2 className="od__section-title">
                <FontAwesomeIcon icon={faCreditCard} />
                Payment
              </h2>
              <div className="od__payment">
                <div className="od__payment-row">
                  <span>Method</span>
                  <span>{order.payment_method?.toUpperCase() || 'CARD'}</span>
                </div>
                <div className="od__payment-row">
                  <span>Status</span>
                  <span className={`od__pay-status od__pay-status--${order.payment_status}`}>
                    {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                  </span>
                </div>
                <div className="od__payment-row">
                  <span>Transaction ID</span>
                  <span className="od__pay-id">{order.payment_id?.slice(0, 20)}…</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Status log */}
        {order.order_status_logs?.length > 0 && (
          <div className="od__section od__log-section">
            <h2 className="od__section-title">Order Timeline</h2>
            <div className="od__log">
              {order.order_status_logs.map((log, i) => (
                <div key={i} className="od__log-item">
                  <div className="od__log-dot" />
                  <div className="od__log-body">
                    <p className="od__log-status">{log.new_status}</p>
                    {log.note && <p className="od__log-note">{log.note}</p>}
                    <p className="od__log-date">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}