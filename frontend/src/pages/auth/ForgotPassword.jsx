import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { authService } from '../../services/authService'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import './Auth.css'


function validate(email) {
  if (!email.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return null
}

const RESEND_COOLDOWN = 30 // seconds

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  function startCountdown() {
    setCountdown(RESEND_COOLDOWN)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const error = validate(email)
    if (error) { setEmailError(error); return }

    setLoading(true)
    setServerError('')
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
      startCountdown()
    } catch (err) {
      // Never reveal whether email exists — generic message always
      // But if the server sends a useful non-sensitive error, show it
      setServerError(
        err?.message && !err.message.toLowerCase().includes('not found')
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (countdown > 0 || loading) return
    setLoading(true)
    try {
      await authService.forgotPassword(email.trim())
      startCountdown()
    } catch {
      // Silent — user already knows email was sent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth__page">
      {/* ── Left panel ── */}
      <div className="auth__panel auth__panel--visual" aria-hidden="true">

        <div className="auth__bg-grid" />
        <div className="auth__bg-gradient" />

        <div className="auth__swatch auth__swatch--a" />
        <div className="auth__swatch auth__swatch--b" />
        <div className="auth__swatch auth__swatch--c" />
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
            <span className="auth__editorial-label">We've got you</span>
            <h2 className="auth__editorial-headline">
              Happens<br />
              <em>to the</em><br />
              best of us.
            </h2>
            <div className="auth__editorial-rule">
              <span className="auth__editorial-rule-line" />
              <span className="auth__editorial-rule-dot" />
            </div>
            <p className="auth__editorial-body">
              We'll send you a secure link.<br />Back in your wardrobe in minutes.
            </p>
          </div>

          <div className="auth__stats">
            <div className="auth__stat">
              <span className="auth__stat-num">~2 min</span>
              <span className="auth__stat-label">Reset time</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">Secure</span>
              <span className="auth__stat-label">Encrypted link</span>
            </div>
            <div className="auth__stat-divider" />
            <div className="auth__stat">
              <span className="auth__stat-num">30 min</span>
              <span className="auth__stat-label">Link validity</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth__panel auth__panel--form">
        <div className="auth__form-container">
          {/* Mobile brand */}
          <div className="auth__mobile-brand" aria-hidden="true">
            <span className="auth__brand-initial auth__brand-initial--sm">D</span>
            <span className="auth__mobile-brand-name">Drape Studio</span>
          </div>

          {!sent ? (
            <>
              <Link to="/login" className="auth__back-link">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to sign in
              </Link>

              <header className="auth__header">
                <h1 className="auth__title">Forgot password?</h1>
                <p className="auth__subtitle">
                  Enter your email and we'll send you a reset link. Check your spam folder if it doesn't arrive.
                </p>
              </header>

              {serverError && (
                <div className="auth__server-error" role="alert">
                  {serverError}
                </div>
              )}

              <form className="auth__form" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  id="fp-email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={faEnvelope}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('')
                    if (serverError) setServerError('')
                  }}
                  error={emailError}
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  Send reset link
                </Button>
              </form>

              <p className="auth__switch">
                Remembered it?{' '}
                <Link to="/login" className="auth__switch-link">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* ── Sent confirmation state ── */
            <div className="auth__sent-state">
              <div className="auth__sent-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faPaperPlane} />
              </div>

              <h2 className="auth__sent-title">Check your inbox</h2>

              <p className="auth__sent-body">
                We've sent a password reset link to{' '}
                <strong>{email}</strong>.{' '}
                The link expires in 30 minutes.
              </p>

              <div className="auth__resend-row">
                <span>Didn't receive it?</span>
                <button
                  type="button"
                  className="auth__resend-btn"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
                </button>
              </div>

              <Link to="/login" className="auth__switch-link" style={{ marginTop: '8px', fontSize: '0.825rem' }}>
                ← Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}