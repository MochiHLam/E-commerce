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

  // Guard: nếu không đến từ bước OTP thì redirect về /register
  if (!email) return <Navigate to="/register" replace />

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}

    // Tuổi tối thiểu 18
    if (form.dob) {
      const today = new Date()
      const birth = new Date(form.dob)
      const age = today.getFullYear() - birth.getFullYear() -
        (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
      if (age < 18) errs.dob = 'Bạn phải từ 18 tuổi trở lên để đăng ký.'
    }

    // Mật khẩu tối thiểu 8 ký tự
    if (form.password.length > 0 && form.password.length < 8)
      errs.password = 'Mật khẩu phải có ít nhất 8 ký tự.'

    // Xác nhận khớp
    if (form.confirm && form.confirm !== form.password)
      errs.confirm = 'Mật khẩu xác nhận không khớp.'

    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-name">
              Họ và tên
            </label>
            <input
              id="reg-name" type="text" required
              value={form.name} onChange={set('name')}
              placeholder="Nguyễn Văn A"
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email" type="email" autoComplete="email" required
              value={form.email} onChange={set('email')}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-phone">
              Số điện thoại
            </label>
            <input
              id="reg-phone" type="tel" required
              value={form.phone} onChange={set('phone')}
              placeholder="0901 234 567"
              className={inputClass}
            />
          </div>

          {/* Giới tính + Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-gender">
                Giới tính
              </label>
              <select
                id="reg-gender" required
                value={form.gender} onChange={set('gender')}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>Chọn...</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-dob">
                Ngày sinh
              </label>
              <input
                id="reg-dob" type="date" required
                value={form.dob} onChange={set('dob')}
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
              id="reg-address" type="text" required
              value={form.address} onChange={set('address')}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
              className={inputClass}
            />
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
                placeholder="Tối thiểu 8 ký tự"
                className={`${inputClass} pr-10 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {show ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-confirm">
              Xác nhận mật khẩu
            </label>
            <input
              id="reg-confirm"
              type={show ? 'text' : 'password'}
              autoComplete="new-password" required
              value={form.confirm} onChange={set('confirm')}
              placeholder="Nhập lại mật khẩu"
              className={`${inputClass} ${errors.confirm ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
            />
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
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
          <Link to="/info/policies/terms" className="text-[#056F1C] hover:underline">Điều khoản</Link>
          {' '}và{' '}
          <Link to="/info/policies/privacy" className="text-[#056F1C] hover:underline">Chính sách bảo mật</Link>
          {' '}của NaviShop.
        </p>

      </div>
    </main>
  )
}
