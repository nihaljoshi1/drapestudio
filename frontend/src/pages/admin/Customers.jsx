import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faArrowsRotate, faSpinner,
  faTriangleExclamation, faXmark, faChevronLeft,
  faChevronRight, faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { adminService } from '../../services/adminService'
import './Customers.css'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 15 }
      if (search) params.search = search
      const res = await adminService.getCustomers(params)
      setCustomers(res.data?.customers || [])
      setPagination(res.data?.pagination || {})
    } catch {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="cu__page">
      <div className="cu__header">
        <div>
          <h1 className="cu__title">Customers</h1>
          <p className="cu__sub">{pagination.total || 0} total customers</p>
        </div>
        <button className="cu__refresh-btn" onClick={load}>
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>

      <div className="cu__filters">
        <div className="cu__search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="cu__search-icon" />
          <input
            className="cu__search"
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="cu__search-clear" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </div>

      <div className="cu__card">
        {loading ? (
          <div className="cu__state">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </div>
        ) : error ? (
          <div className="cu__state cu__state--error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <p>{error}</p>
            <button onClick={load}>Retry</button>
          </div>
        ) : customers.length === 0 ? (
          <div className="cu__state">
            <FontAwesomeIcon icon={faUserGroup} />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="cu__table-wrap">
            <table className="cu__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="cu__name">{c.name || '—'}</td>
                    <td className="cu__td-muted">{c.email || '—'}</td>
                    <td className="cu__td-muted">{c.phone || '—'}</td>
                    <td className="cu__td-muted">{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="cu__pagination">
            <button className="cu__page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="cu__page-info">Page {page} of {pagination.totalPages}</span>
            <button className="cu__page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}