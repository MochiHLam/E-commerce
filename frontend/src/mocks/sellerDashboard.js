const PRODUCT_CATALOG = [
  { id: 'demo-headphones', name: 'Tai nghe không dây AirBeat', stock: 18 },
  { id: 'demo-keyboard', name: 'Bàn phím cơ Nova 75', stock: 7 },
  { id: 'demo-mouse', name: 'Chuột không dây Swift Pro', stock: 0 },
  { id: 'demo-charger', name: 'Sạc nhanh GaN 65W', stock: 24 },
]

const ORDER_ITEMS = [
  { productId: 'demo-headphones', quantity: 1, merchandiseTotal: 1290000 },
  { productId: 'demo-keyboard', quantity: 1, merchandiseTotal: 1890000 },
  { productId: 'demo-mouse', quantity: 2, merchandiseTotal: 1580000 },
  { productId: 'demo-charger', quantity: 1, merchandiseTotal: 690000 },
  { productId: 'demo-headphones', quantity: 2, merchandiseTotal: 2580000 },
  { productId: 'demo-keyboard', quantity: 1, merchandiseTotal: 1890000 },
  { productId: 'demo-charger', quantity: 2, merchandiseTotal: 1380000 },
  { productId: 'demo-mouse', quantity: 1, merchandiseTotal: 790000 },
  { productId: 'demo-headphones', quantity: 1, merchandiseTotal: 1290000 },
  { productId: 'demo-keyboard', quantity: 2, merchandiseTotal: 3780000 },
]

const COMMISSION_RATE = 0.05
const ORDER_CONFIG_SNAPSHOT = {
  confirmHours: 48,
  autoCompleteDays: 3,
}
const SELLER_ORDER_OVERRIDES_KEY = 'navishop.mockSeller.orderOverrides'

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function dateAtOffset(now, dayOffset, hours, minutes = 0) {
  const result = startOfDay(now)
  result.setDate(result.getDate() + dayOffset)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function createOrder(id, status, createdAt, itemIndex, options = {}) {
  const item = ORDER_ITEMS[itemIndex % ORDER_ITEMS.length]
  const product = PRODUCT_CATALOG.find((entry) => entry.id === item.productId)
  const source = options.source ?? 'normal'
  const orderItem = source === 'auction'
    ? { ...item, merchandiseTotal: 0 }
    : item
  const commission = source === 'auction' ? 0 : Math.round(item.merchandiseTotal * COMMISSION_RATE)
  const shippingAt = options.shippingAt ?? null
  const deadlineDuration = status === 'pending_confirm'
    ? ORDER_CONFIG_SNAPSHOT.confirmHours * 60 * 60 * 1000
    : status === 'shipping' && source === 'normal'
      ? ORDER_CONFIG_SNAPSHOT.autoCompleteDays * 24 * 60 * 60 * 1000
      : 0
  const derivedDeadline = deadlineDuration
    ? new Date(((status === 'shipping' ? shippingAt : null)
      ? new Date(shippingAt)
      : createdAt).getTime() + deadlineDuration)
    : null
  const completedAt = status === 'completed' ? options.completedAt ?? createdAt : null
  const inferredShippingAt = shippingAt
    ?? (status === 'completed' ? new Date(createdAt.getTime() + 6 * 60 * 60 * 1000) : null)
  const statusHistory = [{
    status: source === 'auction' ? 'auction_won' : 'pending_confirm',
    at: createdAt.toISOString(),
    actor: 'Người mua',
    note: source === 'auction' ? 'Đơn được tạo từ giao dịch đấu giá.' : 'Người mua đặt hàng.',
  }]
  if (inferredShippingAt) {
    statusHistory.push({
      status: 'shipping',
      at: new Date(inferredShippingAt).toISOString(),
      actor: options.shippedBy ?? 'Chủ shop',
      note: 'Shop bắt đầu giao đơn.',
    })
  }
  if (completedAt) {
    statusHistory.push({
      status: 'completed',
      at: new Date(completedAt).toISOString(),
      actor: options.completedBy ?? 'Hệ thống',
      note: 'Đơn hàng hoàn thành.',
    })
  }

  return {
    id,
    status,
    source,
    createdAt: createdAt.toISOString(),
    shippingAt: inferredShippingAt ? new Date(inferredShippingAt).toISOString() : null,
    completedAt: completedAt ? new Date(completedAt).toISOString() : null,
    deadlineAt: derivedDeadline?.toISOString() ?? null,
    deadlineSnapshot: source === 'normal' ? { ...ORDER_CONFIG_SNAPSHOT } : null,
    buyer: {
      name: options.buyerName ?? ['Lê Minh Anh', 'Nguyễn Hoàng Nam', 'Trần Gia Hân', 'Phạm Quốc Bảo'][itemIndex % 4],
      phone: options.buyerPhone ?? `09${String(12345670 + itemIndex).slice(-8)}`,
    },
    deliveryAddress: options.deliveryAddress ?? '18 Nguyễn Trãi, Phường Bến Thành, TP. Hồ Chí Minh',
    item: {
      ...orderItem,
      name: product.name,
      productPrice: source === 'auction' ? 0 : Math.round(item.merchandiseTotal / item.quantity),
      image: '',
    },
    items: [{
      ...orderItem,
      name: product.name,
      productPrice: source === 'auction' ? 0 : Math.round(item.merchandiseTotal / item.quantity),
      image: '',
    }],
    productName: product.name,
    itemTotal: orderItem.merchandiseTotal,
    shippingFee: source === 'auction' ? 0 : 30000,
    commission,
    sellerNet: orderItem.merchandiseTotal - commission,
    statusHistory,
  }
}

function readSellerOrderOverrides(userId) {
  const key = `${SELLER_ORDER_OVERRIDES_KEY}.${userId}`
  const stored = globalThis.localStorage?.getItem(key)
  if (!stored) return {}
  const overrides = JSON.parse(stored)
  if (!overrides || Array.isArray(overrides) || typeof overrides !== 'object') {
    throw new Error('Dữ liệu trạng thái đơn hàng seller mock không hợp lệ.')
  }
  return overrides
}

function applySellerOrderOverrides(userId, orders) {
  const overrides = readSellerOrderOverrides(userId)
  return orders.map((order) => {
    const override = overrides[order.id]
    if (!override) return order
    const statusHistory = (override.statusHistory ?? order.statusHistory)
      .filter((entry) => entry.status !== 'confirmed')
    if (override.status !== 'confirmed') return { ...order, ...override, statusHistory }

    return {
      ...order,
      ...override,
      status: 'pending_confirm',
      shippingAt: null,
      deadlineAt: new Date(new Date(order.createdAt).getTime() + ORDER_CONFIG_SNAPSHOT.confirmHours * 60 * 60 * 1000).toISOString(),
      statusHistory,
    }
  })
}

function saveSellerOrderOverride(userId, orderId, override) {
  const key = `${SELLER_ORDER_OVERRIDES_KEY}.${userId}`
  const overrides = readSellerOrderOverrides(userId)
  globalThis.localStorage?.setItem(key, JSON.stringify({
    ...overrides,
    [orderId]: override,
  }))
}

export function getSellerDashboardMock(userId, shopSlug, now = new Date()) {
  if (!userId || !shopSlug) {
    throw new Error('Thiếu thông tin shop để tạo dữ liệu dashboard minh họa.')
  }

  const completedOffsets = [0, -1, -2, -4, -7, -10, -14, -18, -23, -31, -38, -49]
  const orders = completedOffsets.map((offset, index) => createOrder(
    `DEMO-${String(index + 1).padStart(4, '0')}`,
    'completed',
    dateAtOffset(now, offset, 9 + (index % 8), (index % 4) * 15),
    index,
    { completedAt: dateAtOffset(now, offset, 12 + (index % 6), (index % 4) * 15) },
  ))

  orders.push(
    createOrder(
      'DEMO-OPEN-01',
      'pending_confirm',
      new Date(now.getTime() - 5 * 60 * 60 * 1000),
      2,
    ),
    createOrder(
      'DEMO-OPEN-02',
      'pending_confirm',
      new Date(now.getTime() - 30 * 60 * 60 * 1000),
      0,
    ),
    createOrder(
      'DEMO-OPEN-03',
      'shipping',
      new Date(now.getTime() - 8 * 60 * 60 * 1000),
      1,
      { shippingAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) },
    ),
    createOrder(
      'DEMO-OPEN-04',
      'shipping',
      new Date(now.getTime() - 28 * 60 * 60 * 1000),
      3,
      { shippingAt: new Date(now.getTime() - 28 * 60 * 60 * 1000) },
    ),
    createOrder(
      'DEMO-SHIPPING-01',
      'shipping',
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      4,
      {
        shippingAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ),
    createOrder(
      'DEMO-AUCTION-01',
      'shipping',
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      5,
      {
        source: 'auction',
        shippingAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        buyerName: 'Đỗ Thanh Tùng',
        deliveryAddress: '52 Lê Lợi, Phường Bến Thành, TP. Hồ Chí Minh',
      },
    ),
  )

  const resolvedOrders = applySellerOrderOverrides(userId, orders)
  const completedOrders = resolvedOrders.filter((order) => order.status === 'completed')
  const escrow = resolvedOrders
    .filter((order) => ['pending_confirm', 'shipping'].includes(order.status))
    .reduce((total, order) => total + order.itemTotal + order.shippingFee, 0)

  return {
    orders: resolvedOrders.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    products: PRODUCT_CATALOG.map((product) => ({
      ...product,
      quantitySold: completedOrders.reduce((total, order) => (
        order.item.productId === product.id ? total + order.item.quantity : total
      ), 0),
    })).sort((left, right) => right.quantitySold - left.quantitySold),
    wallet: {
      availableBalance: 12845000,
      escrow,
    },
  }
}

export function getSellerRevenueMock(userId, shopSlug, now = new Date()) {
  const { orders } = getSellerDashboardMock(userId, shopSlug, now)
  const completedOrders = orders.filter((order) => order.status === 'completed' && order.completedAt)
  const ledgerEntries = completedOrders.flatMap((order) => ([
    {
      id: `DEMO-LEDGER-${order.id}-SHOP`,
      orderId: order.id,
      account: 'seller',
      type: 'credit',
      amount: order.sellerNet,
      createdAt: order.completedAt,
    },
    {
      id: `DEMO-LEDGER-${order.id}-COMMISSION`,
      orderId: order.id,
      account: 'platform',
      type: 'commission',
      amount: order.commission,
      createdAt: order.completedAt,
    },
    {
      id: `DEMO-LEDGER-${order.id}-SHIPPING`,
      orderId: order.id,
      account: 'carrier',
      type: 'shipping_fee',
      amount: order.shippingFee,
      createdAt: order.completedAt,
    },
  ]))

  return { orders: completedOrders, ledgerEntries }
}

export function getSellerWalletMock(userId, shopSlug, now = new Date()) {
  const { orders, ledgerEntries } = getSellerRevenueMock(userId, shopSlug, now)
  const transactions = ledgerEntries
    .filter((entry) => entry.account === 'seller' && entry.type === 'credit')
    .map((entry) => {
      const order = orders.find((item) => item.id === entry.orderId)
      return {
        ...entry,
        label: 'Tiền đơn hàng hoàn thành',
        direction: 'in',
        reference: entry.orderId,
        source: order?.source ?? 'normal',
      }
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

  const { wallet } = getSellerDashboardMock(userId, shopSlug, now)
  return {
    availableBalance: wallet.availableBalance,
    transactions,
  }
}

export function transitionSellerOrder(userId, shopSlug, orderId, nextStatus, actor = 'Chủ shop', now = new Date()) {
  if (!userId || !shopSlug || !orderId) {
    throw new Error('Thiếu thông tin shop hoặc đơn hàng để cập nhật trạng thái.')
  }
  const order = getSellerDashboardMock(userId, shopSlug, now).orders.find((item) => item.id === orderId)
  if (!order) throw new Error('Không tìm thấy đơn hàng trong dữ liệu mock của shop.')
  if (order.source === 'auction') {
    throw new Error('Đơn đấu giá không dùng hành động cập nhật trạng thái của đơn thường.')
  }

  if (order.status !== 'pending_confirm' || nextStatus !== 'shipping') {
    throw new Error(`Không thể chuyển đơn từ "${order.status}" sang "${nextStatus}". Tải lại danh sách để kiểm tra trạng thái mới nhất.`)
  }

  const timestamp = now.toISOString()
  const statusHistory = [
    ...order.statusHistory,
    {
      status: nextStatus,
      at: timestamp,
      actor,
      note: 'Shop xác nhận đơn và bắt đầu giao hàng.',
    },
  ]
  const override = {
    ...order,
    status: nextStatus,
    shippingAt: timestamp,
    deadlineAt: order.deadlineSnapshot
      ? new Date(now.getTime() + order.deadlineSnapshot.autoCompleteDays * 24 * 60 * 60 * 1000).toISOString()
      : null,
    statusHistory,
  }
  saveSellerOrderOverride(userId, orderId, override)
  return override
}
