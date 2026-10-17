import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, Eye, EyeOff, Landmark, Wallet } from 'lucide-react'
import { formatVND } from '@/lib/format'
import { getMockAvailableBalance, recordMockTopUp } from '@/mocks/wallet'
import { getMockAuctionLockedBalance } from '@/mocks/auction/sessionMock'

const TOP_UP_PRESETS = [100000, 200000, 500000, 1000000]
const PAYMENT_METHODS = [
  { id: 'bank', label: 'Tài khoản ngân hàng', description: 'Liên kết tài khoản ngân hàng', Icon: Landmark },
  { id: 'card', label: 'Thẻ ngân hàng', description: 'Liên kết thẻ ATM hoặc Visa', Icon: CreditCard },
]

export default function WalletSection() {
  const initialLockedBalance = getMockAuctionLockedBalance()
  const [availableBalance, setAvailableBalance] = useState(() => getMockAvailableBalance(initialLockedBalance))
  const [lockedBalance] = useState(getMockAuctionLockedBalance)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpStep, setTopUpStep] = useState('amount')
  const [selectedAmount, setSelectedAmount] = useState(TOP_UP_PRESETS[0])
  const [customAmount, setCustomAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [message, setMessage] = useState('')
  const [completedAmount, setCompletedAmount] = useState(0)
  const [isAvailableBalanceVisible, setIsAvailableBalanceVisible] = useState(false)
  const [isLockedBalanceVisible, setIsLockedBalanceVisible] = useState(false)

  const amountToTopUp = customAmount ? Number(customAmount) : selectedAmount
  const selectedPayment = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)

  const openTopUp = () => {
    setMessage('')
    setTopUpStep('amount')
    setIsTopUpOpen(true)
  }

  const closeTopUp = () => {
    setIsTopUpOpen(false)
    setTopUpStep('amount')
    setCustomAmount('')
    setMessage('')
  }

  const reviewTopUp = () => {
    if (!Number.isSafeInteger(amountToTopUp) || amountToTopUp <= 0) {
      setMessage('Vui lòng nhập số tiền hợp lệ.')
      return
    }
    setMessage('')
    setTopUpStep('confirm')
  }

  const confirmTopUp = () => {
    if (!Number.isSafeInteger(amountToTopUp) || amountToTopUp <= 0 || !selectedPayment) {
      setMessage('Vui lòng nhập số tiền hợp lệ.')
      return
    }
    setAvailableBalance(recordMockTopUp(amountToTopUp, initialLockedBalance))
    setCompletedAmount(amountToTopUp)
    setMessage('')
    setTopUpStep('success')
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ví thanh toán Navi</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý số dư và nạp tiền vào ví NaviShop.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openTopUp}
              className="inline-flex items-center gap-2 rounded-lg bg-[#056F1C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517]"
            >
              <Wallet className="h-4 w-4" /> Nạp tiền
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl bg-[#056F1C] p-6 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Wallet className="h-5 w-5" /> Số dư khả dụng
              </div>
              <button
                type="button"
                onClick={() => setIsAvailableBalanceVisible((visible) => !visible)}
                aria-label={isAvailableBalanceVisible ? 'Ẩn số dư khả dụng' : 'Hiện số dư khả dụng'}
                aria-pressed={isAvailableBalanceVisible}
                className="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {isAvailableBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-4 text-3xl font-bold">{isAvailableBalanceVisible ? formatVND(availableBalance) : '******** ₫'}</p>
            <p className="mt-2 text-xs text-white/70">Dễ dàng quản lý tài chính của bạn</p>
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock3 className="h-5 w-5 text-amber-600" /> Số dư đang khóa
              </div>
              <button
                type="button"
                onClick={() => setIsLockedBalanceVisible((visible) => !visible)}
                aria-label={isLockedBalanceVisible ? 'Ẩn số dư đang khóa' : 'Hiện số dư đang khóa'}
                aria-pressed={isLockedBalanceVisible}
                className="rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                {isLockedBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{isLockedBalanceVisible ? formatVND(lockedBalance) : '******** ₫'}</p>
            <p className="mt-2 text-xs text-gray-500">Được giữ cho các lượt đấu giá bạn đang dẫn đầu.</p>
          </section>
        </div>

      </div>

      {isTopUpOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTopUp()
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="wallet-topup-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              {topUpStep === 'confirm' && (
                <button
                  type="button"
                  aria-label="Quay lại chọn số tiền"
                  onClick={() => setTopUpStep('amount')}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}

              <div className="min-w-0 flex-1">
                <h2 id="wallet-topup-title" className="text-lg font-bold text-gray-900">
                  {topUpStep === 'confirm'
                    ? 'Xác nhận thông tin giao dịch'
                    : topUpStep === 'success' ? 'Giao dịch thành công' : 'Nạp tiền vào ví'}
                </h2>
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <span>Số dư khả dụng: {isAvailableBalanceVisible ? formatVND(availableBalance) : '******** ₫'}</span>
                  <button
                    type="button"
                    onClick={() => setIsAvailableBalanceVisible((visible) => !visible)}
                    aria-label={isAvailableBalanceVisible ? 'Ẩn số dư khả dụng' : 'Hiện số dư khả dụng'}
                    aria-pressed={isAvailableBalanceVisible}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    {isAvailableBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="button" aria-label="Đóng" onClick={closeTopUp} className="rounded p-1 text-gray-500 hover:bg-gray-100">×</button>
            </div>
            {topUpStep === 'amount' ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {TOP_UP_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                      aria-pressed={!customAmount && selectedAmount === amount}
                      className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                        !customAmount && selectedAmount === amount
                          ? 'border-[#056F1C] bg-green-50 text-[#056F1C]'
                          : 'border-gray-300 text-gray-700 hover:border-[#056F1C]'
                      }`}
                    >
                      {formatVND(amount)}
                    </button>
                  ))}
                </div>
                <label htmlFor="wallet-custom-amount" className="mt-5 block text-sm font-semibold text-gray-800">Hoặc nhập số tiền khác</label>
                <input
                  id="wallet-custom-amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập số tiền (VND)"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C]"
                />
                <h3 className="mt-5 text-sm font-semibold text-gray-800">Phương thức thanh toán</h3>
                <div className="mt-2 space-y-2">
                  {PAYMENT_METHODS.map(({ id, label, description, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(id)}
                      aria-pressed={selectedPaymentMethod === id}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                        selectedPaymentMethod === id
                          ? 'border-[#056F1C] bg-green-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selectedPaymentMethod === id ? 'text-[#056F1C]' : 'text-gray-500'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">{label}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">{description}</span>
                      </span>
                      <span className={`h-4 w-4 rounded-full border ${selectedPaymentMethod === id ? 'border-[5px] border-[#056F1C]' : 'border-gray-300'}`} />
                    </button>
                  ))}
                </div>
                {message && <p role="alert" className="mt-3 text-sm text-red-600">{message}</p>}
                <button
                  type="button"
                  onClick={reviewTopUp}
                  className="mt-5 w-full rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045517]"
                >
                  Nạp tiền ngay
                </button>
              </>
            ) : topUpStep === 'confirm' ? (
              <>
                <div className="mt-5 divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
                  <div className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-gray-500">Số tiền nạp</span>
                    <span className="font-semibold text-gray-900">{formatVND(amountToTopUp)}</span>
                  </div>
                  <div className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-gray-500">Phương thức thanh toán</span>
                    <span className="text-right font-semibold text-gray-900">{selectedPayment?.label}</span>
                  </div>
                  <div className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-gray-500">Tài khoản nhận</span>
                    <span className="font-semibold text-gray-900">Ví NaviShop</span>
                  </div>
                  <div className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-gray-500">Số dư sau giao dịch</span>
                    <span className="font-semibold text-[#056F1C]">
                      {isAvailableBalanceVisible ? formatVND(availableBalance + amountToTopUp) : '******** ₫'}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => setTopUpStep('amount')} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">Quay lại</button>
                  <button type="button" onClick={confirmTopUp} className="flex-1 rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045517]">
                    Xác nhận giao dịch
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-[#056F1C]" />
                <p className="mt-4 text-sm text-gray-600">
                  Bạn đã nạp thành công {formatVND(completedAmount)} vào Ví thanh toán Navi.
                </p>
                <button
                  type="button"
                  onClick={closeTopUp}
                  className="mt-6 w-full rounded-lg bg-[#056F1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045517]"
                >
                  Hoàn tất
                </button>
              </div>
            )}
          </section>
        </div>
      )}

    </>
  )
}
