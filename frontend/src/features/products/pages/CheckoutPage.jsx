import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, MessageCircle, MapPin, Package, ShoppingBag, Store, Wallet, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { getCartInventoryIssues } from '@/lib/cartInventory'
import { formatVND } from '@/lib/format'
import { chargeMockWallet, getMockAvailableBalance, rollbackMockWalletCharge } from '@/mocks/wallet'
import { MOCK_SHOPS } from '@/mocks/mockShops'
import { saveCheckoutMockOrders } from '@/mocks/account/orders'
import { getMockAuctionLockedBalance } from '@/mocks/auction/sessionMock'
import { createOrderPaymentNotification } from '@/mocks/mockNotifications'

const SHIPPING_FEE_PER_SHOP = 30000

function groupItemsByShop(items) {
  const groups = new Map()
  items.forEach((item) => {
    const key = item.shopSlug || item.shop || 'unknown-shop'
    if (!groups.has(key)) {
      const shop = MOCK_SHOPS.find((entry) => entry.slug === item.shopSlug || entry.name === item.shop)
      groups.set(key, { id: shop?.id, name: shop?.name || item.shop || 'Cửa hàng', items: [] })
    }
    groups.get(key).items.push(item)
  })
  return [...groups.values()]
}

export default function CheckoutPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { removeFromCart } = useCart()
  const items = state?.items ?? []
  const addresses = Array.isArray(user?.shippingAddresses) && user.shippingAddresses.length > 0
    ? user.shippingAddresses
    : user?.address
      ? [{
          id: 'account-address',
          recipientName: user.name ?? '',
          phone: user.phone ?? '',
          address: user.address,
          isDefault: true,
        }]
      : []
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? '')
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({ recipientName: '', phone: '', address: '' })
  const [addressErrors, setAddressErrors] = useState({})
  const [addressSubmitted, setAddressSubmitted] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('navishop-wallet')
  const [orderError, setOrderError] = useState('')
  const [availableBalance, setAvailableBalance] = useState(
    () => getMockAvailableBalance(getMockAuctionLockedBalance()),
  )
  const orderSubmissionInProgress = useRef(false)
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)

  useEffect(() => {
    const defaultAddressId = defaultAddress?.id ?? ''
    setSelectedAddressId(defaultAddressId)
  }, [defaultAddress?.id])

  const inventoryIssues = getCartInventoryIssues(items)
  const shopGroups = groupItemsByShop(items)
  const merchandiseTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = shopGroups.length * SHIPPING_FEE_PER_SHOP
  const total = merchandiseTotal + shippingFee

  const openAddressDialog = () => setIsAddressDialogOpen(true)

  const openAddressEditor = (address = null) => {
    setEditingAddressId(address?.id ?? null)
    setIsAddressEditorOpen(true)
    setAddressForm({
      recipientName: address?.recipientName ?? user?.name ?? '',
      phone: String(address?.phone ?? user?.phone ?? '').replace(/\D/g, ''),
      address: address?.address ?? '',
    })
    setAddressErrors({})
    setAddressSubmitted(false)
  }

  const validateAddressForm = () => {
    const errors = {}
    if (!addressForm.recipientName.trim()) errors.recipientName = 'Vui lòng nhập họ tên người nhận.'
    if (!addressForm.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
    else if (!/^\d+$/.test(addressForm.phone)) errors.phone = 'Số điện thoại chỉ được chứa chữ số.'
    if (!addressForm.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể.'
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveAddress = (event) => {
    event.preventDefault()
    setAddressSubmitted(true)
    if (!validateAddressForm()) return

    const nextAddress = {
      id: editingAddressId ?? globalThis.crypto?.randomUUID?.() ?? `address-${Date.now()}`,
      recipientName: addressForm.recipientName.trim(),
      phone: addressForm.phone,
      address: addressForm.address.trim(),
      isDefault: addresses.some((address) => address.id === editingAddressId && address.isDefault)
        || addresses.length === 0,
    }
    const nextAddresses = editingAddressId
      ? addresses.map((address) => address.id === editingAddressId ? nextAddress : address)
      : [...addresses, nextAddress]

    updateUser({ shippingAddresses: nextAddresses })
    setSelectedAddressId(nextAddress.id)
    setEditingAddressId(null)
    setIsAddressEditorOpen(false)
    setAddressSubmitted(false)
    setAddressErrors({})
  }

  const openShopChat = (shopId) => {
    if (!shopId) return
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', { detail: { shopId } }))
  }

  const placeOrder = () => {
    if (orderSubmissionInProgress.current || !selectedAddress || inventoryIssues.length > 0) return
    orderSubmissionInProgress.current = true
    setOrderError('')

    const orderId = `NS-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
    const lockedBalance = getMockAuctionLockedBalance()
    let walletCharged = false

    try {
      walletCharged = chargeMockWallet(total, orderId, lockedBalance)
      setAvailableBalance(getMockAvailableBalance(lockedBalance))
    } catch (error) {
      orderSubmissionInProgress.current = false
      setOrderError(error instanceof Error ? error.message : 'Không thể kiểm tra số dư NaviWallet. Vui lòng thử lại.')
      return
    }

    if (!walletCharged) {
      const currentBalance = getMockAvailableBalance(lockedBalance)
      setAvailableBalance(currentBalance)
      setOrderError('Số dư của bạn không đủ để thực hiện giao dịch này.')
      orderSubmissionInProgress.current = false
      return
    }

    const createdAt = new Date().toISOString()
    const mockOrders = shopGroups.map((shopGroup) => {
      const merchandiseTotal = shopGroup.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
      const shippingFee = SHIPPING_FEE_PER_SHOP
      const shopSlug = shopGroup.items[0]?.shopSlug
      const orderItems = shopGroup.items.map((item, index) => ({
        id: `${orderId}-${shopGroup.id || shopSlug || 'shop'}-${index + 1}`,
        productId: item.id,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        variantName: item.variantName || item.variantLabel || '',
        productName: item.name || item.title || 'Sản phẩm',
        image: item.image || item.thumbnail || '',
        price: item.price,
        quantity: item.quantity,
        merchandiseTotal: item.price * item.quantity,
      }))
      return {
        id: `${orderId}-${shopGroup.id || shopSlug || 'shop'}`,
        checkoutId: orderId,
        status: 'pending',
        shopSlug,
        storeName: shopGroup.name,
        items: orderItems,
        createdAt,
        paymentMethod: selectedPaymentMethod,
        merchandiseTotal,
        shippingFee,
        totalAmount: merchandiseTotal + shippingFee,
        shippingAddress: {
          recipientName: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
        },
      }
    })

    try {
      saveCheckoutMockOrders(mockOrders)
    } catch (error) {
      try {
        rollbackMockWalletCharge(orderId, lockedBalance)
        setAvailableBalance(getMockAvailableBalance(lockedBalance))
      } catch (rollbackError) {
        setOrderError(rollbackError instanceof Error ? rollbackError.message : 'Không thể khôi phục số dư NaviWallet.')
        orderSubmissionInProgress.current = false
        return
      }
      orderSubmissionInProgress.current = false
      setOrderError(error instanceof Error ? error.message : 'Không thể tạo đơn hàng mô phỏng. Vui lòng thử lại.')
      return
    }

    items.forEach((item) => removeFromCart(item.id, item.variantId))
    window.dispatchEvent(new CustomEvent('navishop:notification', {
      detail: {
        notification: createOrderPaymentNotification({
          orderId,
          orderDetailId: mockOrders[0]?.id,
          image: items[0]?.image || items[0]?.thumbnail,
        }),
      },
    }))
    navigate('/order-success', {
      replace: true,
      state: { orderId, total },
    })
  }

  return (
    <main className="flex-1 bg-gray-50">
      {orderError && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOrderError('')
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="checkout-error-title"
            aria-describedby="checkout-error-message"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="checkout-error-title" className="text-lg font-semibold text-gray-900">
              {orderError === 'Số dư của bạn không đủ để thực hiện giao dịch này.'
                ? 'Số dư NaviWallet không đủ'
                : 'Không thể đặt hàng'}
            </h2>
            <p id="checkout-error-message" className="mt-2 text-sm leading-6 text-gray-600">
              {orderError}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setOrderError('')}
                className="min-h-11 rounded-lg bg-[#056F1C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
              >
                Đóng
              </button>
            </div>
          </section>
        </div>
      )}
      {isAddressDialogOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAddressDialogOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="checkout-address-title" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {isAddressEditorOpen ? (
              <form onSubmit={saveAddress} noValidate>
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h2 id="checkout-address-title" className="text-lg font-semibold text-gray-900">
                    {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                  </h2>
                  <button
                    type="button"
                    aria-label="Đóng cửa sổ địa chỉ"
                    onClick={() => {
                      setIsAddressDialogOpen(false)
                      setIsAddressEditorOpen(false)
                      setEditingAddressId(null)
                    }}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <label htmlFor="checkout-address-recipient" className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên người nhận</label>
                    <input
                      id="checkout-address-recipient"
                      value={addressForm.recipientName}
                      onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))}
                      aria-invalid={addressSubmitted && Boolean(addressErrors.recipientName)}
                      className={`h-11 w-full rounded-lg border px-3 text-sm text-gray-900 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${addressSubmitted && addressErrors.recipientName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {addressSubmitted && addressErrors.recipientName && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.recipientName}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-address-phone" className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      id="checkout-address-phone"
                      type="tel"
                      inputMode="numeric"
                      value={addressForm.phone}
                      onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '') }))}
                      aria-invalid={addressSubmitted && Boolean(addressErrors.phone)}
                      className={`h-11 w-full rounded-lg border px-3 text-sm text-gray-900 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${addressSubmitted && addressErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {addressSubmitted && addressErrors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-address-detail" className="mb-1.5 block text-sm font-medium text-gray-700">Địa chỉ cụ thể</label>
                    <textarea
                      id="checkout-address-detail"
                      rows={3}
                      value={addressForm.address}
                      onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
                      aria-invalid={addressSubmitted && Boolean(addressErrors.address)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${addressSubmitted && addressErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {addressSubmitted && addressErrors.address && <p role="alert" className="mt-1 text-xs text-red-600">{addressErrors.address}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null)
                      setIsAddressEditorOpen(false)
                      setAddressErrors({})
                      setAddressSubmitted(false)
                    }}
                    className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Trở lại
                  </button>
                  <button type="submit" className="min-h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
                    Lưu địa chỉ
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h2 id="checkout-address-title" className="text-lg font-semibold text-gray-900">Chọn địa chỉ giao hàng</h2>
                  <button
                    type="button"
                    aria-label="Đóng cửa sổ chọn địa chỉ"
                    onClick={() => setIsAddressDialogOpen(false)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-[65vh] space-y-3 overflow-y-auto p-5">
                  {addresses.length > 0 ? addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id
                    return (
                      <div
                        key={address.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                          isSelected ? 'border-[#056F1C] bg-green-50/60 ring-1 ring-[#056F1C]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                          <input
                            type="radio"
                            name="checkout-address-dialog"
                            value={address.id}
                            checked={isSelected}
                            onChange={() => {
                              setSelectedAddressId(address.id)
                              setIsAddressDialogOpen(false)
                            }}
                            className="mt-1 h-4 w-4 shrink-0 accent-[#056F1C]"
                          />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-gray-900">
                              {address.recipientName}
                              <span className="font-normal text-gray-500">{address.phone}</span>
                            </span>
                            <span className="mt-2 block text-sm leading-5 text-gray-700">{address.address}</span>
                            {address.isDefault && (
                              <span className="mt-2 inline-block rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#056F1C]">Mặc định</span>
                            )}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => openAddressEditor(address)}
                          className="shrink-0 text-sm font-semibold text-[#056F1C] hover:underline"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    )
                  }) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                      Bạn chưa có địa chỉ giao hàng đã lưu.
                    </p>
                  )}
                </div>
                <div className="flex justify-end border-t border-gray-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => openAddressEditor()}
                    className="inline-flex min-h-10 items-center rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 xl:px-0">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-[#056F1C] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Tiếp tục mua sắm
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Thanh toán</h1>
        {items.length ? (
          <>
            {inventoryIssues.length > 0 && (
              <div role="alert" className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Số lượng một số sản phẩm không còn khả dụng. Vui lòng quay lại giỏ hàng để điều chỉnh trước khi thanh toán.
                  {inventoryIssues.map(({ item }) => (
                    <span key={`${item.id}-${item.variantId}`} className="mt-1 block">
                      {item.name || item.title}
                    </span>
                  ))}
                </p>
                <Link to="/cart" className="shrink-0 font-semibold text-red-900 underline">Quay lại giỏ hàng</Link>
              </div>
            )}
            <div className="mt-6 space-y-5">
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900"><MapPin className="h-5 w-5 text-[#056F1C]" /> Địa chỉ giao hàng</h2>
                  <button type="button" onClick={openAddressDialog} className="text-sm font-semibold text-[#056F1C] hover:underline">Đổi địa chỉ</button>
                </div>
                {selectedAddress ? (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-gray-900">
                          {selectedAddress.recipientName}
                          <span className="font-normal text-gray-500">{selectedAddress.phone}</span>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-gray-700">{selectedAddress.address}</p>
                      </div>
                      {selectedAddress.isDefault && (
                        <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#056F1C]">Mặc định</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                    <p className="text-sm text-gray-600">Bạn chưa có địa chỉ giao hàng đã lưu.</p>
                    <Link to="/user/account/address" className="mt-3 inline-flex rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]">Thêm địa chỉ</Link>
                  </div>
                )}
              </section>
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900"><ShoppingBag className="h-5 w-5 text-[#056F1C]" /> Sản phẩm đặt mua</h2>
                <div className="mt-4 overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_8rem_7rem_8rem] gap-4 border-b border-gray-100 px-3 py-3 text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">Sản phẩm</span>
                      <span className="text-right">Đơn giá</span>
                      <span className="text-center">Số lượng</span>
                      <span className="text-right">Thành tiền</span>
                    </div>
                    {shopGroups.map((group, groupIndex) => (
                      <div key={group.name} className={groupIndex > 0 ? 'mt-3 border-t-2 border-[#056F1C]/50 pt-3' : ''}>
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm">
                          <Store className="h-4 w-4 shrink-0 text-[#056F1C]" aria-hidden="true" />
                          <span className="font-semibold text-[#056F1C]">{group.name}</span>
                          {group.id && (
                            <button
                              type="button"
                              onClick={() => openShopChat(group.id)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#056F1C] px-2.5 py-1 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Chat
                            </button>
                          )}
                        </div>
                        <ul className="divide-y divide-gray-100">
                          {group.items.map((item) => (
                            <li key={`${item.id}-${item.variantId}`} className="grid grid-cols-[minmax(0,1fr)_8rem_7rem_8rem] items-center gap-4 px-3 py-4 text-sm">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                  <Package className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                  {(item.image || item.thumbnail) && (
                                    <img
                                      src={item.image || item.thumbnail}
                                      alt=""
                                      className="absolute inset-0 h-full w-full object-cover"
                                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="block truncate font-medium text-gray-900">{item.name || item.title}</span>
                                  {item.variantLabel && <span className="mt-1 block text-gray-500">{item.variantName || item.variantLabel}</span>}
                                </div>
                              </div>
                              <span className="text-right text-gray-700">{formatVND(item.price)}</span>
                              <span className="text-center text-gray-700">{item.quantity}</span>
                              <span className="text-right font-semibold text-gray-900">{formatVND(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Phương thức thanh toán</h2>
                <button
                  type="button"
                  aria-pressed={selectedPaymentMethod === 'navishop-wallet'}
                  onClick={() => setSelectedPaymentMethod('navishop-wallet')}
                  className={`mt-4 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                    selectedPaymentMethod === 'navishop-wallet'
                      ? 'border-[#056F1C] bg-green-50/60 ring-1 ring-[#056F1C]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-[#056F1C]">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900">Ví NaviWallet</span>
                    <span className="mt-1 block text-xs text-gray-500">Thanh toán bằng số dư ví</span>
                    <span className={`mt-1 block text-xs ${availableBalance < total ? 'font-medium text-red-600' : 'text-gray-500'}`}>
                      Số dư khả dụng: {formatVND(availableBalance)}
                    </span>
                  </span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedPaymentMethod === 'navishop-wallet' ? 'border-[#056F1C] bg-[#056F1C] text-white' : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === 'navishop-wallet' && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="ml-auto w-full max-w-md space-y-3">
                    <div className="flex justify-between gap-4 text-sm text-gray-600"><span>Tổng tiền hàng</span><span>{formatVND(merchandiseTotal)}</span></div>
                    <div className="flex justify-between gap-4 text-sm text-gray-600">
                      <span>Phí vận chuyển ({shopGroups.length} shop)</span>
                      <span>{formatVND(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                      <span>Tổng thanh toán</span><span className="text-[#056F1C]">{formatVND(total)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <p className="text-left text-sm text-gray-500">
                      Nhấn “Đặt hàng” đồng nghĩa với việc bạn đồng ý tuân theo{' '}
                      <Link to="/info/policies/trade" target="_blank" rel="noopener noreferrer" className="font-medium text-[#056F1C] hover:underline">
                        chính sách thỏa thuận mua bán
                      </Link>{' '}
                      của chúng tôi.
                    </p>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={!selectedAddress || inventoryIssues.length > 0}
                        className="min-h-12 rounded-lg bg-[#056F1C] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Đặt hàng
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-700">Chưa có sản phẩm để thanh toán.</p>
            <Link to="/search" className="mt-4 inline-flex rounded-lg bg-[#056F1C] px-4 py-2 font-semibold text-white hover:bg-[#045517]">Khám phá sản phẩm</Link>
          </div>
        )}
      </div>
    </main>
  )
}
