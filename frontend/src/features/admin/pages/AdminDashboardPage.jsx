import {
  ArrowRight,
  FileCheck2,
  Gavel,
  History,
  MessageSquareWarning,
  Store,
  Trash2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdminCatalogShops } from '@/mocks/adminCatalog'
import { getAdminUserDirectory } from '@/mocks/adminUsers'
import { getAdminModerationAudit, getAdminReportCases } from '@/mocks/adminModeration'
import { getSellerApplications, getSellerShopAudit } from '@/mocks/seller'

function SummaryCard({ label, value, detail, to, icon: Icon }) {
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-500">{label}</span>
        <span className="mt-3 block text-2xl font-bold tracking-tight text-gray-900">{value}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">{detail}</span>
        {to && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#056F1C]">
            Mở mục quản lý <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </>
  )
  const className = `flex min-h-32 items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] ${to ? 'transition-colors hover:border-green-200 hover:bg-green-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]' : ''}`

  return to
    ? <Link to={to} className={className}>{content}</Link>
    : <article className={className}>{content}</article>
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

function getAuditTimestamp(entry) {
  return entry.occurredAt ?? entry.changedAt ?? entry.createdAt ?? null
}

function UnavailablePanel({ title, description }) {
  return (
    <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-5 sm:p-6">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
      <p className="mt-3 text-xs font-semibold text-gray-500">Chưa có dữ liệu toàn sàn</p>
    </section>
  )
}

export default function AdminDashboardPage() {
  const applications = getSellerApplications()
  const reportCases = getAdminReportCases()
  const shops = getAdminCatalogShops()
  const users = getAdminUserDirectory(null)
  const shopAudit = getSellerShopAudit()
  const moderationAudit = getAdminModerationAudit()

  const applicationBySlug = new Map(applications.map((application) => [application.slug, application]))
  const activeShopCount = shops.filter((shop) => (
    (applicationBySlug.get(shop.slug)?.status ?? shop.status) === 'approved'
  )).length
  const userCount = users.filter((user) => user.role === 'user').length
  const pendingApplications = applications.filter((application) => application.status === 'pending').length
  const openReportCases = reportCases.filter((reportCase) => reportCase.status === 'open').length
  const pendingDeletions = applications.filter((application) => (
    application.deletionRequest?.status === 'pending'
  )).length
  const pendingAppeals = applications.filter((application) => (
    application.appeal?.status === 'pending'
  )).length

  const recentActivity = [
    ...shopAudit.map((entry) => ({
      id: entry.id,
      actor: entry.actorId || 'Không rõ',
      action: entry.action,
      target: entry.shopName || entry.shopId,
      reason: entry.reason,
      timestamp: getAuditTimestamp(entry),
      to: '/admin/shops',
    })),
    ...moderationAudit.map((entry) => ({
      id: entry.id,
      actor: entry.actor || 'Không rõ',
      action: entry.action,
      target: entry.caseId,
      reason: entry.note,
      timestamp: getAuditTimestamp(entry),
      to: `/admin/moderation?caseId=${encodeURIComponent(entry.caseId)}`,
    })),
  ]
    .sort((left, right) => new Date(right.timestamp ?? 0) - new Date(left.timestamp ?? 0))
    .slice(0, 5)

  const queueCards = [
    {
      label: 'Hồ sơ Shop chờ duyệt',
      value: pendingApplications,
      detail: 'Hồ sơ đăng ký cần xem xét',
      to: '/admin/seller-applications',
      icon: Store,
    },
    {
      label: 'Report đang mở',
      value: openReportCases,
      detail: 'Case chờ kết luận',
      to: '/admin/moderation',
      icon: MessageSquareWarning,
    },
    {
      label: 'Yêu cầu xóa Shop',
      value: pendingDeletions,
      detail: 'Chờ Admin phê duyệt hoặc từ chối',
      to: '/admin/shops',
      icon: Trash2,
    },
    {
      label: 'Khiếu nại Seller',
      value: pendingAppeals,
      detail: 'Chờ Admin xem xét',
      to: '/admin/shops',
      icon: FileCheck2,
    },
    {
      label: 'Vật phẩm đấu giá',
      value: '—',
      detail: 'Chưa có nguồn hàng đợi đấu giá tích hợp',
      to: '/admin/auctions/items',
      icon: Gavel,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Tổng quan hệ thống</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Chỉ số hiện có, hàng đợi cần xử lý và hoạt động quản trị gần đây.</p>
      </header>

      <section aria-label="Chỉ số toàn sàn" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Shop đang hoạt động"
          value={activeShopCount}
          detail="Theo danh mục Shop mock hiện có"
          to="/admin/shops"
          icon={Store}
        />
        <SummaryCard
          label="Tài khoản người dùng mẫu"
          value={userCount}
          detail="Danh sách tài khoản demo; không đại diện số user toàn sàn"
          to="/admin/users"
          icon={Users}
        />
        <SummaryCard
          label="Đơn hàng toàn sàn"
          value="—"
          detail="Chưa có nguồn đơn hàng tổng hợp toàn sàn"
          icon={FileCheck2}
        />
        <SummaryCard
          label="Doanh thu sàn"
          value="—"
          detail="Chưa có LedgerEntry toàn sàn để đối soát"
          to="/admin/finance"
          icon={History}
        />
      </section>

      <section aria-labelledby="admin-dashboard-queue-title" className="mt-7">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="admin-dashboard-queue-title" className="text-lg font-bold text-gray-900">Hàng đợi cần xử lý</h2>
            <p className="mt-1 text-sm text-gray-500">Số lượng hiện tại, không phụ thuộc kỳ báo cáo.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {queueCards.map((card) => <SummaryCard key={card.label} {...card} />)}
        </div>
      </section>

      <section aria-labelledby="admin-dashboard-platform-title" className="mt-7">
        <div className="mb-3">
          <h2 id="admin-dashboard-platform-title" className="text-lg font-bold text-gray-900">Hoạt động của sàn</h2>
          <p className="mt-1 text-sm text-gray-500">Biểu đồ sẽ xuất hiện khi có nguồn dữ liệu toàn sàn đáng tin cậy.</p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          <UnavailablePanel
            title="Doanh thu theo thời gian"
            description="Chưa có dữ liệu LedgerEntry toàn sàn để tách hoa hồng đơn thường, đơn đấu giá và phí đăng ký đấu giá."
          />
          <UnavailablePanel
            title="Phân bố trạng thái đơn hàng"
            description="Chưa có tập hợp Order toàn sàn; không hiển thị biểu đồ 0 hoặc lấy mẫu đơn của một Seller để thay thế."
          />
        </div>
      </section>

      <section aria-labelledby="admin-dashboard-activity-title" className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="admin-dashboard-activity-title" className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
            <p className="mt-1 text-sm text-gray-500">Tóm tắt các bản ghi Shop và Report đang có trong mock audit.</p>
          </div>
          <Link to="/admin/audit-log" className="inline-flex items-center gap-1 text-sm font-semibold text-[#056F1C] hover:underline">
            Mở nhật ký <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Chưa có sự kiện audit trong dữ liệu hiện tại.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="py-3 first:pt-0 last:pb-0">
                <Link to={entry.to} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{entry.action} · {entry.target}</p>
                    <time className="text-xs text-gray-500">{formatDate(entry.timestamp)}</time>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Người thực hiện: {entry.actor}</p>
                  {entry.reason && <p className="mt-1 line-clamp-1 text-xs text-gray-600">{entry.reason}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
