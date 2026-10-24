import { useState } from 'react'
import { LogOut, PackagePlus, Store } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createSellerProduct, getSellerApplication, getSellerProducts } from '@/mocks/seller'
import { formatVND } from '@/lib/format'

const EMPTY_PRODUCT = { name: '', category: '', price: '', stock: '', description: '' }

export default function SellerDashboardPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const [products, setProducts] = useState(() => user ? getSellerProducts(user.id) : [])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  const application = getSellerApplication(user.id)
  if (!application) return <Navigate to="/seller/onboarding" replace />
  if (application.status === 'pending') return <Navigate to="/seller/pending" replace />
  if (application.status !== 'approved') return <Navigate to="/seller/onboarding" replace />

  const submitProduct = (event) => {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (!form.name.trim() || !form.category.trim() || !form.description.trim() || !Number.isSafeInteger(price) || price <= 0 || !Number.isSafeInteger(stock) || stock < 0) {
      setError('Vui lòng nhập tên, danh mục, mô tả, giá hợp lệ và số lượng không âm.')
      setSuccess('')
      return
    }
    try {
      const product = createSellerProduct(user.id, { ...form, price, stock })
      setProducts((current) => [product, ...current])
      setForm(EMPTY_PRODUCT)
      setError('')
      setSuccess('Sản phẩm đã được lưu trong danh sách nháp của shop.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu sản phẩm.')
      setSuccess('')
    }
  }

  return (
    <main className="flex-1 bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#056F1C]">KÊNH NGƯỜI BÁN</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Xin chào, {application.shopName}</h1>
            <p className="mt-2 text-sm text-gray-600">Shop đã được duyệt. Quản lý thông tin và chuẩn bị sản phẩm để đăng bán.</p>
          </div>
          <button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </header>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Sản phẩm nháp', value: products.length },
            { label: 'Đơn hàng mới', value: '—' },
            { label: 'Doanh thu', value: '—' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{metric.value}</p>
              {metric.value === '—' && <p className="mt-1 text-xs text-gray-400">Chưa có dữ liệu mock cho mục này</p>}
            </div>
          ))}
        </section>

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#056F1C]"><PackagePlus className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thêm sản phẩm</h2>
                <p className="text-sm text-gray-500">Sản phẩm mới được lưu ở trạng thái nháp.</p>
              </div>
            </div>
            <form onSubmit={submitProduct} className="mt-6 space-y-4">
              <div>
                <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input id="product-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C]" required maxLength={120} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-gray-700">Danh mục</label>
                  <input id="product-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C]" required maxLength={80} />
                </div>
                <div>
                  <label htmlFor="product-price" className="mb-1 block text-sm font-medium text-gray-700">Giá bán (₫)</label>
                  <input id="product-price" type="number" min="1" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C]" required />
                </div>
              </div>
              <div>
                <label htmlFor="product-stock" className="mb-1 block text-sm font-medium text-gray-700">Số lượng tồn</label>
                <input id="product-stock" type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C]" required />
              </div>
              <div>
                <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea id="product-description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C]" required maxLength={2000} />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {success && <p role="status" className="text-sm text-green-700">{success}</p>}
              <button type="submit" className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517]">Lưu sản phẩm nháp</button>
            </form>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-[#056F1C]" />
              <h2 className="text-lg font-bold text-gray-900">Sản phẩm của shop</h2>
            </div>
            {products.length === 0 ? (
              <p className="mt-6 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">Chưa có sản phẩm. Tạo sản phẩm đầu tiên bằng biểu mẫu bên cạnh.</p>
            ) : (
              <ul className="mt-5 divide-y divide-gray-100">
                {products.map((product) => (
                  <li key={product.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.category} · Tồn kho {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatVND(product.price)}</p>
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Nháp</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-400">
              Sản phẩm demo hiện chỉ lưu trong trang quản lý seller, chưa xuất hiện trên sàn mua sắm.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
