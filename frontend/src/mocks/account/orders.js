export const ORDER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Vận chuyển' },
  { id: 'delivered', label: 'Chờ giao hàng' },
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
    id: 'order-delivered',
    status: 'delivered',
    productId: 'prd_4',
    shopSlug: 'phu-kien-xinh',
    productName: 'Đồng hồ cơ mẫu 4',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80',
    storeName: 'Phụ Kiện Xinh',
    price: 2450000,
    shippingFee: 30000,
    paymentMethod: 'navishop-wallet',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString(),
    statusTimestamps: {
      pending: new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString(),
      shipping: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
      delivered: new Date(Date.now() - 60 * 60_000).toISOString(),
    },
  },
  {
    id: 'order-completed',
    status: 'completed',
    productId: 'prd_4',
    shopSlug: 'phu-kien-xinh',
    productName: 'Đồng hồ cơ mẫu 4',
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
    productId: 'prd_3',
    shopSlug: 'am-thanh-viet',
    productName: 'Tai nghe chụp tai mẫu 3',
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
  shipping: 'Vận chuyển',
  delivered: 'Chờ giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const CHECKOUT_MOCK_ORDERS_KEY = 'navishop.mockCheckoutOrders'
const ORDER_STATUS_OVERRIDES_KEY = 'navishop.mockOrderStatusOverrides'
const VALID_ORDER_STATUSES = new Set(['pending', 'shipping', 'delivered', 'completed', 'cancelled'])

export function getOrderItems(order) {
  if (Array.isArray(order?.items)) return order.items
  if (!order || (!order.productId && !order.productName)) return []
  return [{
    id: `${order.id}-item`,
    productId: order.productId,
    variantId: order.variantId,
    variantLabel: order.variantLabel,
    variantName: order.variantName,
    productName: order.productName,
    image: order.image,
    price: order.price ?? 0,
    quantity: order.quantity ?? 1,
    merchandiseTotal: order.merchandiseTotal ?? (order.price ?? 0) * (order.quantity ?? 1),
    hasReviewed: order.hasReviewed,
  }]
}

function normalizeCheckoutOrders(orders) {
  const normalized = []
  const legacyGroups = new Map()

  for (const order of orders) {
    if (Array.isArray(order.items) || !order.checkoutId) {
      normalized.push(order)
      continue
    }

    const groupKey = `${order.checkoutId}:${order.shopSlug || order.storeName}`
    let group = legacyGroups.get(groupKey)
    if (!group) {
      group = {
        ...order,
        id: `${order.checkoutId}-${order.shopSlug || 'shop'}`,
        items: [],
        legacyOrderIds: [],
        merchandiseTotal: 0,
        shippingFee: 0,
        totalAmount: 0,
      }
      legacyGroups.set(groupKey, group)
      normalized.push(group)
    }
    const item = getOrderItems(order)[0]
    if (item) {
      group.items.push(item)
      group.merchandiseTotal += item.merchandiseTotal
      group.shippingFee += order.shippingFee ?? 0
      group.totalAmount += order.totalAmount ?? item.merchandiseTotal + (order.shippingFee ?? 0)
    }
    group.legacyOrderIds.push(order.id)
  }

  return normalized
}

function normalizeAuctionOrders(orders) {
  return orders.map((order) => {
    if (order.source !== 'auction') return order

    return {
      ...order,
      items: getOrderItems(order).map((item) => ({
        ...item,
        price: 0,
        merchandiseTotal: 0,
      })),
      merchandiseTotal: 0,
      shippingFee: 0,
      totalAmount: 0,
    }
  })
}

export function getCheckoutMockOrders() {
  const storedOrders = window.localStorage.getItem(CHECKOUT_MOCK_ORDERS_KEY)
  if (!storedOrders) return []

  const orders = JSON.parse(storedOrders)
  if (!Array.isArray(orders)) {
    throw new Error('Dữ liệu đơn hàng mô phỏng không hợp lệ.')
  }
  return normalizeAuctionOrders(normalizeCheckoutOrders(orders))
}

export function getMockOrderStatusOverrides() {
  const storedOverrides = window.localStorage.getItem(ORDER_STATUS_OVERRIDES_KEY)
  if (!storedOverrides) return {}

  const overrides = JSON.parse(storedOverrides)
  if (!overrides || Array.isArray(overrides) || typeof overrides !== 'object') {
    throw new Error('Dữ liệu trạng thái đơn hàng mô phỏng không hợp lệ.')
  }
  return overrides
}

export function saveMockOrderStatus(orderId, status, updatedAt = new Date().toISOString()) {
  if (!orderId || !VALID_ORDER_STATUSES.has(status)) {
    throw new Error('Thiếu mã đơn hàng hoặc trạng thái cần lưu.')
  }
  const overrides = getMockOrderStatusOverrides()
  const previousTimestamps = overrides[orderId]?.statusTimestamps ?? {}
  window.localStorage.setItem(
    ORDER_STATUS_OVERRIDES_KEY,
    JSON.stringify({
      ...overrides,
      [orderId]: {
        ...overrides[orderId],
        status,
        updatedAt,
        statusTimestamps: { ...previousTimestamps, [status]: updatedAt },
      },
    }),
  )
}

export function getMockAuctionOrder(sessionId, itemId) {
  return getCheckoutMockOrders().find((order) => (
    order.source === 'auction'
      && order.auctionSessionId === sessionId
      && order.auctionItemId === itemId
  )) ?? null
}

export function saveCheckoutMockOrders(newOrders) {
  const existingOrders = getCheckoutMockOrders()
  window.localStorage.setItem(
    CHECKOUT_MOCK_ORDERS_KEY,
    JSON.stringify([...newOrders, ...existingOrders]),
  )
}
