import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInstagram,
} from '@fortawesome/free-brands-svg-icons'
import {
  faHeart,
  faArrowUpRightFromSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import './UGCGrid.css'

// Install brands: npm install @fortawesome/free-brands-svg-icons

const POSTS = [
  {
    id: 'p1',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'tall',   // tall card
    caption: 'That effortless morning look ✨',
    tag: '@priya.wears',
  },
  {
    id: 'p2',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'normal',
    caption: 'The co-ord set that started it all 🌿',
    tag: '@ananya.style',
  },
  {
    id: 'p3',
    image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'normal',
    caption: 'Minimal and perfect 🖤',
    tag: '@kavya.fits',
  },
  {
    id: 'p4',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'wide',   // wide card
    caption: 'Sunday afternoon vibes 🍃',
    tag: '@riya.daily',
  },
  {
    id: 'p5',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'normal',
    caption: 'This blazer lives in my wardrobe forever',
    tag: '@shreya.ootd',
  },
  {
    id: 'p6',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'tall',
    caption: 'Clean lines, clean mind 🌸',
    tag: '@divya.looks',
  },
  {
    id: 'p7',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'normal',
    caption: 'Found my uniform 🌾',
    tag: '@meera.wears',
  },
  {
    id: 'p8',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&q=90&fit=crop&crop=top',
    span: 'normal',
    caption: 'Sustainable never looked this good',
    tag: '@aisha.style',
  },
]

function PostCard({ post, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`ugc-post ugc-post--${post.span}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(post)}
    >
      {/* Skeleton loader */}
      {!loaded && <div className="ugc-post__skeleton" />}

      <img
        src={post.image}
        alt={post.caption}
        className={`ugc-post__img ${loaded ? 'ugc-post__img--loaded' : ''}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />

      {/* Overlay */}
      <div className={`ugc-post__overlay ${hovered ? 'ugc-post__overlay--on' : ''}`}>
        <div className="ugc-post__overlay-top">
          <span className="ugc-post__insta-icon">
            <FontAwesomeIcon icon={faInstagram} />
          </span>
          <span className="ugc-post__expand">
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </span>
        </div>
        <div className="ugc-post__overlay-bottom">
          <p className="ugc-post__caption">{post.caption}</p>
          <span className="ugc-post__tag">{post.tag}</span>
        </div>
      </div>

      {/* Always visible tag in corner */}
      <span className="ugc-post__handle">{post.tag}</span>
    </div>
  )
}

function LightboxModal({ post, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!post) return null

  return (
    <div className="ugc-lb" onClick={onClose}>
      <div className="ugc-lb__box" onClick={e => e.stopPropagation()}>
        <button className="ugc-lb__close" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="ugc-lb__img-wrap">
          <img src={post.image} alt={post.caption} className="ugc-lb__img" />
        </div>
        <div className="ugc-lb__info">
          <div className="ugc-lb__info-head">
            <div className="ugc-lb__avatar">
              {post.tag.replace('@', '').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="ugc-lb__handle">{post.tag}</p>
              <p className="ugc-lb__via">via Instagram</p>
            </div>
            <FontAwesomeIcon icon={faInstagram} className="ugc-lb__insta" />
          </div>
          <p className="ugc-lb__caption">{post.caption}</p>
          <p className="ugc-lb__hashtag">#DrapeStudio #DressedByDrape</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ugc-lb__cta"
          >
            <FontAwesomeIcon icon={faInstagram} />
            View on Instagram
          </a>
        </div>
      </div>
    </div>
  )
}

export default function UGCGrid() {
  const [selected, setSelected] = useState(null)
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="ugc" ref={sectionRef}>

      {/* ── Background ── */}
      <div className="ugc__bg" aria-hidden="true">
        <div className="ugc__bg-stripe ugc__bg-stripe--1" />
        <div className="ugc__bg-stripe ugc__bg-stripe--2" />
        <div className="ugc__bg-stripe ugc__bg-stripe--3" />
      </div>

      <div className="ugc__wrap">

        {/* ── Header ── */}
        <div className={`ugc__header ${visible ? 'ugc__header--in' : ''}`}>
          <div className="ugc__header-left">
            <span className="ugc__kicker">
              <FontAwesomeIcon icon={faInstagram} className="ugc__kicker-icon" />
              Community
            </span>
            <h2 className="ugc__title">
              Styled by <em>You</em>
            </h2>
            <p className="ugc__sub">
              Real people. Real outfits. Tag us at
              <strong> #DressedByDrape</strong> to be featured.
            </p>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ugc__follow-btn"
          >
            <FontAwesomeIcon icon={faInstagram} />
            <span>Follow @drapestudio</span>
          </a>
        </div>

        {/* ── Mosaic Grid ── */}
        <div className={`ugc__grid ${visible ? 'ugc__grid--in' : ''}`}>
          {POSTS.map((post, i) => (
            <div
              key={post.id}
              style={{ transitionDelay: `${i * 60}ms` }}
              className="ugc__grid-item"
            >
              <PostCard post={post} onClick={setSelected} />
            </div>
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className={`ugc__strip ${visible ? 'ugc__strip--in' : ''}`}>
          <div className="ugc__strip-left">
            <FontAwesomeIcon icon={faHeart} className="ugc__strip-heart" />
            <span className="ugc__strip-text">
              Join <strong>50,000+</strong> people wearing Drape Studio
            </span>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ugc__strip-link"
          >
            See all posts
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </a>
        </div>

      </div>

      {/* ── Lightbox ── */}
      {selected && (
        <LightboxModal post={selected} onClose={() => setSelected(null)} />
      )}

    </section>
  )
}