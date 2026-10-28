import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Ban,
  Check,
  ChevronDown,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { SortableTableHeader, sortRows, toggleSort } from '@/features/admin/components/SortableTableHeader'
import { CATEGORIES } from '@/mocks/categories'
import {
  getAdminUserDirectory,
  getAdminUserHistory,
  updateMockAdminUserStatus,
} from '@/mocks/adminUsers'
import { ensureMockSellerApplication, getSellerApplications, updateSellerShopStatus } from '@/mocks/seller'

const USER_STATUS_LABELS = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
  staff: 'Tài khoản nhân sự',
}

const SHOP_STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  suspended: 'Tạm khóa',
  banned: 'Đã khóa',
}

const SHOP_DIRECTORY_STATUSES = new Set(Object.keys(SHOP_STATUS_LABELS))

function formatDate(value, options = { dateStyle: 'medium' }) {
  if (!value) return 'Chưa có dữ liệu'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Chưa có dữ liệu'
    : new Intl.DateTimeFormat('vi-VN', options).format(date)
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi') || '?'
}

function getCategoryName(categoryId) {
  return CATEGORIES.find((category) => String(category.id) === String(categoryId))?.name ?? 'Chưa phân loại'
}

function getStatusClass(status) {
  if (status === 'active' || status === 'approved') return 'bg-emerald-50 text-emerald-800'
  if (status === 'locked' || status === 'suspended' || status === 'banned') return 'bg-red-50 text-red-700'
  if (status === 'pending') return 'bg-amber-50 text-amber-800'
  if (status === 'rejected') return 'bg-gray-100 text-gray-700'
  return 'bg-slate-100 text-slate-600'
}

function StatusBadge({ status, labels }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(status)}`}>
      {labels[status] ?? 'Chưa xác định'}
    </span>
  )
}

function Field({ label, value }) {
  return (
    <div className="min-w-0 border-b border-gray-100 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-gray-900">{value || 'Chưa có dữ liệu'}</dd>
    </div>
  )
}

function DetailDrawer({ item, kind, onClose, onChangeStatus, onChangeShopStatus }) {
  const [history, setHistory] = useState([])
  const [historyError, setHistoryError] = useState('')
  const isUser = kind === 'users'
  const isOwner = isUser && item.role === 'user'
  const shopHistory = Array.isArray(item.shopStatusHistory) ? [...item.shopStatusHistory].reverse() : []

  useEffect(() => {
    if (!isOwner) return
    try {
      setHistory(getAdminUserHistory(item.id))
      setHistoryError('')
    } catch (error) {
      setHistoryError(error.message)
    }
  }, [isOwner, item.id])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/35" onMouseDown={onClose}>
      <aside
        aria-labelledby="directory-detail-title"
        aria-modal="true"
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 pr-4">
            {isUser && (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-base font-bold text-emerald-900">
                {item.avatarUrl
                  ? <img alt={`Ảnh đại diện ${item.name}`} className="h-full w-full object-cover" src={item.avatarUrl} />
                  : getInitials(item.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {isUser ? 'Hồ sơ tài khoản' : 'Hồ sơ cửa hàng'}
              </p>
              <h2 id="directory-detail-title" className="mt-1 break-words text-xl font-bold text-gray-950">
                {isUser ? item.name : item.shopName}
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">{item.email}</p>
            </div>
          </div>
          <button
            aria-label="Đóng chi tiết"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            {isUser
              ? <StatusBadge labels={USER_STATUS_LABELS} status={item.status} />
              : <StatusBadge labels={SHOP_STATUS_LABELS} status={item.status} />}
            {isUser && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{item.role}</span>}
          </div>

          {isUser ? (
            <>
              <dl className="mt-5 divide-y divide-gray-100">
                <Field label="Mã tài khoản" value={item.id} />
                <Field label="Số điện thoại" value={item.phone} />
                <Field label="Giới tính" value={{ male: 'Nam', female: 'Nữ', other: 'Khác' }[item.gender] ?? item.gender} />
                <Field label="Ngày sinh" value={item.dob ? formatDate(item.dob, { dateStyle: 'long' }) : ''} />
                <Field label="Địa chỉ" value={item.address} />
                <Field label="Phương thức đăng nhập" value={item.loginProvider === 'google' ? 'Google' : 'Email và mật khẩu'} />
                <Field label="Ngày tham gia" value={formatDate(item.joinedAt)} />
                <Field label="Đơn hoàn thành" value={item.completedOrders ?? 'Không áp dụng'} />
                <Field label="Cảnh báo report" value={item.reportWarnings ?? 'Không áp dụng'} />
                {item.status === 'locked' && <Field label="Lý do khóa" value={item.statusReason} />}
                {item.statusChangedAt && <Field label="Cập nhật trạng thái lúc" value={formatDate(item.statusChangedAt, { dateStyle: 'medium', timeStyle: 'short' })} />}
                {item.isCurrentUser && <Field label="Phạm vi thao tác" value="Đây là tài khoản đang đăng nhập; không thể thay đổi trạng thái." />}
                {item.role !== 'user' && <Field label="Phạm vi thao tác" value="Tài khoản nhân sự chỉ xem tại màn hình này." />}
              </dl>

              {item.shippingAddresses?.length > 0 && (
                <section aria-labelledby="user-addresses-title" className="mt-6">
                  <h3 id="user-addresses-title" className="text-sm font-bold text-gray-900">Địa chỉ giao hàng</h3>
                  <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 px-3">
                    {item.shippingAddresses.map((address) => (
                      <li className="py-3" key={address.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{address.recipientName || item.name}</span>
                          {address.isDefault && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">Mặc định</span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{address.phone || item.phone || 'Chưa có số điện thoại'}</p>
                        <p className="mt-1 text-sm leading-5 text-gray-600">{address.address || 'Chưa có địa chỉ'}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {item.canManage && (
                <button
                  className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${item.status === 'locked'
                    ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:outline-emerald-700'
                    : 'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700'}`}
                  onClick={() => onChangeStatus(item)}
                  type="button"
                >
                  {item.status === 'locked' ? <ShieldCheck size={17} /> : <Ban size={17} />}
                  {item.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                </button>
              )}

              <section aria-labelledby="user-history-title" className="mt-8">
                <h3 id="user-history-title" className="text-sm font-bold text-gray-900">Lịch sử quản trị</h3>
                {historyError ? (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{historyError}</p>
                ) : history.length ? (
                  <ol className="mt-3 divide-y divide-gray-100">
                    {history.map((entry) => (
                      <li className="py-3" key={entry.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-800">{entry.action === 'lock' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản'}</span>
                          <time className="text-xs text-gray-500">{formatDate(entry.changedAt, { dateStyle: 'medium', timeStyle: 'short' })}</time>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{entry.reason}</p>
                        <p className="mt-1 text-xs text-gray-500">Thực hiện bởi {entry.actorId}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Chưa có thao tác quản trị.</p>
                )}
              </section>
            </>
          ) : (
            <>
              <dl className="mt-5 divide-y divide-gray-100">
                <Field label="Người đại diện" value={item.contactName} />
                <Field label="Email liên hệ" value={item.email} />
                <Field label="Số điện thoại" value={item.phone} />
                <Field label="Danh mục" value={getCategoryName(item.categoryId)} />
                <Field label={item.status === 'pending' ? 'Ngày gửi hồ sơ' : 'Ngày duyệt'} value={formatDate(item.reviewedAt ?? item.submittedAt, { dateStyle: 'medium', timeStyle: 'short' })} />
                <Field label="Địa chỉ lấy hàng" value={item.pickupAddress} />
                <Field label="Mô tả" value={item.description} />
                {item.reviewNote && <Field label="Ghi chú quyết định" value={item.reviewNote} />}
                {item.statusReason && <Field label="Lý do cập nhật trạng thái" value={item.statusReason} />}
                {item.statusChangedAt && <Field label="Cập nhật trạng thái lúc" value={formatDate(item.statusChangedAt, { dateStyle: 'medium', timeStyle: 'short' })} />}
              </dl>
              {['approved', 'suspended'].includes(item.status) && (
                <button
                  className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    item.status === 'suspended'
                      ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:outline-emerald-700'
                      : 'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700'
                  }`}
                  onClick={() => onChangeShopStatus(item)}
                  type="button"
                >
                  {item.status === 'suspended' ? <ShieldCheck size={17} /> : <Ban size={17} />}
                  {item.status === 'suspended' ? 'Mở lại shop' : 'Tạm khóa shop'}
                </button>
              )}
              {shopHistory.length > 0 && (
                <section aria-labelledby="shop-history-title" className="mt-8">
                  <h3 id="shop-history-title" className="text-sm font-bold text-gray-900">Lịch sử trạng thái shop</h3>
                  <ol className="mt-3 divide-y divide-gray-100">
                    {shopHistory.map((entry) => (
                      <li className="py-3" key={entry.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {entry.action === 'suspend' ? 'Đã tạm khóa shop' : 'Đã mở lại shop'}
                          </span>
                          <time className="text-xs text-gray-500">{formatDate(entry.changedAt, { dateStyle: 'medium', timeStyle: 'short' })}</time>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{entry.reason}</p>
                        {entry.actorId && <p className="mt-1 text-xs text-gray-500">Thực hiện bởi {entry.actorId}</p>}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {item.status === 'pending' && (
                <Link
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  onClick={onClose}
                  to="/admin/shops"
                >
                  Mở hàng đợi duyệt hồ sơ <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              )}
            </>
          )}
        </div>
        <p className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs leading-5 text-gray-500 sm:px-7">
          {isUser
            ? 'Trạng thái khóa hiện chỉ được ghi nhận tại trang quản trị; quyền đăng nhập chưa bị ảnh hưởng.'
            : 'Không hiển thị số CCCD tại màn hình này. Quyết định duyệt hồ sơ được thực hiện trong hàng đợi chuyên biệt.'}
        </p>
      </aside>
    </div>
  )
}

function StatusChangeDialog({ user, nextStatus, onCancel, onSubmit, isSubmitting, error }) {
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState('')
  const isLocking = nextStatus === 'locked'

  function submit(event) {
    event.preventDefault()
    if (!reason.trim()) {
      setValidationError('Nhập lý do để lưu thao tác quản trị.')
      return
    }
    setValidationError('')
    onSubmit(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-gray-950/45 p-4" onMouseDown={onCancel}>
      <form
        aria-labelledby="status-dialog-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
        role="dialog"
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${isLocking ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {isLocking ? <Ban size={19} /> : <ShieldCheck size={19} />}
          </div>
          <div>
            <h2 id="status-dialog-title" className="text-lg font-bold text-gray-950">
              {isLocking ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Bạn có chắc muốn {isLocking ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-gray-900">{user.name}</strong>?
            </p>
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-gray-800" htmlFor="admin-status-reason">
          Lý do thao tác <span aria-hidden="true" className="text-red-700">*</span>
        </label>
        <textarea
          aria-describedby="admin-status-reason-error"
          aria-invalid={Boolean(validationError || error)}
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-2 outline-transparent outline-offset-1 transition hover:bg-gray-50 focus-visible:outline-emerald-700"
          id="admin-status-reason"
          onChange={(event) => {
            setReason(event.target.value)
            setValidationError('')
          }}
          placeholder="Ghi rõ căn cứ cho thao tác"
          required
          value={reason}
        />
        {(validationError || error) && (
          <p className="mt-2 text-sm text-red-700" id="admin-status-reason-error" role="alert">{validationError || error}</p>
        )}
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Trạng thái khóa hiện chỉ được ghi nhận tại trang quản trị; quyền đăng nhập chưa bị ảnh hưởng.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Quay lại
          </button>
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isLocking ? 'bg-red-700 hover:bg-red-800 focus-visible:outline-red-700' : 'bg-emerald-800 hover:bg-emerald-900 focus-visible:outline-emerald-700'}`}
            disabled={isSubmitting || !reason.trim()}
            type="submit"
          >
            {isSubmitting ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Check aria-hidden="true" size={16} />}
            {isSubmitting ? 'Đang lưu' : isLocking ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ShopStatusChangeDialog({ shop, nextStatus, onCancel, onSubmit, isSubmitting, error }) {
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState('')
  const isSuspending = nextStatus === 'suspended'

  function submit(event) {
    event.preventDefault()
    if (!reason.trim()) {
      setValidationError('Nhập lý do để lưu thay đổi trạng thái shop.')
      return
    }
    setValidationError('')
    onSubmit(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-gray-950/45 p-4" onMouseDown={onCancel}>
      <form
        aria-labelledby="shop-status-dialog-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
        role="dialog"
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${isSuspending ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {isSuspending ? <Ban size={19} /> : <ShieldCheck size={19} />}
          </div>
          <div>
            <h2 id="shop-status-dialog-title" className="text-lg font-bold text-gray-950">
              {isSuspending ? 'Xác nhận tạm khóa shop' : 'Xác nhận mở lại shop'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {isSuspending
                ? <>Shop <strong className="text-gray-900">{shop.shopName}</strong> sẽ ngừng bán. Chủ shop vẫn đăng nhập được nhưng chỉ thấy thông báo shop đang bị khóa.</>
                : <>Shop <strong className="text-gray-900">{shop.shopName}</strong> sẽ được hoạt động trở lại.</>}
            </p>
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-gray-800" htmlFor="admin-shop-status-reason">
          {isSuspending ? 'Lý do tạm khóa' : 'Lý do mở lại'} <span aria-hidden="true" className="text-red-700">*</span>
        </label>
        <textarea
          aria-describedby="admin-shop-status-reason-error"
          aria-invalid={Boolean(validationError || error)}
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-2 outline-transparent outline-offset-1 transition hover:bg-gray-50 focus-visible:outline-emerald-700"
          id="admin-shop-status-reason"
          onChange={(event) => {
            setReason(event.target.value)
            setValidationError('')
          }}
          placeholder="Ghi rõ căn cứ cho thao tác"
          required
          value={reason}
        />
        {(validationError || error) && (
          <p className="mt-2 text-sm text-red-700" id="admin-shop-status-reason-error" role="alert">{validationError || error}</p>
        )}
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Thao tác chỉ áp dụng cho shop này; tài khoản chủ shop vẫn đăng nhập được.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Quay lại
          </button>
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isSuspending ? 'bg-red-700 hover:bg-red-800 focus-visible:outline-red-700' : 'bg-emerald-800 hover:bg-emerald-900 focus-visible:outline-emerald-700'}`}
            disabled={isSubmitting || !reason.trim()}
            type="submit"
          >
            {isSubmitting ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Check aria-hidden="true" size={16} />}
            {isSubmitting ? 'Đang lưu' : isSuspending ? 'Xác nhận tạm khóa' : 'Xác nhận mở lại'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const activeTab = 'users'
  const [query, setQuery] = useState('')
  const [userRole, setUserRole] = useState('all')
  const [userStatus, setUserStatus] = useState('all')
  const [userSort, setUserSort] = useState(null)
  const [shopStatus, setShopStatus] = useState('all')
  const [shopCategory, setShopCategory] = useState('all')
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [selected, setSelected] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [shopStatusTarget, setShopStatusTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [pageError, setPageError] = useState('')

  function refreshData() {
    try {
      ensureMockSellerApplication()
      setUsers(getAdminUserDirectory(user?.id, user))
      setShops(getSellerApplications().filter((shop) => SHOP_DIRECTORY_STATUSES.has(shop.status)))
      setPageError('')
    } catch (error) {
      setPageError(error.message || 'Không thể tải danh sách người dùng và cửa hàng.')
    }
  }

  useEffect(() => {
    refreshData()
    const refreshOnStorage = (event) => {
      if (!event.key || event.key.startsWith('navishop.mock')) refreshData()
    }
    window.addEventListener('storage', refreshOnStorage)
    return () => window.removeEventListener('storage', refreshOnStorage)
  }, [user?.id])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    const filtered = users.filter((account) => {
      const matchesQuery = !normalizedQuery
        || [account.name, account.email, account.id].some((value) => value.toLocaleLowerCase('vi').includes(normalizedQuery))
      return matchesQuery
        && (userRole === 'all' || account.role === userRole)
        && (userStatus === 'all' || account.status === userStatus)
    })
    return sortRows(filtered, userSort, (account, key) => {
      if (key === 'joinedAt') return account.joinedAt ? new Date(account.joinedAt).getTime() : null
      if (key === 'completedOrders') return account.completedOrders ?? null
      if (key === 'status') return USER_STATUS_LABELS[account.status] ?? account.status
      return account[key] ?? null
    })
  }, [query, userRole, userSort, userStatus, users])

  const filteredShops = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    return shops.filter((shop) => {
      const matchesQuery = !normalizedQuery
        || [shop.shopName, shop.contactName, shop.email].some((value) => value?.toLocaleLowerCase('vi').includes(normalizedQuery))
      return matchesQuery
        && (shopStatus === 'all' || shop.status === shopStatus)
        && (shopCategory === 'all' || String(shop.categoryId) === shopCategory)
    })
  }, [query, shopCategory, shopStatus, shops])

  function openStatusDialog(account) {
    setStatusTarget({ user: account, nextStatus: account.status === 'locked' ? 'active' : 'locked' })
    setStatusError('')
  }

  function openShopStatusDialog(shop) {
    setShopStatusTarget({ shop, nextStatus: shop.status === 'suspended' ? 'approved' : 'suspended' })
    setStatusError('')
  }

  function saveUserStatus(reason) {
    if (!statusTarget || isSubmitting) return
    setIsSubmitting(true)
    setStatusError('')
    try {
      updateMockAdminUserStatus(statusTarget.user.id, statusTarget.nextStatus, reason, user?.id)
      refreshData()
      const updatedUser = getAdminUserDirectory(user?.id).find((account) => account.id === statusTarget.user.id)
      setSelected(updatedUser ? { kind: 'users', item: updatedUser } : null)
      setStatusTarget(null)
    } catch (error) {
      setStatusError(error.message || 'Không thể lưu thay đổi trạng thái tài khoản.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function saveShopStatus(reason) {
    if (!shopStatusTarget || isSubmitting) return
    setIsSubmitting(true)
    setStatusError('')
    try {
      updateSellerShopStatus(shopStatusTarget.shop.userId, shopStatusTarget.nextStatus, reason, user?.id)
      refreshData()
      const updatedShop = getSellerApplications().find((shop) => shop.userId === shopStatusTarget.shop.userId)
      setSelected(updatedShop ? { kind: 'shops', item: updatedShop } : null)
      setShopStatusTarget(null)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái shop.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1500px] pb-10">
      <div className="flex flex-col gap-5 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">Quản lý người dùng</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Tra cứu tài khoản, vai trò, trạng thái và lịch sử thao tác quản trị.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_auto] lg:items-end">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-xs font-semibold text-gray-700">Tìm {activeTab === 'users' ? 'tài khoản' : 'cửa hàng'}</span>
          <span className="relative block">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-2 outline-transparent outline-offset-1 transition placeholder:text-gray-400 hover:bg-gray-50 focus-visible:outline-emerald-700"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeTab === 'users' ? 'Tên, email hoặc mã tài khoản' : 'Tên shop, người đại diện hoặc email'}
              type="search"
              value={query}
            />
          </span>
        </label>
        {activeTab === 'users' ? (
          <>
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Vai trò</span>
              <select className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-800 outline-2 outline-transparent outline-offset-1 focus-visible:outline-emerald-700 sm:min-w-40" onChange={(event) => setUserRole(event.target.value)} value={userRole}>
                <option value="all">Tất cả vai trò</option>
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-gray-500" size={16} />
            </label>
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Trạng thái</span>
              <select className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-800 outline-2 outline-transparent outline-offset-1 focus-visible:outline-emerald-700 sm:min-w-44" onChange={(event) => setUserStatus(event.target.value)} value={userStatus}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
                <option value="staff">Tài khoản nhân sự</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-gray-500" size={16} />
            </label>
          </>
        ) : (
          <>
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Trạng thái shop</span>
              <select className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-800 outline-2 outline-transparent outline-offset-1 focus-visible:outline-emerald-700 sm:min-w-40" onChange={(event) => setShopStatus(event.target.value)} value={shopStatus}>
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(SHOP_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-gray-500" size={16} />
            </label>
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Danh mục</span>
              <select className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-800 outline-2 outline-transparent outline-offset-1 focus-visible:outline-emerald-700 sm:min-w-48" onChange={(event) => setShopCategory(event.target.value)} value={shopCategory}>
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-gray-500" size={16} />
            </label>
          </>
        )}
      </div>

      {pageError && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{pageError}</p>}

      <div aria-labelledby={`directory-tab-${activeTab}`} className="mt-5" role="tabpanel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{activeTab === 'users' ? filteredUsers.length : filteredShops.length}</strong> {activeTab === 'users' ? 'tài khoản' : 'cửa hàng'}</p>
        </div>

        {activeTab === 'users' ? (
          filteredUsers.length ? (
            <>
              <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <SortableTableHeader className="px-4 py-3" label="Tài khoản" onSort={() => setUserSort((current) => toggleSort(current, 'name'))} sortKey="name" sortState={userSort} />
                      <SortableTableHeader className="px-4 py-3" label="Vai trò" onSort={() => setUserSort((current) => toggleSort(current, 'role'))} sortKey="role" sortState={userSort} />
                      <SortableTableHeader className="px-4 py-3" label="Ngày tham gia" onSort={() => setUserSort((current) => toggleSort(current, 'joinedAt'))} sortKey="joinedAt" sortState={userSort} />
                      <SortableTableHeader className="px-4 py-3" label="Đơn hoàn thành" onSort={() => setUserSort((current) => toggleSort(current, 'completedOrders'))} sortKey="completedOrders" sortState={userSort} />
                      <SortableTableHeader className="px-4 py-3" label="Trạng thái" onSort={() => setUserSort((current) => toggleSort(current, 'status'))} sortKey="status" sortState={userSort} />
                      <th className="px-4 py-3"><span className="sr-only">Chi tiết</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((account) => (
                      <tr className="transition hover:bg-gray-50/70" key={account.id}>
                        <td className="px-4 py-3.5">
                          <button className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'users', item: account })} type="button">
                            <span className="block text-sm font-semibold text-gray-900">{account.name}{account.isCurrentUser && <span className="ml-2 text-xs font-medium text-gray-500">(bạn)</span>}</span>
                            <span className="mt-0.5 block text-xs text-gray-500">{account.email} · {account.id}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-700">{account.role}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(account.joinedAt)}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-700">{account.completedOrders ?? '—'}</td>
                        <td className="px-4 py-3.5"><StatusBadge labels={USER_STATUS_LABELS} status={account.status} /></td>
                        <td className="px-4 py-3.5 text-right">
                          <button className="min-h-10 rounded-md px-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'users', item: account })} type="button">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
                {filteredUsers.map((account) => (
                  <li className="py-4" key={account.id}>
                    <button className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'users', item: account })} type="button">
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block break-words text-sm font-semibold text-gray-950">{account.name}{account.isCurrentUser && <span className="ml-2 text-xs font-medium text-gray-500">(bạn)</span>}</span>
                          <span className="mt-1 block break-all text-xs text-gray-500">{account.email}</span>
                          <span className="mt-1 block text-xs text-gray-500">{account.id} · {account.role}</span>
                        </span>
                        <StatusBadge labels={USER_STATUS_LABELS} status={account.status} />
                      </span>
                      <span className="mt-3 flex justify-between text-xs text-gray-600"><span>Tham gia {formatDate(account.joinedAt)}</span><span>Đơn xong: {account.completedOrders ?? '—'}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState title="Không tìm thấy tài khoản" detail="Thử đổi từ khóa hoặc xóa một bộ lọc." />
          )
        ) : filteredShops.length ? (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
              <table className="w-full min-w-[830px] border-collapse text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Cửa hàng</th>
                    <th className="px-4 py-3">Người đại diện</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Ngày gửi</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3"><span className="sr-only">Chi tiết</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredShops.map((shop) => (
                    <tr className="transition hover:bg-gray-50/70" key={shop.userId}>
                      <td className="px-4 py-3.5">
                        <button className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'shops', item: shop })} type="button">
                          <span className="block text-sm font-semibold text-gray-900">{shop.shopName || 'Chưa đặt tên'}</span>
                          <span className="mt-0.5 block text-xs text-gray-500">{shop.email}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{shop.contactName || 'Chưa có dữ liệu'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{getCategoryName(shop.categoryId)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(shop.submittedAt)}</td>
                      <td className="px-4 py-3.5"><StatusBadge labels={SHOP_STATUS_LABELS} status={shop.status} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="min-h-10 rounded-md px-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'shops', item: shop })} type="button">Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
              {filteredShops.map((shop) => (
                <li className="py-4" key={shop.userId}>
                  <button className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setSelected({ kind: 'shops', item: shop })} type="button">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-semibold text-gray-950">{shop.shopName || 'Chưa đặt tên'}</span>
                        <span className="mt-1 block break-all text-xs text-gray-500">{shop.email}</span>
                        <span className="mt-1 block text-xs text-gray-500">{shop.contactName || 'Chưa có người đại diện'} · {getCategoryName(shop.categoryId)}</span>
                      </span>
                      <StatusBadge labels={SHOP_STATUS_LABELS} status={shop.status} />
                    </span>
                    <span className="mt-3 block text-xs text-gray-600">Gửi hồ sơ {formatDate(shop.submittedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState title="Không tìm thấy cửa hàng" detail="Thử đổi từ khóa hoặc xóa một bộ lọc." />
        )}
      </div>

      {selected && (
        <DetailDrawer
          item={selected.item}
          kind={selected.kind}
          onChangeStatus={openStatusDialog}
          onChangeShopStatus={openShopStatusDialog}
          onClose={() => setSelected(null)}
        />
      )}
      {statusTarget && (
        <StatusChangeDialog
          error={statusError}
          isSubmitting={isSubmitting}
          nextStatus={statusTarget.nextStatus}
          onCancel={() => {
            if (!isSubmitting) {
              setStatusTarget(null)
              setStatusError('')
            }
          }}
          onSubmit={saveUserStatus}
          user={statusTarget.user}
        />
      )}
      {shopStatusTarget && (
        <ShopStatusChangeDialog
          error={statusError}
          isSubmitting={isSubmitting}
          nextStatus={shopStatusTarget.nextStatus}
          onCancel={() => {
            if (!isSubmitting) {
              setShopStatusTarget(null)
              setStatusError('')
            }
          }}
          onSubmit={saveShopStatus}
          shop={shopStatusTarget.shop}
        />
      )}
    </section>
  )
}

function EmptyState({ title, detail }) {
  return (
    <div className="border-y border-gray-200 py-14 text-center">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
    </div>
  )
}
