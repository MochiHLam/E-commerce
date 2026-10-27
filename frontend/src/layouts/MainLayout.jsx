import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import AccountPage from '@/features/account/AccountPage'
import ReportNotificationPage from '@/features/account/pages/ReportNotificationPage'
import AuctionOrderCreationPage from '@/features/account/pages/AuctionOrderCreationPage'
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
import OrderSuccessPage from '@/features/products/pages/OrderSuccessPage'
import HelpPage from '@/pages/HelpPage'
import HomePage from '@/pages/HomePage'
import InfoPage from '@/pages/InfoPage'
import MockShopPage from '@/pages/MockShopPage'
import SearchPage from '@/features/search/pages/SearchPage'

export default function MainLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  const isAuctionPage = pathname.startsWith('/auction')
  const isFooterContentRoute = pathname.startsWith('/help') || pathname.startsWith('/info')

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar variant={isFooterContentRoute ? 'content' : isAuctionPage ? 'auction' : 'default'} />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Navigate to="/search" replace />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/:shopSlug" element={<MockShopPage />} />
          <Route path="/auction/about" element={<AuctionAboutPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/search" element={<SearchPage />} />
          </Route>
          <Route element={<RequireRole roles={['user']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account" element={<Navigate to="/user/account/profile" replace />} />
            <Route path="/user/account/profile" element={<AccountPage section="profile" />} />
            <Route path="/user/account/address" element={<AccountPage section="address" />} />
            <Route path="/user/account/password" element={<AccountPage section="password" />} />
            <Route path="/user/account/notifications" element={<Navigate to="/user/notifications" replace />} />
            <Route path="/user/notifications" element={<AccountPage section="notifications" />} />
            <Route path="/user/notifications/orders" element={<AccountPage section="notification-orders" />} />
            <Route path="/user/notifications/auctions" element={<AccountPage section="notification-auctions" />} />
            <Route path="/user/naviwallet/wallet" element={<AccountPage section="wallet" />} />
            <Route path="/user/naviwallet/history" element={<AccountPage section="wallet-history" />} />
            <Route path="/user/payment/wallet" element={<Navigate to="/user/naviwallet/wallet" replace />} />
            <Route path="/user/wallet" element={<AccountPage section="wallet" />} />
            <Route path="/user/wallet/history" element={<Navigate to="/user/naviwallet/history" replace />} />
            <Route path="/user/orders" element={<AccountPage section="orders" />} />
            <Route path="/user/orders/:orderId" element={<AccountPage section="orders" />} />
            <Route path="/user/auctions" element={<Navigate to="/user/auctions/history" replace />} />
            <Route path="/user/auctions/history" element={<AccountPage section="auction-history" />} />
            <Route path="/user/auctions/items" element={<AccountPage section="auction-items" />} />
            <Route path="/user/auctions/order/:itemId" element={<AuctionOrderCreationPage />} />
            <Route path="/user/reports/:reportId" element={<ReportNotificationPage />} />
            <Route path="/auction/history/:sessionId" element={<AuctionHistoryDetailPage />} />
            <Route path="/auction/history/:sessionId/items/:itemId" element={<AuctionHistoryItemPage />} />
            <Route path="/auction/:id" element={<AuctionSessionPage />} />
            <Route path="/auction/:id/items/:itemId" element={<AuctionSessionItemPage />} />
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
      <Footer showLinkGroups={!isFooterContentRoute} />
    </div>
  )
}
