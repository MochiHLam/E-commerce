import { Clock3, LogOut, Store } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication } from '@/mocks/seller'

export default function SellerPendingPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [application] = useState(() => user?.role === 'user' ? getSellerApplication(user.id) : null)
  const [loggedOutForAdmin, setLoggedOutForAdmin] = useState(false)
  if (isLoggedIn && user?.role !== 'user') return <Navigate to="/" replace />
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'approved') return <Navigate to="/seller/dashboard" replace />
  if (application.status === 'rejected') return <Navigate to="/seller/onboarding" replace />

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-14">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Clock3 className="h-7 w-7" />
        </span>
        <p className="mt-5 text-sm font-semibold text-amber-700">HỒ SƠ ĐANG CHỜ DUYỆT</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{application.shopName}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
          NaviShop đã nhận hồ sơ đăng ký. Bạn có thể xem lại thông tin bên dưới hoặc cập nhật hồ sơ trong khi chờ kết quả xét duyệt.
        </p>
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-600 sm:p-5">
          <p className="flex items-center gap-2 font-semibold text-gray-900"><Store className="h-4 w-4 text-[#056F1C]" /> Thông tin hồ sơ</p>
          {application.avatar && (
            <img src={application.avatar} alt={`Ảnh đại diện ${application.shopName}`} className="mt-4 h-16 w-16 rounded-full object-cover" />
          )}
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Tên cửa hàng</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.shopName}</dd></div>
            <div><dt className="text-xs text-gray-500">Ngày gửi</dt><dd className="mt-0.5 font-medium text-gray-900">{new Date(application.submittedAt).toLocaleString('vi-VN')}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Địa chỉ</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.address}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Mô tả cửa hàng</dt><dd className="mt-0.5 whitespace-pre-wrap break-words font-medium text-gray-900">{application.description}</dd></div>
            <div><dt className="text-xs text-gray-500">Mã số thuế</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.taxCode}</dd></div>
            <div><dt className="text-xs text-gray-500">Số CCCD</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.identityNumber}</dd></div>
            <div><dt className="text-xs text-gray-500">Ngân hàng</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.bankName}</dd></div>
            <div><dt className="text-xs text-gray-500">Số tài khoản</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.bankAccountNumber}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Chủ tài khoản</dt><dd className="mt-0.5 break-words font-medium text-gray-900">{application.bankAccountName}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Trạng thái</dt><dd className="mt-0.5 font-medium text-amber-800">Đang chờ xét duyệt</dd></div>
          </dl>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {isLoggedIn && user?.role === 'user' && (
            <button type="button" onClick={() => navigate('/seller/onboarding')} className="inline-flex min-h-10 items-center rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
              Chỉnh sửa hồ sơ
            </button>
          )}
          {!isLoggedIn || loggedOutForAdmin ? (
            <button type="button" onClick={() => navigate('/admin/seller-applications')} className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Tiếp tục vào trang admin demo
            </button>
          ) : (
            <>
              <button type="button" onClick={() => { logout(); setLoggedOutForAdmin(true) }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <LogOut className="h-4 w-4" /> Đăng xuất để vào admin demo
              </button>
              <button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </>
          )}
        </div>
        <p className="mt-5 text-xs text-gray-400">Trang admin yêu cầu đăng nhập bằng tài khoản quản trị mock.</p>
      </section>
    </main>
  )
}
