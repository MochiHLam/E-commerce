import { useEffect, useState } from 'react'
import { LockKeyhole, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication } from '@/mocks/seller'
import StaffLayout from '@/features/staff/layouts/StaffLayout'

export default function SellerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [application, setApplication] = useState(() => (
    user?.id ? getSellerApplication(user.id) : null
  ))

  useEffect(() => {
    const refreshApplication = (event) => {
      if (event?.detail?.userId && event.detail.userId !== user?.id) return
      setApplication(user?.id ? getSellerApplication(user.id) : null)
    }
    window.addEventListener('storage', refreshApplication)
    window.addEventListener('navishop:seller-application-updated', refreshApplication)
    return () => {
      window.removeEventListener('storage', refreshApplication)
      window.removeEventListener('navishop:seller-application-updated', refreshApplication)
    }
  }, [user?.id])

  if (application?.status === 'suspended') {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-700">
            <LockKeyhole aria-hidden="true" size={23} />
          </div>
          <p className="mt-5 text-sm font-semibold text-red-700">Trạng thái cửa hàng</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">Shop đang bị tạm khóa</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {application.statusReason || 'Cửa hàng hiện tạm ngừng hoạt động. Vui lòng liên hệ bộ phận quản trị để biết thêm chi tiết.'}
          </p>
          <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
            Tài khoản của bạn vẫn hoạt động, nhưng hiện không thể truy cập các chức năng quản lý shop.
          </p>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/seller', { replace: true })
            }}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
          >
            <LogOut aria-hidden="true" size={17} />
            Đăng xuất
          </button>
        </section>
      </main>
    )
  }

  return <StaffLayout role="seller" />
}
