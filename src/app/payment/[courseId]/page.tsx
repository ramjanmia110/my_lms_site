'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Loader2, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Lock, Wallet,
  User, Mail, Info, Play, Sparkles, BookOpen, Clock, Star, Layers,
  Award, BadgeCheck, FileText, Globe, MessagesSquare, LogIn, UserPlus,
  Briefcase, Calendar, Users, Check, PenLine, ClipboardList,
  ShieldCheck, MoreHorizontal, BarChart3, Box, Tag,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { paymentsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import CheckoutStepper from '@/components/payment/CheckoutStepper'
import CheckoutOrderSummary, { type OrderCourse, type OrderPricing } from '@/components/payment/CheckoutOrderSummary'
import type { PaymentMethodOption } from '@/components/payment/PaymentMethodGrid'

interface PreviewData {
  course: OrderCourse
  already_enrolled: boolean
  currency: string
  pricing: OrderPricing
  payment_methods: PaymentMethodOption[]
  currency_note?: string
}

interface OrderData {
  id: number
  order_number: string
  currency: string
  subtotal: number
  discount: number
  coupon_code?: string | null
  tax: number
  fee: number
  total: number
  status: string
  expires_at?: string | null
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' }

/* Light background: clean white with soft blurred glow shapes in purple/blue/green corners */
function CosmicBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#FAF8FF_30%,#F4F7FF_64%,#F4FCF9_100%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#F3EEFF] blur-[120px]" />
      <div className="absolute right-[-8%] top-[16%] h-96 w-96 rounded-full bg-[#EEF4FF] blur-[110px]" />
      <div className="absolute left-[26%] bottom-[-12%] h-80 w-80 rounded-full bg-[#ECFBF5] blur-[110px]" />
      <div className="absolute right-[24%] bottom-[-10%] h-72 w-72 rounded-full bg-[#F3EEFF] blur-[100px]" />
      {/* subtle dotted texture */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 12% 18%, rgba(109,61,245,0.14), transparent),' +
            'radial-gradient(1px 1px at 28% 8%, rgba(52,120,246,0.12), transparent),' +
            'radial-gradient(2px 2px at 44% 22%, rgba(109,61,245,0.1), transparent),' +
            'radial-gradient(1px 1px at 60% 12%, rgba(52,120,246,0.1), transparent),' +
            'radial-gradient(1px 1px at 74% 28%, rgba(24,168,120,0.12), transparent),' +
            'radial-gradient(2px 2px at 88% 15%, rgba(109,61,245,0.1), transparent),' +
            'radial-gradient(1px 1px at 8% 42%, rgba(24,168,120,0.1), transparent),' +
            'radial-gradient(1px 1px at 92% 44%, rgba(52,120,246,0.1), transparent),' +
            'radial-gradient(1px 1px at 35% 56%, rgba(109,61,245,0.08), transparent),' +
            'radial-gradient(1.5px 1.5px at 66% 60%, rgba(52,120,246,0.08), transparent)',
        }}
      />
    </div>
  )
}

/* Payment brand marks — realistic wordmarks (bKash pink, Nagad orange, SSLCommerz lock) */
function PaymentBrandLogo({ brand, selected }: { brand: string; selected?: boolean }) {
  const [broken, setBroken] = useState(false)
  const ring = selected ? 'ring-2 ring-[#6D3DF5]/40' : ''

  if (brand === 'bkash') {
    return (
      <span
        className={cn(
          'flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#F2D2E2] bg-white px-2 shadow-[0_10px_22px_-10px_rgba(226,19,110,0.6)] transition-transform duration-200 group-hover:scale-[1.05]',
          ring
        )}
      >
        {broken ? (
          <span className="text-[14px] font-extrabold italic leading-none tracking-tight text-[#E2136E]">
            b<span className="text-[#F08AB8]">K</span>ash
          </span>
        ) : (
          <img
            src="https://plain-apac-prod-public.komododecks.com/202609/09/Fd39tF2BiF7kogmvtmxm/image.png"
            alt="bKash"
            onError={() => setBroken(true)}
            className="h-full w-full object-contain"
          />
        )}
      </span>
    )
  }
  if (brand === 'nagad') {
    return (
      <span
        className={cn(
          'flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#F5DCC5] bg-white px-2 shadow-[0_10px_22px_-10px_rgba(246,130,31,0.6)] transition-transform duration-200 group-hover:scale-[1.05]',
          ring
        )}
      >
        {broken ? (
          <span className="text-[13px] font-extrabold leading-none tracking-wider text-[#F6821F]">
            nagad<span className="text-[#FFB27D]">.</span>
          </span>
        ) : (
          <img
            src="https://plain-apac-prod-public.komododecks.com/202609/09/6Ysg1rb9QSLcy1djlLd1/image.png"
            alt="Nagad"
            onError={() => setBroken(true)}
            className="h-full w-full object-contain"
          />
        )}
      </span>
    )
  }
  if (brand === 'ssl') {
    return (
      <span
        className={cn(
          'flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-[#D9E2F0] bg-white px-2.5 shadow-[0_8px_18px_-8px_rgba(27,43,91,0.35)] transition-transform duration-200 group-hover:scale-[1.05]',
          selected && 'ring-2 ring-[#6D3DF5]/40'
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00B36B] shadow-[0_4px_10px_-3px_rgba(0,179,107,0.6)]">
          <Lock className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-[11px] font-extrabold leading-none tracking-tight text-[#1B2B5B]">
          ssl<span className="text-[#3D5A9B]">commerz</span>
        </span>
      </span>
    )
  }
  return (
    <span
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_8px_18px_-8px_rgba(109,61,245,0.6)]',
        selected && 'ring-2 ring-[#6D3DF5]/40'
      )}
    >
      <Wallet className="h-5 w-5 text-white" />
    </span>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = Number(params.courseId)
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  const qCoupon = searchParams.get('coupon') || ''

  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [termChecked, setTermChecked] = useState(false)
  const [couponInput, setCouponInput] = useState(qCoupon)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(qCoupon || null)
  const [couponBusy, setCouponBusy] = useState(false)
  const previewLoadedRef = useRef(false)

  const [order, setOrder] = useState<OrderData | null>(null)
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)
  const [method, setMethod] = useState<string>('')

  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({})
  const [couponError, setCouponError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setStudentName((v) => v || user.name || '')
      setStudentEmail((v) => v || user.email || '')
    }
  }, [user])

  const methods = preview?.payment_methods ?? []
  const symbol = CURRENCY_SYMBOL[preview?.currency || 'BDT'] || '৳'
  const activeMethod = methods.find((m) => (m.method || m.gateway) === method)

  const loadPreview = useCallback(async (coupon?: string | null) => {
    setLoadingPreview(true)
    setPreviewError(null)
    try {
      const res = await paymentsAPI.checkoutPreview(courseId, coupon || undefined)
      const next = res.data?.data as PreviewData
      setPreview(next)
      previewLoadedRef.current = true
      setAppliedCoupon(next.pricing.coupon_code || null)
      if (next.payment_methods?.length) {
        const preferred = next.payment_methods.find((m) => m.is_default)?.method
          || next.payment_methods.find((m) => m.is_default)?.gateway
          || next.payment_methods[0].method
          || next.payment_methods[0].gateway
        setMethod((prev) => (next.payment_methods.some((m) => (m.method || m.gateway) === prev) ? prev : preferred))
      }
      if (next.already_enrolled) {
        toast.success('You already have access to this course.')
      }
    } catch (err: any) {
      let msg = err?.response?.data?.message || err?.message || 'Could not load checkout.'
      const errors = err?.response?.data?.errors
      if (errors?.course_id?.length) {
        msg = 'This course is not available for checkout. It may not be published yet.'
      }
      if (!previewLoadedRef.current) setPreviewError(msg)
      throw err
    } finally {
      setLoadingPreview(false)
    }
  }, [courseId])

  useEffect(() => {
    const s = searchParams.get('step')
    if (s === 'payment') setStep(3)
    else if (s === 'review') setStep(2)
    else if (s === 'details' || s === 'course') setStep(1)
    if (courseId && isAuthenticated) loadPreview(couponInput).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isAuthenticated])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/signup?enroll=${courseId}`)
    }
  }, [authLoading, isAuthenticated, courseId, router])

  const changeStep = (next: 1 | 2 | 3 | 4) => {
    setStep(next)
    router.replace(`/payment/${courseId}?step=${next === 1 ? 'details' : next === 2 ? 'review' : next === 3 ? 'payment' : 'success'}`, { scroll: false })
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    setCouponError(null)
    try {
      await loadPreview(code)
      setCouponInput('')
      toast.success('Coupon applied.')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired coupon.'
      setCouponError(msg)
      toast.error(msg)
    } finally {
      setCouponBusy(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setCouponBusy(true)
    setCouponError(null)
    try {
      await loadPreview(null)
      setCouponInput('')
    } catch {
      toast.error('Could not refresh pricing.')
    } finally {
      setCouponBusy(false)
    }
  }

  const validateDetails = (): boolean => {
    const errs: { name?: string; email?: string } = {}
    if (!studentName.trim()) errs.name = 'Full name is required.'
    if (!studentEmail.trim()) errs.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) errs.email = 'Enter a valid email address.'
    setFieldErrors(errs)
    return !errs.name && !errs.email
  }

  const handleContinue = () => {
    if (!termChecked) {
      toast.error('Please accept the Terms & Conditions to continue.')
      return
    }
    if (!validateDetails()) return
    changeStep(2)
  }

  const handleStartPayment = () => {
    if (!termChecked) { toast.error('Please confirm the terms & refund policy to continue.'); return }
    if (!method) { toast.error('Please select a payment method.'); return }
    createOrderAndPay()
  }

  const createOrderAndPay = async () => {
    if (creating || paying) return
    setCreating(true)
    try {
      const res = await paymentsAPI.createOrder(courseId, appliedCoupon || undefined)
      const nextOrder = res.data?.data?.order as OrderData
      setOrder(nextOrder)
      await doPay(nextOrder)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Could not start checkout.'
      if (msg.toLowerCase().includes('already enrolled')) {
        toast.success('You already have access to this course.')
        router.push('/dashboard/courses')
      } else {
        toast.error(msg)
      }
      setCreating(false)
    }
  }

  const doPay = async (targetOrder: OrderData) => {
    setPaying(true)
    try {
      const res = await paymentsAPI.payOrder(targetOrder.id, method)
      const gate = res.data?.data?.gateway || {}
      const orderStatus = res.data?.data?.order?.status || res.data?.data?.status || ''
      const gateSucceeded = ['paid', 'completed', 'fulfilled', 'successful', 'success'].includes(String(orderStatus)) ||
        ['success', 'paid', 'completed'].includes(String(gate.status))
      const redirectUrl = gate.redirect_url || gate.complete_url
      if (!redirectUrl && gateSucceeded) {
        setOrder(targetOrder)
        changeStep(4)
        setPaying(false)
        toast.success('Payment successful! Your enrollment is complete.')
        return
      }
      if (redirectUrl) {
        try {
          const same = new URL(redirectUrl, window.location.origin)
          if (same.origin === window.location.origin) {
            router.push(`${same.pathname}${same.search}`)
            return
          }
        } catch { /* external URL — fall through */ }
        window.location.href = redirectUrl
        return
      }
      toast.error('Gateway did not return a payment URL. Try another method.')
      setPaying(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Payment initiation failed.')
      setPaying(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shadow-lg shadow-[#6D3DF5]/30">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          <span className="text-sm text-[#536078] font-medium">Preparing secure checkout...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-[#E9E7F5] rounded-3xl p-8 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.3)] text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shadow-lg shadow-[#6D3DF5]/30">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#0F1B3D]">Create your account to enroll</h2>
            <p className="text-sm text-[#536078]">Taking you to the signup page — you&apos;ll continue to your student information after that.</p>
            <div className="mt-2 flex items-center justify-center gap-3 text-sm">
              <a href={`/signup?enroll=${courseId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] px-4 py-2.5 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(109,61,245,0.7)] transition-all hover:brightness-110">
                <UserPlus className="h-4 w-4" /> Create account
              </a>
              <a href={`/login?enroll=${courseId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E9E7F5] px-4 py-2.5 font-semibold text-[#0F1B3D] transition-all hover:border-[#6D3DF5]/40">
                <LogIn className="h-4 w-4 text-[#6D3DF5]" /> Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadingPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] flex items-center justify-center shadow-lg shadow-[#6D3DF5]/30">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          <span className="text-sm text-[#536078] font-medium">Preparing secure checkout...</span>
        </div>
      </div>
    )
  }

  if (previewError || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#E11D48]" />
          </div>
          <h2 className="text-lg font-bold text-[#0F1B3D] mb-1">Checkout unavailable</h2>
          <p className="text-sm text-[#536078] mb-5">{previewError || 'Course is not available for purchase.'}</p>
          <Link href="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D3DF5] hover:text-[#5B2EE0]">
            <ArrowLeft className="w-4 h-4" /> Browse courses
          </Link>
        </div>
      </div>
    )
  }

  if (preview.already_enrolled) {
    const courseSlug = preview.course.slug || ''
    const myCourseUrl = courseSlug ? `/courses/${courseSlug}` : '/dashboard/courses'
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_16px_40px_-16px_rgba(24,168,120,0.5)]">
            <CheckCircle className="w-10 h-10 text-[#18A878]" />
          </div>
          <h1 className="text-xl font-bold text-[#0F1B3D] mb-2">You already have access to this course.</h1>
          <p className="text-sm text-[#536078] mb-6">
            You can jump straight back into <span className="text-[#0F1B3D] font-semibold">{preview.course.title}</span> or keep exploring.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={myCourseUrl}
              className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]">
              <Play className="w-4 h-4" /> Start Learning
            </Link>
            <Link href="/dashboard/courses"
              className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              Continue Learning
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <CosmicBackdrop />

      <div className="relative max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push(preview.course.slug ? `/courses/${preview.course.slug}` : '/dashboard/courses')}
            className="inline-flex items-center gap-1.5 text-sm text-[#536078] hover:text-[#0F1B3D] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to course
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#18A878] font-semibold bg-[#ECFBF5] border border-[#18A878]/25 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Secure Checkout
          </span>
        </div>

        <div className="rounded-3xl border border-[#E9E7F5] bg-white p-5 sm:p-6 mb-8 shadow-[0_16px_40px_-24px_rgba(15,27,61,0.35)]">
          <CheckoutStepper current={step} />
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* ===== LEFT — Student Information (light card) ===== */}
            <div className="lg:col-span-7 h-full">
              <div className="flex h-full flex-col">
                {/* Student Information card */}
                <div className="relative flex-1 overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 sm:p-7 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

                  <div className="relative">
                    {/* header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_10px_24px_-10px_rgba(109,61,245,0.7)]">
                          <User className="h-5 w-5 text-white" />
                        </span>
                        <div>
                          <h2 className="text-lg font-bold text-[#0F1B3D] leading-tight">Student Information</h2>
                          <p className="mt-0.5 text-[13px] text-[#536078]">Enrollment &amp; billing contact</p>
                        </div>
                      </div>
                      <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-[#6D3DF5]" />
                    </div>

                    {/* fields */}
                    <div className="mt-7 grid grid-cols-1 gap-4">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#536078]">
                          <User className="h-3.5 w-3.5 text-[#6D3DF5]" /> Full Name <span className="text-[#E5484D]">*</span>
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => { setStudentName(e.target.value); if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: undefined })) }}
                          placeholder="Enter your full name"
                          className={cn(
                            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0F1B3D] placeholder-[#A9B3C8] outline-none transition-all',
                            fieldErrors.name
                              ? 'border-[#E5484D] focus:ring-2 focus:ring-[#E5484D]/15'
                              : 'border-[#E9E7F5] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15'
                          )}
                        />
                        {fieldErrors.name && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#E5484D]">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.name}
                          </p>
                        )}
                          </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#536078]">
                          <Mail className="h-3.5 w-3.5 text-[#6D3DF5]" /> Email Address <span className="text-[#E5484D]">*</span>
                        </label>
                        <input
                          type="email"
                          value={studentEmail}
                          onChange={(e) => { setStudentEmail(e.target.value); if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined })) }}
                          placeholder="you@example.com"
                          className={cn(
                            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0F1B3D] placeholder-[#A9B3C8] outline-none transition-all',
                            fieldErrors.email
                              ? 'border-[#E5484D] focus:ring-2 focus:ring-[#E5484D]/15'
                              : 'border-[#E9E7F5] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15'
                          )}
                        />
                        {fieldErrors.email && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#E5484D]">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* info note */}
                    <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#A9B3C8]">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3478F6]" />
                      The receipt will be sent to this email. Billing details come from your Learn2Earn account.
                    </p>
                  </div>
                </div>

                {/* Agree to terms */}
                <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#E9E7F5] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(15,27,61,0.25)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/60 to-transparent" />
                  <label className="flex items-start gap-3.5 cursor-pointer select-none group">
                    <span
                      role="checkbox"
                      aria-checked={termChecked}
                      tabIndex={0}
                      onClick={() => setTermChecked(!termChecked)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTermChecked(!termChecked) } }}
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 group-hover:shadow-[0_0_0_4px_rgba(109,61,245,0.15)]',
                        termChecked
                          ? 'border-[#6D3DF5] bg-[#6D3DF5] shadow-[0_4px_14px_-2px_rgba(109,61,245,0.6)]'
                          : 'border-[#C3BDDC] bg-white'
                      )}
                    >
                      {termChecked && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                    </span>
                    <span className="text-xs leading-relaxed text-[#536078]">
                      I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Terms &amp; Conditions</a> and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Privacy Policy</a> of Learn2Earn.
                    </span>
                  </label>
                </div>

                {/* CTA */}
                <button onClick={handleContinue} disabled={creating}
                  className="group mt-5">
                  <span className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] py-4 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(109,61,245,0.6)] transition-all hover:shadow-[0_22px_50px_-12px_rgba(109,61,245,0.75)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100">
                    Continue to Order Review
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>

            {/* ===== RIGHT — Order Summary (light card) ===== */}
            <div className="lg:col-span-5 h-full">
              {/* mobile toggle */}
              <button
                onClick={() => setDetailsOpen((o) => !o)}
                className="lg:hidden mb-3 flex w-full items-center justify-between rounded-2xl border border-[#E9E7F5] bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,27,61,0.3)]"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#0F1B3D]">
                  <FileText className="h-4 w-4 text-[#6D3DF5]" /> Order Summary
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#0F1B3D]">{symbol}{Number(preview.pricing.total).toFixed(2)}</span>
                  {detailsOpen ? <ChevronUp className="h-4 w-4 text-[#536078]" /> : <ChevronDown className="h-4 w-4 text-[#536078]" />}
                </span>
              </button>

              <div className={cn('h-full lg:block', detailsOpen ? 'block' : 'hidden')}>
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
                <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

                <div className="relative flex flex-1 flex-col">
                  {/* header */}
                  <div className="flex items-center justify-between pb-4">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D3DF5]">
                      <FileText className="h-4 w-4" /> Order Summary
                    </span>
                    <div className="relative">
                      <button onClick={() => setMenuOpen((o) => !o)} className="p-1 text-[#A9B3C8] transition-colors hover:text-[#0F1B3D]" aria-label="More options">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[#E9E7F5] bg-white shadow-[0_16px_40px_-16px_rgba(15,27,61,0.4)]">
                            <button
                              onClick={() => {
                                setMenuOpen(false)
                                const slug = preview.course.slug
                                router.push(slug ? `/course/${slug}` : '/courses')
                              }}
                              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-[#0F1B3D] transition-colors hover:bg-[#F9F7FF]"
                            >
                              <ArrowLeft className="h-3.5 w-3.5 text-[#6D3DF5]" /> Back to course
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* course mini-card */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)]">
                      {preview.course.thumbnail ? (
                        <img src={preview.course.thumbnail} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <Box className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0F1B3D] leading-snug line-clamp-2">{preview.course.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#536078]">
                        <User className="h-3 w-3 shrink-0 text-[#3478F6]" />
                        <span className="truncate font-semibold">{preview.course.instructor?.name || 'Learn2Earn'} Instructor</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

                  {/* billing info (Details step — differs from Course step) */}
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                      <span className="flex items-center gap-2 text-[#536078]"><User className="h-3.5 w-3.5 text-[#3478F6]" /> Billed To</span>
                      <span className="truncate font-semibold text-[#0F1B3D]">{studentEmail || user?.email || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                      <span className="flex items-center gap-2 text-[#536078]"><Wallet className="h-3.5 w-3.5 text-[#3478F6]" /> Payment Method</span>
                      <span className="font-semibold text-[#0F1B3D]">SSLCommerz</span>
                    </div>
                    {Number(preview.pricing.discount || 0) > 0 && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#18A878]/25 bg-[#ECFBF5] px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[#0F1B3D]"><Check className="h-3.5 w-3.5 text-[#18A878]" /> Coupon Applied</span>
                        <span className="font-semibold text-[#18A878]">-{symbol}{Number(preview.pricing.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

                  {/* pricing */}
                  <div className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#536078]">Course Price</span>
                      <span className="font-semibold text-[#0F1B3D]">{symbol}{Number(preview.pricing.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(preview.pricing.discount || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#536078]">Discount</span>
                        <span className="font-semibold text-[#18A878]">-{symbol}{Number(preview.pricing.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-[#E9E7F5] pt-3">
                      <span className="font-bold text-[#0F1B3D]">Total</span>
                      <span className="text-2xl font-extrabold tracking-tight text-[#6D3DF5]">
                        {symbol}{Number(preview.pricing.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* coupon */}
                  {appliedCoupon && Number(preview.pricing.discount || 0) > 0 ? (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#18A878]/30 bg-[#ECFBF5] px-3.5 py-2.5">
                      <span className="text-sm font-bold text-[#18A878]">+ {appliedCoupon}</span>
                      <button onClick={handleRemoveCoupon} className="text-xs font-medium text-[#536078] hover:text-[#E5484D]">Remove</button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#536078]">
                        <Tag className="h-3.5 w-3.5 text-[#6D3DF5]" /> Enter coupon code
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); if (couponError) setCouponError(null) }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Enter coupon code"
                          className={cn(
                            'min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm text-[#0F1B3D] uppercase placeholder-[#A9B3C8] outline-none transition-all',
                            couponError
                              ? 'border-[#E5484D] focus:ring-2 focus:ring-[#E5484D]/15'
                              : 'border-[#E9E7F5] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15'
                          )}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponBusy || !couponInput.trim()}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(109,61,245,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {couponBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#E5484D]">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* secure info */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#18A878]/20 bg-[#ECFBF5] px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18A878] to-[#0E8A5F] shadow-[0_8px_18px_-6px_rgba(24,168,120,0.6)]">
                        <Lock className="h-4 w-4 text-white" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F1B3D]">Secure SSL Encryption</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#536078]">Your payment is 100% secure.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {step === 2 && (
          <CourseReviewStep
            course={preview.course}
            pricing={preview.pricing}
            symbol={symbol}
            couponInput={couponInput}
            couponBusy={couponBusy}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            onCouponChange={(v) => { setCouponInput(v); if (couponError) setCouponError(null) }}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onStart={() => changeStep(3)}
          />
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* ===== LEFT — Payment Methods (light card) ===== */}
            <div className="lg:col-span-7 h-full">
              <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 sm:p-7 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
                <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

                <div className="relative flex flex-1 flex-col">
                  {/* header */}
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_10px_24px_-10px_rgba(109,61,245,0.7)]">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-[#0F1B3D] leading-tight">Secure Payment</h2>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#536078]">
                        Your payment is encrypted and secure. Learn with peace of mind.
                      </p>
                    </div>
                  </div>

                  <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#536078]">Select Payment Method</p>

                  {/* methods */}
                  {methods.length > 0 ? (
                    <div className="mt-3.5 space-y-3">
                      {methods.map((m) => {
                        const id = m.method || m.gateway
                        const key = `${m.gateway}-${id}`.toLowerCase()
                        const isSsl = key.includes('ssl')
                        const isBkash = key.includes('bkash')
                        const isNagad = key.includes('nagad')
                        const isSelected = method === id
                        const brand = isBkash ? 'bkash' : isNagad ? 'nagad' : isSsl ? 'ssl' : 'other'
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setMethod((prev) => (prev === id ? '' : id))}
                            aria-pressed={isSelected}
                            className={cn(
                              'group relative flex w-full items-center gap-3.5 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200',
                              isSelected
                                ? 'border-[#6D3DF5] bg-[#F3EEFF] shadow-[0_14px_34px_-16px_rgba(109,61,245,0.65)]'
                                : 'border-[#E9E7F5] bg-white hover:border-[#6D3DF5]/40 hover:shadow-[0_12px_28px_-18px_rgba(15,27,61,0.35)]'
                            )}
                          >
                            {/* brand mark */}
                            <PaymentBrandLogo brand={brand} selected={isSelected} />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-[#0F1B3D]">{m.label}</p>
                                {m.is_default && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#6D3DF5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white animate-pulse">
                                    <Sparkles className="h-2.5 w-2.5" /> Recommended
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-snug text-[#536078] line-clamp-2">
                                {m.note || 'Secure online payment gateway'}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(isBkash || isNagad) && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] border border-[#3478F6]/25 px-2 py-0.5 text-[9px] font-semibold text-[#3478F6]">
                                    <ShieldCheck className="h-2.5 w-2.5" /> via SSLCommerz
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFBF5] border border-[#18A878]/25 px-2 py-0.5 text-[9px] font-semibold text-[#18A878]">
                                  <CheckCircle className="h-2.5 w-2.5" /> Instant confirmation
                                </span>
                                {isSsl && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFBF5] border border-[#18A878]/25 px-2 py-0.5 text-[9px] font-semibold text-[#18A878]">
                                    <Lock className="h-2.5 w-2.5" /> 256-bit SSL
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* radio + selected */}
                            <span className="flex shrink-0 flex-col items-center gap-1">
                              <span
                                className={cn(
                                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                                  isSelected
                                    ? 'border-[#6D3DF5] bg-[#6D3DF5] shadow-[0_0_0_4px_rgba(109,61,245,0.18),0_4px_12px_-2px_rgba(109,61,245,0.7)]'
                                    : 'border-[#C3BDDC] bg-white group-hover:border-[#6D3DF5]/50'
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#6D3DF5]">Selected</span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-6 text-center">
                      <Shield className="w-7 h-7 text-[#6D3DF5] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#0F1B3D]">Payment methods are being configured</p>
                      <p className="text-xs text-[#536078] mt-1.5">Check back shortly — SSLCommerz secure payments are being enabled.</p>
                    </div>
                  )}

                  {/* redirect hint */}
                  {activeMethod && (
                    <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-[#536078]">
                      <Lock className="h-3 w-3 shrink-0 text-[#18A878]" />
                      You'll be redirected to <span className="font-semibold text-[#0F1B3D]">{activeMethod.label}</span> secure checkout to pay {symbol}{Number(preview.pricing.total).toFixed(2)}.
                    </p>
                  )}

                  {/* secured note */}
                  <div className="mt-auto pt-7">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#18A878]/20 bg-[#ECFBF5] px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18A878] to-[#0E8A5F] shadow-[0_8px_18px_-6px_rgba(24,168,120,0.6)]">
                        <Lock className="h-4 w-4 text-white" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F1B3D]">Secured by SSLCommerz</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#536078]">
                          256-bit SSL encryption. No card details are handled or stored by this platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Refund reminder */}
                  <label className="mt-4 flex items-start gap-3 cursor-pointer select-none group">
                    <span
                      role="checkbox"
                      aria-checked={termChecked}
                      tabIndex={0}
                      onClick={() => setTermChecked(!termChecked)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTermChecked(!termChecked) } }}
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 group-hover:shadow-[0_0_0_4px_rgba(109,61,245,0.12)]',
                        termChecked
                          ? 'border-[#6D3DF5] bg-[#6D3DF5] shadow-[0_4px_14px_-2px_rgba(109,61,245,0.55)]'
                          : 'border-[#C3BDDC] bg-white'
                      )}
                    >
                      {termChecked && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                    </span>
                    <span className="text-[11px] leading-relaxed text-[#536078]">
                      I confirm this enrollment and agree to the{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Terms</a> and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-[#6D3DF5] hover:underline">Refund Policy</a>.
                    </span>
                  </label>

                  {/* CTA */}
                  <button onClick={handleStartPayment} disabled={creating || paying || !method}
                    className="group relative mt-4">
                    <span className="flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] py-4 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(109,61,245,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(109,61,245,0.75)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100">
                      {creating || paying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> {creating ? 'Creating secure order...' : 'Redirecting to payment gateway...'}
                        </>
                      ) : (
                        <>
                          Pay {symbol}{Number(preview.pricing.total).toFixed(2)} via {activeMethod?.label || 'selected method'}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#A9B3C8]">
                    <Sparkles className="w-3 h-3" /> Amount calculated server-side • No duplicate charges
                  </p>
                </div>
              </div>
            </div>

            {/* ===== RIGHT — Order Summary (light card) ===== */}
            <div className="lg:col-span-5 h-full">
              {/* mobile toggle */}
              <button
                onClick={() => setPaymentOpen((o) => !o)}
                className="lg:hidden mb-3 flex w-full items-center justify-between rounded-2xl border border-[#E9E7F5] bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,27,61,0.3)]"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#0F1B3D]">
                  <FileText className="h-4 w-4 text-[#6D3DF5]" /> Order Summary
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#0F1B3D]">{symbol}{Number(preview.pricing.total).toFixed(2)}</span>
                  {paymentOpen ? <ChevronUp className="h-4 w-4 text-[#536078]" /> : <ChevronDown className="h-4 w-4 text-[#536078]" />}
                </span>
              </button>

              <div className={cn('h-full lg:block', paymentOpen ? 'block' : 'hidden')}>
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
                <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#EEF4FF] blur-3xl" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BFDBFE]/80 to-transparent" />

                <div className="relative flex flex-1 flex-col">
                  {/* header */}
                  <div className="flex items-center justify-between pb-4">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3478F6]">
                      <FileText className="h-4 w-4" /> Order Summary
                    </span>
                    <div className="relative">
                      <button onClick={() => setMenuOpen((o) => !o)} className="p-1 text-[#A9B3C8] transition-colors hover:text-[#0F1B3D]" aria-label="More options">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[#E9E7F5] bg-white shadow-[0_16px_40px_-16px_rgba(15,27,61,0.4)]">
                            <button
                              onClick={() => { setMenuOpen(false); changeStep(1) }}
                              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-[#0F1B3D] transition-colors hover:bg-[#F9F7FF]"
                            >
                              <PenLine className="h-3.5 w-3.5 text-[#6D3DF5]" /> Edit Student Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* course mini-card */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)]">
                      {preview.course.thumbnail ? (
                        <img src={preview.course.thumbnail} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <BarChart3 className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0F1B3D] leading-snug line-clamp-2">{preview.course.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#536078]">
                        by <span className="truncate font-semibold">{preview.course.instructor?.name || 'Learn2Earn'}</span>
                        {preview.course.instructor?.name && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#3478F6]" />}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

                  {/* info rows */}
                  <div className="mt-4 space-y-3 text-sm">
                    {preview.course.level && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[#536078]"><Layers className="h-3.5 w-3.5 text-[#3478F6]" /> Level</span>
                        <span className="capitalize font-semibold text-[#0F1B3D]">{preview.course.level}</span>
                      </div>
                    )}
                    {preview.course.duration && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[#536078]"><Clock className="h-3.5 w-3.5 text-[#3478F6]" /> Duration</span>
                        <span className="font-semibold text-[#0F1B3D]">{preview.course.duration}</span>
                      </div>
                    )}
                    {typeof preview.course.students_count === 'number' && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[#536078]"><Users className="h-3.5 w-3.5 text-[#3478F6]" /> Students</span>
                        <span className="font-semibold text-[#0F1B3D]">{preview.course.students_count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

                  {/* pricing */}
                  <div className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#536078]">Course Price</span>
                      <span className="font-semibold text-[#0F1B3D]">{symbol}{Number(preview.pricing.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(preview.pricing.discount || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#536078]">Coupon discount</span>
                        <span className="font-semibold text-[#18A878]">-{symbol}{Number(preview.pricing.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-[#E9E7F5] pt-3">
                      <span className="font-bold text-[#0F1B3D]">Total</span>
                      <span className="text-2xl font-extrabold tracking-tight text-[#6D3DF5]">
                        {symbol}{Number(preview.pricing.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* secure info */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#18A878]/20 bg-[#ECFBF5] px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18A878] to-[#0E8A5F] shadow-[0_8px_18px_-6px_rgba(24,168,120,0.6)]">
                        <Lock className="h-4 w-4 text-white" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F1B3D]">Secure &amp; Encrypted</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#536078]">
                          256-bit SSL encryption. Your data is safe with us.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {step === 4 && order && (
          <SuccessStep
            course={preview.course}
            pricing={preview.pricing}
            symbol={symbol}
            order={order}
            onViewCourses={() => router.push('/dashboard/courses')}
            onViewOrders={() => router.push('/student/orders')}
          />
        )}
      </div>

      {paying && <ProcessingOverlay total={Number(preview.pricing.total).toFixed(2)} symbol={symbol} method={activeMethod?.label} />}
    </div>
  )
}

/* ---------- Step 2: Order Review ---------- */
function CourseReviewStep({
  course, pricing, symbol,
  couponInput, couponBusy, appliedCoupon, couponError,
  onCouponChange, onApplyCoupon, onRemoveCoupon,
  onStart,
}: {
  course: OrderCourse
  pricing: OrderPricing
  symbol: string
  couponInput: string
  couponBusy: boolean
  appliedCoupon: string | null
  couponError: string | null
  onCouponChange: (v: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  onStart: () => void
}) {
  const discount = Number(pricing.discount || 0)
  const outline = [
    'Lifetime access',
    'Certificate of completion',
    'Community access',
    'Project-based curriculum',
    'Direct support from instructor',
    'Quizzes & hands-on assessments',
  ]
  const [open, setOpen] = useState(true)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* ===== LEFT — Course Details (light card) ===== */}
      <div className="lg:col-span-7 h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-7 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
          {/* purple glow accent */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#F3EEFF] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4B5FD]/70 to-transparent" />

          <div className="relative flex flex-1 flex-col">
            {/* category badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6D3DF5]">
                <Briefcase className="h-3 w-3" /> {course.category || 'Course'}
              </span>
              {course.level && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF4FF] border border-[#3478F6]/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3478F6]">
                  {course.level} level
                </span>
              )}
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1B3D] leading-tight">{course.title}</h1>

            {course.instructor?.name && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-sm text-[#536078]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] text-[11px] font-bold text-white shadow-[0_4px_12px_-2px_rgba(109,61,245,0.6)]">
                  {course.instructor.name.split(' ').map((p) => p[0]?.toUpperCase()).join('').slice(0, 2)}
                </span>
                Taught by <span className="font-semibold text-[#0F1B3D]">{course.instructor.name}</span>
                <BadgeCheck className="h-4 w-4 text-[#3478F6]" />
              </div>
            )}

            <div className="mt-5 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

            {/* meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-[#0F1B3D]">
              {course.duration && (
                <span className="inline-flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E9E7F5] bg-[#F3EEFF]">
                    <Calendar className="h-4 w-4 text-[#6D3DF5]" />
                  </span>
                  <span className="font-medium">{course.duration}</span>
                </span>
              )}
              {typeof course.students_count === 'number' && (
                <>
                  <span className="hidden sm:inline text-[#A9B3C8]">|</span>
                  <span className="inline-flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E9E7F5] bg-[#EEF4FF]">
                      <Users className="h-4 w-4 text-[#3478F6]" />
                    </span>
                    <span className="font-medium">{course.students_count.toLocaleString()} students</span>
                  </span>
                </>
              )}
            </div>

            <div className="mt-6 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#536078]">What you'll get</p>

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outline.map((item) => (
                <li key={item} className="group flex items-center gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5 text-sm text-[#0F1B3D] transition-colors hover:border-[#C4B5FD] hover:bg-white">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_4px_12px_-2px_rgba(109,61,245,0.55)]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-auto pt-8">
              <button onClick={onStart}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] px-5 py-4 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(109,61,245,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(109,61,245,0.75)] hover:brightness-110">
                <span>
                  Proceed to Secure Payment
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — Order Summary (light card) ===== */}
      <div className="lg:col-span-5 h-full">
        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden mb-3 flex w-full items-center justify-between rounded-2xl border border-[#E9E7F5] bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,27,61,0.3)]"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#0F1B3D]">
            <ClipboardList className="h-4 w-4 text-[#6D3DF5]" /> Order Summary
          </span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#0F1B3D]">{symbol}{Number(pricing.total).toFixed(2)}</span>
            {open ? <ChevronUp className="h-4 w-4 text-[#536078]" /> : <ChevronDown className="h-4 w-4 text-[#536078]" />}
          </span>
        </button>

        <div className={cn('h-full lg:block', open ? 'block' : 'hidden')}>
        <div className="relative flex h-full flex-col items-stretch">
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,27,61,0.25)]">
            <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#EEF4FF] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BFDBFE]/80 to-transparent" />

            <div className="relative flex flex-1 flex-col">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Order Summary</span>
                <ClipboardList className="h-4 w-4 text-[#3478F6]" />
              </div>

              {/* course mini-card */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF] p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-[0_6px_16px_-6px_rgba(109,61,245,0.6)]">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <PenLine className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#0F1B3D] leading-snug line-clamp-2">{course.title}</p>
                  {course.instructor?.name && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#536078]">
                      by <span className="truncate font-semibold">{course.instructor.name}</span>
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#3478F6]" />
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

              {/* info rows */}
              <div className="mt-4 space-y-3 text-sm">
                {course.level && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[#536078]"><Layers className="h-3.5 w-3.5 text-[#3478F6]" /> Level</span>
                    <span className="capitalize font-semibold text-[#0F1B3D]">{course.level}</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[#536078]"><Clock className="h-3.5 w-3.5 text-[#3478F6]" /> Duration</span>
                    <span className="font-semibold text-[#0F1B3D]">{course.duration}</span>
                  </div>
                )}
                {typeof course.students_count === 'number' && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E9E7F5] bg-[#F9F7FF] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[#536078]"><Users className="h-3.5 w-3.5 text-[#3478F6]" /> Students</span>
                    <span className="font-semibold text-[#0F1B3D]">{course.students_count.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 h-px bg-gradient-to-r from-[#E9E7F5] via-[#E9E7F5]/50 to-transparent" />

              {/* pricing */}
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#536078]">Course Price</span>
                  <span className="font-semibold text-[#0F1B3D]">{symbol}{Number(pricing.subtotal).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#536078]">{pricing.coupon_label || 'Coupon discount'}</span>
                    <span className="font-semibold text-[#18A878]">-{symbol}{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#E9E7F5] pt-3">
                  <span className="font-bold text-[#0F1B3D]">Total</span>
                  <span className="text-2xl font-extrabold tracking-tight text-[#6D3DF5]">
                    {symbol}{Number(pricing.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* coupon */}
              {appliedCoupon && discount > 0 ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#18A878]/30 bg-[#ECFBF5] px-3.5 py-2.5">
                  <span className="text-sm font-bold text-[#18A878]">+ {appliedCoupon}</span>
                  <button onClick={onRemoveCoupon} className="text-xs font-medium text-[#536078] hover:text-[#E5484D]">Remove</button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#536078]">
                    <Tag className="h-3.5 w-3.5 text-[#6D3DF5]" /> Have a coupon code?
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
                      placeholder="Enter coupon code"
                      className={cn(
                        'min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm text-[#0F1B3D] uppercase placeholder-[#A9B3C8] outline-none transition-all',
                        couponError
                          ? 'border-[#E5484D] focus:ring-2 focus:ring-[#E5484D]/15'
                          : 'border-[#E9E7F5] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15'
                      )}
                    />
                    <button
                      onClick={onApplyCoupon}
                      disabled={couponBusy || !couponInput.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(109,61,245,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {couponBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#E5484D]">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {couponError}
                    </p>
                  )}
                </div>
              )}

              {/* SSL */}
              <div className="mt-auto pt-6">
                <div className="flex items-start gap-3 rounded-2xl border border-[#18A878]/20 bg-[#ECFBF5] px-4 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#18A878] to-[#0E8A5F] shadow-[0_6px_16px_-4px_rgba(24,168,120,0.6)]">
                    <Lock className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#0F1B3D]">Secure SSL Encryption</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#536078]">Your payment is safe and protected.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 4: Success ---------- */
function SuccessStep({
  course, pricing, symbol, order, onViewCourses, onViewOrders,
}: {
  course: OrderCourse
  pricing: OrderPricing
  symbol: string
  order: OrderData
  onViewCourses: () => void
  onViewOrders: () => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-white border border-[#E9E7F5] rounded-3xl p-8 text-center shadow-[0_20px_60px_-20px_rgba(15,27,61,0.3)]">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#18A878]/15 animate-ping [animation-duration:2.5s]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#18A878] to-[#2CC48B] flex items-center justify-center shadow-lg shadow-[#18A878]/40">
              <CheckCircle className="w-11 h-11 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0F1B3D] mb-2">Congratulations! 🎉</h1>
          <p className="text-sm text-[#536078] mb-6">
            Your payment was successful and you're now enrolled in{' '}
            <span className="text-[#0F1B3D] font-semibold">{course.title}</span>.
          </p>

          <div className="rounded-2xl border border-[#E9E7F5] bg-[#F9F7FF]/60 p-4 text-left mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#536078]">Order ID</span>
              <span className="font-semibold text-[#0F1B3D]">{order.order_number || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#536078]">Amount Paid</span>
              <span className="font-semibold text-[#18A878]">{symbol}{Number(order.total).toFixed(2) || Number(pricing.total).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#536078]">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18A878] bg-[#ECFBF5] border border-[#18A878]/20 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> PAID
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={onViewCourses}
              className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_12px_24px_-10px_rgba(109,61,245,0.6)]">
              <Play className="w-4 h-4" /> Start Learning — Go to My Courses
            </button>
            <button onClick={onViewOrders}
              className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-2xl py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> View My Orders & Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-6">
          <CheckoutOrderSummary
            course={course}
            pricing={pricing}
            symbol={symbol}
            compact
            showCoupon={false}
          />
        </div>
      </div>
    </div>
  )
}

/* ---------- Processing overlay: animated secure payment in progress ---------- */
function ProcessingOverlay({
  total, symbol, method,
}: {
  total: string
  symbol: string
  method?: string
}) {
  const steps = [
    'Creating your secure order',
    'Connecting to SSLCommerz',
    'Redirecting to the secure payment page',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B3D]/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_30px_80px_-20px_rgba(15,27,61,0.5)] animate-[fadeIn_.25s_ease]">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-[#E9E7F5]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6D3DF5] border-r-[#6D3DF5] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#6D3DF5]" />
            </div>
          </div>

          <p className="text-lg font-bold text-[#0F1B3D]">Processing your payment</p>
          <p className="text-sm text-[#536078] mt-1 mb-6">
            {symbol}{total} via {method || 'your payment method'}
          </p>

          <div className="w-full space-y-2.5 mb-6 text-left">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  i === 0 ? 'border-[#6D3DF5] bg-[#6D3DF5]' : 'border-[#E9E7F5]'
                )}>
                  {i === 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </span>
                <span className={cn(i === 0 ? 'text-[#0F1B3D] font-semibold' : 'text-[#A9B3C8]')}>{label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#A9B3C8] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#18A878]" /> 256-bit SSL encrypted · Please don&apos;t close this window
          </p>
        </div>
      </div>
    </div>
  )
}
