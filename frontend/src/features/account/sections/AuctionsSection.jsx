import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuctionsSection() {
  return (
    <>
      <h1 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Lịch sử đấu giá</h1>
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
        <p className="text-sm text-gray-500">Lịch sử tham gia đấu giá sẽ hiển thị tại đây khi được kết nối.</p>
      </div>
      <Link
        to="/auction/about"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#056F1C] hover:underline"
      >
        Khám phá đấu giá <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  )
}
