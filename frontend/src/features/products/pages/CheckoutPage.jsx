import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, MapPin, PackageCheck, ShoppingBag } from 'lucide-react'
import { getCartInventoryIssues, getCartItemStock } from '@/lib/cartInventory'
import { formatVND } from '@/lib/format'

export default function CheckoutPage() {
  const { state } = useLocation()
  const items = state?.items ?? []
  const inventoryIssues = getCartInventoryIssues(items)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 xl:px-0">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-[#056F1C] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Tiếp tục mua sắm
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Thanh toán</h1>
        {items.length ? (
          <>
            {inventoryIssues.length > 0 && (
              <div role="alert" className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Sản phẩm đã vượt quá số lượng tồn kho. Vui lòng quay lại giỏ hàng và giảm số lượng để tiếp tục.
                  {inventoryIssues.map(({ item, stock }) => (
                    <span key={`${item.id}-${item.variantId}`} className="mt-1 block">
                      {item.name || item.title}: tồn kho hiện tại {stock}, trong giỏ {item.quantity}.
                    </span>
                  ))}
                </p>
                <Link to="/cart" className="shrink-0 font-semibold text-red-900 underline">Quay lại giỏ hàng</Link>
              </div>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-[1fr_18rem]">
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900"><MapPin className="h-5 w-5 text-[#056F1C]" /> Thông tin giao hàng</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">Đơn hàng đã sẵn sàng. Thông tin địa chỉ và phương thức thanh toán sẽ được xác nhận ở bước tiếp theo.</p>
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900"><ShoppingBag className="h-5 w-5 text-[#056F1C]" /> Sản phẩm đặt mua</h2>
                  <ul className="mt-4 divide-y divide-gray-100">
                    {items.map((item) => (
                      <li key={`${item.id}-${item.variantId}`} className="flex justify-between gap-4 py-3 text-sm">
                        <span className="min-w-0">
                          <span className="block font-medium text-gray-900">{item.name}</span>
                          <span className="mt-1 block text-gray-500">{item.variantName} · SL {item.quantity}</span>
                          <span className="mt-1 block text-xs text-gray-500">Tồn kho hiện tại: {getCartItemStock(item)}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-gray-900">{formatVND(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                <div className="mt-4 flex justify-between text-sm text-gray-600"><span>Tạm tính</span><span>{formatVND(total)}</span></div>
                <div className="mt-3 flex justify-between border-t border-gray-100 pt-4 font-bold text-gray-900"><span>Tổng cộng</span><span className="text-[#056F1C]">{formatVND(total)}</span></div>
                <p className="mt-4 flex items-center gap-2 text-xs text-gray-500"><PackageCheck className="h-4 w-4 shrink-0 text-[#056F1C]" /> Phí vận chuyển sẽ được tính sau khi có địa chỉ.</p>
              </aside>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-700">Chưa có sản phẩm để thanh toán.</p>
            <Link to="/search" className="mt-4 inline-flex rounded-lg bg-[#056F1C] px-4 py-2 font-semibold text-white hover:bg-[#045517]">Khám phá sản phẩm</Link>
          </div>
        )}
      </div>
    </main>
  )
}
