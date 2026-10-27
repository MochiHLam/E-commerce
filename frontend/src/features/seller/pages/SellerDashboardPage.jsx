import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Package,
  Plus,
  Wallet,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatVND } from '@/lib/format'
import { getSellerDashboardMock } from '@/mocks/sellerDashboard'
import { getSellerApplication, getSellerProducts } from '@/mocks/seller'

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày' },
  { value: '30days', label: '30 ngày gần nhất' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'lastMonth', label: 'Tháng trước' },
  { value: 'custom', label: 'Tùy chọn ngày' },
]

const STATUS_LABELS = {
  pending_confirm: 'Chờ xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_CUSTOM_DAYS = 365

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

function dateOffsetValue(value, offset) {
  const date = parseDateInput(value)
  if (!date) return undefined
  date.setDate(date.getDate() + offset)
  return dateInputValue(date)
}

function getPeriodRange(period, customStart, customEnd, now = new Date()) {
  const today = startOfDay(now)
  if (period === 'today') return { start: today, end: endOfDay(today) }
  if (period === '7days' || period === '30days') {
    const days = period === '7days' ? 7 : 30
    const start = new Date(today)
    start.setDate(start.getDate() - days + 1)
    return { start, end: endOfDay(today) }
  }
  if (period === 'thisMonth') {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: endOfDay(today),
    }
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

function sumRevenue(orders) {
  return orders.reduce((total, order) => total + order.sellerNet, 0)
}

function formatDateRange(range) {
  const dateOptions = { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }
  const yearOptions = { ...dateOptions, year: 'numeric' }
  const startText = range.start.toLocaleDateString('vi-VN', dateOptions)
  const endText = range.end.toLocaleDateString('vi-VN', dateOptions)
  const startYear = range.start.toLocaleDateString('vi-VN', { year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
  const endYear = range.end.toLocaleDateString('vi-VN', { year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })

  if (startText === endText && startYear === endYear) {
    return range.start.toLocaleDateString('vi-VN', yearOptions)
  }
  if (startYear === endYear) {
    return `${startText} – ${range.end.toLocaleDateString('vi-VN', yearOptions)}`
  }
  return `${range.start.toLocaleDateString('vi-VN', yearOptions)} – ${range.end.toLocaleDateString('vi-VN', yearOptions)}`
}

function formatDeadline(value, now = new Date()) {
  const remaining = new Date(value).getTime() - now.getTime()
  const totalMinutes = Math.floor(Math.abs(remaining) / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (remaining < 0) return `Quá hạn ${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`
  if (hours >= 24) return `Còn ${Math.floor(hours / 24)} ngày ${hours % 24} giờ`
  return `Còn ${hours} giờ ${minutes} phút`
}

function formatBucketDate(date) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

function formatCompactVND(value) {
  return `${new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)} ₫`
}

function getChartConfig(period, range) {
  const totalDays = Math.floor((startOfDay(range.end) - startOfDay(range.start)) / DAY_MS) + 1
  if (period === 'today') return { type: 'bar', unit: 'hour', totalDays }
  if (period === '7days') return { type: 'bar', unit: 'day', totalDays }
  if (period === '30days' || period === 'thisMonth' || period === 'lastMonth') {
    return { type: 'line', unit: 'day', totalDays }
  }
  if (totalDays <= 14) return { type: 'bar', unit: 'day', totalDays }
  if (totalDays <= 90) return { type: 'line', unit: 'day', totalDays }
  return { type: 'bar', unit: 'week', totalDays }
}

function getCompletedAt(order) {
  return order.completedAt ?? order.createdAt
}

function getChartOrders(orders, range) {
  return orders.filter((order) => (
    order.status === 'completed' && isWithinRange(getCompletedAt(order), range)
  ))
}

function createChartBuckets(orders, range, config) {
  const completedOrders = getChartOrders(orders, range)

  if (config.unit === 'hour') {
    return Array.from({ length: 8 }, (_, index) => {
      const start = new Date(range.start)
      start.setHours(index * 3, 0, 0, 0)
      const end = new Date(start)
      end.setHours(end.getHours() + 3, 0, 0, 0)
      end.setMilliseconds(-1)
      const currentOrders = completedOrders.filter((order) => isWithinRange(getCompletedAt(order), { start, end }))
      const startHour = String(index * 3).padStart(2, '0')
      const endHour = String((index + 1) * 3).padStart(2, '0')

      return {
        date: start,
        label: `${startHour}–${endHour}`,
        title: `${formatDateRange({ start: range.start, end: range.start })} · ${startHour}:00–${String((index + 1) * 3 - 1).padStart(2, '0')}:59`,
        revenue: sumRevenue(currentOrders),
        completedCount: currentOrders.length,
        showLabel: true,
      }
    })
  }

  const buckets = []
  let start = startOfDay(range.start)
  const endDate = startOfDay(range.end)
  let index = 0

  while (start <= endDate) {
    const bucketStart = new Date(start)
    const bucketEnd = new Date(start)
    const daysInBucket = config.unit === 'week' ? 7 : 1
    bucketEnd.setDate(bucketEnd.getDate() + daysInBucket - 1)
    if (bucketEnd > endDate) bucketEnd.setTime(endDate.getTime())

    const bucketRange = { start: bucketStart, end: endOfDay(bucketEnd) }
    const currentOrders = completedOrders.filter((order) => isWithinRange(getCompletedAt(order), bucketRange))
    const bucketCount = Math.ceil(config.totalDays / daysInBucket)
    const labelStride = Math.ceil(bucketCount / 6)
    const label = formatBucketDate(bucketStart)

    buckets.push({
      date: bucketStart,
      label,
      title: formatDateRange(bucketRange),
      revenue: sumRevenue(currentOrders),
      completedCount: currentOrders.length,
      showLabel: config.type === 'line' || config.totalDays <= 7 || index % labelStride === 0 || bucketEnd.getTime() === endDate.getTime(),
    })
    start = new Date(bucketEnd)
    start.setDate(start.getDate() + 1)
    index += 1
  }

  return buckets
}

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-gray-500 sm:text-sm">{label}</p>
          <p className={`mt-2 text-xl font-bold tracking-tight text-gray-900 sm:mt-3 sm:text-2xl ${value === 'Chưa có dữ liệu doanh thu' ? 'text-base sm:text-lg' : ''}`}>
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${tone}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
    </article>
  )
}

function RevenueChart({ buckets, hasRevenue, config }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [pinnedIndex, setPinnedIndex] = useState(null)
  const activeIndex = hoveredIndex ?? pinnedIndex
  const activeBucket = activeIndex === null ? null : buckets[activeIndex]
  const maximum = Math.max(...buckets.map((bucket) => bucket.revenue), 1)
  const average = buckets.reduce((total, bucket) => total + bucket.revenue, 0) / Math.max(buckets.length, 1)
  const highestIndex = buckets.reduce(
    (highest, bucket, index) => bucket.revenue > buckets[highest].revenue ? index : highest,
    0,
  )
  const setPinnedBucket = (index) => setPinnedIndex((current) => current === index ? null : index)
  const handlePointerLeave = () => setHoveredIndex(null)
  const unitLabel = config.unit === 'hour' ? 'mỗi khung giờ' : config.unit === 'week' ? 'mỗi tuần' : 'mỗi ngày'
  const barGapClass = buckets.length > 20 ? 'gap-0' : buckets.length > 8 ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-2'
  const chartHeight = 184
  const linePoints = buckets.map((bucket, index) => ({
    x: buckets.length === 1 ? 500 : 10 + (index / (buckets.length - 1)) * 980,
    y: 180 - (bucket.revenue / maximum) * 154,
  }))
  const linePath = linePoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = linePoints.length
    ? `${linePath} L ${linePoints[linePoints.length - 1].x} 180 L ${linePoints[0].x} 180 Z`
    : ''
  const averageY = 180 - (average / maximum) * 154
  const xTickCount = Math.min(6, buckets.length)
  const xTickIndexes = Array.from({ length: xTickCount }, (_, index) => (
    xTickCount === 1 ? 0 : Math.round((index * (buckets.length - 1)) / (xTickCount - 1))
  ))

  if (!hasRevenue) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
        <Activity className="h-8 w-8 text-gray-300" />
        <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có doanh thu trong kỳ này</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-2">
        <p className="min-h-5 text-xs leading-5 text-gray-700" aria-live="polite">
          {activeBucket && (
            <>
              <span className="font-semibold">{activeBucket.title}</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span>{formatVND(activeBucket.revenue)}</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span>{activeBucket.completedCount} đơn hoàn thành</span>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-gray-500" />
            Trung bình {unitLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Cao nhất
          </span>
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-2">
        <div className={`flex ${config.type === 'line' ? 'h-56' : 'h-[calc(14rem-28px)]'} flex-col justify-between pb-1 text-right text-[10px] text-gray-500`}>
          <span>{formatCompactVND(maximum)}</span>
          <span>{formatCompactVND(maximum / 2)}</span>
          <span>0 ₫</span>
        </div>
        <div className="min-w-0">
          {config.type === 'line' ? (
            <div className="min-w-0">
              <svg
                role="group"
                aria-label="Biểu đồ đường doanh thu thực nhận"
                viewBox={`0 0 1000 ${chartHeight}`}
                preserveAspectRatio="none"
                className="block h-56 w-full overflow-visible border-b border-gray-200"
              >
                <defs>
                  <linearGradient id="seller-revenue-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#056F1C" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#056F1C" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[12, 98, 184].map((y) => (
                  <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                ))}
                <path d={areaPath} fill="url(#seller-revenue-area)" />
                <line x1="0" x2="1000" y1={averageY} y2={averageY} stroke="#6b7280" strokeDasharray="5 5" strokeWidth="1.5" />
                <path d={linePath} fill="none" stroke="#056F1C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                {linePoints.map((point, index) => (
                  <circle
                    key={buckets[index].date.toISOString()}
                    cx={point.x}
                    cy={point.y}
                    r={index === highestIndex ? 7 : 5}
                    fill={index === highestIndex ? '#f59e0b' : '#056F1C'}
                    stroke="white"
                    strokeWidth="2"
                    role="button"
                    tabIndex={0}
                    aria-label={`${buckets[index].title}: doanh thu ${formatVND(buckets[index].revenue)}, ${buckets[index].completedCount} đơn hoàn thành`}
                    className="cursor-pointer focus-visible:outline-none"
                    onPointerEnter={() => setHoveredIndex(index)}
                    onPointerLeave={handlePointerLeave}
                    onFocus={() => setHoveredIndex(index)}
                    onBlur={() => setHoveredIndex(null)}
                    onClick={() => setPinnedBucket(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setPinnedBucket(index)
                      }
                    }}
                  />
                ))}
              </svg>
              <div className="relative mt-2 h-7 text-[9px] leading-3 text-gray-500">
                {xTickIndexes.map((index) => {
                  const position = buckets.length === 1 ? 50 : (index / (buckets.length - 1)) * 100
                  return (
                    <span
                      key={buckets[index].date.toISOString()}
                      className={`absolute whitespace-nowrap ${index === 0 ? 'left-0' : index === buckets.length - 1 ? 'right-0' : '-translate-x-1/2'}`}
                      style={index === 0 || index === buckets.length - 1 ? undefined : { left: `${position}%` }}
                    >
                      {buckets[index].label}
                    </span>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className={`relative flex h-56 min-w-0 items-end justify-center border-b border-gray-200 px-1 ${barGapClass}`}>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1 right-1 z-10 border-t border-dashed border-gray-500"
                style={{ bottom: `${32 + (average / maximum) * 192}px` }}
              />
              {buckets.map((bucket, index) => (
                <button
                  key={bucket.date.toISOString()}
                  type="button"
                  aria-label={`${bucket.title}: doanh thu ${formatVND(bucket.revenue)}, ${bucket.completedCount} đơn hoàn thành`}
                  aria-pressed={pinnedIndex === index}
                  onPointerEnter={() => setHoveredIndex(index)}
                  onPointerLeave={handlePointerLeave}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setPinnedBucket(index)}
                  className={`flex h-full min-w-0 flex-col justify-end rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] ${config.unit === 'hour' ? 'w-full max-w-[48px] flex-1' : 'flex-1'}`}
                >
                  <span className="flex h-[calc(100%-32px)] w-full items-end justify-center">
                    <span
                      className={`relative block w-1/2 rounded-t ${bucket.revenue ? (index === highestIndex ? 'bg-amber-500' : 'bg-[#056F1C]') : 'bg-gray-100'}`}
                      style={{ height: `${bucket.revenue ? Math.max(3, (bucket.revenue / maximum) * 100) : 1}%` }}
                    />
                  </span>
                  <span className="mt-2 h-6 w-full whitespace-nowrap text-center text-[9px] leading-3 text-gray-500">
                    {bucket.showLabel ? bucket.label : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="sr-only">
        Biểu đồ {config.type === 'line' ? 'đường' : 'cột'} doanh thu thực nhận; mỗi điểm hiển thị doanh thu VND và số đơn hoàn thành.
      </p>
    </>
  )
}

function DeadlineText({ deadline }) {
  const overdue = new Date(deadline) < new Date()
  return (
    <span className={overdue ? 'font-semibold text-red-700' : 'text-gray-500'}>
      {formatDeadline(deadline)}
    </span>
  )
}

function ActionRow({ label, description, count, to, deadlineOrders, disabled = false, icon: Icon = AlertTriangle }) {
  return (
    <Link
      to={to}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event) => {
        if (disabled) event.preventDefault()
      }}
      className={`flex items-start justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0 ${
        disabled ? 'pointer-events-none opacity-60' : 'group'
      }`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-gray-900 group-hover:text-[#056F1C]">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
          {deadlineOrders?.slice(0, 2).map((order) => (
            <span key={order.id} className="mt-1 block text-xs">
              <span className="text-gray-500">{order.id}: </span>
              <DeadlineText deadline={order.deadlineAt} />
            </span>
          ))}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 pt-1">
        <span className="text-sm font-bold text-gray-800">{count}</span>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#056F1C]" />
      </span>
    </Link>
  )
}

function StatusLabel({ status }) {
  const tone = status === 'completed'
    ? 'bg-green-50 text-green-800'
    : status === 'cancelled'
      ? 'bg-gray-100 text-gray-600'
      : status === 'pending_confirm'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-blue-50 text-blue-800'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function SellerDashboardPage() {
  const { user, isLoggedIn } = useAuth()
  const [period, setPeriod] = useState('30days')
  const [now] = useState(() => new Date())
  const [customStart, setCustomStart] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 29)
    return dateInputValue(date)
  })
  const [customEnd, setCustomEnd] = useState(() => dateInputValue(new Date()))
  const [appliedCustomRange, setAppliedCustomRange] = useState(() => ({
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 29)
      return dateInputValue(date)
    })(),
    end: dateInputValue(new Date()),
  }))
  const [dateError, setDateError] = useState('')

  const application = user?.role === 'user' ? getSellerApplication(user.id) : null
  const dashboardData = useMemo(
    () => getSellerDashboardMock(user?.id ?? 'preview', application?.slug ?? 'preview', now),
    [user?.id, application?.slug, now],
  )
  const localProducts = useMemo(() => getSellerProducts(user?.id), [user?.id])

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'pending') return <Navigate to="/seller/pending" replace />
  if (!['approved', 'suspended', 'banned'].includes(application.status)) return <Navigate to="/seller/onboarding" replace />

  const isReadOnly = application.status === 'suspended' || application.status === 'banned'
  const range = getPeriodRange(period, appliedCustomRange.start, appliedCustomRange.end, now)
  const periodOrders = range ? getChartOrders(dashboardData.orders, range) : []
  const revenue = sumRevenue(periodOrders)
  const hasRevenue = periodOrders.length > 0
  const chartConfig = range ? getChartConfig(period, range) : null
  const chartBuckets = range ? createChartBuckets(dashboardData.orders, range, chartConfig) : []
  const pendingOrders = dashboardData.orders.filter((order) => order.status === 'pending_confirm')
  const outOfStockProducts = localProducts.filter((product) => Number(product.stock) === 0)
  const draftProducts = localProducts.filter((product) => product.status === 'draft')
  const recentOrders = dashboardData.orders.slice(0, 5)
  const statusLabel = {
    approved: 'Đang hoạt động',
    suspended: 'Tạm khóa',
    banned: 'Đã khóa',
  }[application.status]
  const selectPeriod = (event) => {
    const nextPeriod = event.target.value
    setDateError('')
    if (nextPeriod === 'custom') {
      setPeriod(nextPeriod)
      return
    }
    setPeriod(nextPeriod)
  }

  const applyCustomRange = () => {
    const start = parseDateInput(customStart)
    const end = parseDateInput(customEnd)
    if (!start || !end) {
      setDateError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.')
      return
    }
    if (start > end) {
      setDateError('Ngày kết thúc không được trước ngày bắt đầu.')
      return
    }
    const selectedDays = Math.floor((startOfDay(end) - startOfDay(start)) / DAY_MS) + 1
    if (selectedDays > MAX_CUSTOM_DAYS) {
      setDateError('Khoảng ngày tùy chọn không được vượt quá 365 ngày.')
      return
    }
    setDateError('')
    setAppliedCustomRange({ start: customStart, end: customEnd })
    setPeriod('custom')
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Chào {application.shopName}</h1>
            <p className="text-sm text-gray-600">
              Trạng thái shop: <span className="font-semibold text-gray-800">{statusLabel}</span>
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-500">Tổng quan hoạt động của cửa hàng</p>
        </div>
        {!isReadOnly && (
          <Link to="/seller/products" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </Link>
        )}
      </header>

      {isReadOnly && (
        <p role="status" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          {application.status === 'suspended'
            ? 'Shop đang bị khóa tạm thời. Bạn có thể xem dữ liệu nhưng chưa thể thực hiện thao tác ghi.'
            : 'Shop đã bị khóa vĩnh viễn. Bạn chỉ có thể xem dữ liệu trong kênh người bán.'}
        </p>
      )}

      <section aria-label="Bộ lọc kỳ báo cáo" className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <label htmlFor="seller-report-period" className="block text-sm font-semibold text-gray-800">Kỳ báo cáo</label>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Khoảng ngày đang áp dụng: <span className="font-semibold text-gray-700">{range ? formatDateRange(range) : 'Chưa hợp lệ'}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              id="seller-report-period"
              value={period}
              onChange={selectPeriod}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 sm:w-auto sm:min-w-52"
            >
              {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p className="text-xs leading-5 text-gray-500">Múi giờ: Việt Nam (UTC+7)</p>
          </div>
        </div>
        {period === 'custom' && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
            <div>
              <label htmlFor="seller-period-start" className="mb-1.5 block text-xs font-medium text-gray-600">Từ ngày</label>
              <input
                id="seller-period-start"
                type="date"
                value={customStart}
                min={dateOffsetValue(customEnd, -(MAX_CUSTOM_DAYS - 1))}
                max={customEnd}
                onChange={(event) => setCustomStart(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              />
            </div>
            <div>
              <label htmlFor="seller-period-end" className="mb-1.5 block text-xs font-medium text-gray-600">Đến ngày</label>
              <input
                id="seller-period-end"
                type="date"
                value={customEnd}
                min={customStart}
                max={dateOffsetValue(customStart, MAX_CUSTOM_DAYS - 1)}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              />
            </div>
            <button type="button" onClick={applyCustomRange} className="h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
              Áp dụng kỳ
            </button>
            <p className="w-full text-xs leading-5 text-gray-500">Chọn tối đa 365 ngày, tính cả ngày bắt đầu và ngày kết thúc.</p>
            {dateError && <p role="alert" className="w-full text-sm text-red-700">{dateError}</p>}
          </div>
        )}
      </section>

      <section aria-label="Chỉ số theo kỳ báo cáo" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryCard
          label="Doanh thu thực về shop"
          value={hasRevenue ? formatVND(revenue) : 'Chưa có dữ liệu doanh thu'}
          detail={hasRevenue ? `${periodOrders.length} đơn hoàn thành trong kỳ` : 'Không có đơn hoàn thành trong kỳ'}
          icon={Activity}
          tone="bg-violet-50 text-violet-700"
        />
        <SummaryCard
          label="Đơn hoàn thành"
          value={periodOrders.length}
          detail="Đơn thường hoàn thành trong kỳ"
          icon={ClipboardList}
          tone="bg-blue-50 text-blue-700"
        />
      </section>

      <section aria-label="Biểu đồ doanh thu trong kỳ" className="mt-5">
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">Doanh thu thực về ví</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">Tiền hàng sau hoa hồng, chỉ tính đơn hoàn thành.</p>
            </div>
          </div>
          <div className="mt-4">
            {chartConfig && (
              <RevenueChart
                key={`${period}-${range.start.toISOString()}-${range.end.toISOString()}`}
                buckets={chartBuckets}
                hasRevenue={hasRevenue}
                config={chartConfig}
              />
            )}
          </div>
        </article>
      </section>

      <section aria-label="Chỉ số hiện tại của cửa hàng" className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-900">Tình hình hiện tại</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryCard
          label="Đơn cần xử lý"
          value={pendingOrders.length}
          detail="Đơn chờ xác nhận"
          icon={AlertTriangle}
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryCard
          label="Số dư ví shop"
          value={formatVND(dashboardData.wallet.availableBalance)}
          detail={`Escrow chưa hoàn tất: ${formatVND(dashboardData.wallet.escrow)}`}
          icon={Wallet}
          tone="bg-green-50 text-[#056F1C]"
        />
          </div>
        </div>

        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-bold text-gray-900">Việc cần làm</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">Số lượng theo trạng thái hiện tại của đơn hàng và sản phẩm.</p>
            </div>
          </div>
          <div className="mt-1">
            <ActionRow
              label="Chờ xác nhận"
              description="Xác nhận và bắt đầu giao trong vòng 48 giờ."
              count={pendingOrders.length}
              to="/seller/orders?status=pending_confirm"
              deadlineOrders={pendingOrders}
              disabled={isReadOnly}
              icon={ClipboardList}
            />
            <ActionRow
              label="Sản phẩm hết hàng"
              description="Chỉ đếm sản phẩm có tồn kho bằng 0."
              count={outOfStockProducts.length}
              to="/seller/products?stock=out"
              disabled={isReadOnly}
              icon={Package}
            />
            {draftProducts.length > 0 && (
              <ActionRow
                label="Sản phẩm nháp cần hoàn thiện"
                description="Sản phẩm đang lưu nháp, chưa đăng bán."
                count={draftProducts.length}
                to="/seller/products?status=draft"
                disabled={isReadOnly}
                icon={Package}
              />
            )}
          </div>
          <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-500">
            Đơn quá hạn được hệ thống xử lý theo quy tắc; seller không có thao tác hủy đơn thường.
          </p>
        </article>
      </section>

      <section className="mt-5 grid items-start gap-5 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-bold text-gray-900">Đơn gần đây</h2>
              <p className="mt-1 text-xs text-gray-500">Tối đa 5 đơn gần nhất.</p>
            </div>
            <Link to="/seller/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#056F1C] hover:underline">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">Mã đơn / ngày</th>
                      <th scope="col" className="px-3 py-3 font-medium">Trạng thái</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Tiền hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        </td>
                        <td className="px-3 py-3"><StatusLabel status={order.status} /></td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-800">{formatVND(order.itemTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-gray-100 px-4 md:hidden">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{order.id}</p>
                      <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      <div className="mt-2"><StatusLabel status={order.status} /></div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-800">{formatVND(order.itemTotal)}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-gray-500">Chưa có đơn hàng.</p>
          )}
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-bold text-gray-900">Sản phẩm bán chạy</h2>
              <p className="mt-1 text-xs text-gray-500">Tính từ số lượng trong đơn hoàn thành.</p>
            </div>
            <Link to="/seller/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#056F1C] hover:underline">
              Quản lý sản phẩm <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {dashboardData.products.some((product) => product.quantitySold > 0) ? (
            <ul className="divide-y divide-gray-100 px-4 sm:px-5">
              {dashboardData.products.filter((product) => product.quantitySold > 0).slice(0, 5).map((product, index) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-[#056F1C]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-900">{product.name}</span>
                    <span className="mt-1 block text-xs text-gray-500">Tồn kho: {product.stock}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-gray-900">{product.quantitySold}</span>
                    <span className="text-xs text-gray-500">đã bán</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <Package className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có dữ liệu bán</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">Sản phẩm bán chạy chỉ xuất hiện khi có đơn hoàn thành.</p>
            </div>
          )}
        </article>
      </section>

    </div>
  )
}
