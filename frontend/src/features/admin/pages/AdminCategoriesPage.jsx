import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/mocks/categories'
import { getAdminCatalogProducts } from '@/mocks/adminCatalog'

const EMPTY_FORM = {
  name: '',
  description: '',
  commissionRate: '',
  auctionAllowed: false,
}

function CategoryDialog({ category, onClose, onSave }) {
  const [form, setForm] = useState(() => category
    ? {
        name: category.name,
        description: category.description ?? '',
        commissionRate: category.commissionRate ?? '',
        auctionAllowed: category.auctionAllowed === true,
      }
    : EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  function submit(event) {
    event.preventDefault()
    try {
      onSave(form)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu danh mục.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="category-dialog-title" className="text-xl font-bold text-gray-900">
              {category ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Thiết lập tên, hoa hồng và quyền tham gia đấu giá.</p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Tên danh mục</span>
            <input
              autoFocus
              required
              maxLength={60}
              value={form.name}
              onChange={(event) => { setForm((current) => ({ ...current, name: event.target.value })); setError('') }}
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              placeholder="Ví dụ: Đồ gia dụng"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả <span className="font-normal text-gray-400">(không bắt buộc)</span></span>
            <textarea
              rows={3}
              maxLength={300}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              placeholder="Mô tả ngắn phạm vi danh mục"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Hoa hồng danh mục (%)</span>
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.commissionRate}
              onChange={(event) => { setForm((current) => ({ ...current, commissionRate: event.target.value })); setError('') }}
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
              placeholder="0–100"
            />
            <span className="mt-1 block text-xs text-gray-500">Nhập theo đơn vị phần trăm; chỉ áp dụng cho giao dịch mới.</span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input
              type="checkbox"
              checked={form.auctionAllowed}
              onChange={(event) => setForm((current) => ({ ...current, auctionAllowed: event.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-[#056F1C]"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Cho phép gửi vật phẩm đấu giá</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">Shop có thể gửi sản phẩm thuộc danh mục này để sàn xem xét đấu giá.</span>
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" className="min-h-11 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2">
              {category ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function formatCommissionRate(value) {
  return Number.isFinite(Number(value)) && value !== null && value !== ''
    ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value))}%`
    : 'Chưa cấu hình'
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const refreshCategories = () => {
      try {
        setCategories(getCategories())
        setError('')
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh mục.')
      }
    }
    refreshCategories()
    window.addEventListener('navishop:categories-updated', refreshCategories)
    window.addEventListener('storage', refreshCategories)
    return () => {
      window.removeEventListener('navishop:categories-updated', refreshCategories)
      window.removeEventListener('storage', refreshCategories)
    }
  }, [])

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    return categories.filter((category) => (
      !query || `${category.name} ${category.description ?? ''} ${category.id}`.toLocaleLowerCase('vi').includes(query)
    ))
  }, [categories, search])

  function saveCategory(details) {
    if (activeCategory) {
      updateCategory(activeCategory.id, details)
      setSuccess(`Đã cập nhật danh mục ${details.name.trim()}.`)
    } else {
      createCategory(details)
      setSuccess(`Đã tạo danh mục ${details.name.trim()}.`)
    }
    setActiveCategory(null)
    setIsDialogOpen(false)
  }

  function removeCategory(category) {
    if (!window.confirm(`Xóa danh mục "${category.name}"? Thao tác này không thể hoàn tác.`)) return
    try {
      deleteCategory(category.id, getAdminCatalogProducts())
      setSuccess(`Đã xóa danh mục ${category.name}.`)
      setError('')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa danh mục.')
      setSuccess('')
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Danh mục</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Quản lý danh mục, mức hoa hồng và quyền gửi vật phẩm đấu giá.</p>
        </div>
        <button
          type="button"
          onClick={() => { setActiveCategory(null); setIsDialogOpen(true); setError(''); setSuccess('') }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tạo danh mục
        </button>
      </header>

      {success && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <section aria-label="Tìm danh mục" className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/[0.02]">
        <label className="relative block max-w-xl">
          <span className="sr-only">Tìm theo tên, mô tả hoặc mã danh mục</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên, mô tả hoặc mã danh mục"
            className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
          />
        </label>
      </section>

      <section aria-label="Danh sách danh mục" className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Danh mục</th>
                <th scope="col" className="px-4 py-3 font-semibold">Hoa hồng</th>
                <th scope="col" className="px-4 py-3 font-semibold">Gửi đấu giá</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{category.icon || '📦'} {category.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{category.description || `Mã danh mục: ${category.id}`}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-800">{formatCommissionRate(category.commissionRate)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${category.auctionAllowed ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {category.auctionAllowed ? 'Được phép' : 'Không cho phép'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setActiveCategory(category); setIsDialogOpen(true); setError(''); setSuccess('') }}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#056F1C] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-gray-100 md:hidden">
          {filteredCategories.map((category) => (
            <li key={category.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900">{category.icon || '📦'} {category.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{category.description || `Mã danh mục: ${category.id}`}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-800">{formatCommissionRate(category.commissionRate)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${category.auctionAllowed ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                  Đấu giá: {category.auctionAllowed ? 'Được phép' : 'Không cho phép'}
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setActiveCategory(category); setIsDialogOpen(true); setError(''); setSuccess('') }} aria-label={`Sửa ${category.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#056F1C] hover:bg-green-50">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => removeCategory(category)} aria-label={`Xóa ${category.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredCategories.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            {categories.length ? 'Không tìm thấy danh mục phù hợp.' : 'Chưa có danh mục nào.'}
          </p>
        )}
      </section>

      {isDialogOpen && (
        <CategoryDialog
          category={activeCategory}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveCategory}
        />
      )}
    </main>
  )
}
