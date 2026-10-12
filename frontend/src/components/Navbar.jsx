import { Bell, CheckCheck, CircleDollarSign, Gavel, PackageCheck, Search, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

const INITIAL_NOTIFICATIONS = import.meta.env.DEV ? [
  { id: 'noti-1', type: 'order', title: 'Đơn hàng của bạn đã được xác nhận.', createdAt: Date.now() - 5 * 60_000, href: '/cart', isRead: false },
  { id: 'noti-2', type: 'auction', title: 'Phiên đấu giá mùa thu đã kết thúc.', createdAt: Date.now() - 42 * 60_000, href: '/auction/history/ses_004', isRead: false },
  { id: 'noti-3', type: 'wallet', title: 'Ví của bạn vừa được cập nhật.', createdAt: Date.now() - 3 * 60 * 60_000, href: '/account', isRead: true },
  { id: 'noti-4', type: 'report', title: 'Báo cáo của bạn đã được xử lý.', createdAt: Date.now() - 8 * 60 * 60_000, href: '/help/contact/report', isRead: true },
  { id: 'noti-5', type: 'order', title: 'Cửa hàng đã bàn giao đơn hàng cho đơn vị vận chuyển.', createdAt: Date.now() - 24 * 60 * 60_000, href: '/cart', isRead: true },
  { id: 'noti-6', type: 'auction', title: 'Phiên đấu giá sắp diễn ra.', createdAt: Date.now() - 2 * 24 * 60 * 60_000, href: '/auction/about', isRead: true },
  { id: 'noti-7', type: 'order', title: 'Đơn hàng đã giao thành công.', createdAt: Date.now() - 3 * 24 * 60 * 60_000, href: '/cart', isRead: true },
] : []

const NOTIFICATION_ICONS = {
  order: PackageCheck,
  auction: Gavel,
  wallet: CircleDollarSign,
  report: ShoppingBag,
}

function formatRelativeTime(timestamp) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

function formatPrice(price) {
  return `${new Intl.NumberFormat('vi-VN').format(price ?? 0)} ₫`
}

/**
 * variant: 'default' | 'auction' | 'auth'
 * - 'default': green bg, white text, search bar + auth buttons
 * - 'auction': green bg, white text, auth buttons only (no search)
 * - 'auth':    white/gray bg, green text, logo only (no search, no auth buttons)
 */
export default function Navbar({ variant = 'default' }) {
  const [query, setQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [isNotificationsLoading] = useState(false)
  const dropdownAreaRef = useRef(null)
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const { items: cartItems, removeFromCart } = useCart()

  useEffect(() => {
    if (!activeDropdown) return undefined

    const closeOnOutsideClick = (event) => {
      if (!dropdownAreaRef.current?.contains(event.target)) setActiveDropdown(null)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveDropdown(null)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeDropdown])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const unreadBadge = unreadCount > 9 ? '9+' : unreadCount
  const toggleDropdown = (dropdown) => {
    setActiveDropdown((current) => (current === dropdown ? null : dropdown))
  }

  const openNotification = (notification) => {
    setNotifications((current) => current.map((item) =>
      item.id === notification.id ? { ...item, isRead: true } : item,
    ))
    setActiveDropdown(null)
    navigate(notification.href)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      const returnTo = `/search?q=${encodeURIComponent(query.trim())}`
      if (!isLoggedIn) {
        navigate('/login', { state: { returnTo } })
        return
      }
      navigate(returnTo)
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
            <div ref={dropdownAreaRef} className="ml-auto flex items-center gap-3 shrink-0">
              {isLoggedIn ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Giỏ hàng"
                      title="Giỏ hàng"
                      aria-expanded={activeDropdown === 'cart'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdown('cart')}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      <img src="/images/white_shoppingcart_icon.png" alt="" className="h-5 w-5 object-contain" />
                      {cartItems.length > 0 && (
                        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white">
                          {cartItems.length > 9 ? '9+' : cartItems.length}
                        </span>
                      )}
                    </button>
                    {activeDropdown === 'cart' && (
                      <div role="menu" className="fixed left-2 right-2 top-[84px] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
                        <div className="border-b border-gray-100 px-4 py-3 font-semibold">Giỏ hàng</div>
                        {cartItems.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-500">Giỏ hàng trống</p>
                            <Link to="/" onClick={() => setActiveDropdown(null)} className="mt-3 inline-flex rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]">
                              Khám phá sản phẩm
                            </Link>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 overflow-y-auto">
                              {[...cartItems].slice(-5).reverse().map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                                  {item.image || item.thumbnail ? (
                                    <img src={item.image || item.thumbnail} alt="" className="h-12 w-12 shrink-0 rounded-md bg-gray-100 object-cover" />
                                  ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                      <ShoppingBag className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-medium">{item.title || item.name || 'Sản phẩm'}</p>
                                    <p className="mt-1 text-xs text-gray-500">{formatPrice(item.price)} · SL {item.quantity}</p>
                                  </div>
                                  <button type="button" aria-label={`Xóa ${item.title || item.name || 'sản phẩm'} khỏi giỏ`} onClick={() => removeFromCart(item.id)} className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <Link to="/cart" onClick={() => setActiveDropdown(null)} className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-[#056F1C] hover:bg-gray-50">
                              Xem giỏ hàng ({cartItems.length})
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Thông báo"
                      title="Thông báo"
                      aria-expanded={activeDropdown === 'notifications'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdown('notifications')}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      <img src="/images/white_bell_icon.png" alt="" className="h-5 w-5 object-contain" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white">
                          {unreadBadge}
                        </span>
                      )}
                    </button>
                    {activeDropdown === 'notifications' && (
                      <div className="fixed left-2 right-2 top-[84px] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                          <span className="font-semibold">Thông báo</span>
                          <button
                            type="button"
                            onClick={() => setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))}
                            disabled={unreadCount === 0}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#056F1C] hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline"
                          >
                            <CheckCheck className="h-4 w-4" /> Đọc tất cả
                          </button>
                        </div>
                        {isNotificationsLoading ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">Đang tải thông báo...</div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">Chưa có thông báo</div>
                        ) : (
                          <div role="menu" className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => {
                              const NotificationIcon = NOTIFICATION_ICONS[notification.type] || Bell
                              return (
                                <button
                                  key={notification.id}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => openNotification(notification)}
                                  className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-green-50'}`}
                                >
                                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#056F1C]">
                                    <NotificationIcon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="line-clamp-2 block text-sm">{notification.title}</span>
                                    <span className="mt-1 block text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</span>
                                  </span>
                                  {!notification.isRead && <span aria-label="Chưa đọc" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#056F1C]" />}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Tài khoản ${user?.name ?? ''}`}
                      aria-expanded={activeDropdown === 'account'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdown('account')}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-[#056F1C] hover:bg-green-100 transition-colors"
                    >
                      {user?.name?.trim().charAt(0).toLocaleUpperCase('vi-VN') || '?'}
                    </button>
                    {activeDropdown === 'account' && (
                      <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-lg">
                        <p className="border-b border-gray-100 px-3 py-2 text-sm">
                          {user?.name} <span className="text-gray-500">({user?.role})</span>
                        </p>
                        <Link
                          to="/account"
                          onClick={() => setActiveDropdown(null)}
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          Tài khoản
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout()
                            setActiveDropdown(null)
                            navigate('/')
                          }}
                          className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
