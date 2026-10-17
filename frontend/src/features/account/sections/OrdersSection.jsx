import { MessageCircle, Package, Search, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ORDER_STATUS_LABELS, ORDER_TABS } from '@/mocks/account/orders'

export default function OrdersSection({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  orders,
  actionError,
  onCancelOrder,
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
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800">
                        <Link
                          to={`/user/orders/${encodeURIComponent(order.id)}`}
                          className="truncate rounded-sm hover:text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                        >
                          {order.storeName}
                        </Link>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        title="Tính năng chat đang được phát triển"
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#056F1C] px-3 py-1.5 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Chat
                      </button>
                      <button
                        type="button"
                        title="Tính năng xem shop đang được phát triển"
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white"
                      >
                        <Store className="h-3.5 w-3.5" />
                        Xem shop
                      </button>
                    </div>
                  </div>
                  <Link
                    to={`/user/orders/${encodeURIComponent(order.id)}`}
                    className="shrink-0 rounded-sm pt-0.5 text-right text-xs font-semibold text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </Link>
                </div>
                <Link
                  to={`/user/orders/${encodeURIComponent(order.id)}`}
                  aria-label={`Xem chi tiết đơn hàng ${order.id}: ${order.productName}`}
                  className="flex flex-wrap items-start gap-4 p-4 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#056F1C]"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Package className="absolute inset-0 m-auto h-7 w-7 text-gray-400" />
                    {order.image && (
                      <img
                        src={order.image}
                        alt=""
                        className="relative h-full w-full object-cover"
                        onError={(event) => { event.currentTarget.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-gray-900">{order.productName}</h2>
                    {order.variantName && <p className="mt-1 text-sm text-gray-500">{order.variantName}</p>}
                    <p className="mt-1 text-sm text-gray-500">Số lượng: {order.quantity ?? 1}</p>
                  </div>
                  <p className="shrink-0 text-base font-semibold text-[#056F1C]">
                    {new Intl.NumberFormat('vi-VN').format(order.price * (order.quantity ?? 1))}₫
                  </p>
                </Link>
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onCancelOrder(order.id)}
                      className="rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Hủy đơn hàng
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
                    <>
                      <button
                        type="button"
                        title="Tính năng mua lại đang được phát triển"
                        className="rounded-md bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517]"
                      >
                        Mua lại
                      </button>
                      {order.hasReviewed && (
                        <button
                          type="button"
                          title="Tính năng xem đánh giá shop đang được phát triển"
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Xem đánh giá shop
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
