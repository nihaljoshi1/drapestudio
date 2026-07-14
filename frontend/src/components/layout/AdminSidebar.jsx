import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGauge, faBox, faClipboardList, faUsers,
  faTag, faWarehouse, faLayerGroup, faRightFromBracket,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '../../store/authStore'
import './AdminSidebar.css'

const NAV = [
  { label: 'Dashboard',  href: '/admin',            icon: faGauge,         end: true },
  { label: 'Products',   href: '/admin/products',   icon: faBox            },
  { label: 'Orders',     href: '/admin/orders',     icon: faClipboardList  },
  { label: 'Customers',  href: '/admin/customers',  icon: faUsers          },
  { label: 'Inventory',  href: '/admin/inventory',  icon: faWarehouse      },
  { label: 'Coupons',    href: '/admin/coupons',    icon: faTag            },
  { label: 'Categories', href: '/admin/categories', icon: faLayerGroup     },
]

export default function AdminSidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <aside className="asb__sidebar">
      {/* Brand */}
      <div className="asb__brand">
        <span className="asb__brand-name">DRAPE</span>
        <span className="asb__brand-sub">ADMIN</span>
      </div>

      {/* Nav */}
      <nav className="asb__nav">
        {NAV.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              `asb__link ${isActive ? 'asb__link--active' : ''}`
            }
          >
            <span className="asb__link-icon">
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <span className="asb__link-label">{item.label}</span>
            <FontAwesomeIcon icon={faChevronRight} className="asb__link-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="asb__footer">
        <div className="asb__user">
          <div className="asb__user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="asb__user-info">
            <p className="asb__user-name">{user?.name?.split(' ')[0]}</p>
            <p className="asb__user-role">Administrator</p>
          </div>
        </div>
        <button className="asb__logout" onClick={handleLogout} aria-label="Sign out">
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </aside>
  )
}