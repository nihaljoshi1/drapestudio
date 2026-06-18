import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import './Auth.css'

// ─── Field-level validation ───────────────────────────────────────────────────
function validate({ name, email, password, confirmPassword }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = 'Full name is required.'
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Must include uppercase, lowercase, and a number.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

// ─── Password strength ────────────────────────────────────────────────────────
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

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const strength = getPasswordStrength(form.password)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }

    const result = await register(form.name.trim(), form.email.trim(), form.password)

    if (result.success) {
      setSuccessMsg('Account created! Redirecting to login…')
      setTimeout(() => navigate('/login', { state: { registered: true } }), 1800)
    } else {
      setServerError(result.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth__page auth__page--register">
      {/* ── Left panel — brand visual ── */}
      <div className="auth__panel auth__panel--visual" aria-hidden="true">

        <div className="auth__bg-grid" />
        <div className="auth__bg-gradient" />

        {/* Swatches shifted for register variant */}
        <div className="auth__swatch auth__swatch--a auth__swatch--shift" />
        <div className="auth__swatch auth__swatch--b" />
        <div className="auth__swatch auth__swatch--c auth__swatch--shift" />
        <div className="auth__swatch auth__swatch--d" />

        <div className="auth__thread auth__thread--1" />
        <div className="auth__thread auth__thread--2" />

        <div className="auth__panel-inner">
          {/* Wordmark */}
          <div className="auth__wordmark">
            <span className="auth__wordmark-d">D</span>
            <div className="auth__wordmark-text">
              <span className="auth__wordmark-name">Drape Studio</span>
              <span className="auth__wordmark-city">Mumbai · Est. 2022</span>
            </div>
          </div>

          {/* Editorial — register-specific copy */}
          <div className="auth__editorial">
            <span className="auth__editorial-label">Join the movement</span>
            <h2 className="auth__editorial-headline">
              Wear what<br />
              <em>you believe</em><br />
              in.
            </h2>
            <div className="auth__editorial-rule">
              <span className="auth__editorial-rule-line" />
              <span className="auth__editorial-rule-dot" />
            </div>
            <p className="auth__editorial-body">
              Curated for those who dress<br />with purpose, not trend.
            </p>
          </div>

          {/* Bottom stats strip */}
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

      {/* ── Right panel — form ── */}
      <div className="auth__panel auth__panel--form">
        <div className="auth__form-container">
          {/* Mobile logo */}
          <div className="auth__mobile-brand" aria-hidden="true">
            <span className="auth__brand-initial auth__brand-initial--sm">D</span>
            <span className="auth__mobile-brand-name">Drape Studio</span>
          </div>

          <header className="auth__header">
            <h1 className="auth__title">Create account</h1>
            <p className="auth__subtitle">Join Drape Studio — Mumbai's finest conscious clothing</p>
          </header>

          {/* Server error */}
          {serverError && (
            <div className="auth__server-error" role="alert">
              {serverError}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="auth__server-success" role="status">
              {successMsg}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit} noValidate>
            <div className="auth__fields">
              <Input
                label="Full name"
                type="text"
                name="name"
                id="reg-name"
                placeholder="Aanya Mehta"
                autoComplete="name"
                icon={faUser}
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                fullWidth
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                id="reg-email"
                placeholder="you@example.com"
                autoComplete="email"
                icon={faEnvelope}
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                fullWidth
              />

              <div className="auth__field-group">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  id="reg-password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  icon={faLock}
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  fullWidth
                />
                {/* Strength meter — only show when user has typed */}
                {form.password.length > 0 && (
                  <div className="auth__strength" aria-label={`Password strength: ${strength.label}`}>
                    <div className="auth__strength-bars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="auth__strength-bar"
                          style={{
                            background: i <= strength.score ? strength.color : 'var(--color-stone)',
                            transition: 'background 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                    <span className="auth__strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Confirm password"
                type="password"
                name="confirmPassword"
                id="reg-confirm"
                placeholder="Repeat your password"
                autoComplete="new-password"
                icon={faLock}
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                fullWidth
              />
            </div>

            <p className="auth__terms">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="auth__switch-link">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth__switch-link">Privacy Policy</Link>.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Create account
            </Button>
          </form>

          <p className="auth__switch">
            Already have an account?{' '}
            <Link to="/login" className="auth__switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}