import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Package,
  Truck,
  Wallet,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatVND } from '@/lib/format'
import { getSellerApplication, getSellerProducts } from '@/mocks/seller'
import { getSellerDashboardMock, getSellerRevenueMock } from '@/mocks/sellerDashboard'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

function formatRemaining(value) {
  if (!value) return 'Chưa có hạn xử lý'
  const remaining = new Date(value).getTime() - Date.now()
  if (!Number.isFinite(remaining)) return 'Hạn xử lý không hợp lệ'
  const minutes = Math.floor(Math.abs(remaining) / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const duration = days > 0
    ? `${days} ngày ${hours % 24} giờ`
    : hours > 0
      ? `${hours} giờ ${minutes % 60} phút`
      : `${minutes} phút`
  return remaining < 0 ? `Quá hạn ${duration}` : `Còn ${duration}`
}

function getDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function SummaryCard({ label, value, detail, to, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex min-h-32 items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] transition-colors hover:border-green-200 hover:bg-green-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-500">{label}</span>
        <span className="mt-3 block text-2xl font-bold tracking-tight text-gray-900">{value}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">{detail}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#056F1C]">
          Xem chi tiết <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </Link>
  )
}

function OrderStatus({ status }) {
  const labels = {
    pending_confirm: 'Chờ xác nhận',
    confirmed: 'Chờ báo giao',
    shipping: 'Đang giao',
  }
  const tone = status === 'pending_confirm'
    ? 'bg-amber-50 text-amber-800'
    : status === 'confirmed'
      ? 'bg-blue-50 text-blue-800'
      : 'bg-gray-100 text-gray-700'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{labels[status]}</span>
}

function RevenueChart({ days, entries }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDay = new Date(today)
  firstDay.setDate(firstDay.getDate() - days + 1)

  const dailyRevenue = Array.from({ length: days }, (_, index) => {
    const date = new Date(firstDay)
    date.setDate(firstDay.getDate() + index)
    return { date, amount: 0 }
  })
  const dayIndexes = new Map(dailyRevenue.map((day, index) => [getDayKey(day.date), index]))

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt)
    const index = dayIndexes.get(getDayKey(entryDate))
    if (index !== undefined) dailyRevenue[index].amount += entry.amount
  }

  const maxRevenue = Math.max(...dailyRevenue.map((day) => day.amount), 1)
  const totalRevenue = dailyRevenue.reduce((total, day) => total + day.amount, 0)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Doanh thu thực nhận</h2>
          <p className="mt-1 text-sm text-gray-500">Tiền ghi có cho Shop từ đơn hoàn thành trong kỳ.</p>
        </div>
        <p className="text-right text-lg font-bold text-gray-900">{formatVND(totalRevenue)}</p>
      </div>
      <div
        role="img"
        aria-label={`Biểu đồ doanh thu thực nhận ${days} ngày, tổng ${formatVND(totalRevenue)}`}
        className="mt-6 flex h-36 items-end gap-1 border-b border-l border-gray-200 px-2 sm:gap-1.5"
      >
        {dailyRevenue.map(({ date, amount }) => (
          <div
            key={getDayKey(date)}
            title={`${date.toLocaleDateString('vi-VN')}: ${formatVND(amount)}`}
            className="min-w-0 flex-1 rounded-t-sm bg-[#056F1C]/75 transition-colors hover:bg-[#056F1C]"
            style={{ height: `${Math.max(3, (amount / maxRevenue) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{dailyRevenue[0]?.date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span>
        <span>{dailyRevenue.at(-1)?.date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span>
      </div>
    </section>
  )
}

export default function SellerDashboardPage() {
  const { user, isLoggedIn } = useAuth()
  const application = user?.role === 'user' ? getSellerApplication(user.id) : null
  const [period, setPeriod] = useState(7)
  const dashboardData = useMemo(
    () => getSellerDashboardMock(user?.id ?? 'preview', application?.slug ?? 'preview'),
    [user?.id, application?.slug],
  )
  const revenueData = useMemo(
    () => getSellerRevenueMock(user?.id ?? 'preview', application?.slug ?? 'preview'),
    [user?.id, application?.slug],
  )
  const products = useMemo(() => getSellerProducts(user?.id), [user?.id])

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'pending') return <Navigate to="/seller/pending" replace />
  if (!['approved', 'suspended', 'banned', 'pending_deletion', 'deleted'].includes(application.status)) {
    return <Navigate to="/seller/onboarding" replace />
  }

  const orders = dashboardData.orders
  const pendingOrders = orders.filter((order) => order.status === 'pending_confirm').length
  const confirmedOrders = orders.filter((order) => order.status === 'confirmed').length
  const activeProducts = products.filter((product) => product.status === 'active').length
  const periodStart = new Date()
  periodStart.setHours(0, 0, 0, 0)
  periodStart.setDate(periodStart.getDate() - period + 1)
  const periodCredits = revenueData.ledgerEntries.filter((entry) => (
    entry.account === 'seller'
    && entry.type === 'credit'
    && new Date(entry.createdAt) >= periodStart
  ))
  const completedInPeriod = new Set(periodCredits.map((entry) => entry.orderId)).size
  const attentionOrders = orders
    .filter((order) => (
      order.source !== 'auction'
      && (
        ['pending_confirm', 'confirmed'].includes(order.status)
        || (order.status === 'shipping'
          && order.deadlineAt
          && new Date(order.deadlineAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000)
      )
    ))
    .sort((left, right) => {
      const priority = { pending_confirm: 0, confirmed: 1, shipping: 2 }
      return priority[left.status] - priority[right.status]
        || new Date(left.deadlineAt ?? left.createdAt) - new Date(right.deadlineAt ?? right.createdAt)
    })
    .slice(0, 5)

  const outOfStockCount = products.filter((product) => (
    product.status === 'active' && Number(product.stock) === 0
  )).length
  const auctionPendingCount = products.filter((product) => product.status === 'auction_pending').length
  const unavailableCount = products.filter((product) => ['draft', 'hidden'].includes(product.status)).length
  const statusLabel = {
    approved: 'Đang hoạt động',
    suspended: 'Tạm khóa',
    banned: 'Đã bị cấm',
    pending_deletion: 'Chờ duyệt xóa',
    deleted: 'Đã xóa',
  }[application.status]
  const isReadOnly = application.status !== 'approved'
  const appealPending = application.appeal?.status === 'pending'
  const deletionRejected = application.deletionRequest?.status === 'rejected'

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{application.shopName}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Tổng quan <span aria-hidden="true">·</span> Shop {statusLabel}
            {isReadOnly && ' · Chế độ chỉ xem'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
          Kỳ doanh thu
          <select
            aria-label="Kỳ doanh thu"
            value={period}
            onChange={(event) => setPeriod(Number(event.target.value))}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
          </select>
        </label>
      </header>

      {isReadOnly && (
        <section role="status" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="font-bold text-amber-950">
                {application.status === 'suspended' && 'Shop đang bị tạm khóa'}
                {application.status === 'banned' && 'Shop đã bị cấm'}
                {application.status === 'pending_deletion' && 'Yêu cầu xóa Shop đang chờ duyệt'}
                {application.status === 'deleted' && 'Shop đã được duyệt xóa'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                {application.statusReason || 'Các chức năng vận hành Shop hiện đang ở chế độ chỉ xem.'}
              </p>
              {application.statusChangedAt && (
                <p className="mt-1 text-xs text-amber-800">Cập nhật: {formatDate(application.statusChangedAt)}</p>
              )}
              {application.status === 'suspended' && (
                <p className="mt-2 text-sm font-medium text-amber-950">
                  {appealPending
                    ? 'Khiếu nại đang chờ Admin xem xét.'
                    : <Link to="/seller/settings" className="underline underline-offset-2">Gửi khiếu nại đến Admin</Link>}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {deletionRejected && (
        <section role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Yêu cầu xóa Shop đã bị từ chối: {application.deletionRequest.rejectionReason || 'Admin chưa cung cấp lý do.'}
        </section>
      )}

      <section aria-label="Tình hình hoạt động" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Đơn chờ xác nhận"
          value={pendingOrders}
          detail="Cần xác nhận trong thời hạn đơn"
          to="/seller/orders?status=pending_confirm"
          icon={ClipboardList}
        />
        <SummaryCard
          label="Đơn cần báo giao"
          value={confirmedOrders}
          detail="Đã xác nhận, chờ bàn giao vận chuyển"
          to="/seller/orders?status=confirmed"
          icon={Truck}
        />
        <SummaryCard
          label={`Tiền thực nhận · ${period} ngày`}
          value={formatVND(periodCredits.reduce((total, entry) => total + entry.amount, 0))}
          detail={`${completedInPeriod} đơn hoàn thành trong kỳ`}
          to="/seller/revenue"
          icon={Wallet}
        />
        <SummaryCard
          label="Sản phẩm đang bán"
          value={activeProducts}
          detail="Chỉ tính sản phẩm đang hoạt động"
          to="/seller/products?status=active"
          icon={Package}
        />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div>
          <RevenueChart days={period} entries={periodCredits} />
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Số liệu mock theo Shop đang đăng nhập; doanh thu là khoản ghi có sau hoa hồng, không phải tổng tiền hàng.
          </p>
        </div>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <h2 className="text-base font-bold text-gray-900">Việc cần làm</h2>
          <p className="mt-1 text-sm text-gray-500">Chỉ hiển thị cảnh báo có dữ liệu và có thể xử lý.</p>
          <div className="mt-4 space-y-3">
            {outOfStockCount > 0 && (
              <Link to="/seller/products?stock=out" className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                <span className="flex min-w-0 items-center gap-2 text-gray-800"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />Sản phẩm đang bán đã hết hàng</span>
                <span className="shrink-0 font-bold text-amber-900">{outOfStockCount}</span>
              </Link>
            )}
            {auctionPendingCount > 0 && (
              <Link to="/seller/products?status=auction_pending" className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 text-sm hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                <span className="flex min-w-0 items-center gap-2 text-gray-800"><Clock3 className="h-4 w-4 shrink-0 text-violet-700" />Vật phẩm chờ duyệt đấu giá</span>
                <span className="shrink-0 font-bold text-violet-900">{auctionPendingCount}</span>
              </Link>
            )}
            {unavailableCount > 0 && (
              <Link to="/seller/products" className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                <span className="flex min-w-0 items-center gap-2 text-gray-800"><Package className="h-4 w-4 shrink-0 text-gray-500" />Sản phẩm nháp hoặc đã ẩn</span>
                <span className="shrink-0 font-bold text-gray-900">{unavailableCount}</span>
              </Link>
            )}
            {outOfStockCount === 0 && auctionPendingCount === 0 && unavailableCount === 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-900">
                <CheckCircle2 className="h-4 w-4 shrink-0" />Không có cảnh báo sản phẩm cần xử lý.
              </p>
            )}
          </div>
        </section>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Đơn hàng cần chú ý</h2>
            <p className="mt-1 text-sm text-gray-500">Đơn cần xác nhận, báo giao hoặc sắp đến hạn theo dõi.</p>
          </div>
          <Link to="/seller/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-[#056F1C] hover:underline">
            Tất cả đơn hàng <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {attentionOrders.length === 0 ? (
          <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Hiện không có đơn cần chú ý.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {attentionOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold text-gray-900">{order.id}</p>
                  <p className="mt-1 truncate text-sm text-gray-600">{order.productName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.status === 'pending_confirm'
                      ? `Hạn xác nhận · ${formatRemaining(order.deadlineAt)}`
                      : order.status === 'confirmed'
                        ? `Chờ báo giao · ${formatRemaining(order.deadlineAt)}`
                        : `Dự kiến hoàn thành · ${formatRemaining(order.deadlineAt)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatus status={order.status} />
                  <Link
                    to={`/seller/orders?order=${encodeURIComponent(order.id)}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    Chi tiết <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
