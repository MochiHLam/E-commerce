import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerHome, getSellerStatus } from '@/features/seller/lib/sellerState'

export default function RequireSeller() {
  const { isLoggedIn, user } = useAuth()

  if (!isLoggedIn) return <Navigate to="/seller" replace />
  if (user?.role !== 'user') return <Navigate to="/seller" replace />

  const status = getSellerStatus(user.id)
  if (!['approved', 'suspended', 'banned', 'pending_deletion', 'deleted'].includes(status)) {
    return <Navigate to={getSellerHome(user.id)} replace />
  }
  return <Outlet />
}
