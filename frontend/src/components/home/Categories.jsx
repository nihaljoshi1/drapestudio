import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import './Categories.css'

const FALLBACK = [
  {
    id: '1', name: 'New Launches', slug: 'new-launches',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '2', name: 'Dresses', slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '3', name: 'Tops & Shirts', slug: 'tops-shirts',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '4', name: 'Co-Ord Sets', slug: 'coord-sets',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '5', name: 'Outerwear', slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '6', name: 'Accessories', slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '1', name: 'New Launches', slug: 'new-launches',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '2', name: 'Dresses', slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '3', name: 'Tops & Shirts', slug: 'tops-shirts',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '4', name: 'Co-Ord Sets', slug: 'coord-sets',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '5', name: 'Outerwear', slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&q=85&fit=crop&crop=top',
  },
  {
    id: '6', name: 'Accessories', slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=85&fit=crop&crop=top',
  },
]

export default function Categories() {
  const [categories, setCategories] = useState(FALLBACK)
  const [active, setActive] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const trackRef = useRef(null)

  useEffect(() => {
    productService.getCategories()
      .then((res) => {
        const cats = res.data?.categories
        if (cats && cats.length >= 3) {
          setCategories(
            cats.map((c, i) => ({
              ...c,
              image: FALLBACK[i % FALLBACK.length].image,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const updateScroll = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateScroll, { passive: true })
    updateScroll()
    return () => el.removeEventListener('scroll', updateScroll)
  }, [])

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <section className="catscroll">
      {/* ── Scroll container ── */}
      <div className="catscroll__outer">

        {/* Left fade + arrow */}
        <div className={`catscroll__fade catscroll__fade--left ${canScrollLeft ? 'catscroll__fade--visible' : ''}`}>
          <button className="catscroll__nav catscroll__nav--left" onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Track */}
        <div className="catscroll__track" ref={trackRef}>
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className={`catscroll__item ${active === cat.id ? 'catscroll__item--active' : ''}`}
              onMouseEnter={() => setActive(cat.id)}
              onMouseLeave={() => setActive(null)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Circle image */}
              <div className="catscroll__circle-wrap">
                <div className="catscroll__circle-ring" />
                <div className="catscroll__circle-bg" />
                <div className="catscroll__circle-img-wrap">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="catscroll__circle-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="catscroll__circle-shimmer" />
              </div>

              {/* Label */}
              <span className="catscroll__label">{cat.name}</span>
              <span className="catscroll__label-bar" />
            </Link>
          ))}
        </div>

        {/* Right fade + arrow */}
        <div className={`catscroll__fade catscroll__fade--right ${canScrollRight ? 'catscroll__fade--visible' : ''}`}>
          <button className="catscroll__nav catscroll__nav--right" onClick={() => scroll(1)} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  )
}