import { BadgeCheck, Clock3, LogOut, Store, XCircle } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/mocks/categories'
import { getSellerApplication } from '@/mocks/seller'

export default function SellerPendingPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const application = user?.role === 'user' ? getSellerApplication(user.id) : null

  if (isLoggedIn && user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'draft') return <Navigate to="/seller/onboarding" replace />
  if (['approved', 'suspended', 'banned'].includes(application.status)) return <Navigate to="/seller/dashboard" replace />
  if (!['pending', 'rejected'].includes(application.status)) return <Navigate to="/seller/onboarding" replace />

  const isRejected = application.status === 'rejected'

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-14">
      <section className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          isRejected ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isRejected ? <XCircle className="h-7 w-7" /> : <Clock3 className="h-7 w-7" />}
        </span>
        <p className={`mt-5 text-center text-sm font-semibold ${isRejected ? 'text-red-700' : 'text-amber-700'}`}>
          {isRejected ? 'HỒ SƠ CẦN ĐƯỢC CẬP NHẬT' : 'HỒ SƠ ĐANG CHỜ DUYỆT'}
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold text-gray-900">{application.shopName || 'Hồ sơ cửa hàng'}</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-gray-600">
          {isRejected
            ? 'Hồ sơ chưa được duyệt. Xem lý do bên dưới, cập nhật thông tin cần thiết rồi gửi lại để được xét duyệt.'
            : 'NaviShop đã nhận hồ sơ đăng ký. Bạn có thể xem lại thông tin bên dưới trong thời gian chờ xét duyệt.'}
        </p>
        {isRejected && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Lý do từ chối</p>
            <p className="mt-1 whitespace-pre-wrap">{application.reviewNote || 'Vui lòng cập nhật hồ sơ theo yêu cầu xét duyệt.'}</p>
          </div>
        )}
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-600 sm:p-5">
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <Store className="h-4 w-4 text-[#056F1C]" /> Thông tin hồ sơ
          </p>
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Tên cửa hàng</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.shopName || '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Đường dẫn</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.slug ? `navishop.vn/${application.slug}` : '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Danh mục chính</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{CATEGORIES.find((category) => String(category.id) === String(application.categoryId))?.name ?? '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Ngày gửi</dt><dd className="mt-0.5 font-medium text-gray-900">{application.submittedAt ? new Date(application.submittedAt).toLocaleString('vi-VN') : '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Người đại diện</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.contactName || '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Số điện thoại</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.phone || '—'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Email đăng nhập</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.email || user?.email || '—'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Địa chỉ lấy hàng</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.pickupAddress || application.address || '—'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Mô tả cửa hàng</dt><dd className="mt-0.5 whitespace-pre-wrap break-words font-medium text-gray-900">{application.description || '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Số CCCD</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.identityNumber || '—'}</dd></div>
            <div><dt className="text-xs text-gray-500">Mã số thuế</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.taxCode || 'Không cung cấp'}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Trạng thái</dt>
              <dd className={`mt-0.5 font-medium ${isRejected ? 'text-red-700' : 'text-amber-800'}`}>
                {isRejected ? 'Cần cập nhật hồ sơ' : 'Đang chờ xét duyệt'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {isRejected && isLoggedIn && (
            <button type="button" onClick={() => navigate('/seller/onboarding')} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
              <BadgeCheck className="h-4 w-4" /> Cập nhật hồ sơ
            </button>
          )}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/seller', { replace: true })
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" /> Quay lại trang đăng nhập
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/seller')} className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Quay lại trang đăng nhập
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
