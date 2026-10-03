import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'
import HelpPage from '@/pages/HelpPage'
import InfoPage from '@/pages/InfoPage'

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

// Layout chứa Navbar + Routes + Footer, có scroll-to-top khi đổi trang
function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/products"      element={<ComingSoon title="Danh sách sản phẩm" />} />
          <Route path="/search"        element={<ComingSoon title="Kết quả tìm kiếm" />} />
          <Route path="/cart"          element={<ComingSoon title="Giỏ hàng" />} />
          <Route path="/login"         element={<ComingSoon title="Đăng nhập" />} />
          <Route path="/register"      element={<ComingSoon title="Đăng ký" />} />
          <Route path="/auction/about" element={<ComingSoon title="Giới thiệu đấu giá" />} />

          {/* Help pages */}
          <Route path="/help"                     element={<HelpPage />} />
          <Route path="/help/:groupSlug"           element={<HelpPage />} />
          <Route path="/help/:groupSlug/:itemSlug" element={<HelpPage />} />

          {/* About & Policies — dùng chung InfoPage, phân biệt bằng defaultGroup */}
          <Route path="/info"                     element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug"           element={<InfoPage defaultGroup="about" />} />
          <Route path="/info/:groupSlug/:itemSlug" element={<InfoPage defaultGroup="about" />} />

          {/* Redirect các URL cũ */}
          <Route path="/about"    element={<Navigate to="/info/about/overview"   replace />} />
          <Route path="/policies" element={<Navigate to="/info/policies/terms"   replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
