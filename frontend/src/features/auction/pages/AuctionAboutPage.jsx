import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Pagination from '@/components/Pagination'
import AuctionCTAButton from '@/features/auction/components/AuctionCTAButton'
import { useAuth } from '@/context/AuthContext'
import useAuctionSession from '@/features/auction/hooks/useAuctionSession'
import steps from '@/features/auction/data/steps'
import rules from '@/features/auction/data/rules'
import faq from '@/features/auction/data/faq'

const LAYOUT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-0'

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
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' })

  useEffect(() => {
    if (!startTime) return

    const update = () => {
      const diff = new Date(startTime) - Date.now()
      if (diff <= 0) {
        setTimeLeft({ d: '00', h: '00', m: '00', s: '00' })
        return
      }

      setTimeLeft({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
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
        { value: timeLeft.d, label: 'Ngày' },
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

function HeroSection({ session, isRegistered }) {
  const status = session?.status ?? 'closed'
  const sessionPath = session?.id ? `/auction/${session.id}` : null
  const [popup, setPopup] = useState('')

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

          <div className="mt-8 flex flex-col items-start gap-4">
            {status === 'pending' && (
              <>
                <p className="text-sm font-medium text-white/75">Phiên sẽ bắt đầu sau:</p>
                <Countdown startTime={session.startTime} />
              </>
            )}
            {status === 'active' && (
              <p className="text-sm font-medium text-white/75">Phiên hiện đang diễn ra.</p>
            )}
            {status === 'closed' && (
              <p className="text-sm font-medium text-white/75">
                {session?.closedReason === 'completed'
                  ? 'Phiên đấu giá đã kết thúc.'
                  : 'Hiện chưa có phiên đấu giá nào đang mở.'}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                to={sessionPath ?? '/login'}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Xem trước buổi đấu giá
              </Link>
              <AuctionCTAButton
                session={session}
                isRegistered={isRegistered}
                onDark
                onPopup={(msg) => setPopup(msg)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPopup('')}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">{popup}</p>
            <button onClick={() => setPopup('')} className="px-6 py-2 bg-[#056F1C] text-white rounded text-sm font-medium hover:bg-[#045517]">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
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

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200">
          {rules.map((rule) => (
            <div key={rule.title} className="py-7 first:pt-0">
              <h3 className="flex items-center gap-2.5 text-base font-bold text-gray-900">
                <span aria-hidden="true">{rule.icon}</span>
                {rule.title}
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">{rule.description}</p>
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
                <li>• <strong>Đấu giá miễn hủy, miễn trả.</strong> Khi bạn thắng, kết quả không thể hủy và không được hoàn tiền, nên hãy cân nhắc kỹ trước khi đặt giá.</li>
                <li>• <strong>Giá đã đặt không rút lại được.</strong> Số tiền được giữ lại cho đến khi có người đặt cao hơn hoặc phiên kết thúc.</li>
                <li>• Phí vận chuyển được trừ từ ví lúc cửa hàng bấm giao. Nếu ví không đủ, cửa hàng chưa giao được, vì vậy hãy giữ đủ số dư sau khi thắng.</li>
                <li>• Phiên đã bắt đầu thì không đăng ký được nữa, bạn sẽ phải chờ phiên kế tiếp.</li>
              </ul>
              <Link to="/info/policies/auction" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center text-sm font-semibold text-[#056F1C] hover:underline">
                Xem đầy đủ thỏa thuận đấu giá →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
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

            <Pagination page={page} totalPages={totalPages} onChange={setPage} label="Phân trang lịch sử đấu giá" />
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
            Nếu bạn là chủ cửa hàng, bạn có thể gửi vật phẩm thuộc danh mục được phép và còn đúng một món trong kho để đưa lên đấu giá.             NaviShop sẽ duyệt và tự quyết định giá khởi điểm và bước giá.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Giá bạn đề xuất chỉ để tham khảo. Sau khi được duyệt, vật phẩm không thể rút lại. Nếu không ai đặt giá, vật phẩm quay về kho để chờ phiên sau, bạn không mất gì.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Khi vật phẩm được bán, NaviShop thu hoa hồng riêng cho đấu giá, phần còn lại chuyển cho cửa hàng của bạn. Một đơn hàng được tạo sẵn để bạn giao cho người thắng.
          </p>
          <Link to="/help/selling/list-product" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center text-sm font-semibold text-[#056F1C] hover:underline">
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
  const { session: mockSession } = useAuctionSession('ses_mock')

  return (
    <main className="bg-white">
      <HeroSection session={mockSession} isRegistered={Boolean(mockSession?.isRegistered)} />
      <StepsSection />
      <RulesSection />
      <ImportantNotice />
      <HistorySection isLoggedIn={isLoggedIn} />
      <SellerSection />
      <FaqSection />
    </main>
  )
}
