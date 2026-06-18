import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStar,
  faLocationDot,
  faBagShopping,
  faLeaf,
  faRotateLeft,
  faAward,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons'
import './Testimonials.css'

const TESTIMONIALS_ROW1 = [
  {
    id: 't1-1', name: 'Priya Sharma', location: 'Mumbai', rating: 5,
    text: 'Absolutely love the quality of the fabric. The linen dress is so comfortable and elegant. I\'ve received so many compliments wearing it to work.',
    product: 'Linen Slip Dress', avatar: 'PS', color: '#E8C5A0',
  },
  {
    id: 't1-2', name: 'Ananya Mehta', location: 'Delhi', rating: 5,
    text: 'Drape Studio has completely changed how I think about getting dressed. Every piece feels intentional and beautifully made. Worth every rupee.',
    product: 'Classic White Tee', avatar: 'AM', color: '#B8D4C8',
  },
  {
    id: 't1-3', name: 'Kavya Nair', location: 'Bangalore', rating: 5,
    text: 'The co-ord set is stunning. Perfect fit, amazing fabric, and the packaging was so thoughtful. Will definitely be ordering again very soon.',
    product: 'Floral Co-Ord Set', avatar: 'KN', color: '#C5B8D4',
  },
  {
    id: 't1-4', name: 'Riya Patel', location: 'Ahmedabad', rating: 5,
    text: 'I was skeptical ordering online but the quality exceeded my expectations. The blazer fits perfectly and the material is genuinely premium.',
    product: 'Oversized Blazer', avatar: 'RP', color: '#D4C5B8',
  },
  {
    id: 't1-5', name: 'Shreya Joshi', location: 'Pune', rating: 5,
    text: 'Fast shipping, beautiful packaging, and clothes that actually look like the photos. A rare find these days. My new favourite brand.',
    product: 'Minimal Knit Top', avatar: 'SJ', color: '#B8C5D4',
  },
  {
    id: 't1-6', name: 'Divya Krishnan', location: 'Chennai', rating: 4,
    text: 'Love the sustainable approach. Knowing my clothes are made with natural fabrics and by skilled artisans makes every purchase feel meaningful.',
    product: 'Wide Leg Trousers', avatar: 'DK', color: '#D4B8C5',
  },
]

const TESTIMONIALS_ROW2 = [
  {
    id: 't2-1', name: 'Meera Iyer', location: 'Hyderabad', rating: 5,
    text: 'The attention to detail is incredible. Every stitch, every hem — you can tell how much care goes into making these clothes. Truly artisanal.',
    product: 'Linen Slip Dress', avatar: 'MI', color: '#C8D4B8',
  },
  {
    id: 't2-2', name: 'Aisha Kapoor', location: 'Jaipur', rating: 5,
    text: 'Ordered the white tee and was blown away. It drapes beautifully, doesn\'t shrink after wash, and the fit is absolutely perfect every time.',
    product: 'Classic White Tee', avatar: 'AK', color: '#E0C8A0',
  },
  {
    id: 't2-3', name: 'Pooja Reddy', location: 'Kolkata', rating: 5,
    text: 'Finally a brand that actually cares about sustainability without compromising on style. These are clothes I\'ll wear and treasure for years.',
    product: 'Oversized Blazer', avatar: 'PR', color: '#A0C8D4',
  },
  {
    id: 't2-4', name: 'Neha Gupta', location: 'Chandigarh', rating: 5,
    text: 'The customer service is exceptional. Had a sizing query and they responded within the hour. The product itself is absolutely gorgeous.',
    product: 'Co-Ord Set', avatar: 'NG', color: '#D4A0C8',
  },
  {
    id: 't2-5', name: 'Sanya Malik', location: 'Surat', rating: 5,
    text: 'Been following Drape Studio since day one. Watching them grow while maintaining quality has been so inspiring. A proud long-term customer.',
    product: 'Minimal Knit Top', avatar: 'SM', color: '#C8E0A0',
  },
  {
    id: 't2-6', name: 'Tanya Singh', location: 'Lucknow', rating: 4,
    text: 'The wide leg trousers are everything. Comfortable, chic, and versatile. I wear them to office and dinner parties alike. Perfect investment.',
    product: 'Wide Leg Trousers', avatar: 'TS', color: '#A0D4C8',
  },
]

const TRUST_BADGES = [
  { icon: faStar,          label: '4.9/5 Average Rating',   color: '#C9A96E' },
  { icon: faShieldHalved,  label: 'Verified Purchases Only', color: '#5B8A6B' },
  { icon: faLeaf,          label: 'Sustainable Packaging',   color: '#7A9B5B' },
  { icon: faRotateLeft,    label: 'Easy 15-Day Returns',     color: '#6B7A9B' },
]

function StarRating({ rating }) {
  return (
    <div className="tm-card__stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <FontAwesomeIcon
          key={s}
          icon={s <= rating ? faStar : faStarEmpty}
          className={`tm-star ${s <= rating ? 'tm-star--on' : 'tm-star--off'}`}
        />
      ))}
      <span className="tm-card__rating-num">{rating}.0</span>
    </div>
  )
}

function TestimonialCard({ t }) {
  return (
    <div className="tm-card">

      {/* Top accent bar */}
      <div className="tm-card__accent" style={{ background: `linear-gradient(to right, ${t.color}, transparent)` }} />

      {/* Header row */}
      <div className="tm-card__head">
        <div className="tm-card__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
          {t.avatar}
        </div>
        <div className="tm-card__author-info">
          <span className="tm-card__name">{t.name}</span>
          <span className="tm-card__location">
            <FontAwesomeIcon icon={faLocationDot} className="tm-card__loc-icon" />
            {t.location}
          </span>
        </div>
        <div className="tm-card__verified-wrap">
          <FontAwesomeIcon icon={faAward} className="tm-card__verified-icon" />
          <span className="tm-card__verified-text">Verified</span>
        </div>
      </div>

      {/* Stars + rating */}
      <StarRating rating={t.rating} />

      {/* Quote */}
      <div className="tm-card__quote-wrap">
        <span className="tm-card__quote-mark">"</span>
        <p className="tm-card__text">{t.text}</p>
      </div>

      {/* Product tag */}
      <div className="tm-card__footer">
        <span className="tm-card__product">
          <FontAwesomeIcon icon={faBagShopping} className="tm-card__product-icon" />
          {t.product}
        </span>
        <div className="tm-card__dots">
          <span /><span /><span />
        </div>
      </div>

    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="tm">

      {/* ── Background ── */}
      <div className="tm__bg" aria-hidden="true">
        <div className="tm__bg-top" />
        <div className="tm__bg-pattern" />
        <div className="tm__bg-glow tm__bg-glow--l" />
        <div className="tm__bg-glow tm__bg-glow--r" />
      </div>

      {/* ── Header ── */}
      <div className="tm__header">
        <span className="tm__kicker">
          <FontAwesomeIcon icon={faStar} className="tm__kicker-icon" />
          Customer Love
          <FontAwesomeIcon icon={faStar} className="tm__kicker-icon" />
        </span>
        <h2 className="tm__title">
          What They're <em>Saying</em>
        </h2>
        <p className="tm__sub">
          Over 50,000 happy customers across India. Real reviews, real people, real love.
        </p>

        {/* Rating summary */}
        <div className="tm__rating-summary">
          <div className="tm__rating-big">4.9</div>
          <div className="tm__rating-info">
            <div className="tm__rating-stars">
              {[1,2,3,4,5].map(s => (
                <FontAwesomeIcon key={s} icon={faStar} className="tm__big-star" />
              ))}
            </div>
            <span className="tm__rating-count">Based on 50,000+ reviews</span>
          </div>
        </div>
      </div>

      {/* ── Marquee rows ── */}
      <div className="tm__rows">

        {/* Row 1 — left */}
        <div className="tm__row-wrap">
          <div className="tm__fade tm__fade--l" />
          <div className="tm__track tm__track--fwd">
            <div className="tm__reel">
              {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((t, i) => (
                <TestimonialCard key={`r1-${t.id}-${i}`} t={t} />
              ))}
            </div>
          </div>
          <div className="tm__fade tm__fade--r" />
        </div>

        {/* Row 2 — right */}
        <div className="tm__row-wrap">
          <div className="tm__fade tm__fade--l" />
          <div className="tm__track tm__track--rev">
            <div className="tm__reel">
              {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
                <TestimonialCard key={`r2-${t.id}-${i}`} t={t} />
              ))}
            </div>
          </div>
          <div className="tm__fade tm__fade--r" />
        </div>

      </div>

      {/* ── Trust badges ── */}
      <div className="tm__trust">
        {TRUST_BADGES.map((b, i) => (
          <div key={i} className="tm__badge">
            <div className="tm__badge-icon-wrap" style={{ color: b.color, background: `${b.color}15` }}>
              <FontAwesomeIcon icon={b.icon} className="tm__badge-icon" />
            </div>
            <span className="tm__badge-label">{b.label}</span>
          </div>
        ))}
      </div>

    </section>
  )
}