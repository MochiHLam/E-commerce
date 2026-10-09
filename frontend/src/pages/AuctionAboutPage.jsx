import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuctionCTA from '@/components/AuctionCTA'
import { useAuth } from '@/context/AuthContext'
import steps from '@/data/auction/steps'
import rules from '@/data/auction/rules'
import faq from '@/data/auction/faq'

const LAYOUT = 'max-w-[1200px] mx-auto px-5'

const PAGE_SIZE = 5

// TODO: thay bằng API GET /auction/sessions?status=closed&page=&limit=5 (chỉ phiên closedReason = completed | admin_forced)
const MOCK_NAMES = ['Phiên đấu giá mùa thu', 'Phiên đấu giá cuối tuần', 'Phiên đấu giá đồ sưu tầm', 'Phiên đấu giá đồ giới hạn']
const MOCK_HISTORY = Array.from({ length: 168 }, (_, i) => {
  const start = new Date(Date.UTC(2026, 8, 28, 12, 0) - i * 3 * 86400000)
  const end = new Date(start.getTime() + (60 + ((i * 7) % 50)) * 60000)
  return {
    id: `ses_${168 - i}`,
    name: MOCK_NAMES[i % MOCK_NAMES.length],
    startTime: start.toISOString(),
    closedAt: end.toISOString(),
    itemCount: 10 + (i % 5),
  }
})

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

function Countdown({ startTime }) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    if (!startTime) return

    const update = () => {
      const diff = new Date(startTime) - Date.now()
      if (diff <= 0) return

      setTimeLeft({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  return (
    <div className="flex items-center gap-2">
      {[
        { value: timeLeft.h, label: 'Giờ' },
        { value: timeLeft.m, label: 'Phút' },
        { value: timeLeft.s, label: 'Giây' },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className="flex h-11 w-12 items-center justify-center rounded-lg bg-white/10 text-xl font-bold text-white backdrop-blur-sm">
            {item.value}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function HeroSection({ session }) {
  const status = session?.status ?? 'closed'

  return (
    <section className="relative overflow-hidden bg-[#056F1C]">
      <img
        src="/images/auction.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 brightness-[0.6] contrast-150"
      />
      <div className={`${LAYOUT} relative min-h-[420px] py-20 pb-24`}>
        <div className="max-w-3xl text-white">
          <h1 className="mt-5 text-3xl font-extrabold uppercase leading-tight sm:text-4xl">
            Trang thông tin đấu giá trực tuyến của NaviShop
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Tham gia đấu giá trực tuyến với quy trình minh bạch, an toàn và hiệu quả. Săn vật phẩm độc đáo, đặt giá theo thời gian thực.
          </p>

          {status === 'pending' && (
            <div className="mt-8 flex flex-col items-start gap-4">
              <p className="text-sm font-medium text-white/75">Phiên sẽ bắt đầu sau:</p>
              <Countdown startTime={session.startTime} />
              <AuctionCTA variant="white" label="Đăng ký tham gia" onClick={() => alert('Đăng ký thành công!')} />
            </div>
          )}

          {status === 'active' && (
            <div className="mt-8">
              <p className="mb-4 text-sm font-medium text-white/75">Phiên hiện đang diễn ra.</p>
              <AuctionCTA variant="white" label="Tham gia đấu giá" onClick={() => alert('Chuyển đến phiên đấu giá!')} />
            </div>
          )}

          {status === 'closed' && (
            <div className="mt-8">
              <p className="mb-4 text-sm font-medium text-white/75">Hiện chưa có phiên đấu giá nào đang mở.</p>
              <AuctionCTA label="Đăng ký tham gia" variant="gray" disabled />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatsStrip() {
  const stats = [
    ['5 phút', 'Mỗi vật phẩm'],
    ['1 phút', 'Nghỉ giữa hai món'],
    ['15 giây', 'Gia hạn cuối giờ'],
    ['24 giờ', 'Thời gian đăng ký'],
  ]

  return (
    <section className="relative z-10 -mt-10">
      <div className={LAYOUT}>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-lg lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="bg-white px-6 py-5 text-center">
              <p className="text-2xl font-extrabold text-[#056F1C]">{value}</p>
              <p className="mt-1 text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section className="py-20">
      <div className={LAYOUT}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#056F1C]">Cách hoạt động</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Bốn bước để bắt đầu</h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5EB] text-lg font-bold text-[#056F1C]">
                {step.number}
              </div>
              <h3 className="mt-6 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RulesSection() {
  return (
    <section className="bg-gray-50 pb-12 pt-20">
      <div className={LAYOUT}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#056F1C]">Luật chơi</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Những điều bạn cần biết</h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <div key={rule.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-3xl">{rule.icon}</span>
              <h3 className="mt-4 font-bold text-gray-900">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImportantNotice() {
  return (
    <section className="bg-gray-50 pb-20">
      <div className={LAYOUT}>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-950">Lưu ý quan trọng</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-amber-900">
                <li>• <strong>Đấu giá miễn hủy, miễn trả.</strong> Khi bạn thắng, kết quả không thể hủy và không được hoàn tiền, nên hãy cân nhắc kỹ trước khi đặt giá hoặc bấm mua ngay.</li>
                <li>• <strong>Giá đã đặt không rút lại được.</strong> Số tiền được giữ lại cho đến khi có người đặt cao hơn hoặc phiên kết thúc.</li>
                <li>• Phí vận chuyển được trừ từ ví lúc cửa hàng bấm giao. Nếu ví không đủ, cửa hàng chưa giao được, vì vậy hãy giữ đủ số dư sau khi thắng.</li>
                <li>• Phiên đã bắt đầu thì không đăng ký được nữa, bạn sẽ phải chờ phiên kế tiếp.</li>
              </ul>
              <Link to="/info/policies/auction" className="mt-5 inline-flex items-center text-sm font-semibold text-[#056F1C] hover:underline">
                Xem đầy đủ thỏa thuận đấu giá →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Luôn hiện 5 số liền nhau chứa trang hiện tại (dịch cửa sổ khi gần đầu/cuối),
// cộng trang đầu và trang cuối. '...' khi bị hở từ 2 trang trở lên.
function getPageItems(current, total) {
  const size = Math.min(5, total)
  const start = Math.min(Math.max(current - 2, 1), total - size + 1)
  const pages = new Set([1, total])
  for (let p = start; p < start + size; p++) pages.add(p)

  const sorted = [...pages].sort((x, y) => x - y)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1]
      if (gap === 2) result.push(p - 1)
      else if (gap > 2) result.push('...')
    }
    result.push(p)
  })
  return result
}

function Pagination({ page, totalPages, onChange }) {
  const navClass =
    'p-1.5 text-gray-900 hover:text-[#056F1C] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-gray-900'

  return (
    <nav aria-label="Phân trang lịch sử đấu giá" className="mt-4 flex items-center justify-center gap-1 text-sm font-bold">
      <button type="button" aria-label="Trang đầu" disabled={page === 1} onClick={() => onChange(1)} className={navClass}>
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Trang trước" disabled={page === 1} onClick={() => onChange(page - 1)} className={navClass}>
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-900">...</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`min-w-[28px] px-1.5 py-1 ${item === page ? 'text-[#056F1C]' : 'text-gray-900 hover:text-[#056F1C]'}`}
          >
            {item}
          </button>
        ),
      )}

      <button type="button" aria-label="Trang sau" disabled={page === totalPages} onClick={() => onChange(page + 1)} className={navClass}>
        <ChevronRight className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Trang cuối" disabled={page === totalPages} onClick={() => onChange(totalPages)} className={navClass}>
        <ChevronsRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

function HistorySection({ isLoggedIn }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(MOCK_HISTORY.length / PAGE_SIZE))
  const rows = MOCK_HISTORY.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section className="py-20">
      <div className={LAYOUT}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#056F1C]">Lịch sử</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Các phiên đấu giá đã diễn ra</h2>
        </div>

        {!isLoggedIn ? (
          <div className="mx-auto mt-10 flex max-w-xl flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <Lock className="h-7 w-7 text-gray-400" />
            <p className="mt-4 font-semibold text-gray-900">Đăng nhập để xem lịch sử đấu giá</p>
            <p className="mt-1 text-sm text-gray-600">Thông tin các phiên chỉ hiển thị cho thành viên đã đăng nhập.</p>
            <Link to="/login" className="mt-5 rounded-lg bg-[#056F1C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#045517]">
              Đăng nhập
            </Link>
          </div>
        ) : MOCK_HISTORY.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">Chưa có phiên nào kết thúc.</p>
        ) : (
          <div className="mt-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed border-collapse text-center text-sm text-gray-900">
                <thead>
                  <tr className="border-y border-gray-900">
                    <th className="w-[26%] px-3 py-4 font-normal">Tên phiên</th>
                    <th className="w-[22%] px-3 py-4 font-normal">Thời gian bắt đầu</th>
                    <th className="w-[22%] px-3 py-4 font-normal">Thời gian kết thúc</th>
                    <th className="w-[18%] px-3 py-4 font-normal">Số vật phẩm lên sàn</th>
                    <th className="w-[12%] px-3 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s, index) => (
                    <tr key={s.id} className={`border-b border-gray-900 ${index % 2 === 0 ? 'bg-[#D8EBDB]' : 'bg-white'}`}>
                      <td className="px-3 py-4">{s.name}</td>
                      <td className="px-3 py-4">{formatDateTime(s.startTime)}</td>
                      <td className="px-3 py-4">{formatDateTime(s.closedAt)}</td>
                      <td className="px-3 py-4">{s.itemCount}</td>
                      <td className="px-3 py-4">
                        <Link to={`/auction/history/${s.id}`} className="text-[#056F1C] hover:underline">
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </section>
  )
}

function SellerSection() {
  return (
    <section className="bg-[#F1F8F2] py-20">
      <div className={`${LAYOUT} grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]`}>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#056F1C]">Dành cho người bán</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Đưa vật phẩm độc đáo lên phiên đấu giá</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nếu bạn là chủ cửa hàng, bạn có thể gửi vật phẩm thuộc danh mục được phép và còn đúng một món trong kho để đưa lên đấu giá. NaviShop sẽ duyệt và tự quyết định giá khởi điểm, bước giá và giá mua ngay.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Giá bạn đề xuất chỉ để tham khảo. Sau khi được duyệt, vật phẩm không thể rút lại. Nếu không ai đặt giá, vật phẩm quay về kho để chờ phiên sau, bạn không mất gì.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Khi vật phẩm được bán, NaviShop thu hoa hồng riêng cho đấu giá, phần còn lại chuyển cho cửa hàng của bạn. Một đơn hàng được tạo sẵn để bạn giao cho người thắng.
          </p>
          <Link to="/help/selling/list-product" className="mt-6 inline-flex items-center text-sm font-semibold text-[#056F1C] hover:underline">
            Xem hướng dẫn gửi vật phẩm →
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-md">
          <div className="flex items-center gap-3 text-[#056F1C]">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-bold">Tiêu chí vật phẩm</span>
          </div>
          <div className="mt-6 space-y-5">
            {[
              'Thuộc danh mục được phép',
              'Chỉ còn đúng 1 món trong kho',
              'Được NaviShop duyệt trước khi lên phiên',
              'Không thể rút lại sau khi được duyệt',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F5EB] text-xs font-bold text-[#056F1C]">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-gray-900">{item.question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-[#056F1C]" /> : <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />}
      </button>
      {isOpen && <p className="border-t border-gray-200 px-6 py-5 text-sm leading-relaxed text-gray-600">{item.answer}</p>}
    </div>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(-1)

  return (
    <section className="py-20">
      <div className={LAYOUT}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#056F1C]">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-3">
          {faq.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AuctionAboutPage() {
  const { isLoggedIn } = useAuth()
  const mockSession = {
    status: 'active',
    startTime: new Date(Date.now() + 3600000).toISOString(),
  }

  return (
    <main className="bg-white">
      <HeroSection session={mockSession} />
      <StatsStrip />
      <StepsSection />
      <RulesSection />
      <ImportantNotice />
      <HistorySection isLoggedIn={isLoggedIn} />
      <SellerSection />
      <FaqSection />
    </main>
  )
}
