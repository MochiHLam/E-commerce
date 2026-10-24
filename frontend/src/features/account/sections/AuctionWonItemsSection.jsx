import { ArrowRight, ImageIcon, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/features/auction/lib/auction'
import { formatVND } from '@/lib/format'
import { getMockAuctionOrder } from '@/mocks/account/orders'
import { getMockWonAuctionItems } from '@/mocks/auction/historyMock'

export default function AuctionWonItemsSection() {
  const wonItems = getMockWonAuctionItems()

  return (
    <>
      <h1 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Vật đấu thành</h1>
      {wonItems.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {wonItems.map(({ session, item }) => {
            const order = getMockAuctionOrder(session.id, item.itemId)
            return (
              <li key={`${session.id}-${item.itemId}`}>
                <article className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{session.name}</p>
                    <p className="mt-1 text-sm text-gray-500">Kết thúc {formatDateTime(item.endTime)}</p>
                    <p className="mt-2 font-semibold text-[#056F1C]">
                      Giá thắng {formatVND(item.finalPrice)}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:w-auto sm:border-0 sm:pt-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#056F1C]">
                      <Trophy className="h-3.5 w-3.5" />
                      Đấu giá thành công
                    </span>
                    <Link
                      to={`/auction/history/${session.id}/items/${item.itemId}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition hover:border-[#056F1C] hover:text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                    >
                      Chi tiết <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={order
                        ? `/user/orders/${encodeURIComponent(order.id)}`
                        : `/user/auctions/order/${item.itemId}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#056F1C] px-3 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                    >
                      {order ? 'Xem đơn hàng' : 'Tạo đơn hàng'}
                    </Link>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
          <p className="text-sm text-gray-500">Bạn chưa thắng vật phẩm đấu giá nào.</p>
        </div>
      )}
    </>
  )
}
