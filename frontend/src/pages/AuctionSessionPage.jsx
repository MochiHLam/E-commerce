import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, ImageIcon } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getMockLiveSession } from '@/data/auction/sessionMock'
import { SESSION_ITEM_STATUS, formatHourMinute, formatShortDateTime, formatVND } from '@/lib/auction'
// TODO: bật lại guard khi có auth thật
// import { Navigate, useLocation } from 'react-router-dom'
// import { useAuth } from '@/context/AuthContext'

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

  // TODO: thay bằng GET /api/auction/sessions/:sessionId
  const session = getMockLiveSession(sessionId)
  if (!session) return <NotFoundState />

  const items = session.items
  const count = (state) => items.filter((i) => i.state === state).length

  const tabs = TABS.filter((t) => t.key === 'all' || count(t.key) > 0)
  const visible = filter === 'all' ? items : items.filter((i) => i.state === filter)

  const stats = [
    ['Tổng vật phẩm', items.length],
    ['Đang đấu giá',  count('bidding')],
    ['Chờ lên sàn',   count('queued')],
    ['Đã kết thúc',   count('sold') + count('unsold')],
  ]

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

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#056F1C]">{value}</p>
            </div>
          ))}
        </div>

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
              {t.label} {t.key !== 'all' && count(t.key) > 0 ? count(t.key) : t.key === 'all' ? items.length : ''}
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
