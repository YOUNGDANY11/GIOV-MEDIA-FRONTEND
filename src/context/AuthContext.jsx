import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { tokenStorage } from '../services/storage'
import { authController } from '../controllers/authController'
import { userController } from '../controllers/userController'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    let alive = true

    const boot = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const profile = await userController.me()
        if (!alive) return
        setUser(profile)
      } catch {
        tokenStorage.clear()
        if (!alive) return
        setToken(null)
        setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [token])

  const login = useCallback(async ({ document, password }) => {
    const response = await authController.login({ document, password })
    if (!response?.token) {
      throw new Error('No se pudo iniciar sesión')
    }

    tokenStorage.set(response.token)
    setToken(response.token)
    const profile = await userController.me()
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(async (payload) => {
    await authController.register(payload)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const profile = await userController.me()
    setUser(profile)
    return profile
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refresh,
  }), [token, user, loading, login, register, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
