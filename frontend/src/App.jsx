import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FloatingChatButton from '@/components/FloatingChatButton'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import OtpPage from '@/features/auth/pages/OtpPage'
import OnboardPage from '@/features/auth/pages/OnboardPage'
import RoleLoginPage from '@/features/auth/pages/RoleLoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/admin" element={<RoleLoginPage role="admin" />} />
        <Route path="/moderator" element={<RoleLoginPage role="mod" />} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/register/verify" element={<AuthLayout><OtpPage /></AuthLayout>} />
        <Route path="/register/onboard" element={<AuthLayout><OnboardPage /></AuthLayout>} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <FloatingChatButton />
    </BrowserRouter>
  )
}
