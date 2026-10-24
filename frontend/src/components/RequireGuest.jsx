import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const GUEST_ONLY_PATHS = [
  '/login',
  '/forgot-password',
  '/register',
  '/register/verify',
  '/register/onboard',
]

export default function RequireGuest() {
  const { isLoggedIn } = useAuth()
  const { pathname, state } = useLocation()

  if (isLoggedIn) {
    const returnTo = pathname === '/login' ? state?.returnTo : null
    const isSafeReturnTo = typeof returnTo === 'string'
      && returnTo.startsWith('/')
      && !returnTo.startsWith('//')
      && !GUEST_ONLY_PATHS.some((path) => (
        returnTo === path || returnTo.startsWith(`${path}/`)
      ))

    return <Navigate to={isSafeReturnTo ? returnTo : '/'} replace />
  }
  return <Outlet />
}
