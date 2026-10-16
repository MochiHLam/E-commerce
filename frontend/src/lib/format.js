export const formatVND = (value) =>
  value == null ? '—' : `${new Intl.NumberFormat('vi-VN').format(value)} ₫`
