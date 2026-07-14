import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot,
  faCreditCard,
  faCircleCheck,
  faChevronRight,
  faLock,
  faTag,
  faXmark,
  faArrowLeft,
  faPercent,
  faTruck,
  faTriangleExclamation,
  faCircleXmark,
  faSpinner,
  faReceipt,
  faBagShopping,
} from '@fortawesome/free-solid-svg-icons'
import { faCreditCard as faCreditCardReg } from '@fortawesome/free-regular-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { orderService } from '../../services/orderService'
import './Checkout.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Delivery', icon: faLocationDot },
  { id: 2, label: 'Payment',  icon: faCreditCard  },
  { id: 3, label: 'Confirm',  icon: faCircleCheck  },
]

const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_COST = 149

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div className={`ck__field ${error ? 'ck__field--error' : ''}`}>
      <label className="ck__label">
        {label}{required && <span className="ck__required">*</span>}
      </label>
      {children}
      {error && (
        <p className="ck__field-error">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Step 1: Address Form ────────────────────────────────────────────────────
function AddressStep({ address, onChange, errors }) {
  return (
    <div className="ck__step-content">
      <div className="ck__step-header">
        <h2 className="ck__step-title">Delivery Address</h2>
        <p className="ck__step-sub">Where should we send your order?</p>
      </div>

      <div className="ck__form">
        <div className="ck__form-row">
          <Field label="Full Name" error={errors.name} required>
            <input
              className="ck__input"
              type="text"
              placeholder="Nihal Joshi"
              value={address.name}
              onChange={e => onChange('name', e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Phone Number" error={errors.phone} required>
            <input
              className="ck__input"
              type="tel"
              placeholder="98765 43210"
              value={address.phone}
              onChange={e => onChange('phone', e.target.value)}
              autoComplete="tel"
            />
          </Field>
        </div>

        <Field label="Address Line 1" error={errors.line1} required>
          <input
            className="ck__input"
            type="text"
            placeholder="House / Flat / Building no., Street name"
            value={address.line1}
            onChange={e => onChange('line1', e.target.value)}
            autoComplete="address-line1"
          />
        </Field>

        <Field label="Address Line 2" error={errors.line2}>
          <input
            className="ck__input"
            type="text"
            placeholder="Area, Colony, Landmark (optional)"
            value={address.line2}
            onChange={e => onChange('line2', e.target.value)}
            autoComplete="address-line2"
          />
        </Field>

        <div className="ck__form-row">
          <Field label="City" error={errors.city} required>
            <input
              className="ck__input"
              type="text"
              placeholder="Mumbai"
              value={address.city}
              onChange={e => onChange('city', e.target.value)}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" error={errors.state} required>
            <select
              className="ck__input ck__select"
              value={address.state}
              onChange={e => onChange('state', e.target.value)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Pincode" error={errors.pincode} required>
            <input
              className="ck__input"
              type="text"
              placeholder="400001"
              value={address.pincode}
              onChange={e => onChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="postal-code"
              maxLength={6}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Payment ──────────────────────────────────────────────────────────
function PaymentStep({ card, onChange, errors }) {
  const [showCard, setShowCard] = useState(true)

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2)
    return clean
  }

  return (
    <div className="ck__step-content">
      <div className="ck__step-header">
        <h2 className="ck__step-title">Payment</h2>
        <p className="ck__step-sub">
          <FontAwesomeIcon icon={faLock} />
          Secured by 256-bit SSL encryption
        </p>
      </div>

      {/* Test card notice */}
      <div className="ck__test-notice">
        <FontAwesomeIcon icon={faCreditCardReg} />
        <div>
          <p className="ck__test-notice-title">Test Mode</p>
          <p className="ck__test-notice-sub">
            Use card <strong>4111 1111 1111 1111</strong> · Exp <strong>12/26</strong> · CVV <strong>123</strong>
          </p>
        </div>
      </div>

      {/* Card visual */}
      <div className="ck__card-visual">
        <div className="ck__card-chip" />
        <p className="ck__card-number-display">
          {card.number
            ? card.number.replace(/\d(?=.{5})/g, '•')
            : '•••• •••• •••• ••••'}
        </p>
        <div className="ck__card-bottom">
          <div>
            <p className="ck__card-meta-label">Cardholder</p>
            <p className="ck__card-meta-val">{card.name || 'YOUR NAME'}</p>
          </div>
          <div>
            <p className="ck__card-meta-label">Expires</p>
            <p className="ck__card-meta-val">{card.expiry || 'MM/YY'}</p>
          </div>
          <div className="ck__card-logo">
            <FontAwesomeIcon icon={faCreditCardReg} />
          </div>
        </div>
      </div>

      {/* Card form */}
      <div className="ck__form">
        <Field label="Card Number" error={errors.number} required>
          <input
            className="ck__input ck__input--mono"
            type="text"
            placeholder="4111 1111 1111 1111"
            value={card.number}
            onChange={e => onChange('number', formatCardNumber(e.target.value))}
            maxLength={19}
            autoComplete="cc-number"
          />
        </Field>

        <Field label="Cardholder Name" error={errors.name} required>
          <input
            className="ck__input"
            type="text"
            placeholder="Name on card"
            value={card.name}
            onChange={e => onChange('name', e.target.value.toUpperCase())}
            autoComplete="cc-name"
          />
        </Field>

        <div className="ck__form-row ck__form-row--half">
          <Field label="Expiry Date" error={errors.expiry} required>
            <input
              className="ck__input ck__input--mono"
              type="text"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => onChange('expiry', formatExpiry(e.target.value))}
              maxLength={5}
              autoComplete="cc-exp"
            />
          </Field>
          <Field label="CVV" error={errors.cvv} required>
            <input
              className="ck__input ck__input--mono"
              type="password"
              placeholder="•••"
              value={card.cvv}
              onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              autoComplete="cc-csc"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Confirmation ──────────────────────────────────────────────────────
function ConfirmStep({ order, onContinue }) {
  return (
    <div className="ck__confirm">
      <div className="ck__confirm-icon">
        <FontAwesomeIcon icon={faCircleCheck} />
      </div>
      <h2 className="ck__confirm-title">Order Confirmed!</h2>
      <p className="ck__confirm-sub">
        Thank you for your order. We'll start processing it right away.
      </p>

      <div className="ck__confirm-id">
        <span className="ck__confirm-id-label">Order ID</span>
        <span className="ck__confirm-id-val">#{order?.id?.slice(0, 8).toUpperCase()}</span>
      </div>

      <div className="ck__confirm-eta">
        <FontAwesomeIcon icon={faTruck} />
        <span>Estimated delivery in <strong>4–7 business days</strong></span>
      </div>

      <div className="ck__confirm-actions">
        <Link to={`/orders/${order?.id}`} className="ck__confirm-btn ck__confirm-btn--primary">
          <FontAwesomeIcon icon={faReceipt} />
          View Order Details
        </Link>
        <Link to="/products" className="ck__confirm-btn ck__confirm-btn--secondary">
          <FontAwesomeIcon icon={faBagShopping} />
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({ items, subtotal, shipping, coupon, discount, total, couponInput, setCouponInput, onApplyCoupon, onRemoveCoupon, couponLoading, couponError, step }) {
  return (
    <aside className="ck__summary">
      <h3 className="ck__summary-title">Order Summary</h3>

      {/* Items */}
      <div className="ck__summary-items">
        {items.map(item => (
          <div key={item.variant_id} className="ck__summary-item">
            <div className="ck__summary-img-wrap">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.product?.name} className="ck__summary-img" />
                : <div className="ck__summary-img-fallback" />
              }
              <span className="ck__summary-qty">{item.quantity}</span>
            </div>
            <div className="ck__summary-item-info">
              <p className="ck__summary-item-name">{item.product?.name}</p>
              <p className="ck__summary-item-variant">
                {item.variant?.colour} · {item.variant?.size}
              </p>
            </div>
            <p className="ck__summary-item-price">
              ₹{((item.product?.sale_price || item.product?.base_price || 0) * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon — only on steps 1 and 2 */}
      {step < 3 && (
        <div className="ck__coupon">
          {coupon ? (
            <div className="ck__coupon-applied">
              <FontAwesomeIcon icon={faTag} className="ck__coupon-icon" />
              <span className="ck__coupon-code">{coupon.code}</span>
              <span className="ck__coupon-saving">−₹{discount?.toLocaleString('en-IN')}</span>
              <button className="ck__coupon-remove" onClick={onRemoveCoupon} aria-label="Remove coupon">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <div className="ck__coupon-form">
              <input
                className="ck__coupon-input"
                type="text"
                placeholder="Coupon code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && onApplyCoupon()}
              />
              <button
                className="ck__coupon-btn"
                onClick={onApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
              >
                {couponLoading
                  ? <FontAwesomeIcon icon={faSpinner} spin />
                  : <><FontAwesomeIcon icon={faPercent} /> Apply</>
                }
              </button>
            </div>
          )}
          {couponError && (
            <p className="ck__coupon-error">
              <FontAwesomeIcon icon={faCircleXmark} />
              {couponError}
            </p>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="ck__summary-totals">
        <div className="ck__summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="ck__summary-row ck__summary-row--saving">
            <span>Coupon ({coupon?.code})</span>
            <span>−₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="ck__summary-row">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'ck__free' : ''}>
            {shipping === 0 ? 'Free' : `₹${shipping}`}
          </span>
        </div>
        {shipping === 0 && (
          <p className="ck__shipping-note">
            <FontAwesomeIcon icon={faTruck} />
            Free delivery applied
          </p>
        )}
        <div className="ck__summary-divider" />
        <div className="ck__summary-row ck__summary-row--total">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Security note */}
      {step < 3 && (
        <p className="ck__summary-secure">
          <FontAwesomeIcon icon={faLock} />
          Payments are encrypted and secure
        </p>
      )}
    </aside>
  )
}

// ─── Main Checkout Component ──────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  // ── Auth guard ──
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [isAuthenticated])

  // ── Empty cart guard ──
  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      navigate('/products', { replace: true })
    }
  }, [items.length, isAuthenticated])

  // ── Step state ──
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)

  // ── Address state ──
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [addressErrors, setAddressErrors] = useState({})

  // ── Card state ──
  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })
  const [cardErrors, setCardErrors] = useState({})

  // ── Coupon state ──
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)      // { code, coupon_id, discount }
  const [discount, setDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState(null)

  // ── Pricing ──
  const subtotal = getTotal()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = Math.max(0, subtotal - discount + shipping)

  // ── Address validation ──
  function validateAddress() {
    const errs = {}
    if (!address.name.trim()) errs.name = 'Full name is required'
    if (!address.phone.trim() || !/^[6-9]\d{9}$/.test(address.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!address.line1.trim()) errs.line1 = 'Address is required'
    if (!address.city.trim()) errs.city = 'City is required'
    if (!address.state) errs.state = 'State is required'
    if (!address.pincode || !/^\d{6}$/.test(address.pincode))
      errs.pincode = 'Enter a valid 6-digit pincode'
    setAddressErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Card validation ──
  function validateCard() {
    const errs = {}
    const rawNumber = card.number.replace(/\s/g, '')
    if (!rawNumber || rawNumber.length < 16) errs.number = 'Enter a valid 16-digit card number'
    if (!card.name.trim()) errs.name = 'Cardholder name is required'
    if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = 'Enter expiry as MM/YY'
    if (!card.cvv || card.cvv.length < 3) errs.cvv = 'Enter a valid CVV'
    setCardErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Coupon handlers ──
  const handleApplyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await orderService.validateCoupon({
        code: couponInput.trim(),
        cart_total: subtotal,
      })
      setCoupon({ code: res.data.code, coupon_id: res.data.coupon_id })
      setDiscount(res.data.discount)
      setCouponInput('')
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }, [couponInput, subtotal])

  const handleRemoveCoupon = useCallback(() => {
    setCoupon(null)
    setDiscount(0)
    setCouponError(null)
    setCouponInput('')
  }, [])

  // ── Step navigation ──
  function handleNext() {
    if (step === 1) {
      if (!validateAddress()) return
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (step === 2) {
      if (!validateCard()) return
      handlePlaceOrder()
    }
  }

  function handleBack() {
    if (step > 1 && step < 3) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ── Place order ──
  async function handlePlaceOrder() {
    setSubmitting(true)
    setSubmitError(null)

    // Simulate payment processing (fake Razorpay)
    const fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    try {
      const orderItems = items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product?.sale_price || item.product?.base_price || 0,
      }))

      const res = await orderService.createOrder({
        items: orderItems,
        address,
        payment_id: fakePaymentId,
        payment_method: 'card',
        coupon_id: coupon?.coupon_id || null,
        total,
      })

      clearCart()
      setPlacedOrder(res.data.order)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Handlers ──
  const handleAddressChange = useCallback((field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    if (addressErrors[field]) setAddressErrors(prev => ({ ...prev, [field]: null }))
  }, [addressErrors])

  const handleCardChange = useCallback((field, value) => {
    setCard(prev => ({ ...prev, [field]: value }))
    if (cardErrors[field]) setCardErrors(prev => ({ ...prev, [field]: null }))
  }, [cardErrors])

  // ── Render ──
  return (
    <div className="ck__page">
      <div className="ck__container">

        {/* ── Header ── */}
        <header className="ck__header">
          <Link to="/products" className="ck__back">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to shopping</span>
          </Link>
          <Link to="/" className="ck__brand">DRAPE <span>STUDIO</span></Link>
          <div className="ck__header-secure">
            <FontAwesomeIcon icon={faLock} />
            <span>Secure Checkout</span>
          </div>
        </header>

        {/* ── Stepper ── */}
        {step < 3 && (
          <nav className="ck__stepper" aria-label="Checkout steps">
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`ck__step
                  ${step === s.id ? 'ck__step--active' : ''}
                  ${step > s.id ? 'ck__step--done' : ''}
                `}
              >
                <div className="ck__step-bubble">
                  {step > s.id
                    ? <FontAwesomeIcon icon={faCircleCheck} />
                    : <FontAwesomeIcon icon={s.icon} />
                  }
                </div>
                <span className="ck__step-label">{s.label}</span>
                {idx < STEPS.length - 1 && (
                  <div className={`ck__step-line ${step > s.id ? 'ck__step-line--done' : ''}`} />
                )}
              </div>
            ))}
          </nav>
        )}

        {/* ── Body ── */}
        <div className={`ck__body ${step === 3 ? 'ck__body--confirm' : ''}`}>

          {/* ── Main content ── */}
          <main className="ck__main">
            {step === 1 && (
              <AddressStep
                address={address}
                onChange={handleAddressChange}
                errors={addressErrors}
              />
            )}
            {step === 2 && (
              <PaymentStep
                card={card}
                onChange={handleCardChange}
                errors={cardErrors}
              />
            )}
            {step === 3 && (
              <ConfirmStep order={placedOrder} />
            )}

            {/* ── Error banner ── */}
            {submitError && (
              <div className="ck__error-banner">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>{submitError}</span>
                <button onClick={() => setSubmitError(null)} aria-label="Dismiss">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            {step < 3 && (
              <div className="ck__nav">
                {step > 1 && (
                  <button className="ck__nav-back" onClick={handleBack} disabled={submitting}>
                    Back
                  </button>
                )}
                <button
                  className="ck__nav-next"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Processing…</>
                  ) : step === 1 ? (
                    <>Continue to Payment <FontAwesomeIcon icon={faChevronRight} /></>
                  ) : (
                    <><FontAwesomeIcon icon={faLock} /> Place Order · ₹{total.toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>
            )}
          </main>

          {/* ── Order summary sidebar ── */}
          {step < 3 && (
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              coupon={coupon}
              discount={discount}
              total={total}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
              step={step}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Indian states list ───────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
]