import { Store } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/mocks/categories'
import { getSellerApplication, getSellerInformationChangeAvailableAt } from '@/mocks/seller'

const STATUS_LABELS = {
  approved: 'Đang hoạt động',
  suspended: 'Tạm khóa',
  banned: 'Đã khóa',
}

const STATUS_STYLES = {
  approved: 'border-green-200 bg-green-50 text-green-800',
  suspended: 'border-amber-200 bg-amber-50 text-amber-900',
  banned: 'border-red-200 bg-red-50 text-red-800',
}

function formatSubmittedAt(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

function maskIdentityNumber(value) {
  if (!value) return '—'
  const visibleDigits = value.slice(-4)
  return `${'•'.repeat(Math.max(0, value.length - visibleDigits.length))}${visibleDigits}`
}

function InformationItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-medium leading-6 text-gray-900">{value || '—'}</dd>
    </div>
  )
}

export default function SellerInformationPage() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  const application = getSellerApplication(user.id)
  if (!application) return <Navigate to="/seller/onboarding" replace />

  const category = CATEGORIES.find((item) => String(item.id) === String(application.categoryId))?.name
  const informationChangeAvailableAt = getSellerInformationChangeAvailableAt(application)
  const isInformationChangeLocked = Boolean(
    informationChangeAvailableAt && Date.now() < informationChangeAvailableAt.getTime(),
  )
  const isReadOnly = application.status !== 'approved'

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thông tin cửa hàng</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Thông tin shop đã gửi trong hồ sơ đăng ký người bán.</p>
        </div>
        <span className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[application.status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          {STATUS_LABELS[application.status] || 'Đang xét duyệt'}
        </span>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900">{application.shopName}</h2>
              <p className="mt-1 text-sm text-gray-500">{category || 'Chưa phân loại'}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={Boolean(application.pendingInformationUpdate || isInformationChangeLocked || isReadOnly)}
            onClick={() => navigate('/seller/information/edit')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100"
          >
            Thay đổi thông tin
          </button>
        </div>

        {application.pendingInformationUpdate && (
          <div role="status" className="border-b border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900 sm:px-6">
            Yêu cầu thay đổi thông tin gửi lúc {formatSubmittedAt(application.pendingInformationUpdate.submittedAt)} đang chờ admin duyệt.
            Shop vẫn hoạt động bình thường với thông tin hiện tại trong thời gian chờ.
          </div>
        )}
        {!application.pendingInformationUpdate && application.informationUpdateReviewNote && (
          <div className="border-b border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600 sm:px-6">
            Phản hồi gần nhất từ admin: {application.informationUpdateReviewNote}
          </div>
        )}

        <dl className="grid gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
          <InformationItem label="Người đại diện" value={application.contactName} />
          <InformationItem label="Email đăng nhập" value={application.email || user.email} />
          <InformationItem label="Số điện thoại" value={application.phone} />
          <InformationItem label="Danh mục chính" value={category} />
          <InformationItem label="Địa chỉ lấy hàng" value={application.pickupAddress} fullWidth />
          <InformationItem label="Mô tả cửa hàng" value={application.description} fullWidth />
          <InformationItem label="Số CCCD" value={maskIdentityNumber(application.identityNumber)} />
          <InformationItem label="Mã số thuế" value={application.taxCode} />
          <InformationItem label="Ngày gửi hồ sơ" value={formatSubmittedAt(application.submittedAt)} />
        </dl>
      </section>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        {application.pendingInformationUpdate
          ? 'Bạn chỉ có thể gửi một yêu cầu cập nhật tại một thời điểm.'
          : isReadOnly
            ? 'Shop đang ở chế độ chỉ xem; không thể gửi thay đổi thông tin.'
            : isInformationChangeLocked
              ? `Bạn có thể gửi yêu cầu thay đổi tiếp theo từ ngày ${informationChangeAvailableAt.toLocaleDateString('vi-VN')}.`
              : 'Thông tin thay đổi sẽ được áp dụng sau khi admin duyệt. Shop vẫn hoạt động bình thường trong thời gian chờ.'}
      </p>
    </div>
  )
}
