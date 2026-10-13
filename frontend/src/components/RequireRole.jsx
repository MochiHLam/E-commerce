import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireRole({ roles }) {
  const { isLoggedIn, user } = useAuth()
  const { pathname, search } = useLocation()

  if (!isLoggedIn) {
    const loginPath = roles.includes('admin')
      ? '/admin'
      : roles.includes('mod') ? '/moderator' : '/login'
    return <Navigate to={loginPath} replace state={{ returnTo: pathname + search }} />
  }
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
