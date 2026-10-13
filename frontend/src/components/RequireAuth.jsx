import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireAuth() {
  const { isLoggedIn } = useAuth()
  const { pathname, search } = useLocation()

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ returnTo: pathname + search }} />
  return <Outlet />
}
