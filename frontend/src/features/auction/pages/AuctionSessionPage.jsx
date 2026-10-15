import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, ImageIcon } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import useAuctionSession from '@/features/auction/hooks/useAuctionSession'
import { SESSION_ITEM_STATUS, formatHourMinute, formatShortDateTime, formatVND } from '@/features/auction/lib/auction'

const LAYOUT = 'max-w-[1200px] mx-auto px-5'

// ─── Countdown ───────────────────────────────────────────────────────────────
function useCountdown(endTime) {
  const [diff, setDiff] = useState(() => Math.max(0, new Date(endTime) - Date.now()))

  useEffect(() => {
    if (!endTime) return
    const tick = () => setDiff(Math.max(0, new Date(endTime) - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  return { h, m, s, done: diff === 0 }
}

function CountdownBadge({ endTime }) {
  const { h, m, s, done } = useCountdown(endTime)
  if (done) return <span className="text-xs font-semibold text-red-600">Đã kết thúc</span>
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
      <Clock className="h-3 w-3" />
      {h !== '00' ? `${h}:` : ''}{m}:{s}
    </span>
  )
}

function SessionConfiguration({ configuration, itemCount }) {
  const stats = [
    {
      label: 'Mỗi vật phẩm',
      value: configuration?.itemDurationMinutes,
      unit: 'phút',
    },
    {
      label: 'Gia hạn cuối giờ',
      value: configuration?.extensionDurationMinutes,
      unit: 'phút',
    },
    {
      label: 'Tổng số vật phẩm',
      value: itemCount,
      unit: '',
    },
  ].filter(({ value }) => Number.isFinite(value) && value > 0)

  if (!stats.length) return null

  return (
    <section aria-label="Thông số phiên đấu giá" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(({ label, value, unit }) => (
        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-2xl font-extrabold text-[#056F1C]">{value}{unit === '+' ? unit : unit ? ` ${unit}` : ''}</p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </div>
      ))}
    </section>
  )
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, sessionId }) {
  const meta = SESSION_ITEM_STATUS[item.state] ?? SESSION_ITEM_STATUS.queued
  const isBidding = item.state === 'bidding'
  const isQueued  = item.state === 'queued'

  return (
    <Link
      to={`/auction/${sessionId}/items/${item.itemId}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md ${
        isBidding ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
      }`}
    >
      {/* Ảnh + badge */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Pulse dot cho bidding */}
        {isBidding && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
          </span>
        )}

        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 font-semibold leading-snug text-gray-900">{item.title}</p>

        <div className="mt-auto space-y-1.5 text-sm">
          {/* Đang đấu: hiện giá hiện tại + countdown */}
          {isBidding && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Giá hiện tại:</span>
                <span className="font-bold text-amber-700">{formatVND(item.currentPrice ?? item.startingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Còn lại:</span>
                <CountdownBadge endTime={item.endTime} />
              </div>
            </>
          )}

          {/* Chờ: hiện giá khởi điểm + giờ lên sàn */}
          {isQueued && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Giá khởi điểm:</span>
                <span className="font-medium text-gray-900">{formatVND(item.startingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Lên sàn lúc:</span>
                <span className="font-medium text-gray-900">{formatHourMinute(item.startTime)}</span>
              </div>
            </>
          )}

          {/* Đã xong: giá chốt */}
          {(item.state === 'sold' || item.state === 'unsold') && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{item.state === 'sold' ? 'Giá trúng:' : 'Giá khởi điểm:'}</span>
              <span className={`font-medium ${item.state === 'sold' ? 'text-[#056F1C]' : 'text-gray-500'}`}>
                {formatVND(item.state === 'sold' ? item.currentPrice : item.startingPrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFoundState() {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy phiên đấu giá</h1>
        <p className="mt-2 text-gray-500">Phiên không tồn tại hoặc đã kết thúc.</p>
        <Link to="/auction/about" className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại trang đấu giá
        </Link>
      </div>
    </main>
  )
}

function NotRegistered() {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Bạn chưa đăng ký tham gia phiên này</h1>
        <p className="mt-2 text-gray-500">Phiên đấu giá đã bắt đầu nên hiện không thể đăng ký thêm.</p>
        <Link to="/auction/about" className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại trang đấu giá
        </Link>
      </div>
    </main>
  )
}

function CancelledNotice() {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Phiên đấu giá đã bị hủy</h1>
        <p className="mt-2 text-gray-500">Phiên đã bị hủy trước khi bắt đầu và sẽ không diễn ra.</p>
        <Link to="/auction/about" className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại trang đấu giá
        </Link>
      </div>
    </main>
  )
}

function RegistrationPanel({ session, onChange }) {
  const [confirm, setConfirm] = useState(null)
  const fee = session.registrationFee
  const balance = session.walletAvailable ?? 0
  const short = Math.max(0, fee - balance)

  const handleConfirm = () => {
    // TODO: POST /auction/sessions/:id/register hoặc /cancel-registration
    onChange(confirm === 'register')
    setConfirm(null)
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          <p>Phí đăng ký: <strong className="text-gray-900">{fee > 0 ? formatVND(fee) : 'Miễn phí'}</strong></p>
          {short > 0 && !session.isRegistered && (
            <p className="mt-1 text-red-600">Còn thiếu {formatVND(short)}. Nạp thêm để đăng ký.</p>
          )}
        </div>
        {session.isRegistered ? (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#056F1C]">Đã đăng ký</span>
            <button type="button" onClick={() => setConfirm('cancel')} className="text-sm font-semibold text-gray-600 hover:underline">
              Hủy đăng ký
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={short > 0}
            onClick={() => setConfirm('register')}
            className="rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đăng ký tham gia
          </button>
        )}
      </div>

      {confirm && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900">
              {confirm === 'register' ? 'Xác nhận đăng ký' : 'Xác nhận hủy đăng ký'}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {confirm === 'register'
                ? `Phí ${formatVND(fee)} sẽ được trừ ngay vào ví. Bạn hủy được trong thời gian xem trước và được hoàn đủ. Phiên bắt đầu thì không hủy và không hoàn.`
                : `Bạn sẽ được hoàn đủ ${formatVND(fee)} vào ví.`}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirm(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600">
                Đóng
              </button>
              <button type="button" onClick={handleConfirm} className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'bidding', label: 'Đang đấu giá' },
  { key: 'queued',  label: 'Chờ lên sàn' },
  { key: 'sold',    label: 'Đã bán' },
  { key: 'unsold',  label: 'Không thành' },
]

export default function AuctionSessionPage() {
  const { id: sessionId } = useParams()
  const [filter, setFilter] = useState('all')
  const { session, setRegistered } = useAuctionSession(sessionId)
  if (!session) return <NotFoundState />
  if (session.status === 'closed') {
    return session.closedReason === 'cancelled_pending'
      ? <CancelledNotice />
      : <Navigate to={`/auction/history/${sessionId}`} replace />
  }
  if (session.status === 'active' && !session.isRegistered) return <NotRegistered />

  const items = session.items
  const count = (state) => items.filter((i) => i.state === state).length
  const tabCount = (key) => (key === 'all' ? items.length : count(key))

  const tabs = TABS.filter((t) => t.key === 'all' || count(t.key) > 0)
  const visible = filter === 'all' ? items : items.filter((i) => i.state === filter)

  const isPending = session.status === 'pending'

  return (
    <main className="bg-gray-50 py-12">
      <div className={LAYOUT}>
        {/* Back */}
        <Link to="/auction/about" className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang đấu giá
        </Link>

        {/* Header */}
        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPending ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isPending ? 'Sắp diễn ra' : 'Đang diễn ra'}
            </span>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {isPending ? 'Bắt đầu lúc:' : 'Bắt đầu từ:'} {formatShortDateTime(session.startTime)}
            </span>
            {session.registrationFee > 0 && (
              <span className="inline-flex items-center gap-1.5">
                Phí đăng ký: <strong className="text-gray-700">{formatVND(session.registrationFee)}</strong>
              </span>
            )}
          </p>
        </header>

        <SessionConfiguration configuration={session.configuration} itemCount={items.length} />

        {isPending && <RegistrationPanel session={session} onChange={setRegistered} />}

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Lọc vật phẩm">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === t.key
                  ? 'border-[#056F1C] bg-[#056F1C] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#056F1C]'
              }`}
            >
              {t.label} {tabCount(t.key)}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.itemId}>
              <ItemCard item={item} sessionId={sessionId} />
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-gray-500">Không có vật phẩm nào trong danh mục này.</p>
        )}

        <p className="mt-6 text-sm text-gray-400">
          Bấm vào vật phẩm để xem chi tiết. Đấu giá miễn hủy, miễn trả sau khi chốt.
        </p>
      </div>
    </main>
  )
}
