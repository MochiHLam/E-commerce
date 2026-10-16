import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Hash, Minus, Plus, Tag, Trophy, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuctionItemCardGroup, AuctionItemDataCard, AuctionItemDetails, AuctionItemLayout } from '@/features/auction/components/AuctionItemLayout'
import { useAuth } from '@/context/AuthContext'
import { getMockLiveItem, recordMockAuctionEnd, recordMockLiveBid } from '@/mocks/auction/sessionMock'
import { formatVND } from '@/lib/format'
import { SESSION_ITEM_STATUS, formatShortDateTime } from '@/features/auction/lib/auction'

const LAYOUT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-0'

function formatBidTime(iso) {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

const DIGIT_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
const NUMBER_UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']

function readThreeDigits(value, includeHundreds) {
  const hundreds = Math.floor(value / 100)
  const tens = Math.floor((value % 100) / 10)
  const units = value % 10
  const words = []

  if (hundreds > 0 || includeHundreds) words.push(`${DIGIT_WORDS[hundreds]} trăm`)
  if (tens > 1) {
    words.push(`${DIGIT_WORDS[tens]} mươi`)
    if (units === 1) words.push('mốt')
    else if (units === 4) words.push('tư')
    else if (units === 5) words.push('lăm')
    else if (units > 0) words.push(DIGIT_WORDS[units])
  } else if (tens === 1) {
    words.push('mười')
    if (units > 0) words.push(units === 5 ? 'lăm' : DIGIT_WORDS[units])
  } else if (units > 0) {
    if (hundreds > 0 || includeHundreds) words.push('lẻ')
    words.push(DIGIT_WORDS[units])
  }

  return words.join(' ')
}

function amountInWords(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) return ''
  if (amount === 0) return 'Không đồng'

  const groups = []
  for (let remaining = amount; remaining > 0; remaining = Math.floor(remaining / 1000)) {
    groups.push(remaining % 1000)
  }

  return `${groups
    .map((group, index) => group > 0
      ? `${readThreeDigits(group, index < groups.length - 1)} ${NUMBER_UNITS[index]}`.trim()
      : '')
    .filter(Boolean)
    .reverse()
    .join(' ')} đồng`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function BiddingPanel({ item, onAuctionEnd, className = 'mt-6' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentPrice, setCurrentPrice] = useState(item.currentPrice ?? item.startingPrice)
  const [bids, setBids] = useState(item.bids ?? [])
  const [highestBidderId, setHighestBidderId] = useState(item.highestBidderId)
  const [highestBidder, setHighestBidder] = useState(item.highestBidder)
  const [endTime, setEndTime] = useState(item.endTime)
  const [stepMultiplier, setStepMultiplier] = useState(1)
  const [showAllBids, setShowAllBids] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false)
  const [auctionEnded, setAuctionEnded] = useState(
    item.state === 'sold' || new Date(item.endTime).getTime() <= Date.now(),
  )
  const [remainingTime, setRemainingTime] = useState(() => Math.max(0, new Date(item.endTime).getTime() - Date.now()))
  const bidIncrement = item.baseBidIncrement * stepMultiplier
  const nextBid = currentPrice + bidIncrement
  const recentBids = [...bids].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const remainingMinutes = String(Math.floor(remainingTime / 60000)).padStart(2, '0')
  const remainingSeconds = String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')

  useEffect(() => {
    let timer
    const updateRemainingTime = () => {
      const remaining = Math.max(0, new Date(endTime).getTime() - Date.now())
      setRemainingTime(remaining)
      if (remaining === 0) {
        clearInterval(timer)
        setAuctionEnded(true)
        onAuctionEnd(recordMockAuctionEnd(item.itemId))
      }
    }
    updateRemainingTime()
    if (!auctionEnded) timer = setInterval(updateRemainingTime, 1000)
    return () => clearInterval(timer)
  }, [auctionEnded, endTime, item.itemId, onAuctionEnd])

  useEffect(() => {
    if (!showAllBids) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowAllBids(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showAllBids])

  const handleBid = (event) => {
    event.preventDefault()
    if (auctionEnded) return
    const result = recordMockLiveBid(item.itemId, { amount: nextBid })
    if (!result) {
      if (Date.now() >= new Date(endTime).getTime()) {
        setAuctionEnded(true)
        onAuctionEnd(recordMockAuctionEnd(item.itemId))
        return
      }
      setShowInsufficientBalance(true)
      return
    }

    setEndTime(result.endTime)
    setCurrentPrice(nextBid)
    setHighestBidderId(user?.id ?? 'usr_001')
    setHighestBidder(user?.id ?? 'usr•••c2a9')
    setBids((currentBids) => [
      {
        id: `bid_user_${Date.now()}`,
        amount: nextBid,
        bidderDisplay: user?.id ?? 'usr•••',
        createdAt: new Date().toISOString(),
      },
      ...currentBids,
    ])
    setError('')
    setNotice(`Bạn đã trả giá ${formatVND(nextBid)} thành công.`)
  }

  return (
    <div className={`${className} space-y-5`}>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Diễn biến cuộc đấu giá</h2>
            <p className="mt-0.5 text-xs text-gray-500">{bids.length} lượt trả giá</p>
          </div>
          {bids.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllBids(true)}
              aria-haspopup="dialog"
              className="shrink-0 text-sm font-semibold text-[#056F1C] hover:underline"
            >
              Xem tất cả
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100 px-5">
          {recentBids.slice(0, 3).map((bid, index) => (
            <div key={bid.id} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className={`font-bold ${index === 0 ? 'text-lg text-[#056F1C]' : 'text-gray-900'}`}>{formatVND(bid.amount)}</p>
                <p className="mt-1 text-xs text-gray-500">{formatBidTime(bid.createdAt)}</p>
              </div>
              <span className={`shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs ${index === 0 ? 'font-bold text-[#056F1C]' : bid.bidderDisplay === user?.id ? 'font-bold text-gray-700' : 'font-semibold text-gray-700'}`}>
                {bid.bidderDisplay}
              </span>
            </div>
          ))}
          {bids.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Chưa có lượt trả giá.</p>}
        </div>
      </section>

      {showAllBids && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setShowAllBids(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-bids-title"
            className="flex max-h-[min(80vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 id="all-bids-title" className="font-bold text-gray-900">Diễn biến cuộc đấu giá</h2>
                <p className="mt-0.5 text-xs text-gray-500">{bids.length} lượt trả giá</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllBids(false)}
                aria-label="Đóng diễn biến cuộc đấu giá"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100 overflow-y-auto px-5">
              {recentBids.map((bid, index) => (
                <div key={bid.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className={`font-bold ${index === 0 ? 'text-lg text-[#056F1C]' : 'text-gray-900'}`}>{formatVND(bid.amount)}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatBidTime(bid.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs ${index === 0 ? 'font-bold text-[#056F1C]' : bid.bidderDisplay === user?.id ? 'font-bold text-gray-700' : 'font-semibold text-gray-700'}`}>
                    {bid.bidderDisplay}
                  </span>
                </div>
              ))}
              {bids.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Chưa có lượt trả giá.</p>}
            </div>
          </section>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4">
          <h2 className="font-bold text-gray-900">Trả giá</h2>
          <div className="text-right">
            <p className="text-lg font-extrabold text-amber-700">{formatVND(currentPrice)}</p>
            <p
              role="timer"
              aria-label={`Thời gian còn lại ${remainingMinutes}:${remainingSeconds}`}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-amber-800"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Còn lại:</span>
              {remainingMinutes}:{remainingSeconds}
            </p>
          </div>
        </div>
        {auctionEnded ? (
          <div
            role="status"
            className={`m-5 rounded-xl border p-5 sm:m-6 ${
              highestBidderId === (user?.id ?? 'usr_001')
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <Trophy className={`mt-0.5 h-6 w-6 shrink-0 ${
                highestBidderId === (user?.id ?? 'usr_001') ? 'text-amber-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-bold text-gray-900">
                  {highestBidderId === (user?.id ?? 'usr_001')
                    ? 'Chúc mừng, bạn đã thắng đấu giá!'
                    : 'Phiên đấu giá đã kết thúc'}
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {highestBidderId === (user?.id ?? 'usr_001')
                    ? `Bạn đang là người dẫn đầu cuối cùng với ${formatVND(currentPrice)}.`
                    : `Vật phẩm được chốt cho người dẫn đầu ${highestBidder ?? 'khác'} với giá ${formatVND(currentPrice)}.`}
                </p>
              </div>
            </div>
          </div>
        ) : (
        <form onSubmit={handleBid} className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-gray-900 sm:px-4">
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] leading-none text-gray-500">Bước giá</span>
              <span className="mt-1 whitespace-nowrap text-xs font-bold sm:text-sm">{formatVND(item.baseBidIncrement)}</span>
            </div>
            <span className="shrink-0 text-sm font-bold text-gray-500">×</span>
            <div className="flex shrink-0 items-center gap-2 rounded-full p-1">
              <button
                type="button"
                aria-label="Giảm số bước giá"
                disabled={stepMultiplier <= 1}
                onClick={() => setStepMultiplier((value) => Math.max(1, value - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#056F1C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-4 text-center text-xs font-bold">{stepMultiplier}</span>
              <button
                type="button"
                aria-label="Tăng số bước giá"
                onClick={() => setStepMultiplier((value) => value + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#056F1C]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="shrink-0 text-sm font-bold text-gray-500">=</span>
            <span className="whitespace-nowrap px-3 py-2 text-xs font-bold sm:text-sm">
              {formatVND(bidIncrement)}
            </span>
          </div>

          {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {notice && <p role="status" className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800">{notice}</p>}

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#056F1C] px-5 py-3 font-bold text-white transition hover:bg-[#045517]"
          >
            Trả giá {formatVND(nextBid)}
          </button>
          <p className="mt-2 text-center text-xs capitalize text-gray-500">{amountInWords(nextBid)}</p>
        </form>
        )}
      </section>

      {showInsufficientBalance && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInsufficientBalance(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="insufficient-balance-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="insufficient-balance-title" className="text-lg font-bold text-gray-900">
              Số dư khả dụng không đủ
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Số dư khả dụng trong NaviWallet không đủ để tiếp tục trả giá. Vui lòng nạp thêm tiền để tham gia đấu giá.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowInsufficientBalance(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => navigate('/user/wallet')}
                className="rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]"
              >
                Nạp thêm
              </button>
            </div>
          </section>
        </div>
      )}
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
  const [endedItem, setEndedItem] = useState(null)
  useEffect(() => {
    setEndedItem(null)
  }, [itemId])

  if (!found) return <NotFoundState sessionId={sessionId} />

  const { session, index } = found
  const item = endedItem ?? found.item
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

        <AuctionItemLayout
          details={
            <AuctionItemDetails
              item={item}
              statusLabel={meta.label}
              statusClassName={meta.className}
              isBidding={state === 'bidding'}
            />
          }
        >
          {state === 'bidding' && (
            <BiddingPanel
              key={item.itemId}
              item={item}
              onAuctionEnd={setEndedItem}
              className="mt-0"
            />
          )}

          {state === 'sold' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className={`mb-5 rounded-xl border p-4 ${
                item.highestBidderId === 'usr_001' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start gap-3">
                  <Trophy className={`mt-0.5 h-6 w-6 shrink-0 ${
                    item.highestBidderId === 'usr_001' ? 'text-amber-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <h2 className="font-bold text-gray-900">
                      {item.highestBidderId === 'usr_001'
                        ? 'Chúc mừng, bạn đã thắng đấu giá!'
                        : 'Phiên đấu giá đã kết thúc'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.highestBidderId === 'usr_001'
                        ? `Bạn đã dẫn đầu với giá ${formatVND(item.currentPrice)}.`
                        : `Vật phẩm được chốt cho người dẫn đầu ${item.highestBidder ?? 'khác'}.`}
                    </p>
                  </div>
                </div>
              </div>
              <AuctionItemCardGroup title="Kết quả đấu giá" columns={1}>
                <AuctionItemDataCard icon={Tag} label="Giá khởi điểm" value={formatVND(item.startingPrice)} />
                <AuctionItemDataCard icon={Trophy} label="Giá trúng đấu giá" value={formatVND(item.currentPrice)} strong />
                <AuctionItemDataCard icon={Hash} label="Mã người trúng" value={item.highestBidder ?? '—'} />
              </AuctionItemCardGroup>
            </div>
          )}

          {state === 'unsold' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">Kết quả đấu giá</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm">✕</span>
                <p className="font-semibold text-red-700">Đấu giá không thành</p>
              </div>
            </div>
          )}

          {state === 'queued' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Sắp lên sàn</p>
              <p className="mt-3">
                Vật phẩm chưa đến giờ đấu giá. Phiên bắt đầu lúc <strong>{formatShortDateTime(item.startTime)}</strong>.
              </p>
            </div>
          )}
        </AuctionItemLayout>
      </div>
    </main>
  )
}
