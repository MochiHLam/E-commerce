import { X } from 'lucide-react'
import { formatVND } from '@/lib/format'

export default function ActiveFilterChips({ filters, onChange }) {
  const { category, minPrice, maxPrice, rating } = filters
  const chips = []

  category.forEach((name) => {
    chips.push({
      key: `category-${name}`,
      label: name,
      clear: { category: category.filter((selected) => selected !== name) },
    })
  })
  if (minPrice != null || maxPrice != null) {
    const label = minPrice != null && maxPrice != null
      ? `${formatVND(minPrice)} - ${formatVND(maxPrice)}`
      : minPrice != null ? `Từ ${formatVND(minPrice)}` : `Đến ${formatVND(maxPrice)}`
    chips.push({ key: 'price', label, clear: { minPrice: '', maxPrice: '' } })
  }
  if (rating) chips.push({ key: 'rating', label: rating === 5 ? '5 sao' : `Từ ${rating} sao`, clear: { rating: '' } })

  if (chips.length === 0) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-1.5 rounded-full border border-[#056F1C]/30 bg-[#E8F5EB] px-3 py-1 text-xs font-medium text-[#056F1C]">
          {chip.label}
          <button type="button" aria-label={`Bỏ lọc ${chip.label}`} onClick={() => onChange(chip.clear)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
