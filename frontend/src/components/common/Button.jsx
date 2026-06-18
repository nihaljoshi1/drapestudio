import './Button.css'

/**
 * Button — Drape Studio
 * variants: 'primary' | 'secondary' | 'ghost' | 'danger'
 * sizes:    'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading ? 'btn--loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <span className="btn__spinner-ring" />
        </span>
      )}
      <span className={`btn__label ${loading ? 'btn__label--hidden' : ''}`}>
        {children}
      </span>
    </button>
  )
}