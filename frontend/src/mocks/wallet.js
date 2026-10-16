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
