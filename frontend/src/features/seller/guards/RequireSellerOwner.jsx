import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication, isSellerShopOwner } from '@/mocks/seller'

export default function RequireSellerOwner() {
  const { isLoggedIn, user } = useAuth()
  const application = user?.id ? getSellerApplication(user.id) : null

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!isSellerShopOwner(application, user.id)) return <Navigate to="/seller/dashboard" replace />

  return <Outlet />
}
