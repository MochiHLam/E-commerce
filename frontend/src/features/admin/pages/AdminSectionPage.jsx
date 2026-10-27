export default function AdminSectionPage({ title }) {
  return (
    <section className="mx-auto w-full max-w-[1500px]">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-gray-800">Khu vực này chưa được triển khai</p>
        <p className="mt-2 text-sm text-gray-500">Chọn một tác vụ khác trong thanh điều hướng để tiếp tục.</p>
      </div>
    </section>
  )
}
