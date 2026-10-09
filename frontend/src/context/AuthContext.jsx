import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'token'
const AuthContext = createContext(null)

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)

  const login = useCallback((newToken) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
    } catch {
      // Keep the session in memory when storage is unavailable.
    }
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // The in-memory session is still cleared below.
    }
    setToken(null)
  }, [])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === TOKEN_KEY) setToken(event.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({ token, isLoggedIn: Boolean(token), login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return context
}
