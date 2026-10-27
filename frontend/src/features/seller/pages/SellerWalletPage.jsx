import { useMemo } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Wallet,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatVND } from '@/lib/format'
import { getSellerApplication } from '@/mocks/seller'
import { getSellerWalletMock } from '@/mocks/sellerDashboard'

function formatDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export default function SellerWalletPage() {
  const { user, isLoggedIn } = useAuth()
  const application = user?.role === 'user' ? getSellerApplication(user.id) : null
  const wallet = useMemo(
    () => getSellerWalletMock(user?.id ?? 'preview', application?.slug ?? 'preview'),
    [user?.id, application?.slug],
  )

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application || !['approved', 'suspended', 'banned'].includes(application.status)) {
    return <Navigate to="/seller/dashboard" replace />
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Ví & lịch sử giao dịch</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Theo dõi tiền ghi có cho shop và các giao dịch liên quan.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
          <CircleDollarSign className="h-4 w-4" />
          Dữ liệu minh họa
        </span>
      </header>

      <div role="note" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
        Mô hình số dư ví shop chưa được backend xác định. Số dư bên dưới là mock; cần xác nhận nguồn số dư chính thức trước khi nối API.
      </div>

      <section aria-label="Số dư khả dụng" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.45fr)]">
        <article className="rounded-2xl border border-[#056F1C]/15 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Số dư khả dụng minh họa</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{formatVND(wallet.availableBalance)}</p>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Giá trị mẫu hiện có trong mock seller; không phải số dư đã đối soát từ ledger backend.
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
              <Wallet className="h-6 w-6" />
            </span>
          </div>
        </article>
        <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <h2 className="font-semibold text-gray-900">Nguyên tắc giao dịch</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
            <li>Chỉ đơn `completed` mới tạo giao dịch ghi có cho shop.</li>
            <li>Lịch sử chỉ đọc; không sửa hoặc xóa dòng ledger.</li>
            <li>Chưa có quy trình rút tiền nên không hiển thị thao tác rút.</li>
          </ul>
        </aside>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-900/[0.02]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-gray-900">Lịch sử giao dịch</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {wallet.transactions.length} giao dịch ghi có từ đơn hoàn thành trong dữ liệu minh họa.
            </p>
          </div>
          <span className="text-xs text-gray-500">Ledger chỉ đọc · giờ Việt Nam</span>
        </div>
        {wallet.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Thời gian</th>
                  <th scope="col" className="px-3 py-3 font-medium">Loại giao dịch</th>
                  <th scope="col" className="px-3 py-3 font-medium">Tham chiếu</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Tiền vào</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">Tiền ra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wallet.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-5">{formatDateTime(transaction.createdAt)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                        {transaction.direction === 'in'
                          ? <ArrowDownLeft className="h-4 w-4 text-[#056F1C]" />
                          : <ArrowUpRight className="h-4 w-4 text-red-700" />}
                        {transaction.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block font-semibold text-gray-800">{transaction.reference}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {transaction.source === 'auction' ? 'Đơn từ đấu giá' : 'Đơn thường'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-green-800">
                      {transaction.direction === 'in' ? `+${formatVND(transaction.amount)}` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600 sm:px-5">
                      {transaction.direction === 'out' ? `−${formatVND(transaction.amount)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <Wallet className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có giao dịch trong dữ liệu mock</p>
            <p className="mt-1 text-sm text-gray-500">Giao dịch sẽ hiển thị khi có đơn hoàn thành.</p>
          </div>
        )}
        <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
          Số dư sau giao dịch không hiển thị vì mock hiện không cung cấp số dư đầu kỳ để tính chính xác.
        </p>
      </section>
    </div>
  )
}
