import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MOCK_ACCOUNTS } from '@/mocks/mockAccounts'

const STORAGE_KEY = 'auth_user'
const AuthContext = createContext(null)

function applyMockAccountDefaults(user) {
  if (!import.meta.env.DEV || !user) return user
  const mockAccount = MOCK_ACCOUNTS.find((account) => account.id === user.id)
  if (!mockAccount) return user

  const mockAddress = mockAccount.shippingAddresses?.find((address) => address.isDefault)
  const addresses = Array.isArray(user.shippingAddresses) && user.shippingAddresses.length > 0
    ? user.shippingAddresses.map((address) => address.isDefault && mockAddress ? {
        ...address,
        recipientName: address.recipientName || mockAddress.recipientName,
        phone: address.phone || mockAddress.phone,
        address: address.address || mockAddress.address,
      } : address)
    : mockAccount.shippingAddresses

  return {
    ...user,
    phone: user.phone || mockAccount.phone,
    address: user.address || mockAccount.address,
    ...(addresses ? { shippingAddresses: addresses } : {}),
  }
}

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? applyMockAccountDefaults(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const login = useCallback((nextUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } catch {
      // Keep the session in memory when storage is unavailable.
    }
    setUser(nextUser)
  }, [])

  const updateUser = useCallback((updates) => {
    if (!user) return
    const nextUser = { ...user, ...updates }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } catch {
      // Keep the updated profile in memory when storage is unavailable.
    }
    setUser(nextUser)
  }, [user])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // The in-memory session is still cleared below.
    }
    setUser(null)
  }, [])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setUser(readUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({ user, role: user?.role ?? 'guest', isLoggedIn: Boolean(user), login, updateUser, logout }),
    [user, login, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return context
}
