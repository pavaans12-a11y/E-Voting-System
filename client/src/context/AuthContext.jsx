import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data.data)
          setToken(storedToken)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    validateToken()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  }

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp })
    const { token: newToken, ...userData } = res.data.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    return res.data
  }

  const register = async (name, email, phone, photo, password) => {
    const res = await api.post('/auth/register', { name, email, phone, photo, password })
    return res.data
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        verifyOtp,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
