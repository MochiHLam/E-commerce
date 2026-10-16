import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getAuctionCta } from '@/features/auction/lib/auctionCta'
import AuctionCTA from '@/features/auction/components/AuctionCTA'
import { formatVND } from '@/lib/format'

/**
 * Nút CTA đấu giá dùng chung cho banner trang chủ và hero trang about.
 *
 * @param {object} session   - phiên hiện tại ({ id, status, ... }) hoặc null
 * @param {boolean} isRegistered - user đã đăng ký phiên này chưa
 * @param {boolean} onDark   - true = đặt trên nền tối (hero xanh), false = nền sáng
 * @param {function} onPopup - callback(message) khi action là popup
 */
export default function AuctionCTAButton({ session, isRegistered, onDark = true, onPopup }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [registeredLocally, setRegisteredLocally] = useState(false)
  const [registrationDialog, setRegistrationDialog] = useState('')
  const [registrationResult, setRegistrationResult] = useState(null)
  const currentRegistration = isRegistered || registeredLocally
  const cta = getAuctionCta({ session, isLoggedIn, isRegistered: currentRegistration })

  // variant → style AuctionCTA
  // primary + onDark = 'white', primary + onLight = 'green'
  // muted = 'gray' (bán trong, dùng được trên cả hai nền)
  const variant = cta.variant === 'muted' ? 'gray' : onDark ? 'white' : 'green'

  const handleClick = () => {
    const { action } = cta
    if (action.type === 'login') {
      navigate('/login', { state: { returnTo: session?.id ? `/auction/${session.id}` : '/' } })
    } else if (action.type === 'navigate') {
      navigate(action.to)
    } else if (action.type === 'register') {
      setRegistrationResult(null)
      setRegistrationDialog('confirm')
    } else {
      onPopup?.(action.message)
    }
  }

  const confirmRegistration = () => {
    const fee = Number(session?.registrationFee)
    const balance = Number(session?.walletAvailable)
    if (Number.isFinite(fee) && fee >= 0 && Number.isFinite(balance) && balance >= fee) {
      setRegisteredLocally(true)
      setRegistrationResult({
        success: true,
        message: 'Bạn đã đăng ký tham gia buổi đấu giá. Hãy quay lại khi buổi đấu giá đang được diễn ra!',
      })
    } else {
      setRegistrationResult({ success: false, message: 'Số dư trong tài khoản không đủ để đăng ký tham gia buổi đấu giá.' })
    }
    setRegistrationDialog('result')
  }

  return (
    <>
      <AuctionCTA
        label={cta.label}
        variant={variant}
        disabled={cta.disabled}
        onClick={handleClick}
      />

      {registrationDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setRegistrationDialog('')}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auction-registration-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="auction-registration-title" className="text-lg font-bold text-gray-900">
              {registrationDialog === 'confirm'
                ? 'Xác nhận đăng ký tham gia'
                : registrationResult?.success ? 'Đăng ký thành công' : 'Không thể đăng ký'}
            </h2>
            {registrationDialog === 'confirm' ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Phí đăng ký là <strong className="text-gray-900">{formatVND(session?.registrationFee ?? 0)}</strong>.
                  Bạn có đồng ý trừ phí từ số dư ví để đăng ký tham gia không?
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Số dư khả dụng: {formatVND(session?.walletAvailable ?? 0)}
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationDialog('')}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={confirmRegistration}
                    className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]"
                  >
                    Đồng ý
                  </button>
                </div>
              </>
            ) : (
              <>
                <p role={registrationResult?.success ? 'status' : 'alert'} className="mt-3 text-sm leading-relaxed text-gray-600">
                  {registrationResult?.message}
                </p>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setRegistrationDialog('')}
                    className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517]"
                  >
                    Đã hiểu
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}
