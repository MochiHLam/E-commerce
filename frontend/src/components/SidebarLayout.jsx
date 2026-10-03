const LAYOUT = 'max-w-[1500px] mx-auto'

/**
 * SidebarLayout — layout dùng chung cho các trang info/help/about/policies
 * Navbar và Footer được xử lý bởi App.jsx
 *
 * Props:
 *   sidebarTitle  — tiêu đề nhóm trong sidebar
 *   sidebarLinks  — [{ label, href }]
 *   activeHref    — href của item đang active
 *   children      — nội dung chính
 */
export default function SidebarLayout({ sidebarTitle, sidebarLinks, activeHref, children }) {
  return (
    <div className="flex-1 bg-white">
      <div className={`${LAYOUT} px-0 py-8`}>
        <div className="flex gap-0">

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0 py-6 px-4 self-start sticky top-20">
            {sidebarTitle && (
              <p className="text-lg font-bold uppercase tracking-[0.15em] text-gray-800 mb-3 px-2">
                {sidebarTitle}
              </p>
            )}
            <nav className="flex flex-col gap-0.5">
              {sidebarLinks.map((item) => {
                const isActive = item.href === activeHref
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded text-sm font-medium transition-colors
                      ${isActive
                        ? 'text-[#056F1C] font-semibold bg-[#056F1C]/8'
                        : 'text-gray-600 hover:text-[#056F1C]'
                      }`}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-h-[60vh] p-8">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
