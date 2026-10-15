export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="text-6xl" aria-hidden="true">🚧</span>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-500">Trang này đang được phát triển, vui lòng quay lại sau!</p>
    </div>
  )
}
