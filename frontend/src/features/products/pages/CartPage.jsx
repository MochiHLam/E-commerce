import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { getCartInventoryIssues, getCartItemStock } from '@/lib/cartInventory'
import { formatVND } from '@/lib/format'

const getItemKey = (item) => `${item.id}-${item.variantId ?? 'default'}`

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity } = useCart()
  const [selectedKeys, setSelectedKeys] = useState(() => new Set())
  const selectedItems = items.filter((item) => selectedKeys.has(getItemKey(item)))
  const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const inventoryIssues = getCartInventoryIssues(selectedItems)
  const allSelected = items.length > 0 && selectedItems.length === items.length

  const checkout = () => {
    if (selectedItems.length === 0) return
    navigate('/checkout', { state: { items: selectedItems } })
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 xl:px-0">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-[#056F1C] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Tiếp tục mua sắm
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
          {items.length > 0 && <p className="text-sm text-gray-500">{items.length} sản phẩm</p>}
        </div>

        {items.length === 0 ? (
          <section className="mt-6 flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#056F1C]">
              <ShoppingBag className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Giỏ hàng của bạn đang trống</h2>
            <p className="mt-2 text-sm text-gray-500">Hãy khám phá và thêm sản phẩm bạn yêu thích vào giỏ hàng.</p>
            <Link to="/search" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#056F1C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#045517]">
              Khám phá sản phẩm <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[minmax(0,1fr)_8rem_8rem_2.5rem] sm:px-5">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả sản phẩm"
                    checked={allSelected}
                    onChange={(event) => setSelectedKeys(
                      event.target.checked
                        ? new Set(items.map(getItemKey))
                        : new Set(),
                    )}
                    className="h-4 w-4 shrink-0 accent-[#056F1C]"
                  />
                  <span>Sản phẩm</span>
                </label>
                <span className="hidden text-right sm:block">Đơn giá</span>
                <span className="hidden text-center sm:block">Số lượng</span>
                <span className="hidden sm:block" />
              </div>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const stock = getCartItemStock(item)
                  const canIncrease = item.quantity < stock
                  const name = `${item.name || item.title || 'Sản phẩm'}${item.variantLabel ? ` (${item.variantLabel})` : ''}`
                  return (
                    <li key={getItemKey(item)} className="grid gap-4 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_2.5rem] sm:items-center sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Chọn ${name} để thanh toán`}
                          checked={selectedKeys.has(getItemKey(item))}
                          onChange={(event) => setSelectedKeys((current) => {
                            const next = new Set(current)
                            if (event.target.checked) next.add(getItemKey(item))
                            else next.delete(getItemKey(item))
                            return next
                          })}
                          className="h-4 w-4 shrink-0 accent-[#056F1C]"
                        />
                        {item.image || item.thumbnail ? (
                          <Link to={`/products/${item.id}`} aria-label={`Xem sản phẩm ${name}`} className="shrink-0">
                            <img src={item.image || item.thumbnail} alt="" className="h-20 w-20 rounded-lg bg-gray-100 object-cover" />
                          </Link>
                        ) : (
                          <Link to={`/products/${item.id}`} aria-label={`Xem sản phẩm ${name}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <ShoppingBag className="h-7 w-7" />
                          </Link>
                        )}
                        <div className="min-w-0">
                          <Link to={`/products/${item.id}`} className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#056F1C]">
                            {name}
                          </Link>
                          {item.variantName && <p className="mt-1 text-xs text-gray-500">{item.variantName}</p>}
                          <p className="mt-1 text-xs text-gray-500">Tồn kho: {Number.isFinite(stock) ? stock : '—'}</p>
                          {item.quantity > stock && (
                            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                              Giỏ hàng vượt quá tồn kho. Vui lòng giảm xuống còn tối đa {stock}.
                            </p>
                          )}
                          <p className="mt-2 text-sm font-semibold text-[#056F1C] sm:hidden">{formatVND(item.price)}</p>
                        </div>
                      </div>
                      <p className="hidden text-right text-sm font-medium text-gray-700 sm:block">{formatVND(item.price)}</p>
                      <div className="flex items-center justify-between gap-3 sm:justify-center">
                        <span className="text-xs text-gray-500 sm:hidden">Số lượng</span>
                        <div className="inline-flex h-9 items-center rounded-lg border border-gray-300">
                          <button
                            type="button"
                            aria-label={`Giảm số lượng ${name}`}
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 text-gray-600 hover:text-[#056F1C] disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span aria-live="polite" className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Tăng số lượng ${name}`}
                            disabled={!canIncrease}
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                            className="px-2.5 text-gray-600 hover:text-[#056F1C] disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Xóa ${name} khỏi giỏ hàng`}
                        onClick={() => removeFromCart(item.id, item.variantId)}
                        className="flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 sm:w-9 sm:border-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden">Xóa</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
              <div className="mt-5 flex justify-between text-sm text-gray-600">
                <span>Đã chọn ({selectedItems.length} sản phẩm)</span>
                <span>{formatVND(selectedTotalPrice)}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-[#056F1C]">{formatVND(selectedTotalPrice)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">Phí vận chuyển sẽ được tính ở bước thanh toán.</p>
              {inventoryIssues.length > 0 && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-700">
                  Có {inventoryIssues.length} mặt hàng đã vượt quá số lượng tồn kho hiện tại. Vui lòng giảm số lượng trước khi thanh toán.
                </p>
              )}
              <button
                type="button"
                onClick={checkout}
                disabled={selectedItems.length === 0}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {selectedItems.length === 0 ? 'Chọn sản phẩm để thanh toán' : `Thanh toán (${selectedItems.length})`}
                {selectedItems.length > 0 && <ArrowRight className="h-4 w-4" />}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
