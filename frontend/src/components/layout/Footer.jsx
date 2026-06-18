import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faInstagram, faTwitter, faPinterest, faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import {
    faArrowRight, faLocationDot, faPhone, faEnvelope,
    faShieldHalved, faTruck, faRotateLeft, faLeaf,
} from '@fortawesome/free-solid-svg-icons'
import './Footer.css'

const LINKS = {
    shop: [
        { label: 'New Arrivals', to: '/products?sort=newest' },
        { label: 'Best Sellers', to: '/products?tag=best-seller' },
        { label: 'Dresses', to: '/products?category=dresses' },
        { label: 'Tops & Shirts', to: '/products?category=tops' },
        { label: 'Co-Ord Sets', to: '/products?category=coord-sets' },
        { label: 'Sale', to: '/products?sale=true' },
    ],
    help: [
        { label: 'Size Guide', to: '/size-guide' },
        { label: 'Track Order', to: '/account' },
        { label: 'Returns & Exchanges', to: '/returns' },
        { label: 'Shipping Info', to: '/shipping' },
        { label: 'FAQs', to: '/faqs' },
        { label: 'Contact Us', to: '/contact' },
    ],
    company: [
        { label: 'About Us', to: '/about' },
        { label: 'Our Story', to: '/about#story' },
        { label: 'Sustainability', to: '/sustainability' },
        { label: 'Artisan Program', to: '/artisans' },
        { label: 'Careers', to: '/careers' },
        { label: 'Press', to: '/press' },
    ],
}

const SOCIALS = [
    { icon: faInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: faPinterest, href: 'https://pinterest.com', label: 'Pinterest' },
    { icon: faYoutube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: faTwitter, href: 'https://twitter.com', label: 'Twitter' },
]

const TRUST = [
    {
        icon: faTruck,
        label: 'Free Shipping',
        sub: 'On orders above ₹999',
        color: '#C9A96E',
    },
    {
        icon: faRotateLeft,
        label: 'Easy Returns',
        sub: '15-day return policy',
        color: '#7EB8A4',
    },
    {
        icon: faShieldHalved,
        label: 'Secure Payment',
        sub: '100% safe checkout',
        color: '#8B9EC7',
    },
    {
        icon: faLeaf,
        label: 'Sustainable',
        sub: 'Natural fabrics only',
        color: '#95B87A',
    },
]
const PAYMENTS = ['VISA', 'MC', 'UPI', 'GPay', 'RazorPay']

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="ft">

            {/* ── Background ── */}
            <div className="ft__bg" aria-hidden="true">
                <div className="ft__bg-grid" />
                <div className="ft__bg-glow ft__bg-glow--l" />
                <div className="ft__bg-glow ft__bg-glow--r" />
                <div className="ft__bg-top-line" />
            </div>

            {/* ── Trust bar ── */}
            <div className="ft__trust-bar">
                <div className="ft__trust-inner">
                    {TRUST.map((t, i) => (
                        <div key={i} className="ft__trust-item">
                            <div
                                className="ft__trust-icon"
                                style={{
                                    background: `${t.color}12`,
                                    borderColor: `${t.color}25`,
                                    color: t.color,
                                }}
                            >
                                <FontAwesomeIcon icon={t.icon} />
                            </div>
                            <div className="ft__trust-text">
                                <span className="ft__trust-label">{t.label}</span>
                                <span className="ft__trust-sub">{t.sub}</span>
                            </div>
                            {i < TRUST.length - 1 && (
                                <div className="ft__trust-divider" aria-hidden="true" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main footer body ── */}
            <div className="ft__body">
                <div className="ft__inner">

                    {/* ── Brand column ── */}
                    <div className="ft__brand">
                        <Link to="/" className="ft__logo">
                            <span className="ft__logo-name">DRAPE</span>
                            <span className="ft__logo-sub">STUDIO</span>
                        </Link>

                        <p className="ft__brand-desc">
                            Conscious clothing for the modern wardrobe. Made with natural fabrics, crafted by skilled artisans, designed to last.
                        </p>

                        {/* Contact */}
                        <div className="ft__contact">
                            <a href="mailto:hello@drapestudio.in" className="ft__contact-item">
                                <FontAwesomeIcon icon={faEnvelope} />
                                hello@drapestudio.in
                            </a>
                            <a href="tel:+919876543210" className="ft__contact-item">
                                <FontAwesomeIcon icon={faPhone} />
                                +91 98765 43210
                            </a>
                            <span className="ft__contact-item">
                                <FontAwesomeIcon icon={faLocationDot} />
                                Mumbai, Maharashtra, India
                            </span>
                        </div>

                        {/* Socials */}
                        <div className="ft__socials">
                            {SOCIALS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ft__social"
                                    aria-label={s.label}
                                >
                                    <FontAwesomeIcon icon={s.icon} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Link columns ── */}
                    {Object.entries(LINKS).map(([section, links]) => (
                        <div key={section} className="ft__col">
                            <div className="ft__col-header">
                                <h4 className="ft__col-title">
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </h4>
                                <div className="ft__col-title-line" />
                            </div>
                            <ul className="ft__col-list">
                                {links.map((l, i) => (
                                    <li key={l.label}>
                                        <Link
                                            to={l.to}
                                            className="ft__link"
                                            style={{ transitionDelay: `${i * 20}ms` }}
                                        >
                                            <span className="ft__link-dot" />
                                            <span className="ft__link-label">{l.label}</span>
                                            <FontAwesomeIcon
                                                icon={faArrowRight}
                                                className="ft__link-arrow"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="ft__bottom">
                <div className="ft__bottom-inner">

                    <p className="ft__copy">
                        © {year} Drape Studio. All rights reserved.
                    </p>

                    {/* Payment icons */}
                    <div className="ft__payments">
                        {[
                            {
                                name: 'Visa',
                                src: 'https://www.vistaplan-drawingmanagement.co.uk/wp-content/uploads/2016/04/payment_visa.png',
                                bg: '#FFFFFF',
                            },
                            {
                                name: 'Mastercard',
                                src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
                                bg: '#FFFFFF',
                            },
                            {
                                name: 'UPI',
                                src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg',
                                bg: '#FFFFFF',
                            },
                            {
                                name: 'GPay',
                                src: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
                                bg: '#FFFFFF',
                            },
                            {
                                name: 'Razorpay',
                                src: 'https://razorpay.com/favicon.png',
                                bg: '#FFFFFF',
                            },
                        ].map((p) => (
                            <div
                                key={p.name}
                                className="ft__pay-badge"
                                style={{ background: p.bg }}
                                title={p.name}
                            >
                                <img
                                    src={p.src}
                                    alt={p.name}
                                    className="ft__pay-img"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="ft__legal">
                        <Link to="/privacy" className="ft__legal-link">Privacy Policy</Link>
                        <span className="ft__legal-dot" />
                        <Link to="/terms" className="ft__legal-link">Terms of Use</Link>
                        <span className="ft__legal-dot" />
                        <Link to="/cookies" className="ft__legal-link">Cookies</Link>
                    </div>

                </div>
            </div>

        </footer>
    )
}