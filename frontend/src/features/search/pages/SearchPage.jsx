import { useState } from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import FilterSidebar from '@/features/search/components/FilterSidebar'
import ProductCard from '@/features/search/components/ProductCard'
import Pagination from '@/components/Pagination'
import useProductSearch from '@/hooks/useProductSearch'
import useSearchFilters from '@/hooks/useSearchFilters'
import { PAGE_SIZE, SORT_OPTIONS } from '@/lib/searchFilters'
import { MOCK_SHOPS } from '@/mocks/mockShops'

export default function SearchPage() {
  const { filters, queryString, update, clearFilters } = useSearchFilters()
  const { loading, error, items, total, totalPages, page, categories, shops } = useProductSearch(queryString)
  const [showAllShops, setShowAllShops] = useState(false)
  const hasFilters = Boolean(filters.category.length || filters.minPrice != null || filters.maxPrice != null || filters.rating)
  const shopTitle = filters.q
    ? `Shop liên quan đến từ khóa '${filters.q}'`
    : 'Shop nổi bật'
  const productTitle = filters.q
    ? `Sản phẩm liên quan đến từ khóa '${filters.q}'`
    : 'Tất cả sản phẩm'
  const visibleShops = showAllShops ? shops : shops.slice(0, 4)
  const scopedShop = MOCK_SHOPS.find((shop) => shop.slug === filters.shop)
  const formatRatingCount = (count) => (
    count >= 1000
      ? `${(count / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}k`
      : count.toLocaleString('vi-VN')
  )

  return (
    <main className="bg-gray-50 py-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6 lg:px-0">
        <FilterSidebar filters={filters} categories={categories} onChange={update} onClear={clearFilters} />

        <div className="min-w-0 space-y-8">
          {!filters.shop && <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-bold text-gray-900">{shopTitle}</h1>
              {shops.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllShops((current) => !current)}
                  className="text-sm font-semibold text-[#056F1C] hover:underline"
                >
                  {showAllShops ? 'Thu gọn' : 'Thêm kết quả'}
                </button>
              )}
            </div>
            {loading ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : error ? (
              <p role="alert" className="mt-4 text-sm text-red-700">Không thể tải kết quả shop: {error}</p>
            ) : visibleShops.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center text-sm text-gray-500">
                Không tìm thấy shop phù hợp.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {visibleShops.map((shop) => (
                  <li key={shop.id}>
                    <Link
                      to={`/${shop.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                    >
                      <span className="relative block aspect-[3/2] w-full overflow-visible bg-[#08751e]">
                        {shop.coverImage ? (
                          <img
                            src={shop.coverImage}
                            alt=""
                            className="h-full w-full rounded-t-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : null}
                        <span className="absolute -bottom-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#d9d9d9] text-xl font-semibold text-black shadow-sm">
                          {shop.avatarImage ? (
                            <img src={shop.avatarImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            shop.name.trim().charAt(0).toLocaleUpperCase('vi-VN')
                          )}
                        </span>
                      </span>
                      <span className="flex flex-1 flex-col items-center gap-2 px-3 pb-4 pt-14">
                        <span className="max-w-full truncate text-center text-sm font-semibold text-gray-900">{shop.name}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                          <span>{shop.rating.toFixed(1)}/5</span>
                          <span className="text-gray-400">({formatRatingCount(shop.ratingCount)} đánh giá)</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>}

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {scopedShop
                    ? (filters.q
                      ? `Sản phẩm của ${scopedShop.name} liên quan đến '${filters.q}'`
                      : `Sản phẩm của ${scopedShop.name}`)
                    : productTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{loading ? 'Đang tìm...' : `${total} sản phẩm`}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Sắp xếp
                <select
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value })}
                  className="h-9 rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-[#056F1C]"
                >
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>

            {error ? (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-700">
                Không thể tải kết quả tìm kiếm: {error}
              </div>
            ) : loading ? (
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <li key={index} className="h-72 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </ul>
            ) : items.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <p className="font-semibold text-gray-900">Không tìm thấy kết quả phù hợp</p>
                <p className="mt-1 text-sm text-gray-500">Thử đổi từ khóa hoặc bỏ bớt bộ lọc.</p>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="mt-4 rounded bg-[#056F1C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#045517]">
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => <li key={product.id}><ProductCard product={product} /></li>)}
              </ul>
            )}

            {!loading && !error && totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(nextPage) => {
                  update({ page: nextPage })
                  window.scrollTo({ top: 0 })
                }}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
