import { useState } from 'react'
import { Store, Trash2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/mocks/categories'
import { getSellerApplication, getSellerShopOrderCount, requestSellerShopDeletion } from '@/mocks/seller'
import { getCheckoutMockOrders, MOCK_ORDERS } from '@/mocks/account/orders'

const STATUS_LABELS = {
  approved: 'Đang hoạt động',
  suspended: 'Tạm khóa',
  banned: 'Đã khóa',
  pending_deletion: 'Chờ duyệt xóa',
  deleted: 'Đã xóa',
}

const STATUS_STYLES = {
  approved: 'border-green-200 bg-green-50 text-green-800',
  suspended: 'border-amber-200 bg-amber-50 text-amber-900',
  banned: 'border-red-200 bg-red-50 text-red-800',
  pending_deletion: 'border-amber-200 bg-amber-50 text-amber-900',
  deleted: 'border-gray-200 bg-gray-100 text-gray-700',
}

function maskIdentityNumber(value) {
  if (!value) return '—'
  const visibleDigits = value.slice(-4)
  return `${'•'.repeat(Math.max(0, value.length - visibleDigits.length))}${visibleDigits}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
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
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false)
  const [deletionError, setDeletionError] = useState('')
  const [deletionNotice, setDeletionNotice] = useState('')

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  const application = getSellerApplication(user.id)
  if (!application) return <Navigate to="/seller/onboarding" replace />

  const category = CATEGORIES.find((item) => String(item.id) === String(application.categoryId))?.name
  const isReadOnly = application.status !== 'approved'

  function openDeletionConfirmation() {
    setDeletionError('')
    setDeletionNotice('')
    try {
      const orders = [...getCheckoutMockOrders(), ...MOCK_ORDERS]
      const orderCount = getSellerShopOrderCount(user.id, orders)
      if (orderCount > 0) {
        setDeletionError(`Không thể yêu cầu xóa Shop vì đang có ${orderCount} đơn hàng ở các trạng thái khác nhau.`)
        return
      }
      setIsDeletionDialogOpen(true)
    } catch (error) {
      setDeletionError(error instanceof Error ? error.message : 'Không thể kiểm tra đơn hàng của Shop.')
    }
  }

  function confirmDeletionRequest() {
    try {
      requestSellerShopDeletion(user.id, [...getCheckoutMockOrders(), ...MOCK_ORDERS])
      setIsDeletionDialogOpen(false)
      setDeletionNotice('Yêu cầu đã được gửi. Shop và sản phẩm sẽ bị ẩn trong thời gian chờ Admin duyệt.')
    } catch (error) {
      setDeletionError(error instanceof Error ? error.message : 'Không thể gửi yêu cầu xóa Shop.')
      setIsDeletionDialogOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thông tin cửa hàng</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Thông tin cửa hàng hiện tại. Bạn có thể cập nhật trực tiếp bất cứ lúc nào.</p>
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
          <div className="flex flex-wrap gap-2">
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/seller/information/edit')}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
                >
                  Thay đổi thông tin
                </button>
                <button type="button" onClick={openDeletionConfirmation} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">
                  <Trash2 size={16} /> Xóa Shop
                </button>
              </>
            )}
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
          <InformationItem label="Người đại diện" value={application.contactName} />
          <InformationItem label="Email đăng nhập" value={application.email || user.email} />
          <InformationItem label="Số điện thoại" value={application.phone} />
          <InformationItem label="Danh mục chính" value={category} />
          <InformationItem label="Địa chỉ lấy hàng" value={application.pickupAddress} fullWidth />
          <InformationItem label="Mô tả cửa hàng" value={application.description} fullWidth />
          <InformationItem label="Số CCCD" value={maskIdentityNumber(application.identityNumber)} />
          <InformationItem label="Mã số thuế" value={application.taxCode} />
          <InformationItem label="Ngày gửi hồ sơ" value={formatDate(application.submittedAt)} />
        </dl>
      </section>

      {application.deletionRequest && (
        <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Yêu cầu xóa Shop: {application.deletionRequest.status === 'pending' ? 'Đang chờ Admin duyệt' : application.deletionRequest.status === 'approved' ? 'Đã được duyệt' : 'Đã bị từ chối'}</p>
          <p>Gửi lúc {formatDate(application.deletionRequest.submittedAt)}.</p>
          {application.deletionRequest.rejectionReason && <p className="mt-1 text-red-800">Lý do từ chối: {application.deletionRequest.rejectionReason}</p>}
        </section>
      )}
      {deletionError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{deletionError}</p>}
      {deletionNotice && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{deletionNotice}</p>}

      <p className="mt-4 text-xs leading-5 text-gray-500">
        {isReadOnly
          ? 'Shop đang ở chế độ chỉ xem; không thể thay đổi thông tin.'
          : 'Các thay đổi sẽ được áp dụng trực tiếp cho thông tin cửa hàng.'}
      </p>
      {isDeletionDialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-gray-950/45 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsDeletionDialogOpen(false)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="seller-delete-shop-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <h2 id="seller-delete-shop-title" className="text-lg font-bold text-gray-950">Xác nhận yêu cầu xóa Shop</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Gửi yêu cầu xóa <strong>{application.shopName}</strong>? Shop và toàn bộ sản phẩm sẽ bị ẩn ngay trong thời gian Admin xem xét. Dữ liệu lịch sử được giữ lại.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsDeletionDialogOpen(false)} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">Hủy</button>
              <button type="button" onClick={confirmDeletionRequest} className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800">Gửi yêu cầu xóa</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
