import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

const OTP_LENGTH = 6

export default function OtpPage() {
  const { state } = useLocation()
  const email = state?.email
  const navigate = useNavigate()

  // Guard: nếu không có email thì quay về bước 1
  if (!email) return <Navigate to="/register" replace />

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError]   = useState('')
  const inputRefs           = useRef([])

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...digits]
    next[idx]   = digit
    setDigits(next)
    setError('')
    // Auto focus ô kế tiếp
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 chữ số.')
      return
    }
    // TODO: gọi API verify OTP
    navigate('/register/onboard', { state: { email } })
  }

  const handleResend = () => {
    // TODO: gọi API gửi lại OTP
    setDigits(Array(OTP_LENGTH).fill(''))
    setError('')
    inputRefs.current[0]?.focus()
  }

  return (
    <main className="flex-1 bg-[#056F1C] flex items-center justify-center py-12 px-[210px]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Xác thực email</h1>
        <p className="text-sm text-gray-500 mb-7">
          Chúng tôi đã gửi mã 6 số đến{' '}
          <span className="font-semibold text-gray-700">{email}</span>.
          Nhập mã bên dưới để tiếp tục.
        </p>

        <form onSubmit={handleSubmit}>
          {/* 6 ô OTP */}
          <div className="flex gap-2 justify-between mb-2" onPaste={handlePaste}>
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp-digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-lg border outline-none transition-all
                  ${error
                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
                    : 'border-gray-300 focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15'
                  }`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <button
            id="otp-submit-btn"
            type="submit"
            className="w-full h-10 rounded-lg bg-[#056F1C] text-white font-semibold text-sm
              hover:bg-[#045a16] active:scale-[0.99] transition-all mt-4"
          >
            Xác nhận
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Không nhận được mã?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-[#056F1C] font-semibold hover:underline"
          >
            Gửi lại
          </button>
        </p>
      </div>
    </main>
  )
}
