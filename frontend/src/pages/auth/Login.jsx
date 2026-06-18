import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import './Auth.css'


// ─── Field-level validation ───────────────────────────────────────────────────
function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()

  // Redirect to where they came from, or home
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
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

    const result = await login(form.email, form.password)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setServerError(result.message || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="auth__page">
      {/* ── Left panel — brand visual ── */}
      <div className="auth__panel auth__panel--visual" aria-hidden="true">

        {/* Layered background: gradient wash + grid lines */}
        <div className="auth__bg-grid" />
        <div className="auth__bg-gradient" />

        {/* Floating fabric swatch shapes */}
        <div className="auth__swatch auth__swatch--a" />
        <div className="auth__swatch auth__swatch--b" />
        <div className="auth__swatch auth__swatch--c" />
        <div className="auth__swatch auth__swatch--d" />

        {/* Gold thread lines */}
        <div className="auth__thread auth__thread--1" />
        <div className="auth__thread auth__thread--2" />

        <div className="auth__panel-inner">
          {/* Top: wordmark */}
          <div className="auth__wordmark">
            <span className="auth__wordmark-d">D</span>
            <div className="auth__wordmark-text">
              <span className="auth__wordmark-name">Drape Studio</span>
              <span className="auth__wordmark-city">Mumbai · Est. 2022</span>
            </div>
          </div>

          {/* Center: editorial headline + label */}
          <div className="auth__editorial">
            <span className="auth__editorial-label">New Season</span>
            <h2 className="auth__editorial-headline">
              Conscious<br />
              <em>clothing,</em><br />
              crafted slow.
            </h2>
            <div className="auth__editorial-rule">
              <span className="auth__editorial-rule-line" />
              <span className="auth__editorial-rule-dot" />
            </div>
            <p className="auth__editorial-body">
              Every stitch deliberate.<br />Every fabric chosen with intent.
            </p>
          </div>

          {/* Bottom: product stats strip */}
          <div className="auth__stats">
            <div className="auth__stat">
              <span className="auth__stat-num">200+</span>
              <span className="auth__stat-label">Styles</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">100%</span>
              <span className="auth__stat-label">Natural fibres</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">Zero</span>
              <span className="auth__stat-label">Fast fashion</span>
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
            <h1 className="auth__title">Welcome back</h1>
            <p className="auth__subtitle">Sign in to continue to Drape Studio</p>
          </header>

          {/* Server error banner */}
          {serverError && (
            <div className="auth__server-error" role="alert">
              {serverError}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit} noValidate>
            <div className="auth__fields">
              <Input
                label="Email address"
                type="email"
                name="email"
                id="login-email"
                placeholder="you@example.com"
                autoComplete="email"
                icon={faEnvelope}
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                fullWidth
              />

              <Input
                label="Password"
                type="password"
                name="password"
                id="login-password"
                placeholder="Your password"
                autoComplete="current-password"
                icon={faLock}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                fullWidth
              />
            </div>

            <div className="auth__form-meta">
              <Link to="/forgot-password" className="auth__forgot-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="auth__switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth__switch-link">
              Create one
            </Link>
          </p>

          <div className="auth__divider" aria-hidden="true">
            <span />
            <span className="auth__divider-text">or</span>
            <span />
          </div>

          <p className="auth__guest-note">
            <Link to="/" className="auth__guest-link">
              Continue browsing as guest →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}