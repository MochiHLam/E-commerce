export default function PasswordSection({
  form,
  onChange,
  onSubmit,
  errors,
  showErrors,
  notice,
  inputClass,
  invalidInputClass,
}) {
  return (
    <>
      <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
      <form noValidate onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
        <div>
          <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-gray-600">Mật khẩu cũ</label>
          <input
            id="current-password"
            name="current"
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={onChange}
            required
            aria-invalid={showErrors && Boolean(errors.current)}
            className={`${inputClass} ${showErrors && errors.current ? invalidInputClass : ''}`}
          />
          {showErrors && errors.current && <p role="alert" className="mt-1 text-xs text-red-600">{errors.current}</p>}
        </div>
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-600">Mật khẩu mới</label>
          <input
            id="new-password"
            name="next"
            type="password"
            autoComplete="new-password"
            value={form.next}
            onChange={onChange}
            required
            minLength={8}
            aria-invalid={showErrors && Boolean(errors.next)}
            className={`${inputClass} ${showErrors && errors.next ? invalidInputClass : ''}`}
          />
          <p className={`mt-1.5 text-xs ${showErrors && errors.next ? 'text-red-600' : 'text-gray-500'}`}>
            {showErrors && errors.next ? errors.next : 'Mật khẩu tối thiểu 8 ký tự'}
          </p>
        </div>
        <div>
          <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium text-gray-600">Xác nhận mật khẩu mới</label>
          <input
            id="confirm-new-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={onChange}
            required
            aria-invalid={showErrors && Boolean(errors.confirm)}
            className={`${inputClass} ${showErrors && errors.confirm ? invalidInputClass : ''}`}
          />
          {showErrors && errors.confirm && <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.confirm}</p>}
        </div>
        {notice && <p role="status" className="text-sm text-amber-700">{notice}</p>}
        <button type="submit" className="rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045517]">
          Xác nhận
        </button>
      </form>
    </>
  )
}
