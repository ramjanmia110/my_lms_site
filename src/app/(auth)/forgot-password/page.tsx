'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail, Send } from 'lucide-react'
import { Learn2EarnLogo } from '@/components/ui/logo'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#6D3DF5] border-t-transparent animate-spin" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}

function ForgotPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
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

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
                <Mail className="h-7 w-7 text-[#6D3DF5]" />
              </div>
              <h1 className="mb-2 text-xl font-bold text-[#0F1B3D]">Check your email</h1>
              <p className="mb-6 text-[13px] text-[#6B7694]">
                We&apos;ve sent a password reset link to <strong className="text-[#0F1B3D]">{email}</strong>
              </p>
              <Link href="/login" className="text-sm font-semibold text-[#6D3DF5] hover:text-[#5B2EE0] transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-1 text-xl font-bold text-[#0F1B3D]">Forgot password?</h1>
                <p className="text-[13px] text-[#6B7694]">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9B3C8]" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#E5E0F4] bg-[#F9F8FC] py-3 pl-11 pr-4 text-sm text-[#0F1B3D] placeholder-[#B0B9C9] outline-none transition-all focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/10"
                    />
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
                      Send Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[#A9B3C8] hover:text-[#0F1B3D] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
