import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ErrorBoundary from '../common/ErrorBoundary'
import './AdminLayout.css'

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className="al__shell">
      <AdminSidebar />
      <div className="al__content">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  )
}