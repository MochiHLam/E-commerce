import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  ImageIcon,
  MessageSquareWarning,
  Package,
  Search,
  ShieldAlert,
  Store,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAdminModerationAudit, getAdminReportCases, closeAdminReportCase } from '@/mocks/adminModeration'

const TARGET_TYPES = {
  shop: { label: 'Cửa hàng', icon: Store },
  product: { label: 'Sản phẩm', icon: Package },
  review: { label: 'Đánh giá', icon: MessageSquareWarning },
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(date)
}

function getUniqueReportCount(reportCase) {
  return new Set(reportCase.reports.map((report) => report.reporterId || report.id).filter(Boolean)).size
}

function getReportCount(reportCase) {
  return reportCase.reports.length
}

function StatusBadge({ status }) {
  const resolved = status !== 'open'
  const label = status === 'dismissed' ? 'Đã loại bỏ' : resolved ? 'Đã xử lý' : 'Chờ xử lý'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      resolved ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-800'
    }`}>
      {resolved ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </span>
  )
}

function ContentStatusBadge({ reportCase }) {
  if (!['product', 'review'].includes(reportCase.target.type)) return null
  const isHidden = reportCase.target.isHidden === true
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      isHidden ? 'bg-orange-50 text-orange-800' : 'bg-green-50 text-green-800'
    }`}>
      {isHidden ? 'Nội dung đã ẩn' : 'Nội dung đang hiển thị'}
    </span>
  )
}

function TargetIcon({ type, className = 'h-5 w-5' }) {
  const Icon = TARGET_TYPES[type]?.icon ?? ShieldAlert
  return <Icon className={className} aria-hidden="true" />
}

function CloseCaseDialog({ reportCase, onClose, onConfirm, busy }) {
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!status) {
      setError('Vui lòng chọn kết quả xử lý case.')
      return
    }
    if (!note.trim()) {
      setError('Vui lòng nhập ghi chú để lưu cùng audit.')
      return
    }
    try {
      onConfirm(status, note.trim())
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu quyết định.')
    }
  }

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="moderation-confirm-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#056F1C]">Đóng case</p>
            <h2 id="moderation-confirm-title" className="mt-1 text-xl font-bold text-gray-900">{reportCase.target.label}</h2>
            <p className="mt-1 text-sm text-gray-500">Case {reportCase.id}</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:opacity-50">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit} className="mt-5">
          <fieldset>
            <legend className="text-sm font-semibold text-gray-800">Kết quả xem xét</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                { value: 'completed', label: 'Completed · Đã xử lý' },
                { value: 'dismissed', label: 'Dismissed · Không đủ căn cứ / không hợp lệ' },
              ].map((option) => (
                <label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                  status === option.value ? 'border-[#056F1C] bg-green-50 text-[#056F1C]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="moderation-status" value={option.value} checked={status === option.value} onChange={(event) => { setStatus(event.target.value); setError('') }} className="accent-[#056F1C]" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-gray-800">Kết quả / lý do đóng case <span className="font-normal text-gray-500">(bắt buộc, lưu vào audit)</span></span>
            <textarea
              required
              maxLength={1000}
              rows={4}
              value={note}
              onChange={(event) => { setNote(event.target.value); setError('') }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-6 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              placeholder="Ghi rõ kết quả xem xét hoặc lý do loại bỏ report"
            />
          </label>

          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Đóng case chỉ cập nhật trạng thái báo cáo và audit; không thay đổi trạng thái Shop, sản phẩm hoặc đánh giá.
          </p>
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
            <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              {busy ? 'Đang ghi nhận…' : 'Xác nhận đóng case'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CaseDetailDrawer({ reportCase, allCases, audit, visibleCases, onClose, onDecide, onSelectCase }) {
  const [expandedImage, setExpandedImage] = useState(null)
  const targetType = TARGET_TYPES[reportCase.target.type] ?? TARGET_TYPES.product
  const selectedIndex = visibleCases.findIndex((item) => item.id === reportCase.id)
  const previousCase = selectedIndex > 0 ? visibleCases[selectedIndex - 1] : null
  const nextCase = selectedIndex >= 0 ? visibleCases[selectedIndex + 1] : null
  const repeatedCases = allCases.filter((item) => (
    item.id !== reportCase.id
    && item.target.type === reportCase.target.type
    && item.target.id === reportCase.target.id
  ))
  const caseAudit = audit.filter((item) => item.caseId === reportCase.id)

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (expandedImage) setExpandedImage(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [expandedImage, onClose])

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/40" onMouseDown={onClose}>
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="moderation-case-title"
          className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#056F1C]">
                  <TargetIcon type={reportCase.target.type} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#056F1C]">Chi tiết case · {targetType.label}</p>
                  <h2 id="moderation-case-title" className="mt-1 break-words text-xl font-bold text-gray-950">{reportCase.target.label}</h2>
                  <p className="mt-1 break-all text-xs text-gray-500">{reportCase.id} · Đối tượng {reportCase.target.id}</p>
                </div>
              </div>
              <button type="button" aria-label="Đóng chi tiết case" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={reportCase.status} />
              <ContentStatusBadge reportCase={reportCase} />
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{getReportCount(reportCase)} report trong case</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{getUniqueReportCount(reportCase)} người report duy nhất</span>
              <span className="text-xs text-gray-500">Mở lúc {formatDateTime(reportCase.openedAt)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <button type="button" disabled={!previousCase} onClick={() => previousCase && onSelectCase(previousCase)} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-transparent">
                ← Case trước
              </button>
              <span className="text-xs text-gray-500">{selectedIndex >= 0 ? `${selectedIndex + 1} / ${visibleCases.length}` : ''}</span>
              <button type="button" disabled={!nextCase} onClick={() => nextCase && onSelectCase(nextCase)} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-transparent">
                Case tiếp →
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-6 px-5 py-5 sm:px-7">
            <section>
              <h3 className="text-sm font-bold text-gray-900">Đối tượng bị report</h3>
              <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Tên đối tượng</p>
                <p className="mt-1 font-semibold text-gray-900">{reportCase.target.label}</p>
                {reportCase.target.owner && <p className="mt-1 text-sm text-gray-600">Cửa hàng liên quan: {reportCase.target.owner}</p>}
                <p className="mt-1 break-all text-xs text-gray-500">ID: {reportCase.target.id}</p>
                {reportCase.target.type === 'review' && (
                  <p className="mt-2 text-xs text-gray-600">
                    Trạng thái nội dung (`Review.isHidden`): <strong>{reportCase.target.isHidden ? 'Đã bị ẩn' : 'Đang hiển thị'}</strong>
                  </p>
                )}
                {reportCase.target.type === 'product' && (
                  <p className="mt-2 text-xs text-gray-600">
                    Trạng thái hiển thị sản phẩm: <strong>{reportCase.target.isHidden ? 'Đã bị ẩn' : 'Đang hiển thị'}</strong>
                  </p>
                )}
                {reportCase.target.type === 'product' && reportCase.target.shopId && (
                  <Link to={`/admin/catalog/products/${encodeURIComponent(reportCase.target.shopId)}/${encodeURIComponent(reportCase.target.id)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#056F1C] hover:underline">
                    Mở chi tiết sản phẩm <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Report và bằng chứng</h3>
                  <p className="mt-1 text-xs text-gray-500">Hiển thị tổng report riêng với số người report duy nhất.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                  <span>{getReportCount(reportCase)} report</span>
                  <span aria-hidden="true">·</span>
                  <span>{getUniqueReportCount(reportCase)} người report</span>
                </div>
              </div>
              <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
                {reportCase.reports.map((report) => (
                  <article key={report.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h4 className="text-sm font-semibold text-gray-900">{report.reporterName || 'Người dùng'}</h4>
                      <time className="ml-auto text-xs text-gray-500" dateTime={new Date(report.submittedAt).toISOString()}>{formatDateTime(report.submittedAt)}</time>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-800">{report.reason}</p>
                    {report.details && <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">{report.details}</p>}
                    {report.evidenceImages?.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.evidenceImages.map((image, index) => {
                          const src = typeof image === 'string' ? image : image.src
                          const alt = typeof image === 'string' ? `Ảnh bằng chứng ${index + 1}` : image.alt || `Ảnh bằng chứng ${index + 1}`
                          return (
                            <button key={`${src}-${index}`} type="button" onClick={() => setExpandedImage({ src, alt })} aria-label={`Xem ảnh bằng chứng ${index + 1}`} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                              <img src={src} alt={alt} loading="lazy" className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400">Không có ảnh bằng chứng đính kèm.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Tái phạm và lịch sử case</h3>
                  <p className="mt-1 text-xs text-gray-500">Case khác liên quan cùng đối tượng: {repeatedCases.length}</p>
                </div>
              </div>
              {repeatedCases.length ? (
                <ul className="mt-3 space-y-2">
                  {repeatedCases.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-800">{item.id}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">{getReportCount(item)} report · {getUniqueReportCount(item)} người report · {formatDateTime(item.openedAt)}</span>
                      </span>
                      <span className="text-xs text-gray-600">{item.resolution?.status === 'dismissed' ? 'Đã loại bỏ' : item.resolution ? 'Đã xử lý' : 'Chưa đóng case'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">Chưa có case nào khác được ghi nhận cho đối tượng này.</p>
              )}
              {reportCase.resolution && (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-900">
                    Case {reportCase.resolution.status === 'dismissed' ? 'Dismissed · Đã loại bỏ' : 'Completed · Đã xử lý'}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-green-900">{reportCase.resolution.reason}</p>
                  <p className="mt-2 text-xs text-green-800">{reportCase.resolution.decidedBy} · {formatDateTime(reportCase.resolution.decidedAt)}</p>
                </div>
              )}
              {caseAudit.length > 0 && (
                <ol className="mt-3 space-y-2">
                  {caseAudit.map((entry) => (
                    <li key={entry.id} className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                      <p className="font-semibold text-gray-800">{entry.action}</p>
                      <p className="mt-1 leading-5 text-gray-600">{entry.note}</p>
                      <p className="mt-1 text-xs text-gray-500">{entry.actor} · {formatDateTime(entry.createdAt)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex gap-2">
              <button type="button" disabled={!previousCase} onClick={() => previousCase && onSelectCase(previousCase)} className="min-h-10 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:opacity-40">← Trước</button>
              <button type="button" disabled={!nextCase} onClick={() => nextCase && onSelectCase(nextCase)} className="min-h-10 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:opacity-40">Tiếp →</button>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">Đóng</button>
              {reportCase.status === 'open' && <button type="button" onClick={onDecide} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />Đóng case
              </button>}
            </div>
          </footer>
        </aside>
      </div>
      {expandedImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpandedImage(null) }}>
          <figure className="relative max-h-[90vh] max-w-[min(90vw,1000px)]">
            <button type="button" onClick={() => setExpandedImage(null)} aria-label="Đóng ảnh bằng chứng" className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <img src={expandedImage.src} alt={expandedImage.alt} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
            <figcaption className="mt-2 text-center text-sm text-white">{expandedImage.alt}</figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

export default function AdminModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cases, setCases] = useState([])
  const [audit, setAudit] = useState([])
  const [activeTab, setActiveTab] = useState('open')
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get('caseId') || '')
  const [isCloseCaseOpen, setIsCloseCaseOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = useCallback(() => {
    try {
      setCases(getAdminReportCases())
      setAudit(getAdminModerationAudit())
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu báo cáo & kiểm duyệt.')
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('navishop:moderation-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('navishop:moderation-updated', refresh)
    }
  }, [refresh])

  const visibleCases = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    return cases.filter((reportCase) => {
      const matchesStatus = activeTab === 'open'
        ? reportCase.status === 'open'
        : ['completed', 'dismissed'].includes(reportCase.status)
      const matchesType = typeFilter === 'all' || reportCase.target.type === typeFilter
      const searchText = `${reportCase.id} ${reportCase.target.label} ${reportCase.target.id} ${reportCase.target.owner ?? ''} ${reportCase.reports.map((report) => `${report.reason} ${report.reporterName}`).join(' ')}`.toLocaleLowerCase('vi')
      return matchesStatus && matchesType && (!normalizedQuery || searchText.includes(normalizedQuery))
    }).sort((left, right) => {
      if (activeTab === 'open') return getUniqueReportCount(right) - getUniqueReportCount(left) || right.openedAt - left.openedAt
      return (right.resolution?.decidedAt ?? 0) - (left.resolution?.decidedAt ?? 0)
    })
  }, [activeTab, cases, query, typeFilter])

  const selectedCase = cases.find((reportCase) => reportCase.id === selectedCaseId) ?? null
  const openCount = cases.filter((reportCase) => reportCase.status === 'open').length
  const resolvedCount = cases.filter((reportCase) => ['completed', 'dismissed'].includes(reportCase.status)).length

  useEffect(() => {
    const caseId = searchParams.get('caseId')
    if (caseId && cases.some((reportCase) => reportCase.id === caseId)) {
      setSelectedCaseId(caseId)
      setActiveTab(cases.find((reportCase) => reportCase.id === caseId)?.status === 'open' ? 'open' : 'history')
    }
  }, [cases, searchParams])

  function openCase(reportCase) {
    setSelectedCaseId(reportCase.id)
    setSearchParams({ caseId: reportCase.id }, { replace: true })
    setError('')
    setSuccess('')
  }

  function closeDrawer() {
    setSelectedCaseId('')
    setIsCloseCaseOpen(false)
    setSearchParams({}, { replace: true })
  }

  function handleCloseCase(status, note) {
    if (!selectedCase) return
    setIsSaving(true)
    try {
      closeAdminReportCase(selectedCase.id, status, note)
      refresh()
      setIsCloseCaseOpen(false)
      setSuccess(`Case ${selectedCase.id} đã được đóng với trạng thái ${status === 'completed' ? 'Completed' : 'Dismissed'}.`)
      setActiveTab('history')
    } catch (closeError) {
      if (closeError?.code === 'CASE_ALREADY_RESOLVED') {
        refresh()
        setIsCloseCaseOpen(false)
      }
      setError(closeError instanceof Error ? closeError.message : 'Không thể đóng case.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Báo cáo & kiểm duyệt</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Kết luận case và lưu lý do xử lý; thay đổi trạng thái Shop hoặc sản phẩm được thực hiện riêng tại trang quản lý tương ứng.</p>
        </div>
      </header>

      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}

      <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
          <div role="tablist" aria-label="Trạng thái case" className="flex flex-wrap gap-1">
            <button type="button" role="tab" aria-selected={activeTab === 'open'} onClick={() => setActiveTab('open')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] ${activeTab === 'open' ? 'bg-green-50 text-[#056F1C]' : 'text-gray-600 hover:bg-gray-50'}`}>
              Open · Chờ xử lý <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeTab === 'open' ? 'bg-white text-[#056F1C]' : 'bg-gray-100 text-gray-600'}`}>{openCount}</span>
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'history'} onClick={() => setActiveTab('history')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] ${activeTab === 'history' ? 'bg-green-50 text-[#056F1C]' : 'text-gray-600 hover:bg-gray-50'}`}>
              Lịch sử đã xử lý <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeTab === 'history' ? 'bg-white text-[#056F1C]' : 'bg-gray-100 text-gray-600'}`}>{resolvedCount}</span>
            </button>
          </div>
          <span className="text-xs text-gray-500">Không có luồng khiếu nại quyết định trong model hiện tại.</span>
        </div>

        <div className="grid gap-3 border-b border-gray-100 bg-gray-50/60 p-4 md:grid-cols-[minmax(220px,1fr)_220px]">
          <label className="relative block">
            <span className="sr-only">Tìm case, đối tượng hoặc lý do</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã case, đối tượng, lý do…" className="min-h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
          </label>
          <label>
            <span className="sr-only">Lọc theo loại đối tượng</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15">
              <option value="all">Tất cả đối tượng</option>
              {Object.entries(TARGET_TYPES).map(([type, config]) => <option key={type} value={type}>{config.label}</option>)}
            </select>
          </label>
        </div>

        {visibleCases.length ? (
          <div role="tabpanel" className="divide-y divide-gray-100">
            {visibleCases.map((reportCase) => {
              const targetType = TARGET_TYPES[reportCase.target.type] ?? TARGET_TYPES.product
              const isResolved = reportCase.status !== 'open'
              return (
                <button key={reportCase.id} type="button" onClick={() => openCase(reportCase)} className={`grid w-full grid-cols-[48px_minmax(0,1fr)] items-start gap-3 px-4 py-4 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#056F1C] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 ${isResolved ? '' : 'bg-green-50/40'}`}>
                  <span className="mt-0.5 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 text-[#056F1C] sm:h-14 sm:w-14">
                    {reportCase.target.image
                      ? <img src={reportCase.target.image} alt="" className="h-full w-full object-cover" />
                      : <TargetIcon type={reportCase.target.type} className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900 sm:text-base">{reportCase.target.label}</span>
                      <StatusBadge status={reportCase.status} />
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-gray-700">
                      {targetType.label} · {reportCase.target.owner ? `${reportCase.target.owner} · ` : ''}{getReportCount(reportCase)} report · {getUniqueReportCount(reportCase)} người report duy nhất
                    </span>
                    <span className="mt-1 block truncate text-xs text-gray-500">
                      {reportCase.reports[0]?.reason || 'Chưa có lý do'} · Mở {formatDateTime(reportCase.openedAt)}
                    </span>
                    {['product', 'review'].includes(reportCase.target.type) && (
                      <span className="mt-1 block text-xs text-gray-600">
                        Nội dung: {reportCase.target.isHidden ? 'đã ẩn' : 'đang hiển thị'}
                      </span>
                    )}
                    {isResolved && reportCase.resolution && <span className="mt-1 block text-xs font-medium text-gray-600">{reportCase.status === 'dismissed' ? 'Dismissed' : 'Completed'} · {reportCase.resolution.reason}</span>}
                    <span className="mt-2 block text-[11px] text-gray-400">Mã case: {reportCase.id}</span>
                  </span>
                  <span className="col-start-2 inline-flex items-center gap-1 text-xs font-semibold text-[#056F1C] sm:col-start-auto sm:self-center">
                    Chi tiết <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              {activeTab === 'open' ? <CircleCheck className="h-6 w-6" aria-hidden="true" /> : <ImageIcon className="h-6 w-6" aria-hidden="true" />}
            </span>
            <h2 className="mt-3 text-sm font-semibold text-gray-900">{activeTab === 'open' ? 'Không có case chờ xử lý' : 'Chưa có lịch sử đã xử lý'}</h2>
            <p className="mt-1 text-sm text-gray-500">{query || typeFilter !== 'all' ? 'Thử thay đổi từ khóa hoặc bộ lọc.' : 'Các case phù hợp sẽ xuất hiện tại đây khi có dữ liệu.'}</p>
          </div>
        )}
      </section>

      {selectedCase && <CaseDetailDrawer
        reportCase={selectedCase}
        allCases={cases}
        audit={audit}
        visibleCases={visibleCases}
        onClose={closeDrawer}
        onDecide={() => setIsCloseCaseOpen(true)}
        onSelectCase={openCase}
      />}
      {selectedCase && isCloseCaseOpen && <CloseCaseDialog key={selectedCase.id} reportCase={selectedCase} onClose={() => setIsCloseCaseOpen(false)} onConfirm={handleCloseCase} busy={isSaving} />}
    </main>
  )
}
