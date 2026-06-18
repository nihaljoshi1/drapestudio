import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

const SLIDES = [
  {
    id: 1,
    desktop: 'https://cdn.shopify.com/s/files/1/0883/7568/9491/files/bagh-the-bloom-banner.webp',
    mobile:  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&h=1024&q=85&fit=crop&crop=top',
    eyebrow: 'SS 2026 Collection',
    headline: ['Wear the', 'Silence'],
    sub: 'Minimal forms. Natural fabrics. Clothing that speaks without trying.',
    cta: 'Shop Now',
    href: '/products',
    align: 'left',
  },
  {
    id: 2,
    desktop: '/src/assets/images/slide2.png',
    mobile:  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&h=1024&q=85&fit=crop&crop=top',
    eyebrow: 'New Arrivals',
    headline: ['Effortless', 'Every Day'],
    sub: 'Wardrobe essentials reimagined for the modern woman.',
    cta: 'Explore',
    href: '/products?sort=newest',
    align: 'center',
  },
  {
    id: 3,
    desktop: '/src/assets/images/slide3.png',
    mobile:  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=768&h=1024&q=85&fit=crop&crop=top',
    eyebrow: 'The Edit',
    headline: ['Curated for', 'You'],
    sub: 'Hand-picked pieces that define the season.',
    cta: 'View Edit',
    href: '/products',
    align: 'right',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [dir, setDir] = useState(1) // 1=next, -1=prev
  const timerRef = useRef(null)
  const DURATION = 6000

  const goTo = useCallback((index, direction = 1) => {
    if (transitioning) return
    setDir(direction)
    setPrev(current)
    setTransitioning(true)
    setCurrent(index)
    setTimeout(() => {
      setPrev(null)
      setTransitioning(false)
    }, 900)
  }, [current, transitioning])

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1)
  }, [current, goTo])

  const goToPrev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1)
  }, [current, goTo])

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(next, DURATION)
    return () => clearInterval(timerRef.current)
  }, [next])

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, DURATION)
  }

  const handleDotClick = (i) => {
    resetTimer()
    goTo(i, i > current ? 1 : -1)
  }

  const handlePrev = () => { resetTimer(); goToPrev() }
  const handleNext = () => { resetTimer(); next() }

  const slide = SLIDES[current]

  return (
    <section className="hero" aria-label="Hero slider">

      {/* ── Slides ── */}
      <div className="hero__track">
        {SLIDES.map((s, i) => {
          const isActive  = i === current
          const isPrev    = i === prev
          return (
            <div
              key={s.id}
              className={[
                'hero__slide',
                isActive ? 'is-active' : '',
                isPrev   ? 'is-prev'   : '',
                isActive && transitioning ? `entering-${dir > 0 ? 'next' : 'prev'}` : '',
                isPrev   && transitioning ? `leaving-${dir > 0 ? 'next' : 'prev'}`  : '',
              ].filter(Boolean).join(' ')}
              aria-hidden={!isActive}
            >
              {/* Responsive image via picture */}
              <picture>
                <source media="(max-width: 767px)" srcSet={s.mobile} />
                <source media="(min-width: 768px)"  srcSet={s.desktop} />
                <img
                  src={s.desktop}
                  alt={s.eyebrow}
                  className="hero__img"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </picture>
            </div>
          )
        })}
      </div>

      {/* ── Content ── */}
      <div className={`hero__content hero__content--${slide.align}`}>
        <div className="hero__content-inner">
          <Link
            style={{ animationDelay: '0.56s' }}
          >
          </Link>
        </div>
      </div>

      {/* ── Bottom bar: dots + arrows ── */}
      <div className="hero__bar">
        {/* Dots */}
        <div className="hero__dots" role="tablist" aria-label="Slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              className={`hero__dot ${i === current ? 'hero__dot--on' : ''}`}
              onClick={() => handleDotClick(i)}
            >
              <span
                className="hero__dot-fill"
                style={i === current ? { animationDuration: `${DURATION}ms` } : {}}
              />
            </button>
          ))}
        </div>

        {/* Slide count */}
        <div className="hero__count">
          <span className="hero__count-n">{String(current + 1).padStart(2,'0')}</span>
          <span className="hero__count-sep" />
          <span className="hero__count-t">{String(SLIDES.length).padStart(2,'0')}</span>
        </div>

        {/* Arrows */}
        <div className="hero__arrows">
          <button className="hero__arrow" onClick={handlePrev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <button className="hero__arrow" onClick={handleNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="hero__scroll" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span className="hero__scroll-label">Scroll</span>
      </div>

    </section>
  )
}