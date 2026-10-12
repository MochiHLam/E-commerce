export const formatVND = (n) => (n == null ? '—' : `${new Intl.NumberFormat('vi-VN').format(n)} ₫`)

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

export const formatShortDateTime = (iso) => {
  const d = new Date(iso)
  const hhmm = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const ddmmyyyy = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${hhmm} - ${ddmmyyyy}`
}

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const formatHourMinute = (iso) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

export const formatDuration = (sec) => (sec % 60 === 0 ? `${sec / 60} phút` : `${sec} giây`)

export const ITEM_STATUS = {
  sold:   { label: 'Đấu giá thành', className: 'bg-[#E8F5EB] text-[#056F1C]' },
  unsold: { label: 'Không thành',   className: 'bg-red-100 text-red-700' },
}

export const SESSION_ITEM_STATUS = {
  queued:  { label: 'Chờ lên sàn',    className: 'bg-gray-100 text-gray-600' },
  bidding: { label: 'Đang đấu giá',   className: 'bg-amber-100 text-amber-700' },
  sold:    { label: 'Đấu giá thành',  className: 'bg-[#E8F5EB] text-[#056F1C]' },
  unsold:  { label: 'Không thành',    className: 'bg-red-100 text-red-700' },
}

export function getItemStatus(item) {
  return item.state === 'sold' ? 'sold' : 'unsold'
}