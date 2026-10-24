// MOCK cho dev. Khi có API: GET /api/auction/sessions/:sessionId/result (xem doc UC4), rồi xóa file này.
const SESSION_START = Date.UTC(2026, 8, 14, 1, 0) // 08:00 giờ Việt Nam
const ITEM_DURATION_SEC = 1800 // 30 phút (mặc định, admin chỉnh được, có thể sửa riêng từng vật)
const ITEM_GAP_SEC = 1800 // cứ 30 phút một vật lên sàn
const EXTEND_MIN_SEC = 30
const EXTEND_RATIO = 0.1
const EXTEND_STEP_MS = 120000 // mock: mỗi lần gia hạn kéo dài thêm ~2 phút

// [title, startingPrice, baseBidIncrement, finalPrice, bidCount, extensionCount, durationSec?]
const RAW_ITEMS = [
  ['Đồng hồ cơ cổ 1960', 500000, 50000, 1850000, 14, 2],
  ['Máy ảnh film Pentax', 800000, 100000, 4000000, 6, 0],
  ['Bộ tem sưu tầm', 300000, 50000, null, 0, 0],
  ['Đĩa than Beatles bản gốc', 600000, 50000, 1400000, 9, 1],
  ['Bút máy Parker cổ', 650000, 50000, null, 0, 0],
  ['Tranh sơn mài nhỏ', 1000000, 100000, 3200000, 17, 3, 3600],
  ['Radio Philips đời 70', 450000, 50000, 900000, 7, 0],
  ['Bàn cờ vua gỗ óc chó', 700000, 50000, null, 0, 0],
  ['Ấm trà gốm Bát Tràng', 400000, 50000, 1000000, 8, 1],
  ['Máy đánh chữ Olivetti', 900000, 100000, 2600000, 12, 2],
  ['Bộ tiền xu cổ', 350000, 50000, null, 0, 0],
  ['Đèn dầu đồng', 300000, 50000, 750000, 5, 0],
]

const BIDDERS = ['usr•••5e07', 'usr•••91c2', 'usr•••c2a9']
const CATEGORIES = ['Đồng hồ & Trang sức', 'Máy ảnh & Quang học', 'Tem & Tiền xu', 'Âm nhạc & Giải trí', 'Văn phòng phẩm', 'Nghệ thuật', 'Điện tử cổ', 'Trò chơi & Bộ sưu tập', 'Gốm sứ & Thủ công', 'Máy móc cổ', 'Tiền xu & Huy chương', 'Đèn & Nội thất']
const SOURCE_SHOPS = [
  { name: 'Phụ Kiện Xinh', slug: 'phu-kien-xinh' },
  { name: 'Công Nghệ Mới', slug: 'cong-nghe-moi' },
  { name: 'Nhà Sách Tri Thức', slug: 'nha-sach-tri-thuc' },
  { name: 'Âm Thanh Việt', slug: 'am-thanh-viet' },
  { name: 'Nhà Sách Tri Thức', slug: 'nha-sach-tri-thuc' },
]

function buildItem([title, startingPrice, baseBidIncrement, finalPrice, bidCount, extensionCount, durationOverride], index) {
  const durationSec = durationOverride ?? ITEM_DURATION_SEC
  const extendSec = Math.max(EXTEND_MIN_SEC, Math.ceil(durationSec * EXTEND_RATIO))
  const startMs = SESSION_START + index * ITEM_GAP_SEC * 1000
  const endMs = startMs + durationSec * 1000 + extensionCount * EXTEND_STEP_MS
  const sold = finalPrice != null

  const mid = Math.max(startingPrice, Math.round((startingPrice + (finalPrice ?? 0)) / 2 / baseBidIncrement) * baseBidIncrement)
  const bids = sold
    ? [startingPrice, mid, finalPrice].map((amount, i, arr) => ({
      time: new Date(endMs - (arr.length - 1 - i) * 40000).toISOString(),
      bidderDisplay: BIDDERS[(i + index) % BIDDERS.length],
      amount,
    }))
    : []

  return {
    itemId: `itm_${String(index + 1).padStart(2, '0')}`,
    category: CATEGORIES[index % CATEGORIES.length],
    title,
    description: 'Mô tả ngắn của vật phẩm: tình trạng, xuất xứ, ghi chú từ người bán.',
    images: [], // TODO: URL ảnh thật từ API
    sourceShop: SOURCE_SHOPS[index % SOURCE_SHOPS.length],
    startingPrice,
    baseBidIncrement,
    state: sold ? 'sold' : 'unsold',
    durationSec,
    extendSec,
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(endMs).toISOString(),
    bidCount,
    extensionCount,
    finalPrice,
    winnerDisplay: sold ? bids[bids.length - 1].bidderDisplay : null,
    isMe: sold && index === 3,
    bids,
  }
}

const items = RAW_ITEMS.map(buildItem)

const MOCK_SESSION = {
  name: 'Phiên đấu giá cuối tuần',
  startTime: items[0].startTime,
  closedAt: new Date(Math.max(...items.map((i) => new Date(i.endTime).getTime()))).toISOString(),
  closedReason: 'completed', // phiên đã đóng chỉ có completed (cancelled_pending không vào lịch sử)
  items,
}

export function getMockSession(sessionId) {
  return /^ses_\d+$/.test(sessionId) ? { ...MOCK_SESSION, id: sessionId } : null
}

export function getMockItem(sessionId, itemId) {
  const session = getMockSession(sessionId)
  const index = session ? session.items.findIndex((i) => i.itemId === itemId) : -1
  return index === -1 ? null : { session, item: session.items[index], index }
}

const MOCK_PARTICIPATED_SESSION_IDS = ['ses_004']

export function getMockParticipatedSessions() {
  return MOCK_PARTICIPATED_SESSION_IDS
    .map((sessionId) => {
      const session = getMockSession(sessionId)
      if (!session) return null
      const wonItems = session.items.filter((item) => item.isMe)
      return { ...session, wonItems }
    })
    .filter(Boolean)
}

export function getMockWonAuctionItems() {
  return getMockParticipatedSessions().flatMap((session) =>
    session.wonItems.map((item) => ({ session, item })),
  )
}