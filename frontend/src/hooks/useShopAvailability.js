import { useEffect, useState } from 'react'
import { isSellerShopActive } from '@/mocks/seller'

export default function useShopAvailability(shopSlug) {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const refresh = (event) => {
      if (event?.detail?.shopSlug && event.detail.shopSlug !== shopSlug) return
      setVersion((version) => version + 1)
    }
    const refreshFromStorage = (event) => {
      if (!event.key || event.key === 'navishop.mockSeller.applications') refresh(event)
    }
    window.addEventListener('navishop:seller-application-updated', refresh)
    window.addEventListener('storage', refreshFromStorage)
    return () => {
      window.removeEventListener('navishop:seller-application-updated', refresh)
      window.removeEventListener('storage', refreshFromStorage)
    }
  }, [shopSlug])

  return shopSlug ? isSellerShopActive(shopSlug) : version
}
