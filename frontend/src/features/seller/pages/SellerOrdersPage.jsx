import { useEffect, useState } from 'react'
import {
  Clock3,
  Eye,
  PackageCheck,
  X,
} from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatVND } from '@/lib/format'
import { getSellerApplication } from '@/mocks/seller'
import { getSellerDashboardMock, transitionSellerOrder } from '@/mocks/sellerDashboard'

const ORDER_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending_confirm', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Chờ báo giao' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
]

const ORDER_STATUS_LABELS = {
  auction_won: 'Đơn đấu giá được tạo',
  pending_confirm: 'Chờ xác nhận',
  confirmed: 'Chờ báo giao',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

function readOrdersForShop(userId, shopSlug) {
  return getSellerDashboardMock(userId, shopSlug).orders
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

function formatRemaining(value) {
  if (!value) return 'Không có deadline'
  const remaining = new Date(value).getTime() - Date.now()
  if (!Number.isFinite(remaining)) return 'Deadline không hợp lệ'
  const minutes = Math.floor(Math.abs(remaining) / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const valueText = days > 0
    ? `${days} ngày ${hours % 24} giờ`
    : hours > 0
      ? `${hours} giờ ${minutes % 60} phút`
      : `${minutes} phút`
  return remaining < 0 ? `Quá hạn ${valueText}` : `Còn ${valueText}`
}

function getStatusTone(status) {
  if (status === 'completed') return 'bg-green-50 text-green-800'
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600'
  if (status === 'pending_confirm') return 'bg-amber-50 text-amber-800'
  if (status === 'confirmed') return 'bg-blue-50 text-blue-800'
  return 'bg-indigo-50 text-indigo-800'
}

function getDeadlineLabel(order) {
  if (order.source === 'auction') return 'Theo quy trình đấu giá'
  if (order.status === 'pending_confirm') return 'Hạn xác nhận'
  if (order.status === 'confirmed') return 'Hạn báo giao'
  if (order.status === 'shipping' && order.source === 'normal') return 'Dự kiến hoàn thành'
  return '—'
}

function getDeadlineTone(order) {
  if (!order.deadlineAt) return 'text-gray-500'
  return new Date(order.deadlineAt) < new Date() ? 'font-semibold text-red-700' : 'text-gray-700'
}

function OrderStatus({ order }) {
  const label = ORDER_STATUS_LABELS[order.status]
  if (!label) return null

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(order.status)}`}>
      {label}
    </span>
  )
}

function OrderDetailsDialog({ order, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const auctionOrder = order.source === 'auction'
  const history = [...(order.statusHistory ?? [])].sort((left, right) => new Date(left.at) - new Date(right.at))

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/50 sm:items-center sm:p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-order-detail-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="seller-order-detail-title" className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h2>
            <p className="mt-1 break-all text-sm text-gray-500">{order.id}</p>
          </div>
          <button
            type="button"
            aria-label="Đóng chi tiết đơn hàng"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <OrderStatus order={order} />
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${auctionOrder ? 'bg-violet-50 text-violet-800' : 'bg-gray-100 text-gray-700'}`}>
              {auctionOrder ? 'Đơn đấu giá' : 'Đơn thường'}
            </span>
          </div>

          <section className="grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Người mua</h3>
              <p className="mt-2 text-sm font-semibold text-gray-900">{order.buyer?.name || 'Chưa có dữ liệu'}</p>
              <p className="mt-1 text-sm text-gray-600">{order.buyer?.phone || 'Chưa có số điện thoại'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Thông tin giao hàng</h3>
              <p className="mt-2 text-sm leading-6 text-gray-800">{order.deliveryAddress || 'Chưa có địa chỉ giao hàng'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ngày đặt</h3>
              <p className="mt-2 text-sm text-gray-800">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hạn xử lý</h3>
              <p className={`mt-2 text-sm ${getDeadlineTone(order)}`}>
                {getDeadlineLabel(order)}: {order.deadlineAt ? `${formatDate(order.deadlineAt)} (${formatRemaining(order.deadlineAt)})` : 'Không áp dụng deadline đơn thường'}
              </p>
              {order.deadlineSnapshot && (
                <p className="mt-1 text-xs text-gray-500">
                  Xác nhận đơn trong {order.deadlineSnapshot.confirmHours} giờ · người mua xác nhận đã nhận hàng trong {order.deadlineSnapshot.autoCompleteDays} ngày sau khi shop bắt đầu giao
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">Sản phẩm trong đơn</h3>
            <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {(order.items ?? []).map((item, index) => (
                <div key={item.productId ?? `${order.id}-${index}`} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.name || order.productName || 'Sản phẩm'}</p>
                    <p className="mt-1 text-xs text-gray-500">Mã sản phẩm: {item.productId || '—'} · Số lượng: {item.quantity ?? 1}</p>
                    <p className="mt-1 text-xs text-gray-500">Đơn giá: {formatVND(item.productPrice)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-800">{formatVND(item.merchandiseTotal)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">Đối soát đơn hàng</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Tiền hàng</dt><dd className="font-medium text-gray-900">{formatVND(order.itemTotal)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Phí vận chuyển</dt><dd className="font-medium text-gray-900">{formatVND(order.shippingFee)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Hoa hồng sàn</dt><dd className="font-medium text-gray-900">{formatVND(order.commission)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
                <dt className="font-semibold text-gray-800">Shop nhận khi hoàn thành</dt>
                <dd className="font-bold text-[#056F1C]">{formatVND(order.sellerNet)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Các khoản tiền là dữ liệu minh họa; phí ship không tính vào doanh thu shop.
            </p>
          </section>

          {auctionOrder && (
            <p className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900">
              Đơn đấu giá theo quy trình riêng. Không áp dụng xác nhận đơn thường, tự hủy đơn thường hoặc các deadline đơn thường.
            </p>
          )}

          <section>
            <h3 className="font-semibold text-gray-900">Lịch sử trạng thái</h3>
            {history.length > 0 ? (
              <ol className="mt-3 space-y-0">
                {history.map((entry, index) => (
                  <li key={`${entry.status}-${entry.at}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                    <span className="relative flex w-4 shrink-0 justify-center">
                      <span className="absolute bottom-0 top-3 w-px bg-gray-200 last:hidden" />
                      <span className="z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-[#056F1C] ring-2 ring-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold text-gray-900">{ORDER_STATUS_LABELS[entry.status] || entry.status}</p>
                        <time className="text-xs text-gray-500">{formatDate(entry.at)}</time>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-gray-600">{entry.note}</p>
                      <p className="mt-1 text-xs text-gray-500">Thao tác bởi: {entry.actor || 'Không rõ'}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Chưa có lịch sử thao tác trong dữ liệu mock.</p>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}

export default function SellerOrdersPage() {
  const { user, isLoggedIn } = useAuth()
  const application = isLoggedIn && user?.role === 'user' ? getSellerApplication(user.id) : null
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const [orders, setOrders] = useState(() => (
    application ? readOrdersForShop(user.id, application.slug) : []
  ))
  const [error, setError] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(() => searchParams.get('order') ?? '')
  const [orderSearch, setOrderSearch] = useState('')
  const [buyerSearch, setBuyerSearch] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    if (application && user?.id) setOrders(readOrdersForShop(user.id, application.slug))
  }, [application?.slug, user?.id])

  useEffect(() => {
    setSelectedOrderId(searchParams.get('order') ?? '')
  }, [searchParams])

  useEffect(() => {
    if (dateStart && dateEnd && dateStart > dateEnd) {
      setDateError('Ngày kết thúc không được trước ngày bắt đầu.')
    } else {
      setDateError('')
    }
  }, [dateStart, dateEnd])

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application) return <Navigate to="/seller/onboarding" replace />

  const isReadOnly = application.status !== 'approved'
  const activeFilter = ORDER_FILTERS.some((filter) => filter.id === requestedStatus) ? requestedStatus : 'all'
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null
  const filteredOrders = orders
    .filter((order) => activeFilter === 'all' || order.status === activeFilter)
    .filter((order) => sourceFilter === 'all' || order.source === sourceFilter)
    .filter((order) => {
      const normalizedSearch = orderSearch.trim().toLocaleLowerCase('vi')
      const normalizedBuyer = buyerSearch.trim().toLocaleLowerCase('vi')
      if (normalizedSearch && !order.id.toLocaleLowerCase('vi').includes(normalizedSearch)) return false
      if (normalizedBuyer && !order.buyer?.name?.toLocaleLowerCase('vi').includes(normalizedBuyer)) return false
      if (dateStart && new Date(order.createdAt) < new Date(`${dateStart}T00:00:00`)) return false
      if (dateEnd && new Date(order.createdAt) > new Date(`${dateEnd}T23:59:59.999`)) return false
      return true
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
  const buyerDataAvailable = orders.some((order) => order.buyer?.name)
  const sourceDataAvailable = orders.some((order) => order.source)

  const handleFilterChange = (filterId) => {
    setSearchParams(filterId === 'all' ? {} : { status: filterId })
  }

  const openOrderDetails = (orderId) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('order', orderId)
    setSearchParams(nextParams, { replace: true })
  }

  const closeOrderDetails = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('order')
    setSearchParams(nextParams, { replace: true })
  }

  const updateOrderStatus = (order, nextStatus) => {
    setError('')
    try {
      const updated = transitionSellerOrder(
        user.id,
        application.slug,
        order.id,
        nextStatus,
        application.contactName || user.name || 'Chủ shop',
      )
      setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)))
    } catch (transitionError) {
      setError(transitionError instanceof Error ? transitionError.message : 'Không thể cập nhật trạng thái đơn hàng mock.')
      setOrders(readOrdersForShop(user.id, application.slug))
    }
  }

  const renderActions = (order) => {
    if (isReadOnly || order.source === 'auction') {
      return <span className="text-xs text-gray-500">{order.source === 'auction' ? 'Theo quy trình đấu giá' : 'Chỉ xem'}</span>
    }
    if (import.meta.env.DEV && order.status === 'pending_confirm') {
      return (
        <button
          type="button"
          onClick={() => updateOrderStatus(order, 'confirmed')}
          className="min-h-9 whitespace-nowrap rounded-lg bg-[#056F1C] px-3 text-xs font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
        >
          Xác nhận đơn
        </button>
      )
    }
    if (import.meta.env.DEV && order.status === 'confirmed') {
      return (
        <button
          type="button"
          onClick={() => updateOrderStatus(order, 'shipping')}
          className="min-h-9 whitespace-nowrap rounded-lg bg-[#056F1C] px-3 text-xs font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
        >
          Báo đã giao
        </button>
      )
    }
    if (order.status === 'shipping') return <span className="text-xs text-gray-500">Chờ người mua</span>
    return <span className="text-xs text-gray-500">Chỉ xem</span>
  }

  const resetFilters = () => {
    setSearchParams({})
    setOrderSearch('')
    setBuyerSearch('')
    setDateStart('')
    setDateEnd('')
    setSourceFilter('all')
  }

  const renderOrderCard = (order) => (
    <article key={order.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-sm font-bold text-gray-900">{order.id}</p>
          <p className="mt-1 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatus order={order} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <p className="min-w-0 truncate text-sm font-medium text-gray-800">{order.productName || 'Sản phẩm'}</p>
        <p className="shrink-0 text-sm font-semibold text-gray-900">{formatVND(order.itemTotal)}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => openOrderDetails(order.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
          <Eye className="h-4 w-4" /> Chi tiết
        </button>
        {renderActions(order)}
      </div>
    </article>
  )

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Đơn hàng</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Theo dõi trạng thái, thời hạn và thông tin xử lý đơn của shop.</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
          {filteredOrders.length} / {orders.length} đơn minh họa
        </span>
      </header>

      {isReadOnly && (
        <p role="status" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          Shop đang ở chế độ chỉ xem. Bạn chưa thể xử lý đơn hàng.
        </p>
      )}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</p>}

      <nav aria-label="Lọc trạng thái đơn hàng" className="mt-5 flex gap-2 overflow-x-auto border-b border-gray-200">
        {ORDER_FILTERS.map(({ id, label }) => {
          const count = id === 'all' ? orders.length : orders.filter((order) => order.status === id).length
          return (
            <button
              key={id}
              type="button"
              aria-pressed={activeFilter === id}
              onClick={() => handleFilterChange(id)}
              className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#056F1C] ${
                activeFilter === id
                  ? 'border-[#056F1C] text-[#056F1C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {label} <span className="ml-1 text-xs text-gray-400">{count}</span>
            </button>
          )
        })}
      </nav>

      <section aria-label="Bộ lọc đơn hàng" className="mt-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <label htmlFor="seller-order-start-date" className="mb-1.5 block text-xs font-medium text-gray-600">Từ ngày</label>
          <input id="seller-order-start-date" type="date" value={dateStart} max={dateEnd || undefined} onChange={(event) => setDateStart(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 px-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
        </div>
        <div>
          <label htmlFor="seller-order-end-date" className="mb-1.5 block text-xs font-medium text-gray-600">Đến ngày</label>
          <input id="seller-order-end-date" type="date" value={dateEnd} min={dateStart || undefined} onChange={(event) => setDateEnd(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 px-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
        </div>
        <div>
          <label htmlFor="seller-order-code-search" className="mb-1.5 block text-xs font-medium text-gray-600">Mã đơn</label>
          <input id="seller-order-code-search" type="search" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Nhập mã đơn" className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
        </div>
        <div>
          <label htmlFor="seller-order-buyer-search" className="mb-1.5 block text-xs font-medium text-gray-600">Tên người mua</label>
          <input id="seller-order-buyer-search" type="search" value={buyerSearch} onChange={(event) => setBuyerSearch(event.target.value)} placeholder={buyerDataAvailable ? 'Nhập tên người mua' : 'Chưa có dữ liệu'} disabled={!buyerDataAvailable} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 disabled:bg-gray-50 disabled:text-gray-400" />
        </div>
        {sourceDataAvailable && (
          <div>
            <label htmlFor="seller-order-source" className="mb-1.5 block text-xs font-medium text-gray-600">Nguồn đơn</label>
            <select id="seller-order-source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15">
              <option value="all">Tất cả nguồn</option>
              <option value="normal">Đơn thường</option>
              <option value="auction">Đấu giá</option>
            </select>
          </div>
        )}
        {dateError && <p role="alert" className="text-xs text-red-700 sm:col-span-2 xl:col-span-5">{dateError}</p>}
      </section>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <p>Đơn trong danh sách: dữ liệu minh họa · Deadline hiển thị theo snapshot của đơn.</p>
        <button type="button" onClick={resetFilters} className="font-semibold text-[#056F1C] hover:underline">Xóa bộ lọc</button>
      </div>

      {filteredOrders.length === 0 ? (
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
          {orders.length === 0
            ? <PackageCheck className="mx-auto h-9 w-9 text-gray-300" />
            : <Clock3 className="mx-auto h-9 w-9 text-gray-300" />}
          <h2 className="mt-3 text-sm font-semibold text-gray-800">
            {orders.length === 0 ? 'Chưa có đơn hàng của shop' : 'Không có đơn phù hợp bộ lọc'}
          </h2>
          <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-500">
            {orders.length === 0
              ? 'Đơn hàng minh họa sẽ hiển thị khi có dữ liệu cho cửa hàng.'
              : 'Thay đổi trạng thái hoặc bộ lọc phụ để xem thêm đơn hàng.'}
          </p>
        </section>
      ) : (
        <>
          <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02] xl:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Mã đơn / Ngày</th>
                  <th scope="col" className="px-3 py-3 font-medium">Sản phẩm</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Tiền hàng</th>
                  <th scope="col" className="px-3 py-3 font-medium">Trạng thái</th>
                  <th scope="col" className="px-3 py-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="max-w-40 break-all font-semibold text-gray-900">{order.id}</p>
                      <p className="mt-1 whitespace-nowrap text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="max-w-48 px-3 py-3">
                      <p className="line-clamp-2 font-medium text-gray-800">{order.productName}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-gray-800">{formatVND(order.itemTotal)}</td>
                    <td className="px-3 py-3"><OrderStatus order={order} /></td>
                    <td className="px-3 py-3">
                      <div className="flex min-w-48 flex-wrap items-center gap-2">
                        {renderActions(order)}
                        <button type="button" onClick={() => openOrderDetails(order.id)} className="min-h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:hidden">
            {filteredOrders.map(renderOrderCard)}
          </div>
        </>
      )}

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Đơn thường đi theo luồng chờ xác nhận → chờ báo giao → đang giao. Khi đơn đang giao, chờ người mua xác nhận đã nhận hàng; đơn hoàn thành/đã hủy chỉ xem. Không có thao tác hủy đơn thường.
      </p>

      {selectedOrder && <OrderDetailsDialog order={selectedOrder} onClose={closeOrderDetails} />}
      <Link to="/seller/dashboard" className="mt-3 inline-flex text-sm font-semibold text-[#056F1C] hover:underline">Quay lại tổng quan</Link>
    </div>
  )
}
