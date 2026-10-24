import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
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

function FloatingChatRouteGate({ isLoggedIn }) {
  const { pathname } = useLocation()
  return isLoggedIn && !pathname.startsWith('/seller') ? <FloatingChatButton /> : null
}

export default function App() {
  const { isLoggedIn } = useAuth()

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
        <Route path="/moderator" element={<RoleLoginPage role="mod" />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <FloatingChatRouteGate isLoggedIn={isLoggedIn} />
    </BrowserRouter>
  )
}
