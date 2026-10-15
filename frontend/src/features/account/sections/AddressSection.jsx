import { Plus } from 'lucide-react'

export default function AddressSection({
  addresses,
  message,
  form,
  setForm,
  errors,
  submitted,
  showForm,
  editingAddressId,
  onOpenForm,
  onRequestDelete,
  onSetDefault,
  onSave,
  onCancel,
  inputClass,
  invalidInputClass,
}) {
  return (
    <div className="max-w-5xl overflow-hidden rounded border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-medium text-gray-900">Địa chỉ của tôi</h1>
        <button
          type="button"
          onClick={() => onOpenForm()}
          className="inline-flex items-center gap-2 rounded-sm bg-[#056F1C] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#045517]"
        >
          <Plus className="h-5 w-5" />
          Thêm địa chỉ
        </button>
      </div>

      <div className="px-6">
        <h2 className="py-5 text-lg font-medium text-gray-900">Địa chỉ</h2>
        {message && <p role="status" className="mb-4 text-sm text-[#056F1C]">{message}</p>}
        {addresses.length === 0 && !showForm && (
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
            <p className="text-sm text-gray-500">Bạn chưa có địa chỉ nhận hàng. Hãy thêm địa chỉ để thuận tiện khi mua sắm.</p>
          </div>
        )}

        {addresses.map((address) => (
          <article key={address.id} className="flex flex-col gap-4 border-b border-gray-200 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-medium text-gray-900">{address.recipientName}</h3>
                <span className="hidden h-5 border-l border-gray-300 sm:block" />
                <p className="text-sm text-gray-500">{address.phone}</p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-500">{address.address}</p>
              {address.isDefault && (
                <span className="mt-2 inline-block border border-[#F4512C] px-1.5 py-0.5 text-xs text-[#F4512C]">
                  Mặc định
                </span>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <div className="flex items-center gap-3 text-sm">
                <button type="button" onClick={() => onOpenForm(address)} className="text-blue-600 hover:underline">
                  Sửa
                </button>
                {!address.isDefault && (
                  <>
                    <span className="h-4 border-l border-gray-300" />
                    <button type="button" onClick={() => onRequestDelete(address.id)} className="text-blue-600 hover:underline">
                      Xóa
                    </button>
                  </>
                )}
              </div>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => onSetDefault(address.id)}
                  className="rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          </article>
        ))}

        {showForm && (
          <form noValidate onSubmit={onSave} className="my-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-4 font-semibold text-gray-900">{editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="address-recipient" className="mb-1.5 block text-sm font-medium text-gray-600">Họ và tên người nhận</label>
                <input
                  id="address-recipient"
                  type="text"
                  value={form.recipientName}
                  onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
                  required
                  aria-invalid={submitted && Boolean(errors.recipientName)}
                  className={`${inputClass} ${submitted && errors.recipientName ? invalidInputClass : ''}`}
                />
                {submitted && errors.recipientName && <p role="alert" className="mt-1 text-xs text-red-600">{errors.recipientName}</p>}
              </div>
              <div>
                <label htmlFor="address-phone" className="mb-1.5 block text-sm font-medium text-gray-600">Số điện thoại</label>
                <input
                  id="address-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  required
                  aria-invalid={submitted && Boolean(errors.phone)}
                  className={`${inputClass} ${submitted && errors.phone ? invalidInputClass : ''}`}
                />
                {submitted && errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address-full" className="mb-1.5 block text-sm font-medium text-gray-600">Địa chỉ cụ thể</label>
                <textarea
                  id="address-full"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  autoComplete="street-address"
                  rows={3}
                  required
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                  aria-invalid={submitted && Boolean(errors.address)}
                  className={`w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15 ${submitted && errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                />
                {submitted && errors.address && <p role="alert" className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="rounded bg-[#056F1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]">
                Lưu địa chỉ
              </button>
              <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-white">
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
