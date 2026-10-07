import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, Navigate, useParams } from 'react-router-dom'
import { HELP_GROUPS } from '@/data/help/nav'
import { CONTENT_MAP } from '@/data/help/content/index'

const LAYOUT = 'max-w-[1500px] mx-auto'

// Trang 404 nhỏ dùng riêng trong help
function HelpNotFound() {
  const firstGroup = HELP_GROUPS[0]
  const firstItem = firstGroup.items[0]
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-5xl">🔍</span>
      <h2 className="text-xl font-bold text-gray-800">Không tìm thấy trang này</h2>
      <p className="text-sm text-gray-500">Trang bạn truy cập không tồn tại hoặc đã bị thay đổi URL.</p>
      <Link
        to={`/help/${firstGroup.groupSlug}/${firstItem.slug}`}
        className="mt-2 text-sm font-semibold text-[#056F1C] hover:underline"
      >
        ← Quay về Trung tâm trợ giúp
      </Link>
    </div>
  )
}

export default function HelpPage() {
  const { groupSlug, itemSlug } = useParams()

  // Điểm vào /help không có slug → redirect về bài đầu tiên
  if (!groupSlug) {
    const g = HELP_GROUPS[0]
    return <Navigate to={`/help/${g.groupSlug}/${g.items[0].slug}`} replace />
  }

  // Validate groupSlug
  const group = HELP_GROUPS.find((g) => g.groupSlug === groupSlug)
  if (!group) return <HelpNotFound />

  // Điểm vào /help/:groupSlug không có itemSlug → redirect về item đầu của group
  if (!itemSlug) {
    return <Navigate to={`/help/${groupSlug}/${group.items[0].slug}`} replace />
  }

  // Validate itemSlug
  const navItem = group.items.find((i) => i.slug === itemSlug)
  if (!navItem) return <HelpNotFound />

  // Load content (luôn tồn tại nếu nav.js và content/index.js đồng bộ)
  const content = CONTENT_MAP[`${groupSlug}/${itemSlug}`]
  if (!content) return <HelpNotFound />

  return (
    <div className="flex-1 bg-white">
      <div className={`${LAYOUT} px-0 py-8`}>
        <div className="flex gap-0">

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0 py-6 px-4 self-start sticky top-[90px]">
            {HELP_GROUPS.map((g) => (
              <div key={g.groupSlug} className="mb-5">
                {/* Mục lớn — tiêu đề nhóm, không click */}
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 px-2">
                  {g.label}
                </p>
                {/* Mục nhỏ — mỗi cái là route riêng /help/:groupSlug/:itemSlug */}
                {g.items.map((item) => {
                  const isActive = g.groupSlug === groupSlug && item.slug === itemSlug
                  return (
                    <Link
                      key={item.slug}
                      to={`/help/${g.groupSlug}/${item.slug}`}
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

          {/* ── Nội dung — render markdown của bài đang active ── */}
          <div className="flex-1 min-h-[60vh] p-8">
            {/* Breadcrumb suy ra trực tiếp từ URL */}
            <p className="text-xs text-gray-400 mb-4">
              Trung tâm trợ giúp › {group.label} › {navItem.label}
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
