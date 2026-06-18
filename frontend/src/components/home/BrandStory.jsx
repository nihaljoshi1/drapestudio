import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './BrandStory.css'

const MILESTONES = [
  {
    id: 'ms-1',
    year: '2018',
    title: 'The Beginning',
    desc: 'Founded in a small Mumbai studio with a single belief — clothing should feel as good as it looks. Two friends, one vision.',
    tag: 'Origin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'ms-2',
    year: '2019',
    title: 'First Collection',
    desc: 'Launched our debut 12-piece capsule wardrobe. Sold out in 48 hours. We knew we were onto something real.',
    tag: 'Launch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
  },
  {
    id: 'ms-3',
    year: '2021',
    title: 'Sustainable Shift',
    desc: 'Transitioned to 100% natural fabrics — organic cotton, linen, and TENCEL™. Fashion that respects the earth we all share.',
    tag: 'Impact',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M12 22c4.97 0 9-3.58 9-8 0-3.5-2.5-6.5-6-7.5C13.5 5.5 12 3 12 3s-1.5 2.5-3 3.5C5.5 7.5 3 10.5 3 14c0 4.42 4.03 8 9 8z"/>
      </svg>
    ),
  },
  {
    id: 'ms-4',
    year: '2022',
    title: 'Pan-India Reach',
    desc: 'Expanded shipping across all 28 states. Partnered with 200+ artisans. Crossed 10,000 orders — a milestone that moved us.',
    tag: 'Growth',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'ms-5',
    year: '2023',
    title: '50K Customers',
    desc: 'Crossed 50,000 happy customers across India. Every order still ships in recycled packaging. Every garment still made with love.',
    tag: 'Milestone',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'ms-6',
    year: '2026',
    title: 'Today & Beyond',
    desc: 'Building the future of conscious fashion — one garment at a time. The best chapter of Drape Studio is still being written.',
    tag: 'Future',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '200+', label: 'Artisan Partners' },
  { value: '100%', label: 'Natural Fabrics' },
  { value: '6+', label: 'Years of Craft' },
]

function MilestoneCard({ m, index, side }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`bs-item bs-item--${side} ${visible ? 'bs-item--in' : ''}`}
    >
      {/* Card */}
      <div className="bs-card">
        <div className="bs-card__year-bg">{m.year}</div>
        <div className="bs-card__inner">
          <div className="bs-card__top">
            <span className="bs-card__tag">{m.tag}</span>
            <div className="bs-card__icon">{m.icon}</div>
          </div>
          <div className="bs-card__year-label">{m.year}</div>
          <h3 className="bs-card__title">{m.title}</h3>
          <p className="bs-card__desc">{m.desc}</p>
        </div>
        <div className="bs-card__glow" />
      </div>

      {/* Connector */}
      <div className="bs-connector">
        <div className="bs-connector__line" />
        <div className="bs-connector__dot">
          <div className="bs-connector__dot-ring" />
        </div>
      </div>

      {/* Spacer for opposite side */}
      <div className="bs-spacer" />
    </div>
  )
}

export default function BrandStory() {
  const headerRef = useRef(null)
  const statsRef = useRef(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const obs1 = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true) }, { threshold: 0.2 })
    const obs2 = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.2 })
    if (headerRef.current) obs1.observe(headerRef.current)
    if (statsRef.current) obs2.observe(statsRef.current)
    return () => { obs1.disconnect(); obs2.disconnect() }
  }, [])

  return (
    <section className="bs">

      {/* ── Background ── */}
      <div className="bs__bg" aria-hidden="true">
        <div className="bs__bg-gradient" />
        <div className="bs__bg-texture" />
        <div className="bs__bg-glow bs__bg-glow--a" />
        <div className="bs__bg-glow bs__bg-glow--b" />
      </div>

      <div className="bs__wrap">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className={`bs__header ${headerVisible ? 'bs__header--in' : ''}`}
        >
          <span className="bs__kicker">
            <svg width="20" height="1" viewBox="0 0 20 1">
              <line x1="0" y1="0.5" x2="20" y2="0.5" stroke="#C9A96E" strokeWidth="1.5"/>
            </svg>
            Our Story
          </span>
          <h2 className="bs__title">
            Crafted with <em>Purpose,</em><br />Built with <em>Love</em>
          </h2>
          <p className="bs__sub">
            Every milestone in our journey reflects a commitment to craft,
            sustainability, and the people who wear our clothes.
          </p>
        </div>

        {/* ── Timeline ── */}
        <div className="bs__timeline">

          {/* Center spine */}
          <div className="bs__spine">
            <div className="bs__spine-line" />
            <div className="bs__spine-start" />
            <div className="bs__spine-end" />
          </div>

          {/* Milestone items */}
          {MILESTONES.map((m, i) => (
            <MilestoneCard
              key={m.id}
              m={m}
              index={i}
              side={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}

        </div>

        {/* ── Stats ── */}
        <div
          ref={statsRef}
          className={`bs__stats ${statsVisible ? 'bs__stats--in' : ''}`}
        >
          {STATS.map((s, i) => (
            <div
              key={`stat-${i}`}
              className="bs__stat"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className="bs__stat-val">{s.value}</span>
              <span className="bs__stat-sep" />
              <span className="bs__stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className={`bs__foot ${statsVisible ? 'bs__foot--in' : ''}`}>
          <Link to="/about" className="bs__cta">
            <span>Read Our Full Story</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}