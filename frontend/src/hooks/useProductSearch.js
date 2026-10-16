import { useEffect, useState } from 'react'
import { parseFilters } from '@/lib/searchFilters'
import { searchProducts } from '@/services/searchProducts'

export default function useProductSearch(queryString) {
  const [state, setState] = useState({
    loading: true,
    error: '',
    items: [],
    total: 0,
    totalPages: 1,
    page: 1,
    categories: [],
    shops: [],
  })

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: '' }))

    searchProducts(parseFilters(new URLSearchParams(queryString)))
      .then((result) => {
        if (!cancelled) setState({ loading: false, error: '', ...result })
      })
      .catch((error) => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : 'Không thể tải kết quả tìm kiếm.',
            categories: [],
            shops: [],
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [queryString])

  return state
}
