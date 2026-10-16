import { useState } from 'react'
import { ArrowLeft, Clock3, ImageIcon } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getMockSession } from '@/mocks/auction/historyMock'
import { formatVND } from '@/lib/format'
import { ITEM_STATUS, formatDateTime, formatShortDateTime, getItemStatus } from '@/features/auction/lib/auction'

const LAYOUT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-0'

function NotFoundState() {
  return (
    <main className="bg-gray-50 py-24">
      <div className={`${LAYOUT} text-center`}>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy phiên đấu giá</h1>
        <p className="mt-2 text-gray-600">Phiên không tồn tại hoặc chưa kết thúc.</p>
        <Link to="/auction/about" className="mt-6 inline-block font-semibold text-[#056F1C] hover:underline">
          Quay lại trang đấu giá
        </Link>
      </div>
    </main>
  )
}

export default function AuctionHistoryDetailPage() {
  const { sessionId } = useParams()
  const [filter, setFilter] = useState('all')

  // TODO: thay bằng GET /api/auction/sessions/:sessionId/result (404 -> NotFoundState)
  const session = getMockSession(sessionId)
  if (!session) return <NotFoundState />

  const items = session.items.map((item, index) => ({ ...item, order: index + 1, status: getItemStatus(item) }))
  const count = (status) => items.filter((i) => i.status === status).length

  const tabs = [
    { key: 'all', label: 'Tất cả', total: items.length },
    ...Object.entries(ITEM_STATUS)
      .map(([key, meta]) => ({ key, label: meta.label, total: count(key) }))
      .filter((t) => t.total > 0),
  ]
  const visible = filter === 'all' ? items : items.filter((i) => i.status === filter)

  const stats = [
    ['Tổng vật phẩm', items.length],
    ['Đấu giá thành', count('sold')],
  ]

  return (
    <main className="bg-gray-50 py-12">
      <div className={LAYOUT}>
        <Link to="/auction/about" className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang đấu giá
        </Link>

        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <span className="rounded-full bg-[#E8F5EB] px-3 py-1 text-xs font-semibold text-[#056F1C]">Hoàn tất</span>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-gray-400" />Bắt đầu: {formatDateTime(session.startTime)}</span>
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#056F1C]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Lọc vật phẩm theo tình trạng">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === t.key
                  ? 'border-[#056F1C] bg-[#056F1C] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#056F1C]'
                }`}
            >
              {t.label} {t.total}
            </button>
          ))}
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const meta = ITEM_STATUS[item.status]
            return (
              <li key={item.itemId}>
                <Link
                  to={`/auction/history/${sessionId}/items/${item.itemId}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Ảnh + badge */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {item.images[0] ? (
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
                    <span
                      className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Nội dung */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <p className="line-clamp-2 font-semibold leading-snug text-gray-900">{item.title}</p>
                    <div className="mt-auto space-y-1 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Giá khởi điểm:</span>
                        <span className="font-medium text-gray-900">{formatVND(item.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian tổ chức:</span>
                        <span className="font-medium text-gray-900">
                          {formatShortDateTime(item.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-sm text-gray-500">
          Đấu giá miễn hủy, miễn trả. Bấm vào một vật phẩm để xem giá chốt, người thắng và diễn biến đặt giá.
        </p>
      </div>
    </main>
  )
}
