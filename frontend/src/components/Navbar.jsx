import { Bell, CheckCheck, Search, ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { INITIAL_NOTIFICATIONS, NOTIFICATION_ICONS, formatNotificationDateTime } from '@/mocks/mockNotifications'
import { MOCK_SHOPS } from '@/mocks/mockShops'

function formatPrice(price) {
  return `${new Intl.NumberFormat('vi-VN').format(price ?? 0)} ₫`
}

/**
 * variant: 'default' | 'auction' | 'auth' | 'seller' | 'content'
 * - 'default': green bg, white text, search bar + auth buttons
 * - 'auction': green bg, white text, auth buttons only (no search)
 * - 'auth':    white/gray bg, green text, logo only (no search, no auth buttons)
 * - 'seller':  green bg, white text, seller brand only (no search or auth buttons)
 * - 'content': green bg, white text, static brand only (no search or auth buttons)
 */
export default function Navbar({ variant = 'default' }) {
  const [query, setQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [isNotificationsLoading] = useState(false)
  const dropdownAreaRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isLoggedIn, user, logout } = useAuth()
  const { items: cartItems } = useCart()
  const currentShop = MOCK_SHOPS.find((shop) => `/${shop.slug}` === pathname)

  useEffect(() => {
    setQuery('')
  }, [pathname])

  useEffect(() => {
    const addNotification = (event) => {
      const notification = event.detail?.notification
      if (!notification?.id) return
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ])
    }

    window.addEventListener('navishop:notification', addNotification)
    return () => window.removeEventListener('navishop:notification', addNotification)
  }, [])

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
      const params = new URLSearchParams({ q: query.trim() })
      if (currentShop) params.set('shop', currentShop.slug)
      const returnTo = `/search?${params.toString()}`
      if (!isLoggedIn) {
        navigate('/login', { state: { returnTo } })
        return
      }
      navigate(returnTo)
    }
  }

  const isAuth = variant === 'auth'
  const isSeller = variant === 'seller'
  const isContent = variant === 'content'
  const showSearch = variant === 'default'
  const brandHref = isSeller
    ? isLoggedIn && user?.role === 'user' ? '/seller/dashboard' : '/seller'
    : '/'

  return (
    <header className={`w-full sticky top-0 z-50 ${isAuth ? 'bg-[#f5f5f5] border-b border-gray-200' : 'bg-[#056F1C]'}`}>
      <div className="max-w-[1500px] mx-auto px-0 h-[76px] flex items-center gap-6">

        {/* Logo */}
        {isContent ? (
          <div className="flex items-center gap-2 shrink-0">
            <img src="/images/main_logo.png" alt="NaviShop" className="h-8 w-8 object-contain brightness-0 invert" />
            <span className="font-bold text-lg tracking-wide text-white">NaviShop</span>
          </div>
        ) : (
          <Link to={brandHref} className="flex items-center gap-2 shrink-0">
          <img
            src={isAuth ? '/images/contrast_logo.png' : '/images/main_logo.png'}
            alt="NaviShop"
            className={`h-8 w-8 object-contain ${isAuth ? '' : 'brightness-0 invert'}`}
          />
          <span className={`font-bold text-lg tracking-wide ${isAuth ? 'text-[#056F1C]' : 'text-white'}`}>
            NaviShop
          </span>
          {isSeller && <span className="border-l border-white/40 pl-2 text-lg font-normal text-white">Online Shop</span>}
          </Link>
        )}

        {!isAuth && !isSeller && !isContent && (
          <>
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    id="navbar-search-input"
                    type="text"
                    role="searchbox"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={currentShop ? 'Tìm kiếm trong cửa hàng' : 'Tìm kiếm với từ khóa'}
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
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown('cart')}
                    onMouseLeave={() => setActiveDropdown((current) => (current === 'cart' ? null : current))}
                  >
                    <button
                      type="button"
                      aria-label="Giỏ hàng"
                      title="Giỏ hàng"
                      aria-expanded={activeDropdown === 'cart'}
                      aria-haspopup="menu"
                      onClick={() => {
                        setActiveDropdown(null)
                        navigate('/cart')
                      }}
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
                      <div role="menu" className="fixed left-2 right-2 top-[84px] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-96">
                        <div className="border-b border-gray-100 px-4 py-3 font-semibold">Giỏ hàng</div>
                        {cartItems.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-500">Giỏ hàng trống</p>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 overflow-y-auto">
                              {[...cartItems].slice(-5).reverse().map((item) => (
                                <Link
                                  key={`${item.id}-${item.variantId ?? 'default'}`}
                                  to={`/products/${item.id}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
                                >
                                  {item.image || item.thumbnail ? (
                                    <img src={item.image || item.thumbnail} alt="" className="h-12 w-12 shrink-0 rounded-md bg-gray-100 object-cover" />
                                  ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                      <ShoppingBag className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                    <p className="min-w-0 truncate text-sm font-medium">
                                      {item.title || item.name || 'Sản phẩm'}
                                      {item.variantLabel && ` (${item.variantLabel})`}
                                    </p>
                                    <p className="shrink-0 text-sm font-semibold text-[#056F1C]">{formatPrice(item.price)}</p>
                                  </div>
                                </Link>
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
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown('notifications')}
                    onMouseLeave={() => setActiveDropdown((current) => (current === 'notifications' ? null : current))}
                  >
                    <button
                      type="button"
                      aria-label="Thông báo"
                      title="Thông báo"
                      aria-expanded={activeDropdown === 'notifications'}
                      aria-haspopup="menu"
                      onClick={() => {
                        setActiveDropdown(null)
                        navigate('/user/notifications/orders')
                      }}
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
                      <div className="fixed left-2 right-2 top-[84px] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-[34rem]">
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
                              const leadingVisual = notification.image ? (
                                <img
                                  src={notification.image}
                                  alt=""
                                  className="aspect-square w-full rounded-md object-cover"
                                />
                              ) : (
                                <span className="flex aspect-square w-full items-center justify-center rounded-full bg-gray-100 text-[#056F1C]">
                                  <NotificationIcon className="h-4 w-4" />
                                </span>
                              )
                              const cardClassName = `grid w-full grid-cols-[15%_minmax(0,1fr)] items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-green-50'}`

                              if (notification.body) {
                                return (
                                  <button
                                    key={notification.id}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => openNotification(notification)}
                                    className={cardClassName}
                                  >
                                    <span className="mt-0.5">{leadingVisual}</span>
                                    <span className="min-w-0">
                                      <span className="flex items-start justify-between gap-2">
                                        <span className="block text-sm font-semibold text-gray-900">{notification.title}</span>
                                        {!notification.isRead && <span aria-label="Chưa đọc" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#056F1C]" />}
                                      </span>
                                      <span className="mt-1 block text-sm leading-5 text-gray-700">
                                        {notification.body}
                                      </span>
                                      <span className="mt-1 block text-xs text-gray-500">{formatNotificationDateTime(notification.createdAt)}</span>
                                    </span>
                                  </button>
                                )
                              }

                              return (
                                <button
                                  key={notification.id}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => openNotification(notification)}
                                  className={cardClassName}
                                >
                                  <span className="mt-0.5">{leadingVisual}</span>
                                  <span className="min-w-0 flex-1">
                                    <span className="line-clamp-2 block text-sm">{notification.title}</span>
                                    <span className="mt-1 block text-xs text-gray-500">{formatNotificationDateTime(notification.createdAt)}</span>
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
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown('account')}
                    onMouseLeave={() => setActiveDropdown((current) => (current === 'account' ? null : current))}
                  >
                    <button
                      type="button"
                      aria-label={`Tài khoản ${user?.name ?? ''}`}
                      aria-expanded={activeDropdown === 'account'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdown('account')}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-[#056F1C] hover:bg-green-100 transition-colors"
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        user?.name?.trim().charAt(0).toLocaleUpperCase('vi-VN') || '?'
                      )}
                    </button>
                    {activeDropdown === 'account' && (
                      <div className="absolute right-0 top-full z-50 min-w-44 rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-lg">
                        <p className="border-b border-gray-100 px-3 py-2 text-sm">
                          {user?.name} <span className="text-gray-500">({user?.role})</span>
                        </p>
                        <Link
                          to="/user/account/profile"
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
