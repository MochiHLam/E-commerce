import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import FloatingChatButton from '@/components/FloatingChatButton'
import { useAuth } from '@/context/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import RequireGuest from '@/components/RequireGuest'
import LoginPage from '@/features/auth/pages/LoginPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import OtpPage from '@/features/auth/pages/OtpPage'
import OnboardPage from '@/features/auth/pages/OnboardPage'
import RoleLoginPage from '@/features/auth/pages/RoleLoginPage'
import SellerAccessPage from '@/features/seller/pages/SellerAccessPage'
import SellerOnboardingPage from '@/features/seller/pages/SellerOnboardingPage'
import SellerPendingPage from '@/features/seller/pages/SellerPendingPage'
import SellerDashboardPage from '@/features/seller/pages/SellerDashboardPage'
import SellerInformationPage from '@/features/seller/pages/SellerInformationPage'
import SellerOrdersPage from '@/features/seller/pages/SellerOrdersPage'
import SellerProductsPage from '@/features/seller/pages/SellerProductsPage'
import SellerRevenuePage from '@/features/seller/pages/SellerRevenuePage'
import SellerWalletPage from '@/features/seller/pages/SellerWalletPage'
import SellerSettingsPage from '@/features/seller/pages/SellerSettingsPage'
import SellerPublicLayout from '@/features/seller/layouts/SellerPublicLayout'
import SellerFlowLayout from '@/features/seller/layouts/SellerFlowLayout'
import SellerLayout from '@/features/seller/layouts/SellerLayout'
import RequireSeller from '@/features/seller/guards/RequireSeller'
import RequireSellerOwner from '@/features/seller/guards/RequireSellerOwner'
import RequireRole from '@/components/RequireRole'
import StaffLayout from '@/features/staff/layouts/StaffLayout'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import AdminFinancePage from '@/features/admin/pages/AdminFinancePage'
import AdminQueuePage from '@/features/admin/pages/AdminQueuePage'
import AdminSectionPage from '@/features/admin/pages/AdminSectionPage'
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage'
import AdminShopsManagementPage from '@/features/admin/pages/AdminShopsManagementPage'
import AdminCategoriesPage from '@/features/admin/pages/AdminCategoriesPage'
import AdminCatalogProductsPage, {
  AdminProductDetailPage,
  AdminShopProductsPage,
} from '@/features/admin/pages/AdminCatalogProductsPage'
import AdminModerationPage from '@/features/admin/pages/AdminModerationPage'
import SellerApplicationsReviewPage from '@/features/seller/pages/SellerApplicationsReviewPage'

function FloatingChatRouteGate({ isLoggedIn, role }) {
  const { pathname } = useLocation()
  const isSellerRoute = pathname === '/seller' || pathname.startsWith('/seller/')
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAuthRoute = ['/login', '/forgot-password', '/register'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  const isBuyerRoute = !isSellerRoute && !isAdminRoute && !isAuthRoute

  return isLoggedIn && role === 'user' && (isSellerRoute || isBuyerRoute)
    ? <FloatingChatButton />
    : null
}

export default function App() {
  const { isLoggedIn, role } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
          <Route path="/register/verify" element={<AuthLayout><OtpPage /></AuthLayout>} />
          <Route path="/register/onboard" element={<AuthLayout><OnboardPage /></AuthLayout>} />
        </Route>
        <Route path="/admin" element={<RoleLoginPage role="admin" />} />
        <Route element={<RequireRole roles={['admin']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/seller-applications" element={<SellerApplicationsReviewPage />} />
            <Route path="/admin/shops" element={<AdminShopsManagementPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/catalog" element={<Navigate to="/admin/catalog/products" replace />} />
            <Route path="/admin/catalog/products" element={<AdminCatalogProductsPage />} />
            <Route path="/admin/catalog/products/:shopId" element={<AdminShopProductsPage />} />
            <Route path="/admin/catalog/products/:shopId/:productId" element={<AdminProductDetailPage />} />
            <Route path="/admin/catalog/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/moderation" element={<AdminModerationPage />} />
            <Route path="/admin/auctions" element={<AdminSectionPage title="Quản lý đấu giá" />} />
            <Route
              path="/admin/auctions/items"
              element={(
                <AdminQueuePage
                  title="Vật phẩm đấu giá chờ duyệt"
                  description="Theo dõi vật phẩm đang chờ admin phê duyệt trước khi đưa vào phiên."
                  source="Chưa có dữ liệu vật phẩm đấu giá chờ duyệt trong mock. Hàng đợi sẽ hiển thị tại đây khi module đấu giá được tích hợp."
                  backTo="/admin/auctions"
                  backLabel="Mở quản lý đấu giá"
                />
              )}
            />
            <Route path="/admin/settings" element={<AdminSectionPage title="Cấu hình hệ thống" />} />
            <Route path="/admin/audit-log" element={<AdminSectionPage title="Nhật ký hoạt động" />} />
            <Route path="/admin/finance" element={<AdminFinancePage />} />
          </Route>
        </Route>
        <Route path="/seller" element={<SellerPublicLayout />}>
          <Route index element={<SellerAccessPage />} />
          <Route path="register" element={<Navigate to="/register" replace state={{ returnTo: '/seller' }} />} />
        </Route>
        <Route element={<SellerFlowLayout />}>
          <Route path="/seller/onboarding" element={<SellerOnboardingPage />} />
          <Route path="/seller/pending" element={<SellerPendingPage />} />
        </Route>
        <Route element={<RequireSeller />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/information" element={<SellerInformationPage />} />
            <Route path="/seller/information/edit" element={<SellerOnboardingPage isInformationUpdate />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route element={<RequireSellerOwner />}>
              <Route path="/seller/revenue" element={<SellerRevenuePage />} />
              <Route path="/seller/wallet" element={<SellerWalletPage />} />
              <Route path="/seller/settings" element={<SellerSettingsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <FloatingChatRouteGate isLoggedIn={isLoggedIn} role={role} />
    </BrowserRouter>
  )
}
