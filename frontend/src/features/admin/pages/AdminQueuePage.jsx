import { CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminQueuePage({ title, description, source, backTo, backLabel }) {
  return (
    <section className="mx-auto w-full max-w-[1500px]">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      </header>

      <div role="status" className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center sm:px-8">
        <CircleHelp className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-gray-900">Chưa có dữ liệu hàng đợi</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">{source}</p>
        <Link to={backTo} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]">
          {backLabel}
        </Link>
      </div>
    </section>
  )
}
