'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { authAPI } from '@/lib/api'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const error = searchParams.get('error')
    const enrollId = searchParams.get('enroll')

    if (error) {
      setStatus('Authentication failed. Redirecting...')
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
      authAPI.me().then((res) => {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setStatus('Success! Redirecting...')
        if (enrollId) {
          router.push(`/payment/${enrollId}`)
        } else {
          router.push('/dashboard')
        }
      }).catch(() => {
        setStatus('Error fetching user. Redirecting...')
        setTimeout(() => router.push('/login'), 2000)
      })
    } else {
      setStatus('Invalid response. Redirecting...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
