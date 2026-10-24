import { formatVND } from '@/lib/format'
import {
  getMockAuctionLockedBalance,
  MAX_AUCTION_REGISTRATION_CANCELLATIONS,
} from '@/mocks/auction/sessionMock'
import { getMockAvailableBalance } from '@/mocks/wallet'

export default function AuctionRegistrationConfirmDialog({
  session,
  mode = 'register',
  cancellationCount = 0,
  onCancel,
  onConfirm,
}) {
  const fee = Number(session?.registrationFee) || 0
  const balance = getMockAvailableBalance(getMockAuctionLockedBalance())
  const isCancelling = mode === 'cancel'
  const hasSufficientBalance = isCancelling || balance >= fee
  const resultingBalance = isCancelling ? balance + fee : Math.max(0, balance - fee)
  const cancellationAttempt = cancellationCount + 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auction-registration-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="auction-registration-title" className="text-lg font-bold text-gray-900">
          {isCancelling ? 'Xác nhận hủy đăng ký' : 'Xác nhận thông tin giao dịch'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {isCancelling
            ? `Bạn có chắc muốn hủy đăng ký và không tham gia phiên đấu giá này không? ${fee > 0 ? `Phí đăng ký ${formatVND(fee)}` : 'Phí đăng ký'} sẽ được hoàn lại vào số dư khả dụng.`
            : 'Kiểm tra lệ phí trước khi xác nhận đăng ký tham gia phiên đấu giá.'}
        </p>
        {isCancelling && (
          <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-900">
            Đây là lần hủy thứ {cancellationAttempt} trên tối đa {MAX_AUCTION_REGISTRATION_CANCELLATIONS} lần. {cancellationAttempt >= MAX_AUCTION_REGISTRATION_CANCELLATIONS
              ? 'Sau lần hủy này, bạn sẽ không thể đăng ký lại phiên đấu giá này.'
              : `Nếu hủy thêm ${MAX_AUCTION_REGISTRATION_CANCELLATIONS - cancellationAttempt} lần nữa, bạn sẽ không thể đăng ký lại phiên đấu giá này.`}
          </p>
        )}
        {!isCancelling && (
          <dl className="mt-5 divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
            <div className="flex justify-between gap-3 py-3 text-sm">
              <dt className="text-gray-500">Phiên đấu giá</dt>
              <dd className="text-right font-semibold text-gray-900">{session?.name || 'Phiên đấu giá'}</dd>
            </div>
            <div className="flex justify-between gap-3 py-3 text-sm">
              <dt className="text-gray-500">Phí đăng ký</dt>
              <dd className="font-semibold text-gray-900">{fee > 0 ? formatVND(fee) : 'Miễn phí'}</dd>
            </div>
            <div className="flex justify-between gap-3 py-3 text-sm">
              <dt className="text-gray-500">Số dư khả dụng</dt>
              <dd className="font-semibold text-gray-900">{formatVND(balance)}</dd>
            </div>
            <div className="flex justify-between gap-3 py-3 text-sm">
              <dt className="text-gray-500">Số dư sau giao dịch</dt>
              <dd className={`font-semibold ${hasSufficientBalance ? 'text-[#056F1C]' : 'text-red-600'}`}>
                {formatVND(resultingBalance)}
              </dd>
            </div>
          </dl>
        )}
        {!hasSufficientBalance && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Số dư ví không đủ để thanh toán phí đăng ký.
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasSufficientBalance}
            className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCancelling ? 'Xác nhận hủy đăng ký' : 'Xác nhận đăng ký'}
          </button>
        </div>
      </section>
    </div>
  )
}
