import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import OtpStep from './OtpStep'
import './Auth.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal',
]

function validateDetails({ name, email, password, confirmPassword }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Full name is required.'
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.'
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) errors.password = 'Must include uppercase, lowercase, and a number.'
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

function validateAddress({ phone, line1, city, state, pincode }) {
  const errors = {}
  if (!phone.trim()) errors.phone = 'Phone number is required.'
  else if (!/^[6-9]\d{9}$/.test(phone.trim())) errors.phone = 'Enter a valid 10-digit phone number.'
  if (!line1.trim()) errors.line1 = 'Address line is required.'
  if (!city.trim()) errors.city = 'City is required.'
  if (!state) errors.state = 'State is required.'
  if (!pincode.trim()) errors.pincode = 'Pincode is required.'
  else if (!/^\d{6}$/.test(pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode.'
  return errors
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'var(--color-crimson)' }
  if (score <= 3) return { score, label: 'Fair', color: '#E8943A' }
  return { score, label: 'Strong', color: '#4CAF72' }
}

const STEPS = ['details', 'address', 'otp']

export default function Register() {
  const navigate = useNavigate()
  const { requestRegisterOtp, verifyRegisterOtp, isLoading } = useAuthStore()

  const [step, setStep] = useState('details')
  const [details, setDetails] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [address, setAddress] = useState({ phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const strength = getPasswordStrength(details.password)
  const stepIndex = STEPS.indexOf(step)

  function handleDetailsChange(e) {
    const { name, value } = e.target
    setDetails(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  function handleAddressChange(e) {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  function handleDetailsSubmit(e) {
    e.preventDefault()
    const fieldErrors = validateDetails(details)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setStep('address')
  }

  async function handleAddressSubmit(e) {
    e.preventDefault()
    const fieldErrors = validateAddress(address)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    const result = await requestRegisterOtp({
      name: details.name.trim(),
      email: details.email.trim(),
      password: details.password,
      phone: address.phone.trim(),
      address: {
        label: 'Home',
        line1: address.line1.trim(),
        line2: address.line2.trim() || undefined,
        city: address.city.trim(),
        state: address.state,
        pincode: address.pincode.trim(),
      },
    })

    if (result.success) {
      setStep('otp')
    } else {
      setServerError(result.message || 'Something went wrong. Please try again.')
    }
  }

  async function handleVerify(code) {
    const result = await verifyRegisterOtp(details.email.trim(), code)
    if (result.success) {
      navigate('/login', { state: { registered: true } })
    }
    return result
  }

  return (
    <div className="auth__page auth__page--register">
      <div className="auth__panel auth__panel--visual" aria-hidden="true">
        <div className="auth__bg-grid" />
        <div className="auth__bg-gradient" />
        <div className="auth__swatch auth__swatch--a auth__swatch--shift" />
        <div className="auth__swatch auth__swatch--b" />
        <div className="auth__swatch auth__swatch--c auth__swatch--shift" />
        <div className="auth__swatch auth__swatch--d" />
        <div className="auth__thread auth__thread--1" />
        <div className="auth__thread auth__thread--2" />
        <div className="auth__panel-inner">
          <div className="auth__wordmark">
            <span className="auth__wordmark-d">D</span>
            <div className="auth__wordmark-text">
              <span className="auth__wordmark-name">Drape Studio</span>
              <span className="auth__wordmark-city">Mumbai · Est. 2022</span>
            </div>
          </div>
          <div className="auth__editorial">
            <span className="auth__editorial-label">Join the movement</span>
            <h2 className="auth__editorial-headline">
              Wear what<br /><em>you believe</em><br />in.
            </h2>
            <div className="auth__editorial-rule">
              <span className="auth__editorial-rule-line" />
              <span className="auth__editorial-rule-dot" />
            </div>
            <p className="auth__editorial-body">
              Curated for those who dress<br />with purpose, not trend.
            </p>
          </div>
          <div className="auth__stats">
            <div className="auth__stat">
              <span className="auth__stat-num">12K+</span>
              <span className="auth__stat-label">Members</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">Free</span>
              <span className="auth__stat-label">Shipping ₹999+</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">Easy</span>
              <span className="auth__stat-label">30-day returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth__panel auth__panel--form">
        <div className="auth__form-container">
          <div className="auth__mobile-brand" aria-hidden="true">
            <span className="auth__brand-initial auth__brand-initial--sm">D</span>
            <span className="auth__mobile-brand-name">Drape Studio</span>
          </div>

          {step !== 'otp' && (
            <div className="auth__stepper">
              {['Details', 'Address'].map((label, i) => (
                <div key={label} className={`auth__step ${i === stepIndex ? 'auth__step--active' : i < stepIndex ? 'auth__step--done' : ''}`}>
                  <span className="auth__step-dot">{i < stepIndex ? '✓' : i + 1}</span>
                  <span className="auth__step-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          <header className="auth__header">
            <h1 className="auth__title">
              {step === 'details' && 'Create account'}
              {step === 'address' && 'Delivery address'}
              {step === 'otp' && 'Verify to continue'}
            </h1>
            <p className="auth__subtitle">
              {step === 'details' && "Join Drape Studio — Mumbai's finest conscious clothing"}
              {step === 'address' && 'This becomes your default delivery address'}
              {step === 'otp' && 'One last step to confirm it\'s you'}
            </p>
          </header>

          {serverError && (
            <div className="auth__server-error" role="alert">{serverError}</div>
          )}

          {step === 'details' && (
            <>
              <form className="auth__form" onSubmit={handleDetailsSubmit} noValidate>
                <div className="auth__fields">
                  <Input
                    label="Full name" type="text" name="name" id="reg-name"
                    placeholder="Aanya Mehta" autoComplete="name" icon={faUser}
                    value={details.name} onChange={handleDetailsChange} error={errors.name} fullWidth
                  />
                  <Input
                    label="Email address" type="email" name="email" id="reg-email"
                    placeholder="you@example.com" autoComplete="email" icon={faEnvelope}
                    value={details.email} onChange={handleDetailsChange} error={errors.email} fullWidth
                  />
                  <div className="auth__field-group">
                    <Input
                      label="Password" type="password" name="password" id="reg-password"
                      placeholder="At least 8 characters" autoComplete="new-password" icon={faLock}
                      value={details.password} onChange={handleDetailsChange} error={errors.password} fullWidth
                    />
                    {details.password.length > 0 && (
                      <div className="auth__strength">
                        <div className="auth__strength-bars">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="auth__strength-bar"
                              style={{ background: i <= strength.score ? strength.color : 'var(--color-stone)' }} />
                          ))}
                        </div>
                        <span className="auth__strength-label" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                  </div>
                  <Input
                    label="Confirm password" type="password" name="confirmPassword" id="reg-confirm"
                    placeholder="Repeat your password" autoComplete="new-password" icon={faLock}
                    value={details.confirmPassword} onChange={handleDetailsChange} error={errors.confirmPassword} fullWidth
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Continue
                </Button>
              </form>
              <p className="auth__switch">
                Already have an account?{' '}
                <Link to="/login" className="auth__switch-link">Sign in</Link>
              </p>
            </>
          )}

          {step === 'address' && (
            <form className="auth__form" onSubmit={handleAddressSubmit} noValidate>
              <div className="auth__fields">
                <Input
                  label="Phone number" type="tel" name="phone" id="reg-phone"
                  placeholder="9876543210" autoComplete="tel"
                  value={address.phone} onChange={handleAddressChange} error={errors.phone} fullWidth
                />
                <Input
                  label="Address line 1" type="text" name="line1" id="reg-line1"
                  placeholder="Flat / House no., Building, Street" autoComplete="address-line1"
                  value={address.line1} onChange={handleAddressChange} error={errors.line1} fullWidth
                />
                <Input
                  label="Address line 2 (optional)" type="text" name="line2" id="reg-line2"
                  placeholder="Landmark, area" autoComplete="address-line2"
                  value={address.line2} onChange={handleAddressChange} fullWidth
                />
                <div className="auth__row">
                  <Input
                    label="City" type="text" name="city" id="reg-city"
                    placeholder="Mumbai" autoComplete="address-level2"
                    value={address.city} onChange={handleAddressChange} error={errors.city} fullWidth
                  />
                  <div className="inp__wrap inp__wrap--full">
                    <label className="inp__label" htmlFor="reg-state">State</label>
                    <select
                      id="reg-state" name="state" className="inp__control auth__select"
                      value={address.state} onChange={handleAddressChange}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <span className="inp__error">{errors.state}</span>}
                  </div>
                </div>
                <Input
                  label="Pincode" type="text" name="pincode" id="reg-pincode"
                  placeholder="400001" autoComplete="postal-code"
                  value={address.pincode} onChange={handleAddressChange} error={errors.pincode} fullWidth
                />
              </div>
              <div className="auth__step-actions">
                <Button type="button" variant="secondary" size="lg" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
                  Send verification code
                </Button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <OtpStep
              email={details.email.trim()}
              purpose="register"
              onVerify={handleVerify}
              onBack={() => setStep('address')}
            />
          )}
        </div>
      </div>
    </div>
  )
}