import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Flag, MapPin, MessageCircle, Package, Star, Store } from 'lucide-react'
import Pagination from '@/components/Pagination'
import ReportEvidenceFields from '@/components/ReportEvidenceFields'
import ProductCard from '@/features/search/components/ProductCard'
import { SORT_OPTIONS, sortProducts } from '@/lib/searchFilters'
import { MOCK_SHOPS } from '@/mocks/mockShops'
import { PRODUCTS } from '@/mocks/products'

const PAGE_SIZE = 30
const SHOP_REPORT_REASONS = [
  ['fraud', 'Có dấu hiệu lừa đảo'],
  ['impersonation', 'Mạo danh cửa hàng hoặc thương hiệu khác'],
  ['prohibited', 'Kinh doanh hàng hóa bị cấm'],
  ['misconduct', 'Có hành vi không phù hợp'],
  ['other', 'Lý do khác'],
]

export default function MockShopPage() {
  const { shopSlug } = useParams()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('newest')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportImages, setReportImages] = useState([])
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const shop = MOCK_SHOPS.find((item) => item.slug === shopSlug)
  const shopProducts = shop ? PRODUCTS.filter((product) => product.shopSlug === shop.slug) : []
  const sortedProducts = sortProducts(shopProducts, sort)
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE)
  const visibleProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [shopSlug])

  const openShopChat = () => {
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  const openReportDialog = () => {
    setReportReason('')
    setReportDetails('')
    setReportImages([])
    setReportSubmitted(false)
    setIsReportOpen(true)
  }

  const submitReport = (event) => {
    event.preventDefault()
    if (!reportReason) return
    setReportSubmitted(true)
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
            <div
              className="bg-[#056F1C] p-6 text-white sm:p-8"
              style={shop.coverImage ? {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("${shop.coverImage}")`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              } : undefined}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/80 bg-[#056F1C] text-3xl font-bold text-white shadow-md">
                  {shop.avatarImage ? (
                    <img src={shop.avatarImage} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#d9d9d9] text-xl font-semibold text-black">
                      {shop.name.trim().charAt(0).toLocaleUpperCase('vi-VN')}
                    </span>
                  )}
                </span>
                <h1 className="min-w-0 break-words text-xl font-bold sm:text-2xl">{shop.name}</h1>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/85">{shop.description}</p>
              <button
                type="button"
                onClick={openShopChat}
                className="mt-6 inline-flex min-w-32 items-center justify-center gap-2 rounded-md border border-white bg-white px-5 py-2 text-sm font-semibold text-[#056F1C] transition hover:bg-gray-100"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
              <button
                type="button"
                onClick={openReportDialog}
                className="ml-3 mt-6 inline-flex min-w-32 items-center justify-center gap-2 rounded-md border border-white/80 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
            </div>
            <dl className="grid content-center gap-x-8 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 shrink-0 text-[#056F1C]" />
                <div>
                  <dt className="text-xs text-gray-500">Sản phẩm</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{shopProducts.length} sản phẩm</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 shrink-0 text-[#056F1C]" />
                <div>
                  <dt className="text-xs text-gray-500">Tham gia NaviShop</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{shop.joinedAt}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
                <div>
                  <dt className="text-xs text-gray-500">Đánh giá</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {shop.rating.toFixed(1)}/5 · {`${(shop.ratingCount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}k`} lượt đánh giá
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Store className="h-5 w-5 text-[#056F1C]" /> Sản phẩm của shop
              <span className="text-sm font-normal text-gray-500">({shopProducts.length})</span>
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Sắp xếp
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value)
                  setPage(1)
                }}
                className="h-9 rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-[#056F1C]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
          {shopProducts.length === 0 ? (
            <p className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
              Shop hiện chưa có sản phẩm.
            </p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(nextPage) => {
                setPage(nextPage)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              label="Phân trang sản phẩm của shop"
            />
          )}
        </div>
      </section>
      {isReportOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsReportOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="shop-report-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {reportSubmitted ? (
              <div role="status" className="py-3 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#056F1C]" />
                <h2 id="shop-report-title" className="mt-4 text-xl font-bold text-gray-900">Cảm ơn bạn đã gửi báo cáo</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  NaviShop sẽ chuyển thông tin đến bộ phận kiểm duyệt để xem xét cửa hàng này.
                  Quá trình xử lý được thực hiện nội bộ; vì lý do bảo mật, chúng tôi có thể không gửi chi tiết kết quả xử lý.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="mt-6 rounded-lg bg-[#056F1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="shop-report-title" className="text-lg font-bold text-gray-900">Báo cáo cửa hàng</h2>
                    <p className="mt-1 text-sm text-gray-500">{shop.name}</p>
                  </div>
                  <button type="button" aria-label="Đóng" onClick={() => setIsReportOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">×</button>
                </div>
                <form onSubmit={submitReport} className="mt-5">
                  <label htmlFor="shop-report-reason" className="text-sm font-semibold text-gray-800">Lý do báo cáo</label>
                  <select
                    id="shop-report-reason"
                    required
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C]"
                  >
                    <option value="" disabled>Chọn lý do</option>
                    {SHOP_REPORT_REASONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ReportEvidenceFields
                    details={reportDetails}
                    onDetailsChange={setReportDetails}
                    images={reportImages}
                    onImagesChange={setReportImages}
                    idPrefix="shop-report"
                  />
                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsReportOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]">Gửi báo cáo</button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
