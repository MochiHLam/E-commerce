import { Mail, UserRound } from 'lucide-react'

export default function ProfileSection({
  form,
  onChange,
  onSubmit,
  submitted,
  errors,
  onAvatarChange,
  avatarError,
  inputClass,
  invalidInputClass,
}) {
  return (
    <>
      <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Hồ sơ</h1>
      <form noValidate onSubmit={onSubmit} className="max-w-5xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid content-start gap-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
            <label htmlFor="profile-name" className="text-sm font-medium text-gray-600">Họ và tên</label>
            <div>
              <input
                id="profile-name"
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                autoComplete="name"
                required
                aria-invalid={submitted && Boolean(errors.name)}
                className={`${inputClass} ${submitted && errors.name ? invalidInputClass : ''}`}
              />
              <p className="mt-1.5 text-xs text-gray-500">Tài khoản chỉ có thể đổi tên 30 ngày 1 lần</p>
              {submitted && errors.name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <label htmlFor="profile-email" className="text-sm font-medium text-gray-600">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="profile-email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                required
                aria-invalid={submitted && Boolean(errors.email)}
                className={`${inputClass} pl-10 ${submitted && errors.email ? invalidInputClass : ''}`}
              />
              {submitted && errors.email && <p role="alert" className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <label htmlFor="profile-phone" className="text-sm font-medium text-gray-600">Số điện thoại</label>
            <div>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                autoComplete="tel"
                placeholder="0901 234 567"
                required
                aria-invalid={submitted && Boolean(errors.phone)}
                className={`${inputClass} ${submitted && errors.phone ? invalidInputClass : ''}`}
              />
              {submitted && errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <label htmlFor="profile-gender" className="text-sm font-medium text-gray-600">Giới tính</label>
            <div>
              <select
                id="profile-gender"
                name="gender"
                value={form.gender}
                onChange={onChange}
                required
                aria-invalid={submitted && Boolean(errors.gender)}
                className={`${inputClass} bg-white ${submitted && errors.gender ? invalidInputClass : ''}`}
              >
                <option value="">Chọn...</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {submitted && errors.gender && <p role="alert" className="mt-1 text-xs text-red-600">{errors.gender}</p>}
            </div>

            <label htmlFor="profile-dob" className="text-sm font-medium text-gray-600">Ngày sinh</label>
            <div>
              <input
                id="profile-dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={onChange}
                autoComplete="bday"
                required
                aria-invalid={submitted && Boolean(errors.dob)}
                className={`${inputClass} ${submitted && errors.dob ? invalidInputClass : ''}`}
              />
              {submitted && errors.dob && <p role="alert" className="mt-1 text-xs text-red-600">{errors.dob}</p>}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Chọn ảnh
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={onAvatarChange}
                className="sr-only"
                aria-label="Chọn ảnh đại diện"
              />
            </label>
            <p className="text-center text-xs text-gray-500">Dung lượng tối đa 1 MB. Định dạng JPEG, PNG.</p>
            {avatarError && <p role="alert" className="text-center text-xs text-red-600">{avatarError}</p>}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-5">
          <button type="submit" className="rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517]">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </>
  )
}
