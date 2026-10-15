import { Clock, ImageIcon, Layers, Tag, TrendingUp } from 'lucide-react'
import { formatShortDateTime, formatVND } from '@/features/auction/lib/auction'

export function AuctionItemLayout({ details, children }) {
  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(400px,1fr)]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {details}
      </section>
      <aside className="min-w-0">{children}</aside>
    </div>
  )
}

export function AuctionItemDataCard({ icon: Icon, label, value, strong }) {
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

export function AuctionItemCardGroup({ title, children, columns = 2 }) {
  return (
    <div className="mt-6">
      {title && <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>}
      <div className={`grid ${columns === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>{children}</div>
    </div>
  )
}

export function AuctionItemDetails({ item, statusLabel, statusClassName, isBidding = false }) {
  return (
    <>
      <h1 className="mt-5 text-xl font-bold text-gray-900">Chi tiết tài sản đấu giá</h1>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-gray-500">Trạng thái:</span>
        {isBidding && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
        )}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>{statusLabel}</span>
      </div>

      {item.images?.[0] ? (
        <img src={item.images[0]} alt={item.title} className="mt-5 w-full rounded-2xl object-cover" style={{ maxHeight: 340 }} />
      ) : (
        <div className="mt-5 flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-100">
          <ImageIcon className="h-14 w-14 text-gray-300" />
        </div>
      )}

      <p className="mt-5 text-lg font-bold leading-snug text-gray-900">{item.title}</p>
      <p className="mt-1 text-xs text-gray-400">Mã tài sản: {item.itemId}</p>

      <AuctionItemCardGroup title="Thông tin tài sản">
        <AuctionItemDataCard icon={Tag} label="Giá khởi điểm" value={formatVND(item.startingPrice)} />
        <AuctionItemDataCard icon={TrendingUp} label="Bước giá" value={formatVND(item.baseBidIncrement)} />
        <AuctionItemDataCard icon={Layers} label="Loại vật phẩm" value={item.category} />
      </AuctionItemCardGroup>

      <AuctionItemCardGroup title="Thời gian đấu giá">
        <AuctionItemDataCard icon={Clock} label="Thời gian bắt đầu" value={formatShortDateTime(item.startTime)} />
        <AuctionItemDataCard icon={Clock} label="Thời gian kết thúc" value={formatShortDateTime(item.endTime)} />
      </AuctionItemCardGroup>
    </>
  )
}
