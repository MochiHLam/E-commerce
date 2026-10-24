import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, Flag, ImageIcon, ImagePlus, MapPin,
  MessageCircle, Minus, Package, Plus, ShieldCheck, ShoppingCart, Star, ThumbsUp, Truck, X,
} from 'lucide-react'
import Pagination from '@/components/Pagination'
import ReportEvidenceFields from '@/components/ReportEvidenceFields'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatVND } from '@/lib/format'
import { getCheckoutMockOrders, getOrderItems, MOCK_ORDERS } from '@/mocks/account/orders'
import { getMockProductReviews, getProductDetailMock, saveMockProductReview } from '@/mocks/productDetails'
import { MOCK_SHOPS } from '@/mocks/mockShops'
import { PRODUCTS } from '@/mocks/products'

const RATINGS = [5, 4, 3, 2, 1]
const REVIEWS_PER_PAGE = 8
const MAX_REVIEW_IMAGES = 3
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024
const REPORT_REASONS = {
  product: [
    ['misleading', 'Thông tin hoặc hình ảnh gây hiểu nhầm'],
    ['counterfeit', 'Nghi ngờ hàng giả, hàng nhái'],
    ['prohibited', 'Sản phẩm thuộc danh mục bị cấm'],
    ['other', 'Lý do khác'],
  ],
  review: [
    ['irrelevant', 'Nội dung không liên quan đến sản phẩm'],
    ['offensive', 'Ngôn từ xúc phạm hoặc không phù hợp'],
    ['false', 'Nội dung sai lệch hoặc gây hiểu nhầm'],
    ['spam', 'Spam hoặc quảng cáo'],
    ['other', 'Lý do khác'],
  ],
}

function Stars({ rating, size = 'h-4 w-4', fillClass = 'fill-amber-400 text-amber-400' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {RATINGS.slice().reverse().map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= Math.round(rating) ? fillClass : 'text-gray-300'}`}
        />
      ))}
    </span>
  )
}

function ProductArtwork({ product, slide }) {
  const backgrounds = ['from-emerald-50 to-green-100', 'from-slate-100 to-gray-200', 'from-amber-50 to-orange-100']
  const image = product.images?.[slide] || product.image
  return image ? (
    <img
      src={image}
      alt={`${product.name} - ảnh ${slide + 1}`}
      loading={slide === 0 ? 'eager' : 'lazy'}
      fetchPriority={slide === 0 ? 'high' : 'auto'}
      className="h-full w-full object-contain"
    />
  ) : (
    <div className={`flex h-full flex-col items-center justify-center bg-gradient-to-br ${backgrounds[slide % backgrounds.length]} p-6 text-center`}>
      <ImageIcon className="mb-4 h-20 w-20 text-[#056F1C]/35" strokeWidth={1.2} />
      <span className="max-w-sm text-lg font-semibold text-gray-600">{product.name}</span>
      <span className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-400">Ảnh sản phẩm đang cập nhật</span>
    </div>
  )
}

async function compressReviewImage(file) {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Không thể xử lý ảnh đã chọn.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.78)
  } finally {
    bitmap.close()
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn } = useAuth()
  const { items: cartItems, addToCart } = useCart()
  const product = PRODUCTS.find((item) => item.id === id)
  const [savedReviews, setSavedReviews] = useState(() => getMockProductReviews())
  const detail = useMemo(
    () => (product ? getProductDetailMock(product, savedReviews) : null),
    [product, savedReviews],
  )
  const reviewOrderId = new URLSearchParams(location.search).get('reviewOrderId')
  const reviewOrder = useMemo(() => {
    if (!reviewOrderId || !product) return null
    return [...getCheckoutMockOrders(), ...MOCK_ORDERS].find((order) => (
      (order.id === reviewOrderId || order.legacyOrderIds?.includes(reviewOrderId))
      && order.status === 'completed'
      && getOrderItems(order).some((item) => (
        item.productId === product.id || item.productName === product.name
      ))
    )) ?? null
  }, [product, reviewOrderId])
  const hasReviewedOrder = savedReviews.some((review) => (
    (review.orderId === reviewOrderId
      || review.orderId === reviewOrder?.id
      || reviewOrder?.legacyOrderIds?.includes(review.orderId))
      && review.productId === product?.id
  ))
  const [selectedVariantId, setSelectedVariantId] = useState(detail?.variants[0]?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const [activeSlide, setActiveSlide] = useState(0)
  const [canSlideLeft, setCanSlideLeft] = useState(false)
  const [canSlideRight, setCanSlideRight] = useState(true)
  const [notice, setNotice] = useState('')
  const [isCartAddedPopupOpen, setIsCartAddedPopupOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportValidationErrors, setReportValidationErrors] = useState({})
  const [reportImages, setReportImages] = useState([])
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reviewFilter, setReviewFilter] = useState('all')
  const [reviewSort, setReviewSort] = useState('helpful')
  const [reviewPage, setReviewPage] = useState(1)
  const [likedReviews, setLikedReviews] = useState({})
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewImages, setReviewImages] = useState([])
  const [reviewImagePreviews, setReviewImagePreviews] = useState([])
  const [reviewImageError, setReviewImageError] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [expandedReviewImage, setExpandedReviewImage] = useState(null)

  const galleryRef = useRef(null)
  const reviewImagesInputId = reviewOrder ? `review-images-${reviewOrder.id}` : 'review-images'

  useEffect(() => {
    const previews = reviewImages.map((file) => URL.createObjectURL(file))
    setReviewImagePreviews(previews)
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [reviewImages])

  useEffect(() => {
    if (!expandedReviewImage) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpandedReviewImage(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [expandedReviewImage])

  const variant = detail?.variants.find((item) => item.id === selectedVariantId) ?? detail?.variants[0]
  const shop = product ? MOCK_SHOPS.find((item) => item.slug === product.shopSlug) : null
  const shopProductCount = shop ? PRODUCTS.filter((item) => item.shopSlug === shop.slug).length : 0
  const cartQuantity = cartItems.find(
    (item) => item.id === product?.id && item.variantId === variant?.id,
  )?.quantity ?? 0
  const availableQuantity = variant ? Math.max(variant.stock - cartQuantity, 0) : 0
  const reviews = useMemo(() => {
    if (!detail) return []
    const filtered = detail.reviews.filter((review) => (
      reviewFilter === 'all'
      || (reviewFilter === 'comment' && Boolean(review.text?.trim()))
      || (reviewFilter === 'photos' && review.hasPhotos)
      || review.rating === Number(reviewFilter)
    ))
    return filtered.sort((first, second) => {
      if (reviewSort === 'newest') return second.date.localeCompare(first.date)
      const firstLikes = first.helpful + (likedReviews[first.id] ? 1 : 0)
      const secondLikes = second.helpful + (likedReviews[second.id] ? 1 : 0)
      return secondLikes - firstLikes || second.date.localeCompare(first.date)
    })
  }, [detail, reviewFilter, reviewSort, likedReviews])
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE)
  const visibleReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  )

  useEffect(() => {
    if (location.hash !== '#reviews') return undefined
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [id, location.hash, location.search])

  const checkGalleryScroll = useCallback(() => {
    const gallery = galleryRef.current
    if (!gallery) return
    setCanSlideLeft(gallery.scrollLeft > 2)
    setCanSlideRight(gallery.scrollLeft + gallery.clientWidth < gallery.scrollWidth - 2)
    setActiveSlide(Math.round(gallery.scrollLeft / gallery.clientWidth))
  }, [])

  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return undefined
    checkGalleryScroll()
    gallery.addEventListener('scroll', checkGalleryScroll, { passive: true })
    window.addEventListener('resize', checkGalleryScroll)
    return () => {
      gallery.removeEventListener('scroll', checkGalleryScroll)
      window.removeEventListener('resize', checkGalleryScroll)
    }
  }, [checkGalleryScroll])

  useEffect(() => {
    setSelectedVariantId(detail?.variants[0]?.id ?? null)
    setActiveSlide(0)
    setQuantity(1)
    galleryRef.current?.scrollTo({ left: 0 })
  }, [id, detail])

  useEffect(() => {
    setReviewPage(1)
  }, [reviewFilter, reviewSort])

  if (!product || !detail) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
        <Link to="/search" className="mt-4 font-semibold text-[#056F1C] hover:underline">Quay lại tìm kiếm</Link>
      </main>
    )
  }

  const submitCartAction = (buyNow = false) => {
    if (!variant) {
      setNotice(`Vui lòng chọn ${detail.optionLabel.toLocaleLowerCase('vi-VN')} trước khi tiếp tục.`)
      return
    }
    if (variant.stock <= 0) {
      setNotice('Phân loại này hiện đã hết hàng.')
      return
    }
    const maxQuantity = buyNow ? variant.stock : availableQuantity
    if (quantity > maxQuantity) {
      setNotice(`Bạn chỉ có thể ${buyNow ? 'mua tối đa' : 'thêm tối đa'} ${maxQuantity} sản phẩm phân loại này.`)
      return
    }
    const checkoutItem = {
      id: product.id,
      variantId: variant.id,
      variantName: `${detail.optionLabel}: ${variant.label}`,
      variantLabel: variant.label,
      name: product.name,
      title: product.name,
      image: product.images?.[0] || product.image,
      price: variant.price,
      quantity,
      shop: product.shop,
      shopSlug: product.shopSlug,
    }
    if (buyNow) {
      navigate('/checkout', { state: { items: [checkoutItem] } })
      return
    }
    addToCart(checkoutItem)
    setNotice('')
    setIsCartAddedPopupOpen(true)
  }

  const setVariant = (nextVariant) => {
    setSelectedVariantId(nextVariant.id)
    setQuantity(1)
    setNotice(nextVariant.stock > 0 ? '' : 'Phân loại này hiện đã hết hàng.')
  }

  const slideGallery = (direction) => {
    const gallery = galleryRef.current
    if (!gallery) return
    gallery.scrollBy({ left: direction * gallery.clientWidth, behavior: 'smooth' })
  }

  const submitReport = (event) => {
    event.preventDefault()
    const errors = {}
    if (!reportReason) errors.reason = 'Vui lòng chọn lý do báo cáo.'
    if (reportReason === 'other' && !reportDetails.trim()) {
      errors.details = 'Vui lòng mô tả chi tiết khi chọn lý do khác.'
    }
    setReportValidationErrors(errors)
    if (Object.keys(errors).length) return
    setReportSubmitted(true)
  }

  const addReviewImages = (event) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    const accepted = []
    const errors = []

    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: chỉ chấp nhận tệp hình ảnh.`)
      } else if (file.size > MAX_REVIEW_IMAGE_SIZE) {
        errors.push(`${file.name}: ảnh vượt quá 5 MB.`)
      } else {
        accepted.push(file)
      }
    }

    const availableSlots = Math.max(0, MAX_REVIEW_IMAGES - reviewImages.length)
    if (accepted.length > availableSlots) {
      errors.push(`Chỉ có thể đính kèm tối đa ${MAX_REVIEW_IMAGES} ảnh.`)
    }
    setReviewImages((current) => [...current, ...accepted.slice(0, availableSlots)])
    setReviewImageError(errors.join(' '))
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!reviewOrder || hasReviewedOrder || isReviewSubmitting) return
    if (!reviewText.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá.')
      return
    }

    setIsReviewSubmitting(true)
    try {
      const photos = await Promise.all(reviewImages.map(compressReviewImage))
      saveMockProductReview({
        id: `${product.id}-review-order-${reviewOrder.id}`,
        orderId: reviewOrder.id,
        productId: product.id,
        name: user?.name?.trim() || 'Bạn',
        rating: reviewRating,
        text: reviewText.trim(),
        date: new Date().toISOString().slice(0, 10),
        hasPhotos: photos.length > 0,
        photos,
        helpful: 0,
      })
      setSavedReviews(getMockProductReviews())
      setReviewSubmitted(true)
      setReviewError('')
      setReviewPage(1)
      navigate(`/products/${encodeURIComponent(product.id)}#reviews`, { replace: true })
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Không thể lưu đánh giá. Vui lòng thử lại.')
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  const toggleReviewLike = (reviewId) => {
    setLikedReviews((current) => ({ ...current, [reviewId]: !current[reviewId] }))
    setReviewPage(1)
  }

  const openReportDialog = (target) => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: { returnTo: `${location.pathname}${location.search}${location.hash}` },
      })
      return
    }
    setReportTarget(target)
    setReportReason('')
    setReportDetails('')
    setReportValidationErrors({})
    setReportImages([])
    setReportSubmitted(false)
    setIsReportOpen(true)
  }

  const openShopChat = () => {
    if (!shop) return
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  const reportTitle = reportTarget?.type === 'review' ? 'Báo cáo đánh giá' : 'Báo cáo sản phẩm'

  const reportTargetLabel = reportTarget?.type === 'review'
    ? `Đánh giá của ${reportTarget.review.name}`
    : product?.name

  return (
    <main className="flex-1 bg-gray-50">
      {isCartAddedPopupOpen && (
        <div
          role="status"
          className="fixed right-4 top-20 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg sm:right-6"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#056F1C]">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Sản phẩm đã được thêm vào giỏ hàng</span>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setIsCartAddedPopupOpen(false)}
            className="ml-1 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:py-8 xl:px-0">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#056F1C]">Trang chủ</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/search" className="hover:text-[#056F1C]">Sản phẩm</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="line-clamp-1 text-gray-700">{product.name}</span>
        </nav>

        <section className="grid gap-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:p-7">
          <div>
            <div className="group/gallery relative">
              <div
                ref={galleryRef}
                aria-label="Thư viện ảnh sản phẩm"
                className="flex aspect-square snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl bg-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[0, 1, 2].map((slide) => (
                  <div key={slide} className="h-full w-full shrink-0 snap-center">
                    <ProductArtwork product={product} slide={slide} />
                  </div>
                ))}
              </div>
              {canSlideLeft && (
                <button type="button" aria-label="Ảnh trước" onClick={() => slideGallery(-1)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {canSlideRight && (
                <button type="button" aria-label="Ảnh tiếp theo" onClick={() => slideGallery(1)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md">
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2" aria-label="Chọn ảnh sản phẩm">
              {[0, 1, 2].map((slide) => (
                <button
                  key={slide}
                  type="button"
                  onClick={() => galleryRef.current?.scrollTo({
                    left: slide * (galleryRef.current?.clientWidth ?? 0),
                    behavior: 'smooth',
                  })}
                  aria-label={`Xem ảnh ${slide + 1}`}
                  aria-pressed={activeSlide === slide}
                  className={`h-2.5 rounded-full transition-all ${activeSlide === slide ? 'w-6 bg-[#056F1C]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="mt-3 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                  {detail.ratingAverage.toFixed(1)}
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                </span>
                <span aria-hidden="true" className="text-gray-300">|</span>
                <a href="#reviews" className="underline decoration-dotted underline-offset-4 hover:text-[#056F1C]">
                  {detail.reviewCount.toLocaleString('vi-VN')} đánh giá
                </a>
                <span aria-hidden="true" className="text-gray-300">|</span>
                <span>Đã bán {product.sold.toLocaleString('vi-VN')}</span>
              </div>
              <button
                type="button"
                onClick={() => openReportDialog({ type: 'product' })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-green-50 px-4 py-4">
              <span className="text-3xl font-bold text-[#056F1C]">{formatVND(variant?.price ?? product.price)}</span>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">{detail.optionLabel}</h2>
                {!variant && <span className="text-xs text-red-500">Bắt buộc chọn</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.variants.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.stock === 0}
                    onClick={() => setVariant(item)}
                    aria-pressed={selectedVariantId === item.id}
                    className={`min-h-10 rounded-lg border px-3 py-2 text-sm transition ${
                      item.stock === 0
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through'
                        : selectedVariantId === item.id
                          ? 'border-[#056F1C] bg-green-50 font-semibold text-[#056F1C] ring-1 ring-[#056F1C]'
                          : 'border-gray-300 text-gray-700 hover:border-[#056F1C]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-gray-800">Số lượng</span>
              <div className="inline-flex h-10 items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  className="px-3 text-gray-600 disabled:text-gray-300"
                ><Minus className="h-4 w-4" /></button>
                <span aria-live="polite" className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQuantity((current) => Math.min(current + 1, variant?.stock ?? 0))}
                  disabled={!variant || quantity >= variant.stock}
                  className="px-3 text-gray-600 disabled:text-gray-300"
                ><Plus className="h-4 w-4" /></button>
              </div>
              {variant && <span className="text-sm text-gray-500">Tồn kho: {variant.stock} sản phẩm</span>}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => submitCartAction(false)}
                disabled={Boolean(variant && (variant.stock === 0 || availableQuantity === 0))}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#056F1C] px-4 py-3 font-semibold text-[#056F1C] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
              >
                <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                onClick={() => submitCartAction(true)}
                disabled={Boolean(variant && variant.stock === 0)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#056F1C] px-4 py-3 font-semibold text-white transition hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Mua ngay
              </button>
            </div>
            {notice && <p role="alert" className="mt-3 text-sm text-red-600">{notice}</p>}

            <div className="mt-auto grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-xs text-gray-600"><Truck className="h-5 w-5 shrink-0 text-[#056F1C]" /> Giao hàng toàn quốc</div>
              <div className="flex items-center gap-2 text-xs text-gray-600"><ShieldCheck className="h-5 w-5 shrink-0 text-[#056F1C]" /> Đổi trả theo chính sách</div>
              <span />
            </div>
          </div>
        </section>

        {shop && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid md:grid-cols-[minmax(18rem,0.9fr)_1.1fr]">
              <div
                className="bg-[#056F1C] p-6 text-white sm:p-8"
                style={shop.coverImage ? {
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("${shop.coverImage}")`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                } : undefined}
              >
                <Link to={`/${shop.slug}`} className="flex items-center gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/80 bg-[#056F1C] text-3xl font-bold text-white shadow-md">
                    {shop.avatarImage ? (
                      <img src={shop.avatarImage} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#d9d9d9] text-xl font-semibold text-black">
                        {shop.name.trim().charAt(0).toLocaleUpperCase('vi-VN')}
                      </span>
                    )}
                  </span>
                  <h2 className="min-w-0 break-words text-xl font-bold sm:text-2xl">{shop.name}</h2>
                </Link>
                <p className="mt-5 text-sm leading-relaxed text-white/85">{shop.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openShopChat}
                    className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md border border-white bg-white px-5 py-2 text-sm font-semibold text-[#056F1C] transition hover:bg-gray-100"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat
                  </button>
                  <Link
                    to={`/${shop.slug}`}
                    className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md border border-white/80 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Xem shop <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <dl className="grid content-center gap-x-8 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 shrink-0 text-[#056F1C]" />
                  <div>
                    <dt className="text-xs text-gray-500">Sản phẩm</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{shopProductCount} sản phẩm</dd>
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
          </section>
        )}

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-gray-900">Mô tả sản phẩm</h2>
          <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-gray-700">{detail.description}</p>
          <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 text-sm sm:grid-cols-3">
            <p><span className="font-semibold">Danh mục: </span>{product.category}</p>
            <p><span className="font-semibold">Shop: </span>{product.shop}</p>
            <p><span className="font-semibold">Đổi trả: </span>Hỗ trợ theo chính sách của NaviShop</p>
          </div>
        </section>

        <section id="reviews" className="mt-7 scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          {reviewOrder && !hasReviewedOrder && !reviewSubmitted && (
            <form onSubmit={submitReview} className="mt-5 rounded-xl border border-green-200 bg-green-50/60 p-4 sm:p-5">
              <h3 className="font-semibold text-gray-900">Đánh giá sản phẩm đã mua</h3>
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-gray-700">Mức độ hài lòng</legend>
                <div className="mt-2 flex gap-1">
                  {RATINGS.slice().reverse().map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      aria-label={`${rating} sao`}
                      aria-pressed={reviewRating === rating}
                      onClick={() => setReviewRating(rating)}
                      className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                    >
                      <Star className={`h-7 w-7 ${rating <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="order-product-review" className="mt-4 block text-sm font-medium text-gray-700">
                Nội dung đánh giá
              </label>
              <textarea
                id="order-product-review"
                value={reviewText}
                onChange={(event) => {
                  setReviewText(event.target.value)
                  setReviewError('')
                }}
                rows={4}
                maxLength={1000}
                aria-invalid={Boolean(reviewError)}
                className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${reviewError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
              />
              {reviewError && <p role="alert" className="mt-1 text-xs text-red-600">{reviewError}</p>}
              <div className="mt-4">
                <label
                  htmlFor={reviewImagesInputId}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    reviewImages.length >= MAX_REVIEW_IMAGES
                      ? 'cursor-not-allowed border-gray-200 text-gray-400'
                      : 'border-gray-300 text-gray-700 hover:border-[#056F1C] hover:text-[#056F1C]'
                  }`}
                >
                  <ImagePlus className="h-4 w-4" />
                  Thêm ảnh
                </label>
                <input
                  id={reviewImagesInputId}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={addReviewImages}
                  disabled={reviewImages.length >= MAX_REVIEW_IMAGES}
                  className="sr-only"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tối đa {MAX_REVIEW_IMAGES} ảnh, mỗi ảnh không quá 5 MB.
                </p>
                {reviewImageError && <p role="alert" className="mt-1 text-xs text-red-600">{reviewImageError}</p>}
                {reviewImages.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-3">
                  {reviewImages.map((file, index) => (
                    <li key={`${file.name}-${file.lastModified}-${index}`} className="relative">
                      {reviewImagePreviews[index] && (
                        <img
                          src={reviewImagePreviews[index]}
                          alt={`Ảnh đánh giá ${index + 1}`}
                          className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                        />
                      )}
                        <button
                          type="button"
                          aria-label={`Xóa ảnh đánh giá ${index + 1}`}
                          onClick={() => {
                            setReviewImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
                            setReviewImageError('')
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white transition hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isReviewSubmitting}
                  className="rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517] disabled:cursor-wait disabled:opacity-60"
                >
                  {isReviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          )}
          {reviewSubmitted && (
            <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
              Đánh giá của bạn đã được lưu.
            </p>
          )}
          <div className="mt-5 grid gap-5 border-b border-gray-100 pb-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
            <div className="flex flex-col items-start justify-center">
              <div className="text-3xl font-medium text-[#ee4d2d]">
                {detail.ratingAverage.toFixed(1)} <span className="text-base">trên 5</span>
              </div>
              <Stars rating={detail.ratingAverage} size="h-5 w-5" fillClass="fill-[#ee4d2d] text-[#ee4d2d]" />
            </div>
            <div className="flex flex-wrap content-center gap-2">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                aria-pressed={reviewFilter === 'all'}
                className={`min-h-9 border px-3 py-1.5 text-sm transition ${reviewFilter === 'all' ? 'border-[#ee4d2d] text-[#ee4d2d]' : 'border-gray-200 text-gray-700 hover:border-[#ee4d2d]'}`}
              >
                Tất cả
              </button>
              {RATINGS.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewFilter((current) => current === String(rating) ? 'all' : String(rating))}
                  aria-pressed={reviewFilter === String(rating)}
                  className={`min-h-9 border px-3 py-1.5 text-sm transition ${reviewFilter === String(rating) ? 'border-[#ee4d2d] text-[#ee4d2d]' : 'border-gray-200 text-gray-700 hover:border-[#ee4d2d]'}`}
                >
                  {rating} Sao ({detail.ratingCounts[rating]})
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReviewFilter((current) => current === 'comment' ? 'all' : 'comment')}
                aria-pressed={reviewFilter === 'comment'}
                className={`min-h-9 border px-3 py-1.5 text-sm transition ${reviewFilter === 'comment' ? 'border-[#ee4d2d] text-[#ee4d2d]' : 'border-gray-200 text-gray-700 hover:border-[#ee4d2d]'}`}
              >
                Có Bình Luận ({detail.reviews.filter((review) => Boolean(review.text?.trim())).length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter((current) => current === 'photos' ? 'all' : 'photos')}
                aria-pressed={reviewFilter === 'photos'}
                className={`min-h-9 border px-3 py-1.5 text-sm transition ${reviewFilter === 'photos' ? 'border-[#ee4d2d] text-[#ee4d2d]' : 'border-gray-200 text-gray-700 hover:border-[#ee4d2d]'}`}
              >
                Có Hình Ảnh ({detail.reviews.filter((review) => review.hasPhotos).length})
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              Sắp xếp
              <select value={reviewSort} onChange={(event) => setReviewSort(event.target.value)} className="h-9 rounded-lg border border-gray-300 bg-white px-2 outline-none focus:border-[#056F1C]">
                <option value="helpful">Nhiều like nhất</option>
                <option value="newest">Mới nhất</option>
              </select>
            </label>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {visibleReviews.length ? visibleReviews.map((review) => (
              <article key={review.id} className="py-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-gray-900">{review.name}</span>
                  <time className="ml-auto text-xs text-gray-500" dateTime={review.date}>{new Date(`${review.date}T00:00:00`).toLocaleDateString('vi-VN')}</time>
                </div>
                <div className="mt-2"><Stars rating={review.rating} /></div>
                {review.text?.trim() && <p className="mt-2 text-sm leading-6 text-gray-700">{review.text}</p>}
                {review.photos?.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.photos.map((photo, index) => (
                      <button
                        key={`${review.id}-photo-${index}`}
                        type="button"
                        onClick={() => setExpandedReviewImage({
                          src: photo,
                          alt: `Ảnh đánh giá ${index + 1} của ${review.name}`,
                        })}
                        aria-label={`Xem ảnh đánh giá ${index + 1} của ${review.name}`}
                        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
                      >
                        <img
                          src={photo}
                          alt={`Ảnh đánh giá ${index + 1}`}
                          className="h-20 w-20 rounded-lg border border-gray-200 object-cover transition hover:opacity-90"
                        />
                      </button>
                    ))}
                  </div>
                ) : review.hasPhotos && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500"><ImageIcon className="h-4 w-4" /> Có hình ảnh</span>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label={`${likedReviews[review.id] ? 'Bỏ thích' : 'Thích'} đánh giá, ${review.helpful + (likedReviews[review.id] ? 1 : 0)} lượt thích`}
                    aria-pressed={Boolean(likedReviews[review.id])}
                    onClick={() => toggleReviewLike(review.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition ${likedReviews[review.id] ? 'text-[#056F1C]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#056F1C]'}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${likedReviews[review.id] ? 'fill-current' : ''}`} />
                    <span>{review.helpful + (likedReviews[review.id] ? 1 : 0)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openReportDialog({ type: 'review', review })}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Flag className="h-4 w-4" /> Report
                  </button>
                </div>
              </article>
            )) : (
              <p className="py-10 text-center text-sm text-gray-500">Không có đánh giá phù hợp với bộ lọc.</p>
            )}
          </div>
          {totalReviewPages > 1 && (
            <Pagination
              page={reviewPage}
              totalPages={totalReviewPages}
              onChange={(nextPage) => {
                setReviewPage(nextPage)
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              label="Phân trang đánh giá sản phẩm"
            />
          )}
        </section>
      </div>
      {isReportOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsReportOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="report-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="report-title" className="text-lg font-bold text-gray-900">
                  {reportTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {reportTargetLabel}
                </p>
                {reportTarget?.type === 'review' && reportTarget.review.text && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-700">{reportTarget.review.text}</p>
                )}
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setIsReportOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">×</button>
            </div>
            {reportSubmitted ? (
              <div role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Giao diện báo cáo đã ghi nhận lựa chọn của bạn trong phiên này. Báo cáo chưa được gửi lên máy chủ vì trang hiện đang dùng dữ liệu mock.
              </div>
            ) : (
              <form onSubmit={submitReport} className="mt-5">
                <label htmlFor="report-reason" className="text-sm font-semibold text-gray-800">Lý do báo cáo</label>
                <select
                  id="report-reason"
                  value={reportReason}
                  aria-invalid={Boolean(reportValidationErrors.reason)}
                  aria-describedby={reportValidationErrors.reason ? 'report-reason-error' : undefined}
                  onChange={(event) => {
                    setReportReason(event.target.value)
                    setReportValidationErrors((current) => ({ ...current, reason: '', details: '' }))
                  }}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-[#056F1C] ${
                    reportValidationErrors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="" disabled>Chọn lý do</option>
                  {(REPORT_REASONS[reportTarget?.type] ?? REPORT_REASONS.product).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {reportValidationErrors.reason && (
                  <p id="report-reason-error" role="alert" className="mt-1 text-xs text-red-600">
                    {reportValidationErrors.reason}
                  </p>
                )}
                <ReportEvidenceFields
                  details={reportDetails}
                  onDetailsChange={(value) => {
                    setReportDetails(value)
                    setReportValidationErrors((current) => ({ ...current, details: '' }))
                  }}
                  images={reportImages}
                  onImagesChange={setReportImages}
                  idPrefix="product-report"
                  allowImages={reportTarget?.type === 'product'}
                  detailsRequired={reportReason === 'other'}
                  detailsError={reportValidationErrors.details}
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsReportOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]">Gửi báo cáo</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {expandedReviewImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExpandedReviewImage(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Ảnh đánh giá chi tiết"
            className="relative flex max-h-[90vh] max-w-[min(90vw,1000px)] items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setExpandedReviewImage(null)}
              aria-label="Đóng ảnh"
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-gray-800 shadow transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={expandedReviewImage.src}
              alt={expandedReviewImage.alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
          </section>
        </div>
      )}
    </main>
  )
}
