import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireRole({ roles }) {
  const { isLoggedIn, user } = useAuth()
  const { pathname, search } = useLocation()

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ returnTo: pathname + search }} />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
