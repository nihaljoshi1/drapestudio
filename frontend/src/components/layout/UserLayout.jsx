import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import ErrorBoundary from '../common/ErrorBoundary'

export default function UserLayout() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <main>
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}