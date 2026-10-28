import { useEffect, useState } from 'react'
import { ArrowLeft, CircleCheck, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatNotificationDateTime } from '@/mocks/mockNotifications'
import { getUserNotifications } from '@/mocks/userNotifications'

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-gray-900">{children}</dd>
    </div>
  )
}

export default function ReportNotificationPage() {
  const { reportId } = useParams()
  const { user } = useAuth()
  const [expandedImage, setExpandedImage] = useState(null)
  const notification = getUserNotifications(user?.id).find((item) =>
    item.type === 'report' && item.href === `/user/reports/${encodeURIComponent(reportId)}`,
  )

  useEffect(() => {
    if (!expandedImage) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpandedImage(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [expandedImage])

  if (!notification?.report) {
    return (
      <main className="w-full flex-1 bg-gray-50 px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-bold text-gray-900">Không tìm thấy báo cáo</h1>
          <Link
            to="/user/notifications"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại thông báo
          </Link>
        </section>
      </main>
    )
  }

  const report = notification.report
  const targetLabel = report.type === 'Cửa hàng'
    ? 'Cửa hàng bị báo cáo'
    : report.type === 'Người dùng'
      ? 'Người dùng bị báo cáo'
      : 'Sản phẩm bị báo cáo'

  return (
    <main className="w-full flex-1 bg-gray-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3 border-b border-gray-100 pb-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#056F1C]">
            <CircleCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chi tiết báo cáo</h1>
            <p className="mt-1 text-sm text-gray-600">Báo cáo đã được đội ngũ kiểm duyệt xử lý.</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100">
          <DetailRow label="Loại báo cáo">{report.type}</DetailRow>
          <DetailRow label={targetLabel}>{report.target}</DetailRow>
          {report.reportedAccount && (
            <DetailRow label="Cửa hàng liên quan">{report.reportedAccount}</DetailRow>
          )}
          <DetailRow label="Lý do báo cáo">{report.reason}</DetailRow>
          {report.details && (
            <DetailRow label="Nội dung chi tiết">{report.details}</DetailRow>
          )}
          {report.evidenceImages?.length > 0 && (
            <div className="border-b border-gray-100 py-3">
              <dt className="text-sm text-gray-500">Ảnh bằng chứng</dt>
              <dd className="mt-2 flex flex-wrap gap-3">
                {report.evidenceImages.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onClick={() => setExpandedImage({
                      src: image.src,
                      alt: image.alt || `Ảnh bằng chứng ${index + 1}`,
                    })}
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
                    aria-label={`Xem ảnh bằng chứng ${index + 1}`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt || `Ảnh bằng chứng ${index + 1}`}
                      className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </dd>
            </div>
          )}
          <DetailRow label="Thời gian gửi">{formatNotificationDateTime(report.submittedAt)}</DetailRow>
          <DetailRow label="Kết quả xử lý">{report.result}</DetailRow>
          <DetailRow label="Thời gian xử lý">{formatNotificationDateTime(report.processedAt)}</DetailRow>
        </dl>

        <Link
          to="/user/notifications"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </section>
      {expandedImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExpandedImage(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Ảnh bằng chứng chi tiết"
            className="relative flex max-h-[90vh] max-w-[min(90vw,1000px)] items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              aria-label="Đóng ảnh"
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-gray-800 shadow transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={expandedImage.src}
              alt={expandedImage.alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
          </section>
        </div>
      )}
    </main>
  )
}
