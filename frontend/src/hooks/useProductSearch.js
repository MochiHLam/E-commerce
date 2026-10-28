import { useEffect, useState } from 'react'
import { parseFilters } from '@/lib/searchFilters'
import { searchProducts } from '@/services/searchProducts'

export default function useProductSearch(queryString) {
  const [availabilityVersion, setAvailabilityVersion] = useState(0)
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
    const refresh = (event) => {
      if (event?.key && event.key !== 'navishop.mockSeller.applications') return
      setAvailabilityVersion((version) => version + 1)
    }
    window.addEventListener('navishop:seller-application-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('navishop:seller-application-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

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
  }, [availabilityVersion, queryString])

  return state
}
