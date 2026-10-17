import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { RATING_OPTIONS } from '@/lib/searchFilters'

export default function FilterSidebar({ filters, categories, onChange, onClear }) {
  const [min, setMin] = useState(filters.minPrice ?? '')
  const [max, setMax] = useState(filters.maxPrice ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    setMin(filters.minPrice ?? '')
    setMax(filters.maxPrice ?? '')
    setError('')
  }, [filters.minPrice, filters.maxPrice])

  const applyPrice = (event) => {
    event.preventDefault()
    const minPrice = min === '' ? null : Number(min)
    const maxPrice = max === '' ? null : Number(max)
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      setError('Giá thấp nhất phải nhỏ hơn giá cao nhất.')
      return
    }
    setError('')
    onChange({ minPrice, maxPrice })
  }

  const heading = 'mb-2 text-sm font-bold text-gray-900'
  const input = 'h-9 w-full rounded border border-gray-300 px-2 text-sm outline-none focus:border-[#056F1C]'
  const categoryList = [
    ...filters.category
      .filter((selected) => !categories.some((category) => category.name === selected))
      .map((name) => ({ name, count: 0 })),
    ...categories,
  ]
  const visibleCategories = filters.categoryFromHome && filters.category.length === 1
    ? categoryList.filter((category) => category.name === filters.category[0])
    : categoryList

  const toggleCategory = (name) => {
    const selected = new Set(filters.category)
    if (selected.has(name)) selected.delete(name)
    else selected.add(name)
    onChange({ category: [...selected] })
  }

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-lg border border-gray-200 bg-white p-5 lg:w-60 lg:self-start">
      {categoryList.length > 0 && (
        <section>
          <h2 className={heading}>Danh mục</h2>
          <div className="space-y-1 text-sm">
            {visibleCategories.map((category) => (
              <label
                key={category.name}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${filters.category.includes(category.name) ? 'font-semibold text-[#056F1C]' : 'text-gray-600 hover:text-[#056F1C]'}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category.name)}
                    onChange={() => toggleCategory(category.name)}
                    className="h-4 w-4 shrink-0 accent-[#056F1C]"
                  />
                  <span>{category.name}</span>
                </span>
                <span className="text-gray-400">{category.count}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className={heading}>Khoảng giá</h2>
        <form onSubmit={applyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={min} onChange={(event) => setMin(event.target.value.replace(/\D/g, ''))} placeholder="Từ" aria-label="Giá thấp nhất" className={input} />
            <span className="text-gray-400">-</span>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={max} onChange={(event) => setMax(event.target.value.replace(/\D/g, ''))} placeholder="Đến" aria-label="Giá cao nhất" className={input} />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded bg-[#056F1C] py-2 text-sm font-semibold text-white hover:bg-[#045517]">Áp dụng</button>
        </form>
      </section>

      <section>
        <h2 className={heading}>Đánh giá</h2>
        <div className="space-y-1">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              aria-pressed={filters.rating === rating}
              onClick={() => onChange({ rating: filters.rating === rating ? '' : rating })}
              className={`flex w-full items-center gap-1.5 text-sm ${filters.rating === rating ? 'font-semibold text-[#056F1C]' : 'text-gray-600 hover:text-[#056F1C]'}`}
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {rating === 5 ? '5 sao' : `Từ ${rating} sao trở lên`}
            </button>
          ))}
        </div>
      </section>

      <button type="button" onClick={onClear} className="w-full rounded border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
        Xóa bộ lọc
      </button>
    </aside>
  )
}
