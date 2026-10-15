import { useCallback, useEffect, useState } from 'react'
import { getMockLiveSession } from '@/mocks/auction/sessionMock'

export default function useAuctionSession(sessionId) {
  const [session, setSession] = useState(() => getMockLiveSession(sessionId))

  useEffect(() => {
    const initialSession = getMockLiveSession(sessionId)
    setSession(initialSession)
    if (!initialSession || initialSession.status !== 'pending' || !initialSession.pendingEndTime) return undefined

    const updateStatus = () => {
      if (Date.now() >= new Date(initialSession.pendingEndTime).getTime()) {
        setSession((current) => current ? { ...current, status: 'active' } : current)
      }
    }

    updateStatus()
    const timer = setInterval(updateStatus, 1000)
    const updateOnVisibility = () => {
      if (document.visibilityState === 'visible') updateStatus()
    }
    document.addEventListener('visibilitychange', updateOnVisibility)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', updateOnVisibility)
    }
  }, [sessionId])

  const setRegistered = useCallback((isRegistered) => {
    setSession((current) => current ? { ...current, isRegistered } : current)
  }, [])

  return { session, setRegistered }
}
