import { useState } from 'react'
import { ArrowLeft, BadgeCheck, Clock3, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplications, reviewSellerApplication } from '@/mocks/seller'

export default function SellerApplicationsReviewPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState(getSellerApplications)
  const [reviewNote, setReviewNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const pendingApplications = applications.filter((application) => application.status === 'pending')

  const decide = (application, status) => {
    setError('')
    setSuccess('')
    if (status === 'rejected' && !reviewNote.trim()) {
      setError('Vui lòng ghi lý do từ chối để người đăng ký biết cần bổ sung gì.')
      return
    }
    try {
      const updated = reviewSellerApplication(application.userId, status, reviewNote)
      setApplications((current) => current.map((item) => (
        item.userId === application.userId ? { ...item, ...updated } : item
      )))
      setReviewNote('')
      setSuccess(status === 'approved'
        ? `Đã duyệt shop ${application.shopName}.`
        : `Đã từ chối hồ sơ ${application.shopName}.`)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Không thể cập nhật hồ sơ.')
    }
  }

  return (
    <main className="flex-1 bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Khu vực quản trị
        </Link>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#056F1C]">ADMIN · KIỂM DUYỆT</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Hồ sơ đăng ký người bán</h1>
            <p className="mt-2 text-sm text-gray-600">Đang đăng nhập với tài khoản quản trị: {user?.name}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
            {pendingApplications.length} hồ sơ chờ duyệt
          </span>
        </header>
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Đây là dữ liệu demo lưu cục bộ. Không dùng thông tin thuế, CCCD hoặc ngân hàng thật; thao tác duyệt không gọi dịch vụ bên ngoài.
        </p>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {success && <p role="status" className="mt-4 text-sm text-green-700">{success}</p>}

        {applications.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-gray-400" />
            <h2 className="mt-3 font-semibold text-gray-900">Chưa có hồ sơ đăng ký shop</h2>
            <p className="mt-1 text-sm text-gray-500">Hồ sơ người dùng gửi sẽ hiển thị tại đây.</p>
          </section>
        ) : (
          <div className="mt-6 space-y-5">
            {applications.map((application) => (
              <article key={application.userId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 font-bold text-[#056F1C]">
                      {application.avatar
                        ? <img src={application.avatar} alt="" className="h-full w-full object-cover" />
                        : application.shopName?.[0] ?? 'S'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-gray-900">{application.shopName}</h2>
                      <p className="text-sm text-gray-500">Tài khoản: {application.userId} · Gửi {new Date(application.submittedAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    application.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : application.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {application.status === 'pending' ? 'Chờ duyệt' : application.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                  </span>
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm md:grid-cols-2">
                  <div><dt className="text-gray-500">Địa chỉ shop</dt><dd className="mt-1 font-medium text-gray-900">{application.address}</dd></div>
                  <div><dt className="text-gray-500">Mô tả</dt><dd className="mt-1 font-medium text-gray-900">{application.description}</dd></div>
                  <div><dt className="text-gray-500">Mã số thuế</dt><dd className="mt-1 font-medium text-gray-900">{application.taxCode}</dd></div>
                  <div><dt className="text-gray-500">CCCD</dt><dd className="mt-1 font-medium text-gray-900">{application.identityNumber}</dd></div>
                  <div><dt className="text-gray-500">Ngân hàng / số tài khoản</dt><dd className="mt-1 font-medium text-gray-900">{application.bankName} · {application.bankAccountNumber}</dd></div>
                  <div><dt className="text-gray-500">Chủ tài khoản</dt><dd className="mt-1 font-medium text-gray-900">{application.bankAccountName}</dd></div>
                  {application.reviewNote && <div className="md:col-span-2"><dt className="text-gray-500">Ghi chú kiểm duyệt</dt><dd className="mt-1 font-medium text-gray-900">{application.reviewNote}</dd></div>}
                </dl>
                {application.status === 'pending' && (
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <label htmlFor={`review-note-${application.userId}`} className="mb-1.5 block text-sm font-medium text-gray-700">
                      Ghi chú cho người đăng ký (bắt buộc nếu từ chối)
                    </label>
                    <textarea id={`review-note-${application.userId}`} rows={2} value={reviewNote} onChange={(event) => { setReviewNote(event.target.value); setError('') }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" maxLength={500} />
                    <div className="mt-3 flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={() => decide(application, 'rejected')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">
                        <XCircle className="h-4 w-4" /> Từ chối
                      </button>
                      <button type="button" onClick={() => decide(application, 'approved')} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
                        <BadgeCheck className="h-4 w-4" /> Duyệt shop
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
