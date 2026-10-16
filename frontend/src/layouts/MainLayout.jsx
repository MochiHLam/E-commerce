import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ComingSoon from '@/components/ComingSoon'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import AccountPage from '@/features/account/AccountPage'
import RequireAuth from '@/components/RequireAuth'
import RequireRole from '@/components/RequireRole'
import AuctionAboutPage from '@/features/auction/pages/AuctionAboutPage'
import AuctionHistoryDetailPage from '@/features/auction/pages/AuctionHistoryDetailPage'
import AuctionHistoryItemPage from '@/features/auction/pages/AuctionHistoryItemPage'
import AuctionSessionItemPage from '@/features/auction/pages/AuctionSessionItemPage'
import AuctionSessionPage from '@/features/auction/pages/AuctionSessionPage'
import ProductDetailPage from '@/features/products/pages/ProductDetailPage'
import CartPage from '@/features/products/pages/CartPage'
import CheckoutPage from '@/features/products/pages/CheckoutPage'
import HelpPage from '@/pages/HelpPage'
import HomePage from '@/pages/HomePage'
import InfoPage from '@/pages/InfoPage'
import MockShopPage from '@/pages/MockShopPage'
import SearchPage from '@/features/search/pages/SearchPage'

export default function MainLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  const isAuctionPage = pathname.startsWith('/auction')

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar variant={isAuctionPage ? 'auction' : 'default'} />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ComingSoon title="Danh sách sản phẩm" />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/:shopSlug" element={<MockShopPage />} />
          <Route path="/auction/about" element={<AuctionAboutPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account/profile" element={<AccountPage section="profile" />} />
            <Route path="/user/account/address" element={<AccountPage section="address" />} />
            <Route path="/user/account/password" element={<AccountPage section="password" />} />
            <Route path="/user/account/notifications" element={<AccountPage section="notifications" />} />
            <Route path="/user/wallet" element={<AccountPage section="wallet" />} />
            <Route path="/user/wallet/history" element={<AccountPage section="wallet-history" />} />
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
          <Route path="/help" element={<HelpPage />} />
          <Route path="/help/:groupSlug" element={<HelpPage />} />
          <Route path="/help/:groupSlug/:itemSlug" element={<HelpPage />} />
          <Route path="/info" element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug" element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug/:itemSlug" element={<InfoPage defaultGroup="about" />} />
          <Route path="/about" element={<Navigate to="/info/about/overview" replace />} />
          <Route path="/policies" element={<Navigate to="/info/policies/terms" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
