import { ArrowRight, FileWarning, MessageSquareWarning, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

const MODERATION_QUEUES = [
  {
    title: 'Báo cáo cửa hàng',
    description: 'Xem các shop đang có case cần xem xét.',
    to: '/moderator/reports/shops',
    icon: Store,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Báo cáo sản phẩm',
    description: 'Kiểm tra sản phẩm bị người dùng báo cáo.',
    to: '/moderator/reports/products',
    icon: FileWarning,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Báo cáo đánh giá',
    description: 'Xem xét nội dung đánh giá bị báo cáo.',
    to: '/moderator/reports/reviews',
    icon: MessageSquareWarning,
    tone: 'bg-violet-50 text-violet-700',
  },
]

export default function ModeratorDashboardPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Tổng quan kiểm duyệt</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Theo dõi các hàng đợi báo cáo và hoạt động kiểm duyệt trên NaviShop.</p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
          Kênh nhân viên kiểm duyệt
        </span>
      </header>

      <section aria-label="Hàng đợi kiểm duyệt" className="mt-7 grid gap-4 lg:grid-cols-3">
        {MODERATION_QUEUES.map(({ title, description, to, icon: Icon, tone }) => (
          <Link key={to} to={to} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#056F1C]" />
            </div>
            <h2 className="mt-5 font-bold text-gray-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-gray-500">{description}</p>
            <p className="mt-5 border-t border-gray-100 pt-3 text-xs font-medium text-gray-400">Chưa có dữ liệu tổng hợp</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
              <FileWarning className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900">Quy trình xử lý case</h2>
              <p className="mt-1 text-sm text-gray-500">Các bước kiểm duyệt theo quy định của NaviShop.</p>
            </div>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Xem báo cáo', 'Kiểm tra đối tượng, lý do và bằng chứng.'],
              ['02', 'Đánh giá case', 'Xem lịch sử và xác định hướng xử lý.'],
              ['03', 'Ra quyết định', 'Bỏ qua, cảnh cáo, ẩn/khóa tạm hoặc chuyển admin.'],
            ].map(([number, title, description]) => (
              <li key={number} className="rounded-xl bg-gray-50 p-4">
                <span className="text-xs font-bold tracking-wide text-[#056F1C]">{number}</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <h2 className="font-bold text-gray-900">Lịch sử xử lý</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">Tra cứu các case đã chốt để hỗ trợ đánh giá tình trạng tái phạm.</p>
          <Link to="/moderator/history" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline">
            Mở lịch sử case <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </div>
  )
}
