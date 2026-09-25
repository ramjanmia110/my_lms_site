'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Lock, Play,
  User, Mail, Phone, MapPin, GraduationCap, Camera, RefreshCw,
  Check, Shield, BookOpen, Star, Clock, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { studentAPI, paymentsAPI } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import CheckoutStepper from '@/components/payment/CheckoutStepper'
import CheckoutOrderSummary, { type OrderCourse, type OrderPricing } from '@/components/payment/CheckoutOrderSummary'

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' }

interface PreviewData {
  course: OrderCourse
  already_enrolled: boolean
  currency: string
  pricing: OrderPricing
  payment_methods: unknown[]
}

interface ProfileInfo {
  name: string
  email: string
  phone: string
  avatar?: string | null
  date_of_birth?: string | null
  gender?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  postal_code?: string | null
  institution?: string | null
  education_level?: string | null
  occupation?: string | null
}

type FieldErrors = Record<string, string>

function CosmicBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#FFFFFF_0%,#FAF8FF_30%,#F4F7FF_64%,#F4FCF9_100%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#F3EEFF] blur-[120px]" />
      <div className="absolute right-[-8%] top-[16%] h-96 w-96 rounded-full bg-[#EEF4FF] blur-[110px]" />
      <div className="absolute left-[26%] bottom-[-12%] h-80 w-80 rounded-full bg-[#ECFBF5] blur-[110px]" />
      <div className="absolute right-[24%] bottom-[-10%] h-72 w-72 rounded-full bg-[#F3EEFF] blur-[100px]" />
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#E11D48]">
      <AlertCircle className="w-3 h-3 shrink-0" /> {message}
    </p>
  )
}

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-[#0F1B3D] placeholder-[#A9B3C8] focus:outline-none transition-all'

function inputCls(hasError?: boolean): string {
  return cn(
    inputBase,
    hasError
      ? 'border-[#FCA5A5] focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15'
      : 'border-[#E9E7F5] focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15'
  )
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-[#E9E7F5] rounded-2xl shadow-[0_12px_40px_-22px_rgba(15,27,61,0.25)] overflow-hidden">
      <header className="px-5 py-4 border-b border-[#E9E7F5] bg-[#F9F7FF]/60 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-[#6D3DF5]/10 text-[#6D3DF5] flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-bold text-[#0F1B3D]">{title}</h2>
          <p className="text-[11px] text-[#536078]">{subtitle}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9][0-9+\-\s()]{6,19}$/
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9\-\s]{2,15}$/

function StudentInformationPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = Number(searchParams.get('courseId')) || 0
  const couponQuery = searchParams.get('coupon') || ''

  const { user, isLoading: authLoading, isAuthenticated } = useAuth()

  const [loadingInitial, setLoadingInitial] = useState(true)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [couponInput, setCouponInput] = useState(couponQuery)
  const [couponBusy, setCouponBusy] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(couponQuery || null)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)

  const [info, setInfo] = useState<ProfileInfo>({ name: '', email: '', phone: '' })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const dirtyRef = useRef(false)

  const setField = (key: keyof ProfileInfo, value: string) => {
    dirtyRef.current = true
    setInfo((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  const symbol = CURRENCY_SYMBOL[preview?.currency || 'BDT'] || '৳'

  const loadPreview = useCallback(
    async (coupon?: string | null) => {
      if (!courseId) return
      setPreviewLoading(true)
      setPreviewError(null)
      try {
        const res = await paymentsAPI.checkoutPreview(courseId, coupon || undefined)
        const next = res.data?.data as PreviewData
        setPreview(next)
        setAppliedCoupon(next.pricing.coupon_code || null)
        if (next.already_enrolled) setAlreadyEnrolled(true)
      } catch (err: any) {
        let msg = err?.response?.data?.message || err?.message || 'Could not load checkout.'
        if (err?.response?.data?.errors?.course_id?.length) {
          msg = 'This course is not available for checkout. It may not be published yet.'
        }
        setPreviewError(msg)
      } finally {
        setPreviewLoading(false)
      }
    },
    [courseId]
  )

  const loadProfile = useCallback(async () => {
    try {
      const res = await studentAPI.profile()
      const data = res.data?.data as ProfileInfo
      if (data) {
        setInfo({
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          avatar: data.avatar,
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          country: data.country || '',
          city: data.city || '',
          address: data.address || '',
          postal_code: data.postal_code || '',
          institution: data.institution || '',
          education_level: data.education_level || '',
          occupation: data.occupation || '',
        })
      }
    } catch {
      /* Profile is a prefill convenience — non-fatal if it fails. */
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      if (courseId) router.replace(`/signup?enroll=${courseId}`)
      else router.replace('/courses')
      return
    }
    if (courseId && isAuthenticated) {
      Promise.all([loadProfile(), loadPreview(couponQuery || null)])
        .catch(() => {})
        .finally(() => setLoadingInitial(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, courseId])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const handleAvatarChange = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be smaller than 5MB.')
      return
    }
    dirtyRef.current = true
    setAvatarFile(file)
    setAvatarPreviewUrl(URL.createObjectURL(file))
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    try {
      await loadPreview(code)
      setCouponInput('')
      toast.success('Coupon applied.')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired coupon.'
      toast.error(msg)
    } finally {
      setCouponBusy(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setCouponBusy(true)
    try {
      await loadPreview(null)
      setCouponInput('')
    } catch {
      toast.error('Could not refresh pricing.')
    } finally {
      setCouponBusy(false)
    }
  }

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (!info.name.trim()) errs.name = 'Full name is required.'
    if (!info.email.trim()) errs.email = 'Email address is required.'
    else if (!EMAIL_RE.test(info.email.trim())) errs.email = 'Enter a valid email address.'
    if (!info.phone.trim()) errs.phone = 'Phone number is required.'
    else if (!PHONE_RE.test(info.phone.trim())) errs.phone = 'Enter a valid phone number.'
    if (info.date_of_birth) {
      const dob = new Date(info.date_of_birth)
      if (Number.isNaN(dob.getTime()) || dob >= new Date()) errs.date_of_birth = 'Date of birth must be in the past.'
    }
    if (info.postal_code && !POSTAL_RE.test(info.postal_code.trim())) {
      errs.postal_code = 'Enter a valid postal/ZIP code.'
    }
    return errs
  }

  const handleContinue = async () => {
    if (!courseId) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', info.name.trim())
      fd.append('email', info.email.trim())
      fd.append('phone', info.phone.trim())
      const optional = [
        'date_of_birth', 'gender', 'country', 'city', 'address',
        'postal_code', 'institution', 'education_level', 'occupation',
      ] as const
      for (const key of optional) {
        fd.append(key, info[key] || '')
      }
      if (avatarFile) fd.append('avatar', avatarFile)

      const res = await paymentsAPI.prepareEnrollment(courseId, fd, appliedCoupon || undefined)
      toast.success(res.data?.message || 'Your information has been saved. Continue to checkout.')
      const couponQ = appliedCoupon ? `&coupon=${encodeURIComponent(appliedCoupon)}` : ''
      router.push(`/payment/${courseId}?step=review${couponQ}`)
    } catch (err: any) {
      const status = err?.response?.status
      const data = err?.response?.data
      if (status === 409 || data?.code === 'already_enrolled') {
        setAlreadyEnrolled(true)
        toast.error(data?.message || 'You are already enrolled in this course.')
      } else if (data?.errors) {
        const mapped: FieldErrors = {}
        Object.entries(data.errors as Record<string, string[]>).forEach(([key, list]) => {
          mapped[key] = Array.isArray(list) ? list[0] : String(list)
        })
        setErrors(mapped)
        toast.error('Please fix the highlighted fields.')
      } else {
        toast.error(data?.message || 'Could not save your information. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin" />
          <p className="text-sm text-[#536078]">Loading your information…</p>
        </div>
      </div>
    )
  }

  if (!courseId || (previewError && !preview)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[#F3EEFF] border border-[#6D3DF5]/15 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[#6D3DF5]" />
          </div>
          <h2 className="text-lg font-bold text-[#0F1B3D] mb-1">Checkout unavailable</h2>
          <p className="text-sm text-[#536078] mb-5">{previewError || 'Please select a course to enroll in.'}</p>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D3DF5] hover:text-[#5B2EE0]">
            <ArrowLeft className="w-4 h-4" /> Browse courses
          </Link>
        </div>
      </div>
    )
  }

  if (alreadyEnrolled && preview) {
    const myCourseUrl = preview.course?.slug ? `/courses/${preview.course.slug}` : '/dashboard/courses'
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_16px_40px_-16px_rgba(24,168,120,0.5)]">
            <CheckCircle className="w-10 h-10 text-[#18A878]" />
          </div>
          <h1 className="text-xl font-bold text-[#0F1B3D] mb-2">You already have access to this course.</h1>
          <p className="text-sm text-[#536078] mb-6">
            You can jump straight back into{' '}
            <span className="text-[#0F1B3D] font-semibold">{preview.course?.title}</span> or keep exploring.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={myCourseUrl}
              className="w-full bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_10px_24px_-10px_rgba(109,61,245,0.6)]"
            >
              <Play className="w-4 h-4" /> Start Learning
            </Link>
            <Link
              href="/dashboard/courses"
              className="w-full bg-white border border-[#E9E7F5] hover:bg-[#F9F7FF] text-[#0F1B3D] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
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
          <button
            onClick={() => router.push(preview?.course?.slug ? `/courses/${preview.course.slug}` : '/dashboard/courses')}
            className="inline-flex items-center gap-1.5 text-sm text-[#536078] hover:text-[#0F1B3D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to course
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#18A878] font-semibold bg-[#ECFBF5] border border-[#18A878]/25 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Secure Enrollment
          </span>
        </div>

        <div className="mb-8">
          <CheckoutStepper
            current={1}
            steps={[
              { n: 1, label: 'Student Information' },
              { n: 2, label: 'Order Review' },
              { n: 3, label: 'Payment' },
            ]}
          />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0F1B3D] tracking-tight">
            Your Student Information
          </h1>
          <p className="mt-1.5 text-sm text-[#536078] max-w-xl mx-auto">
            We need a few details to set up your enrollment and generate your invoice. All fields marked with{' '}
            <span className="text-[#E11D48] font-semibold">*</span> are required.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <SectionCard icon={<User className="w-4 h-4" />} title="Personal Information" subtitle="Your identity and contact details">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Full Name <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    className={inputCls(!!errors.name)}
                    placeholder="e.g. Ayesha Siddiqua"
                    value={info.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                  <FieldError message={errors.name} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Email Address <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C8]" />
                    <input
                      type="email"
                      className={cn(inputCls(!!errors.email), 'pl-9')}
                      placeholder="you@example.com"
                      value={info.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                  <FieldError message={errors.email} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Phone Number <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C8]" />
                    <input
                      className={cn(inputCls(!!errors.phone), 'pl-9')}
                      placeholder="+880 1XXX-XXXXXX"
                      value={info.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </div>
                  <FieldError message={errors.phone} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Date of Birth <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls(!!errors.date_of_birth)}
                    value={info.date_of_birth || ''}
                    onChange={(e) => setField('date_of_birth', e.target.value)}
                  />
                  <FieldError message={errors.date_of_birth} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Gender <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField('gender', info.gender === opt.value ? '' : opt.value)}
                        className={cn(
                          'px-3 py-2 text-xs font-semibold rounded-xl border transition-all',
                          info.gender === opt.value
                            ? 'bg-[#6D3DF5]/10 border-[#6D3DF5]/40 text-[#6D3DF5]'
                            : 'bg-white border-[#E9E7F5] text-[#536078] hover:bg-[#F9F7FF]'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={<MapPin className="w-4 h-4" />} title="Address" subtitle="Where your certificate and invoices should be delivered">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Country <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Bangladesh"
                    value={info.country || ''}
                    onChange={(e) => setField('country', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    City <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Dhaka"
                    value={info.city || ''}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Street Address <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="House, road, area"
                    value={info.address || ''}
                    onChange={(e) => setField('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Postal / ZIP Code <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls(!!errors.postal_code)}
                    placeholder="e.g. 1205"
                    value={info.postal_code || ''}
                    onChange={(e) => setField('postal_code', e.target.value)}
                  />
                  <FieldError message={errors.postal_code} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={<GraduationCap className="w-4 h-4" />} title="Academic & Professional" subtitle="Helps us tailor your learning path">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Education Level <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Bachelor's"
                    value={info.education_level || ''}
                    onChange={(e) => setField('education_level', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Institution <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. University of Dhaka"
                    value={info.institution || ''}
                    onChange={(e) => setField('institution', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-1.5 block">
                    Occupation <span className="text-[#A9B3C8]">(optional)</span>
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Student / Software Engineer"
                    value={info.occupation || ''}
                    onChange={(e) => setField('occupation', e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={<Camera className="w-4 h-4" />} title="Profile Photo" subtitle="Shown on your certificate and class roster">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center shrink-0">
                  {avatarPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : info.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(info.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-[#6D3DF5]/60" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2EE0] rounded-xl cursor-pointer transition-all shadow-[0_8px_20px_-10px_rgba(109,61,245,0.6)]">
                    <Camera className="w-4 h-4" />
                    {avatarFile || info.avatar ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                    />
                  </label>
                  <p className="mt-1.5 text-[11px] text-[#A9B3C8]">JPEG, PNG, GIF or WEBP — up to 5MB.</p>
                </div>
                {(avatarFile || info.avatar) && (
                  <button
                    type="button"
                    onClick={() => {
                      dirtyRef.current = true
                      setAvatarFile(null)
                      setAvatarPreviewUrl(null)
                      setInfo((prev) => ({ ...prev, avatar: null }))
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#E11D48] font-medium hover:underline shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            </SectionCard>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <p className="flex items-center gap-1.5 text-[11px] text-[#A9B3C8]">
                <Shield className="w-3.5 h-3.5 text-[#18A878]" /> Your details are encrypted and never shared.
              </p>
              <button
                onClick={handleContinue}
                disabled={saving || previewLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:from-[#5B2EE0] hover:to-[#2A63E0] rounded-xl transition-all shadow-[0_12px_28px_-12px_rgba(109,61,245,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving & preparing order…
                  </>
                ) : (
                  <>
                    Save & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            {preview && (
              <CheckoutOrderSummary
                course={preview.course}
                pricing={preview.pricing}
                symbol={symbol}
                couponInput={couponInput}
                couponBusy={couponBusy}
                appliedCoupon={appliedCoupon}
                onCouponChange={(v) => {
                  setCouponInput(v)
                }}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            )}
            <div className="bg-[#F9F7FF] border border-[#6D3DF5]/10 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#6D3DF5]" /> What happens next?
              </p>
              <ul className="space-y-2 text-xs text-[#536078]">
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-[#18A878] shrink-0 mt-0.5" />
                  We save your profile and securely reserve your seat.
                </li>
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-[#18A878] shrink-0 mt-0.5" />
                  Review your order and choose a payment method.
                </li>
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-[#18A878] shrink-0 mt-0.5" />
                  Get instant access after payment is confirmed.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentInformationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin" />
            <p className="text-sm text-[#536078]">Loading your information…</p>
          </div>
        </div>
      }
    >
      <StudentInformationPageInner />
    </Suspense>
  )
}