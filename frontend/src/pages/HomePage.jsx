import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AuctionCTAButton from '@/features/auction/components/AuctionCTAButton'
import { MOCK_SESSION } from '@/mocks/auction/sessionMock'
import { CATEGORIES } from '@/mocks/categories'

// ─── Constants ────────────────────────────────────────────────────────────────
const LAYOUT = 'max-w-[1500px] mx-auto'

// ─── Why Choose Us ────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    title: 'NAVISHOP: MUA SẮM VÀ ĐẤU GIÁ TRỰC TUYẾN AN TÂM, MINH BẠCH',
    desc: 'NaviShop là sàn thương mại điện tử nơi bạn có thể mua sắm từ nhiều gian hàng, tự mở shop bán đồ của mình và tham gia các phiên đấu giá vật phẩm hiếm, độc bản. Mọi giao dịch đều có đội ngũ kiểm duyệt đồng sát, để bạn mua và bán một cách yên tâm hơn.',
  },
  {
    title: 'MUA SẮM VÀ BÁN HÀNG ĐƠN GIẢN, CHỈ VỚI MỘT TÀI KHOẢN',
    desc: 'Muốn bán hàng? Chỉ cần đăng ký mở shop trên tài khoản của bạn, sau khi được duyệt là có thể đăng sản phẩm, quản lý đơn và theo dõi doanh thu ngay.',
  },
  {
    title: 'THANH TOÁN BẰNG VÍ, THEO DÕI ĐƠN TỪNG BƯỚC',
    desc: 'Nạp tiền vào ví và mua hàng chỉ với vài thao tác. Tiền của bạn được giữ an toàn cho đến khi bạn nhận được hàng. Bạn theo dõi được đơn từ lúc đặt, xác nhận, đang giao đến khi hoàn thành, và hủy đơn dễ dàng khi shop chưa xác nhận, tiền được hoàn đầy đủ.',
  },
  {
    title: 'ĐẤU GIÁ VẬT PHẨM ĐỘC BẢN: HỒI HỘP TỪNG GIÂY',
    desc: 'Sắm những món hiếm chỉ có một cây nhất trong các phiên đấu giá do sàn tổ chức. Đăng ký tham gia trước khi phiên bắt đầu, theo dõi giá nhảy theo thời gian thực và ra giá ngay trong phòng đấu giá. Không sợ bị chen vào phút chót vì mỗi lượt đặt giá cuối giờ sẽ được gia hạn thêm thời gian.',
  },
  {
    title: 'ĐÁNH GIÁ THẬT TỪ NGƯỜI ĐÃ MUA',
    desc: 'Xem nhận xét và sao số từ những người đã mua sản phẩm trước khi quyết định. Thấy shop, sản phẩm hay đánh giá có vấn đề? Bạn có thể báo cáo, đội ngũ kiểm duyệt sẽ xem xét và xử lý để sàn luôn đáng tin cậy.',
  },
  {
    title: 'GỢI Ý SẢN PHẨM THÔNG MINH',
    desc: 'Đăng nhập để nhận gợi ý những sản phẩm phù hợp, hoặc mô tả thứ bạn cần bằng lời tự nhiên. NaviShop sẽ giúp bạn tìm ra.',
  },
]

// ─── CountdownBox ─────────────────────────────────────────────────────────────
function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/55 backdrop-blur-sm text-white font-bold text-xl w-11 h-10 flex items-center justify-center rounded">
        {value}
      </div>
      <span className="text-white/70 text-[10px] mt-0.5">{label}</span>
    </div>
  )
}

function AuctionBanner({ session, isRegistered }) {
  const status = session?.status ?? 'closed'

  // Countdown d/h/m/s
  const [dd, setDd] = useState('00')
  const [hh, setHh] = useState('00')
  const [mm, setMm] = useState('00')
  const [ss, setSs] = useState('00')

  useEffect(() => {
    if (status !== 'pending' || !session?.startTime) return
    const tick = () => {
      const diff = new Date(session.startTime) - Date.now()
      if (diff <= 0) { setDd('00'); setHh('00'); setMm('00'); setSs('00'); return }
      setDd(String(Math.floor(diff / 86400000)).padStart(2, '0'))
      setHh(String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'))
      setMm(String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'))
      setSs(String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [status, session?.startTime])

  const [popup, setPopup] = useState('')

  let subText = ''
  if (status === 'closed') subText = 'Hiện chưa có phiên đấu giá nào sắp diễn ra'
  if (status === 'active') subText = 'Buổi đấu giá đang được diễn ra'

  return (
    <section className={`${LAYOUT}`}>
      <div className="relative select-none">
        <img
          src="/images/auction_banner.webp"
          alt="Phiên đấu giá NaviShop"
          className="w-full block"
          draggable={false}
        />

        <div className="absolute bottom-0 left-0 pb-8 flex flex-col gap-3 items-center w-1/2">
          {subText && (
            <p className="text-white font-semibold text-sm drop-shadow">{subText}</p>
          )}

          {status === 'pending' && (
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-white font-semibold text-sm drop-shadow">
                Phiên đấu giá sẽ bắt đầu sau:
              </p>
              <div className="flex items-end gap-1.5">
                <CountdownBox value={dd} label="Ngày" />
                <span className="text-white font-bold text-xl mb-3.5 leading-none">:</span>
                <CountdownBox value={hh} label="Giờ" />
                <span className="text-white font-bold text-xl mb-3.5 leading-none">:</span>
                <CountdownBox value={mm} label="Phút" />
                <span className="text-white font-bold text-xl mb-3.5 leading-none">:</span>
                <CountdownBox value={ss} label="Giây" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-6">
            <AuctionCTAButton session={session} isRegistered={isRegistered} onDark={false} onPopup={setPopup} />
            <Link
              to="/auction/about"
              id="auction-banner-learn-more-btn"
              className="min-w-[200px] px-7 py-3 rounded text-base font-semibold text-center border-2 border-[#056F1C] text-white bg-transparent hover:bg-[#056F1C]/20 transition-all"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>

      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setPopup('')}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-700 text-sm leading-relaxed mb-5">{popup}</p>
            <button
              onClick={() => setPopup('')}
              className="px-6 py-2 bg-[#056F1C] text-white rounded text-sm font-medium hover:bg-[#045517] transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── CategoryCarousel ─────────────────────────────────────────────────────────
// Layout: 2 hàng × 8 cột = 16 item hiển thị mặc định.
// Item 17+ nằm ở cột 9+ (off-screen), cuộn sang phải bằng nút >.
// gridAutoColumns: calc(100% / 8) → mỗi cột = 1/8 container, scroll-snap mỗi trang.
function CategoryCarousel({ categories, isLoggedIn }) {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const check = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [check])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Nút cuộn trái */}
      {canLeft && (
        <button
          id="category-scroll-left"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 h-8 w-8 flex items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
      )}

      {/*
        Grid container: overflow-x:auto (nhưng ẩn scrollbar),
        grid-auto-columns: calc(100%/8) → mỗi cột đúng 1/8 container.
        Với 16 item (≤8 cột) → vừa khíp, không scroll.
        Với 17+ item (≥9 cột) → tràn sang phải, hiện nút >.
      */}
      <div
        ref={scrollRef}
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(2, auto)',
          gridAutoFlow: 'column',
          gridAutoColumns: 'calc(100% / 8)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',   /* Firefox */
          msOverflowStyle: 'none',  /* IE/Edge */
        }}
      >
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/search?category=${encodeURIComponent(cat.name)}&categoryFromHome=true`}
            onClick={(event) => {
              if (!isLoggedIn) {
                event.preventDefault()
                navigate('/login', {
                  state: { returnTo: `/search?category=${encodeURIComponent(cat.name)}&categoryFromHome=true` },
                })
              }
            }}
            id={`category-${cat.id}`}
            className="flex flex-col items-center gap-2 py-3 group"
            style={{
              // Snap chỉ xảy ra ở đầu mỗi trang (mỗi 16 item = 8 cột)
              scrollSnapAlign: i % 16 === 0 ? 'start' : undefined,
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl group-hover:bg-green-50 group-hover:ring-2 group-hover:ring-[#056F1C]/25 transition-all">
              {cat.icon}
            </div>
            <span className="text-xs text-center text-gray-600 leading-tight group-hover:text-[#056F1C] transition-colors px-1 max-w-[80px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Nút cuộn phải */}
      {canRight && (
        <button
          id="category-scroll-right"
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 h-8 w-8 flex items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoggedIn } = useAuth()
  // TODO: thay bằng API call
  const mockSession = {
    status: 'pending', // 'pending' | 'active' | 'closed'
    startTime: MOCK_SESSION.startTime,
    id: 'ses_mock',
    isRegistered: false, // TODO: lấy từ API
    registrationFee: 50000,
    walletAvailable: 100000,
  }
  const isRegistered = Boolean(mockSession.isRegistered)

  return (
    <main className="bg-white">

      {/* ── 1. Auction Banner ── */}
      <div className="bg-gray-100 py-6">
        <AuctionBanner session={mockSession} isRegistered={isRegistered} />
      </div>

      {/* ── 2. Categories ── */}
      <section className="py-6 bg-gray-50">
        <div className={`${LAYOUT} px-0`}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-8 py-5">
            <p className="text-[18px] font-bold text-gray-400 tracking-[0.2em] mb-4 uppercase">
              Categories
            </p>
            <CategoryCarousel categories={CATEGORIES} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </section>

      {/* ── 3. Why Choose Us ── */}
      <section className="py-14">
        <div className={`${LAYOUT} px-0`}>
          <div className="space-y-5">
            {WHY_ITEMS.map((item, i) => (
              <div key={i}>
                <h3 className="font-bold text-[13px] text-gray-900 leading-snug mb-1">
                  {item.title}
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <p className="mt-10 text-[13px] font-bold text-gray-900 text-center">
            ĐĂNG KÝ NGAY ĐỂ BẮT ĐẦU MUA SẮM, BÁN HÀNG VÀ ĐẤU GIÁ CÙNG NAVISHOP!
          </p>
        </div>
      </section>
    </main>
  )
}
