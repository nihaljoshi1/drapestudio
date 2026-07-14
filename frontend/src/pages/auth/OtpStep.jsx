import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'

const RESEND_COOLDOWN = 30

export default function OtpStep({ email, purpose, onVerify, onBack }) {
  const { resendOtp, isLoading } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function handleChange(idx, value) {
    const val = value.replace(/\D/g, '').slice(-1)
    setDigits(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
    setError('')
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      inputRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) {
      setError('Enter the full 6-digit code')
      return
    }
    const result = await onVerify(code)
    if (!result.success) {
      setError(result.message || 'Invalid code')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    const result = await resendOtp(email, purpose)
    setResending(false)
    if (result.success) {
      setCooldown(RESEND_COOLDOWN)
      setDigits(['', '', '', '', '', ''])
    } else {
      setError(result.message || 'Failed to resend code')
    }
  }

  return (
    <form className="auth__form" onSubmit={handleSubmit} noValidate>
      <p className="auth__otp-note">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      {error && (
        <div className="auth__server-error" role="alert">
          {error}
        </div>
      )}

      <div className="auth__otp-boxes" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="auth__otp-box"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
        Verify
      </Button>

      <div className="auth__otp-actions">
        {onBack && (
          <button type="button" className="auth__switch-link" onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          type="button"
          className="auth__switch-link"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
        >
          {resending ? 'Resending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  )
}