'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { Learn2EarnLogo } from '@/components/ui/logo'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#6D3DF5] border-t-transparent animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', password_confirmation: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await authAPI.resetPassword({ ...form, token })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8F6FF] px-5 py-10">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#3478F6]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#6D3DF5]/[0.05] blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[420px]">
        <div className="rounded-[20px] border border-[#E9E7F5] bg-white p-8 shadow-[0_20px_60px_-12px_rgba(109,61,245,0.12),0_8px_24px_-8px_rgba(15,27,61,0.08)]">
          {/* logo */}
          <div className="mb-7 text-center">
            <div className="mb-2 flex justify-center">
              <Learn2EarnLogo variant="dark" size="md" />
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#A9B3C8]">Learn Today, Earn Tomorrow</p>
          </div>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
              <ShieldCheck className="h-7 w-7 text-[#6D3DF5]" />
            </div>
            <h1 className="mb-1 text-xl font-bold text-[#0F1B3D]">Reset password</h1>
            <p className="text-[13px] text-[#6B7694]">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Email</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#E5E0F4] bg-[#F9F8FC] py-3 pl-11 pr-4 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">New Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#E5E0F4] bg-[#F9F8FC] py-3 pl-11 pr-11 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9B3C8] transition-colors hover:text-[#6D3DF5]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Confirm New Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#E5E0F4] bg-[#F9F8FC] py-3 pl-11 pr-11 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9B3C8] transition-colors hover:text-[#6D3DF5]">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(109,61,245,0.45)] transition-all hover:shadow-[0_12px_32px_-6px_rgba(109,61,245,0.55)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 mt-1"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[#A9B3C8] hover:text-[#0F1B3D] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
