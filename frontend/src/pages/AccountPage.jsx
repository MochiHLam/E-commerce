import { useEffect, useState } from 'react'
import { ArrowRight, Bell, ChevronDown, Gavel, Mail, MessageCircle, Package, Plus, Search, Store, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { INITIAL_NOTIFICATIONS, NOTIFICATION_ICONS, formatRelativeTime } from '@/data/mockNotifications'

const LAYOUT = 'mx-auto max-w-[1500px]'

const ROLE_LABELS = {
  user: 'Khách hàng',
  mod: 'Kiểm duyệt viên',
  admin: 'Quản trị viên',
}

const SECTIONS = [
  {
    id: 'account',
    label: 'Tài khoản của tôi',
    icon: UserRound,
    children: [
      { id: 'profile', label: 'Hồ sơ' },
      { id: 'address', label: 'Địa chỉ' },
      { id: 'password', label: 'Đổi mật khẩu' },
      { id: 'notifications', label: 'Thông báo' },
    ],
  },
  { id: 'orders', label: 'Đơn hàng', icon: Package },
  { id: 'auctions', label: 'Lịch sử đấu giá', icon: Gavel },
]

function EmptyState({ children }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
      <p className="text-sm text-gray-500">{children}</p>
    </div>
  )
}

function getProfileForm(user) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    gender: user?.gender ?? '',
    dob: user?.dob ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  }
}

function getAddresses(user) {
  if (Array.isArray(user?.shippingAddresses) && user.shippingAddresses.length > 0) {
    const defaultIndex = user.shippingAddresses.findIndex((address) => address.isDefault)
    const selectedDefaultIndex = defaultIndex === -1 ? 0 : defaultIndex
    return user.shippingAddresses.map((address, index) => ({
      ...address,
      isDefault: index === selectedDefaultIndex,
    }))
  }

  return [{
    id: 'account-address',
    recipientName: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    isDefault: true,
  }]
}

function createAddressId() {
  return globalThis.crypto?.randomUUID?.() ?? `address-${Date.now()}`
}

function getProfileErrors(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Vui lòng nhập họ và tên.'
  if (!form.email.trim()) errors.email = 'Vui lòng nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Email không đúng định dạng.'
  if (!form.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
  if (!form.gender) errors.gender = 'Vui lòng chọn giới tính.'
  if (!form.dob) errors.dob = 'Vui lòng chọn ngày sinh.'
  return errors
}

function getAddressErrors(form) {
  const errors = {}
  if (!form.recipientName.trim()) errors.recipientName = 'Vui lòng nhập họ tên người nhận.'
  if (!form.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
  if (!form.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể.'
  return errors
}

function getPasswordErrors(form) {
  const errors = {}
  if (!form.current) errors.current = 'Vui lòng nhập mật khẩu cũ.'
  if (!form.next) errors.next = 'Vui lòng nhập mật khẩu mới.'
  else if (form.next.length < 8) errors.next = 'Mật khẩu phải có ít nhất 8 ký tự.'
  if (!form.confirm) errors.confirm = 'Vui lòng xác nhận mật khẩu mới.'
  else if (form.next !== form.confirm) errors.confirm = 'Xác nhận mật khẩu mới không khớp.'
  return errors
}

const ACCOUNT_SECTION_PATHS = {
  profile: '/user/account/profile',
  address: '/user/account/address',
  password: '/user/account/password',
  notifications: '/user/account/notifications',
}

const ORDER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Chờ giao hàng' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
]

const MOCK_ORDERS = [
  {
    id: 'order-pending',
    status: 'pending',
    productName: 'Giày thể thao nam năng động',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
    storeName: 'Thế Giới Giày',
    price: 1250000,
  },
  {
    id: 'order-shipping',
    status: 'shipping',
    productName: 'Tai nghe chụp tai không dây',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
    storeName: 'Âm Thanh Việt',
    price: 890000,
  },
  {
    id: 'order-completed',
    status: 'completed',
    productName: 'Đồng hồ đeo tay tối giản',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    storeName: 'Phụ Kiện Xinh',
    price: 2450000,
    hasReviewed: true,
  },
  {
    id: 'order-completed-unreviewed',
    status: 'completed',
    productName: 'Bình giữ nhiệt inox 500ml',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=240&q=80',
    storeName: 'Gia Dụng Tiện Ích',
    price: 320000,
    hasReviewed: false,
  },
  {
    id: 'order-cancelled',
    status: 'cancelled',
    productName: 'Túi đeo chéo thời trang',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=240&q=80',
    storeName: 'Nhà Túi',
    price: 560000,
  },
]

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  shipping: 'Chờ giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export default function AccountPage({ section = 'profile' }) {
  const { user, updateUser } = useAuth()
  const [isAccountCollapsed, setIsAccountCollapsed] = useState(false)
  const [form, setForm] = useState(() => getProfileForm(user))
  const [addresses, setAddresses] = useState(() => getAddresses(user))
  const [notifications, setNotifications] = useState(() => INITIAL_NOTIFICATIONS)
  const [activeOrderTab, setActiveOrderTab] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [mockOrders, setMockOrders] = useState(() => MOCK_ORDERS)
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null)
  const [showRefundInfo, setShowRefundInfo] = useState(false)
  const [addressForm, setAddressForm] = useState({ recipientName: '', phone: '', address: '' })
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressSubmitted, setAddressSubmitted] = useState(false)
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState(null)
  const [addressMessage, setAddressMessage] = useState('')
  const [showSaveProfileConfirmation, setShowSaveProfileConfirmation] = useState(false)
  const [profileSubmitted, setProfileSubmitted] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const profileErrors = getProfileErrors(form)
  const addressErrors = getAddressErrors(addressForm)
  const passwordErrors = getPasswordErrors(passwordForm)
  const showPasswordErrors = passwordSubmitted
    || Boolean(passwordForm.next || passwordForm.confirm || passwordForm.current)

  useEffect(() => {
    setForm(getProfileForm(user))
    setAddresses(getAddresses(user))
  }, [user])

  const name = user?.name?.trim() || 'Tài khoản NaviShop'
  const initial = name.charAt(0).toLocaleUpperCase('vi-VN')
  const role = ROLE_LABELS[user?.role] ?? 'Thành viên'
  const activeSection = section
  const isAccountSectionActive = ['profile', 'address', 'password', 'notifications'].includes(activeSection)
  const isAccountExpanded = isAccountSectionActive && !isAccountCollapsed
  const activeItem = SECTIONS.flatMap(({ id, label, children = [] }) => [
    { id, label },
    ...children,
  ]).find(({ id }) => id === activeSection) ?? { id: 'profile', label: 'Hồ sơ' }
  const visibleOrders = mockOrders.filter((order) => {
    const matchesTab = activeOrderTab === 'all' || order.status === activeOrderTab
    const matchesSearch = activeOrderTab !== 'all'
      || order.productName.toLocaleLowerCase('vi-VN').includes(orderSearch.trim().toLocaleLowerCase('vi-VN'))
    return matchesTab && matchesSearch
  })

  useEffect(() => {
    if (section !== 'profile') setProfileSubmitted(false)
  }, [section])

  const updateField = (event) => {
    const { name: field, value } = event.target
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setAvatarError('')
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('Vui lòng chọn ảnh định dạng JPEG hoặc PNG.')
      return
    }
    if (file.size > 1024 * 1024) {
      setAvatarError('Ảnh đại diện không được vượt quá 1 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setAvatarError('Không thể đọc ảnh đã chọn. Vui lòng thử lại.')
        return
      }
      setForm((current) => ({ ...current, avatarUrl: reader.result }))
    }
    reader.onerror = () => setAvatarError('Không thể đọc ảnh đã chọn. Vui lòng thử lại.')
    reader.readAsDataURL(file)
  }

  const requestSaveProfile = (event) => {
    event.preventDefault()
    setProfileSubmitted(true)
    if (Object.keys(profileErrors).length > 0) return
    setShowSaveProfileConfirmation(true)
  }

  const confirmSaveProfile = () => {
    updateUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      dob: form.dob,
      avatarUrl: form.avatarUrl,
    })
    setShowSaveProfileConfirmation(false)
  }

  const updatePasswordField = (event) => {
    const { name: field, value } = event.target
    setPasswordForm((current) => ({ ...current, [field]: value }))
    setPasswordNotice('')
  }

  const requestPasswordChange = (event) => {
    event.preventDefault()
    setPasswordSubmitted(true)
    if (Object.keys(passwordErrors).length > 0) return
    setShowPasswordConfirmation(true)
  }

  const confirmPasswordChange = () => {
    setShowPasswordConfirmation(false)
    setPasswordNotice('Chưa thể đổi mật khẩu vì tính năng chưa được kết nối với hệ thống tài khoản.')
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordSubmitted(false)
  }

  const confirmCancelOrder = () => {
    setMockOrders((current) => current.map((order) =>
      order.id === pendingCancelOrderId ? { ...order, status: 'cancelled' } : order,
    ))
    setPendingCancelOrderId(null)
  }

  const openAddressForm = (address) => {
    setEditingAddressId(address?.id ?? null)
    setAddressForm({
      recipientName: address?.recipientName ?? user?.name ?? '',
      phone: address?.phone ?? user?.phone ?? '',
      address: address?.address ?? '',
    })
    setAddressMessage('')
    setShowAddressForm(true)
  }

  const saveAddress = (event) => {
    event.preventDefault()
    setAddressSubmitted(true)
    if (Object.keys(addressErrors).length > 0) return
    const nextAddress = {
      id: editingAddressId ?? createAddressId(),
      recipientName: addressForm.recipientName.trim(),
      phone: addressForm.phone.trim(),
      address: addressForm.address.trim(),
      isDefault: addresses.some((address) => address.id === editingAddressId && address.isDefault)
        || addresses.length === 0,
    }
    const nextAddresses = editingAddressId
      ? addresses.map((address) => address.id === editingAddressId ? nextAddress : address)
      : [...addresses, nextAddress]
    setAddresses(nextAddresses)
    updateUser({ shippingAddresses: nextAddresses })
    setShowAddressForm(false)
    setEditingAddressId(null)
    setAddressSubmitted(false)
    setAddressMessage('Địa chỉ đã được lưu.')
  }

  const setDefaultAddress = (addressId) => {
    const nextAddresses = addresses.map((address) => ({ ...address, isDefault: address.id === addressId }))
    setAddresses(nextAddresses)
    updateUser({ shippingAddresses: nextAddresses })
    setAddressMessage('Đã cập nhật địa chỉ mặc định.')
  }

  const requestDeleteAddress = (addressId) => {
    setAddressMessage('')
    setPendingDeleteAddressId(addressId)
  }

  const confirmDeleteAddress = () => {
    const deletedAddress = addresses.find((address) => address.id === pendingDeleteAddressId)
    if (!deletedAddress || deletedAddress.isDefault || addresses.length <= 1) return

    const nextAddresses = addresses.filter((address) => address.id !== pendingDeleteAddressId)
    setAddresses(nextAddresses)
    updateUser({ shippingAddresses: nextAddresses })
    setPendingDeleteAddressId(null)
  }

  const inputClass = 'h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15'
  const invalidInputClass = 'border-red-500 focus:border-red-500 focus:ring-red-500/15'

  return (
    <main className="flex-1 bg-white">
      <div className={`${LAYOUT} px-0 py-6 sm:py-8`}>
        <div className="flex gap-0">
          <aside className="sticky top-[90px] w-56 shrink-0 self-start px-4 py-6">
            <div className="mb-5 flex items-center gap-3 px-2">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#056F1C] text-lg font-bold text-white">
                {form.avatarUrl
                  ? <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{name}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{user?.email || role}</p>
              </div>
            </div>

            <nav aria-label="Danh mục tài khoản">
              {SECTIONS.map(({ id, label, icon: Icon, children }) => {
                const isGroupActive = children
                  ? children.some(({ id: childId }) => activeSection === childId)
                  : activeSection === id
                const isExpanded = children ? isAccountExpanded : false
                return (
                  <div key={id} className="mb-1">
                    <div className={`flex items-center rounded text-sm transition-colors ${
                        (children ? isAccountSectionActive : isGroupActive)
                          ? 'bg-[#056F1C]/[0.08] font-semibold text-[#056F1C]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#056F1C]'
                      }`}
                    >
                      <Link
                        to={children ? '/user/account/profile' : `/user/${id}`}
                        aria-current={!children && isGroupActive ? 'page' : undefined}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded px-3 py-2 text-left"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{label}</span>
                      </Link>
                      {children && (
                        <button
                          type="button"
                          aria-label={isExpanded ? 'Thu gọn mục Tài khoản của tôi' : 'Mở rộng mục Tài khoản của tôi'}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setIsAccountCollapsed((collapsed) => !collapsed)
                          }}
                          className="rounded p-0.5 hover:bg-white/70"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {children && isExpanded && (
                      <div className="ml-5 mt-1 border-l border-gray-200 pl-3">
                        {children.map((child) => {
                          const isChildActive = activeSection === child.id
                          return (
                            <Link
                              key={child.id}
                              to={ACCOUNT_SECTION_PATHS[child.id]}
                              aria-current={isChildActive ? 'page' : undefined}
                              className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors ${
                                isChildActive
                                  ? 'font-semibold text-[#056F1C]'
                                  : 'text-gray-600 hover:text-[#056F1C]'
                              }`}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>

          <section className="min-h-[60vh] min-w-0 flex-1 p-8">
            <p className="mb-4 text-xs text-gray-400">
              <Link to="/" className="hover:text-[#056F1C]">NaviShop</Link>
              {' › '}
              <Link to="/user/account/profile" className="hover:text-[#056F1C]">Tài khoản</Link>
              {' › '}
              {activeItem.label}
            </p>

            {activeSection === 'profile' && (
              <>
                <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">
                  Hồ sơ
                </h1>
                <form noValidate onSubmit={requestSaveProfile} className="max-w-5xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="grid content-start gap-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
                      <label htmlFor="profile-name" className="text-sm font-medium text-gray-600">Họ và tên</label>
                      <div>
                        <input
                          id="profile-name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={updateField}
                          autoComplete="name"
                          required
                          aria-invalid={profileSubmitted && Boolean(profileErrors.name)}
                          className={`${inputClass} ${profileSubmitted && profileErrors.name ? invalidInputClass : ''}`}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">Tài khoản chỉ có thể đổi tên 30 ngày 1 lần</p>
                        {profileSubmitted && profileErrors.name && <p role="alert" className="mt-1 text-xs text-red-600">{profileErrors.name}</p>}
                      </div>

                      <label htmlFor="profile-email" className="text-sm font-medium text-gray-600">Email</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          id="profile-email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={updateField}
                          autoComplete="email"
                          required
                          aria-invalid={profileSubmitted && Boolean(profileErrors.email)}
                          className={`${inputClass} pl-10 ${profileSubmitted && profileErrors.email ? invalidInputClass : ''}`}
                        />
                        {profileSubmitted && profileErrors.email && <p role="alert" className="mt-1 text-xs text-red-600">{profileErrors.email}</p>}
                      </div>

                      <label htmlFor="profile-phone" className="text-sm font-medium text-gray-600">Số điện thoại</label>
                      <div>
                        <input
                          id="profile-phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={updateField}
                          autoComplete="tel"
                          placeholder="0901 234 567"
                          required
                          aria-invalid={profileSubmitted && Boolean(profileErrors.phone)}
                          className={`${inputClass} ${profileSubmitted && profileErrors.phone ? invalidInputClass : ''}`}
                        />
                        {profileSubmitted && profileErrors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{profileErrors.phone}</p>}
                      </div>

                      <label htmlFor="profile-gender" className="text-sm font-medium text-gray-600">Giới tính</label>
                      <div>
                        <select
                          id="profile-gender"
                          name="gender"
                          value={form.gender}
                          onChange={updateField}
                          required
                          aria-invalid={profileSubmitted && Boolean(profileErrors.gender)}
                          className={`${inputClass} bg-white ${profileSubmitted && profileErrors.gender ? invalidInputClass : ''}`}
                        >
                          <option value="">Chọn...</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        {profileSubmitted && profileErrors.gender && <p role="alert" className="mt-1 text-xs text-red-600">{profileErrors.gender}</p>}
                      </div>

                      <label htmlFor="profile-dob" className="text-sm font-medium text-gray-600">Ngày sinh</label>
                      <div>
                        <input
                          id="profile-dob"
                          name="dob"
                          type="date"
                          value={form.dob}
                          onChange={updateField}
                          autoComplete="bday"
                          required
                          aria-invalid={profileSubmitted && Boolean(profileErrors.dob)}
                          className={`${inputClass} ${profileSubmitted && profileErrors.dob ? invalidInputClass : ''}`}
                        />
                        {profileSubmitted && profileErrors.dob && <p role="alert" className="mt-1 text-xs text-red-600">{profileErrors.dob}</p>}
                      </div>

                    </div>

                    <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
                      <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        Chọn ảnh
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleAvatarChange}
                          className="sr-only"
                          aria-label="Chọn ảnh đại diện"
                        />
                      </label>
                      <p className="text-center text-xs text-gray-500">Dung lượng tối đa 1 MB. Định dạng JPEG, PNG.</p>
                      {avatarError && <p role="alert" className="text-center text-xs text-red-600">{avatarError}</p>}
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-5">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517]"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeSection === 'address' && (
              <>
                <div className="max-w-5xl overflow-hidden rounded border border-gray-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
                    <h1 className="text-xl font-medium text-gray-900">Địa chỉ của tôi</h1>
                    <button
                      type="button"
                      onClick={() => openAddressForm()}
                      className="inline-flex items-center gap-2 rounded-sm bg-[#056F1C] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#045517]"
                    >
                      <Plus className="h-5 w-5" />
                      Thêm địa chỉ
                    </button>
                  </div>

                  <div className="px-6">
                    <h2 className="py-5 text-lg font-medium text-gray-900">Địa chỉ</h2>
                    {addressMessage && (
                      <p role="status" className="mb-4 text-sm text-[#056F1C]">{addressMessage}</p>
                    )}
                    {addresses.length === 0 && !showAddressForm && (
                      <EmptyState>Bạn chưa có địa chỉ nhận hàng. Hãy thêm địa chỉ để thuận tiện khi mua sắm.</EmptyState>
                    )}

                    {addresses.map((address) => (
                      <article key={address.id} className="flex flex-col gap-4 border-b border-gray-200 py-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="font-medium text-gray-900">{address.recipientName}</h3>
                            <span className="hidden h-5 border-l border-gray-300 sm:block" />
                            <p className="text-sm text-gray-500">{address.phone}</p>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-500">{address.address}</p>
                          {address.isDefault && (
                            <span className="mt-2 inline-block border border-[#F4512C] px-1.5 py-0.5 text-xs text-[#F4512C]">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                          <div className="flex items-center gap-3 text-sm">
                            <button type="button" onClick={() => openAddressForm(address)} className="text-blue-600 hover:underline">
                              Sửa
                            </button>
                            {!address.isDefault && (
                              <>
                                <span className="h-4 border-l border-gray-300" />
                                <button type="button" onClick={() => requestDeleteAddress(address.id)} className="text-blue-600 hover:underline">
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(address.id)}
                              className="rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                        </div>
                      </article>
                    ))}

                    {showAddressForm && (
                      <form noValidate onSubmit={saveAddress} className="my-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
                        <h2 className="mb-4 font-semibold text-gray-900">{editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="address-recipient" className="mb-1.5 block text-sm font-medium text-gray-600">Họ và tên người nhận</label>
                            <input
                              id="address-recipient"
                              type="text"
                              value={addressForm.recipientName}
                              onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))}
                              required
                              aria-invalid={addressSubmitted && Boolean(addressErrors.recipientName)}
                              className={`${inputClass} ${addressSubmitted && addressErrors.recipientName ? invalidInputClass : ''}`}
                            />
                            {addressSubmitted && addressErrors.recipientName && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.recipientName}</p>}
                          </div>
                          <div>
                            <label htmlFor="address-phone" className="mb-1.5 block text-sm font-medium text-gray-600">Số điện thoại</label>
                            <input
                              id="address-phone"
                              type="tel"
                              value={addressForm.phone}
                              onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))}
                              required
                              aria-invalid={addressSubmitted && Boolean(addressErrors.phone)}
                              className={`${inputClass} ${addressSubmitted && addressErrors.phone ? invalidInputClass : ''}`}
                            />
                            {addressSubmitted && addressErrors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.phone}</p>}
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="address-full" className="mb-1.5 block text-sm font-medium text-gray-600">Địa chỉ cụ thể</label>
                            <textarea
                              id="address-full"
                              value={addressForm.address}
                              onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
                              autoComplete="street-address"
                              rows={3}
                              required
                              placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                              aria-invalid={addressSubmitted && Boolean(addressErrors.address)}
                              className={`w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${addressSubmitted && addressErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                            />
                            {addressSubmitted && addressErrors.address && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.address}</p>}
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button type="submit" className="rounded bg-[#056F1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]">
                            Lưu địa chỉ
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false)
                              setEditingAddressId(null)
                            }}
                            className="rounded border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-white"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'password' && (
              <>
                <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
                <form noValidate onSubmit={requestPasswordChange} className="max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
                  <div>
                    <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-gray-600">Mật khẩu cũ</label>
                    <input
                      id="current-password"
                      name="current"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.current}
                      onChange={updatePasswordField}
                      required
                      aria-invalid={showPasswordErrors && Boolean(passwordErrors.current)}
                      className={`${inputClass} ${showPasswordErrors && passwordErrors.current ? invalidInputClass : ''}`}
                    />
                    {showPasswordErrors && passwordErrors.current && <p role="alert" className="mt-1 text-xs text-red-600">{passwordErrors.current}</p>}
                  </div>
                  <div>
                    <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-600">Mật khẩu mới</label>
                    <input
                      id="new-password"
                      name="next"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.next}
                      onChange={updatePasswordField}
                      required
                      minLength={8}
                      aria-invalid={showPasswordErrors && Boolean(passwordErrors.next)}
                      className={`${inputClass} ${showPasswordErrors && passwordErrors.next ? invalidInputClass : ''}`}
                    />
                    <p className={`mt-1.5 text-xs ${showPasswordErrors && passwordErrors.next ? 'text-red-600' : 'text-gray-500'}`}>
                      {showPasswordErrors && passwordErrors.next ? passwordErrors.next : 'Mật khẩu tối thiểu 8 ký tự'}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium text-gray-600">Xác nhận mật khẩu mới</label>
                    <input
                      id="confirm-new-password"
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirm}
                      onChange={updatePasswordField}
                      required
                      aria-invalid={showPasswordErrors && Boolean(passwordErrors.confirm)}
                      className={`${inputClass} ${showPasswordErrors && passwordErrors.confirm ? invalidInputClass : ''}`}
                    />
                    {showPasswordErrors && passwordErrors.confirm && <p role="alert" className="mt-1.5 text-xs text-red-600">{passwordErrors.confirm}</p>}
                  </div>
                  {passwordNotice && <p role="status" className="text-sm text-amber-700">{passwordNotice}</p>}
                  <button
                    type="submit"
                    className="rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517]"
                  >
                    Xác nhận
                  </button>
                </form>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Thông báo</h1>
                {notifications.length === 0 ? (
                  <EmptyState>Bạn chưa có thông báo nào.</EmptyState>
                ) : (
                  <div className="max-w-4xl divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                    {notifications.map((notification) => {
                      const NotificationIcon = NOTIFICATION_ICONS[notification.type] ?? Bell
                      return (
                        <Link
                          key={notification.id}
                          to={notification.href}
                          onClick={() => setNotifications((current) => current.map((item) =>
                            item.id === notification.id ? { ...item, isRead: true } : item,
                          ))}
                          className={`flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50 ${notification.isRead ? '' : 'bg-green-50/70'}`}
                        >
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#056F1C]">
                            <NotificationIcon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm leading-relaxed text-gray-800">{notification.title}</span>
                            <span className="mt-1 block text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</span>
                          </span>
                          {!notification.isRead && (
                            <span aria-label="Chưa đọc" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#056F1C]" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {activeSection === 'orders' && (
              <>
                <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Đơn hàng</h1>
                <div role="tablist" aria-label="Lọc đơn hàng" className="flex w-full border-b border-gray-200">
                  {ORDER_TABS.map((tab) => {
                    const isActive = activeOrderTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        id={`orders-tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls="orders-tab-panel"
                        onClick={() => setActiveOrderTab(tab.id)}
                        className={`min-w-0 flex-1 border-b-2 px-2 py-3 text-center text-sm transition-colors sm:px-4 ${
                          isActive
                            ? 'border-[#056F1C] font-semibold text-[#056F1C]'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
                <div
                  id="orders-tab-panel"
                  role="tabpanel"
                  aria-labelledby={`orders-tab-${activeOrderTab}`}
                >
                  {activeOrderTab === 'all' && (
                    <div className="relative mt-5 w-full">
                      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="search"
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                        placeholder="Tìm sản phẩm trong đơn hàng"
                        aria-label="Tìm sản phẩm trong tất cả đơn hàng"
                        className="h-11 w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                      />
                    </div>
                  )}
                  {visibleOrders.length === 0 ? (
                    <EmptyState>
                      {activeOrderTab === 'all' && orderSearch.trim()
                        ? 'Không tìm thấy sản phẩm phù hợp.'
                        : 'Chưa có đơn hàng trong mục này.'}
                    </EmptyState>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {visibleOrders.map((order) => (
                        <article key={order.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                          <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
                            <div className="flex min-w-0 flex-wrap items-center gap-3">
                              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800">
                                <span className="truncate">{order.storeName}</span>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  title="Tính năng chat đang được phát triển"
                                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#056F1C] px-3 py-1.5 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> Chat
                                </button>
                                <button
                                  type="button"
                                  title="Tính năng xem shop đang được phát triển"
                                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white"
                                >
                                  <Store className="h-3.5 w-3.5" />
                                  Xem shop
                                </button>
                              </div>
                            </div>
                            <span className="shrink-0 pt-0.5 text-right text-xs font-semibold text-[#056F1C]">
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-start gap-4 p-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Package className="absolute inset-0 m-auto h-7 w-7 text-gray-400" />
                              <img
                                src={order.image}
                                alt={order.productName}
                                className="relative h-full w-full object-cover"
                                onError={(event) => { event.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h2 className="font-medium text-gray-900">{order.productName}</h2>
                              <p className="mt-1 text-sm text-gray-500">Số lượng: 1</p>
                            </div>
                            <p className="shrink-0 text-base font-semibold text-[#056F1C]">
                              {new Intl.NumberFormat('vi-VN').format(order.price)}₫
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                            {order.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => setPendingCancelOrderId(order.id)}
                                className="rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Hủy đơn hàng
                              </button>
                            )}
                            {order.status === 'cancelled' && (
                              <>
                                <button
                                  type="button"
                                  title="Tính năng mua lại đang được phát triển"
                                  className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
                                >
                                  Mua lại
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowRefundInfo(true)}
                                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                  Xem thông tin hoàn tiền
                                </button>
                              </>
                            )}
                            {order.status === 'completed' && (
                              <>
                                <button
                                  type="button"
                                  title="Tính năng mua lại đang được phát triển"
                                  className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
                                >
                                  Mua lại
                                </button>
                                {order.hasReviewed && (
                                  <button
                                    type="button"
                                    title="Tính năng xem đánh giá shop đang được phát triển"
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                  >
                                    Xem đánh giá shop
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'auctions' && (
              <>
                <h1 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Lịch sử đấu giá</h1>
                <EmptyState>Lịch sử tham gia đấu giá sẽ hiển thị tại đây khi được kết nối.</EmptyState>
                <Link
                  to="/auction/about"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#056F1C] hover:underline"
                >
                  Khám phá đấu giá <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
      {pendingDeleteAddressId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setPendingDeleteAddressId(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            aria-describedby="delete-address-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-address-title" className="text-lg font-bold text-gray-900">Xóa địa chỉ?</h2>
            <p id="delete-address-description" className="mt-2 text-sm leading-relaxed text-gray-600">
              Bạn có chắc chắn muốn xóa địa chỉ này không? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteAddressId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xóa địa chỉ
              </button>
            </div>
          </section>
        </div>
      )}
      {pendingCancelOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setPendingCancelOrderId(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            aria-describedby="cancel-order-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="cancel-order-title" className="text-lg font-bold text-gray-900">Hủy đơn hàng?</h2>
            <p id="cancel-order-description" className="mt-2 text-sm leading-relaxed text-gray-600">
              Bạn có chắc chắn muốn hủy đơn hàng này không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingCancelOrderId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Giữ đơn hàng
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xác nhận hủy
              </button>
            </div>
          </section>
        </div>
      )}
      {showRefundInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowRefundInfo(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-info-title"
            aria-describedby="refund-info-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="refund-info-title" className="text-lg font-bold text-gray-900">Thông tin hoàn tiền</h2>
            <p id="refund-info-description" className="mt-2 text-sm leading-relaxed text-gray-600">
              Đơn hàng đã hủy được hoàn 100% giá trị, bao gồm phí vận chuyển, về ví NaviShop.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRefundInfo(false)}
                className="rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]"
              >
                Đã hiểu
              </button>
            </div>
          </section>
        </div>
      )}
      {showSaveProfileConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowSaveProfileConfirmation(false)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="save-profile-title"
            aria-describedby="save-profile-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="save-profile-title" className="text-lg font-bold text-gray-900">Lưu thay đổi hồ sơ?</h2>
            <p id="save-profile-description" className="mt-2 text-sm leading-relaxed text-gray-600">
              Bạn có muốn lưu các thay đổi thông tin hồ sơ này không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveProfileConfirmation(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmSaveProfile}
                className="rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]"
              >
                Xác nhận lưu
              </button>
            </div>
          </section>
        </div>
      )}
      {showPasswordConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowPasswordConfirmation(false)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            aria-describedby="change-password-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="change-password-title" className="text-lg font-bold text-gray-900">Xác nhận đổi mật khẩu?</h2>
            <p id="change-password-description" className="mt-2 text-sm leading-relaxed text-gray-600">
              Chức năng hiện chưa kết nối với hệ thống tài khoản, nên mật khẩu sẽ chưa được thay đổi.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={confirmPasswordChange}
                className="rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]"
              >
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
