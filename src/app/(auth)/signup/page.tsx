'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen, Check, Eye, EyeOff, Github, GraduationCap, Lock, Mail, User } from 'lucide-react'
import { AuthModeToggle } from '@/components/auth/AuthModeToggle'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { authAPI } from '@/lib/api'
import { getPendingEnrollment, clearPendingEnrollment, savePendingEnrollment } from '@/lib/pending-enrollment'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'yopmail.com',
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'sharklasers.com',
  'trashmail.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'getnada.com',
  'mintemail.com',
  'mailnesia.com',
  'discard.email',
]

function validateEmail(email: string): string {
  if (!email) return 'Email address is required'
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address (e.g. name@gmail.com)'
  const domain = email.split('@')[1].toLowerCase()
  if (DISPOSABLE_DOMAINS.includes(domain)) return 'This email provider is not allowed. Please use a real email address.'
  return ''
}

function getPasswordStrength(pwd: string): { level: number; label: string; barClass: string; textClass: string } {
  if (!pwd) return { level: 0, label: '', barClass: '', textClass: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { level: 1, label: 'Weak', barClass: 'bg-red-400', textClass: 'text-red-500' }
  if (score <= 4) return { level: 2, label: 'Medium', barClass: 'bg-[#E07B22]', textClass: 'text-[#B9560D]' }
  return { level: 3, label: 'Strong', barClass: 'bg-[#3F8F5B]', textClass: 'text-[#2F7046]' }
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })

  const enrollId = searchParams.get('enroll')
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (enrollId) savePendingEnrollment({ id: Number(enrollId), title: '' })
  }, [enrollId])

  const emailError = form.email.trim() ? validateEmail(form.email.trim()) : ''
  const strength = getPasswordStrength(form.password)
  const showMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (emailError) {
      toast.error(emailError)
      return
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

setIsLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.confirmPassword,
        role: form.role,
      }

      const res = await authAPI.signup(payload)

      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      useAuthStore.getState().setUser(res.data.user)
      toast.success('Account created successfully!')
      const pendingEnrollment = getPendingEnrollment()
      const enrollIdFinal = enrollId || (pendingEnrollment?.course_id ? String(pendingEnrollment.course_id) : '')
      const pendingRedirect = pendingEnrollment?.redirect_after_auth
      if (enrollIdFinal) { clearPendingEnrollment(); router.push(`/student-information?courseId=${enrollIdFinal}`) }
      else if (pendingRedirect) { clearPendingEnrollment(); router.push(pendingRedirect) }
      else router.push(redirectTo)
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Signup failed'
      const errors = error.response?.data?.errors
      if (errors) {
        const firstError = (Object.values(errors as Record<string, string[]>) as string[][])[0]?.[0]
        toast.error(firstError || msg)
      } else toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')
  const handleGoogleLogin = () => {
    window.location.href = `${backendBase}/auth/google/redirect${enrollId ? `?enroll=${enrollId}` : ''}`
  }
  const handleGithubLogin = () => {
    window.location.href = `${backendBase}/auth/github/redirect`
  }

  return (
    <AuthSplitLayout variant="signup">
      <div className="w-full">
        {/* logo + tagline */}
        <div className="mb-7 text-center">
          <div className="flex justify-center mb-2">
            <Image
              src="https://plain-apac-prod-public.komododecks.com/202609/24/QvqonU8iVHyTE9fh3hih/image.png"
              alt="Learn2Earn"
              width={192}
              height={58}
              className="h-10 w-auto object-contain drop-shadow-sm sm:h-11"
            />
          </div>
          <p className="text-[11px] font-medium tracking-wide text-[#8C857C]">Learn Today, Earn Tomorrow</p>
        </div>

        {/* heading */}
        <div className="mb-5 text-center">
          <h1 className="text-[22px] font-bold text-[#153B2E]">Create your account</h1>
          <p className="mt-1 text-[13px] text-[#667269]">Join our community and start your journey.</p>
        </div>

        {/* toggle */}
        <AuthModeToggle active="signup" enroll={enrollId} />

        {/* social buttons */}
        <div className="space-y-3 mb-5">
          <button onClick={handleGoogleLogin} className="auth-social-button flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E0D7] bg-white py-2.5 px-4 text-sm font-medium text-[#153B2E] transition-all hover:border-[#D8CEC1] hover:bg-[#FFFCF8] hover:shadow-sm">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button onClick={handleGithubLogin} className="auth-social-button flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E0D7] bg-white py-2.5 px-4 text-sm font-medium text-[#153B2E] transition-all hover:border-[#D8CEC1] hover:bg-[#FAFCF9] hover:shadow-sm">
            <Github className="h-[18px] w-[18px]" />
            Continue with GitHub
          </button>
        </div>

        {/* divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E7E0D7]" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white/40 px-4 text-[11px] font-semibold uppercase tracking-widest text-[#8C857C] backdrop-blur-sm">or continue with email</span>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* full name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C857C]" />
              <input id="name" type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="auth-input w-full rounded-xl border border-[#E7E0D7] bg-[#FBF9F5] py-3 pl-11 pr-4 text-sm text-[#153B2E] placeholder-[#AAA299] outline-none transition-all focus:border-[#E07B22] focus:bg-white focus:ring-2 focus:ring-[#E07B22]/10" />
            </div>
          </div>

          {/* role */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Sign up as</label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: 'student', label: 'Student', caption: 'Learn and earn certificates', icon: GraduationCap },
                  { value: 'instructor', label: 'Instructor', caption: 'Create and teach courses', icon: BookOpen },
                ] as const
              ).map((r) => {
                const Icon = r.icon
                const selected = form.role === r.value
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    aria-pressed={selected}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all focus:outline-none focus:ring-2 ${
                      selected
                        ? 'border-[#E07B22] bg-[#FFF4E8] ring-[#E07B22]/10 focus:border-[#E07B22] focus:ring-[#E07B22]/10'
                        : 'border-[#E7E0D7] bg-[#FBF9F5] hover:border-[#E07B22]/30 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected ? 'bg-[#E07B22] text-white' : 'bg-[#F7EDE1] text-[#E07B22]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[13.5px] font-semibold ${selected ? 'text-[#B9560D]' : 'text-[#153B2E]'}`}>{r.label}</span>
                      <span className="block truncate text-[10.5px] text-[#8C857C]">{r.caption}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Email Address</label>
            <div className="relative">
              <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${emailError ? 'text-red-400' : 'text-[#8C857C]'}`} />
              <input id="email" type="email" placeholder="Enter your email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(emailError)} required
                className={`auth-input w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-[#153B2E] placeholder-[#AAA299] outline-none transition-all focus:bg-white focus:ring-2 ${
                  emailError
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-[#E7E0D7] bg-[#FBF9F5] focus:border-[#E07B22] focus:ring-[#E07B22]/10'
                }`} />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {emailError && (
                <motion.p
                  key={emailError}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                  className="mt-1.5 text-[12px] font-medium text-red-500"
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C857C]" />
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                className="auth-input w-full rounded-xl border border-[#E7E0D7] bg-[#FBF9F5] py-3 pl-11 pr-11 text-sm text-[#153B2E] placeholder-[#AAA299] outline-none transition-all focus:border-[#E07B22] focus:bg-white focus:ring-2 focus:ring-[#E07B22]/10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C857C] transition-colors hover:text-[#E07B22]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {strength.level > 0 && (
              <div className="mt-2">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[#E7E0D7]">
                      <motion.div
                        initial={false}
                        animate={{ width: i < strength.level ? '100%' : '0%' }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-colors duration-300 ${strength.barClass}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-[#667269]">
                  Password strength:{' '}
                  <span className={`font-bold ${strength.textClass}`}>{strength.label}</span>
                  <AnimatePresence initial={false}>
                    {strength.level === 3 && (
                      <motion.span
                        key="strong-check"
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                        className="inline-flex text-[#3F8F5B]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </p>
              </div>
            )}
          </div>

          {/* confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Confirm Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C857C]" />
              <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required
                className="auth-input w-full rounded-xl border border-[#E7E0D7] bg-[#FBF9F5] py-3 pl-11 pr-11 text-sm text-[#153B2E] placeholder-[#AAA299] outline-none transition-all focus:border-[#E07B22] focus:bg-white focus:ring-2 focus:ring-[#E07B22]/10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C857C] transition-colors hover:text-[#E07B22]">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {showMismatch && (
                <motion.p
                  key="password-mismatch"
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                  className="mt-1.5 text-[12px] font-medium text-red-500"
                >
                  Passwords do not match
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* terms checkbox */}
          <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#D8CEC1] bg-white accent-[#E07B22]"
            />
            <span className="text-[12px] leading-snug text-[#667269]">
              I agree to the{' '}
              <Link href="/terms" className="font-semibold text-[#E07B22] hover:underline">Terms &amp; Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-semibold text-[#E07B22] hover:underline">Privacy Policy</Link>
            </span>
          </label>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-primary-button relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#E07B22] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(224,123,34,0.45)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#C96818] hover:shadow-[0_12px_32px_-6px_rgba(224,123,34,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* bottom link */}
        <p className="mt-6 text-center text-[13px] text-[#667269]">
          Already have an account?{' '}
          <Link href={searchParams.get('enroll') ? `/login?enroll=${searchParams.get('enroll')}` : '/login'}
            className="font-semibold text-[#E07B22] transition-colors hover:text-[#B9560D]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#E07B22] border-t-transparent animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
