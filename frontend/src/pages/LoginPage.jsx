import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: gọi API đăng nhập, chỉ login() khi API trả token thật
    login('mock-token')
    navigate(location.state?.returnTo ?? '/', { replace: true })
  }

  return (
    <main className="flex-1 bg-[#056F1C] flex items-stretch min-h-[calc(100vh-76px)]">
      <div className="w-full flex items-center">

        {/* ── Left 60%: Auth Banner — sát mép trái ── */}
        <div className="w-[60%] shrink-0 flex items-center justify-center pl-[210px] py-12">
          <img
            src="/images/auth_banner.webp"
            alt="NaviShop auth banner"
            className="w-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* ── Right 40%: Login form — padding phải 210px ── */}
        <div className="flex-1 flex items-center justify-center pr-[210px] py-12">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
            <p className="text-sm text-gray-500 mb-7">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#056F1C] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-10 px-4 rounded-lg border border-gray-300 text-sm outline-none
                    focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 transition-all
                    placeholder:text-gray-300"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700" htmlFor="login-password">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[#056F1C] hover:underline"
                    onClick={() => {/* TODO: forgot password */ }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-4 pr-10 rounded-lg border border-gray-300 text-sm outline-none
                      focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 transition-all
                      placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {show ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full h-10 rounded-lg bg-[#056F1C] text-white font-semibold text-sm
                  hover:bg-[#045a16] active:scale-[0.99] transition-all mt-2"
              >
                Đăng nhập
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              id="login-google-btn"
              type="button"
              className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-center gap-2
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-4 w-4" />
              Tiếp tục với Google
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}
