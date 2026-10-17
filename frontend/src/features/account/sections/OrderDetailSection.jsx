import { ArrowLeft, CalendarDays, CircleDollarSign, MapPin, MessageCircle, Package, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ORDER_STATUS_LABELS } from '@/mocks/account/orders'
import { MOCK_SHOPS } from '@/mocks/mockShops'

function formatPrice(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} ₫`
}

function formatOrderDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

export default function OrderDetailSection({ order, fallbackShippingAddress }) {
  if (!order) {
    return (
      <section>
        <Link
          to="/user/orders"
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-[#056F1C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng</h1>
        <p className="mt-2 text-sm text-gray-600">Đơn hàng này không tồn tại hoặc không còn khả dụng.</p>
      </section>
    )
  }

  const quantity = order.quantity ?? 1
  const subtotal = order.merchandiseTotal ?? order.price * quantity
  const shippingFee = order.shippingFee ?? 30000
  const total = order.totalAmount ?? subtotal + shippingFee
  const orderDate = formatOrderDate(order.createdAt)
  const statusStyle = order.status === 'cancelled'
    ? 'bg-red-50 text-red-700'
    : 'bg-green-50 text-[#056F1C]'
  const orderStatusCopy = {
    pending: 'Đơn hàng đang chờ cửa hàng xác nhận.',
    shipping: 'Đơn hàng đang được giao đến bạn.',
    completed: 'Đơn hàng đã được giao thành công.',
    cancelled: 'Đơn hàng đã bị hủy.',
  }
  const shippingSteps = [
    { status: 'pending', label: 'Chờ xác nhận' },
    { status: 'shipping', label: 'Đang giao hàng' },
    { status: 'completed', label: 'Đã giao thành công' },
  ]
  const currentStep = shippingSteps.findIndex((step) => step.status === order.status)
  const isCancelled = order.status === 'cancelled'
  const shippingAddress = {
    recipientName: order.shippingAddress?.recipientName || fallbackShippingAddress?.recipientName,
    phone: order.shippingAddress?.phone || fallbackShippingAddress?.phone,
    address: order.shippingAddress?.address || fallbackShippingAddress?.address,
  }
  const storeUrl = order.shopSlug ? `/${order.shopSlug}` : null
  const shop = MOCK_SHOPS.find((entry) => entry.slug === order.shopSlug)

  const openShopChat = () => {
    if (!shop) return
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  return (
    <section>
      <Link
        to="/user/orders"
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-[#056F1C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
          <p className="mt-2 break-all text-sm text-gray-600">Mã đơn hàng: {order.id}</p>
        </div>
        <span className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold ${statusStyle}`}>
          {ORDER_STATUS_LABELS[order.status] ?? 'Không xác định'}
        </span>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Trạng thái hàng</h2>
          <p className="mt-2 text-sm text-gray-600">{orderStatusCopy[order.status] ?? 'Đang cập nhật trạng thái đơn hàng.'}</p>
          {isCancelled ? (
            <p className="mt-4 border-l-2 border-red-500 pl-3 text-sm font-medium text-red-700">Đơn hàng đã hủy, quá trình giao hàng không tiếp tục.</p>
          ) : (
            <ol aria-label="Tiến trình giao hàng" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {shippingSteps.map((step, index) => {
                const isComplete = currentStep >= 0 && index <= currentStep
                return (
                  <li key={step.status} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isComplete ? 'bg-[#056F1C] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={isComplete ? 'font-medium text-gray-900' : 'text-gray-500'}>{step.label}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <MapPin className="h-4 w-4 text-[#056F1C]" />
            Địa chỉ nhận hàng
          </h2>
          <p className="mt-3 text-sm font-medium text-gray-900">
            {shippingAddress.recipientName || 'Chưa có tên người nhận'}
            <span className="ml-2 font-normal text-gray-600">{shippingAddress.phone || 'Chưa có số điện thoại'}</span>
          </p>
          {shippingAddress.address ? (
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">{shippingAddress.address}</p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Chưa có địa chỉ nhận hàng.{' '}
              <Link to="/user/account/address" className="font-semibold text-[#056F1C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                Cập nhật địa chỉ
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-900">
                <Store className="h-4 w-4 shrink-0 text-[#056F1C]" />
                <span className="truncate">{order.storeName}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={openShopChat}
                  disabled={!shop}
                  title={shop ? `Nhắn tin với ${order.storeName}` : 'Không có thông tin cửa hàng cho đơn hàng này'}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#056F1C] px-3 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Chat
                </button>
                {storeUrl ? (
                  <Link
                    to={storeUrl}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    Xem shop
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Không có thông tin cửa hàng cho đơn hàng này"
                    className="inline-flex min-h-10 items-center rounded-md border border-gray-200 px-3 text-xs font-semibold text-gray-400 disabled:cursor-not-allowed"
                  >
                    Xem shop
                  </button>
                )}
              </div>
            </div>
            {orderDate && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <CalendarDays className="h-4 w-4" /> Đặt hàng lúc {orderDate}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-4 py-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              <Package className="h-7 w-7 text-gray-400" />
              {order.image && (
                <img
                  src={order.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => { event.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900">{order.productName}</h2>
              {order.variantName && <p className="mt-1 text-sm text-gray-600">{order.variantName}</p>}
              <p className="mt-1 text-sm text-gray-600">Số lượng: {quantity}</p>
              <p className="mt-2 text-sm font-semibold text-[#056F1C]">{formatPrice(order.price)} / sản phẩm</p>
            </div>
          </div>

        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <CircleDollarSign className="h-4 w-4 text-[#056F1C]" />
            Thanh toán
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-gray-600">Tổng tiền hàng</span>
              <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-900">Thành tiền</span>
              <span className="text-base font-bold text-[#056F1C]">{formatPrice(total)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <span className="text-gray-600">Phương thức thanh toán</span>
              <span className="font-medium text-gray-900">
                {order.paymentMethod === 'navishop-wallet' ? 'NaviWallet' : order.paymentMethod || 'Chưa có dữ liệu'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
