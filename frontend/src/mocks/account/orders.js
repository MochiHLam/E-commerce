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
    shopSlug: 'the-gioi-giay',
    productName: 'Giày thể thao nam năng động',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
    storeName: 'Thế Giới Giày',
    price: 1250000,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: 'order-shipping',
    status: 'shipping',
    shopSlug: 'am-thanh-viet',
    productName: 'Tai nghe chụp tai không dây',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
    storeName: 'Âm Thanh Việt',
    price: 890000,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
  },
  {
    id: 'order-completed',
    status: 'completed',
    shopSlug: 'phu-kien-xinh',
    productName: 'Đồng hồ đeo tay tối giản',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    storeName: 'Phụ Kiện Xinh',
    price: 2450000,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60_000).toISOString(),
    hasReviewed: true,
  },
  {
    id: 'order-completed-unreviewed',
    status: 'completed',
    productName: 'Bình giữ nhiệt inox 500ml',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=240&q=80',
    storeName: 'Gia Dụng Tiện Ích',
    price: 320000,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    hasReviewed: false,
  },
  {
    id: 'order-cancelled',
    status: 'cancelled',
    productId: 'prd_6',
    variantId: 'prd_6-sku-1',
    variantName: 'Kích cỡ: 38',
    shopSlug: 'the-gioi-giay',
    productName: 'Giày thể thao mẫu 6',
    image: '',
    storeName: 'Thế Giới Giày',
    price: 675000,
    quantity: 1,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString(),
  },
]

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  shipping: 'Chờ giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const CHECKOUT_MOCK_ORDERS_KEY = 'navishop.mockCheckoutOrders'

export function getCheckoutMockOrders() {
  const storedOrders = window.localStorage.getItem(CHECKOUT_MOCK_ORDERS_KEY)
  if (!storedOrders) return []

  const orders = JSON.parse(storedOrders)
  if (!Array.isArray(orders)) {
    throw new Error('Dữ liệu đơn hàng mô phỏng không hợp lệ.')
  }
  return orders
}

export function saveCheckoutMockOrders(newOrders) {
  const existingOrders = getCheckoutMockOrders()
  window.localStorage.setItem(
    CHECKOUT_MOCK_ORDERS_KEY,
    JSON.stringify([...newOrders, ...existingOrders]),
  )
}
