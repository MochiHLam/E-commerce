import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/mocks/categories'
import { useAuth } from '@/context/AuthContext'
import {
  createShopSlug,
  getSellerApplication,
  getSellerInformationChangeAvailableAt,
  isSellerFieldAvailable,
  saveSellerApplication,
  saveSellerDraft,
  submitSellerInformationUpdate,
} from '@/mocks/seller'

const EMPTY_FORM = {
  shopName: '',
  slug: '',
  categoryId: '',
  description: '',
  contactName: '',
  phone: '',
  pickupAddress: '',
  email: '',
  identityNumber: '',
  taxCode: '',
  agreedTermsAt: '',
}

const STEP_TITLES = ['Thông tin shop', 'Liên hệ và lấy hàng', 'Xác minh', 'Xem lại']
const FIELD_CLASS = 'h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15'

function Field({ id, label, error, className = FIELD_CLASS, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} aria-invalid={Boolean(error)} className={`${className} ${error ? 'border-red-500' : ''}`} {...inputProps} />
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function formatCategory(categoryId) {
  return CATEGORIES.find((category) => String(category.id) === String(categoryId))?.name ?? 'Chưa chọn'
}

export default function SellerOnboardingPage({ isInformationUpdate = false }) {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const savedApplication = user?.id ? getSellerApplication(user.id) : null
  const defaultAddress = user?.shippingAddresses?.find((address) => address.isDefault)?.address ?? user?.address ?? ''
  const [step, setStep] = useState(() => (
    isInformationUpdate ? 1 : Math.min(Math.max(savedApplication?.step ?? 1, 1), 4)
  ))
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    shopName: savedApplication?.shopName ?? '',
    slug: isInformationUpdate
      ? savedApplication?.slug ?? createShopSlug(savedApplication?.shopName ?? '')
      : createShopSlug(savedApplication?.shopName ?? ''),
    categoryId: savedApplication?.categoryId ?? '',
    description: savedApplication?.description ?? '',
    contactName: savedApplication?.contactName ?? user?.name ?? '',
    phone: savedApplication?.phone ?? user?.phone ?? '',
    pickupAddress: savedApplication?.pickupAddress ?? defaultAddress,
    identityNumber: savedApplication?.identityNumber ?? '',
    taxCode: savedApplication?.taxCode ?? '',
    agreedTermsAt: savedApplication?.agreedTermsAt ?? '',
    email: user?.email ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const initialFormRef = useRef(form)
  const allowNavigationRef = useRef(false)
  const suppressNextPopRef = useRef(false)
  const isDirty = Object.keys(EMPTY_FORM).some((field) => form[field] !== initialFormRef.current[field])
  const leaveMessage = isInformationUpdate
    ? 'Bạn có thay đổi chưa gửi. Nếu rời trang, các thay đổi này sẽ bị mất. Bạn có muốn tiếp tục rời trang không?'
    : 'Bạn có thay đổi trong hồ sơ. Bản nháp được lưu tự động trên trình duyệt; bạn có muốn rời trang không?'

  useEffect(() => {
    if (!isDirty) return undefined

    const confirmInternalNavigation = (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target.closest?.('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const target = new URL(anchor.href, window.location.href)
      if (target.origin !== window.location.origin) return
      if (target.pathname === location.pathname && target.search === location.search) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (!window.confirm(leaveMessage)) return
      allowNavigationRef.current = true
      navigate(`${target.pathname}${target.search}${target.hash}`)
    }

    const confirmBrowserNavigation = (event) => {
      if (suppressNextPopRef.current) {
        suppressNextPopRef.current = false
        return
      }
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false
        return
      }
      if (window.confirm(leaveMessage)) {
        allowNavigationRef.current = true
        return
      }
      event.stopImmediatePropagation()
      suppressNextPopRef.current = true
      window.history.forward()
    }

    const confirmPageUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    document.addEventListener('click', confirmInternalNavigation, true)
    window.addEventListener('popstate', confirmBrowserNavigation, true)
    window.addEventListener('beforeunload', confirmPageUnload)
    return () => {
      document.removeEventListener('click', confirmInternalNavigation, true)
      window.removeEventListener('popstate', confirmBrowserNavigation, true)
      window.removeEventListener('beforeunload', confirmPageUnload)
    }
  }, [isDirty, leaveMessage, location.pathname, location.search, navigate])

  if (!isLoggedIn) return <Navigate to="/seller" replace />
  if (user?.role !== 'user') return <Navigate to="/seller" replace />
  if (isInformationUpdate && savedApplication?.status !== 'approved') {
    return <Navigate to="/seller/dashboard" replace />
  }
  if (isInformationUpdate && savedApplication.pendingInformationUpdate) {
    return <Navigate to="/seller/information" replace />
  }
  if (!isInformationUpdate && savedApplication?.status === 'pending') return <Navigate to="/seller/pending" replace />
  if (!isInformationUpdate && ['approved', 'suspended', 'banned'].includes(savedApplication?.status)) {
    return <Navigate to="/seller/dashboard" replace />
  }

  const isEditingRejectedApplication = savedApplication?.status === 'rejected'
  const informationChangeAvailableAt = getSellerInformationChangeAvailableAt(savedApplication)
  const isInformationChangeLocked = Boolean(
    informationChangeAvailableAt && Date.now() < informationChangeAvailableAt.getTime(),
  )

  const persistDraft = (nextForm, nextStep = step) => {
    if (isInformationUpdate) return true
    try {
      saveSellerDraft(user.id, nextForm, nextStep)
      setFormError('')
      return true
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể lưu bản nháp.')
      return false
    }
  }

  const updateField = (field, value) => {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    setErrors((current) => ({ ...current, [field]: '' }))
    persistDraft(nextForm)
  }

  const handleShopNameChange = (event) => {
    const shopName = event.target.value
    const nextForm = {
      ...form,
      shopName,
      ...(isInformationUpdate ? {} : { slug: createShopSlug(shopName) }),
    }
    setForm(nextForm)
    setErrors((current) => ({ ...current, shopName: '' }))
    persistDraft(nextForm)
  }

  const validateStep = (stepToValidate, values = form) => {
    const nextErrors = {}
    if (stepToValidate === 1) {
      const shopName = values.shopName.trim()
      if (shopName.length < 2 || shopName.length > 50) {
        nextErrors.shopName = 'Tên shop cần từ 2 đến 50 ký tự.'
      } else if (shopName !== savedApplication?.shopName && !isSellerFieldAvailable(user.id, 'shopName', shopName)) {
        nextErrors.shopName = 'Tên shop đã được sử dụng.'
      }
      if (!isInformationUpdate) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
          nextErrors.slug = 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.'
        } else if (values.slug !== savedApplication?.slug && !isSellerFieldAvailable(user.id, 'slug', values.slug)) {
          nextErrors.slug = 'Đường dẫn này đã được sử dụng.'
        }
      }
      if (!values.categoryId) nextErrors.categoryId = 'Vui lòng chọn danh mục chính.'
      if (values.description.trim().length < 20) {
        nextErrors.description = 'Mô tả shop cần ít nhất 20 ký tự.'
      }
    } else if (stepToValidate === 2) {
      if (!values.contactName.trim()) nextErrors.contactName = 'Vui lòng nhập tên người đại diện.'
      if (!/^(?:0\d{9}|\+84\d{9})$/.test(values.phone.trim())) {
        nextErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ.'
      }
      if (!values.pickupAddress.trim()) nextErrors.pickupAddress = 'Vui lòng nhập địa chỉ lấy hàng.'
    } else if (stepToValidate === 3) {
      if (!/^\d{12}$/.test(values.identityNumber.trim())) {
        nextErrors.identityNumber = 'Số CCCD cần gồm đúng 12 chữ số.'
      }
      if (values.taxCode.trim() && !/^(?:\d{10}|\d{13})$/.test(values.taxCode.trim())) {
        nextErrors.taxCode = 'Mã số thuế gồm 10 hoặc 13 chữ số.'
      }
    }
    return nextErrors
  }

  const goToNextStep = () => {
    const nextErrors = validateStep(step)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const nextStep = Math.min(step + 1, 4)
    if (!persistDraft(form, nextStep)) return
    setStep(nextStep)
  }

  const goToStep = (nextStep) => {
    if (nextStep < step) {
      if (persistDraft(form, nextStep)) setStep(nextStep)
      return
    }
    goToNextStep()
  }

  const submitApplication = () => {
    if (isInformationUpdate && isInformationChangeLocked) {
      setFormError(`Bạn có thể gửi yêu cầu đổi thông tin sau ngày ${informationChangeAvailableAt.toLocaleDateString('vi-VN')}.`)
      return
    }
    const validationErrors = [1, 2, 3].map((stepNumber) => validateStep(stepNumber))
    const firstInvalidStep = validationErrors.findIndex((stepErrors) => Object.keys(stepErrors).length > 0)
    if (firstInvalidStep >= 0) {
      setErrors(validationErrors[firstInvalidStep])
      setStep(firstInvalidStep + 1)
      return
    }
    if (!isInformationUpdate && !form.agreedTermsAt) {
      setErrors({ agreedTermsAt: 'Vui lòng xác nhận đồng ý với Thỏa thuận Mua bán.' })
      return
    }

    setIsSaving(true)
    setFormError('')
    try {
      if (isInformationUpdate) {
        submitSellerInformationUpdate(user.id, {
          ...form,
          slug: savedApplication.slug,
          email: savedApplication.email || user.email || '',
        })
        allowNavigationRef.current = true
        navigate('/seller/information', { replace: true })
      } else {
        saveSellerApplication(user.id, { ...form, agreedTermsAt: new Date().toISOString() })
        allowNavigationRef.current = true
        navigate('/seller/pending', { replace: true })
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể gửi hồ sơ đăng ký shop.')
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    if (step > 1) {
      const previousStep = step - 1
      if (persistDraft(form, previousStep)) setStep(previousStep)
      return
    }
    if (isDirty && !window.confirm(leaveMessage)) return
    allowNavigationRef.current = true
    if (isInformationUpdate) {
      navigate('/seller/information')
      return
    }
    if (isEditingRejectedApplication) {
      navigate('/seller/pending')
      return
    }
    logout()
    navigate('/seller', { replace: true })
  }

  return (
    <main className="flex-1 bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isInformationUpdate ? 'Thay đổi thông tin cửa hàng' : isEditingRejectedApplication ? 'Cập nhật hồ sơ cửa hàng' : 'Hoàn tất hồ sơ người bán'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {isInformationUpdate
              ? 'Thông tin thay đổi sẽ được gửi admin xét duyệt. Shop vẫn hoạt động với thông tin hiện tại trong thời gian chờ.'
              : 'Hoàn tất thông tin cửa hàng, liên hệ và xác minh để gửi hồ sơ xét duyệt.'}
          </p>
        </header>
        {isInformationUpdate && (
          <div className={`mb-6 rounded-xl border p-4 text-sm leading-6 ${
            isInformationChangeLocked
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-green-200 bg-green-50 text-green-900'
          }`}>
            {isInformationChangeLocked
              ? `Shop có thể gửi yêu cầu thay đổi tiếp theo từ ngày ${informationChangeAvailableAt.toLocaleDateString('vi-VN')}.`
              : 'Yêu cầu thay đổi cần được admin duyệt trước khi áp dụng; shop vẫn hoạt động bình thường trong lúc chờ.'}
          </div>
        )}
        {isEditingRejectedApplication && savedApplication.reviewNote && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Lý do hồ sơ chưa được duyệt</p>
            <p className="mt-1 whitespace-pre-wrap">{savedApplication.reviewNote}</p>
          </div>
        )}
        <div className="mb-6 flex gap-2" aria-label="Tiến độ đăng ký">
          {STEP_TITLES.map((title, index) => (
            <div key={title} className={`h-1.5 flex-1 rounded-full ${step >= index + 1 ? 'bg-[#056F1C]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{STEP_TITLES[0]}</h2>
                <p className="mt-1 text-sm text-gray-500">Thông tin cơ bản sẽ hiển thị trên gian hàng của bạn.</p>
              </div>
              <Field id="shop-name" label="Tên shop" value={form.shopName} onChange={handleShopNameChange} error={errors.shopName} maxLength={50} />
              <div>
                <p className="mb-1.5 block text-sm font-medium text-gray-700">Đường dẫn shop</p>
                <p className="min-h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                  navishop.vn/{form.slug || 'ten-shop'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isInformationUpdate
                    ? 'Đường dẫn shop đã được tạo và không thể thay đổi.'
                    : 'Đường dẫn được tạo tự động từ tên shop và không thể chỉnh sửa.'}
                </p>
                {errors.slug && <p role="alert" className="mt-1 text-xs text-red-600">{errors.slug}</p>}
              </div>
              <div>
                <label htmlFor="shop-category" className="mb-1.5 block text-sm font-medium text-gray-700">Danh mục chính</label>
                <select
                  id="shop-category"
                  value={form.categoryId}
                  onChange={(event) => updateField('categoryId', event.target.value)}
                  aria-invalid={Boolean(errors.categoryId)}
                  className={`${FIELD_CLASS} ${errors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="">Chọn danh mục</option>
                  {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {errors.categoryId && <p role="alert" className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
              </div>
              <div>
                <label htmlFor="shop-description" className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả shop</label>
                <textarea
                  id="shop-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-500">Tối thiểu 20 ký tự.</p>
                {errors.description && <p role="alert" className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{STEP_TITLES[1]}</h2>
                <p className="mt-1 text-sm text-gray-500">Thông tin để NaviShop liên hệ và xử lý đơn hàng của shop.</p>
              </div>
              <Field id="seller-contact-name" label="Tên người đại diện" value={form.contactName} onChange={(event) => updateField('contactName', event.target.value)} error={errors.contactName} maxLength={100} />
              <Field id="seller-phone" label="Số điện thoại" type="tel" inputMode="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} error={errors.phone} maxLength={13} />
              <Field
                id="seller-email"
                label="Email đăng nhập"
                type="email"
                value={user.email ?? ''}
                readOnly
                aria-readonly="true"
                className={`${FIELD_CLASS} cursor-not-allowed bg-gray-50 text-gray-600`}
              />
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="pickup-address" className="block text-sm font-medium text-gray-700">Địa chỉ lấy hàng</label>
                  <button type="button" onClick={() => updateField('pickupAddress', defaultAddress)} className="text-xs font-semibold text-[#056F1C] hover:underline">
                    Dùng địa chỉ mặc định của tôi
                  </button>
                </div>
                <textarea
                  id="pickup-address"
                  rows={3}
                  value={form.pickupAddress}
                  onChange={(event) => updateField('pickupAddress', event.target.value)}
                  aria-invalid={Boolean(errors.pickupAddress)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${errors.pickupAddress ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={250}
                />
                {errors.pickupAddress && <p role="alert" className="mt-1 text-xs text-red-600">{errors.pickupAddress}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{STEP_TITLES[2]}</h2>
                <p className="mt-1 text-sm text-gray-500">Cung cấp thông tin để hoàn tất hồ sơ cửa hàng.</p>
              </div>
              <Field id="identity-number" label="Số CCCD" inputMode="numeric" value={form.identityNumber} onChange={(event) => updateField('identityNumber', event.target.value.replace(/\D/g, '').slice(0, 12))} error={errors.identityNumber} maxLength={12} />
              <Field id="tax-code" label="Mã số thuế (không bắt buộc)" inputMode="numeric" value={form.taxCode} onChange={(event) => updateField('taxCode', event.target.value.replace(/\D/g, '').slice(0, 13))} error={errors.taxCode} maxLength={13} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{STEP_TITLES[3]}</h2>
                <p className="mt-1 text-sm text-gray-500">Kiểm tra lại thông tin trước khi gửi xét duyệt.</p>
              </div>
              {[
                {
                  title: STEP_TITLES[0],
                  stepNumber: 1,
                  rows: [
                    ['Tên shop', form.shopName],
                    ['Đường dẫn shop', `navishop.vn/${form.slug}`],
                    ['Danh mục chính', formatCategory(form.categoryId)],
                    ['Mô tả', form.description],
                  ],
                },
                {
                  title: STEP_TITLES[1],
                  stepNumber: 2,
                  rows: [
                    ['Người đại diện', form.contactName],
                    ['Số điện thoại', form.phone],
                    ['Email đăng nhập', user.email],
                    ['Địa chỉ lấy hàng', form.pickupAddress],
                  ],
                },
                {
                  title: STEP_TITLES[2],
                  stepNumber: 3,
                  rows: [
                    ['Số CCCD', form.identityNumber],
                    ['Mã số thuế', form.taxCode || 'Không cung cấp'],
                  ],
                },
              ].map((group) => (
                <section key={group.title} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">{group.title}</h3>
                    <button type="button" onClick={() => goToStep(group.stepNumber)} className="text-sm font-semibold text-[#056F1C] hover:underline">Sửa</button>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {group.rows.map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-xs text-gray-500">{label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-gray-800">{value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
              {!isInformationUpdate && <div>
                <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form.agreedTermsAt)}
                    onChange={(event) => updateField('agreedTermsAt', event.target.checked ? 'accepted' : '')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#056F1C] focus:ring-[#056F1C]"
                  />
                  <span>
                    Tôi đã đọc và đồng ý với{' '}
                    <Link to="/info/policies/trade" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#056F1C] hover:underline">Thỏa thuận Mua bán</Link>.
                  </span>
                </label>
                {errors.agreedTermsAt && <p role="alert" className="mt-1 text-xs text-red-600">{errors.agreedTermsAt}</p>}
              </div>}
            </div>
          )}

          {formError && <p role="alert" className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={goBack} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
            {step < 4 ? (
              <button type="button" onClick={goToNextStep} className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517]">
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving || (isInformationUpdate && isInformationChangeLocked) || (!isInformationUpdate && !form.agreedTermsAt)}
                onClick={submitApplication}
                className="min-h-10 rounded-lg bg-[#056F1C] px-5 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
              >
                {isSaving
                  ? 'Đang gửi...'
                  : isInformationUpdate
                    ? 'Gửi thay đổi để duyệt'
                    : 'Gửi xét duyệt'}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
