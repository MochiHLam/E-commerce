import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getAuctionCta } from '@/features/auction/lib/auctionCta'
import AuctionCTA from '@/features/auction/components/AuctionCTA'
import AuctionRegistrationConfirmDialog from '@/features/auction/components/AuctionRegistrationConfirmDialog'
import {
  cancelMockAuctionRegistration,
  getMockAuctionLockedBalance,
  getMockAuctionRegistration,
  getMockAuctionRegistrationLimits,
  registerMockAuctionSession,
} from '@/mocks/auction/sessionMock'
import { getMockAvailableBalance } from '@/mocks/wallet'
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
  const [registeredLocally, setRegisteredLocally] = useState(null)
  const [registrationBlocked, setRegistrationBlocked] = useState(
    () => Boolean(session?.id && getMockAuctionRegistrationLimits(session.id).registrationBlocked),
  )
  const [registrationDialog, setRegistrationDialog] = useState('')
  const [registrationResult, setRegistrationResult] = useState(null)
  const currentRegistration = registeredLocally
    ?? (Boolean(isRegistered) || Boolean(session?.id && getMockAuctionRegistration(session.id)))
  const cta = getAuctionCta({
    session,
    isLoggedIn,
    isRegistered: currentRegistration,
    registrationBlocked,
  })

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
    } else if (action.type === 'cancel') {
      setRegistrationResult(null)
      setRegistrationDialog('cancel-confirm')
    } else {
      onPopup?.(action.message)
    }
  }

  const confirmRegistration = () => {
    const fee = Number(session?.registrationFee)
    try {
      const result = registerMockAuctionSession(session?.id, fee)
      if (result.success) {
        setRegisteredLocally(true)
        setRegistrationResult({
          success: true,
          title: 'Đăng ký thành công',
          message: 'Bạn đã đăng ký tham gia phiên đấu giá. Hãy quay lại khi phiên bắt đầu!',
        })
      } else {
        setRegistrationResult({
          success: false,
          title: 'Không thể đăng ký',
          message: result.reason === 'cancellation_limit'
            ? 'Bạn đã hủy đăng ký 3 lần nên không thể đăng ký lại phiên đấu giá này.'
            : `Số dư khả dụng ${formatVND(getMockAvailableBalance(getMockAuctionLockedBalance()))} không đủ để thanh toán phí đăng ký.`,
        })
        if (result.reason === 'cancellation_limit') setRegistrationBlocked(true)
      }
    } catch (error) {
      setRegistrationResult({
        success: false,
        title: 'Không thể đăng ký',
        message: error instanceof Error ? error.message : 'Không thể đăng ký tham gia phiên đấu giá.',
      })
    }
    setRegistrationDialog('result')
  }

  const confirmCancellation = () => {
    try {
      const result = cancelMockAuctionRegistration(session?.id)
      if (result.success) {
        setRegisteredLocally(false)
        setRegistrationBlocked(Boolean(result.registrationBlocked))
        setRegistrationResult({
          success: true,
          title: 'Đã hủy đăng ký',
          message: result.registrationBlocked
            ? 'Đăng ký đã được hủy, phí đã được hoàn vào số dư khả dụng. Đã đạt giới hạn 3 lần hủy nên bạn không thể đăng ký lại phiên này.'
            : 'Đăng ký của bạn đã được hủy và phí đã được hoàn vào số dư khả dụng.',
        })
      } else {
        setRegistrationResult({
          success: false,
          title: 'Không thể hủy đăng ký',
          message: 'Không tìm thấy đăng ký đang hoạt động cho phiên đấu giá này.',
        })
      }
    } catch (error) {
      setRegistrationResult({
        success: false,
        title: 'Không thể hủy đăng ký',
        message: error instanceof Error ? error.message : 'Không thể hủy đăng ký phiên đấu giá.',
      })
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

      {registrationDialog === 'confirm' && (
        <AuctionRegistrationConfirmDialog
          session={session}
          onCancel={() => setRegistrationDialog('')}
          onConfirm={confirmRegistration}
        />
      )}
      {registrationDialog === 'cancel-confirm' && (
        <AuctionRegistrationConfirmDialog
          session={session}
          mode="cancel"
          cancellationCount={getMockAuctionRegistrationLimits(session?.id).cancellationCount}
          onCancel={() => setRegistrationDialog('')}
          onConfirm={confirmCancellation}
        />
      )}

      {registrationDialog === 'result' && (
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
              {registrationResult?.title}
            </h2>
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
          </section>
        </div>
      )}
    </>
  )
}
