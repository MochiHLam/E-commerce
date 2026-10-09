import { ArrowLeft, Clock3, ShieldAlert } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const LAYOUT = 'max-w-[1200px] mx-auto px-5'

const formatVND = (value) => (value == null ? '—' : `${new Intl.NumberFormat('vi-VN').format(value)} ₫`)

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const MOCK_DETAIL = {
  id: 'ses_004',
  name: 'Phiên đấu giá mùa thu',
  startTime: '2026-09-28T19:00:00+07:00',
  closedAt: '2026-09-28T20:14:00+07:00',
  closedReason: 'completed',
  items: [
    {
      itemId: 'itm_01',
      title: 'Đồng hồ cơ cổ 1960',
      startingPrice: 500000,
      buyNowPrice: 3000000,
      baseBidIncrement: 50000,
      state: 'sold',
      finalPrice: 1850000,
      winnerDisplay: 'usr•••91c2',
      isMe: false,
    },
    {
      itemId: 'itm_02',
      title: 'Máy ảnh film Pentax',
      startingPrice: 800000,
      buyNowPrice: 4000000,
      baseBidIncrement: 100000,
      state: 'sold',
      finalPrice: 4000000,
      winnerDisplay: 'usr•••c2a9',
      isMe: true,
    },
    {
      itemId: 'itm_03',
      title: 'Bộ tem sưu tầm',
      startingPrice: 300000,
      buyNowPrice: 1500000,
      baseBidIncrement: 50000,
      state: 'unsold',
      finalPrice: null,
      winnerDisplay: null,
      isMe: false,
    },
  ],
}

function NotFoundState() {
  return (
    <main className="bg-gray-50 py-16">
      <div className={LAYOUT}>
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Không tìm thấy phiên đấu giá</h1>
          <p className="mt-2 text-gray-600">Phiên này không tồn tại hoặc chưa được công bố trong lịch sử.</p>
          <Link to="/auction/about" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#056F1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]">
            <ArrowLeft className="h-4 w-4" /> Quay lại đấu giá
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function AuctionHistoryDetailPage() {
  const { sessionId } = useParams()
  const { pathname } = useLocation()
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ returnTo: pathname }} />

  const session = /^ses_\d+$/.test(sessionId) ? { ...MOCK_DETAIL, id: sessionId } : null
  if (!session || session.closedReason === 'cancelled_pending') return <NotFoundState />

  const soldItems = session.items.filter((item) => item.state === 'sold')
  const totalValue = soldItems.reduce((sum, item) => sum + Number(item.finalPrice || 0), 0)
  const isForced = session.closedReason === 'admin_forced'

  const stats = [
    ['Tổng vật phẩm', session.items.length],
    ['Đã bán', soldItems.length],
    ['Tổng giá trị chốt', formatVND(totalValue)],
  ]

  return (
    <main className="bg-gray-50 py-12" data-session={sessionId}>
      <div className={LAYOUT}>
        <Link to="/auction/about" className="inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang đấu giá
        </Link>

        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isForced ? 'bg-amber-100 text-amber-800' : 'bg-[#E8F5EB] text-[#056F1C]'}`}>
              {isForced ? 'Kết thúc sớm' : 'Hoàn tất'}
            </span>
          </div>

          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-gray-400" />
              Bắt đầu: {formatDateTime(session.startTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-gray-400" />
              Kết thúc: {formatDateTime(session.closedAt)}
            </span>
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#056F1C]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {['#', 'Vật phẩm', 'Giá khởi điểm', 'Giá mua ngay', 'Bước giá', 'Giá trúng', 'Người thắng'].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {session.items.map((item, index) => (
                <tr key={item.itemId}>
                  <td className="px-4 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{item.title}</td>
                  <td className="px-4 py-4">{formatVND(item.startingPrice)}</td>
                  <td className="px-4 py-4">{formatVND(item.buyNowPrice)}</td>
                  <td className="px-4 py-4">{formatVND(item.baseBidIncrement)}</td>

                  {item.state === 'sold' ? (
                    <>
                      <td className="px-4 py-4 font-bold text-[#056F1C]">{formatVND(item.finalPrice)}</td>
                      <td className="px-4 py-4">
                        {item.winnerDisplay}
                        {item.isMe && <span className="ml-2 rounded bg-[#E8F5EB] px-2 py-0.5 text-[11px] font-semibold text-[#056F1C]">Bạn</span>}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="px-4 py-4 text-gray-500">Không ai đặt giá</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Đấu giá miễn hủy, miễn trả. Giá trúng là giá chốt cuối cùng của vật phẩm.
        </p>
      </div>
    </main>
  )
}
