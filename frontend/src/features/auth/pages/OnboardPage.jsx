import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

export default function OnboardPage() {
  const { state } = useLocation()
  const email = state?.email

  const [form, setForm] = useState({
    name: '', email: email ?? '', phone: '',
    gender: '', dob: '', address: '',
    password: '', confirm: '',
  })
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Guard: nếu không đến từ bước OTP thì redirect về /register
  if (!email) return <Navigate to="/register" replace />

  const set = (field) => (e) => {
    const value = field === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    if (hasAttemptedSubmit) setErrors(validate(nextForm))
  }

  const passwordTooShort = form.password.length > 0 && form.password.length < 8
  const passwordMismatch = form.confirm.length > 0 && form.confirm !== form.password

  const validate = (values = form) => {
    const errs = {}
    if (!values.name.trim()) errs.name = 'Vui lòng nhập họ và tên.'
    if (!values.email.trim()) errs.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errs.email = 'Email không đúng định dạng.'
    if (!values.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại.'
    else if (!/^\d+$/.test(values.phone)) errs.phone = 'Số điện thoại chỉ được chứa chữ số.'
    if (!values.gender) errs.gender = 'Vui lòng chọn giới tính.'
    if (!values.address.trim()) errs.address = 'Vui lòng nhập địa chỉ.'
    if (!values.password) errs.password = 'Vui lòng nhập mật khẩu.'

    // Tuổi tối thiểu 18
    if (!values.dob) {
      errs.dob = 'Vui lòng chọn ngày sinh.'
    } else {
      const today = new Date()
      const birth = new Date(values.dob)
      const age = today.getFullYear() - birth.getFullYear() -
        (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
      if (Number.isNaN(birth.getTime()) || age < 18) errs.dob = 'Ngày sinh không hợp lệ hoặc bạn chưa đủ 18 tuổi.'
    }

    // Mật khẩu tối thiểu 8 ký tự
    if (values.password && values.password.length < 8)
      errs.password = 'Mật khẩu phải có ít nhất 8 ký tự.'

    // Xác nhận khớp
    if (!values.confirm) errs.confirm = 'Vui lòng xác nhận mật khẩu.'
    else if (values.confirm !== values.password) errs.confirm = 'Mật khẩu xác nhận không khớp.'

    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    // TODO: gọi API đăng ký
  }

  const inputClass = `w-full h-10 px-4 rounded-lg border border-gray-300 text-sm outline-none
    focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 transition-all
    placeholder:text-gray-300`

  return (
    <main className="flex-1 bg-[#056F1C] flex items-center justify-center py-12 px-[210px]">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-name">
              Họ và tên
            </label>
            <input
              id="reg-name" name="name" type="text" required
              value={form.name} onChange={set('name')}
              placeholder="Nguyễn Văn A"
              aria-invalid={Boolean(errors.name)}
              className={`${inputClass} ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {errors.name && <p role="alert" className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email" name="email" type="email" autoComplete="email" required
              value={form.email} onChange={set('email')}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className={`${inputClass} ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {errors.email && <p role="alert" className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-phone">
              Số điện thoại
            </label>
            <input
              id="reg-phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" required
              value={form.phone} onChange={set('phone')}
              placeholder="0901234567"
              aria-invalid={Boolean(errors.phone)}
              className={`${inputClass} ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {errors.phone && <p role="alert" className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Giới tính + Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-gender">
                Giới tính
              </label>
              <select
                id="reg-gender" name="gender" required
                value={form.gender} onChange={set('gender')}
                aria-invalid={Boolean(errors.gender)}
                className={`${inputClass} bg-white ${errors.gender ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
              >
                <option value="" disabled>Chọn...</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && <p role="alert" className="mt-1 text-xs text-red-500">{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-dob">
                Ngày sinh
              </label>
              <input
                id="reg-dob" name="dob" type="date" required
                value={form.dob} onChange={set('dob')}
                aria-invalid={Boolean(errors.dob)}
                className={`${inputClass} text-gray-600 ${errors.dob ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
              />
              {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob}</p>}
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-address">
              Địa chỉ
            </label>
            <input
              id="reg-address" name="address" type="text" required
              value={form.address} onChange={set('address')}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
              aria-invalid={Boolean(errors.address)}
              className={`${inputClass} ${errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {errors.address && <p role="alert" className="mt-1 text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password" required
                value={form.password} onChange={set('password')}
                placeholder="Nhập mật khẩu"
                aria-invalid={passwordTooShort || Boolean(errors.password)}
                className={`${inputClass} pr-10 ${passwordTooShort || errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {show ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <p className={`mt-1.5 text-xs ${passwordTooShort ? 'text-red-500' : 'text-gray-500'}`}>
              {passwordTooShort ? 'Mật khẩu phải có ít nhất 8 ký tự.' : 'Mật khẩu tối thiểu 8 ký tự'}
            </p>
            {errors.password && (!passwordTooShort || !form.password) && <p role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-confirm">
              Xác nhận mật khẩu
            </label>
            <input
              id="reg-confirm" name="confirm"
              type={show ? 'text' : 'password'}
              autoComplete="new-password" required
              value={form.confirm} onChange={set('confirm')}
              placeholder="Nhập lại mật khẩu"
              aria-invalid={passwordMismatch || Boolean(errors.confirm)}
              className={`${inputClass} ${passwordMismatch || errors.confirm ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {(passwordMismatch || errors.confirm) && (
              <p role="alert" className="mt-1 text-xs text-red-500">
                {passwordMismatch ? 'Mật khẩu xác nhận không khớp.' : errors.confirm}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            className="w-full h-10 rounded-lg bg-[#056F1C] text-white font-semibold text-sm
              hover:bg-[#045a16] active:scale-[0.99] transition-all mt-2"
          >
            Tạo tài khoản
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center leading-relaxed mt-4">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Link to="/info/policies/terms" target="_blank" rel="noopener noreferrer" className="text-[#056F1C] hover:underline">Điều khoản</Link>
          {' '}và{' '}
          <Link to="/info/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-[#056F1C] hover:underline">Chính sách bảo mật</Link>
          {' '}của NaviShop.
        </p>

      </div>
    </main>
  )
}
