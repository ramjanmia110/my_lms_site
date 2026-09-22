'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Github, Lock, Mail } from 'lucide-react'
import { Learn2EarnLogo } from '@/components/ui/logo'
import { AuthModeToggle } from '@/components/auth/AuthModeToggle'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { authAPI } from '@/lib/api'
import { getPendingEnrollment, clearPendingEnrollment } from '@/lib/pending-enrollment'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })

  const enrollId = searchParams.get('enroll')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const emailEl = document.getElementById('email') as HTMLInputElement | null
      const passwordEl = document.getElementById('password') as HTMLInputElement | null
      const payload = {
        email: (emailEl?.value ?? form.email).trim(),
        password: passwordEl?.value ?? form.password,
        remember: form.remember,
      }
      const res = await authAPI.login(payload)
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      toast.success('Welcome back!')
      const pending = getPendingEnrollment()
      if (enrollId) {
        clearPendingEnrollment()
        router.push(`/payment/${enrollId}`)
      } else if (pending?.redirect_after_auth) {
        clearPendingEnrollment()
        router.push(pending.redirect_after_auth)
      } else {
        router.push(redirectTo)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')

  const handleGoogleLogin = () => {
    const enrollParam = enrollId ? `?enroll=${enrollId}` : ''
    window.location.href = `${backendBase}/auth/google/redirect${enrollParam}`
  }

  const handleGithubLogin = () => {
    window.location.href = `${backendBase}/auth/github/redirect`
  }

  return (
    <AuthSplitLayout variant="login">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
        {/* logo + tagline */}
        <div className="mb-7 text-center">
          <div className="flex justify-center mb-2">
            <Learn2EarnLogo variant="dark" size="md" />
          </div>
          <p className="text-[11px] font-medium tracking-wide text-[#A9B3C8]">Learn Today, Earn Tomorrow</p>
        </div>

        {/* heading */}
        <div className="mb-5 text-center">
          <h1 className="text-[22px] font-bold text-[#0F1B3D]">Sign In</h1>
          <p className="mt-1 text-[13px] text-[#6B7694]">Welcome back! Please sign in to continue.</p>
        </div>

        {/* toggle */}
        <AuthModeToggle active="login" enroll={enrollId} />

        {/* social buttons */}
        <div className="space-y-3 mb-5">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E0F4] bg-white py-2.5 px-4 text-sm font-medium text-[#0F1B3D] transition-all hover:border-[#6D3DF5]/30 hover:bg-[#F8F5FF] hover:shadow-sm"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={handleGithubLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E0F4] bg-white py-2.5 px-4 text-sm font-medium text-[#0F1B3D] transition-all hover:border-[#3478F6]/30 hover:bg-[#F0F6FF] hover:shadow-sm"
          >
            <Github className="h-[18px] w-[18px]" />
            Continue with GitHub
          </button>
        </div>

        {/* divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E0F4]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white/40 px-4 text-[11px] font-semibold uppercase tracking-widest text-[#A9B3C8] backdrop-blur-sm">
              or continue with email
            </span>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* email or username */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Email or Username</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email or username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onInput={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
                required
                className="w-full rounded-xl border border-[#F1EDF9] bg-white py-3 pl-11 pr-4 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onInput={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
                required
                className="w-full rounded-xl border border-[#F1EDF9] bg-white py-3 pl-11 pr-11 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9B3C8] transition-colors hover:text-[#6D3DF5]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* remember + forgot */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="h-4 w-4 rounded border-[#D5D0E8] bg-white accent-[#6D3DF5]"
              />
              <span className="text-[13px] text-[#6B7694]">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-[13px] font-semibold text-[#6D3DF5] transition-colors hover:text-[#5B2EE0]">
              Forgot password?
            </Link>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(109,61,245,0.45)] transition-all hover:shadow-[0_12px_32px_-6px_rgba(109,61,245,0.55)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 mt-1"
          >
            {isLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* bottom link */}
        <p className="mt-6 text-center text-[13px] text-[#6B7694]">
          Don&apos;t have an account?{' '}
          <Link
            href={enrollId ? `/signup?enroll=${enrollId}` : redirectTo !== '/dashboard' ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : '/signup'}
            className="font-semibold text-[#6D3DF5] transition-colors hover:text-[#5B2EE0]"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthSplitLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#6D3DF5] border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
