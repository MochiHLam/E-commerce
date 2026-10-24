import { MessageCircle, Package, Search, Store } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getOrderItems, ORDER_STATUS_LABELS, ORDER_TABS } from '@/mocks/account/orders'
import { MOCK_SHOPS } from '@/mocks/mockShops'
import { formatVND } from '@/lib/format'

function OrderCard({ order, onCancelOrder, onAdvanceOrder, onBuyAgain, onShowRefundInfo }) {
  const items = getOrderItems(order)
  const orderUrl = `/user/orders/${encodeURIComponent(order.id)}`
  const shop = MOCK_SHOPS.find((entry) => entry.slug === order.shopSlug)
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const openShopChat = () => {
    if (!shop) return
    if (!isLoggedIn) {
      navigate('/login', {
        state: { returnTo: `${location.pathname}${location.search}${location.hash}` },
      })
      return
    }
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800">
            <Link
              to={orderUrl}
              className="truncate rounded-sm hover:text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
            >
              {order.storeName}
            </Link>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={openShopChat}
              disabled={!shop}
              title={shop ? `Nhắn tin với ${order.storeName}` : 'Không có thông tin cửa hàng cho đơn hàng này'}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#056F1C] px-3 py-1.5 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </button>
            {shop ? (
              <Link
                to={`/${shop.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
              >
                <Store className="h-3.5 w-3.5" />
                Xem shop
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Không có thông tin cửa hàng cho đơn hàng này"
                className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400"
              >
                <Store className="h-3.5 w-3.5" />
                Xem shop
              </button>
            )}
          </div>
        </div>
        <Link
          to={orderUrl}
          className="shrink-0 rounded-sm pt-0.5 text-right text-xs font-semibold text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={item.id ?? `${order.id}-${index}`} className="p-4">
            <div className="flex flex-wrap items-start gap-4">
              <Link
                to={orderUrl}
                aria-label={`Xem chi tiết đơn hàng ${order.id}: ${item.productName}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
              >
                <Package className="absolute inset-0 m-auto h-7 w-7 text-gray-400" />
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="relative h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none' }}
                  />
                )}
              </Link>
              <Link
                to={orderUrl}
                className="min-w-0 flex-1 rounded-sm hover:text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
              >
                <h2 className="font-medium text-gray-900">{item.productName}</h2>
                {item.variantName && <p className="mt-1 text-sm text-gray-500">{item.variantName}</p>}
                {order.source === 'auction' ? (
                  <p className="mt-1 text-sm font-medium text-[#056F1C]">Vật phẩm đấu giá thành</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Số lượng: {item.quantity ?? 1}</p>
                )}
              </Link>
              {order.source !== 'auction' && (
                <p className="shrink-0 text-base font-semibold text-[#056F1C]">
                  {formatVND(item.merchandiseTotal ?? item.price * (item.quantity ?? 1))}
                </p>
              )}
            </div>
            {order.status === 'completed' && item.productId && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pl-24">
                {!item.hasReviewed && (
                  <Link
                    to={`/products/${encodeURIComponent(item.productId)}?reviewOrderId=${encodeURIComponent(order.id)}#reviews`}
                    className="rounded-md bg-[#056F1C] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#045517]"
                  >
                    Đánh giá
                  </Link>
                )}
                <Link
                  to={`/products/${encodeURIComponent(item.productId)}#reviews`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Xem đánh giá shop
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
        {order.status === 'pending' && (
          <>
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => onAdvanceOrder(order.id, 'shipping')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mô phỏng shop xác nhận
              </button>
            )}
            <button
              type="button"
              onClick={() => onCancelOrder(order.id)}
              className="rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Hủy đơn hàng
            </button>
          </>
        )}
        {order.status === 'shipping' && import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => onAdvanceOrder(order.id, 'delivered')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Mô phỏng hàng đã đến nơi
          </button>
        )}
        {order.status === 'delivered' && (
          <button
            type="button"
            onClick={() => onAdvanceOrder(order.id, 'completed')}
            className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
          >
            Đã nhận hàng
          </button>
        )}
        {order.status === 'cancelled' && (
          <>
            <button
              type="button"
              onClick={() => onBuyAgain(order)}
              className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
            >
              Mua lại
            </button>
            <button
              type="button"
              onClick={onShowRefundInfo}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Xem thông tin hoàn tiền
            </button>
          </>
        )}
        {order.status === 'completed' && (
          <button
            type="button"
            onClick={() => onBuyAgain(order)}
            className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
          >
            Mua lại
          </button>
        )}
      </div>
    </article>
  )
}

export default function OrdersSection({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  orders,
  actionError,
  onCancelOrder,
  onAdvanceOrder,
  onBuyAgain,
  onShowRefundInfo,
}) {
  return (
    <>
      <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Đơn hàng</h1>
      <div role="tablist" aria-label="Lọc đơn hàng" className="flex w-full border-b border-gray-200">
        {ORDER_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`orders-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="orders-tab-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 flex-1 border-b-2 px-2 py-3 text-center text-sm transition-colors sm:px-4 ${
                isActive
                  ? 'border-[#056F1C] font-semibold text-[#056F1C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div id="orders-tab-panel" role="tabpanel" aria-labelledby={`orders-tab-${activeTab}`}>
        {actionError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {activeTab === 'all' && (
          <div className="relative mt-5 w-full">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              role="searchbox"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm trong đơn hàng"
              aria-label="Tìm sản phẩm trong tất cả đơn hàng"
              className="h-11 w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
            />
          </div>
        )}
        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              {activeTab === 'all' && search.trim()
                ? 'Không tìm thấy sản phẩm phù hợp.'
                : 'Chưa có đơn hàng trong mục này.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancelOrder={onCancelOrder}
                onAdvanceOrder={onAdvanceOrder}
                onBuyAgain={onBuyAgain}
                onShowRefundInfo={onShowRefundInfo}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
