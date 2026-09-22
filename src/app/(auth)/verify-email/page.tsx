'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus('success')
        toast.success('Email verified successfully!')
      })
      .catch(() => {
        setStatus('error')
        toast.error('Verification failed')
      })
  }, [token])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl text-center"
    >
      <Link href="/" className="inline-flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
          L
        </div>
        <span className="text-xl font-bold">
          <span className="text-gradient">Learn2</span>Earn
        </span>
      </Link>

      {status === 'loading' && (
        <div>
          <Loader2 className="w-16 h-16 animate-spin text-brand-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
          <p className="text-muted-foreground">Please wait while we verify your email address.</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
          <p className="text-muted-foreground mb-6">
            Your email has been successfully verified.
          </p>
          <Link href="/dashboard">
            <Button variant="gradient">Go to Dashboard</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div>
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
          <p className="text-muted-foreground mb-6">
            The verification link is invalid or expired.
          </p>
          <Link href="/login">
            <Button variant="gradient">Back to Login</Button>
          </Link>
        </div>
      )}
    </motion.div>
  )
}
