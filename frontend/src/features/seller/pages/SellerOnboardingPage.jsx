import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSellerApplication, saveSellerApplication } from '@/mocks/seller'

const EMPTY_FORM = {
  shopName: '',
  avatar: '',
  address: '',
  description: '',
  taxCode: '',
  identityNumber: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountName: '',
}

function InputField({ id, label, value, onChange, error, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...inputProps}
      />
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function SellerOnboardingPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(user ? getSellerApplication(user.id) : {}),
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isLoggedIn) return <Navigate to="/seller" replace />
  if (user?.role !== 'user') return <Navigate to="/" replace />
  const existingApplication = getSellerApplication(user.id)
  if (existingApplication?.status === 'approved') return <Navigate to="/seller/dashboard" replace />
  if (existingApplication?.status === 'pending') return <Navigate to="/seller/pending" replace />

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, avatar: 'Vui lòng chọn tệp hình ảnh.' }))
      return
    }
    if (file.size > 500 * 1024) {
      setErrors((current) => ({ ...current, avatar: 'Ảnh đại diện tối đa 500 KB trong bản demo.' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar: String(reader.result) }))
      setErrors((current) => ({ ...current, avatar: '' }))
    }
    reader.onerror = () => setErrors((current) => ({ ...current, avatar: 'Không thể đọc tệp ảnh đã chọn.' }))
    reader.readAsDataURL(file)
  }

  const validateStep = () => {
    const nextErrors = {}
    if (step === 1) {
      if (!form.shopName.trim()) nextErrors.shopName = 'Vui lòng nhập tên shop.'
      else if (form.shopName.trim().length < 2) nextErrors.shopName = 'Tên shop cần ít nhất 2 ký tự.'
      if (!form.address.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ shop.'
      if (!form.description.trim()) nextErrors.description = 'Vui lòng nhập mô tả shop.'
    } else {
      if (!form.taxCode.trim()) nextErrors.taxCode = 'Vui lòng nhập mã số thuế.'
      if (!form.identityNumber.trim()) nextErrors.identityNumber = 'Vui lòng nhập số CCCD.'
      if (!form.bankName.trim()) nextErrors.bankName = 'Vui lòng nhập tên ngân hàng.'
      if (!form.bankAccountNumber.trim()) nextErrors.bankAccountNumber = 'Vui lòng nhập số tài khoản.'
      if (!form.bankAccountName.trim()) nextErrors.bankAccountName = 'Vui lòng nhập tên chủ tài khoản.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitApplication = () => {
    if (!validateStep()) return
    setIsSaving(true)
    setFormError('')
    try {
      saveSellerApplication(user.id, form)
      navigate('/seller/pending', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể lưu hồ sơ đăng ký shop.')
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    if (step === 1) {
      logout()
      navigate('/seller', { replace: true })
      return
    }
    setStep(1)
  }

  return (
    <main className="flex-1 bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7">
          <p className="text-sm font-semibold text-[#056F1C]">ĐĂNG KÝ SHOP · BƯỚC {step}/2</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Hoàn tất hồ sơ người bán</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Thông tin này được lưu trong trình duyệt phục vụ bản demo đồ án, không kết nối dịch vụ thuế, định danh hay ngân hàng.</p>
        </header>
        <div className="mb-6 flex gap-2" aria-label="Tiến độ đăng ký">
          {[1, 2].map((number) => (
            <div key={number} className={`h-1.5 flex-1 rounded-full ${step >= number ? 'bg-[#056F1C]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thông tin cửa hàng</h2>
                <p className="mt-1 text-sm text-gray-500">Tên, ảnh đại diện và thông tin hiển thị của shop.</p>
              </div>
              <InputField id="shop-name" label="Tên shop" value={form.shopName} onChange={update('shopName')} error={errors.shopName} maxLength={80} />
              <div>
                <label htmlFor="shop-avatar" className="mb-1.5 block text-sm font-medium text-gray-700">Ảnh đại diện shop (không bắt buộc)</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xl font-semibold text-gray-400">
                    {form.avatar ? <img src={form.avatar} alt="Xem trước ảnh đại diện shop" className="h-full w-full object-cover" /> : (form.shopName.trim()[0] ?? 'S')}
                  </div>
                  <input id="shop-avatar" type="file" accept="image/*" onChange={chooseAvatar} className="min-w-0 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-semibold file:text-[#056F1C]" />
                </div>
                {errors.avatar && <p role="alert" className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
              </div>
              <InputField id="shop-address" label="Địa chỉ shop" value={form.address} onChange={update('address')} error={errors.address} placeholder="Phường/xã, quận/huyện, tỉnh/thành" maxLength={250} />
              <div>
                <label htmlFor="shop-description" className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả shop</label>
                <textarea id="shop-description" rows={4} value={form.description} onChange={update('description')} aria-invalid={Boolean(errors.description)} className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} maxLength={1000} />
                {errors.description && <p role="alert" className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thông tin xác minh</h2>
                <p className="mt-1 text-sm text-gray-500">Dùng để admin xem xét hồ sơ trong bản demo.</p>
              </div>
              <InputField id="tax-code" label="Mã số thuế" value={form.taxCode} onChange={update('taxCode')} error={errors.taxCode} maxLength={30} />
              <InputField id="identity-number" label="Số CCCD" value={form.identityNumber} onChange={update('identityNumber')} error={errors.identityNumber} inputMode="numeric" maxLength={20} />
              <InputField id="bank-name" label="Ngân hàng" value={form.bankName} onChange={update('bankName')} error={errors.bankName} maxLength={100} />
              <InputField id="bank-account-number" label="Số tài khoản" value={form.bankAccountNumber} onChange={update('bankAccountNumber')} error={errors.bankAccountNumber} inputMode="numeric" maxLength={30} />
              <InputField id="bank-account-name" label="Tên chủ tài khoản" value={form.bankAccountName} onChange={update('bankAccountName')} error={errors.bankAccountName} maxLength={100} />
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                Đây là thông tin mẫu lưu cục bộ trong trình duyệt. Không nhập thông tin thật; demo không thực hiện xác minh hay giao dịch ngân hàng.
              </p>
            </div>
          )}
          {formError && <p role="alert" className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={goBack} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
            {step === 1 ? (
              <button type="button" onClick={() => validateStep() && setStep(2)} className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517]">
                Tiếp tục
              </button>
            ) : (
              <button type="button" disabled={isSaving} onClick={submitApplication} className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-wait disabled:opacity-60">
                {isSaving ? 'Đang gửi...' : 'Gửi admin duyệt'}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
