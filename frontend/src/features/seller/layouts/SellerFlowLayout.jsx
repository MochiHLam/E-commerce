import { Outlet } from 'react-router-dom'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function SellerFlowLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar variant="seller" />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
