import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function AuthLayout({ children }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="auth" />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  )
}
