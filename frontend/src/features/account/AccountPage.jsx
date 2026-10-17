import { useEffect, useState } from 'react'
import { Bell, ChevronDown, CircleDollarSign, Gavel, Package, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getProductDetailMock } from '@/mocks/productDetails'
import { PRODUCTS } from '@/mocks/products'
import { INITIAL_NOTIFICATIONS } from '@/mocks/mockNotifications'
import AuctionsSection from '@/features/account/sections/AuctionsSection'
import AddressSection from '@/features/account/sections/AddressSection'
import NotificationsSection from '@/features/account/sections/NotificationsSection'
import OrdersSection from '@/features/account/sections/OrdersSection'
import OrderDetailSection from '@/features/account/sections/OrderDetailSection'
import PasswordSection from '@/features/account/sections/PasswordSection'
import ProfileSection from '@/features/account/sections/ProfileSection'
import WalletSection from '@/features/account/sections/WalletSection'
import WalletHistorySection from '@/features/account/sections/WalletHistorySection'
import { getCheckoutMockOrders, MOCK_ORDERS } from '@/mocks/account/orders'

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
    ],
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: Bell,
    children: [
      { id: 'notification-orders', label: 'Đơn hàng' },
      { id: 'notification-auctions', label: 'Đấu giá' },
    ],
  },
  {
    id: 'wallet-menu',
    label: 'NaviWallet',
    icon: CircleDollarSign,
    children: [
      { id: 'wallet', label: 'Ví thanh toán Navi' },
      { id: 'wallet-history', label: 'Lịch sử giao dịch' },
    ],
  },
  { id: 'orders', label: 'Đơn hàng', icon: Package },
  { id: 'auctions', label: 'Lịch sử đấu giá', icon: Gavel },
]

function getProfileForm(user) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: String(user?.phone ?? '').replace(/\D/g, ''),
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
    phone: String(user?.phone ?? '').replace(/\D/g, ''),
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
  else if (!/^\d+$/.test(form.phone)) errors.phone = 'Số điện thoại chỉ được chứa chữ số.'
  if (!form.gender) errors.gender = 'Vui lòng chọn giới tính.'
  if (!form.dob) errors.dob = 'Vui lòng chọn ngày sinh.'
  return errors
}

function getAddressErrors(form) {
  const errors = {}
  if (!form.recipientName.trim()) errors.recipientName = 'Vui lòng nhập họ tên người nhận.'
  if (!form.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
  else if (!/^\d+$/.test(form.phone)) errors.phone = 'Số điện thoại chỉ được chứa chữ số.'
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
  notifications: '/user/notifications',
  'notification-orders': '/user/notifications/orders',
  'notification-auctions': '/user/notifications/auctions',
  wallet: '/user/naviwallet/wallet',
  'wallet-history': '/user/naviwallet/history',
}

export default function AccountPage({ section = 'profile' }) {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [isAccountCollapsed, setIsAccountCollapsed] = useState(false)
  const [isWalletCollapsed, setIsWalletCollapsed] = useState(false)
  const [areNotificationsCollapsed, setAreNotificationsCollapsed] = useState(false)
  const [form, setForm] = useState(() => getProfileForm(user))
  const [addresses, setAddresses] = useState(() => getAddresses(user))
  const [notifications, setNotifications] = useState(() => INITIAL_NOTIFICATIONS)
  const [activeOrderTab, setActiveOrderTab] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [mockOrders, setMockOrders] = useState(() => [...getCheckoutMockOrders(), ...MOCK_ORDERS])
  const [orderActionError, setOrderActionError] = useState('')
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
  const defaultShippingAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
  const activeSection = section
  const isAccountSectionActive = ['profile', 'address', 'password'].includes(activeSection)
  const isAccountExpanded = isAccountSectionActive && !isAccountCollapsed
  const isWalletSectionActive = ['wallet', 'wallet-history'].includes(activeSection)
  const isWalletExpanded = isWalletSectionActive && !isWalletCollapsed
  const isNotificationsSectionActive = ['notifications', 'notification-orders', 'notification-auctions'].includes(activeSection)
  const isNotificationsExpanded = isNotificationsSectionActive && !areNotificationsCollapsed
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
    setForm((current) => ({ ...current, [field]: field === 'phone' ? value.replace(/\D/g, '') : value }))
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

  const buyAgain = (order) => {
    const product = PRODUCTS.find((item) => item.id === order.productId)
      ?? PRODUCTS.find((item) => item.name === order.productName)
    const detail = product ? getProductDetailMock(product) : null
    const savedVariantLabel = order.variantLabel || order.variantName?.split(': ').at(-1)
    const variant = detail?.variants.find((item) => item.id === order.variantId)
      ?? detail?.variants.find((item) => item.label === savedVariantLabel)

    if (!product || !variant) {
      setOrderActionError('Không thể mở lại sản phẩm này để mua. Vui lòng tìm sản phẩm trong cửa hàng.')
      return
    }
    setOrderActionError('')

    navigate('/checkout', {
      state: {
        items: [{
          id: product.id,
          variantId: variant.id,
          variantName: order.variantName || `${detail.optionLabel}: ${variant.label}`,
          variantLabel: variant.label,
          name: product.name,
          title: product.name,
          image: product.images?.[0] || product.image || order.image,
          price: variant.price,
          quantity: order.quantity ?? 1,
          shop: product.shop,
          shopSlug: product.shopSlug,
        }],
      },
    })
  }

  const openAddressForm = (address) => {
    setEditingAddressId(address?.id ?? null)
    setAddressForm({
      recipientName: address?.recipientName ?? user?.name ?? '',
      phone: String(address?.phone ?? user?.phone ?? '').replace(/\D/g, ''),
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
      phone: addressForm.phone,
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
                  ? children.some(({ id: childId }) => activeSection === childId) || id === activeSection
                  : activeSection === id
                const isExpanded = children
                  ? id === 'account'
                    ? isAccountExpanded
                    : id === 'wallet-menu'
                      ? isWalletExpanded
                      : isNotificationsExpanded
                  : false
                const isSectionActive = id === 'account'
                  ? isAccountSectionActive
                  : id === 'notifications'
                    ? isNotificationsSectionActive
                    : isGroupActive
                const parentPath = id === 'account' ? '/user/account/profile' : SECTIONS.find((item) => item.id === id)?.path ?? ACCOUNT_SECTION_PATHS[children?.[0]?.id]
                return (
                  <div key={id} className="mb-1">
                    <div className={`flex items-center rounded text-sm transition-colors ${
                        isSectionActive
                          ? 'bg-[#056F1C]/[0.08] font-semibold text-[#056F1C]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#056F1C]'
                      }`}
                    >
                      <Link
                        to={children ? parentPath : `/user/${id}`}
                        aria-current={!children && isGroupActive ? 'page' : undefined}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded px-3 py-2 text-left"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{label}</span>
                      </Link>
                      {children && (
                        <button
                          type="button"
                          aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} mục ${label}`}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            if (id === 'account') setIsAccountCollapsed((collapsed) => !collapsed)
                            else if (id === 'wallet-menu') setIsWalletCollapsed((collapsed) => !collapsed)
                            else setAreNotificationsCollapsed((collapsed) => !collapsed)
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
              <ProfileSection
                form={form}
                onChange={updateField}
                onSubmit={requestSaveProfile}
                submitted={profileSubmitted}
                errors={profileErrors}
                onAvatarChange={handleAvatarChange}
                avatarError={avatarError}
                inputClass={inputClass}
                invalidInputClass={invalidInputClass}
              />
            )}

            {activeSection === 'address' && (
              <AddressSection
                addresses={addresses}
                message={addressMessage}
                form={addressForm}
                setForm={setAddressForm}
                errors={addressErrors}
                submitted={addressSubmitted}
                showForm={showAddressForm}
                editingAddressId={editingAddressId}
                onOpenForm={openAddressForm}
                onRequestDelete={requestDeleteAddress}
                onSetDefault={setDefaultAddress}
                onSave={saveAddress}
                onCancel={() => {
                  setShowAddressForm(false)
                  setEditingAddressId(null)
                }}
                inputClass={inputClass}
                invalidInputClass={invalidInputClass}
              />
            )}

            {activeSection === 'password' && (
              <PasswordSection
                form={passwordForm}
                onChange={updatePasswordField}
                onSubmit={requestPasswordChange}
                errors={passwordErrors}
                showErrors={showPasswordErrors}
                notice={passwordNotice}
                inputClass={inputClass}
                invalidInputClass={invalidInputClass}
              />
            )}

            {isNotificationsSectionActive && (
              <NotificationsSection
                notifications={notifications}
                setNotifications={setNotifications}
                filter={activeSection === 'notification-orders' ? 'order' : activeSection === 'notification-auctions' ? 'auction' : 'all'}
              />
            )}

            {activeSection === 'orders' && (
              orderId ? (
                <OrderDetailSection
                  order={mockOrders.find((order) => order.id === orderId)}
                  fallbackShippingAddress={defaultShippingAddress}
                />
              ) : (
                <OrdersSection
                  activeTab={activeOrderTab}
                  setActiveTab={setActiveOrderTab}
                  search={orderSearch}
                  setSearch={setOrderSearch}
                  orders={visibleOrders}
                  actionError={orderActionError}
                  onCancelOrder={setPendingCancelOrderId}
                  onBuyAgain={buyAgain}
                  onShowRefundInfo={() => setShowRefundInfo(true)}
                />
              )
            )}

            {activeSection === 'auctions' && <AuctionsSection />}

            {activeSection === 'wallet' && <WalletSection />}
            {activeSection === 'wallet-history' && <WalletHistorySection />}
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
