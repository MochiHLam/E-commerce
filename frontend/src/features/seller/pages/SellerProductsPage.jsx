import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/mocks/categories'
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerApplication,
  getSellerProducts,
  setSellerProductVisibility,
  updateSellerProduct,
} from '@/mocks/seller'
import { formatVND } from '@/lib/format'

const EMPTY_PRODUCT = {
  name: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  image: '',
}

const INPUT_CLASS = 'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15'

const STATUS_LABELS = {
  active: 'Đang bán',
  draft: 'Nháp',
  hidden: 'Đã ẩn',
  auction_pending: 'Chờ duyệt đấu giá',
  auction_locked: 'Đang ở kho đấu giá',
}

const STATUS_TONES = {
  active: 'bg-green-50 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  hidden: 'bg-amber-50 text-amber-800',
  auction_pending: 'bg-violet-50 text-violet-800',
  auction_locked: 'bg-blue-50 text-blue-800',
}

function getProductStatus(product) {
  return product.status || 'draft'
}

function getLastUpdated(product) {
  const value = product.updatedAt || product.createdAt
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

function ProductStatus({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] || 'Chưa xác định'}
    </span>
  )
}

function ProductActions({ product, disabled, onEdit, onVisibilityChange, onDelete }) {
  const status = getProductStatus(product)
  const isAuctionLocked = ['auction_pending', 'auction_locked'].includes(status)
  const canToggleVisibility = ['active', 'hidden'].includes(status)

  if (isAuctionLocked) {
    return <span className="text-xs text-gray-500">Đang trong quy trình đấu giá</span>
  }

  return (
    <details className="group relative">
      <summary
        aria-label={`Hành động cho ${product.name}`}
        tabIndex={disabled ? -1 : 0}
        className={`flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] [&::-webkit-details-marker]:hidden ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <ChevronDown className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.currentTarget.closest('details').open = false
            onEdit(product)
          }}
          className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" /> Chỉnh sửa
        </button>
        {canToggleVisibility && (
          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.currentTarget.closest('details').open = false
              onVisibilityChange(product)
            }}
            className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-4 w-4 text-center">{status === 'hidden' ? '↗' : '◌'}</span>
            {status === 'hidden' ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.currentTarget.closest('details').open = false
            onDelete(product)
          }}
          className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> Xóa sản phẩm
        </button>
      </div>
    </details>
  )
}

function ProductImage({ image, name, className = '' }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400 ${className}`}>
      {image
        ? <img src={image} alt={name} className="h-full w-full object-cover" />
        : <Package className="h-6 w-6" aria-hidden="true" />}
    </div>
  )
}

function SummaryTile({ label, count, selected, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-w-[104px] flex-1 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] ${
        selected ? 'border-[#056F1C] bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="block text-xs font-medium text-gray-500">{label}</span>
      <span className="mt-1 block text-xl font-bold text-gray-900">{count}</span>
    </button>
  )
}

export default function SellerProductsPage() {
  const { user, isLoggedIn } = useAuth()
  const [products, setProducts] = useState(() => user ? getSellerProducts(user.id) : [])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [imageError, setImageError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  const application = getSellerApplication(user.id)
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'pending') return <Navigate to="/seller/pending" replace />
  if (!['approved', 'suspended', 'banned'].includes(application.status)) return <Navigate to="/seller/onboarding" replace />

  const isReadOnly = application.status === 'suspended' || application.status === 'banned'
  const stockFilter = searchParams.get('stock') || ''
  const statusFilter = searchParams.get('status') || ''
  const availableCategories = [...new Set(products.map((product) => product.category).filter(Boolean))]
  const statusCounts = products.reduce((counts, product) => {
    const status = getProductStatus(product)
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})
  const filteredProducts = products
    .filter((product) => (
      (!search || `${product.name} ${product.id}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')))
      && (!categoryFilter || product.category === categoryFilter)
      && (stockFilter !== 'out' || Number(product.stock) === 0)
      && (!statusFilter || getProductStatus(product) === statusFilter)
    ))
    .sort((left, right) => {
      if (sortBy === 'price-asc') return Number(left.price) - Number(right.price)
      if (sortBy === 'price-desc') return Number(right.price) - Number(left.price)
      if (sortBy === 'stock-asc') return Number(left.stock) - Number(right.stock)
      if (sortBy === 'stock-desc') return Number(right.stock) - Number(left.stock)
      return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0)
    })
  const hasProductFilters = Boolean(search || categoryFilter || stockFilter || statusFilter)
  const categoryOptions = [...new Set([...CATEGORIES.map((category) => category.name), ...availableCategories])]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'vi'))

  const resetForm = () => {
    setForm(EMPTY_PRODUCT)
    setEditingId(null)
    setError('')
    setImageError('')
    setIsFormOpen(false)
  }

  const openCreateForm = () => {
    setForm(EMPTY_PRODUCT)
    setEditingId(null)
    setError('')
    setImageError('')
    setIsFormOpen(true)
  }

  const editProduct = (product) => {
    if (['auction_pending', 'auction_locked'].includes(getProductStatus(product))) return
    setEditingId(product.id)
    setForm({
      name: product.name ?? '',
      category: product.category ?? '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      description: product.description ?? '',
      image: product.image ?? '',
    })
    setError('')
    setImageError('')
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setImageError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.')
      return
    }
    if (file.size > 1024 * 1024) {
      setImageError('Ảnh demo cần nhỏ hơn 1 MB để lưu trong trình duyệt.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setImageError('Không thể đọc ảnh đã chọn. Vui lòng thử lại.')
        return
      }
      setForm((current) => ({ ...current, image: reader.result }))
    }
    reader.onerror = () => setImageError('Không thể đọc ảnh đã chọn. Vui lòng thử lại.')
    reader.readAsDataURL(file)
  }

  const submitProduct = (event) => {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (!form.name.trim() || !form.category.trim() || !form.description.trim() || !form.image
      || !Number.isSafeInteger(price) || price <= 0
      || !Number.isSafeInteger(stock) || stock < 0) {
      setError('Vui lòng nhập đủ thông tin, chọn ít nhất một ảnh, nhập giá nguyên VND lớn hơn 0 và tồn kho nguyên không âm.')
      setToast('')
      return
    }

    try {
      const productData = {
        ...form,
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        stock,
      }
      const product = editingId
        ? updateSellerProduct(user.id, editingId, productData)
        : createSellerProduct(user.id, productData)
      setProducts((current) => editingId
        ? current.map((item) => (item.id === editingId ? product : item))
        : [product, ...current])
      setToast(editingId ? 'Đã cập nhật sản phẩm trong dữ liệu demo.' : 'Đã thêm sản phẩm nháp vào dữ liệu demo.')
      setError('')
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu sản phẩm.')
      setToast('')
    }
  }

  const changeVisibility = (product) => {
    const hide = getProductStatus(product) === 'active'
    try {
      const updated = setSellerProductVisibility(user.id, product.id, hide)
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)))
      setToast(hide ? 'Đã ẩn sản phẩm trong dữ liệu demo.' : 'Đã hiện sản phẩm trong dữ liệu demo.')
      setError('')
    } catch (visibilityError) {
      setError(visibilityError instanceof Error ? visibilityError.message : 'Không thể cập nhật trạng thái hiển thị.')
      setToast('')
    }
  }

  const removeProduct = (product) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}" khỏi dữ liệu demo?`)) return
    try {
      deleteSellerProduct(user.id, product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setToast('Đã xóa sản phẩm khỏi dữ liệu demo.')
      setError('')
      if (editingId === product.id) resetForm()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa sản phẩm.')
      setToast('')
    }
  }

  const updateStatusFilter = (status) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('stock')
    if (status) nextParams.set('status', status)
    else nextParams.delete('status')
    setSearchParams(nextParams)
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setSearchParams({})
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Sản phẩm</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Quản lý thông tin, tồn kho và trạng thái từng sản phẩm của shop.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        )}
      </header>

      {isReadOnly && (
        <p role="status" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          Shop đang ở chế độ chỉ xem. Bạn chưa thể thêm, sửa, ẩn hoặc xóa sản phẩm.
        </p>
      )}

      {toast && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <Check className="h-4 w-4 shrink-0" /> {toast}
          <span className="ml-auto text-xs text-green-800">Demo</span>
        </p>
      )}
      {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {isFormOpen && !isReadOnly && (
        <section aria-labelledby="seller-product-form-title" className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="seller-product-form-title" className="font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Sản phẩm mới được lưu ở trạng thái nháp; hiện chưa có quy trình đăng bán.
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng biểu mẫu sản phẩm"
              onClick={resetForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submitProduct} className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="seller-product-name" className="mb-1.5 block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input
                  id="seller-product-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className={INPUT_CLASS}
                  required
                  maxLength={120}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="seller-product-category" className="mb-1.5 block text-sm font-medium text-gray-700">Danh mục</label>
                  <select
                    id="seller-product-category"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className={INPUT_CLASS}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="seller-product-price" className="mb-1.5 block text-sm font-medium text-gray-700">Giá bán (VND)</label>
                  <input
                    id="seller-product-price"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="seller-product-stock" className="mb-1.5 block text-sm font-medium text-gray-700">Tồn kho</label>
                <input
                  id="seller-product-stock"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label htmlFor="seller-product-description" className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  id="seller-product-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                  required
                  maxLength={2000}
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Ảnh sản phẩm</span>
              <div className="flex flex-wrap items-start gap-4 rounded-xl border border-dashed border-gray-300 p-4">
                <ProductImage image={form.image} name={form.name || 'Ảnh xem trước'} className="h-28 w-28" />
                <div className="min-w-0 flex-1">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#056F1C]">
                    <ImagePlus className="h-4 w-4" />
                    {form.image ? 'Chọn ảnh khác' : 'Chọn ảnh'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                      aria-label="Chọn ảnh sản phẩm"
                    />
                  </label>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: '' })} className="ml-3 text-sm font-medium text-red-700 hover:underline">
                      Xóa ảnh
                    </button>
                  )}
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    JPEG, PNG hoặc WebP, tối đa 1 MB. Ảnh chỉ lưu trong mock localStorage của trình duyệt; không tải lên dịch vụ bên ngoài.
                  </p>
                  {imageError && <p role="alert" className="mt-2 text-xs text-red-700">{imageError}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4 lg:col-span-2">
              <button type="button" onClick={resetForm} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
                Đóng
              </button>
              <button type="submit" className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
                {editingId ? 'Lưu thay đổi' : 'Lưu sản phẩm nháp'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section aria-label="Tổng số sản phẩm theo trạng thái" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <SummaryTile
          label="Tất cả"
          count={products.length}
          selected={!statusFilter && !stockFilter}
          onClick={() => updateStatusFilter('')}
        />
        {statusCounts.active > 0 && (
          <SummaryTile label="Đang bán" count={statusCounts.active} selected={statusFilter === 'active'} onClick={() => updateStatusFilter('active')} />
        )}
        <SummaryTile label="Nháp" count={statusCounts.draft || 0} selected={statusFilter === 'draft'} onClick={() => updateStatusFilter('draft')} />
        <SummaryTile label="Hết hàng" count={products.filter((product) => Number(product.stock) === 0).length} selected={stockFilter === 'out'} onClick={() => {
          const nextParams = new URLSearchParams(searchParams)
          nextParams.delete('status')
          nextParams.set('stock', 'out')
          setSearchParams(nextParams)
        }} />
        {statusCounts.hidden > 0 && (
          <SummaryTile label="Đã ẩn" count={statusCounts.hidden} selected={statusFilter === 'hidden'} onClick={() => updateStatusFilter('hidden')} />
        )}
        {statusCounts.auction_pending > 0 && (
          <SummaryTile label="Chờ duyệt đấu giá" count={statusCounts.auction_pending} selected={statusFilter === 'auction_pending'} onClick={() => updateStatusFilter('auction_pending')} />
        )}
        {statusCounts.auction_locked > 0 && (
          <SummaryTile label="Trong kho đấu giá" count={statusCounts.auction_locked} selected={statusFilter === 'auction_locked'} onClick={() => updateStatusFilter('auction_locked')} />
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02] sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(200px,1.3fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)]">
          <div>
            <label htmlFor="seller-product-search" className="sr-only">Tìm theo tên hoặc mã sản phẩm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="seller-product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên hoặc mã sản phẩm"
                className={`${INPUT_CLASS} pl-9`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="seller-product-category-filter" className="sr-only">Lọc theo danh mục</label>
            <select id="seller-product-category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={INPUT_CLASS}>
              <option value="">Tất cả danh mục</option>
              {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="seller-product-sort" className="sr-only">Sắp xếp sản phẩm</label>
            <select id="seller-product-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={INPUT_CLASS}>
              <option value="newest">Cập nhật gần nhất</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
              <option value="stock-asc">Tồn kho: thấp đến cao</option>
              <option value="stock-desc">Tồn kho: cao đến thấp</option>
            </select>
          </div>
        </div>
        {hasProductFilters && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>{filteredProducts.length} / {products.length} sản phẩm phù hợp</span>
            <button type="button" onClick={clearFilters} className="font-semibold text-[#056F1C] hover:underline">Xóa bộ lọc</button>
          </div>
        )}
      </section>

      <section className="mt-5 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-gray-900">Danh sách sản phẩm</h2>
            <p className="mt-1 text-xs text-gray-500">Trạng thái được hiển thị theo dữ liệu mock của từng sản phẩm.</p>
          </div>
          <span className="text-xs font-medium text-gray-500">{filteredProducts.length} mục</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Package className="mx-auto h-9 w-9 text-gray-300" />
            <h3 className="mt-3 text-sm font-semibold text-gray-800">
              {products.length === 0 ? 'Chưa có sản phẩm' : 'Không có sản phẩm phù hợp'}
            </h3>
            <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-500">
              {products.length === 0
                ? 'Tạo sản phẩm đầu tiên. Sản phẩm mới sẽ ở trạng thái nháp cho đến khi có quy trình đăng bán.'
                : 'Thử thay đổi từ khóa hoặc bộ lọc để xem sản phẩm khác.'}
            </p>
            {!isReadOnly && products.length === 0 && (
              <button type="button" onClick={openCreateForm} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]">
                <Plus className="h-4 w-4" /> Thêm sản phẩm
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Sản phẩm</th>
                    <th scope="col" className="px-3 py-3 font-medium">Danh mục</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Giá</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Tồn kho</th>
                    <th scope="col" className="px-3 py-3 font-medium">Trạng thái</th>
                    <th scope="col" className="px-3 py-3 font-medium">Cập nhật</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const status = getProductStatus(product)
                    const locked = ['auction_pending', 'auction_locked'].includes(status)
                    return (
                      <tr key={product.id} className="align-middle">
                        <td className="px-5 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProductImage image={product.image} name={product.name} className="h-12 w-12" />
                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-semibold text-gray-900">{product.name}</p>
                              <p className="mt-1 max-w-56 truncate text-xs text-gray-500">Mã: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-40 truncate px-3 py-3 text-gray-600">{product.category || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-gray-800">{formatVND(product.price)}</td>
                        <td className={`px-3 py-3 text-right font-semibold ${Number(product.stock) === 0 ? 'text-red-700' : 'text-gray-800'}`}>
                          {product.stock ?? 0}
                        </td>
                        <td className="px-3 py-3"><ProductStatus status={status} /></td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">{getLastUpdated(product)}</td>
                        <td className="px-4 py-3 text-right">
                          <ProductActions
                            product={product}
                            disabled={isReadOnly || locked}
                            onEdit={editProduct}
                            onVisibilityChange={changeVisibility}
                            onDelete={removeProduct}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-gray-100 lg:hidden">
              {filteredProducts.map((product) => {
                const status = getProductStatus(product)
                const locked = ['auction_pending', 'auction_locked'].includes(status)
                return (
                  <li key={product.id} className="flex gap-3 p-4 sm:p-5">
                    <ProductImage image={product.image} name={product.name} className="h-16 w-16 sm:h-20 sm:w-20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
                          <p className="mt-1 truncate text-xs text-gray-500">Mã: {product.id}</p>
                        </div>
                        <ProductActions
                          product={product}
                          disabled={isReadOnly || locked}
                          onEdit={editProduct}
                          onVisibilityChange={changeVisibility}
                          onDelete={removeProduct}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{product.category || 'Chưa phân loại'}</span>
                        <span className="font-semibold text-gray-800">{formatVND(product.price)}</span>
                        <span className={Number(product.stock) === 0 ? 'font-semibold text-red-700' : ''}>Tồn: {product.stock ?? 0}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <ProductStatus status={status} />
                        <span className="text-[11px] text-gray-500">Cập nhật {getLastUpdated(product)}</span>
                      </div>
                      {locked && <p className="mt-2 text-xs text-gray-500">Sản phẩm đang trong quy trình đấu giá; không thể sửa giá hoặc bán thường.</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Đây là dữ liệu minh họa lưu trong localStorage của trình duyệt. Sản phẩm mới luôn là nháp; trang này chưa tích hợp quy trình đăng bán.
        Ảnh được lưu cục bộ cho bản demo và không tải lên Cloudinary hay dịch vụ bên ngoài.
      </p>
    </div>
  )
}
