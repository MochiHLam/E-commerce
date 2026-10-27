import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Boxes,
  ChevronDown,
  ClipboardList,
  CircleDollarSign,
  Gavel,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings2,
  ShieldAlert,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication, isSellerShopOwner } from '@/mocks/seller'

const ADMIN_NAVIGATION = [
  { label: 'Tổng quan', to: '/admin/dashboard', icon: LayoutDashboard },
  {
    label: 'Người dùng & cửa hàng',
    id: 'admin-users-shops',
    icon: Users,
    children: [
      { label: 'Người dùng', to: '/admin/users', icon: Users },
      { label: 'Cửa hàng', to: '/admin/shops', icon: Store },
    ],
  },
  {
    label: 'Danh mục & nội dung',
    id: 'admin-catalog',
    icon: Boxes,
    children: [
      { label: 'Sản phẩm & danh mục', to: '/admin/catalog', icon: Boxes },
    ],
  },
  {
    label: 'An toàn & kiểm duyệt',
    id: 'admin-moderation',
    icon: ShieldAlert,
    children: [
      { label: 'Hàng đợi báo cáo', to: '/admin/moderation', icon: ShieldAlert },
      { label: 'Case đã chuyển admin', to: '/admin/moderation/escalated', icon: ClipboardList },
    ],
  },
  {
    label: 'Đấu giá',
    id: 'admin-auctions',
    icon: Gavel,
    children: [
      { label: 'Quản lý đấu giá', to: '/admin/auctions', icon: Gavel },
      { label: 'Vật phẩm chờ duyệt', to: '/admin/auctions/items', icon: Package },
    ],
  },
  {
    label: 'Tài chính & cấu hình',
    id: 'admin-finance-settings',
    icon: Settings2,
    children: [
      { label: 'Đối soát / doanh thu sàn', to: '/admin/finance', icon: Wallet },
      { label: 'Cấu hình hệ thống', to: '/admin/settings', icon: Settings2 },
    ],
  },
  { label: 'Nhật ký hoạt động', to: '/admin/audit-log', icon: Activity },
]

const MODERATOR_NAVIGATION = [
  { label: 'Tổng quan', to: '/moderator/dashboard', icon: LayoutDashboard },
  { label: 'Báo cáo cửa hàng', to: '/moderator/reports/shops', icon: Store },
  { label: 'Báo cáo sản phẩm', to: '/moderator/reports/products', icon: Boxes },
  { label: 'Báo cáo đánh giá', to: '/moderator/reports/reviews', icon: ShieldAlert },
  { label: 'Lịch sử xử lý', to: '/moderator/history', icon: Activity },
  { label: 'Tài khoản bị khóa', to: '/moderator/locked-users', icon: Users },
]

const SELLER_NAVIGATION = [
  { label: 'Tổng quan', to: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Doanh thu', to: '/seller/revenue', icon: Wallet, ownerOnly: true },
  { label: 'Ví & giao dịch', to: '/seller/wallet', icon: CircleDollarSign, ownerOnly: true },
  {
    label: 'Bán hàng',
    id: 'sales',
    icon: ShoppingBag,
    children: [
      { label: 'Sản phẩm', to: '/seller/products', icon: Package },
      { label: 'Đơn hàng', to: '/seller/orders', icon: ClipboardList },
    ],
  },
  {
    label: 'Cửa hàng',
    id: 'shop',
    icon: Store,
    children: [
      { label: 'Thông tin cửa hàng', to: '/seller/information', icon: Info },
      { label: 'Thiết lập shop', to: '/seller/settings', icon: Settings2 },
    ],
  },
]

const STAFF_CONFIG = {
  admin: {
    title: 'Quản trị hệ thống',
    workspace: 'Không gian quản trị',
    navLabel: 'Tác vụ quản trị',
    roleLabel: 'Quản trị viên',
    navigation: ADMIN_NAVIGATION,
  },
  mod: {
    title: 'Kênh kiểm duyệt',
    workspace: 'Không gian kiểm duyệt',
    navLabel: 'Tác vụ kiểm duyệt',
    roleLabel: 'Nhân viên kiểm duyệt',
    navigation: MODERATOR_NAVIGATION,
  },
  seller: {
    title: 'Kênh người bán',
    navLabel: 'Điều hướng người bán',
    roleLabel: 'Người bán',
    navigation: SELLER_NAVIGATION,
  },
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi') || 'AD'
}

function getExpandedGroup(navigation, pathname) {
  return navigation.find((item) => item.children?.some((child) => pathname.startsWith(child.to)))?.id ?? null
}

export default function StaffLayout({ role = 'admin' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const accountMenuRef = useRef(null)
  const mobileNavTriggerRef = useRef(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const config = STAFF_CONFIG[role] ?? STAFF_CONFIG.admin
  const [openNavigationGroup, setOpenNavigationGroup] = useState(() => (
    getExpandedGroup(config.navigation, location.pathname)
  ))
  const hasGreenSidebar = role === 'admin' || role === 'seller'
  const showLogout = role === 'seller'
  const displayName = user?.name || (showLogout ? 'Người bán' : 'Quản trị viên')
  const accountDetail = showLogout ? user?.email || config.roleLabel : config.roleLabel
  const sellerApplication = showLogout && user?.id ? getSellerApplication(user.id) : null
  const navigation = role === 'seller'
    ? SELLER_NAVIGATION.filter((item) => !item.ownerOnly || isSellerShopOwner(sellerApplication, user?.id))
    : config.navigation
  const avatarLabel = sellerApplication?.shopName || displayName
  const avatarImage = sellerApplication?.avatar || user?.avatarUrl

  useEffect(() => {
    setOpenNavigationGroup(getExpandedGroup(config.navigation, location.pathname))
    if (role === 'seller') setIsMobileNavOpen(false)
  }, [config.navigation, location.pathname, role])

  useEffect(() => {
    if (!isMobileNavOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false)
        mobileNavTriggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMobileNavOpen])

  useEffect(() => {
    if (!showLogout || !isAccountMenuOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setIsAccountMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isAccountMenuOpen, showLogout])

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8f7]">
      <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3" aria-label={`NaviShop ${config.title}`}>
          <img src="/images/main_logo.png" alt="" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-gray-900">NaviShop</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#056F1C]">{config.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showLogout && (
            <button
              ref={mobileNavTriggerRef}
              type="button"
              aria-label={isMobileNavOpen ? 'Đóng menu người bán' : 'Mở menu người bán'}
              aria-expanded={isMobileNavOpen}
              aria-controls="seller-navigation"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] lg:hidden"
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          {!showLogout && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="mt-0.5 text-xs text-gray-500">{accountDetail}</p>
            </div>
          )}
          {showLogout && (
            <div
              ref={accountMenuRef}
              className="relative"
              onMouseEnter={() => setIsAccountMenuOpen(true)}
              onMouseLeave={() => setIsAccountMenuOpen(false)}
              onFocus={() => setIsAccountMenuOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsAccountMenuOpen(false)
              }}
            >
              <button
                type="button"
                aria-label={`Tài khoản cửa hàng ${avatarLabel}`}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#e5f3e8] text-sm font-bold text-[#056F1C] ring-1 ring-[#056F1C]/10 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
              >
                {avatarImage
                  ? <img src={avatarImage} alt="" className="h-full w-full object-cover" />
                  : getInitials(avatarLabel)}
              </button>
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full z-50 min-w-56 rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-lg">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold">{sellerApplication?.shopName || displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {sellerApplication?.contactName || displayName}
                    </p>
                  </div>
                  <Link
                    to="/seller/information"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    Thông tin cửa hàng
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false)
                      logout()
                      navigate('/seller', { replace: true })
                    }}
                    className="inline-flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
          {!showLogout && (
            <div
              aria-label={`Ảnh đại diện ${displayName}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f3e8] text-sm font-bold text-[#056F1C] ring-1 ring-[#056F1C]/10"
            >
              {getInitials(displayName)}
            </div>
          )}
        </div>
      </header>

      <div className={`mx-auto flex w-full flex-1 flex-col lg:flex-row ${hasGreenSidebar ? 'max-w-none' : 'max-w-[1600px]'}`}>
        {showLogout && isMobileNavOpen && (
          <button
            type="button"
            aria-label="Đóng menu người bán"
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[72px] z-30 bg-gray-950/40 lg:hidden"
          />
        )}
        <aside
          id={showLogout ? 'seller-navigation' : undefined}
          className={`${showLogout
            ? `fixed bottom-0 left-0 top-[72px] z-40 w-[min(84vw,320px)] overflow-y-auto border-r lg:static lg:z-auto lg:w-[260px] lg:overflow-visible ${isMobileNavOpen ? 'block' : 'hidden lg:block'}`
            : 'shrink-0 border-b lg:w-[260px] lg:border-b-0 lg:border-r'
          } ${
          hasGreenSidebar
            ? 'border-[#056F1C] bg-[#056F1C] text-white lg:border-r-[#056F1C]'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="px-4 py-4 lg:px-5 lg:py-5">
            <nav aria-label={config.navLabel} className="flex flex-col gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                if (item.children) {
                  const isGroupActive = item.children.some((child) => location.pathname.startsWith(child.to))
                    const isExpanded = openNavigationGroup === item.id
                  const childrenId = `seller-navigation-${item.id}`
                  return (
                    <div key={item.id}>
                        <div className={`flex items-center rounded-lg border-l-2 text-sm font-medium transition-colors ${
                            isGroupActive
                              ? 'border-white bg-white/15 text-white'
                              : 'border-transparent text-white/85 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <NavLink
                            to={item.children[0].to}
                            end={['/admin/moderation', '/admin/auctions'].includes(item.children[0].to)}
                            onClick={() => setIsMobileNavOpen(false)}
                            className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#056F1C]"
                          >
                            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                            <span className="flex-1">{item.label}</span>
                          </NavLink>
                          <button
                            type="button"
                            aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} mục ${item.label}`}
                            aria-expanded={isExpanded}
                            aria-controls={childrenId}
                            onClick={() => setOpenNavigationGroup((current) => (
                              current === item.id ? null : item.id
                            ))}
                            className="flex min-h-11 min-w-11 items-center justify-center rounded-r-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#056F1C]"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <div id={childrenId} hidden={!isExpanded} className="ml-5 mt-1 space-y-1 border-l border-white/30 pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              end={['/admin/moderation', '/admin/auctions'].includes(child.to)}
                              onClick={() => setIsMobileNavOpen(false)}
                              className={({ isActive }) => `flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                isActive
                                  ? 'border-white bg-white/20 font-semibold text-white'
                                  : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                              <span>{child.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                      hasGreenSidebar
                        ? isActive
                          ? 'border-white bg-white/15 text-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#056F1C]'
                          : 'border-transparent text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#056F1C]'
                        : isActive
                          ? 'border-[#056F1C] bg-[#eaf5ec] text-[#056F1C] focus-visible:ring-[#056F1C] focus-visible:ring-offset-2'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className={`min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-6 lg:py-8 ${hasGreenSidebar ? '' : 'lg:px-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
