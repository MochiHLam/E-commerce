import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function ComingSoon({ title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl">🚧</span>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">Trang này đang được phát triển, vui lòng quay lại sau!</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ComingSoon title="Danh sách sản phẩm" />} />
          <Route path="/search" element={<ComingSoon title="Kết quả tìm kiếm" />} />
          <Route path="/cart" element={<ComingSoon title="Giỏ hàng" />} />
          <Route path="/login" element={<ComingSoon title="Đăng nhập" />} />
          <Route path="/register" element={<ComingSoon title="Đăng ký" />} />
          <Route path="/about" element={<ComingSoon title="Giới thiệu" />} />
          <Route path="/auction/about" element={<ComingSoon title="Giới thiệu đấu giá" />} />
          <Route path="/help/:slug" element={<ComingSoon title="Trợ giúp" />} />
          <Route path="/policies" element={<ComingSoon title="Chính sách" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
