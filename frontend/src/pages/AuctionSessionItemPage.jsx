import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Hash, ImageIcon, Layers, Tag, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getMockLiveItem } from '@/data/auction/sessionMock'
import { SESSION_ITEM_STATUS, formatShortDateTime, formatVND } from '@/lib/auction'

const LAYOUT = 'max-w-[860px] mx-auto px-5'

// ─── Countdown ────────────────────────────────────────────────────────────────
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

function LiveCountdown({ endTime }) {
  const { h, m, s, done } = useCountdown(endTime)
  if (done) return <span className="text-base font-bold text-red-600">Đã kết thúc</span>
  return (
    <span className="inline-flex items-center gap-1.5 text-base font-bold text-amber-700">
      <Clock className="h-4 w-4" />
      {h !== '00' ? `${h}:` : ''}{m}:{s}
    </span>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DataCard({ icon: Icon, label, value, strong }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`mt-1 text-base font-bold ${strong ? 'text-[#056F1C]' : 'text-gray-900'}`}>{value}</p>
      </div>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
    </div>
  )
}

function CardGroup({ title, children }) {
  return (
    <div className="mt-6">
      {title && <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>}
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function NotFoundState({ sessionId }) {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy vật phẩm</h1>
        <Link to={`/auction/${sessionId}`} className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    </main>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuctionSessionItemPage() {
  const { id: sessionId, itemId } = useParams()

  // TODO: thay bằng API GET /api/auction/sessions/:sessionId/items/:itemId
  const found = getMockLiveItem(sessionId, itemId)
  if (!found) return <NotFoundState sessionId={sessionId} />

  const { session, item, index } = found
  const state = item.state // 'queued' | 'bidding' | 'sold' | 'unsold'
  const meta = SESSION_ITEM_STATUS[state] ?? SESSION_ITEM_STATUS.queued
  const prev = session.items[index - 1]
  const next = session.items[index + 1]
  const sessionPath = `/auction/${sessionId}`
  const itemPath = (i) => `${sessionPath}/items/${i.itemId}`

  return (
    <main className="bg-gray-50 py-12">
      <div className={LAYOUT}>
        {/* Breadcrumb + nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={sessionPath} className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Món {index + 1}/{session.items.length}</span>
            {prev ? (
              <Link to={itemPath(prev)} aria-label="Món trước" className="rounded border border-gray-300 bg-white p-1.5 hover:border-[#056F1C]">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="rounded border border-gray-200 p-1.5 text-gray-300"><ChevronLeft className="h-4 w-4" /></span>
            )}
            {next ? (
              <Link to={itemPath(next)} aria-label="Món sau" className="rounded border border-gray-300 bg-white p-1.5 hover:border-[#056F1C]">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="rounded border border-gray-200 p-1.5 text-gray-300"><ChevronRight className="h-4 w-4" /></span>
            )}
          </div>
        </div>

        {/* Tiêu đề + trạng thái */}
        <h1 className="mt-5 text-xl font-bold text-gray-900">Chi tiết tài sản đấu giá</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          {state === 'bidding' && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
            </span>
          )}
          {state !== 'bidding' && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
          )}
        </div>

        {/* Ảnh */}
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="mt-5 w-full rounded-2xl object-cover" style={{ maxHeight: 340 }} />
        ) : (
          <div className="mt-5 flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-100">
            <ImageIcon className="h-14 w-14 text-gray-300" />
          </div>
        )}

        {/* Tên + mã */}
        <p className="mt-5 text-lg font-bold leading-snug text-gray-900">{item.title}</p>
        <p className="mt-1 text-xs text-gray-400">Mã tài sản: {item.itemId}</p>

        {/* Thông tin tài sản */}
        <CardGroup title="Thông tin tài sản">
          <DataCard icon={Tag}        label="Giá khởi điểm" value={formatVND(item.startingPrice)} />
          <DataCard icon={TrendingUp} label="Bước giá"       value={formatVND(item.baseBidIncrement)} />
          <DataCard icon={Wallet}     label="Giá mua ngay"   value={formatVND(item.buyNowPrice)} />
          <DataCard icon={Layers}     label="Loại vật phẩm"  value={item.category} />
        </CardGroup>

        {/* Thời gian */}
        <CardGroup title="Thời gian đấu giá">
          <DataCard icon={Clock} label="Thời gian bắt đầu"  value={formatShortDateTime(item.startTime)} />
          <DataCard icon={Clock} label="Thời gian kết thúc" value={formatShortDateTime(item.endTime)} />
        </CardGroup>

        {/* Đang đấu giá: hiện đồng hồ + giá hiện tại */}
        {state === 'bidding' && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Diễn biến hiện tại</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-600">Giá hiện tại</p>
                <p className="mt-1 text-base font-bold text-amber-700">{formatVND(item.currentPrice ?? item.startingPrice)}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-600">Thời gian còn lại</p>
                <div className="mt-1"><LiveCountdown endTime={item.endTime} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Đã thành: kết quả giống lịch sử */}
        {state === 'sold' && (
          <CardGroup title="Kết quả đấu giá">
            <DataCard icon={Tag}    label="Giá khởi điểm"     value={formatVND(item.startingPrice)} />
            <DataCard icon={Trophy} label="Giá trúng đấu giá" value={formatVND(item.currentPrice)} strong />
            <DataCard icon={Hash}   label="Hình thức chốt"    value={item.soldVia === 'buy_now' ? 'Mua ngay' : 'Đặt giá'} />
            <DataCard icon={Hash}   label="Mã người trúng"    value={item.highestBidder ?? '—'} />
          </CardGroup>
        )}

        {/* Không thành */}
        {state === 'unsold' && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Kết quả đấu giá</p>
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm">✕</span>
              <p className="font-semibold text-red-700">Đấu giá không thành</p>
            </div>
          </div>
        )}

        {/* Chờ lên sàn */}
        {state === 'queued' && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Vật phẩm này chưa đến giờ lên sàn. Quay lại lúc <strong>{formatShortDateTime(item.startTime)}</strong> để đặt giá.
          </div>
        )}
      </div>
    </main>
  )
}
