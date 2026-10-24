import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_ACCOUNTS, MOCK_PASSWORD_RESET_PREFIX } from '@/mocks/mockAccounts'

const OTP_LENGTH = 6
const OTP_LIFETIME_SECONDS = 60

function createOtp() {
  const values = new Uint32Array(1)
  window.crypto.getRandomValues(values)
  return String(values[0] % 1_000_000).padStart(OTP_LENGTH, '0')
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [issuedOtp, setIssuedOtp] = useState('')
  const [expiresAt, setExpiresAt] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [otpError, setOtpError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})
  const otpInputRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (step !== 'otp') return undefined

    const updateCountdown = () => {
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }
    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 250)
    return () => window.clearInterval(intervalId)
  }, [expiresAt, step])

  const issueOtp = () => {
    if (step === 'otp' && Date.now() < expiresAt) return
    setIssuedOtp(createOtp())
    setExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000)
    setOtp(Array(OTP_LENGTH).fill(''))
    setOtpError('')
  }

  const handleEmailSubmit = (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError(normalizedEmail ? 'Email không đúng định dạng.' : 'Vui lòng nhập email.')
      return
    }

    const accountExists = MOCK_ACCOUNTS.some(
      (account) => account.role === 'user' && account.email.toLowerCase() === normalizedEmail,
    )
    if (!accountExists) {
      setEmailError('Email này chưa có tài khoản NaviShop.')
      return
    }

    setEmail(normalizedEmail)
    setEmailError('')
    issueOtp()
    setStep('otp')
  }

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((current) => current.map((currentDigit, currentIndex) => (
      currentIndex === index ? digit : currentDigit
    )))
    setOtpError('')
    if (digit && index < OTP_LENGTH - 1) otpInputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    event.preventDefault()
    setOtp(Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? ''))
    setOtpError('')
    otpInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleOtpSubmit = (event) => {
    event.preventDefault()
    const enteredOtp = otp.join('')
    if (Date.now() >= expiresAt) {
      setOtpError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.')
      return
    }
    if (enteredOtp.length !== OTP_LENGTH) {
      setOtpError('Vui lòng nhập đủ 6 chữ số.')
      return
    }
    if (enteredOtp !== issuedOtp) {
      setOtpError('Mã OTP không chính xác.')
      return
    }

    setOtpError('')
    setPasswordErrors({})
    setStep('password')
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    const errors = {}
    if (!password) errors.password = 'Vui lòng nhập mật khẩu mới.'
    else if (password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
    if (!confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới.'
    else if (confirmPassword !== password) errors.confirmPassword = 'Mật khẩu nhập lại không trùng khớp.'
    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    localStorage.setItem(`${MOCK_PASSWORD_RESET_PREFIX}${email}`, password)
    navigate('/login', {
      replace: true,
      state: { resetPasswordEmail: email },
    })
  }

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password
  const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15'

  return (
    <main className="flex flex-1 items-center justify-center bg-[#056F1C] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {step === 'email' && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
            <p className="mb-7 text-sm leading-6 text-gray-600">
              Nhập email của bạn để nhận mã 6 số, sau đó nhập mã để đặt mật khẩu mới.
            </p>
            <form noValidate onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-password-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setEmailError('')
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'forgot-password-email-error' : undefined}
                  placeholder="example@gmail.com"
                  className={`${inputClass} ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && (
                  <p id="forgot-password-email-error" role="alert" className="mt-1 text-xs text-red-600">
                    {emailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-[#056F1C] text-sm font-semibold text-white transition-colors hover:bg-[#045a16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
              >
                Tiếp tục
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Xác thực email</h1>
            <p className="mb-5 text-sm leading-6 text-gray-600">
              Nhập mã OTP 6 số dành cho <span className="font-semibold text-gray-800">{email}</span>.
            </p>
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Mã OTP thử nghiệm: {issuedOtp}</p>
              <p className="mt-1 text-xs">Chưa kết nối dịch vụ gửi email; dùng mã này để kiểm tra luồng.</p>
            </div>
            <form noValidate onSubmit={handleOtpSubmit}>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => { otpInputRefs.current[index] = element }}
                    aria-label={`Chữ số OTP thứ ${index + 1}`}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    className="h-12 min-w-0 flex-1 rounded-lg border border-gray-300 text-center text-lg font-semibold outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                  />
                ))}
              </div>
              {otpError && <p role="alert" className="mt-2 text-xs text-red-600">{otpError}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{secondsLeft > 0 ? `Mã hết hạn sau ${secondsLeft}s` : 'Mã OTP đã hết hạn'}</span>
                <button
                  type="button"
                  onClick={issueOtp}
                  disabled={secondsLeft > 0}
                  className="font-semibold text-[#056F1C] hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                >
                  Gửi lại mã
                </button>
              </div>
              <button
                type="submit"
                className="mt-5 h-10 w-full rounded-lg bg-[#056F1C] text-sm font-semibold text-white transition-colors hover:bg-[#045a16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
              >
                Xác nhận
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Nhập mật khẩu mới</h1>
            <p className="mb-7 text-sm leading-6 text-gray-600">
              Tạo mật khẩu mới cho tài khoản <span className="font-medium text-gray-800">{email}</span>.
              Mật khẩu phải có ít nhất 8 ký tự.
            </p>
            <form noValidate onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setPasswordErrors((current) => ({
                        ...current,
                        password: '',
                        confirmPassword: '',
                      }))
                    }}
                    aria-invalid={Boolean(passwordErrors.password || passwordTooShort)}
                    aria-describedby={passwordErrors.password ? 'new-password-error' : 'new-password-hint'}
                    placeholder="Nhập mật khẩu mới"
                    className={`${inputClass} pr-14 ${(passwordErrors.password || passwordTooShort) ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-3 text-xs text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {passwordErrors.password ? (
                  <p id="new-password-error" role="alert" className="mt-1 text-xs text-red-600">{passwordErrors.password}</p>
                ) : (
                  <p id="new-password-hint" className={`mt-1 text-xs ${passwordTooShort ? 'text-red-600' : 'text-gray-500'}`}>
                    Mật khẩu tối thiểu 8 ký tự
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nhập lại mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      setPasswordErrors((current) => ({ ...current, confirmPassword: '' }))
                    }}
                    aria-invalid={Boolean(passwordErrors.confirmPassword || passwordMismatch)}
                    aria-describedby={passwordErrors.confirmPassword ? 'confirm-password-error' : undefined}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`${inputClass} pr-14 ${(passwordErrors.confirmPassword || passwordMismatch) ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-3 text-xs text-gray-500 hover:text-gray-800"
                  >
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {(passwordErrors.confirmPassword || passwordMismatch) && (
                  <p id="confirm-password-error" role="alert" className="mt-1 text-xs text-red-600">
                    {passwordErrors.confirmPassword || 'Mật khẩu nhập lại không trùng khớp.'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-[#056F1C] text-sm font-semibold text-white transition-colors hover:bg-[#045a16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
              >
                Xác nhận
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
