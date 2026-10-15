import { ArrowLeft, ChevronLeft, ChevronRight, Hash, Tag, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AuctionItemCardGroup, AuctionItemDataCard, AuctionItemDetails, AuctionItemLayout } from '@/features/auction/components/AuctionItemLayout'
import { getMockItem } from '@/mocks/auction/historyMock'
import { ITEM_STATUS, formatVND, getItemStatus } from '@/features/auction/lib/auction'

const LAYOUT = 'max-w-[1280px] mx-auto px-5'

function NotFoundState({ sessionId }) {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy vật phẩm</h1>
        <Link to={`/auction/history/${sessionId}`} className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    </main>
  )
}

export default function AuctionHistoryItemPage() {
  const { sessionId, itemId } = useParams()

  // TODO: thay bằng API (có thể dùng lại GET /api/auction/sessions/:sessionId/result rồi lọc theo itemId)
  const found = getMockItem(sessionId, itemId)
  if (!found) return <NotFoundState sessionId={sessionId} />

  const { session, item, index } = found
  const status = getItemStatus(item)
  const meta = ITEM_STATUS[status]
  const prev = session.items[index - 1]
  const next = session.items[index + 1]
  const sessionPath = `/auction/history/${sessionId}`
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
            />
          }
        >
          {status === 'sold' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <AuctionItemCardGroup title="Kết quả đấu giá" columns={1}>
                <AuctionItemDataCard icon={Tag} label="Giá khởi điểm" value={formatVND(item.startingPrice)} />
                <AuctionItemDataCard icon={Trophy} label="Giá trúng đấu giá" value={formatVND(item.finalPrice)} strong />
                <AuctionItemDataCard
                  icon={Hash}
                  label="Mã người trúng"
                  value={`${item.winnerDisplay}${item.isMe ? ' (Bạn)' : ''}`}
                />
              </AuctionItemCardGroup>
            </div>
          )}

          {status === 'unsold' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">Kết quả đấu giá</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm">✕</span>
                <p className="font-semibold text-red-700">Đấu giá không thành</p>
              </div>
            </div>
          )}
        </AuctionItemLayout>
      </div>
    </main>
  )
}
