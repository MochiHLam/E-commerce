import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MOCK_ACCOUNTS } from '@/data/mockAccounts'

const ROLE_CONFIG = {
  admin: {
    title: 'Đăng nhập quản trị',
    description: 'Dành cho quản trị viên NaviShop',
    dashboard: '/admin/dashboard',
  },
  mod: {
    title: 'Đăng nhập kiểm duyệt',
    description: 'Dành cho nhân viên kiểm duyệt NaviShop',
    dashboard: '/moderator/dashboard',
  },
}

export default function RoleLoginPage({ role }) {
  const config = ROLE_CONFIG[role]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [credentialsError, setCredentialsError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, login, logout } = useAuth()

  if (!config) return <Navigate to="/" replace />
  if (isLoggedIn && user?.role === role) {
    return <Navigate to={location.state?.returnTo ?? config.dashboard} replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()
    setEmailError(!normalizedEmail
      ? 'Vui lòng nhập email.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ? 'Email không đúng định dạng.'
        : '')
    setPasswordError(password ? '' : 'Vui lòng nhập mật khẩu.')
    setCredentialsError('')
    if (!normalizedEmail || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return

    const account = import.meta.env.DEV
      ? MOCK_ACCOUNTS.find((candidate) =>
        candidate.role === role
        && candidate.email === normalizedEmail.toLowerCase()
        && candidate.password === password)
      : null

    if (!account) {
      setEmailError('')
      setPasswordError('')
      setCredentialsError('Email hoặc mật khẩu không đúng với quyền truy cập này.')
      return
    }

    const authenticatedUser = { ...account }
    delete authenticatedUser.password
    login(authenticatedUser)
    navigate(location.state?.returnTo ?? config.dashboard, { replace: true })
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#056F1C] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom right, black, transparent 75%)',
          }}
        />
        <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#72D98A]/20 blur-3xl" />
        <div className="absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full bg-[#003D12]/45 blur-3xl" />
        <div className="absolute -right-24 -top-28 h-[34rem] w-[34rem] rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-12 h-[26rem] w-[26rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 left-[12%] h-[26rem] w-[26rem] rounded-full border border-white/[0.08]" />
        <div className="absolute left-[18%] top-[16%] h-24 w-24 rotate-12 rounded-3xl border border-white/10" />
      </div>

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl shadow-[#003D12]/30">
        <Link to="/" className="text-sm font-bold tracking-wide text-[#056F1C] hover:underline">
          NAVISHOP
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">{config.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{config.description}</p>

        {isLoggedIn && user?.role !== role && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>Tài khoản hiện tại không có quyền truy cập khu vực này.</p>
            <button type="button" onClick={logout} className="mt-2 font-semibold underline">
              Đăng xuất để đổi tài khoản
            </button>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="role-login-email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="role-login-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError('')
                setCredentialsError('')
              }}
              aria-invalid={Boolean(emailError || credentialsError)}
              className={`h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${emailError || credentialsError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-gray-300'}`}
              placeholder="name@navishop.vn"
            />
            {emailError && <p role="alert" className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="role-login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="role-login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setPasswordError('')
                  setCredentialsError('')
                }}
                aria-invalid={Boolean(passwordError || credentialsError)}
                className={`h-11 w-full rounded-lg border px-3 pr-16 text-sm outline-none transition focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${passwordError || credentialsError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-gray-300'}`}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {passwordError && <p role="alert" className="mt-1 text-xs text-red-600">{passwordError}</p>}
            {credentialsError && <p role="alert" className="mt-1 text-xs text-red-600">{credentialsError}</p>}
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#056F1C] text-sm font-semibold text-white transition hover:bg-[#045517] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
          >
            Đăng nhập
          </button>
        </form>

      </section>
    </main>
  )
}
