import { useState, forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import './Input.css'

/**
 * Input — Drape Studio
 * Supports: text, email, password (with toggle), textarea
 * Props: label, error, hint, icon (FA icon definition), fullWidth
 */
const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    error,
    hint,
    icon,
    fullWidth = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={['inp__wrap', fullWidth ? 'inp__wrap--full' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="inp__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={['inp__field', error ? 'inp__field--error' : ''].filter(Boolean).join(' ')}>
        {icon && (
          <span className="inp__icon" aria-hidden="true">
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={['inp__control', icon ? 'inp__control--icon' : ''].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="inp__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>

      {error && (
        <span id={`${inputId}-error`} className="inp__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className="inp__hint">
          {hint}
        </span>
      )}
    </div>
  )
})

export default Input