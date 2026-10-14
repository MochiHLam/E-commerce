import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'
import HelpPage from '@/pages/HelpPage'
import InfoPage from '@/pages/InfoPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OtpPage from '@/pages/OtpPage'
import OnboardPage from '@/pages/OnboardPage'
import RoleLoginPage from '@/pages/RoleLoginPage'
import AuctionAboutPage from '@/pages/AuctionAboutPage'
import AuctionHistoryDetailPage from '@/pages/AuctionHistoryDetailPage'
import AuctionHistoryItemPage from '@/pages/AuctionHistoryItemPage'
import AuctionSessionPage from '@/pages/AuctionSessionPage'
import AuctionSessionItemPage from '@/pages/AuctionSessionItemPage'
import AccountPage from '@/pages/AccountPage'
import RequireRole from '@/components/RequireRole'
import RequireAuth from '@/components/RequireAuth'
import FloatingChatButton from '@/components/FloatingChatButton'
import MockShopPage from '@/pages/MockShopPage'

// Trang chưa hoàn thiện
function ComingSoon({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 py-20">
      <span className="text-6xl">🚧</span>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-500">Trang này đang được phát triển, vui lòng quay lại sau!</p>
    </div>
  )
}

// Layout cho trang auth: navbar trắng xám, thân xanh lá, có footer
function AuthLayout({ children }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="auth" />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  )
}

// Layout chính: navbar xanh + footer
function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  const isAuctionPage = pathname.startsWith('/auction')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant={isAuctionPage ? 'auction' : 'default'} />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/products"      element={<ComingSoon title="Danh sách sản phẩm" />} />
          {/* TODO: wrap the real search page in RequireAuth and preserve the full URL as returnTo. */}
          <Route path="/search"        element={<ComingSoon title="Kết quả tìm kiếm" />} />
          <Route path="/cart"          element={<ComingSoon title="Giỏ hàng" />} />
          <Route path="/:shopSlug"     element={<MockShopPage />} />
          <Route path="/auction/about" element={<AuctionAboutPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account/profile" element={<AccountPage section="profile" />} />
            <Route path="/user/account/address" element={<AccountPage section="address" />} />
            <Route path="/user/account/password" element={<AccountPage section="password" />} />
            <Route path="/user/account/notifications" element={<AccountPage section="notifications" />} />
            <Route path="/user/orders" element={<AccountPage section="orders" />} />
            <Route path="/user/auctions" element={<AccountPage section="auctions" />} />
            <Route path="/auction/history/:sessionId" element={<AuctionHistoryDetailPage />} />
            <Route path="/auction/history/:sessionId/items/:itemId" element={<AuctionHistoryItemPage />} />
            <Route path="/auction/:id" element={<AuctionSessionPage />} />
            <Route path="/auction/:id/items/:itemId" element={<AuctionSessionItemPage />} />
          </Route>
          <Route element={<RequireRole roles={['mod']} />}>
            <Route path="/moderator/*" element={<ComingSoon title="Dashboard kiểm duyệt" />} />
            <Route path="/mod/*" element={<Navigate to="/moderator/dashboard" replace />} />
          </Route>
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/admin/*" element={<ComingSoon title="Dashboard quản trị" />} />
          </Route>

          {/* Help pages */}
          <Route path="/help"                     element={<HelpPage />} />
          <Route path="/help/:groupSlug"           element={<HelpPage />} />
          <Route path="/help/:groupSlug/:itemSlug" element={<HelpPage />} />

          {/* About & Policies */}
          <Route path="/info"                     element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug"           element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug/:itemSlug" element={<InfoPage defaultGroup="about" />} />

          {/* Redirect cũ */}
          <Route path="/about"    element={<Navigate to="/info/about/overview" replace />} />
          <Route path="/policies" element={<Navigate to="/info/policies/terms" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — layout riêng, truyền page trực tiếp qua children */}
        <Route path="/login"             element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/admin"             element={<RoleLoginPage role="admin" />} />
        <Route path="/moderator"         element={<RoleLoginPage role="mod" />} />
        <Route path="/register"          element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/register/verify"   element={<AuthLayout><OtpPage /></AuthLayout>} />
        <Route path="/register/onboard"  element={<AuthLayout><OnboardPage /></AuthLayout>} />

        {/* Tất cả trang còn lại */}
        <Route path="/*" element={<Layout />} />
      </Routes>
      <FloatingChatButton />
    </BrowserRouter>
  )
}

export default App
