import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  Ban,
  Clock3,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import { CATEGORIES } from '@/mocks/categories'
import Pagination from '@/components/Pagination'
import { SortableTableHeader, sortRows, toggleSort } from '@/features/admin/components/SortableTableHeader'
import {
  ensureMockSellerApplication,
  getSellerApplications,
  reviewSellerApplication,
  updateSellerShopStatus,
} from '@/mocks/seller'

const APPLICATIONS_PER_PAGE = 8
const TABS = [
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Đã từ chối' },
  { id: 'locked', label: 'Đã khóa' },
]
const SEARCH_FIELDS = ['shopName', 'email', 'contactName']
const REVIEW_FIELDS = [
  ['shopName', 'Tên cửa hàng'],
  ['slug', 'Đường dẫn'],
  ['categoryId', 'Danh mục chính'],
  ['contactName', 'Người đại diện'],
  ['phone', 'Số điện thoại'],
  ['email', 'Email đăng nhập'],
  ['pickupAddress', 'Địa chỉ lấy hàng'],
  ['taxCode', 'Mã số thuế'],
  ['identityNumber', 'Số CCCD'],
  ['description', 'Mô tả cửa hàng'],
]

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

function getCategoryName(categoryId) {
  return CATEGORIES.find((category) => String(category.id) === String(categoryId))?.name ?? '—'
}

function getReviewItems(applications, tab) {
  return applications
    .filter((application) => tab === 'pending'
      ? application.status === 'pending'
      : tab === 'locked'
        ? ['suspended', 'banned'].includes(application.status)
        : (tab === 'approved' || tab === 'rejected') && application.status === tab)
    .map((application) => ({
      ...application,
      requestSubmittedAt: application.submittedAt,
      reviewItemId: `${application.userId}-${application.submittedAt}`,
    }))
}

function formatFieldValue(field, value) {
  if (field === 'categoryId') return getCategoryName(value)
  if (field === 'slug') return value ? `navishop.vn/${value}` : '—'
  return value || '—'
}

function getHistory(application) {
  const history = [
    ...(Array.isArray(application.submissionHistory) ? application.submissionHistory : []),
    ...(Array.isArray(application.reviewHistory) ? application.reviewHistory : []),
    ...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory.map((entry) => ({
      ...entry,
      type: 'shop-status',
      label: entry.action === 'suspend' ? 'Shop đã tạm khóa' : 'Shop đã mở lại',
      submittedAt: entry.changedAt,
      note: entry.reason,
    })) : []),
  ]
  if (!history.length) {
    return [
      { label: 'Hồ sơ gửi gần nhất', detail: formatDate(application.requestSubmittedAt) },
      ...(application.reviewedAt
        ? [{ label: application.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối', detail: formatDate(application.reviewedAt), note: application.reviewNote }]
        : []),
    ]
  }
  return history
    .map((entry) => {
      const timestamp = entry.reviewedAt ?? entry.submittedAt
      const statusLabel = entry.status === 'approved' ? 'Đã duyệt' : entry.status === 'rejected' ? 'Đã từ chối' : 'Đã gửi'
      return {
        label: entry.label ?? (entry.type === 'review' ? statusLabel : `Hồ sơ ${statusLabel.toLocaleLowerCase('vi')}`),
        detail: formatDate(timestamp),
        timestamp: timestamp ? new Date(timestamp).getTime() : 0,
        note: entry.note ?? entry.reviewNote,
      }
    })
    .sort((first, second) => second.timestamp - first.timestamp)
}

export default function SellerApplicationsReviewPage() {
  const [applications, setApplications] = useState(() => {
    if (import.meta.env.DEV) ensureMockSellerApplication()
    return getSellerApplications()
  })
  const [selectedTab, setSelectedTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [submittedAfter, setSubmittedAfter] = useState('')
  const [submittedBefore, setSubmittedBefore] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [pendingDecision, setPendingDecision] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortState, setSortState] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [shopStatusDecision, setShopStatusDecision] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const refreshApplications = () => setApplications(getSellerApplications())
    window.addEventListener('storage', refreshApplications)
    window.addEventListener('focus', refreshApplications)
    return () => {
      window.removeEventListener('storage', refreshApplications)
      window.removeEventListener('focus', refreshApplications)
    }
  }, [])

  const tabItems = useMemo(() => Object.fromEntries(TABS.map(({ id }) => [
    id,
    getReviewItems(applications, id),
  ])), [applications])

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    const filtered = (tabItems[selectedTab] ?? []).filter((application) => {
      const searchableText = SEARCH_FIELDS
        .map((field) => application[field] ?? '')
        .join(' ')
        .toLocaleLowerCase('vi')
      if (query && !searchableText.includes(query)) return false
      if (categoryFilter && String(application.categoryId) !== categoryFilter) return false

      const submittedAt = application.requestSubmittedAt
      const submittedDate = submittedAt ? new Date(submittedAt) : null
      if (submittedAfter && (!submittedDate || submittedDate < new Date(`${submittedAfter}T00:00:00`))) return false
      if (submittedBefore && (!submittedDate || submittedDate > new Date(`${submittedBefore}T23:59:59.999`))) return false
      return true
    })
    return sortRows(filtered, sortState, (application, key) => {
      if (key === 'category') return getCategoryName(application.categoryId)
      if (key === 'requestSubmittedAt') return application.requestSubmittedAt ? new Date(application.requestSubmittedAt).getTime() : null
      return application[key] ?? null
    })
  }, [categoryFilter, search, selectedTab, sortState, submittedAfter, submittedBefore, tabItems])

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / APPLICATIONS_PER_PAGE))
  const pageApplications = filteredApplications.slice(
    (currentPage - 1) * APPLICATIONS_PER_PAGE,
    currentPage * APPLICATIONS_PER_PAGE,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTab, search, categoryFilter, submittedAfter, submittedBefore])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!selectedApplication && !pendingDecision && !shopStatusDecision) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || isSubmitting) return
      if (shopStatusDecision) {
        setShopStatusDecision(null)
        return
      }
      if (pendingDecision) {
        setPendingDecision(null)
        return
      }
      setSelectedApplication(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSubmitting, pendingDecision, selectedApplication, shopStatusDecision])

  function openApplication(application) {
    setSelectedApplication(application)
    setReviewNote('')
    setError('')
  }

  function decide(application, status) {
    if (isSubmitting) return
    setError('')
    setSuccess('')

    if (status === 'rejected' && !reviewNote.trim()) {
      setError('Vui lòng ghi lý do từ chối để người đăng ký biết cần bổ sung gì.')
      return
    }

    setPendingDecision({ application, status })
  }

  function confirmDecision() {
    if (!pendingDecision || isSubmitting) return
    const { application, status } = pendingDecision
    setIsSubmitting(true)
    try {
      reviewSellerApplication(application.userId, status, reviewNote, {
        submittedAt: application.requestSubmittedAt,
      })
      const nextApplications = getSellerApplications()
      setApplications(nextApplications)
      setPendingDecision(null)
      setSelectedApplication(null)
      setReviewNote('')
      setSuccess(status === 'approved'
        ? `Đã duyệt shop ${application.shopName}.`
        : `Đã từ chối hồ sơ ${application.shopName}; lý do đã được lưu để người đăng ký xem.`)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Không thể cập nhật hồ sơ.')
      setApplications(getSellerApplications())
      setPendingDecision(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  function requestShopStatusChange(application, status) {
    if (isSubmitting) return
    setError('')
    setSuccess('')
    if (!reviewNote.trim()) {
      setError(status === 'suspended'
        ? 'Vui lòng nhập lý do tạm khóa shop.'
        : 'Vui lòng nhập lý do mở lại shop.')
      return
    }
    setShopStatusDecision({ application, status, reason: reviewNote.trim() })
  }

  function confirmShopStatusChange() {
    if (!shopStatusDecision || isSubmitting) return
    const { application, status, reason } = shopStatusDecision
    setIsSubmitting(true)
    try {
      updateSellerShopStatus(application.userId, status, reason)
      setApplications(getSellerApplications())
      setShopStatusDecision(null)
      setSelectedApplication(null)
      setReviewNote('')
      setSuccess(status === 'suspended'
        ? `Đã tạm khóa shop ${application.shopName}.`
        : `Đã mở lại shop ${application.shopName}.`)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Không thể cập nhật trạng thái shop.')
      setApplications(getSellerApplications())
      setShopStatusDecision(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  function clearFilters() {
    setSearch('')
    setCategoryFilter('')
    setSubmittedAfter('')
    setSubmittedBefore('')
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Quản lý cửa hàng</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Duyệt hồ sơ đăng ký, cập nhật thông tin và quản lý trạng thái shop.</p>
        </div>
      </header>

      {success && (
        <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      )}
      {error && !selectedApplication && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div role="tablist" aria-label="Trạng thái hồ sơ shop" className="mt-5 flex gap-2 overflow-x-auto border-b border-gray-200 pb-px">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`seller-application-tab-${id}`}
            aria-controls="seller-application-tabpanel"
            aria-selected={selectedTab === id}
            onClick={() => { setSelectedTab(id); setSuccess(''); setError('') }}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] ${
              selectedTab === id
                ? 'border-[#056F1C] text-[#056F1C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${selectedTab === id ? 'bg-green-50 text-[#056F1C]' : 'bg-gray-100 text-gray-600'}`}>
              {tabItems[id].length}
            </span>
          </button>
        ))}
      </div>

      <section aria-label="Tìm và lọc hồ sơ" className="mt-4 grid items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_minmax(145px,0.8fr)_minmax(145px,0.8fr)_auto]">
        <label className="relative block">
          <span className="sr-only">Tìm tên shop, email hoặc người đại diện</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tên shop, email, người đại diện"
            className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo danh mục</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/15"
          >
            <option value="">Tất cả danh mục</option>
            {CATEGORIES.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">
          Ngày gửi từ
          <input
            type="date"
            value={submittedAfter}
            onChange={(event) => setSubmittedAfter(event.target.value)}
            className="mt-1 block min-h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
        <label className="text-xs font-medium text-gray-600">
          Ngày gửi đến
          <input
            type="date"
            value={submittedBefore}
            min={submittedAfter || undefined}
            onChange={(event) => setSubmittedBefore(event.target.value)}
            className="mt-1 block min-h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-800 focus:border-[#056F1C] focus:outline-none focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
        <button
          type="button"
          onClick={clearFilters}
          className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
        >
          Xóa lọc
        </button>
      </section>

      <section
        id="seller-application-tabpanel"
        role="tabpanel"
        aria-labelledby={`seller-application-tab-${selectedTab}`}
        aria-label="Danh sách hồ sơ"
        className="mt-4"
      >
        {filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-gray-900">
              {tabItems[selectedTab].length
                ? 'Không tìm thấy hồ sơ phù hợp'
                : selectedTab === 'locked' ? 'Chưa có shop bị khóa' : 'Chưa có hồ sơ trong mục này'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tabItems[selectedTab].length
                ? 'Thử thay đổi từ khóa hoặc bộ lọc danh mục/ngày gửi.'
                : selectedTab === 'locked'
                  ? 'Các shop đang tạm khóa hoặc đã khóa sẽ xuất hiện tại đây.'
                  : 'Hồ sơ mới sẽ xuất hiện sau khi người bán gửi đăng ký.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <SortableTableHeader className="px-5 py-3 font-semibold" label="Shop" onSort={() => { setSortState((current) => toggleSort(current, 'shopName')); setCurrentPage(1) }} sortKey="shopName" sortState={sortState} />
                      <SortableTableHeader className="px-4 py-3 font-semibold" label="Người đại diện" onSort={() => { setSortState((current) => toggleSort(current, 'contactName')); setCurrentPage(1) }} sortKey="contactName" sortState={sortState} />
                      <SortableTableHeader className="px-4 py-3 font-semibold" label="Danh mục" onSort={() => { setSortState((current) => toggleSort(current, 'category')); setCurrentPage(1) }} sortKey="category" sortState={sortState} />
                      <SortableTableHeader className="px-4 py-3 font-semibold" label="Ngày gửi" onSort={() => { setSortState((current) => toggleSort(current, 'requestSubmittedAt')); setCurrentPage(1) }} sortKey="requestSubmittedAt" sortState={sortState} />
                      <th scope="col" className="px-4 py-3 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageApplications.map((application) => (
                      <tr key={application.reviewItemId} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <button type="button" onClick={() => openApplication(application)} className="font-semibold text-gray-900 hover:text-[#056F1C] focus-visible:outline-none focus-visible:underline">
                            {application.shopName || '—'}
                          </button>
                          <p className="mt-1 text-xs text-gray-500">{application.email || '—'}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{application.contactName || '—'}</td>
                        <td className="px-4 py-4 text-gray-700">{getCategoryName(application.categoryId)}</td>
                        <td className="px-4 py-4 text-gray-600">{formatDate(application.requestSubmittedAt)}</td>
                        <td className="px-4 py-4">
                          <button type="button" onClick={() => openApplication(application)} className="min-h-9 rounded-lg px-3 text-sm font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                            Xem hồ sơ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {pageApplications.map((application) => (
                <article key={application.reviewItemId} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold text-gray-900">{application.shopName || '—'}</h2>
                      <p className="mt-1 break-words text-xs text-gray-500">{application.email || '—'}</p>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="text-gray-500">Người đại diện</dt><dd className="mt-1 break-words font-medium text-gray-800">{application.contactName || '—'}</dd></div>
                    <div><dt className="text-gray-500">Danh mục</dt><dd className="mt-1 break-words font-medium text-gray-800">{getCategoryName(application.categoryId)}</dd></div>
                    <div className="col-span-2"><dt className="text-gray-500">Ngày gửi</dt><dd className="mt-1 font-medium text-gray-800">{formatDate(application.requestSubmittedAt)}</dd></div>
                  </dl>
                  <button type="button" onClick={() => openApplication(application)} className="mt-3 min-h-10 w-full rounded-lg border border-gray-300 text-sm font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                    Xem hồ sơ
                  </button>
                </article>
              ))}
            </div>
            {filteredApplications.length > APPLICATIONS_PER_PAGE && (
              <>
                <p className="pt-3 text-center text-xs text-gray-500">
                  Hiển thị {(currentPage - 1) * APPLICATIONS_PER_PAGE + 1}–{Math.min(currentPage * APPLICATIONS_PER_PAGE, filteredApplications.length)} trên {filteredApplications.length} hồ sơ
                </p>
                <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} label="Phân trang hồ sơ shop" />
              </>
            )}
          </>
        )}
      </section>

      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (!isSubmitting && event.target === event.currentTarget) setSelectedApplication(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-application-title"
            className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-7"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#056F1C]">
                  {selectedApplication.status === 'suspended'
                    ? 'Shop đã tạm khóa'
                    : selectedApplication.status === 'banned'
                      ? 'Shop đã khóa'
                      : `Hồ sơ ${selectedApplication.status === 'pending' ? 'chờ duyệt' : selectedApplication.status === 'approved' ? 'đã duyệt' : 'bị từ chối'}`}
                </p>
                <h2 id="seller-application-title" className="mt-1 break-words text-xl font-bold text-gray-900">{selectedApplication.shopName}</h2>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                aria-label="Đóng hồ sơ"
                onClick={() => setSelectedApplication(null)}
                className="min-h-10 min-w-10 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="mt-5">
              <h3 className="font-semibold text-gray-900">Thông tin hồ sơ</h3>
              <dl className="mt-3 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                {REVIEW_FIELDS.map(([field, label]) => (
                  <div key={field} className={field === 'description' || field === 'pickupAddress' ? 'sm:col-span-2' : ''}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="mt-1 break-words whitespace-pre-wrap font-medium leading-6 text-gray-900">
                      {formatFieldValue(field, selectedApplication[field])}
                    </dd>
                  </div>
                ))}
              </dl>
              <dl className="mt-3 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Ngày gửi yêu cầu</dt>
                  <dd className="mt-1 font-medium text-gray-900">{formatDate(selectedApplication.requestSubmittedAt)}</dd>
                </div>
                {['suspended', 'banned'].includes(selectedApplication.status) && (
                  <div>
                    <dt className="text-gray-500">Lý do khóa</dt>
                    <dd className="mt-1 whitespace-pre-wrap font-medium text-gray-900">{selectedApplication.statusReason || '—'}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Tài liệu / bằng chứng</h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">Hồ sơ mock hiện chưa hỗ trợ tài liệu đính kèm.</p>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Lịch sử hồ sơ</h3>
              <ol className="mt-3 space-y-3">
                {getHistory(selectedApplication).map((entry, index) => (
                  <li key={`${entry.label}-${entry.detail}-${index}`} className="border-l-2 border-gray-200 pl-3 text-sm">
                    <p className="font-medium text-gray-800">{entry.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{entry.detail}</p>
                    {entry.note && <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-gray-600">Ghi chú: {entry.note}</p>}
                  </li>
                ))}
              </ol>
              {selectedApplication.reviewNote && selectedApplication.status === 'rejected' && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-800">
                  Lý do từ chối gần nhất: {selectedApplication.reviewNote}
                </p>
              )}
            </div>

            {selectedTab === 'pending' && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <label htmlFor={`review-note-${selectedApplication.userId}`} className="mb-1.5 block text-sm font-medium text-gray-700">
                  Lý do từ chối (bắt buộc khi từ chối)
                </label>
                {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
                <textarea
                  id={`review-note-${selectedApplication.userId}`}
                  rows={3}
                  value={reviewNote}
                  disabled={isSubmitting}
                  onChange={(event) => { setReviewNote(event.target.value); setError('') }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 disabled:bg-gray-50"
                  maxLength={500}
                  aria-required="false"
                  aria-describedby={`review-note-count-${selectedApplication.userId}`}
                />
                <p id={`review-note-count-${selectedApplication.userId}`} className="mt-1 text-right text-xs text-gray-500">{reviewNote.length}/500</p>
                <div className="mt-3 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => decide(selectedApplication, 'rejected')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    {isSubmitting ? 'Đang gửi…' : 'Từ chối'}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => decide(selectedApplication, 'approved')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    {isSubmitting ? 'Đang gửi…' : 'Duyệt shop'}
                  </button>
                </div>
              </div>
            )}
            {['approved', 'locked'].includes(selectedTab)
              && ['approved', 'suspended'].includes(selectedApplication.status) && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <label htmlFor={`shop-status-note-${selectedApplication.userId}`} className="mb-1.5 block text-sm font-medium text-gray-700">
                    {selectedApplication.status === 'approved' ? 'Lý do tạm khóa shop' : 'Lý do mở lại shop'}
                  </label>
                  {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
                  <textarea
                    id={`shop-status-note-${selectedApplication.userId}`}
                    rows={3}
                    value={reviewNote}
                    disabled={isSubmitting}
                    onChange={(event) => { setReviewNote(event.target.value); setError('') }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 disabled:bg-gray-50"
                    maxLength={500}
                    aria-describedby={`shop-status-note-count-${selectedApplication.userId}`}
                  />
                  <p id={`shop-status-note-count-${selectedApplication.userId}`} className="mt-1 text-right text-xs text-gray-500">{reviewNote.length}/500</p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => requestShopStatusChange(
                        selectedApplication,
                        selectedApplication.status === 'approved' ? 'suspended' : 'approved',
                      )}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedApplication.status === 'approved'
                          ? 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700'
                          : 'border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:ring-[#056F1C]'
                      }`}
                    >
                      {selectedApplication.status === 'approved'
                        ? <><Ban className="h-4 w-4" aria-hidden="true" />Tạm khóa shop</>
                        : <><ShieldCheck className="h-4 w-4" aria-hidden="true" />Mở lại shop</>}
                    </button>
                  </div>
                </div>
              )}
          </section>
        </div>
      )}
      {pendingDecision && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-4"
          onMouseDown={(event) => {
            if (!isSubmitting && event.target === event.currentTarget) setPendingDecision(null)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="seller-decision-confirmation-title"
            aria-describedby="seller-decision-confirmation-description"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start gap-3">
              {pendingDecision.status === 'rejected' && (
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              {shopStatusDecision && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-4"
                  onMouseDown={(event) => {
                    if (!isSubmitting && event.target === event.currentTarget) setShopStatusDecision(null)
                  }}
                >
                  <section
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="shop-status-confirmation-title"
                    aria-describedby="shop-status-confirmation-description"
                    className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        shopStatusDecision.status === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-[#056F1C]'
                      }`}>
                        {shopStatusDecision.status === 'suspended'
                          ? <Ban className="h-5 w-5" aria-hidden="true" />
                          : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0">
                        <h2 id="shop-status-confirmation-title" className="text-lg font-bold text-gray-900">
                          {shopStatusDecision.status === 'suspended' ? 'Xác nhận tạm khóa shop' : 'Xác nhận mở lại shop'}
                        </h2>
                        <p id="shop-status-confirmation-description" className="mt-2 text-sm leading-6 text-gray-600">
                          {shopStatusDecision.status === 'suspended'
                            ? <>Shop <strong className="text-gray-900">{shopStatusDecision.application.shopName}</strong> sẽ ngừng bán. Chủ shop vẫn đăng nhập được nhưng chỉ thấy thông báo shop đang bị khóa.</>
                            : <>Shop <strong className="text-gray-900">{shopStatusDecision.application.shopName}</strong> sẽ được hoạt động trở lại.</>}
                        </p>
                        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm leading-5 text-gray-700">
                          <p className="font-semibold">Lý do thao tác</p>
                          <p className="mt-1 whitespace-pre-wrap break-words">{shopStatusDecision.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setShopStatusDecision(null)}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                      >
                        Xem lại hồ sơ
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={confirmShopStatusChange}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
                          shopStatusDecision.status === 'suspended'
                            ? 'bg-red-700 hover:bg-red-800 focus-visible:ring-red-700'
                            : 'bg-[#056F1C] hover:bg-[#045517] focus-visible:ring-[#056F1C]'
                        }`}
                      >
                        {isSubmitting
                          ? 'Đang lưu…'
                          : shopStatusDecision.status === 'suspended' ? 'Xác nhận tạm khóa' : 'Xác nhận mở lại'}
                      </button>
                    </div>
                  </section>
                </div>
              )}
              <div className="min-w-0">
                <h2 id="seller-decision-confirmation-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  {pendingDecision.status === 'approved' && (
                    <BadgeCheck className="h-5 w-5 shrink-0 text-[#056F1C]" aria-hidden="true" />
                  )}
                  <span className={pendingDecision.status === 'approved' ? 'whitespace-nowrap' : ''}>
                    {pendingDecision.status === 'approved'
                      ? 'Xác nhận duyệt hồ sơ shop'
                      : 'Xác nhận từ chối hồ sơ shop'}
                  </span>
                </h2>
                <p id="seller-decision-confirmation-description" className="mt-2 text-sm leading-6 text-gray-600">
                  {pendingDecision.status === 'approved'
                    ? <>Shop <strong className="text-gray-900">{pendingDecision.application.shopName}</strong> sẽ được chuyển sang trạng thái đã duyệt.</>
                    : <>Hồ sơ shop <strong className="text-gray-900">{pendingDecision.application.shopName}</strong> sẽ bị từ chối. Người đăng ký sẽ thấy lý do bên dưới.</>}
                </p>
                {pendingDecision.status === 'rejected' && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-800">
                    <p className="font-semibold">Lý do từ chối</p>
                    <p className="mt-1 whitespace-pre-wrap break-words">{reviewNote}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setPendingDecision(null)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              >
                Xem lại hồ sơ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDecision}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
                  pendingDecision.status === 'approved'
                    ? 'bg-[#056F1C] hover:bg-[#045517] focus-visible:ring-[#056F1C]'
                    : 'bg-red-700 hover:bg-red-800 focus-visible:ring-red-700'
                }`}
              >
                {isSubmitting ? 'Đang lưu…' : pendingDecision.status === 'approved' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
