// MOCK cho trang phiên đấu giá đang diễn ra / xem trước.
// Khi có API: GET /api/auction/sessions/:sessionId (pending → preview, active → phòng đấu giá)
import { releaseMockWalletAmount, reserveMockWalletAmount } from '@/mocks/wallet'

const now = Date.now()
const MIN = 60 * 1000
const SESSION_CONFIGURATION = {
  itemDurationMinutes: 30,
  extensionDurationMinutes: 3,
  registrationDurationDays: 7,
  minimumItemsPerSession: 10,
}
const ITEM_GAP = SESSION_CONFIGURATION.itemDurationMinutes * MIN
const PENDING_END = now + 5 * MIN
const LIVE_BID_STORAGE_KEY = 'navishop.mockAuction.liveBids'
const MOCK_USER_ID = 'usr_001'
const MOCK_USER_DISPLAY = 'usr•••c2a9'
const MOCK_OTHER_BIDDER_ID = 'usr_002'
const MOCK_OTHER_BIDDER_DISPLAY = 'usr•••91c2'
const TEST_ITEM_DURATION_MS = 30 * 1000
const TEST_EXTENSION_THRESHOLD_MS = 15 * 1000
const TEST_EXTENSION_DURATION_MS = 30 * 1000

// Xây mock: 2 vật đã xong, 1 vật đang đấu (30 giây để test), 9 vật xếp hàng
const BASE = now - 2 * ITEM_GAP

function itemStart(i) { return new Date(BASE + i * ITEM_GAP).toISOString() }
function itemEnd(i, extra = 0) {
  return new Date(BASE + i * ITEM_GAP + SESSION_CONFIGURATION.itemDurationMinutes * MIN + extra).toISOString()
}

const CATEGORIES = ['Đồng hồ & Trang sức', 'Máy ảnh & Quang học', 'Âm nhạc & Giải trí', 'Gốm sứ & Thủ công', 'Điện tử cổ', 'Nghệ thuật', 'Tem & Tiền xu', 'Trò chơi & Bộ sưu tập', 'Máy móc cổ', 'Văn phòng phẩm', 'Đèn & Nội thất', 'Tiền xu & Huy chương']
const SOURCE_SHOPS = [
  { name: 'Phụ Kiện Xinh', slug: 'phu-kien-xinh' },
  { name: 'Công Nghệ Mới', slug: 'cong-nghe-moi' },
  { name: 'Nhà Sách Tri Thức', slug: 'nha-sach-tri-thuc' },
  { name: 'Âm Thanh Việt', slug: 'am-thanh-viet' },
  { name: 'Nhà Sách Tri Thức', slug: 'nha-sach-tri-thuc' },
]

const RAW = [
  // [title, startingPrice, currentPrice, state]
  ['Đồng hồ cơ cổ 1960',        500000,  1850000, 'sold'],
  ['Máy ảnh film Pentax',        800000,  4000000, 'sold'],
  ['Bộ tem sưu tầm',             300000,   820000, 'bidding'],
  ['Đĩa than Beatles bản gốc',   600000,       null, 'queued'],
  ['Bút máy Parker cổ',          650000,       null, 'queued'],
  ['Tranh sơn mài nhỏ',         1000000,       null, 'queued'],
  ['Radio Philips đời 70',        450000,       null, 'queued'],
  ['Bàn cờ vua gỗ óc chó',       700000,       null, 'queued'],
  ['Ấm trà gốm Bát Tràng',       400000,       null, 'queued'],
  ['Máy đánh chữ Olivetti',      900000,       null, 'queued'],
  ['Bộ tiền xu cổ',              350000,       null, 'queued'],
  ['Đèn dầu đồng',               300000,       null, 'queued'],
]

export const MOCK_SESSION_ITEMS = RAW.map(([title, startingPrice, currentPrice, state], i) => ({
  itemId: `itm_${String(i + 1).padStart(2, '0')}`,
  order: i + 1,
  title,
  category: CATEGORIES[i % CATEGORIES.length],
  sourceShop: SOURCE_SHOPS[i % SOURCE_SHOPS.length],
  images: [],
  startingPrice,
  baseBidIncrement: startingPrice >= 800000 ? 100000 : 50000,
  currentPrice: state === 'bidding' || state === 'sold' ? currentPrice : null,
  highestBidder: state === 'sold' ? MOCK_USER_DISPLAY : state === 'bidding' ? MOCK_OTHER_BIDDER_DISPLAY : null,
  highestBidderId: state === 'bidding' ? MOCK_OTHER_BIDDER_ID : null,
  bidCount: state === 'sold' ? 14 : state === 'bidding' ? 6 : 0,
  bids: state === 'bidding'
    ? Array.from({ length: 6 }, (_, bidIndex) => ({
      id: `bid_${i + 1}_${bidIndex + 1}`,
      amount: currentPrice - (5 - bidIndex) * (startingPrice >= 800000 ? 100000 : 50000),
      bidderDisplay: bidIndex === 5 ? MOCK_OTHER_BIDDER_DISPLAY : `usr•••${['5e07', 'a841', '70bd', '33f0', '5e07'][bidIndex]}`,
      bidderId: bidIndex === 5 ? MOCK_OTHER_BIDDER_ID : null,
      createdAt: new Date(now - (6 - bidIndex) * 45 * 1000).toISOString(),
    }))
    : [],
  state,
  startTime: itemStart(i),
  endTime: state === 'bidding'
    ? new Date(now + TEST_ITEM_DURATION_MS).toISOString()
    : state === 'sold'
      ? itemEnd(i, 4 * MIN)                   // đã kết thúc
      : itemEnd(i),
}))

function readStoredLiveBids() {
  return JSON.parse(localStorage.getItem(LIVE_BID_STORAGE_KEY) ?? '{}')
}

export const MOCK_SESSION = {
  id: 'ses_mock',
  name: 'Phiên đấu giá cuối tuần',
  status: 'pending',   // 'pending' | 'active' | 'closed'
  configuration: SESSION_CONFIGURATION,
  registrationFee: 50000,
  walletAvailable: 100000,
  isRegistered: true,
  startTime: new Date(PENDING_END).toISOString(),
  pendingEndTime: new Date(PENDING_END).toISOString(),
  itemCount: RAW.length,
  items: MOCK_SESSION_ITEMS,
}

export function getMockLiveSession(sessionId) {
  if (!sessionId.startsWith('ses_')) return null

  const storedBids = readStoredLiveBids()
  const activeItem = MOCK_SESSION_ITEMS.find((item) => item.state === 'bidding')
  if (activeItem && !storedBids[activeItem.itemId]) {
    storedBids[activeItem.itemId] = {
      currentPrice: activeItem.currentPrice,
      highestBidder: activeItem.highestBidder,
      highestBidderId: activeItem.highestBidderId,
      bidCount: activeItem.bidCount,
      bids: activeItem.bids,
      endTime: new Date(Date.now() + TEST_ITEM_DURATION_MS).toISOString(),
      state: activeItem.state,
    }
    localStorage.setItem(LIVE_BID_STORAGE_KEY, JSON.stringify(storedBids))
  }
  return {
    ...MOCK_SESSION,
    id: sessionId,
    items: MOCK_SESSION_ITEMS.map((item) => (
      storedBids[item.itemId] ? { ...item, ...storedBids[item.itemId] } : item
    )),
  }
}

export function getMockLiveItem(sessionId, itemId) {
  const session = getMockLiveSession(sessionId)
  const index = session ? session.items.findIndex((i) => i.itemId === itemId) : -1
  if (index === -1) return null

  const item = session.items[index]
  return { session, item, index }
}

export function getMockAuctionLockedBalance() {
  const activeItem = MOCK_SESSION_ITEMS.find((item) => item.state === 'bidding')
  if (!activeItem) return 0

  const storedBids = readStoredLiveBids()
  const liveItem = storedBids[activeItem.itemId] ?? activeItem
  return liveItem.highestBidderId === MOCK_USER_ID ? liveItem.currentPrice : 0
}

export function recordMockLiveBid(itemId, bid) {
  const baseItem = MOCK_SESSION_ITEMS.find((item) => item.itemId === itemId && item.state === 'bidding')
  if (!baseItem) return

  const storedBids = readStoredLiveBids()
  const currentItem = storedBids[itemId] ?? baseItem
  if (currentItem.state === 'sold' || new Date(currentItem.endTime ?? baseItem.endTime).getTime() <= Date.now()) {
    currentItem.state = 'sold'
    storedBids[itemId] = currentItem
    localStorage.setItem(LIVE_BID_STORAGE_KEY, JSON.stringify(storedBids))
    return false
  }

  const userLockedAmount = currentItem.highestBidderId === MOCK_USER_ID ? currentItem.currentPrice : 0
  const reserved = reserveMockWalletAmount(bid.amount - userLockedAmount, userLockedAmount)
  if (!reserved) return false

  const remainingTime = new Date(currentItem.endTime ?? baseItem.endTime).getTime() - Date.now()
  const endTime = remainingTime <= TEST_EXTENSION_THRESHOLD_MS
    ? new Date(Date.now() + TEST_EXTENSION_DURATION_MS).toISOString()
    : currentItem.endTime ?? baseItem.endTime
  const nextBid = {
    id: `bid_user_${Date.now()}`,
    amount: bid.amount,
    bidderDisplay: MOCK_USER_DISPLAY,
    bidderId: MOCK_USER_ID,
    createdAt: new Date().toISOString(),
  }
  storedBids[itemId] = {
    currentPrice: bid.amount,
    highestBidder: MOCK_USER_DISPLAY,
    highestBidderId: MOCK_USER_ID,
    lockedByUserAmount: bid.amount,
    bidCount: (currentItem.bidCount ?? 0) + 1,
    bids: [nextBid, ...(currentItem.bids ?? [])],
    endTime,
    state: 'bidding',
  }
  localStorage.setItem(LIVE_BID_STORAGE_KEY, JSON.stringify(storedBids))
  return { endTime }
}

export function recordMockCompetingBid(itemId) {
  const baseItem = MOCK_SESSION_ITEMS.find((item) => item.itemId === itemId && item.state === 'bidding')
  if (!baseItem) return false

  const storedBids = readStoredLiveBids()
  const currentItem = storedBids[itemId] ?? baseItem
  if (currentItem.state === 'sold' || new Date(currentItem.endTime ?? baseItem.endTime).getTime() <= Date.now()) {
    return false
  }

  const amount = currentItem.currentPrice + baseItem.baseBidIncrement
  const userLockedAmount = currentItem.highestBidderId === MOCK_USER_ID
    ? currentItem.lockedByUserAmount ?? currentItem.currentPrice
    : 0
  if (userLockedAmount > 0) releaseMockWalletAmount(userLockedAmount, userLockedAmount)

  const remainingTime = new Date(currentItem.endTime ?? baseItem.endTime).getTime() - Date.now()
  const endTime = remainingTime <= TEST_EXTENSION_THRESHOLD_MS
    ? new Date(Date.now() + TEST_EXTENSION_DURATION_MS).toISOString()
    : currentItem.endTime ?? baseItem.endTime
  const nextBid = {
    id: `bid_other_${Date.now()}`,
    amount,
    bidderDisplay: MOCK_OTHER_BIDDER_DISPLAY,
    bidderId: MOCK_OTHER_BIDDER_ID,
    createdAt: new Date().toISOString(),
  }
  storedBids[itemId] = {
    ...currentItem,
    currentPrice: amount,
    highestBidder: MOCK_OTHER_BIDDER_DISPLAY,
    highestBidderId: MOCK_OTHER_BIDDER_ID,
    lockedByUserAmount: 0,
    bidCount: (currentItem.bidCount ?? 0) + 1,
    bids: [nextBid, ...(currentItem.bids ?? [])],
    endTime,
    state: 'bidding',
  }
  localStorage.setItem(LIVE_BID_STORAGE_KEY, JSON.stringify(storedBids))
  return { amount, endTime }
}

export function recordMockAuctionEnd(itemId) {
  const storedBids = readStoredLiveBids()
  const item = storedBids[itemId]
  if (!item || item.state === 'sold') return item

  if (item.highestBidderId !== MOCK_USER_ID && item.lockedByUserAmount > 0) {
    releaseMockWalletAmount(item.lockedByUserAmount, item.lockedByUserAmount)
    item.lockedByUserAmount = 0
  }
  item.state = 'sold'
  item.endedAt = new Date().toISOString()
  storedBids[itemId] = item
  localStorage.setItem(LIVE_BID_STORAGE_KEY, JSON.stringify(storedBids))
  return item
}
