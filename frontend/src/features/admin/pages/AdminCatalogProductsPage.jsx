import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ImageIcon,
  MapPin,
  Package,
  Search,
  Star,
  Store,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatVND } from '@/lib/format'
import { getCategories } from '@/mocks/categories'
import {
  getAdminCatalogProduct,
  getAdminCatalogProducts,
  getAdminCatalogShop,
  getAdminCatalogShops,
} from '@/mocks/adminCatalog'
import { getMockProductReviews, getProductDetailMock } from '@/mocks/productDetails'
import { PRODUCTS } from '@/mocks/products'

const PRODUCT_STATUS_LABELS = {
  active: 'Đang bán',
  draft: 'Nháp',
  hidden: 'Đã ẩn',
  auction_pending: 'Chờ duyệt đấu giá',
  auction_locked: 'Trong kho đấu giá',
}

const PRODUCT_STATUS_STYLES = {
  active: 'bg-green-50 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  hidden: 'bg-amber-50 text-amber-800',
  auction_pending: 'bg-violet-50 text-violet-800',
  auction_locked: 'bg-blue-50 text-blue-800',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN')
}

function ProductStatus({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {PRODUCT_STATUS_LABELS[status] ?? 'Chưa xác định'}
    </span>
  )
}

function ProductImage({ product, className = '' }) {
  const image = product.images?.[0] || product.image
  return image
    ? <img src={image} alt="" className={`h-full w-full object-cover ${className}`} />
    : (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-gray-100 to-amber-50 text-[#056F1C]/40 ${className}`}>
        <ImageIcon className="h-10 w-10" strokeWidth={1.3} aria-hidden="true" />
      </div>
    )
}

function LoadingError({ error, onRetry }) {
  if (!error) return null
  return (
    <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p>{error}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">Thử tải lại</button>}
    </div>
  )
}

function useCatalogSnapshot() {
  const [snapshot, setSnapshot] = useState({ shops: [], products: [], categories: [] })
  const [error, setError] = useState('')

  useEffect(() => {
    const refresh = () => {
      try {
        setSnapshot({
          shops: getAdminCatalogShops(),
          products: getAdminCatalogProducts(),
          categories: getCategories(),
        })
        setError('')
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu danh mục sản phẩm.')
      }
    }
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('navishop:categories-updated', refresh)
    window.addEventListener('navishop:seller-application-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('navishop:categories-updated', refresh)
      window.removeEventListener('navishop:seller-application-updated', refresh)
    }
  }, [])

  return { ...snapshot, error }
}

export default function AdminCatalogProductsPage() {
  const { shops, products, error } = useCatalogSnapshot()
  const [search, setSearch] = useState('')

  const filteredShops = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    return shops.filter((shop) => {
      if (!query || `${shop.name} ${shop.shopId} ${shop.slug}`.toLocaleLowerCase('vi').includes(query)) return true
      return products.some((product) => (
        String(product.shopId) === String(shop.shopId)
        && `${product.name} ${product.id} ${product.shop}`.toLocaleLowerCase('vi').includes(query)
      ))
    })
  }, [products, search, shops])

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Sản phẩm theo cửa hàng</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Chọn một shop để xem danh sách sản phẩm và mở trang chi tiết quản trị chỉ xem.</p>
        </div>
        <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-green-50 px-3 text-sm font-semibold text-[#056F1C]">
          <Store className="h-4 w-4" aria-hidden="true" />
          {shops.length} cửa hàng
        </span>
      </header>

      <LoadingError error={error} />

      <section aria-label="Tìm cửa hàng" className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02]">
        <label className="relative block max-w-xl">
          <span className="sr-only">Tìm theo tên hoặc mã cửa hàng</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên shop hoặc mã cửa hàng"
            className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
      </section>

      {filteredShops.length ? (
        <section aria-label="Danh sách cửa hàng" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop) => (
            <Link
              key={shop.shopId}
              to={`/admin/catalog/products/${encodeURIComponent(shop.shopId)}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02] transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
            >
              <div className="flex min-h-28 items-center gap-4 bg-gradient-to-r from-[#056F1C] to-[#0d8c31] p-5 text-white">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 text-2xl font-bold">
                  {shop.avatarImage
                    ? <img src={shop.avatarImage} alt="" className="h-full w-full object-cover" />
                    : shop.initial || shop.name?.trim().charAt(0).toLocaleUpperCase('vi')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-bold">{shop.name}</span>
                  <span className="mt-1 block truncate text-xs text-white/75">Mã shop: {shop.shopId}</span>
                </span>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-gray-600">{shop.description || 'Chưa có mô tả cửa hàng.'}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm">
                  <span className="inline-flex items-center gap-2 text-gray-600">
                    <Package className="h-4 w-4 text-[#056F1C]" aria-hidden="true" />
                    <strong className="text-gray-900">{shop.productCount}</strong> sản phẩm
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#056F1C]">
                    Mở cửa hàng <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        !error && <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center text-sm text-gray-500">Không tìm thấy cửa hàng phù hợp.</div>
      )}
    </main>
  )
}

export function AdminShopProductsPage() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const { shops, products, categories, error } = useCatalogSnapshot()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [auctionOnly, setAuctionOnly] = useState(false)
  const shop = shops.find((item) => String(item.shopId) === String(shopId))

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    return products.filter((product) => {
      const matchesShop = String(product.shopId) === String(shopId)
      const searchText = `${product.name} ${product.id} ${product.shop}`.toLocaleLowerCase('vi')
      const matchesStatus = !statusFilter || product.status === statusFilter
      const matchesCategory = !categoryFilter || String(product.categoryId) === categoryFilter
      const isAuctionProduct = ['auction_pending', 'auction_locked'].includes(product.status)
        || product.isAuctionProduct === true
        || Boolean(product.auctionItemId)
      return matchesShop
        && (!query || searchText.includes(query))
        && matchesStatus
        && matchesCategory
        && (!auctionOnly || isAuctionProduct)
    })
  }, [auctionOnly, categoryFilter, products, search, shopId, statusFilter])

  if (!error && !shop) {
    return (
      <main className="mx-auto w-full max-w-[1500px]">
        <Link to="/admin/catalog/products" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Tất cả cửa hàng
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Không tìm thấy cửa hàng</h1>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/catalog/products" className="hover:text-[#056F1C]">Cửa hàng</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium text-gray-800">{shop?.name || 'Đang tải shop'}</span>
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to="/admin/catalog/products" className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#056F1C] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Danh sách cửa hàng
          </Link>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{shop?.name || 'Sản phẩm của cửa hàng'}</h1>
          <p className="mt-1 text-sm text-gray-500">Mã shop: {shop?.shopId || shopId} · {shop?.productCount ?? 0} sản phẩm</p>
        </div>
      </header>
      <LoadingError error={error} />

      <section aria-label="Tìm và lọc sản phẩm" className="mt-5 grid items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] md:grid-cols-2 xl:grid-cols-[minmax(190px,1.3fr)_minmax(190px,1.1fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto]">
        <label className="relative block">
          <span className="sr-only">Tìm theo tên, mã sản phẩm hoặc cửa hàng</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tên, mã sản phẩm hoặc shop"
            className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo cửa hàng</span>
          <select
            value={shop?.shopId ?? ''}
            onChange={(event) => {
              if (event.target.value) navigate(`/admin/catalog/products/${encodeURIComponent(event.target.value)}`)
            }}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
          >
            {shops.map((item) => <option key={item.shopId} value={String(item.shopId)}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo danh mục</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15">
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái hiển thị</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={auctionOnly} onChange={(event) => setAuctionOnly(event.target.checked)} className="h-4 w-4 accent-[#056F1C]" />
          Có gắn đấu giá
        </label>
      </section>

      {visibleProducts.length ? (
        <section aria-label="Sản phẩm cửa hàng" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              to={`/admin/catalog/products/${encodeURIComponent(shop.shopId)}/${encodeURIComponent(product.id)}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02] transition hover:border-green-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <ProductImage product={product} className="transition duration-200 group-hover:scale-[1.02]" />
                <span className="absolute left-3 top-3"><ProductStatus status={product.status} /></span>
                {['auction_pending', 'auction_locked'].includes(product.status) && (
                  <span className="absolute right-3 top-3 rounded-full bg-violet-950/85 px-2.5 py-1 text-xs font-semibold text-white">Đấu giá</span>
                )}
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 min-h-12 font-semibold leading-6 text-gray-900">{product.name}</h2>
                <p className="mt-1 text-xs text-gray-500">Mã: {product.id}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#056F1C]">{formatVND(product.price)}</span>
                  <span className="text-xs text-gray-500">Tồn kho: {Number.isFinite(Number(product.stock)) ? product.stock : '—'}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span className="truncate">{product.category || 'Chưa phân loại'}</span>
                  <span className="shrink-0">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        !error && <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center text-sm text-gray-500">Không có sản phẩm phù hợp với bộ lọc.</div>
      )}
    </main>
  )
}

function RatingStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} trên 5 sao`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
      ))}
    </span>
  )
}

function getDetail(product, reviews) {
  if (PRODUCTS.some((item) => item.id === product.id)) {
    return getProductDetailMock(product, reviews)
  }
  const productReviews = reviews.filter((review) => review.productId === product.id)
  const ratingAverage = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : 0
  return {
    description: product.description || 'Sản phẩm chưa có mô tả.',
    ratingAverage,
    reviewCount: productReviews.length,
    reviews: productReviews,
    ratingCounts: Object.fromEntries([1, 2, 3, 4, 5].map((rating) => [
      rating,
      productReviews.filter((review) => review.rating === rating).length,
    ])),
  }
}

export function AdminProductDetailPage() {
  const { shopId, productId } = useParams()
  const [record, setRecord] = useState({ shop: null, product: null, categories: [], reviews: [] })
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const refresh = () => {
      try {
        const product = getAdminCatalogProduct(shopId, productId)
        setRecord({
          shop: getAdminCatalogShop(shopId),
          product,
          categories: getCategories(),
          reviews: getMockProductReviews(),
        })
        setError('')
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải chi tiết sản phẩm.')
      }
    }
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [productId, shopId])

  useEffect(() => {
    setActiveImage(0)
  }, [productId])

  const { product, shop, categories, reviews } = record
  const detail = product ? getDetail(product, reviews) : null
  const gallery = product ? (product.images?.length ? product.images : product.image ? [product.image] : ['']) : []
  const category = product
    ? categories.find((item) => String(item.id) === String(product.categoryId))?.name ?? product.category
    : ''

  if (!error && !product) {
    return (
      <main className="mx-auto w-full max-w-[1500px]">
        <Link to={`/admin/catalog/products/${encodeURIComponent(shopId)}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Quay lại sản phẩm cửa hàng
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
      </main>
    )
  }

  const isHiddenByReport = product?.isHiddenByReport === true || product?.hideSource === 'report'

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/catalog/products" className="hover:text-[#056F1C]">Cửa hàng</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link to={`/admin/catalog/products/${encodeURIComponent(shopId)}`} className="max-w-[14rem] truncate hover:text-[#056F1C]">{shop?.name || 'Sản phẩm'}</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="max-w-[16rem] truncate text-gray-800">{product?.name || 'Chi tiết sản phẩm'}</span>
      </nav>

      <Link to={`/admin/catalog/products/${encodeURIComponent(shopId)}`} className="mb-4 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#056F1C] hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Quay lại cửa hàng
      </Link>
      <LoadingError error={error} />

      {product && detail && (
        <>
          <section className="grid gap-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:p-7">
            <div className="min-w-0">
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                {gallery[activeImage]
                  ? <img src={gallery[activeImage]} alt={`${product.name} — ảnh ${activeImage + 1}`} className="h-full w-full object-contain" />
                  : <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-50 via-gray-100 to-amber-50 text-[#056F1C]/45"><ImageIcon className="h-16 w-16" strokeWidth={1.2} aria-hidden="true" /><span className="text-sm text-gray-500">Chưa có ảnh sản phẩm</span></div>}
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1}`}
                      aria-pressed={activeImage === index}
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImage === index ? 'border-[#056F1C]' : 'border-gray-200'}`}
                    >
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ProductStatus status={product.status} />
                {['auction_pending', 'auction_locked'].includes(product.status) && (
                  <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">Sản phẩm đang gắn với quy trình đấu giá</span>
                )}
              </div>
              <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="mt-2 text-sm text-gray-500">Mã sản phẩm: {product.id}</p>
              <p className="mt-5 text-3xl font-bold tracking-tight text-[#056F1C]">{formatVND(product.price)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-gray-100 py-4 text-sm">
                <span className="inline-flex items-center gap-2 text-gray-700">
                  <RatingStars rating={detail.ratingAverage} />
                  {detail.reviewCount ? detail.ratingAverage.toFixed(1) : 'Chưa có đánh giá'}
                </span>
                <span className="text-gray-500">{detail.reviewCount.toLocaleString('vi-VN')} đánh giá</span>
                <span className="text-gray-500">Đã bán {Number.isFinite(Number(product.sold)) ? product.sold : '—'}</span>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Cửa hàng</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 font-semibold text-gray-900"><Store className="h-4 w-4 text-[#056F1C]" aria-hidden="true" />{shop?.name || product.shop || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Danh mục</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{category || 'Chưa phân loại'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Tồn kho</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{Number.isFinite(Number(product.stock)) ? product.stock : '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Ngày tạo</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-gray-900"><CalendarDays className="h-4 w-4 text-gray-400" aria-hidden="true" />{formatDate(product.createdAt)}</dd>
                </div>
                {shop?.address && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500">Địa chỉ shop</dt>
                    <dd className="mt-1 inline-flex items-start gap-1.5 font-medium text-gray-800"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />{shop.address}</dd>
                  </div>
                )}
              </dl>

              {isHiddenByReport && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Sản phẩm đang bị ẩn do báo cáo</p>
                  {product.reportCaseId && (
                    <Link to={`/admin/moderation?caseId=${encodeURIComponent(product.reportCaseId)}`} className="mt-2 inline-flex font-semibold underline underline-offset-2">
                      Mở case {product.reportCaseId}
                    </Link>
                  )}
                  {!product.reportCaseId && <p className="mt-1">Chưa có mã case được liên kết trong dữ liệu mô phỏng.</p>}
                </div>
              )}
              {product.status === 'hidden' && !isHiddenByReport && (
                <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Sản phẩm hiện đang ẩn. Dữ liệu mock không xác định trạng thái ẩn này có liên quan đến report hay không.
                </p>
              )}
              <p className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600">
                Chế độ quản trị chỉ xem. Không thể mua hàng, đánh giá hoặc bình luận tại trang này.
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-7">
            <h2 className="text-xl font-bold text-gray-900">Mô tả sản phẩm</h2>
            <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-gray-700">{detail.description}</p>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-7">
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Đánh giá và bình luận</h2>
                <p className="mt-1 text-sm text-gray-500">Nội dung khách hàng chỉ được hiển thị để Admin xem xét.</p>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {detail.reviewCount ? `${detail.ratingAverage.toFixed(1)} / 5 · ${detail.reviewCount} đánh giá` : 'Chưa có đánh giá'}
              </div>
            </header>

            {detail.reviews.length ? (
              <div className="divide-y divide-gray-100">
                {detail.reviews.map((review) => (
                  <article key={review.id} className="py-5 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-semibold text-gray-900">{review.name || 'Người mua'}</h3>
                      <time className="ml-auto text-xs text-gray-500" dateTime={review.date}>{formatDate(review.date)}</time>
                    </div>
                    <div className="mt-2"><RatingStars rating={review.rating || 0} /></div>
                    {review.text?.trim() && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{review.text}</p>}
                    {review.photos?.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.photos.map((photo, index) => (
                          <img key={`${review.id}-photo-${index}`} src={photo} alt={`Ảnh đánh giá ${index + 1}`} className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                        ))}
                      </div>
                    ) : review.hasPhotos && <p className="mt-2 text-xs text-gray-500">Người mua có đính kèm ảnh.</p>}
                    <p className="mt-3 text-xs text-gray-400">Lượt hữu ích: {Number.isFinite(Number(review.helpful)) ? review.helpful : 0}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">Sản phẩm chưa có đánh giá hoặc bình luận.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}
