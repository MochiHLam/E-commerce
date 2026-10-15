import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: gọi API gửi OTP về email
    navigate('/register/verify', { state: { email } })
  }

  return (
    <main className="flex-1 bg-[#056F1C] flex items-center justify-center py-12 px-[210px]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
        <p className="text-sm text-gray-500 mb-7">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#056F1C] font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
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

          <button
            id="register-email-btn"
            type="submit"
            className="w-full h-10 rounded-lg bg-[#056F1C] text-white font-semibold text-sm
              hover:bg-[#045a16] active:scale-[0.99] transition-all"
          >
            Tiếp tục
          </button>
        </form>

        {/* Divider + Google */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          id="register-google-btn"
          type="button"
          className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-center gap-2
            text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-4 w-4" />
          Tiếp tục với Google
        </button>
      </div>
    </main>
  )
}
