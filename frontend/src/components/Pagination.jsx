import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export function getPageItems(current, total) {
  const size = Math.min(5, total)
  const start = Math.min(Math.max(current - 2, 1), total - size + 1)
  const pages = new Set([1, total])
  for (let page = start; page < start + size; page++) pages.add(page)

  const sorted = [...pages].sort((first, second) => first - second)
  const result = []
  sorted.forEach((page, index) => {
    if (index > 0) {
      const gap = page - sorted[index - 1]
      if (gap === 2) result.push(page - 1)
      else if (gap > 2) result.push('...')
    }
    result.push(page)
  })
  return result
}

export default function Pagination({ page, totalPages, onChange, label = 'Phân trang' }) {
  const navClass =
    'p-1.5 text-gray-900 hover:text-[#056F1C] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-gray-900'

  return (
    <nav aria-label={label} className="mt-4 flex items-center justify-center gap-1 text-sm font-bold">
      <button type="button" aria-label="Trang đầu" disabled={page === 1} onClick={() => onChange(1)} className={navClass}>
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Trang trước" disabled={page === 1} onClick={() => onChange(page - 1)} className={navClass}>
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-900">...</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`min-w-[28px] px-1.5 py-1 ${item === page ? 'text-[#056F1C]' : 'text-gray-900 hover:text-[#056F1C]'}`}
          >
            {item}
          </button>
        ),
      )}

      <button type="button" aria-label="Trang sau" disabled={page === totalPages} onClick={() => onChange(page + 1)} className={navClass}>
        <ChevronRight className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Trang cuối" disabled={page === totalPages} onClick={() => onChange(totalPages)} className={navClass}>
        <ChevronsRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
