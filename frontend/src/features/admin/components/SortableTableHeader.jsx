import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export function sortRows(rows, sortState, getValue) {
  if (!sortState) return rows

  const direction = sortState.direction === 'asc' ? 1 : -1
  return rows
    .map((row, index) => ({ row, index, value: getValue(row, sortState.key) }))
    .sort((first, second) => {
      if (first.value == null && second.value == null) return first.index - second.index
      if (first.value == null) return 1
      if (second.value == null) return -1

      const comparison = typeof first.value === 'number' && typeof second.value === 'number'
        ? first.value - second.value
        : String(first.value).localeCompare(String(second.value), 'vi', { numeric: true, sensitivity: 'base' })
      return comparison ? comparison * direction : first.index - second.index
    })
    .map(({ row }) => row)
}

export function SortableTableHeader({ label, sortKey, sortState, onSort, className = '' }) {
  const isActive = sortState?.key === sortKey
  const direction = isActive ? sortState.direction : null
  const SortIcon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown

  return (
    <th
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
      scope="col"
      className={className}
    >
      <button
        aria-label={`${label}, ${direction === 'asc' ? 'tăng dần' : direction === 'desc' ? 'giảm dần' : 'chưa sắp xếp'}. Nhấn để sắp xếp`}
        aria-pressed={isActive}
        className="inline-flex min-h-6 items-center gap-1.5 rounded-sm text-left transition hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        onClick={onSort}
        type="button"
      >
        {label}
        <SortIcon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-emerald-800' : 'text-gray-400'}`} />
      </button>
    </th>
  )
}

export function toggleSort(currentSort, key) {
  if (currentSort?.key !== key) return { key, direction: 'asc' }
  return { key, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' }
}
