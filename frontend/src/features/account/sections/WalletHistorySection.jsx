import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'
import { formatVND } from '@/lib/format'
import { getMockAvailableBalance, getMockTopUps } from '@/mocks/wallet'
import { getMockAuctionLockedBalance } from '@/mocks/auction/sessionMock'

const PAGE_SIZE = 6

function formatTransactionDate(date) {
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getReferenceDetails(reference) {
  if (reference.startsWith('Đơn đấu giá')) {
    return { label: 'Mã đơn đấu giá', value: reference.split('#').at(-1) }
  }
  if (reference.startsWith('Phiên đấu giá')) {
    return { label: 'Mã phiên đấu giá', value: reference.split('#').at(-1) }
  }
  if (reference.startsWith('Đơn hàng')) {
    return { label: 'Mã đơn hàng', value: reference.split('#').at(-1) }
  }
  return null
}

const MOCK_TRANSACTIONS = [
  {
    id: 'TXN-20261015-008',
    title: 'Hoàn tiền đơn hàng',
    description: 'Đơn hàng bị hủy do shop không xác nhận đúng hạn',
    reference: 'Đơn hàng #NS-20418',
    amount: 348000,
    direction: 'in',
    date: '2026-10-15T14:32:00',
  },
  {
    id: 'TXN-20261014-007',
    title: 'Phí vận chuyển đơn đấu giá',
    description: 'Phí ship được trừ khi shop bắt đầu giao sản phẩm',
    reference: 'Đơn đấu giá #AU-1052',
    amount: 30000,
    direction: 'out',
    date: '2026-10-14T16:10:00',
  },
  {
    id: 'TXN-20261014-006',
    title: 'Thanh toán đấu giá thành công',
    description: 'Thanh toán sản phẩm thắng đấu giá',
    reference: 'Đơn đấu giá #AU-1052',
    amount: 1250000,
    direction: 'out',
    date: '2026-10-14T15:45:00',
  },
  {
    id: 'TXN-20261012-005',
    title: 'Hoàn phí đăng ký đấu giá',
    description: 'Phiên đấu giá bị hủy khi đang chờ bắt đầu',
    reference: 'Phiên đấu giá #SS-031',
    amount: 50000,
    direction: 'in',
    date: '2026-09-12T10:00:00',
  },
  {
    id: 'TXN-20261011-004',
    title: 'Đăng ký đấu giá',
    description: 'Phí đăng ký tham gia phiên đấu giá',
    reference: 'Phiên đấu giá #SS-031',
    amount: 50000,
    direction: 'out',
    date: '2026-09-11T09:20:00',
  },
  {
    id: 'TXN-20261010-003',
    title: 'Thanh toán đơn hàng',
    description: 'Thanh toán tiền hàng và phí vận chuyển',
    reference: 'Đơn hàng #NS-20376',
    amount: 599000,
    direction: 'out',
    date: '2026-08-10T18:05:00',
  },
  {
    id: 'TXN-20261009-002',
    title: 'Nạp tiền vào ví',
    description: 'Nạp tiền mô phỏng qua tài khoản ngân hàng',
    reference: 'Giao dịch nạp tiền',
    amount: 1000000,
    direction: 'in',
    date: '2026-08-09T12:40:00',
  },
  {
    id: 'TXN-20261008-001',
    title: 'Hoàn tiền đơn hàng',
    description: 'Hoàn tiền do shop không xác nhận đơn hàng',
    reference: 'Đơn hàng #NS-20302',
    amount: 215000,
    direction: 'in',
    date: '2026-09-08T11:15:00',
  },
  {
    id: 'TXN-20261007-000',
    title: 'Hoàn tiền đơn hàng',
    description: 'Hoàn tiền sau khi bạn hủy đơn trước khi shop xác nhận',
    reference: 'Đơn hàng #NS-20285',
    amount: 420000,
    direction: 'in',
    date: '2026-09-07T09:45:00',
  },
  {
    id: 'TXN-20260808-014',
    title: 'Thanh toán đơn hàng',
    description: 'Thanh toán tiền hàng và phí vận chuyển',
    reference: 'Đơn hàng #NS-20261',
    amount: 875000,
    direction: 'out',
    date: '2026-08-08T16:25:00',
  },
  {
    id: 'TXN-20260805-013',
    title: 'Nạp tiền vào ví',
    description: 'Nạp tiền mô phỏng qua tài khoản ngân hàng',
    reference: 'Giao dịch nạp tiền',
    amount: 500000,
    direction: 'in',
    date: '2026-08-05T11:05:00',
  },
  {
    id: 'TXN-20260802-012',
    title: 'Đăng ký đấu giá',
    description: 'Phí đăng ký tham gia phiên đấu giá',
    reference: 'Phiên đấu giá #SS-028',
    amount: 25000,
    direction: 'out',
    date: '2026-08-02T08:30:00',
  },
  {
    id: 'TXN-20260725-011',
    title: 'Hoàn tiền đơn hàng',
    description: 'Đơn hàng bị hủy do shop không xác nhận đúng hạn',
    reference: 'Đơn hàng #NS-20148',
    amount: 129000,
    direction: 'in',
    date: '2026-07-25T13:50:00',
  },
  {
    id: 'TXN-20260718-010',
    title: 'Thanh toán đơn hàng',
    description: 'Thanh toán tiền hàng và phí vận chuyển',
    reference: 'Đơn hàng #NS-20092',
    amount: 2450000,
    direction: 'out',
    date: '2026-07-18T19:12:00',
  },
  {
    id: 'TXN-20260704-009',
    title: 'Nạp tiền vào ví',
    description: 'Nạp tiền mô phỏng qua tài khoản ngân hàng',
    reference: 'Giao dịch nạp tiền',
    amount: 2000000,
    direction: 'in',
    date: '2026-07-04T10:40:00',
  },
]

export default function WalletHistorySection() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [, setWalletVersion] = useState(0)
  useEffect(() => {
    const refreshTransactions = () => setWalletVersion((version) => version + 1)
    window.addEventListener('navishop:wallet-updated', refreshTransactions)
    window.addEventListener('storage', refreshTransactions)
    return () => {
      window.removeEventListener('navishop:wallet-updated', refreshTransactions)
      window.removeEventListener('storage', refreshTransactions)
    }
  }, [])
  let balanceAfterTransaction = getMockAvailableBalance(getMockAuctionLockedBalance())
  const transactions = [...getMockTopUps(), ...MOCK_TRANSACTIONS]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((transaction) => {
      const transactionWithBalance = { ...transaction, balanceAfter: balanceAfterTransaction }
      balanceAfterTransaction += transaction.direction === 'in' ? -transaction.amount : transaction.amount
      return transactionWithBalance
    })
  const visibleTransactions = transactions.slice(0, visibleCount)
  const transactionsByMonth = visibleTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!groups[monthKey]) groups[monthKey] = []
    groups[monthKey].push(transaction)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
      </div>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Biến động số dư ví</h2>
        </div>
        {Object.entries(transactionsByMonth).map(([monthKey, monthTransactions]) => {
          const [year, month] = monthKey.split('-')
          return (
            <div key={monthKey}>
              <h3 className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-500">
                Tháng {Number(month)}, {year}
              </h3>
              <ul className="divide-y divide-gray-100">
                {monthTransactions.map((transaction) => {
                  const isIncoming = transaction.direction === 'in'
                  const DirectionIcon = isIncoming ? ArrowDownLeft : ArrowUpRight
                  return (
                    <li key={transaction.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-gray-50 sm:gap-4"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isIncoming ? 'bg-green-50 text-[#056F1C]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <DirectionIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-900">{transaction.title}</span>
                          <span className="mt-1 block text-xs text-gray-500">
                            {formatTransactionDate(transaction.date)}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            Số dư ví: {formatVND(transaction.balanceAfter)}
                          </span>
                        </span>
                        <span className={`shrink-0 text-sm font-bold ${isIncoming ? 'text-[#056F1C]' : 'text-gray-900'}`}>
                          {isIncoming ? '+' : '−'}{formatVND(transaction.amount)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        {visibleCount < transactions.length && (
          <div className="border-t border-gray-100 px-5 py-4 text-center">
            <p className="mb-3 text-xs text-gray-500">
              Đang xem {visibleTransactions.length} / {transactions.length} giao dịch
            </p>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, transactions.length))}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#056F1C] hover:text-[#056F1C]"
            >
              Xem giao dịch cũ hơn
            </button>
          </div>
        )}
      </section>
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTransaction(null)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <h2 id="transaction-detail-title" className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedTransaction.title}</p>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setSelectedTransaction(null)} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className={`text-2xl font-bold ${selectedTransaction.direction === 'in' ? 'text-[#056F1C]' : 'text-gray-900'}`}>
                  {selectedTransaction.direction === 'in' ? '+' : '−'}{formatVND(selectedTransaction.amount)}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#056F1C]">Thành công</p>
                <p className="mt-1 text-xs text-gray-500">
                  Thời gian hoàn thành {formatTransactionDate(selectedTransaction.date)}
                </p>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  {getReferenceDetails(selectedTransaction.reference)?.label === 'Mã đơn hàng'
                    ? 'Thông tin đơn hàng'
                    : 'Thông tin giao dịch'}
                </h3>
                <dl className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
                  <div className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-gray-500">Mã giao dịch</dt>
                    <dd className="break-all text-right font-medium text-gray-900">{selectedTransaction.id}</dd>
                  </div>
                  {getReferenceDetails(selectedTransaction.reference) && (
                    <div className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-gray-500">{getReferenceDetails(selectedTransaction.reference).label}</dt>
                      <dd className="text-right font-medium text-gray-900">#{getReferenceDetails(selectedTransaction.reference).value}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-gray-500">Nội dung</dt>
                    <dd className="max-w-[60%] text-right font-medium text-gray-900">{selectedTransaction.description}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4">
              <button type="button" onClick={() => setSelectedTransaction(null)} className="w-full rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045517]">
                Đóng
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
