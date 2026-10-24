import { BadgeCheck, House, Package, ShoppingCart } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { formatVND } from '@/lib/format'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  if (!state?.orderId) return <Navigate to="/cart" replace />
  const isAuctionOrder = state.source === 'auction'

  return (
    <main className="flex-1 bg-gray-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#056F1C]">
          <BadgeCheck className="h-12 w-12" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isAuctionOrder ? 'Tạo đơn hàng thành công!' : 'Bạn đã đặt hàng thành công!'}
        </h1>
        <p className="mt-3 text-gray-600">
          {isAuctionOrder
            ? 'Đơn hàng cho vật phẩm đấu giá đã được tạo. Bạn có thể theo dõi trạng thái trong mục '
            : 'Bạn có thể theo dõi trạng thái đơn hàng trong mục '}
          <Link to="/user/orders" className="font-semibold text-[#056F1C] hover:underline">
            Đơn hàng
          </Link>.
        </p>
        <div className="mx-auto mt-6 max-w-md rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <p>Mã đơn hàng: <span className="font-semibold text-gray-900">{state.orderId}</span></p>
          {!isAuctionOrder && (
            <p className="mt-1">Tổng thanh toán: <span className="font-semibold text-[#056F1C]">{formatVND(state.total)}</span></p>
          )}
        </div>
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={isAuctionOrder ? '/user/auctions/items' : '/'}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#045517]"
          >
            {isAuctionOrder ? (
              <>
                <Package className="h-4 w-4" /> Vật đấu thành
              </>
            ) : (
              <>
                <House className="h-4 w-4" /> Trở lại trang chủ
              </>
            )}
          </Link>
          <Link
            to={isAuctionOrder ? '/user/orders' : '/cart'}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {isAuctionOrder ? (
              <>
                <ShoppingCart className="h-4 w-4" /> Đơn hàng
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Giỏ hàng
              </>
            )}
          </Link>
        </div>
      </section>
    </main>
  )
}
