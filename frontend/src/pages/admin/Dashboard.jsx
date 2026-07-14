import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine, faClipboardList, faUsers, faBox,
  faArrowUp, faArrowDown, faCircleCheck, faClock,
  faTruck, faXmark, faTriangleExclamation, faArrowsRotate,
  faBoxOpen, faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import { colourToHex } from '../../utils/helpers'
import './Dashboard.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}` }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const STATUS_META = {
  confirmed: { label: 'Confirmed', icon: faCircleCheck, color: '#16A34A' },
  processing: { label: 'Processing', icon: faClock, color: '#D97706' },
  shipped: { label: 'Shipped', icon: faTruck, color: '#2563EB' },
  delivered: { label: 'Delivered', icon: faCircleCheck, color: '#16A34A' },
  cancelled: { label: 'Cancelled', icon: faXmark, color: '#DC2626' },
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }) {
  return (
    <div className="db__kpi" style={{ '--kpi-color': color }}>
      <div className="db__kpi-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="db__kpi-body">
        <p className="db__kpi-label">{label}</p>
        <p className="db__kpi-value">{value}</p>
        {sub && <p className="db__kpi-sub">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Simple bar chart (no external lib) ──────────────────────────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="db__chart-empty">No revenue data yet</div>
  )

  const max = Math.max(...data.map(d => d.revenue))

  return (
    <div className="db__chart">
      <div className="db__chart-bars">
        {data.map((d, i) => (
          <div key={i} className="db__chart-col">
            <div className="db__chart-bar-wrap">
              <div
                className="db__chart-bar"
                style={{ height: `${max > 0 ? (d.revenue / max) * 100 : 0}%` }}
                title={`${d.date}: ${fmt(d.revenue)}`}
              />
            </div>
            {i % Math.ceil(data.length / 6) === 0 && (
              <span className="db__chart-label">
                {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="db__chart-legend">
        <span>₹0</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [chart, setChart] = useState([])
  const [chartDays, setChartDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    adminService.getRevenueChart(chartDays)
      .then(res => setChart(res.data?.chart || []))
      .catch(() => { })
  }, [chartDays])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, chartRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getRevenueChart(chartDays),
      ])
      setOverview(overviewRes.data)
      setChart(chartRes.data?.chart || [])
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="db__page">
      <div className="db__skeleton-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="db__shimmer db__skeleton-kpi" />
        ))}
      </div>
      <div className="db__shimmer db__skeleton-chart" />
    </div>
  )

  if (error) return (
    <div className="db__page">
      <div className="db__error">
        <FontAwesomeIcon icon={faTriangleExclamation} />
        <p>{error}</p>
        <button className="db__retry-btn" onClick={loadData}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Retry
        </button>
      </div>
    </div>
  )

  const { kpis, recentOrders, lowStock } = overview || {}

  return (
    <div className="db__page">

      {/* ── Header ── */}
      <div className="db__header">
        <div>
          <h1 className="db__title">Dashboard</h1>
          <p className="db__sub">Month to date overview</p>
        </div>
        <button className="db__refresh-btn" onClick={loadData}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="db__kpi-grid">
        <KpiCard
          label="Revenue MTD"
          value={fmt(kpis?.totalRevenue || 0)}
          icon={faChartLine}
          color="#C9A96E"
          sub="Paid orders only"
        />
        <KpiCard
          label="Orders MTD"
          value={kpis?.totalOrders || 0}
          icon={faClipboardList}
          color="#2563EB"
          sub="All statuses"
        />
        <KpiCard
          label="New Customers"
          value={kpis?.newCustomers || 0}
          icon={faUsers}
          color="#7C3AED"
          sub="Registered this month"
        />
        <KpiCard
          label="Active Products"
          value={kpis?.productsInStock || 0}
          icon={faBox}
          color="#16A34A"
          sub="Live in catalogue"
        />
      </div>

      {/* ── Revenue chart ── */}
      <div className="db__card">
        <div className="db__card-header">
          <h2 className="db__card-title">Revenue</h2>
          <div className="db__chart-tabs">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                className={`db__chart-tab ${chartDays === d ? 'db__chart-tab--active' : ''}`}
                onClick={() => setChartDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <RevenueChart data={chart} />
      </div>

      <div className="db__grid-2">

        {/* ── Recent orders ── */}
        <div className="db__card">
          <div className="db__card-header">
            <h2 className="db__card-title">Recent Orders</h2>
            <Link to="/admin/orders" className="db__card-link">
              View all <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
          <div className="db__table-wrap">
            <table className="db__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="db__table-empty">No orders yet</td>
                  </tr>
                )}
                {recentOrders?.map(order => {
                  const meta = STATUS_META[order.status] || STATUS_META.confirmed
                  const name = order.order_addresses?.[0]?.name || order.profiles?.name || 'Guest'
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} className="db__order-id">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <span className="db__order-date">{fmtDate(order.created_at)}</span>
                      </td>
                      <td className="db__table-name">{name}</td>
                      <td className="db__table-mono">{fmt(order.total)}</td>
                      <td>
                        <span className="db__status-pill"
                          style={{ color: meta.color, background: `${meta.color}18` }}>
                          <FontAwesomeIcon icon={meta.icon} />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Low stock ── */}
        <div className="db__card">
          <div className="db__card-header">
            <h2 className="db__card-title">
              Low Stock
              {lowStock?.length > 0 && (
                <span className="db__card-badge">{lowStock.length}</span>
              )}
            </h2>
            <Link to="/admin/inventory" className="db__card-link">
              Manage <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>

          {lowStock?.length === 0 ? (
            <div className="db__empty-state">
              <FontAwesomeIcon icon={faBoxOpen} />
              <p>All products well stocked</p>
            </div>
          ) : (
            <div className="db__table-wrap">
              <table className="db__table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock?.map(v => (
                    <tr key={v.id}>
                      <td className="db__table-name">
                        <Link to={`/admin/products/${v.products?.id}/manage`} className="db__variant-link">
                          {v.products?.name}
                        </Link>
                      </td>
                      <td className="db__table-muted">
                        <span className="db__variant-swatch" style={{ background: v.colour_hex || colourToHex(v.colour) }} />
                        {v.colour} / {v.size}
                      </td>
                      <td>
                        <span className={`db__stock-pill ${v.stock === 0 ? 'db__stock-pill--out' : 'db__stock-pill--low'}`}>
                          {v.stock === 0 ? 'Out' : v.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}