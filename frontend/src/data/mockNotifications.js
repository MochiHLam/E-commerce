import { CircleDollarSign, Gavel, PackageCheck, ShoppingBag } from 'lucide-react'

export const INITIAL_NOTIFICATIONS = import.meta.env.DEV ? [
  { id: 'noti-1', type: 'order', title: 'Đơn hàng của bạn đã được xác nhận.', createdAt: Date.now() - 5 * 60_000, href: '/cart', isRead: false },
  { id: 'noti-2', type: 'auction', title: 'Phiên đấu giá mùa thu đã kết thúc.', createdAt: Date.now() - 42 * 60_000, href: '/auction/history/ses_004', isRead: false },
  { id: 'noti-3', type: 'wallet', title: 'Ví của bạn vừa được cập nhật.', createdAt: Date.now() - 3 * 60 * 60_000, href: '/account', isRead: true },
  { id: 'noti-4', type: 'report', title: 'Báo cáo của bạn đã được xử lý.', createdAt: Date.now() - 8 * 60 * 60_000, href: '/help/contact/report', isRead: true },
  { id: 'noti-5', type: 'order', title: 'Cửa hàng đã bàn giao đơn hàng cho đơn vị vận chuyển.', createdAt: Date.now() - 24 * 60 * 60_000, href: '/cart', isRead: true },
  { id: 'noti-6', type: 'auction', title: 'Phiên đấu giá sắp diễn ra.', createdAt: Date.now() - 2 * 24 * 60 * 60_000, href: '/auction/about', isRead: true },
  { id: 'noti-7', type: 'order', title: 'Đơn hàng đã giao thành công.', createdAt: Date.now() - 3 * 24 * 60 * 60_000, href: '/cart', isRead: true },
] : []

export const NOTIFICATION_ICONS = {
  order: PackageCheck,
  auction: Gavel,
  wallet: CircleDollarSign,
  report: ShoppingBag,
}

export function formatRelativeTime(timestamp) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}
