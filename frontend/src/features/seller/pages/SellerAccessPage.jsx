import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MOCK_ACCOUNTS, MOCK_PASSWORD_RESET_PREFIX } from '@/mocks/mockAccounts'
import { getSellerApplication } from '@/mocks/seller'

export default function SellerAccessPage() {
  const { user, isLoggedIn, login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  if (isLoggedIn && user?.role === 'user') {
    const application = getSellerApplication(user.id)
    if (application?.status === 'approved') return <Navigate to="/seller/dashboard" replace />
    if (application?.status === 'pending') return <Navigate to="/seller/pending" replace />
    if (application?.status === 'rejected') return <Navigate to="/seller/onboarding" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    const account = import.meta.env.DEV
      ? MOCK_ACCOUNTS.find((candidate) => (
        candidate.role === 'user'
        && candidate.email === normalizedEmail
        && (localStorage.getItem(`${MOCK_PASSWORD_RESET_PREFIX}${normalizedEmail}`) ?? candidate.password) === password
      ))
      : null
    if (!account) {
      setError('Email hoặc mật khẩu không chính xác.')
      return
    }
    const authenticatedUser = { ...account }
    delete authenticatedUser.password
    login(authenticatedUser)
    navigate(location.state?.returnTo ?? '/seller', { replace: true })
  }

  return (
    <main className="flex flex-1 items-center bg-gray-50 px-4 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="mx-auto w-full max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Bán hàng chuyên nghiệp</h2>
          <p className="mt-3 max-w-lg text-base leading-7 text-gray-600">
            Quản lý shop của bạn một cách hiệu quả hơn trên NaviShop - Online Shop
          </p>
          <img
            src="/images/seller_banner.png"
            alt="Cửa hàng NaviShop và xe giao hàng"
            className="mt-6 aspect-[3/2] w-full rounded-2xl object-cover"
          />
        </section>
        <section className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <Link to="/" className="text-sm font-bold tracking-wide text-[#056F1C]">NAVISHOP · KÊNH NGƯỜI BÁN</Link>
          {isLoggedIn && user?.role === 'user' ? (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Tài khoản NaviShop đã tồn tại</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Bạn đã đăng nhập với tài khoản người mua. Bạn có muốn đăng ký cửa hàng để bắt đầu bán hàng không?
              </p>
              <div className="mt-7 space-y-3">
                <Link to="/seller/onboarding" className="flex h-11 w-full items-center justify-center rounded-lg bg-[#056F1C] text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
                  Đăng ký cửa hàng
                </Link>
                <button type="button" onClick={logout} className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Quay lại
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Đăng nhập người bán</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Đăng nhập bằng tài khoản NaviShop của bạn để tiếp tục.
              </p>
            </>
          )}
          {isLoggedIn && user?.role !== 'user' && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Tài khoản hiện tại không phải tài khoản buyer.
              <button type="button" onClick={logout} className="ml-1 font-semibold underline">Đăng xuất</button>
            </div>
          )}
          {!isLoggedIn && (
            <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="seller-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="seller-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setError('') }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="seller-password" className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <input
                    id="seller-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setError('') }}
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-14 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 text-xs font-semibold text-gray-500">
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                <Link to="/forgot-password" state={{ returnTo: '/seller' }} className="mt-2 inline-block text-xs font-medium text-[#056F1C] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="h-11 w-full rounded-lg bg-[#056F1C] text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
                Đăng nhập
              </button>
            </form>
          )}
          {(!isLoggedIn || user?.role !== 'user') && (
            <>
              <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs leading-5 text-gray-500">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <Link to="/info/policies/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-[#056F1C] hover:underline">Điều khoản dịch vụ</Link>
                {' & '}
                <Link to="/info/policies/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-[#056F1C] hover:underline">Chính sách bảo mật</Link>
                {' '}của NaviShop.
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
