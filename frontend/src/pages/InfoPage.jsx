import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ABOUT_GROUPS } from '@/data/about/nav'
import { ABOUT_CONTENT_MAP } from '@/data/about/content/index'

const LAYOUT = 'max-w-[1500px] mx-auto'

function NotFound({ defaultGroup }) {
  const g = ABOUT_GROUPS.find(g => g.groupSlug === defaultGroup) ?? ABOUT_GROUPS[0]
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-5xl">🔍</span>
      <h2 className="text-xl font-bold text-gray-800">Không tìm thấy trang này</h2>
      <Link to={`/info/${g.groupSlug}/${g.items[0].slug}`}
        className="mt-2 text-sm font-semibold text-[#056F1C] hover:underline">
        ← Quay về trang trước
      </Link>
    </div>
  )
}

/**
 * InfoPage — dùng chung cho /about và /policies
 * defaultGroup: 've-navishop' hoặc 'chinh-sach'
 */
export default function InfoPage({ defaultGroup }) {
  const { groupSlug, itemSlug } = useParams()

  // Redirect về defaultGroup nếu không có params
  if (!groupSlug) {
    const g = ABOUT_GROUPS.find(g => g.groupSlug === defaultGroup) ?? ABOUT_GROUPS[0]
    return <Navigate to={`/info/${g.groupSlug}/${g.items[0].slug}`} replace />
  }

  const group = ABOUT_GROUPS.find(g => g.groupSlug === groupSlug)
  if (!group) return <NotFound defaultGroup={defaultGroup} />

  if (!itemSlug) {
    return <Navigate to={`/info/${groupSlug}/${group.items[0].slug}`} replace />
  }

  const navItem = group.items.find(i => i.slug === itemSlug)
  if (!navItem) return <NotFound defaultGroup={defaultGroup} />

  const content = ABOUT_CONTENT_MAP[`${groupSlug}/${itemSlug}`]
  if (!content) return <NotFound defaultGroup={defaultGroup} />

  return (
    <div className="flex-1 bg-white">
      <div className={`${LAYOUT} px-0 py-8`}>
        <div className="flex gap-0">

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0 py-6 px-4 self-start sticky top-[90px]">
            {ABOUT_GROUPS.map((g) => (
              <div key={g.groupSlug} className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 px-2">
                  {g.label}
                </p>
                {g.items.map((item) => {
                  const isActive = g.groupSlug === groupSlug && item.slug === itemSlug
                  return (
                    <Link
                      key={item.slug}
                      to={`/info/${g.groupSlug}/${item.slug}`}
                      className={`block px-3 py-1.5 rounded text-sm transition-colors
                        ${isActive
                          ? 'text-[#056F1C] font-semibold bg-[#056F1C]/8'
                          : 'text-gray-600 hover:text-[#056F1C]'
                        }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-h-[60vh] p-8">
            <p className="text-xs text-gray-400 mb-4">
              NaviShop › {group.label} › {navItem.label}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              {content.title}
            </h1>
            <div className="prose prose-sm prose-gray max-w-none
              prose-headings:font-semibold prose-headings:text-gray-800
              prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-li:text-gray-600
              prose-strong:text-gray-800
              prose-blockquote:border-l-[#056F1C] prose-blockquote:text-gray-500
              prose-table:text-sm prose-th:text-gray-700 prose-td:text-gray-600
              prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-[#056F1C]"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body}</ReactMarkdown>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
