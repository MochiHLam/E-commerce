import { CircleDollarSign, Gavel, PackageCheck, ShoppingBag } from 'lucide-react'

export const INITIAL_NOTIFICATIONS = import.meta.env.DEV ? [
  {
    id: 'noti-1',
    type: 'order',
    title: 'Xác nhận đã thanh toán',
    body: 'Thanh toán cho đơn hàng NS-20421 đã thành công. Đơn hàng đang chờ cửa hàng xác nhận.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 5 * 60_000,
    href: '/user/orders',
    isRead: false,
  },
  {
    id: 'noti-2',
    type: 'auction',
    title: 'Bạn đã thắng phiên đấu giá',
    body: 'Bạn đã thắng vật phẩm Đồng hồ cơ cổ 1960 trong phiên đấu giá mùa thu. Vui lòng xem thông tin chi tiết trong Lịch sử đấu giá.',
    image: '',
    createdAt: Date.now() - 42 * 60_000,
    href: '/auction/history/ses_004',
    isRead: false,
  },
  {
    id: 'noti-3',
    type: 'wallet',
    title: 'Tiền đấu giá đã được tạm khóa',
    body: '500.000 ₫ đã được tạm khóa trong NaviWallet cho lượt trả giá của bạn. Vui lòng xem số dư và chi tiết giao dịch trong NaviWallet.',
    image: '',
    createdAt: Date.now() - 3 * 60 * 60_000,
    href: '/user/wallet',
    isRead: true,
  },
  {
    id: 'noti-4',
    type: 'report',
    title: 'Báo cáo của bạn đã được xử lý',
    body: 'Báo cáo sản phẩm không đúng mô tả đã được đội ngũ kiểm duyệt xem xét. Vui lòng xem kết quả trong Trung tâm trợ giúp.',
    image: '',
    createdAt: Date.now() - 8 * 60 * 60_000,
    href: '/help/contact/report',
    isRead: true,
  },
  {
    id: 'noti-5',
    type: 'order',
    title: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển',
    body: 'Cửa hàng đã bàn giao đơn hàng NS-20388 cho đơn vị vận chuyển. Vui lòng theo dõi hành trình kiện hàng trong Đơn hàng.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 24 * 60 * 60_000,
    href: '/user/orders',
    isRead: true,
  },
  {
    id: 'noti-6',
    type: 'auction',
    title: 'Phiên đấu giá sắp bắt đầu',
    body: 'Phiên đấu giá cuối tuần sẽ bắt đầu trong 30 phút nữa. Vui lòng xem danh sách vật phẩm và thời gian trong Lịch sử đấu giá.',
    image: '',
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
    href: '/auction/about',
    isRead: true,
  },
  {
    id: 'noti-7',
    type: 'order',
    title: 'Kiện hàng được giao thành công',
    body: 'Kiện hàng PK-NS-20296-01 của đơn hàng NS-20296 đã được giao thành công.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 3 * 24 * 60 * 60_000,
    href: '/user/orders',
    isRead: true,
  },
] : []

export const NOTIFICATION_ICONS = {
  order: PackageCheck,
  auction: Gavel,
  wallet: CircleDollarSign,
  report: ShoppingBag,
}

export function formatNotificationDateTime(timestamp) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp))
}

export function createOrderPaymentNotification({ orderId, image }) {
  if (!orderId) throw new Error('Thiếu mã đơn hàng để tạo thông báo thanh toán.')

  return {
    id: `noti-order-payment-${orderId}`,
    type: 'order',
    title: 'Xác nhận đã thanh toán',
    body: `Thanh toán cho đơn hàng ${orderId} thành công. Vui lòng kiểm tra trạng thái đơn hàng chi tiết trong mục Đơn hàng.`,
    image: image || '',
    createdAt: Date.now(),
    href: '/user/orders',
    isRead: false,
  }
}
