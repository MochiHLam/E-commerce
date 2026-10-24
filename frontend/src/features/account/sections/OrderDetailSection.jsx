import { ArrowLeft, CalendarDays, CircleDollarSign, MapPin, MessageCircle, Package, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOrderItems, ORDER_STATUS_LABELS } from '@/mocks/account/orders'
import { getMockItem } from '@/mocks/auction/historyMock'
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

function getStatusDate(order, status) {
  const recordedDate = order.statusTimestamps?.[status]
    ?? order[`${status}At`]
    ?? (status === 'pending' ? order.createdAt : null)
  return recordedDate ?? null
}

function formatStatusDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const pad = (part) => String(part).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

export default function OrderDetailSection({ order, fallbackShippingAddress, onAdvanceOrder }) {
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

  const items = getOrderItems(order)
  const isAuctionOrder = order.source === 'auction'
  const auctionItem = isAuctionOrder && order.auctionSessionId && order.auctionItemId
    ? getMockItem(order.auctionSessionId, order.auctionItemId)
    : null
  const subtotal = order.merchandiseTotal ?? items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const shippingFee = order.shippingFee ?? 30000
  const total = order.totalAmount ?? subtotal + shippingFee
  const orderDate = formatOrderDate(order.createdAt)
  const statusStyle = order.status === 'cancelled'
    ? 'bg-red-50 text-red-700'
    : 'bg-green-50 text-[#056F1C]'
  const orderStatusCopy = {
    pending: 'Đơn hàng đang chờ cửa hàng xác nhận.',
    shipping: 'Cửa hàng đã xác nhận và đơn hàng đang được vận chuyển.',
    delivered: 'Hàng đã đến nơi. Vui lòng xác nhận khi bạn đã nhận được hàng. Nếu bạn chưa xác nhận, đơn sẽ tự động hoàn thành sau 3 ngày.',
    completed: 'Đơn hàng đã được giao thành công.',
    cancelled: 'Đơn hàng đã bị hủy.',
  }
  const shippingSteps = [
    { status: 'pending', label: 'Chờ xác nhận' },
    { status: 'shipping', label: 'Vận chuyển' },
    { status: 'delivered', label: 'Chờ giao hàng' },
    { status: 'completed', label: 'Hoàn thành' },
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
            <ol aria-label="Tiến trình giao hàng" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {shippingSteps.map((step, index) => {
                const isComplete = currentStep >= 0 && index <= currentStep
                const statusDate = getStatusDate(order, step.status)
                const formattedStatusDate = statusDate ? formatStatusDate(statusDate) : null
                return (
                  <li key={step.status} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isComplete ? 'bg-[#056F1C] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={isComplete ? 'font-medium text-gray-900' : 'text-gray-500'}>{step.label}</span>
                      {formattedStatusDate && (
                        <span className="mt-1 block text-xs font-normal text-gray-500">
                          {formattedStatusDate}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
          {import.meta.env.DEV && order.status === 'pending' && (
            <button
              type="button"
              onClick={() => onAdvanceOrder?.(order.id, 'shipping')}
              className="mt-5 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Mô phỏng shop xác nhận
            </button>
          )}
          {import.meta.env.DEV && order.status === 'shipping' && (
            <button
              type="button"
              onClick={() => onAdvanceOrder?.(order.id, 'delivered')}
              className="mt-5 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Mô phỏng hàng đã đến nơi
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              type="button"
              onClick={() => onAdvanceOrder?.(order.id, 'completed')}
              className="mt-5 rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
            >
              Đã nhận hàng
            </button>
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

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-start gap-4 py-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  <Package className="h-7 w-7 text-gray-400" />
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900">{item.productName}</h2>
                  {item.variantName && <p className="mt-1 text-sm text-gray-600">{item.variantName}</p>}
                  <p className="mt-1 text-sm text-gray-600">Số lượng: {item.quantity ?? 1}</p>
                  {!isAuctionOrder && (
                    <p className="mt-2 text-sm font-semibold text-[#056F1C]">
                      {formatPrice(item.price)} / sản phẩm
                      <span className="ml-2 font-normal text-gray-600">
                        · Thành tiền {formatPrice(item.merchandiseTotal ?? item.price * (item.quantity ?? 1))}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </section>

        {auctionItem && (
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Thông tin đấu giá</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-sm text-gray-600">Phiên đấu giá</dt>
                <dd className="mt-1 font-medium text-gray-900">{auctionItem.session.name}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-sm text-gray-600">Giá đấu thành</dt>
                <dd className="mt-1 font-semibold text-[#056F1C]">{formatPrice(auctionItem.item.finalPrice)}</dd>
              </div>
            </dl>
          </section>
        )}

        {!isAuctionOrder && (
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
                  {order.paymentMethod === 'navishop-wallet'
                    ? 'NaviWallet'
                    : order.paymentMethod || 'Chưa có dữ liệu'}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
