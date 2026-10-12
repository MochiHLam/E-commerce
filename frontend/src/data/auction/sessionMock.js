// MOCK cho trang phiên đấu giá đang diễn ra / xem trước.
// Khi có API: GET /api/auction/sessions/:sessionId (pending → preview, active → phòng đấu giá)

const now = Date.now()
const MIN = 60 * 1000
const ITEM_GAP = 30 * MIN // 30 phút mỗi vật

// Xây mock: 2 vật đã xong, 1 vật đang đấu (hết giờ 8 phút nữa), 9 vật xếp hàng
const BASE = now - 2 * ITEM_GAP

function itemStart(i) { return new Date(BASE + i * ITEM_GAP).toISOString() }
function itemEnd(i, extra = 0) { return new Date(BASE + i * ITEM_GAP + 30 * MIN + extra).toISOString() }

const CATEGORIES = ['Đồng hồ & Trang sức', 'Máy ảnh & Quang học', 'Âm nhạc & Giải trí', 'Gốm sứ & Thủ công', 'Điện tử cổ', 'Nghệ thuật', 'Tem & Tiền xu', 'Trò chơi & Bộ sưu tập', 'Máy móc cổ', 'Văn phòng phẩm', 'Đèn & Nội thất', 'Tiền xu & Huy chương']

const RAW = [
  // [title, startingPrice, currentPrice, state, soldVia]
  ['Đồng hồ cơ cổ 1960',        500000,  1850000, 'sold',   'bid'],
  ['Máy ảnh film Pentax',        800000,  4000000, 'sold',   'buy_now'],
  ['Bộ tem sưu tầm',             300000,   820000, 'bidding', null],
  ['Đĩa than Beatles bản gốc',   600000,       null, 'queued', null],
  ['Bút máy Parker cổ',          650000,       null, 'queued', null],
  ['Tranh sơn mài nhỏ',         1000000,       null, 'queued', null],
  ['Radio Philips đời 70',        450000,       null, 'queued', null],
  ['Bàn cờ vua gỗ óc chó',       700000,       null, 'queued', null],
  ['Ấm trà gốm Bát Tràng',       400000,       null, 'queued', null],
  ['Máy đánh chữ Olivetti',      900000,       null, 'queued', null],
  ['Bộ tiền xu cổ',              350000,       null, 'queued', null],
  ['Đèn dầu đồng',               300000,       null, 'queued', null],
]

export const MOCK_SESSION_ITEMS = RAW.map(([title, startingPrice, currentPrice, state, soldVia], i) => ({
  itemId: `itm_${String(i + 1).padStart(2, '0')}`,
  order: i + 1,
  title,
  category: CATEGORIES[i % CATEGORIES.length],
  images: [],
  startingPrice,
  buyNowPrice: startingPrice * 5,
  baseBidIncrement: startingPrice >= 800000 ? 100000 : 50000,
  currentPrice: state === 'bidding' || state === 'sold' ? currentPrice : null,
  highestBidder: state === 'sold' || state === 'bidding' ? 'usr•••c2a9' : null,
  bidCount: state === 'sold' ? 14 : state === 'bidding' ? 6 : 0,
  state,
  soldVia: state === 'sold' ? soldVia : null,
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
  status: 'active',   // 'pending' | 'active'
  registrationFee: 50000,
  isRegistered: true,
  startTime: new Date(BASE).toISOString(),
  pendingEndTime: new Date(BASE - 5 * MIN).toISOString(), // đã hết pending
  itemCount: RAW.length,
  items: MOCK_SESSION_ITEMS,
}

export function getMockLiveSession(sessionId) {
  return /^ses_/.test(sessionId) ? { ...MOCK_SESSION, id: sessionId } : null
}

export function getMockLiveItem(sessionId, itemId) {
  const session = getMockLiveSession(sessionId)
  const index = session ? session.items.findIndex((i) => i.itemId === itemId) : -1
  return index === -1 ? null : { session, item: session.items[index], index }
}
