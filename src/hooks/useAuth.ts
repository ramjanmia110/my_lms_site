'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { authAPI } from '@/lib/api'

export function useAuth(requireAuth = false) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, setUser, setLoading, setAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      if (!user) setLoading(true)
      authAPI.me()
        .then((res) => {
          if (localStorage.getItem('access_token')) {
            setUser(res.data.user)
            setAuthenticated(true)
          }
        })
        .catch(() => {
          // Only treat the session as expired if the interceptor actually
          // invalidated it (token removed). Transient backend errors (timeouts,
          // 5xx on the single-threaded dev server) must not log the user out.
          if (!localStorage.getItem('access_token')) {
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            setUser(null)
            if (requireAuth) router.push('/login')
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
      setUser(null)
      if (requireAuth) router.push('/login')
    }
  }, [])

  return { user, isAuthenticated, isLoading, logout, setUser }
}
