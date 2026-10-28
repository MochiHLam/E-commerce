import { useMemo, useState } from 'react'
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  PackageCheck,
  Truck,
  Wallet,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatVND } from '@/lib/format'
import { getSellerApplication } from '@/mocks/seller'
import { getSellerRevenueMock } from '@/mocks/sellerDashboard'

const PERIOD_OPTIONS = [
  { value: '7days', label: '7 ngày gần nhất' },
  { value: '30days', label: '30 ngày gần nhất' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'lastMonth', label: 'Tháng trước' },
  { value: 'custom', label: 'Tùy chọn ngày' },
]

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
]

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date) {
  const result = startOfDay(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function dateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function parseDateInput(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function getPeriodRange(period, customStart, customEnd, now = new Date()) {
  const today = startOfDay(now)
  if (period === '7days' || period === '30days') {
    const days = period === '7days' ? 7 : 30
    const start = new Date(today)
    start.setDate(start.getDate() - days + 1)
    return { start, end: endOfDay(today) }
  }
  if (period === 'thisMonth') {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: endOfDay(today) }
  }
  if (period === 'lastMonth') {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)),
    }
  }
  if (period === 'custom') {
    const start = parseDateInput(customStart)
    const end = parseDateInput(customEnd)
    if (!start || !end || start > end) return null
    return { start: startOfDay(start), end: endOfDay(end) }
  }
  return null
}

function isWithinRange(value, range) {
  const date = new Date(value)
  return date >= range.start && date <= range.end
}

function formatDate(value, options = {}) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...options })
}

function formatDateRange(range) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }
  const start = range.start.toLocaleDateString('vi-VN', options)
  const end = range.end.toLocaleDateString('vi-VN', options)
  return start === end ? start : `${start} – ${end}`
}

function getLedgerTotal(entries, account, type) {
  return entries.reduce((total, entry) => (
    entry.account === account && entry.type === type ? total + entry.amount : total
  ), 0)
}

function getOrderLedgerTotal(entries, orderId, account, type) {
  return getLedgerTotal(entries.filter((entry) => entry.orderId === orderId), account, type)
}

function createChartBuckets(rows, range, granularity) {
  const buckets = []
  let start = startOfDay(range.start)
  while (start <= range.end) {
    let end
    let nextStart
    if (granularity === 'month') {
      end = endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0))
      nextStart = new Date(start.getFullYear(), start.getMonth() + 1, 1)
    } else {
      const span = granularity === 'week' ? 7 : 1
      end = endOfDay(new Date(start))
      end.setDate(end.getDate() + span - 1)
      nextStart = new Date(start)
      nextStart.setDate(nextStart.getDate() + span)
    }
    if (end > range.end) end = range.end
    const matchingRows = rows.filter((row) => (
      new Date(row.order.completedAt) >= start && new Date(row.order.completedAt) <= end
    ))
    buckets.push({
      start,
      end,
      label: granularity === 'month'
        ? start.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
        : granularity === 'week'
          ? `${start.getDate()}/${start.getMonth() + 1}`
          : start.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }),
      title: formatDateRange({ start, end }),
      revenue: matchingRows.reduce((total, row) => total + row.shopReceived, 0),
      orderCount: matchingRows.length,
    })
    start = nextStart
  }
  return buckets
}

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-gray-500 sm:text-sm">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-gray-900 sm:mt-3 sm:text-2xl">{value}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${tone}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
    </article>
  )
}

function RevenueChart({ buckets }) {
  const maximum = Math.max(...buckets.map((bucket) => bucket.revenue), 1)
  if (!buckets.some((bucket) => bucket.revenue > 0)) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
        <Activity className="h-8 w-8 text-gray-300" />
        <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có dữ liệu doanh thu</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
          Biểu đồ sẽ hiển thị khi có bút toán ghi có cho đơn hoàn thành trong kỳ.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
        <div className="flex h-56 flex-col justify-between pb-7 text-right text-[10px] text-gray-500">
          <span>{formatVND(maximum)}</span>
          <span>{formatVND(Math.round(maximum / 2))}</span>
          <span>0 ₫</span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex h-56 min-w-full items-end gap-1 border-b border-gray-200 px-1 sm:gap-2">
            {buckets.map((bucket) => (
              <div
                key={bucket.start.toISOString()}
                role="img"
                aria-label={`${bucket.title}: shop nhận ${formatVND(bucket.revenue)}, ${bucket.orderCount} đơn hoàn thành`}
                title={`${bucket.title} · Shop nhận ${formatVND(bucket.revenue)} · ${bucket.orderCount} đơn hoàn thành`}
                tabIndex={0}
                className="flex h-full min-w-[24px] flex-1 flex-col justify-end rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
              >
                <div className="flex h-[calc(100%-28px)] items-end justify-center">
                  <div
                    className={`w-1/2 min-w-2 rounded-t ${bucket.revenue ? 'bg-[#056F1C]' : 'bg-gray-100'}`}
                    style={{ height: `${bucket.revenue ? Math.max(3, (bucket.revenue / maximum) * 100) : 1}%` }}
                  />
                </div>
                <span className="mt-2 h-5 truncate text-center text-[10px] text-gray-500">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400 sm:hidden">Cuộn biểu đồ ngang để xem các kỳ trong khoảng đã chọn.</p>
    </>
  )
}

export default function SellerRevenuePage() {
  const { user, isLoggedIn } = useAuth()
  const [period, setPeriod] = useState('30days')
  const [granularity, setGranularity] = useState('day')
  const [now] = useState(() => new Date())
  const [customStart, setCustomStart] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 29)
    return dateInputValue(date)
  })
  const [customEnd, setCustomEnd] = useState(() => dateInputValue(new Date()))
  const [appliedCustomRange, setAppliedCustomRange] = useState(() => {
    const end = dateInputValue(new Date())
    const start = new Date()
    start.setDate(start.getDate() - 29)
    return { start: dateInputValue(start), end }
  })
  const [dateError, setDateError] = useState('')

  const application = user?.role === 'user' ? getSellerApplication(user.id) : null
  const revenueData = useMemo(
    () => getSellerRevenueMock(user?.id ?? 'preview', application?.slug ?? 'preview', now),
    [user?.id, application?.slug, now],
  )

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application || !['approved', 'suspended', 'banned', 'pending_deletion', 'deleted'].includes(application.status)) {
    return <Navigate to="/seller/dashboard" replace />
  }

  const range = getPeriodRange(period, appliedCustomRange.start, appliedCustomRange.end, now)
  const periodOrders = range
    ? revenueData.orders.filter((order) => isWithinRange(order.completedAt, range))
    : []
  const orderIds = new Set(periodOrders.map((order) => order.id))
  const periodLedgerEntries = revenueData.ledgerEntries.filter((entry) => orderIds.has(entry.orderId))
  const settlementRows = periodOrders.map((order) => ({
    order,
    shopReceived: getOrderLedgerTotal(periodLedgerEntries, order.id, 'seller', 'credit'),
  }))
  const shopReceived = getLedgerTotal(periodLedgerEntries, 'seller', 'credit')
  const commission = getLedgerTotal(periodLedgerEntries, 'platform', 'commission')
  const shippingPaid = getLedgerTotal(periodLedgerEntries, 'carrier', 'shipping_fee')
  const merchandiseTotal = periodOrders.reduce((total, order) => total + order.itemTotal, 0)
  const chartBuckets = range ? createChartBuckets(settlementRows, range, granularity) : []

  const applyCustomRange = () => {
    if (!parseDateInput(customStart) || !parseDateInput(customEnd) || customStart > customEnd) {
      setDateError('Vui lòng chọn khoảng ngày hợp lệ; ngày kết thúc không được trước ngày bắt đầu.')
      return
    }
    setDateError('')
    setAppliedCustomRange({ start: customStart, end: customEnd })
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Doanh thu</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Đối soát tiền hàng, hoa hồng và phí vận chuyển của các đơn đã hoàn thành.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
          <CircleDollarSign className="h-4 w-4" />
          Dữ liệu minh họa
        </span>
      </header>

      <section aria-label="Bộ lọc thời gian doanh thu" className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[190px] flex-1 sm:flex-none">
            <label htmlFor="seller-revenue-period" className="mb-1.5 block text-xs font-medium text-gray-600">Kỳ báo cáo</label>
            <select
              id="seller-revenue-period"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value)
                setDateError('')
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 sm:w-52"
            >
              {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="min-w-[170px] flex-1 sm:flex-none">
            <label htmlFor="seller-revenue-granularity" className="mb-1.5 block text-xs font-medium text-gray-600">Nhóm biểu đồ</label>
            <select
              id="seller-revenue-granularity"
              value={granularity}
              onChange={(event) => setGranularity(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 sm:w-44"
            >
              {GRANULARITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
        {period === 'custom' && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
            <div>
              <label htmlFor="seller-revenue-start" className="mb-1.5 block text-xs font-medium text-gray-600">Từ ngày</label>
              <input
                id="seller-revenue-start"
                type="date"
                value={customStart}
                max={customEnd}
                onChange={(event) => setCustomStart(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              />
            </div>
            <div>
              <label htmlFor="seller-revenue-end" className="mb-1.5 block text-xs font-medium text-gray-600">Đến ngày</label>
              <input
                id="seller-revenue-end"
                type="date"
                value={customEnd}
                min={customStart}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              />
            </div>
            <button
              type="button"
              onClick={applyCustomRange}
              className="h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
            >
              Áp dụng kỳ
            </button>
            {dateError && <p role="alert" className="w-full text-sm text-red-700">{dateError}</p>}
          </div>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs leading-5 text-gray-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {range ? `${formatDateRange(range)} · Giờ Việt Nam (UTC+7)` : 'Khoảng ngày chưa hợp lệ'}
        </p>
      </section>

      <section aria-label="Chỉ số doanh thu" className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
        <SummaryCard
          label="Tiền shop thực nhận"
          value={formatVND(shopReceived)}
          detail="Ghi có vào ví shop từ ledger"
          icon={Wallet}
          tone="bg-green-50 text-[#056F1C]"
        />
        <SummaryCard
          label="Tổng tiền hàng"
          value={formatVND(merchandiseTotal)}
          detail="Đơn hoàn thành, không gồm phí ship"
          icon={PackageCheck}
          tone="bg-blue-50 text-blue-700"
        />
        <SummaryCard
          label="Hoa hồng"
          value={formatVND(commission)}
          detail="Ghi nhận theo ledger"
          icon={Activity}
          tone="bg-violet-50 text-violet-700"
        />
        <SummaryCard
          label="Phí ship đã chuyển"
          value={formatVND(shippingPaid)}
          detail="Tách riêng, không tính vào doanh thu shop"
          icon={Truck}
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryCard
          label="Đơn hoàn thành"
          value={periodOrders.length}
          detail="Theo ngày hoàn thành trong kỳ"
          icon={CalendarDays}
          tone="bg-gray-100 text-gray-700"
        />
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
        <div>
          <h2 className="font-bold text-gray-900">Tiền shop thực nhận theo kỳ</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Chỉ hiển thị bút toán ghi có gắn với đơn hoàn thành; phí vận chuyển tách riêng.
          </p>
        </div>
        <div className="mt-4">
          <RevenueChart buckets={chartBuckets} />
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-gray-900">Bảng đối soát</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {periodOrders.length} đơn hoàn thành trong khoảng thời gian đã chọn.
            </p>
          </div>
          <span className="text-xs text-gray-500">Ngày ghi nhận theo thời điểm hoàn thành</span>
        </div>
        {settlementRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Mã đơn / ngày hoàn thành</th>
                  <th scope="col" className="px-3 py-3 font-medium">Tiền hàng</th>
                  <th scope="col" className="px-3 py-3 font-medium">Hoa hồng</th>
                  <th scope="col" className="px-3 py-3 font-medium">Shop nhận</th>
                  <th scope="col" className="px-3 py-3 font-medium">Phí ship</th>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Nguồn đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlementRows.map(({ order, shopReceived: rowShopReceived }) => (
                  <tr key={order.id} className="text-gray-700">
                    <td className="px-4 py-3 sm:px-5">
                      <span className="block font-semibold text-gray-900">{order.id}</span>
                      <span className="mt-1 block text-xs text-gray-500">{formatDate(order.completedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{formatVND(order.itemTotal)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatVND(getOrderLedgerTotal(periodLedgerEntries, order.id, 'platform', 'commission'))}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">{formatVND(rowShopReceived)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatVND(getOrderLedgerTotal(periodLedgerEntries, order.id, 'carrier', 'shipping_fee'))}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.source === 'auction' ? 'bg-violet-50 text-violet-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.source === 'auction' ? 'Đấu giá' : 'Đơn thường'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <PackageCheck className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có đơn hoàn thành trong kỳ</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
              Khi có đơn hoàn thành và bút toán đối soát tương ứng, dữ liệu sẽ xuất hiện tại đây.
            </p>
          </div>
        )}
      </section>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        Bản xem trước dùng dữ liệu minh họa. Khi có service/API, các chỉ số cần lấy từ đơn hàng đã hoàn thành và ledger; không suy ra doanh thu từ tổng đơn hay số dư ví.
      </p>
    </div>
  )
}
