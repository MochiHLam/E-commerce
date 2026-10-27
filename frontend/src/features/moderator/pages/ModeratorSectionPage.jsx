export default function ModeratorSectionPage({ title }) {
  return (
    <section className="mx-auto max-w-[1500px]">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-gray-800">Danh sách đang chờ kết nối dữ liệu case</p>
        <p className="mt-2 text-sm text-gray-500">Luồng giao diện và phân loại được chuẩn bị theo từng loại báo cáo.</p>
      </div>
    </section>
  )
}
