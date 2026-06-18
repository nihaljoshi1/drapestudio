import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope, faPaperPlane, faCircleCheck,
  faSpinner, faGift, faTruck, faTag,
} from '@fortawesome/free-solid-svg-icons'
import './Newsletter.css'

const PERKS = [
  { icon: faGift,  text: '10% off your first order' },
  { icon: faTruck, text: 'Early access to new arrivals' },
  { icon: faTag,   text: 'Exclusive member-only deals' },
]

export default function Newsletter() {
  const [email, setEmail]   = useState('')
  const [state, setState]   = useState('idle')
  const [error, setError]   = useState('')

  const isValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid(email)) {
      setError('Please enter a valid email address.')
      setState('error')
      return
    }

    const SCRIPT_URL = import.meta.env.VITE_NEWSLETTER_URL

    if (!SCRIPT_URL) {
      // Dev fallback — simulate success so UI works while you set up the sheet
      setState('loading')
      await new Promise(r => setTimeout(r, 1200))
      setState('success')
      setEmail('')
      return
    }

    setState('loading')
    setError('')

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'homepage-newsletter',
        }),
        mode: 'no-cors',
      })
      setState('success')
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
      setState('error')
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (state === 'error') setState('idle')
  }

  return (
    <section className="nl">

      <div className="nl__bg" aria-hidden="true">
        <div className="nl__bg-dots" />
        <div className="nl__bg-glow nl__bg-glow--l" />
        <div className="nl__bg-glow nl__bg-glow--r" />
        <div className="nl__bg-line nl__bg-line--top" />
        <div className="nl__bg-line nl__bg-line--bottom" />
      </div>

      <div className="nl__wrap">
        <div className="nl__card">

          {/* ── Left ── */}
          <div className="nl__left">
            <span className="nl__kicker">
              <FontAwesomeIcon icon={faEnvelope} />
              Newsletter
            </span>
            <h2 className="nl__title">
              Stay in the <em>Loop</em>
            </h2>
            <p className="nl__desc">
              New drops, styling tips, and member-only offers — straight to your inbox. No spam. Unsubscribe anytime.
            </p>
            <ul className="nl__perks">
              {PERKS.map((p, i) => (
                <li key={i} className="nl__perk">
                  <span className="nl__perk-icon">
                    <FontAwesomeIcon icon={p.icon} />
                  </span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right ── */}
          <div className="nl__right">
            {state === 'success' ? (
              <div className="nl__success">
                <div className="nl__success-icon">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h3 className="nl__success-title">You're in!</h3>
                <p className="nl__success-sub">
                  Welcome to the Drape Studio family. Check your inbox for your 10% off code.
                </p>
                <button className="nl__success-reset" onClick={() => setState('idle')}>
                  Subscribe another email
                </button>
              </div>
            ) : (
              <>
                <div className="nl__form-head">
                  <h3 className="nl__form-title">Get 10% off your first order</h3>
                  <div className="nl__divider" />
                  <p className="nl__form-sub">Join 50,000+ subscribers today.</p>
                </div>

                <form className="nl__form" onSubmit={handleSubmit} noValidate>
                  <div className={`nl__input-wrap ${state === 'error' ? 'nl__input-wrap--err' : ''}`}>
                    <FontAwesomeIcon icon={faEnvelope} className="nl__input-ico" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="nl__input"
                      disabled={state === 'loading'}
                      autoComplete="email"
                    />
                    <button
                      type="submit"
                      className="nl__submit"
                      disabled={state === 'loading' || !email}
                    >
                      {state === 'loading'
                        ? <FontAwesomeIcon icon={faSpinner} spin />
                        : <FontAwesomeIcon icon={faPaperPlane} />
                      }
                    </button>
                  </div>

                  {state === 'error' && <p className="nl__err-msg">{error}</p>}

                  <p className="nl__disclaimer">
                    By subscribing you agree to receive marketing emails. We respect your privacy.
                  </p>
                </form>

                <div className="nl__proof">
                  <div className="nl__avatars">
                    {['PS','AM','KN','RP','SJ'].map((a, i) => (
                      <div key={i} className="nl__av" style={{ zIndex: 5 - i, marginLeft: i === 0 ? 0 : '-10px' }}>
                        {a}
                      </div>
                    ))}
                  </div>
                  <p className="nl__proof-text">
                    <strong>50,000+</strong> people already subscribed
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}