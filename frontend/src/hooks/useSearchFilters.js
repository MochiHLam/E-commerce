import { useSearchParams } from 'react-router-dom'
import { parseFilters } from '@/lib/searchFilters'

export default function useSearchFilters() {
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params)

  const update = (patch) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (Array.isArray(value)) {
        next.delete(key)
        value.forEach((item) => next.append(key, String(item)))
      } else if (value === '' || value == null) next.delete(key)
      else next.set(key, String(value))
    }
    if ('category' in patch) next.delete('categoryFromHome')
    if (!('page' in patch)) next.delete('page')
    setParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (filters.q) next.set('q', filters.q)
    if (filters.shop) next.set('shop', filters.shop)
    setParams(next)
  }

  return { filters, queryString: params.toString(), update, clearFilters }
}
