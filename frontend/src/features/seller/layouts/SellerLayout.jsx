import { useEffect, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication, submitSellerShopAppeal } from '@/mocks/seller'
import StaffLayout from '@/features/staff/layouts/StaffLayout'

export default function SellerLayout() {
  const { user } = useAuth()
  const [application, setApplication] = useState(() => (
    user?.id ? getSellerApplication(user.id) : null
  ))
  const [appealReason, setAppealReason] = useState('')
  const [appealExplanation, setAppealExplanation] = useState('')
  const [appealError, setAppealError] = useState('')
  const [appealNotice, setAppealNotice] = useState('')

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

  const restricted = application && application.status !== 'approved'
  const statusHeading = {
    suspended: 'Shop đang bị tạm khóa',
    banned: 'Shop đã bị cấm',
    pending_deletion: 'Yêu cầu xóa Shop đang chờ duyệt',
    deleted: 'Shop đã được Admin duyệt xóa',
  }[application?.status]

  function submitAppeal(event) {
    event.preventDefault()
    setAppealError('')
    setAppealNotice('')
    try {
      const updated = submitSellerShopAppeal(user.id, appealReason, appealExplanation)
      setApplication(updated)
      setAppealReason('')
      setAppealExplanation('')
      setAppealNotice('Khiếu nại đã được gửi đến Admin.')
    } catch (error) {
      setAppealError(error instanceof Error ? error.message : 'Không thể gửi khiếu nại.')
    }
  }

  return (
    <>
      {restricted && (
        <section className="mx-auto mt-4 w-full max-w-[1500px] px-4 sm:px-6 xl:px-0">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-800"><LockKeyhole size={18} /></span>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold">{statusHeading}</h1>
                <p className="mt-1 text-sm leading-6">{application.statusReason || 'Shop hiện không thể hoạt động bán hàng.'}</p>
                <p className="mt-1 text-xs text-amber-900/75">Thời điểm cập nhật: {application.statusChangedAt ? new Date(application.statusChangedAt).toLocaleString('vi-VN') : '—'} · Nguồn: {application.statusSource === 'seller' ? 'Yêu cầu của Seller' : application.statusSource || 'Admin'}</p>
                {application.status === 'suspended' && (
                  <div className="mt-4">
                    {application.appeal && (
                      <div className="mb-3 rounded-lg border border-amber-200 bg-white/70 p-3 text-sm">
                        <p className="font-semibold">Khiếu nại: {application.appeal.status === 'pending' ? 'Đang chờ Admin' : application.appeal.status === 'approved' ? 'Đã được chấp nhận' : 'Đã được phản hồi'}</p>
                        {application.appeal.response && <p className="mt-1 leading-5">{application.appeal.response}</p>}
                      </div>
                    )}
                    {application.appeal?.status !== 'pending' && (
                      <form onSubmit={submitAppeal} className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-semibold">
                          Lý do khiếu nại
                          <input required maxLength={300} value={appealReason} onChange={(event) => setAppealReason(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-amber-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-[#056F1C]/20" />
                        </label>
                        <label className="text-sm font-semibold sm:row-span-2">
                          Nội dung giải trình
                          <textarea required maxLength={1000} rows={3} value={appealExplanation} onChange={(event) => setAppealExplanation(event.target.value)} className="mt-1.5 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-[#056F1C]/20" />
                        </label>
                        <div className="flex flex-col items-start gap-2">
                          <button type="submit" className="min-h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white">Gửi khiếu nại</button>
                          {appealError && <p role="alert" className="text-sm text-red-700">{appealError}</p>}
                          {appealNotice && <p role="status" className="text-sm text-green-800">{appealNotice}</p>}
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      <StaffLayout role="seller" />
    </>
  )
}
