import { useCallback, useEffect, useState } from 'react'
import { getMockLiveSession } from '@/mocks/auction/sessionMock'

export default function useAuctionSession(sessionId) {
  const [session, setSession] = useState(() => getMockLiveSession(sessionId))

  useEffect(() => {
    const refreshSession = () => {
      setSession(getMockLiveSession(sessionId))
    }

    refreshSession()
    const timer = setInterval(refreshSession, 1000)
    const updateOnVisibility = () => {
      if (document.visibilityState === 'visible') refreshSession()
    }
    document.addEventListener('visibilitychange', updateOnVisibility)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', updateOnVisibility)
    }
  }, [sessionId])

  const setRegistered = useCallback((isRegistered, walletAvailable, registrationLimits) => {
    setSession((current) => current ? {
      ...current,
      isRegistered,
      walletAvailable: walletAvailable ?? current.walletAvailable,
      ...registrationLimits,
    } : current)
  }, [])

  return { session, setRegistered }
}
