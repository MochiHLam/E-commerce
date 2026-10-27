import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Gavel,
  ShieldAlert,
  Store,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSellerApplications } from '@/mocks/seller'

const PERIOD_OPTIONS = [
  ['7-days', '7 ngày'],
  ['30-days', '30 ngày'],
  ['this-month', 'Tháng này'],
  ['last-month', 'Tháng trước'],
  ['custom', 'Tùy chỉnh'],
]

const ORDER_STATUSES = [
  ['pending_confirm', 'Chờ xác nhận'],
  ['confirmed', 'Đã xác nhận'],
  ['shipping', 'Đang giao'],
  ['completed', 'Hoàn thành'],
  ['cancelled', 'Đã hủy'],
]

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function getLocalDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPresetRange(period, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (period === 'this-month') {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today }
  }

  if (period === 'last-month') {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    }
  }

  const dayCount = period === '7-days' ? 7 : 30
  const start = new Date(today)
  start.setDate(start.getDate() - dayCount + 1)
  return { start, end: today }
}

function isDateWithinRange(value, range) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const start = new Date(range.start)
  start.setHours(0, 0, 0, 0)
  const end = new Date(range.end)
  end.setHours(23, 59, 59, 999)
  return date >= start && date <= end
}

function formatRange(range) {
  return `${DATE_FORMATTER.format(range.start)} – ${DATE_FORMATTER.format(range.end)}`
}

function EmptyState({ title, detail, icon: Icon = Activity, linkTo, linkLabel }) {
  return (
    <div role="status" className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center sm:px-6">
      <Icon className="mx-auto h-5 w-5 text-gray-400" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold text-gray-800">{title}</p>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-500">{detail}</p>
      {linkTo && (
        <Link to={linkTo} className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone, to }) {
  const isUnavailable = String(value).includes('—')
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-3 font-bold tracking-tight ${isUnavailable ? 'text-2xl text-gray-400' : 'text-3xl text-gray-900'}`}>
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {to && (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#056F1C]">
          Mở chi tiết <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </>
  )

  return to
    ? (
      <Link to={to} className="block min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] transition-colors hover:border-green-200 hover:bg-green-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
        {content}
      </Link>
    )
    : <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02]">{content}</article>
}

function QueueLink({ label, detail, count, priority, icon: Icon, to, tone, available = true }) {
  return (
    <Link
      to={to}
      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-green-200 hover:bg-green-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-gray-900">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-gray-500">{detail}</span>
          <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            {priority}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-bold text-gray-800">{available ? count : '—'}</span>
        <ArrowRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </span>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const applications = getSellerApplications()
  const [selectedPeriod, setSelectedPeriod] = useState('30-days')
  const [dateRange, setDateRange] = useState(() => getPresetRange('30-days'))
  const [draftStart, setDraftStart] = useState(() => getLocalDateValue(dateRange.start))
  const [draftEnd, setDraftEnd] = useState(() => getLocalDateValue(dateRange.end))
  const [rangeError, setRangeError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  const applicationsInPeriod = applications.filter((application) => (
    isDateWithinRange(application.createdAt ?? application.submittedAt, dateRange)
  ))
  const pendingApplications = applications.filter((application) => application.status === 'pending')
  const pendingInformationUpdates = applications.filter((application) => application.pendingInformationUpdate)
  const dateRangeLabel = formatRange(dateRange)

  function handlePeriodChange(event) {
    const nextPeriod = event.target.value
    setSelectedPeriod(nextPeriod)
    setRangeError('')

    if (nextPeriod === 'custom') return

    const nextRange = getPresetRange(nextPeriod)
    setDateRange(nextRange)
    setDraftStart(getLocalDateValue(nextRange.start))
    setDraftEnd(getLocalDateValue(nextRange.end))
    setUpdatedAt(new Date())
  }

  function applyCustomRange(event) {
    event.preventDefault()
    if (!draftStart || !draftEnd) {
      setRangeError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.')
      return
    }

    const start = new Date(`${draftStart}T00:00:00`)
    const end = new Date(`${draftEnd}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      setRangeError('Ngày kết thúc không được trước ngày bắt đầu.')
      return
    }

    setDateRange({ start, end })
    setSelectedPeriod('custom')
    setRangeError('')
    setUpdatedAt(new Date())
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Tổng quan hệ thống</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Sức khỏe vận hành NaviShop và các công việc cần ưu tiên.</p>
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Cập nhật lần cuối: <time dateTime={updatedAt.toISOString()}>{DATE_TIME_FORMATTER.format(updatedAt)}</time>
        </p>
      </header>

      <section aria-label="Bộ lọc thời gian" className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:flex sm:items-end sm:justify-between sm:gap-5">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="admin-dashboard-period" className="mb-1.5 block text-sm font-semibold text-gray-800">Kỳ báo cáo</label>
          <select
            id="admin-dashboard-period"
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/20"
          >
            {PERIOD_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {selectedPeriod === 'custom' && (
          <form noValidate onSubmit={applyCustomRange} className="mt-3 grid w-full gap-3 sm:mt-0 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="admin-dashboard-start" className="mb-1.5 block text-xs font-medium text-gray-600">Từ ngày</label>
              <input
                id="admin-dashboard-start"
                type="date"
                value={draftStart}
                onChange={(event) => setDraftStart(event.target.value)}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? 'admin-dashboard-range-error' : undefined}
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/20"
              />
            </div>
            <div>
              <label htmlFor="admin-dashboard-end" className="mb-1.5 block text-xs font-medium text-gray-600">Đến ngày</label>
              <input
                id="admin-dashboard-end"
                type="date"
                value={draftEnd}
                onChange={(event) => setDraftEnd(event.target.value)}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? 'admin-dashboard-range-error' : undefined}
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/20"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2 active:bg-green-900"
            >
              Áp dụng kỳ
            </button>
            {rangeError && <p id="admin-dashboard-range-error" role="alert" className="text-sm text-red-700 sm:col-span-3">{rangeError}</p>}
          </form>
        )}
        <p className="mt-3 shrink-0 text-xs text-gray-500 sm:mt-0">
          Đang xem: <span className="font-semibold text-gray-700">{dateRangeLabel}</span>
        </p>
      </section>

      <section aria-label="Chỉ số theo kỳ" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Hoa hồng + phí đăng ký đấu giá"
          value="—"
          detail="Chưa có platform LedgerEntry theo kỳ"
          icon={CircleDollarSign}
          tone="bg-violet-50 text-violet-700"
          to="/admin/finance"
        />
        <MetricCard
          label="Đơn hoàn thành / tổng đơn"
          value="— / —"
          detail="Chưa có Order toàn sàn trong kỳ"
          icon={Activity}
          tone="bg-blue-50 text-blue-700"
        />
        <MetricCard
          label="Hồ sơ đăng ký tạo mới"
          value={applicationsInPeriod.length}
          detail="Hồ sơ được tạo trong kỳ; không đồng nghĩa shop đã duyệt"
          icon={Store}
          tone="bg-green-50 text-[#056F1C]"
        />
        <MetricCard
          label="Tỷ lệ case report / đơn"
          value="—"
          detail="Số ReportCase ÷ tổng Order trong kỳ"
          icon={ShieldAlert}
          tone="bg-red-50 text-red-700"
        />
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div>
            <h2 className="font-bold text-gray-900">Doanh thu sàn theo thời gian</h2>
            <p className="mt-1 text-sm leading-5 text-gray-500">Kỳ {dateRangeLabel}. Các loại thu được tách riêng khi có ledger.</p>
          </div>
          <div aria-label="Chú giải doanh thu" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-700" />Hoa hồng đơn thường</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-600" />Hoa hồng đơn đấu giá</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Phí đăng ký đấu giá</span>
          </div>
          <EmptyState
            title="Chưa có dữ liệu doanh thu theo ngày"
            detail="Cần platform LedgerEntry có thời điểm ghi nhận và loại giao dịch. Biểu đồ sẽ xuất hiện sau khi có nguồn đối soát; hiện không vẽ cột 0 giả."
            icon={CircleDollarSign}
            linkTo="/admin/finance"
            linkLabel="Mở trang đối soát"
          />
        </article>

        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div>
            <h2 className="font-bold text-gray-900">Hàng đợi cần xử lý</h2>
            <p className="mt-1 text-sm leading-5 text-gray-500">Snapshot hiện tại, không bị ảnh hưởng bởi kỳ báo cáo.</p>
          </div>
          <div className="mt-4 space-y-3">
            <QueueLink
              label="Hồ sơ shop chờ duyệt"
              detail="Đang chờ quyết định admin"
              count={pendingApplications.length}
              priority={pendingApplications.length ? 'Ưu tiên cao' : 'Không có hồ sơ chờ'}
              icon={Store}
              to="/admin/shops"
              tone="bg-amber-50 text-amber-700"
            />
            <QueueLink
              label="Yêu cầu cập nhật shop"
              detail="Chờ admin xem xét thay đổi hồ sơ"
              count={pendingInformationUpdates.length}
              priority={pendingInformationUpdates.length ? 'Cần xem xét' : 'Không có yêu cầu chờ'}
              icon={ClipboardCheck}
              to="/admin/shops"
              tone="bg-blue-50 text-blue-700"
            />
            <QueueLink
              label="Case đã chuyển admin"
              detail="Không có nguồn ReportCase mock"
              count="—"
              available={false}
              priority="Chưa xác định"
              icon={ShieldAlert}
              to="/admin/moderation/escalated"
              tone="bg-red-50 text-red-700"
            />
            <QueueLink
              label="Vật phẩm đấu giá chờ duyệt"
              detail="Không có hàng đợi đấu giá mock"
              count="—"
              available={false}
              priority="Chưa xác định"
              icon={Gavel}
              to="/admin/auctions/items"
              tone="bg-violet-50 text-violet-700"
            />
          </div>
        </article>
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <h2 className="font-bold text-gray-900">Đơn hàng theo trạng thái</h2>
          <p className="mt-1 text-sm leading-5 text-gray-500">Kỳ {dateRangeLabel}; trạng thái được thống kê từ Order toàn sàn.</p>
          <EmptyState
            title="Chưa có dữ liệu trạng thái đơn"
            detail={`Các nhóm sẽ gồm: ${ORDER_STATUSES.map(([, label]) => label).join(', ')}. Hiện chưa có nguồn Order để tính số lượng.`}
          />
        </article>

        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">Hoạt động quản trị gần đây</h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">Actor, hành động và thời điểm lấy từ audit log.</p>
            </div>
            <Activity className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
          </div>
          <EmptyState
            title="Chưa có dữ liệu audit trên dashboard"
            detail="Nhật ký chưa có service để truy xuất hoạt động gần đây."
            linkTo="/admin/audit-log"
            linkLabel="Mở nhật ký hoạt động"
          />
        </article>
      </section>

      <p className="mt-4 inline-flex items-center gap-1.5 text-xs leading-5 text-gray-500">
        <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
        Hồ sơ đăng ký dùng thời điểm tạo hồ sơ; hàng đợi là số liệu hiện tại. Dữ liệu Order, LedgerEntry, ReportCase và audit chưa được nối vào dashboard.
      </p>
    </div>
  )
}
