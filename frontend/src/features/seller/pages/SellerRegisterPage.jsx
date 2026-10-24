import { ArrowLeft, Check } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MOCK_ACCOUNTS } from '@/mocks/mockAccounts'
import { getSellerApplication } from '@/mocks/seller'

export default function SellerRegisterPage() {
  const { isLoggedIn, user, login } = useAuth()
  const navigate = useNavigate()

  if (isLoggedIn && user?.role === 'user') {
    const application = getSellerApplication(user.id)
    return <Navigate to={application?.status === 'approved' ? '/seller/dashboard' : application?.status === 'pending' ? '/seller/pending' : application?.status === 'rejected' ? '/seller/onboarding' : '/seller'} replace />
  }

  const continueWithGoogleMock = () => {
    const account = MOCK_ACCOUNTS.find((candidate) => candidate.id === 'usr_google_001')
    if (!account) return
    const authenticatedUser = { ...account }
    delete authenticatedUser.password
    login(authenticatedUser)
    navigate('/seller', { replace: true })
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12 sm:px-6">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
        <Link to="/seller" className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Bắt đầu bán hàng trên NaviShop</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Đăng nhập bằng tài khoản buyer hiện có hoặc tạo một tài khoản demo bằng Google. Sau đó hoàn tất hồ sơ shop để gửi admin duyệt.
        </p>
        <div className="mt-7 grid gap-3">
          <Link
            to="/login"
            state={{ returnTo: '/seller' }}
            className="flex min-h-12 items-center justify-center rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]"
          >
            Dùng tài khoản buyer có sẵn
          </Link>
          <button
            type="button"
            onClick={continueWithGoogleMock}
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
          >
            <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-bold text-blue-600">G</span>
            Tiếp tục với Google
          </button>
        </div>
        <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Đăng nhập Google đang được mô phỏng bằng tài khoản demo, chưa kết nối OAuth thật.</p>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/seller" className="font-semibold text-[#056F1C] hover:underline">Đăng nhập người bán</Link>
        </p>
      </section>
    </main>
  )
}
