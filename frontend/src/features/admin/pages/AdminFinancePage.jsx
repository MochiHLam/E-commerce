import { CircleDollarSign, Landmark } from 'lucide-react'

export default function AdminFinancePage() {
  return (
    <section className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Đối soát / doanh thu sàn</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Theo dõi hoa hồng và các khoản thu thực tế từ ledger toàn sàn.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
          <CircleDollarSign className="h-4 w-4" />
          Chờ kết nối dữ liệu
        </span>
      </header>

      <div role="status" className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" />
          <div>
            <h2 className="font-semibold text-blue-950">Chưa có dữ liệu đối soát toàn sàn</h2>
            <p className="mt-1 text-sm leading-6 text-blue-900">
              Trang này cần đọc `LedgerEntry` và đơn đã hoàn thành. Hiện chưa có service/API tổng hợp cho admin, nên chưa hiển thị doanh thu mẫu để tránh nhầm với tiền thực thu.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ['Hoa hồng đơn thường', 'Chờ ledger platform theo đơn completed.'],
          ['Hoa hồng đơn đấu giá', 'Chờ ledger platform theo giao dịch đấu giá.'],
          ['Phí thực thu khác', 'Chỉ hiển thị khi có loại bút toán nghiệp vụ tương ứng.'],
        ].map(([title, detail]) => (
          <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02]">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-300">—</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">{detail}</p>
          </article>
        ))}
      </div>

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
        <h2 className="font-bold text-gray-900">Nguồn tính khi tích hợp</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-gray-600">
          <li>Đối soát từ bút toán `platform` phát sinh khi đơn chuyển `completed`.</li>
          <li>Tách hoa hồng khỏi phí vận chuyển; phí ship ghi có cho `carrier` không phải doanh thu sàn.</li>
          <li>Ledger là append-only; điều chỉnh sai lệch bằng bút toán bù trừ, không sửa/xóa lịch sử.</li>
        </ul>
      </section>
    </section>
  )
}
