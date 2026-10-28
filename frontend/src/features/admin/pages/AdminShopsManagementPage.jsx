import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ban, Check, Clock3, Search, ShieldCheck, Store, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  ensureMockSellerApplication,
  getSellerApplications,
  getSellerShopAudit,
  reviewSellerShopAppeal,
  reviewSellerShopDeletion,
  updateSellerShopStatus,
} from '@/mocks/seller'

const STATUS_LABELS = {
  pending: 'Chờ duyệt hồ sơ',
  approved: 'Approved · Hoạt động',
  suspended: 'Suspended · Tạm khóa',
  banned: 'Banned · Bị cấm',
  pending_deletion: 'Pending deletion · Chờ xóa',
  deleted: 'Deleted · Đã xóa',
  rejected: 'Hồ sơ bị từ chối',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

function StatusBadge({ status }) {
  const classes = status === 'approved'
    ? 'bg-green-50 text-green-800'
    : ['suspended', 'banned', 'deleted'].includes(status)
      ? 'bg-red-50 text-red-800'
      : status === 'pending_deletion' || status === 'pending'
        ? 'bg-amber-50 text-amber-900'
        : 'bg-gray-100 text-gray-700'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{STATUS_LABELS[status] ?? status}</span>
}

function DecisionDialog({ title, description, onClose, onSubmit, submitting, error, requireRestoreStatus = false }) {
  const [reason, setReason] = useState('')
  const [restoreStatus, setRestoreStatus] = useState('approved')

  function submit(event) {
    event.preventDefault()
    if (!reason.trim()) return
    onSubmit(reason.trim(), restoreStatus)
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-gray-950/45 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !submitting) onClose()
    }}>
      <form role="dialog" aria-modal="true" aria-labelledby="shop-decision-title" onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="shop-decision-title" className="text-lg font-bold text-gray-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
        </div>
        {requireRestoreStatus && (
          <label className="mt-4 block text-sm font-semibold text-gray-800">
            Trạng thái Shop sau khi từ chối
            <select value={restoreStatus} onChange={(event) => setRestoreStatus(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal">
              <option value="approved">Approved · Khôi phục hoạt động</option>
              <option value="suspended">Suspended · Giữ tạm khóa</option>
            </select>
          </label>
        )}
        <label className="mt-4 block text-sm font-semibold text-gray-800">
          Lý do / nội dung phản hồi <span className="text-red-700">*</span>
          <textarea required maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
        </label>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={submitting} onClick={onClose} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">Hủy</button>
          <button type="submit" disabled={submitting || !reason.trim()} className="min-h-10 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Đang lưu…' : 'Xác nhận'}</button>
        </div>
      </form>
    </div>
  )
}

export default function AdminShopsManagementPage() {
  const { user } = useAuth()
  const [shops, setShops] = useState([])
  const [audit, setAudit] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')

  const refresh = useCallback(() => {
    try {
      if (import.meta.env.DEV) ensureMockSellerApplication()
      setShops(getSellerApplications())
      setAudit(getSellerShopAudit())
      setPageError('')
    } catch (loadError) {
      setPageError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu cửa hàng.')
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('navishop:seller-application-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('navishop:seller-application-updated', refresh)
    }
  }, [refresh])

  const filteredShops = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi')
    return shops.filter((shop) => (
      (statusFilter === 'all' || shop.status === statusFilter)
      && (!needle || [shop.shopName, shop.slug, shop.email, shop.contactName, shop.userId]
        .some((value) => value?.toLocaleLowerCase('vi').includes(needle)))
    ))
  }, [query, shops, statusFilter])

  const selectedShop = shops.find((shop) => shop.userId === selectedId) ?? null
  const selectedAudit = audit.filter((entry) => entry.shopId === selectedShop?.slug)

  function openAction(action) {
    setPendingAction(action)
    setError('')
  }

  function submitAction(reason, restoreStatus) {
    if (!selectedShop || !pendingAction || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      if (pendingAction.type === 'status') {
        updateSellerShopStatus(selectedShop.userId, pendingAction.status, reason, user?.id)
      } else if (pendingAction.type === 'deletion') {
        reviewSellerShopDeletion(selectedShop.userId, pendingAction.decision, reason, user?.id, restoreStatus)
      } else {
        reviewSellerShopAppeal(selectedShop.userId, pendingAction.decision, reason, user?.id)
      }
      refresh()
      setPendingAction(null)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Không thể lưu quyết định.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">Quản lý cửa hàng</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Quản lý trạng thái Shop độc lập với Report, xử lý yêu cầu xóa và xem xét khiếu nại của Seller.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/seller-applications" className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Duyệt hồ sơ Seller</Link>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">{filteredShops.length} cửa hàng</span>
        </div>
      </header>

      {pageError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{pageError}</p>}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-gray-100 bg-gray-50/60 p-4 md:grid-cols-[minmax(220px,1fr)_240px]">
          <label className="relative block">
            <span className="sr-only">Tìm cửa hàng</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, slug, email, chủ Shop…" className="min-h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15" />
          </label>
          <label>
            <span className="sr-only">Lọc theo trạng thái Shop</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C]">
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredShops.map((shop) => (
            <button type="button" key={shop.userId} onClick={() => { setSelectedId(shop.userId); setError('') }} className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#056F1C] sm:grid-cols-[44px_minmax(0,1fr)_auto_auto] sm:px-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]"><Store size={18} /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900">{shop.shopName}</span>
                <span className="mt-1 block truncate text-xs text-gray-500">{shop.contactName} · {shop.email} · {shop.slug}</span>
              </span>
              <StatusBadge status={shop.status} />
              <span className="hidden text-xs text-gray-500 sm:block">{formatDate(shop.statusChangedAt ?? shop.submittedAt)}</span>
            </button>
          ))}
          {!filteredShops.length && <p className="px-5 py-12 text-center text-sm text-gray-500">Không có Shop phù hợp với bộ lọc.</p>}
        </div>
      </section>

      {selectedShop && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/40" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSubmitting) setSelectedId('')
        }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="shop-detail-title" className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold text-[#056F1C]">Hồ sơ Shop · {selectedShop.userId}</p>
                <h2 id="shop-detail-title" className="mt-1 text-xl font-bold text-gray-950">{selectedShop.shopName}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedShop.slug}</p>
              </div>
              <button type="button" aria-label="Đóng chi tiết Shop" onClick={() => setSelectedId('')} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20} /></button>
            </header>
            <div className="flex-1 space-y-6 p-5 sm:p-7">
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
              <section>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedShop.status} />
                  <span className="text-xs text-gray-500">Nguồn: {selectedShop.statusSource === 'seller' ? 'Seller' : selectedShop.statusSource || 'hồ sơ'}</span>
                  <span className="text-xs text-gray-500">Cập nhật: {formatDate(selectedShop.statusChangedAt)}</span>
                </div>
                {selectedShop.statusReason && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">{selectedShop.statusReason}</p>}
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-xs text-gray-500">Chủ Shop</dt><dd className="mt-1 text-sm font-medium">{selectedShop.contactName || '—'}</dd></div>
                  <div><dt className="text-xs text-gray-500">Email</dt><dd className="mt-1 break-all text-sm font-medium">{selectedShop.email || '—'}</dd></div>
                  <div><dt className="text-xs text-gray-500">Số điện thoại</dt><dd className="mt-1 text-sm font-medium">{selectedShop.phone || '—'}</dd></div>
                  <div><dt className="text-xs text-gray-500">Ngày gửi hồ sơ</dt><dd className="mt-1 text-sm font-medium">{formatDate(selectedShop.submittedAt)}</dd></div>
                </dl>
              </section>

              {selectedShop.deletionRequest && (
                <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <h3 className="font-semibold text-gray-900">Yêu cầu xóa Shop</h3>
                  <p className="mt-1 text-sm text-gray-600">Trạng thái: {selectedShop.deletionRequest.status} · Gửi lúc {formatDate(selectedShop.deletionRequest.submittedAt)}</p>
                  {selectedShop.deletionRequest.rejectionReason && <p className="mt-2 text-sm text-red-800">Lý do từ chối: {selectedShop.deletionRequest.rejectionReason}</p>}
                  {selectedShop.deletionRequest.status === 'pending' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => openAction({ type: 'deletion', decision: 'approved' })} className="min-h-10 rounded-lg bg-[#056F1C] px-3 text-sm font-semibold text-white"><Check size={15} className="mr-1 inline" />Approve</button>
                      <button type="button" onClick={() => openAction({ type: 'deletion', decision: 'rejected' })} className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700">Reject</button>
                    </div>
                  )}
                </section>
              )}

              {selectedShop.appeal && (
                <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <h3 className="font-semibold text-gray-900">Khiếu nại của Seller · {selectedShop.appeal.status}</h3>
                  <p className="mt-2 text-sm"><strong>Lý do:</strong> {selectedShop.appeal.reason}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6"><strong>Giải trình:</strong> {selectedShop.appeal.explanation}</p>
                  <p className="mt-1 text-xs text-gray-500">Gửi lúc {formatDate(selectedShop.appeal.submittedAt)}</p>
                  {selectedShop.appeal.status === 'pending' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => openAction({ type: 'appeal', decision: 'approved' })} className="min-h-10 rounded-lg bg-[#056F1C] px-3 text-sm font-semibold text-white">Gỡ tạm khóa</button>
                      <button type="button" onClick={() => openAction({ type: 'appeal', decision: 'rejected' })} className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700">Giữ tạm khóa</button>
                    </div>
                  )}
                  {selectedShop.appeal.response && <p className="mt-2 text-sm text-gray-700">Phản hồi Admin: {selectedShop.appeal.response}</p>}
                </section>
              )}

              {['approved', 'suspended'].includes(selectedShop.status) && (
                <section>
                  <h3 className="font-semibold text-gray-900">Thay đổi trạng thái Shop</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">Thao tác này độc lập với trạng thái Report và không tự hủy đơn hàng hoặc sửa lịch sử giao dịch.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedShop.status === 'approved'
                      ? <button type="button" onClick={() => openAction({ type: 'status', status: 'suspended' })} className="min-h-10 rounded-lg border border-amber-300 px-3 text-sm font-semibold text-amber-900"><Clock3 size={15} className="mr-1 inline" />Suspend</button>
                      : <button type="button" onClick={() => openAction({ type: 'status', status: 'approved' })} className="min-h-10 rounded-lg border border-green-300 px-3 text-sm font-semibold text-green-800"><ShieldCheck size={15} className="mr-1 inline" />Gỡ suspend</button>}
                    <button type="button" onClick={() => openAction({ type: 'status', status: 'banned' })} className="min-h-10 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800"><Ban size={15} className="mr-1 inline" />Ban Shop</button>
                  </div>
                </section>
              )}

              <section>
                <h3 className="font-semibold text-gray-900">Audit Log</h3>
                {selectedAudit.length ? (
                  <ol className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 px-3">
                    {selectedAudit.map((entry) => (
                      <li key={entry.id} className="py-3">
                        <p className="text-sm font-semibold text-gray-800">{entry.action} · {entry.statusBefore} → {entry.statusAfter}</p>
                        <p className="mt-1 text-sm leading-5 text-gray-600">{entry.reason}</p>
                        <p className="mt-1 text-xs text-gray-500">{entry.actorId} · {formatDate(entry.occurredAt)}</p>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-2 text-sm text-gray-500">Chưa có sự kiện audit cho Shop.</p>}
              </section>
            </div>
          </aside>
        </div>
      )}
      {selectedShop && pendingAction && (
        <DecisionDialog
          title={pendingAction.type === 'status'
            ? `Xác nhận ${pendingAction.status === 'approved' ? 'gỡ suspend' : pendingAction.status === 'banned' ? 'ban' : 'suspend'} Shop`
            : pendingAction.type === 'deletion'
              ? `Xác nhận ${pendingAction.decision === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu xóa`
              : pendingAction.decision === 'approved' ? 'Gỡ suspend theo khiếu nại' : 'Giữ nguyên suspend'}
          description={`${selectedShop.shopName} · ${pendingAction.type === 'deletion' ? 'Ghi rõ lý do xử lý yêu cầu xóa.' : pendingAction.type === 'appeal' ? 'Phản hồi này sẽ hiển thị cho Seller.' : 'Lý do được lưu trong lịch sử trạng thái và audit.'}`}
          onClose={() => setPendingAction(null)}
          onSubmit={submitAction}
          submitting={isSubmitting}
          error={error}
          requireRestoreStatus={pendingAction.type === 'deletion' && pendingAction.decision === 'rejected'}
        />
      )}
    </main>
  )
}
