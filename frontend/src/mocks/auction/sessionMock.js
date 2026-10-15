// MOCK cho trang phiên đấu giá đang diễn ra / xem trước.
// Khi có API: GET /api/auction/sessions/:sessionId (pending → preview, active → phòng đấu giá)

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

// Xây mock: 2 vật đã xong, 1 vật đang đấu (hết giờ 8 phút nữa), 9 vật xếp hàng
const BASE = now - 2 * ITEM_GAP

function itemStart(i) { return new Date(BASE + i * ITEM_GAP).toISOString() }
function itemEnd(i, extra = 0) {
  return new Date(BASE + i * ITEM_GAP + SESSION_CONFIGURATION.itemDurationMinutes * MIN + extra).toISOString()
}

const CATEGORIES = ['Đồng hồ & Trang sức', 'Máy ảnh & Quang học', 'Âm nhạc & Giải trí', 'Gốm sứ & Thủ công', 'Điện tử cổ', 'Nghệ thuật', 'Tem & Tiền xu', 'Trò chơi & Bộ sưu tập', 'Máy móc cổ', 'Văn phòng phẩm', 'Đèn & Nội thất', 'Tiền xu & Huy chương']

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
  images: [],
  startingPrice,
  baseBidIncrement: startingPrice >= 800000 ? 100000 : 50000,
  currentPrice: state === 'bidding' || state === 'sold' ? currentPrice : null,
  highestBidder: state === 'sold' || state === 'bidding' ? 'usr•••c2a9' : null,
  bidCount: state === 'sold' ? 14 : state === 'bidding' ? 6 : 0,
  bids: state === 'bidding'
    ? Array.from({ length: 6 }, (_, bidIndex) => ({
      id: `bid_${i + 1}_${bidIndex + 1}`,
      amount: currentPrice - (5 - bidIndex) * (startingPrice >= 800000 ? 100000 : 50000),
      bidderDisplay: bidIndex === 5 ? 'usr•••c2a9' : `usr•••${['5e07', '91c2', 'a841', '70bd', '33f0'][bidIndex]}`,
      createdAt: new Date(now - (6 - bidIndex) * 45 * 1000).toISOString(),
    }))
    : [],
  state,
  startTime: itemStart(i),
  endTime: state === 'bidding'
    ? new Date(now + 8 * MIN).toISOString()   // còn 8 phút
    : state === 'sold'
      ? itemEnd(i, 4 * MIN)                   // đã kết thúc
      : itemEnd(i),
}))

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
  return sessionId.startsWith('ses_') ? { ...MOCK_SESSION, id: sessionId } : null
}

export function getMockLiveItem(sessionId, itemId) {
  const session = getMockLiveSession(sessionId)
  const index = session ? session.items.findIndex((i) => i.itemId === itemId) : -1
  return index === -1 ? null : { session, item: session.items[index], index }
}
