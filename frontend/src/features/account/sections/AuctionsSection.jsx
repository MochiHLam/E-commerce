import { ArrowRight, CalendarDays, Gavel, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/features/auction/lib/auction'
import { getMockParticipatedSessions } from '@/mocks/auction/historyMock'

export default function AuctionsSection() {
  const sessions = getMockParticipatedSessions()

  return (
    <>
      <h1 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Lịch sử đấu giá</h1>
      {sessions.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {sessions.map((session) => (
            <li key={session.id}>
              <article className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#056F1C]">
                      <Gavel className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900">{session.name}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateTime(session.startTime)}
                        </span>
                        <span>{session.items.length} vật phẩm trong phiên</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#056F1C]">
                    <Trophy className="h-3.5 w-3.5" />
                    Thắng {session.wonItems.length} vật phẩm
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">
                    Kết thúc {formatDateTime(session.closedAt)}
                  </p>
                  <Link
                    to={`/auction/history/${session.id}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition hover:border-[#056F1C] hover:text-[#056F1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    Xem phiên đấu giá <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
          <p className="text-sm text-gray-500">Bạn chưa tham gia phiên đấu giá nào.</p>
        </div>
      )}
    </>
  )
}
