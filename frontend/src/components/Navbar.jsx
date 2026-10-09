import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * variant: 'default' | 'auction' | 'auth'
 * - 'default': green bg, white text, search bar + auth buttons
 * - 'auction': green bg, white text, auth buttons only (no search)
 * - 'auth':    white/gray bg, green text, logo only (no search, no auth buttons)
 */
export default function Navbar({ variant = 'default' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const isAuth = variant === 'auth'
  const showSearch = variant === 'default'

  return (
    <header className={`w-full sticky top-0 z-50 ${isAuth ? 'bg-[#f5f5f5] border-b border-gray-200' : 'bg-[#056F1C]'}`}>
      <div className="max-w-[1500px] mx-auto px-0 h-[76px] flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={isAuth ? '/images/contrast_logo.png' : '/images/main_logo.png'}
            alt="NaviShop"
            className={`h-8 w-8 object-contain ${isAuth ? '' : 'brightness-0 invert'}`}
          />
          <span className={`font-bold text-lg tracking-wide ${isAuth ? 'text-[#056F1C]' : 'text-white'}`}>
            NaviShop
          </span>
        </Link>

        {!isAuth && (
          <>
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    id="navbar-search-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm Vật phẩm hoặc Cửa hàng ..."
                    className="w-full h-9 rounded pl-4 pr-10 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white/40 placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    id="navbar-search-btn"
                    className="absolute right-0 top-0 h-9 px-3 flex items-center text-gray-500 hover:text-[#056F1C] transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1" />
            )}

            {/* Auth buttons */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <Link
                to="/register"
                id="navbar-register-btn"
                className="text-sm text-white font-medium hover:text-green-200 transition-colors"
              >
                Đăng ký
              </Link>
              <span className="text-white/40 select-none">|</span>
              <Link
                to="/login"
                id="navbar-login-btn"
                className="text-sm text-white font-medium hover:text-green-200 transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
