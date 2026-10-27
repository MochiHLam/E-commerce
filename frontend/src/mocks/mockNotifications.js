import { CircleDollarSign, Gavel, PackageCheck, ShoppingBag } from 'lucide-react'

export const INITIAL_NOTIFICATIONS = import.meta.env.DEV ? [
  {
    id: 'noti-1',
    type: 'order',
    title: 'Xác nhận đã thanh toán',
    body: 'Thanh toán cho đơn hàng order-pending đã thành công. Đơn hàng đang chờ cửa hàng xác nhận.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 5 * 60_000,
    href: '/user/orders/order-pending',
    isRead: false,
  },
  {
    id: 'noti-auction-won',
    type: 'auction',
    title: 'Bạn đã đấu thành công vật phẩm',
    body: 'Chúc mừng! Bạn đã thắng đấu giá vật phẩm Đĩa than Beatles bản gốc với giá 1.400.000 ₫.',
    image: '',
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
    href: '/auction/history/ses_004/items/itm_04',
    isRead: false,
  },
  {
    id: 'noti-2',
    type: 'auction',
    title: 'Bạn đã bị vượt vị trí dẫn đầu',
    body: 'Một người tham gia khác đã trả giá cao hơn cho vật phẩm Bộ tem sưu tầm. Hãy vào phiên đấu giá để tiếp tục theo dõi và trả giá.',
    image: '',
    createdAt: Date.now() - 42 * 60_000,
    href: '/auction/ses_mock/items/itm_03',
    isRead: false,
  },
  {
    id: 'noti-4',
    type: 'report',
    title: 'Báo cáo của bạn đã được xử lý',
    body: 'Báo cáo sản phẩm không đúng mô tả đã được đội ngũ kiểm duyệt xem xét. Vui lòng xem kết quả trong Trung tâm trợ giúp.',
    image: '',
    createdAt: Date.now() - 8 * 60 * 60_000,
    href: '/user/reports/report-mock-001',
    report: {
      type: 'Sản phẩm',
      target: 'Đồng hồ cơ mẫu 4',
      reportedAccount: 'Phụ Kiện Xinh',
      reason: 'Sản phẩm không đúng mô tả',
      details: 'Thông tin mô tả chất liệu và tình trạng sản phẩm không khớp với hình ảnh đăng bán.',
      evidenceImages: [
        {
          src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=480&q=80',
          alt: 'Ảnh bằng chứng sản phẩm đồng hồ',
        },
      ],
      submittedAt: Date.now() - 24 * 60 * 60_000,
      processedAt: Date.now() - 8 * 60 * 60_000,
      result: 'Đội ngũ kiểm duyệt đã xem xét báo cáo.',
    },
    isRead: true,
  },
  {
    id: 'noti-report-shop',
    type: 'report',
    title: 'Báo cáo cửa hàng đã được xử lý',
    body: 'Báo cáo cửa hàng Công Nghệ Mới đã được đội ngũ kiểm duyệt xem xét.',
    image: '',
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
    href: '/user/reports/report-mock-shop',
    report: {
      type: 'Cửa hàng',
      target: 'Công Nghệ Mới',
      reason: 'Có dấu hiệu kinh doanh hàng hóa không đúng cam kết',
      details: 'Thông tin gian hàng và nguồn gốc sản phẩm cần được kiểm tra.',
      evidenceImages: [
        {
          src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=480&q=80',
          alt: 'Ảnh bằng chứng cửa hàng',
        },
      ],
      submittedAt: Date.now() - 3 * 24 * 60 * 60_000,
      processedAt: Date.now() - 2 * 24 * 60 * 60_000,
      result: 'Cửa hàng đã được đội ngũ kiểm duyệt nhắc nhở.',
    },
    isRead: true,
  },
  {
    id: 'noti-report-user',
    type: 'report',
    title: 'Báo cáo người dùng đã được xử lý',
    body: 'Báo cáo người dùng nguyen•••89 đã được đội ngũ kiểm duyệt xem xét.',
    image: '',
    createdAt: Date.now() - 4 * 24 * 60 * 60_000,
    href: '/user/reports/report-mock-user',
    report: {
      type: 'Người dùng',
      target: 'nguyen•••89',
      reason: 'Có hành vi không phù hợp',
      details: 'Người dùng gửi nhiều tin nhắn có nội dung gây phiền hà.',
      evidenceImages: [],
      submittedAt: Date.now() - 5 * 24 * 60 * 60_000,
      processedAt: Date.now() - 4 * 24 * 60 * 60_000,
      result: 'Đội ngũ kiểm duyệt đã gửi cảnh cáo.',
    },
    isRead: true,
  },
  {
    id: 'noti-5',
    type: 'order',
    title: 'Cửa hàng đã bắt đầu giao đơn',
    body: 'Cửa hàng đã bắt đầu giao đơn order-shipping. Bạn có thể theo dõi trạng thái đơn trong mục Đơn hàng.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 24 * 60 * 60_000,
    href: '/user/orders/order-shipping',
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
    body: 'Kiện hàng của đơn hàng order-completed đã được giao thành công.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    createdAt: Date.now() - 3 * 24 * 60 * 60_000,
    href: '/user/orders/order-completed',
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

export function createOrderPaymentNotification({ orderId, orderDetailId, image }) {
  if (!orderId) throw new Error('Thiếu mã đơn hàng để tạo thông báo thanh toán.')
  if (!orderDetailId) throw new Error('Thiếu mã chi tiết đơn hàng để tạo liên kết thông báo.')

  return {
    id: `noti-order-payment-${orderId}`,
    type: 'order',
    title: 'Xác nhận đã thanh toán',
    body: `Thanh toán cho đơn hàng ${orderId} thành công. Vui lòng kiểm tra trạng thái đơn hàng chi tiết trong mục Đơn hàng.`,
    image: image || '',
    createdAt: Date.now(),
    href: `/user/orders/${encodeURIComponent(orderDetailId)}`,
    isRead: false,
  }
}
