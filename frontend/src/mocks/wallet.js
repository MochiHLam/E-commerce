const AVAILABLE_BALANCE_KEY = 'navishop.mockWallet.availableBalance'
const TOP_UPS_KEY = 'navishop.mockWallet.topUps'
const BALANCE_VERSION_KEY = 'navishop.mockWallet.balanceVersion'
export const INITIAL_AVAILABLE_BALANCE = 1250000

export function getMockAvailableBalance(initialLockedBalance = 0) {
  const storedBalance = localStorage.getItem(AVAILABLE_BALANCE_KEY)
  const balanceVersion = localStorage.getItem(BALANCE_VERSION_KEY)
  if (balanceVersion !== '3') {
    const legacyLockedBalance = balanceVersion === '2'
      ? Number(JSON.parse(localStorage.getItem('navishop.mockAuction.liveBids') ?? '{}').itm_03?.currentPrice ?? 820000)
      : 0
    const startingBalance = storedBalance === null
      ? INITIAL_AVAILABLE_BALANCE
      : Number(storedBalance) + legacyLockedBalance
    const availableBalance = startingBalance - initialLockedBalance
    if (!Number.isSafeInteger(availableBalance) || availableBalance < 0) {
      throw new Error('Số dư khả dụng mock không đủ để khớp với số tiền đang khóa.')
    }

    localStorage.setItem(AVAILABLE_BALANCE_KEY, String(availableBalance))
    localStorage.setItem(BALANCE_VERSION_KEY, '3')
    return availableBalance
  }

  return Number(storedBalance)
}

export function applyMockWalletTransaction(transaction, initialLockedBalance = 0) {
  if (
    !transaction?.id
    || !Number.isSafeInteger(transaction.amount)
    || transaction.amount < 0
    || !['in', 'out'].includes(transaction.direction)
  ) {
    throw new Error('Thông tin giao dịch ví không hợp lệ.')
  }

  const previousTransactions = localStorage.getItem(TOP_UPS_KEY)
  const transactions = JSON.parse(previousTransactions ?? '[]')
  if (!Array.isArray(transactions)) {
    throw new Error('Dữ liệu lịch sử giao dịch ví không hợp lệ.')
  }
  if (transactions.some((entry) => entry.id === transaction.id)) {
    return { success: true, balance: getMockAvailableBalance(initialLockedBalance) }
  }

  const currentBalance = getMockAvailableBalance(initialLockedBalance)
  const nextBalance = transaction.direction === 'in'
    ? currentBalance + transaction.amount
    : currentBalance - transaction.amount
  if (!Number.isSafeInteger(currentBalance) || currentBalance < 0 || !Number.isSafeInteger(nextBalance)) {
    throw new Error('Số dư ví mock không hợp lệ.')
  }
  if (nextBalance < 0) return { success: false, balance: currentBalance }

  localStorage.setItem(TOP_UPS_KEY, JSON.stringify([transaction, ...transactions]))
  try {
    localStorage.setItem(AVAILABLE_BALANCE_KEY, String(nextBalance))
  } catch (error) {
    if (previousTransactions === null) localStorage.removeItem(TOP_UPS_KEY)
    else localStorage.setItem(TOP_UPS_KEY, previousTransactions)
    throw error
  }

  window.dispatchEvent(new CustomEvent('navishop:wallet-updated', {
    detail: { balance: nextBalance, transaction },
  }))
  return { success: true, balance: nextBalance }
}

export function recordMockTopUp(amount, initialLockedBalance = 0) {
  const balance = getMockAvailableBalance(initialLockedBalance) + amount
  if (!Number.isSafeInteger(balance)) {
    throw new Error('Số dư ví vượt quá giới hạn hợp lệ.')
  }

  const topUps = JSON.parse(localStorage.getItem(TOP_UPS_KEY) ?? '[]')
  const transaction = {
    id: `TXN-TOPUP-${Date.now()}`,
    title: 'Nạp tiền vào ví',
    description: 'Nạp tiền mô phỏng qua phương thức thanh toán đã chọn',
    reference: 'Giao dịch nạp tiền',
    amount,
    direction: 'in',
    date: new Date().toISOString(),
  }

  localStorage.setItem(AVAILABLE_BALANCE_KEY, String(balance))
  localStorage.setItem(TOP_UPS_KEY, JSON.stringify([transaction, ...topUps]))
  return balance
}

export function reserveMockWalletAmount(amount, initialLockedBalance = 0) {
  const balance = getMockAvailableBalance(initialLockedBalance) - amount
  if (!Number.isSafeInteger(balance)) {
    throw new Error('Số dư khả dụng mock không đủ để giữ tiền đấu giá.')
  }
  if (balance < 0) return false

  localStorage.setItem(AVAILABLE_BALANCE_KEY, String(balance))
  return true
}

export function chargeMockWallet(amount, orderId, initialLockedBalance = 0) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Số tiền thanh toán không hợp lệ.')
  }
  if (!orderId) {
    throw new Error('Thiếu mã đơn hàng cho giao dịch thanh toán.')
  }

  const currentBalance = getMockAvailableBalance(initialLockedBalance)
  if (!Number.isSafeInteger(currentBalance) || currentBalance < 0) {
    throw new Error('Số dư khả dụng mock không hợp lệ.')
  }
  if (currentBalance < amount) return false

  const nextBalance = currentBalance - amount
  const previousTransactions = localStorage.getItem(TOP_UPS_KEY)
  const transactions = JSON.parse(previousTransactions ?? '[]')
  if (!Array.isArray(transactions)) {
    throw new Error('Dữ liệu lịch sử giao dịch ví không hợp lệ.')
  }

  const transaction = {
    id: `TXN-ORDER-${orderId}`,
    title: 'Thanh toán đơn hàng',
    description: 'Thanh toán tiền hàng và phí vận chuyển',
    reference: `Đơn hàng #${orderId}`,
    amount,
    direction: 'out',
    date: new Date().toISOString(),
  }

  localStorage.setItem(TOP_UPS_KEY, JSON.stringify([transaction, ...transactions]))
  try {
    localStorage.setItem(AVAILABLE_BALANCE_KEY, String(nextBalance))
  } catch (error) {
    if (previousTransactions === null) localStorage.removeItem(TOP_UPS_KEY)
    else localStorage.setItem(TOP_UPS_KEY, previousTransactions)
    throw error
  }

  return true
}

export function rollbackMockWalletCharge(orderId, initialLockedBalance = 0) {
  const transactionId = `TXN-ORDER-${orderId}`
  const transactions = JSON.parse(localStorage.getItem(TOP_UPS_KEY) ?? '[]')
  if (!Array.isArray(transactions)) {
    throw new Error('Dữ liệu lịch sử giao dịch ví không hợp lệ.')
  }
  const transaction = transactions.find((entry) => entry.id === transactionId)
  if (!transaction) return

  const balance = getMockAvailableBalance(initialLockedBalance) + transaction.amount
  if (!Number.isSafeInteger(balance)) {
    throw new Error('Không thể khôi phục số dư ví mock sau lỗi đặt hàng.')
  }

  localStorage.setItem(AVAILABLE_BALANCE_KEY, String(balance))
  localStorage.setItem(
    TOP_UPS_KEY,
    JSON.stringify(transactions.filter((entry) => entry.id !== transactionId)),
  )
}

export function refundMockWalletOrder(order, initialLockedBalance = 0) {
  if (order.paymentMethod !== 'navishop-wallet') return 0

  const itemsTotal = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (item.merchandiseTotal ?? item.price * (item.quantity ?? 1)), 0)
    : (order.price ?? 0) * (order.quantity ?? 1)
  const amount = order.totalAmount ?? (order.merchandiseTotal ?? itemsTotal) + (order.shippingFee ?? 0)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Không thể hoàn tiền vì tổng tiền đơn hàng không hợp lệ.')
  }

  const previousTransactions = localStorage.getItem(TOP_UPS_KEY)
  const transactions = JSON.parse(previousTransactions ?? '[]')
  if (!Array.isArray(transactions)) {
    throw new Error('Dữ liệu lịch sử giao dịch ví không hợp lệ.')
  }

  const transactionId = `TXN-REFUND-${order.id}`
  if (transactions.some((transaction) => transaction.id === transactionId)) return 0

  const currentBalance = getMockAvailableBalance(initialLockedBalance)
  const nextBalance = currentBalance + amount
  if (!Number.isSafeInteger(currentBalance) || currentBalance < 0 || !Number.isSafeInteger(nextBalance)) {
    throw new Error('Số dư ví mock không hợp lệ để hoàn tiền.')
  }

  const transaction = {
    id: transactionId,
    title: 'Hoàn tiền đơn hàng',
    description: 'Hoàn tiền sau khi bạn hủy đơn hàng',
    reference: `${order.source === 'auction' ? 'Đơn đấu giá' : 'Đơn hàng'} #${order.id}`,
    amount,
    direction: 'in',
    date: new Date().toISOString(),
  }

  localStorage.setItem(TOP_UPS_KEY, JSON.stringify([transaction, ...transactions]))
  try {
    localStorage.setItem(AVAILABLE_BALANCE_KEY, String(nextBalance))
  } catch (error) {
    if (previousTransactions === null) localStorage.removeItem(TOP_UPS_KEY)
    else localStorage.setItem(TOP_UPS_KEY, previousTransactions)
    throw error
  }

  return amount
}

export function releaseMockWalletAmount(amount, initialLockedBalance = 0) {
  if (!Number.isSafeInteger(amount) || amount <= 0) return

  const balance = getMockAvailableBalance(initialLockedBalance) + amount
  if (!Number.isSafeInteger(balance)) {
    throw new Error('Số dư khả dụng mock vượt quá giới hạn hợp lệ.')
  }
  localStorage.setItem(AVAILABLE_BALANCE_KEY, String(balance))
}

export function getMockTopUps() {
  return JSON.parse(localStorage.getItem(TOP_UPS_KEY) ?? '[]')
}
