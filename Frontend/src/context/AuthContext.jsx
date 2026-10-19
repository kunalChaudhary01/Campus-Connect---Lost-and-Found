import { createContext, useContext, useEffect, useState } from 'react'
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'campus_connect_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tokenAtStart = localStorage.getItem(TOKEN_KEY)
    if (!tokenAtStart) {
      setLoading(false)
      return
    }
    getMe()
      .then(({ data }) => {
        if (localStorage.getItem(TOKEN_KEY) === tokenAtStart) setUser(data.data.user)
      })
      .catch(() => {
        if (localStorage.getItem(TOKEN_KEY) === tokenAtStart) {
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Bug 7 fix: clear user when API interceptor forces a logout on 401
  useEffect(() => {
    const onExpired = () => { setUser(null) }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const establishSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.data.token)
    setUser(data.data.user)
    setLoading(false)
  }

  const login = async (payload) => { const { data } = await loginRequest(payload); establishSession(data) }
  const register = async (payload) => { const { data } = await registerRequest(payload); establishSession(data) }
  const logout = async () => {
    try { await logoutRequest() } finally {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
