import { useParams } from 'react-router-dom'
import { CalendarDays, MapPin, MessageCircle, Package, Store } from 'lucide-react'
import { MOCK_SHOPS } from '@/mocks/mockShops'

export default function MockShopPage() {
  const { shopSlug } = useParams()
  const shop = MOCK_SHOPS.find((item) => item.slug === shopSlug)

  const openShopChat = () => {
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  if (!shop) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy cửa hàng</h1>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <section className="bg-[#eef2ee] py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-0">
          <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-[minmax(18rem,0.9fr)_1.1fr]">
            <div className="bg-[#16452b] p-6 text-white sm:p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/80 bg-[#056F1C] text-3xl font-bold text-white shadow-md">
                  {shop.initial}
                </span>
                <h1 className="min-w-0 break-words text-xl font-bold sm:text-2xl">{shop.name}</h1>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/85">{shop.description}</p>
              <button
                type="button"
                onClick={openShopChat}
                className="mt-6 inline-flex min-w-32 items-center justify-center gap-2 rounded-md border border-white/80 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
            </div>
            <dl className="grid content-center gap-x-8 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 shrink-0 text-[#056F1C]" />
                <div>
                  <dt className="text-xs text-gray-500">Sản phẩm</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{shop.productCount} sản phẩm</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 shrink-0 text-[#056F1C]" />
                <div>
                  <dt className="text-xs text-gray-500">Tham gia NaviShop</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{shop.joinedAt}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <MapPin className="h-5 w-5 shrink-0 text-[#056F1C]" />
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">Địa chỉ shop</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-gray-900">{shop.address}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="min-h-[24rem] bg-gray-50">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 xl:px-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Store className="h-5 w-5 text-[#056F1C]" /> Sản phẩm của shop
          </h2>
          <p className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            Sản phẩm của cửa hàng sẽ hiển thị tại đây khi được kết nối.
          </p>
        </div>
      </section>
    </main>
  )
}
