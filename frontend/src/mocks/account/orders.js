export const ORDER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Chờ giao hàng' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
]

export const MOCK_ORDERS = [
  {
    id: 'order-pending',
    status: 'pending',
    productName: 'Giày thể thao nam năng động',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
    storeName: 'Thế Giới Giày',
    price: 1250000,
  },
  {
    id: 'order-shipping',
    status: 'shipping',
    productName: 'Tai nghe chụp tai không dây',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
    storeName: 'Âm Thanh Việt',
    price: 890000,
  },
  {
    id: 'order-completed',
    status: 'completed',
    productName: 'Đồng hồ đeo tay tối giản',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    storeName: 'Phụ Kiện Xinh',
    price: 2450000,
    hasReviewed: true,
  },
  {
    id: 'order-completed-unreviewed',
    status: 'completed',
    productName: 'Bình giữ nhiệt inox 500ml',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=240&q=80',
    storeName: 'Gia Dụng Tiện Ích',
    price: 320000,
    hasReviewed: false,
  },
  {
    id: 'order-cancelled',
    status: 'cancelled',
    productName: 'Túi đeo chéo thời trang',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=240&q=80',
    storeName: 'Nhà Túi',
    price: 560000,
  },
]

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  shipping: 'Chờ giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}
