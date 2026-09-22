'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, User, Mail, Phone, MapPin, Lock, ChevronDown, Loader2,
  AlertCircle, CheckCircle, Calendar, BookOpen, Star, Clock,
  Sparkles, BadgeCheck, ChevronLeft, ChevronRight, Upload,
  Shield, Eye, EyeOff, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { studentAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface EnrollCourse {
  id: number
  title: string
  instructor: string
  price: number
  originalPrice?: number | null
  image: string
  description?: string
  hours?: number
  duration?: string
  lessons?: number
  rating?: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: EnrollCourse
}

interface FormData {
  name: string
  father_name: string
  mother_name: string
  phone: string
  age: string
  gender: string
  country: string
  district: string
  address: string
  email: string
  password: string
}

interface FieldError {
  [key: string]: string
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const COUNTRY_OPTIONS = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'International', label: 'International / Remote Hubs' },
]

const DISTRICT_OPTIONS: Record<string, string[]> = {
  Bangladesh: [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal',
    'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Jessore',
    'Bogra', 'Pabna', 'Narayanganj', 'Gazipur', 'Tangail',
  ],
  International: [],
}

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
  { label: 'One special character', test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
]

function getPasswordStrength(pw: string): { score: number; label: string; color: string; bg: string } {
  if (!pw) return { score: 0, label: '', color: '', bg: 'bg-slate-200' }
  const passed = PASSWORD_REQUIREMENTS.filter(r => r.test(pw)).length
  if (passed <= 1) return { score: 25, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' }
  if (passed === 2) return { score: 50, label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500' }
  if (passed === 3) return { score: 75, label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' }
  return { score: 100, label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500' }
}

/* ---------- FieldRenderer as a proper stable component ---------- */
interface FieldRendererProps {
  field: keyof FormData
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  value: string
  error?: string
  fieldState: 'idle' | 'error' | 'success'
  onChange: (field: keyof FormData, value: string) => void
  onBlur: (field: string) => void
  country?: string
  isAuthenticated?: boolean
}

const fieldLabelMap: Record<string, string> = {
  name: 'Full Name', father_name: "Father's Name", mother_name: "Mother's Name",
  email: 'Email Address', phone: 'Phone Number', age: 'Age',
  gender: 'Gender / Sex', country: 'Country', district: 'District / State',
  address: 'Complete Address', password: 'Password',
}

const fieldPlaceholderMap: Record<string, string> = {
  name: 'e.g., Sabikun Nahar',
  father_name: "Enter father's full name",
  mother_name: "Enter mother's full name",
  email: 'e.g., name@gmail.com',
  phone: 'e.g., 017XXXXXXXX',
  age: 'e.g., 24',
  address: 'Enter your flat, street, and area details...',
  password: 'Create a secure password',
}

function inputClassForState(state: 'idle' | 'error' | 'success'): string {
  const base = 'w-full py-2 px-3 text-sm rounded-lg focus:outline-none placeholder:text-slate-400'
  if (state === 'error') return `${base} border border-rose-200 bg-rose-50/30 focus:border-rose-400 focus:ring-0`
  if (state === 'success') return `${base} border border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-0`
  return `${base} border border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-0`
}

function FieldRenderer({
  field, type = 'text', required, options, placeholder,
  value, error, fieldState, onChange, onBlur, country, isAuthenticated,
}: FieldRendererProps) {
  const label = fieldLabelMap[field] || field
  const ph = placeholder || fieldPlaceholderMap[field] || ''
  const hasError = !!error

  if (options) {
    return (
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={e => onChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            className={cn(
              'w-full py-2 px-3 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-0 appearance-none cursor-pointer',
              hasError ? 'border border-rose-200 bg-rose-50/30' : 'border border-slate-200 bg-slate-50/50'
            )}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        {hasError && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500">
            <AlertCircle className="w-3 h-3 shrink-0" />{error}
          </p>
        )}
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <textarea
          value={value}
          onChange={e => onChange(field, e.target.value)}
          onBlur={() => onBlur(field)}
          placeholder={ph}
          rows={2}
          className={cn(
            inputClassForState(hasError ? 'error' : fieldState),
            'resize-none min-h-[56px]'
          )}
        />
        {hasError && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500">
            <AlertCircle className="w-3 h-3 shrink-0" />{error}
          </p>
        )}
      </div>
    )
  }

  const renderRightIcon = () => {
    if (field === 'phone' && value.length > 0 && value.length < 11) {
      return <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">{value.length}/11</span>
    }
    if (field === 'phone' && value.length === 11) {
      return <CheckCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
    }
    if (fieldState === 'success' && hasError === false && value) {
      if (field !== 'phone') return <CheckCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
    }
    if (hasError) {
      return <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
    }
    return null
  }

  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {field === 'password' ? (
          <PasswordInput
            value={value}
            onChange={v => onChange(field, v)}
            onBlur={() => onBlur(field)}
            hasError={hasError}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => {
              if (type === 'number') {
                onChange(field, e.target.value.replace(/\D/g, ''))
              } else {
                onChange(field, e.target.value)
              }
            }}
            onBlur={() => onBlur(field)}
            placeholder={ph}
            inputMode={type === 'number' ? 'numeric' : undefined}
            autoComplete={field === 'email' ? 'email' : 'off'}
            className={cn(
              inputClassForState(hasError ? 'error' : fieldState),
              'pr-8'
            )}
          />
        )}
        {renderRightIcon()}
      </div>
      {hasError && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
      {field === 'phone' && !hasError && value.length === 11 && (
        <p className="flex items-center gap-1 text-[11px] text-emerald-600">
          <CheckCircle className="w-3 h-3 shrink-0" />Valid phone number
        </p>
      )}
    </div>
  )
}

/* ---------- Password sub-component (stable) ---------- */
function PasswordInput({ value, onChange, onBlur, hasError }: {
  value: string; onChange: (v: string) => void; onBlur: () => void; hasError: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Create a secure password"
        autoComplete="new-password"
        className={cn(
          'w-full py-2 px-3 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-0 pr-20',
          hasError ? 'border border-rose-200 bg-rose-50/30' : 'border border-slate-200 bg-slate-50/50'
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

/* ---------- Main component ---------- */
export default function EnrollmentModal({ open, onOpenChange, course }: Props) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { setAuthenticated } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitError, setSubmitError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    name: '', father_name: '', mother_name: '', phone: '', age: '',
    gender: '', country: '', district: '', address: '', email: '', password: '',
  })

  useEffect(() => {
    if (open) {
      setStep(1)
      setLoading(false)
      setErrors({})
      setSubmitError('')
      setTouched(new Set())
      setAvatarFile(null)
      setAvatarPreview(null)
      setAvatarUrl(null)
      setForm({
        name: user?.name || '', father_name: '', mother_name: '', phone: user?.phone || '',
        age: '', gender: '', country: '', district: '', address: user?.address || '',
        email: user?.email || '', password: '',
      })
    }
  }, [open, user])

  /* Stable handler — no external dependencies on errors object */
  const updateField = useCallback((key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      if (!prev[key]) return prev
      const n = { ...prev }
      delete n[key]
      return n
    })
    setSubmitError('')
  }, [])

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field))
  }, [])

  /* ---------- Validation ---------- */
  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required'
        if (!/^[A-Za-z\s]+$/.test(value.trim())) return 'Only letters and spaces'
        return null
      case 'father_name':
        if (!value.trim()) return "Father's name is required"
        if (!/^[A-Za-z\s]+$/.test(value.trim())) return 'Only letters and spaces'
        return null
      case 'mother_name':
        if (!value.trim()) return "Mother's name is required"
        if (!/^[A-Za-z\s]+$/.test(value.trim())) return 'Only letters and spaces'
        return null
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
        return null
      case 'phone':
        if (!value.trim()) return 'Phone number is required'
        if (!/^\d{11}$/.test(value)) return 'Must be exactly 11 digits'
        return null
      case 'age':
        if (!value.trim()) return 'Age is required'
        const ageNum = parseInt(value, 10)
        if (isNaN(ageNum) || ageNum < 12) return 'Minimum age is 12'
        if (ageNum > 70) return 'Maximum age is 70'
        return null
      case 'gender':
        if (!value) return 'Select your gender'
        return null
      case 'country':
        if (!value) return 'Select your country'
        return null
      case 'district':
        if (!value) return 'Select your district'
        return null
      case 'address':
        if (!value.trim()) return 'Address is required'
        return null
      case 'password':
        if (!isAuthenticated) {
          if (!value) return 'Password is required'
          if (value.length < 8) return 'At least 8 characters'
        }
        return null
      default:
        return null
    }
  }, [isAuthenticated])

  const validate = useCallback((): boolean => {
    const e: FieldError = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) e.name = 'Only letters and spaces'
    if (!form.father_name.trim()) e.father_name = "Father's name is required"
    else if (!/^[A-Za-z\s]+$/.test(form.father_name.trim())) e.father_name = 'Only letters and spaces'
    if (!form.mother_name.trim()) e.mother_name = "Mother's name is required"
    else if (!/^[A-Za-z\s]+$/.test(form.mother_name.trim())) e.mother_name = 'Only letters and spaces'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{11}$/.test(form.phone)) e.phone = 'Must be exactly 11 digits'
    if (!form.age.trim()) e.age = 'Age is required'
    else {
      const ageNum = parseInt(form.age, 10)
      if (isNaN(ageNum) || ageNum < 12) e.age = 'Minimum age is 12'
      else if (ageNum > 70) e.age = 'Maximum age is 70'
    }
    if (!form.gender) e.gender = 'Select your gender'
    if (!form.country) e.country = 'Select your country'
    if (!form.address.trim()) e.address = 'Address is required'
    if (form.country === 'Bangladesh' && !form.district) e.district = 'Select your district'
    if (!isAuthenticated) {
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'At least 8 characters'
    }
    setErrors(e)
    const allTouched = new Set(touched)
    Object.keys(e).forEach(k => allTouched.add(k))
    setTouched(allTouched)
    return Object.keys(e).length === 0
  }, [form, touched, isAuthenticated])

  const getFieldState = useCallback((field: string): 'idle' | 'error' | 'success' => {
    if (field === 'district' && form.country !== 'Bangladesh') return 'idle'
    if (errors[field]) return 'error'
    const val = form[field as keyof FormData]
    if (!val && field !== 'age') return 'idle'
    if (field === 'age' && !val) return 'idle'
    if (!touched.has(field) && !val) return 'idle'
    const fieldError = validateField(field, val)
    if (fieldError) return 'idle'
    return 'success'
  }, [form, errors, touched, validateField])

  /* ---------- Image handlers ---------- */
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelect(file)
  }, [handleImageSelect])

  const removeImage = useCallback(() => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  /* ---------- Upload ---------- */
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null
    try {
      const formData = new FormData()
      formData.append('image', avatarFile)
      const res = await studentAPI.uploadImage(formData)
      const url = res.data?.data?.url || res.data?.url || null
      setAvatarUrl(url)
      return url
    } catch {
      toast.error('Image upload failed. You can continue without it.')
      return null
    }
  }

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix the highlighted errors'); return }
    setLoading(true)
    setSubmitError('')
    try {
      const uploadedUrl = avatarFile ? await uploadAvatar() : avatarUrl
      const payload: Record<string, unknown> = {
        name: form.name, father_name: form.father_name, mother_name: form.mother_name,
        email: form.email, phone: form.phone, age: form.age || null,
        gender: form.gender, country: form.country,
        division: form.district || form.country, city: form.district || form.country,
        address: form.address, course_id: course.id, course_title: course.title,
        course_price: course.price, password: isAuthenticated ? undefined : form.password,
        role: 'student', avatar: uploadedUrl || undefined,
      }
      if (!isAuthenticated && form.password) payload.password_confirmation = form.password

      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/checkout', { method: 'POST', headers, body: JSON.stringify(payload) })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'already_enrolled') {
          toast.error('You are already enrolled in this course.')
          onOpenChange(false)
          router.push('/dashboard/courses')
          return
        }
        setSubmitError(data.error || data.code || 'Registration failed')
        return
      }

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          useAuthStore.getState().setUser(data.user)
          setAuthenticated(true)
        }
      }

      onOpenChange(false)
      toast.success('Registration complete! Redirecting to payment...')
      const courseTitle = course.title
      const coursePrice = course.price
      sessionStorage.setItem(`course_${course.id}`, JSON.stringify({ title: courseTitle, price: coursePrice }))
      router.push(`/payment/${course.id}?title=${encodeURIComponent(courseTitle)}&price=${coursePrice}`)
    } catch {
      setSubmitError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const discount = course.originalPrice ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0
  const availableDistricts = DISTRICT_OPTIONS[form.country] || []

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={() => { if (!loading) onOpenChange(false) }} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-xl z-10">
        <div className="sticky top-0 bg-white z-20 flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {[{ n: 1, l: 'Course' }, { n: 2, l: 'Register' }].map((s, idx) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold',
                    step >= s.n ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'
                  )}>
                    {step > s.n ? <CheckCircle className="w-3 h-3" /> : s.n}
                  </div>
                  <span className={cn('text-[11px] font-medium hidden sm:inline', step >= s.n ? 'text-indigo-700' : 'text-slate-400')}>{s.l}</span>
                  {idx === 0 && <div className={cn('w-5 h-px', step > 1 ? 'bg-indigo-400' : 'bg-slate-200')} />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white rounded-xl p-3.5 border border-indigo-100">
                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <img src={course.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Enrolling in</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{course.title}</p>
                  <p className="text-[11px] text-slate-400">৳{course.price.toLocaleString()} &middot; {course.instructor}</p>
                </div>
              </div>

              <div className="relative aspect-[21/9] rounded-xl overflow-hidden">
                <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white/90 rounded-lg px-2.5 py-1">
                    <BadgeCheck className="w-3 h-3 text-indigo-500" />
                    <span className="text-[11px] text-slate-700 font-medium">Featured</span>
                  </div>
                  {discount > 0 && (
                    <div className="bg-indigo-500 text-white rounded-lg px-2.5 py-1">
                      <span className="text-[11px] font-bold">{discount}% OFF</span>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 -mt-1">{course.title}</h2>

              {course.description && (
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  {course.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Clock, label: course.duration || `${course.hours || 0}h`, sub: 'Duration' },
                  { icon: BookOpen, label: `${course.lessons || 0}`, sub: 'Lessons' },
                  { icon: Star, label: `${course.rating || 0}`, sub: 'Rating' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 -mb-0.5">{label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 p-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-[11px] text-slate-500 font-medium">Course Price</p>
                  <div className="flex items-baseline gap-2 ml-auto">
                    <span className="text-3xl font-bold text-indigo-700 tracking-tight">৳{course.price.toLocaleString()}</span>
                    {course.originalPrice && (
                      <><span className="text-base text-slate-400 line-through">৳{course.originalPrice.toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">{discount}% OFF</span></>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                Continue to Registration <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                By continuing, you agree to our{' '}
                <span className="text-indigo-600 cursor-pointer hover:underline">Terms</span> &{' '}
                <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              {/* Embedded Course Overview Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-200">
                  <img src={course.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{course.title}</p>
                  <p className="text-[10px] text-slate-400">${course.price} &middot; {course.instructor}</p>
                </div>
                <BadgeCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              </div>

              {submitError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-800">Submission failed</p>
                    <p className="text-[11px] text-red-600 mt-0.5">{submitError}</p>
                  </div>
                  <button onClick={() => setSubmitError('')} className="shrink-0 text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                </div>
              )}

              <div className="space-y-3.5">
                <p className="text-sm font-semibold text-slate-900">Student Information</p>

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRenderer field="name" required value={form.name} error={errors.name} fieldState={getFieldState('name')} onChange={updateField} onBlur={handleBlur} />
                  <FieldRenderer field="email" type="email" required value={form.email} error={errors.email} fieldState={getFieldState('email')} onChange={updateField} onBlur={handleBlur} />
                </div>

                {/* Row 2: Father + Mother */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRenderer field="father_name" required value={form.father_name} error={errors.father_name} fieldState={getFieldState('father_name')} onChange={updateField} onBlur={handleBlur} />
                  <FieldRenderer field="mother_name" required value={form.mother_name} error={errors.mother_name} fieldState={getFieldState('mother_name')} onChange={updateField} onBlur={handleBlur} />
                </div>

                {/* Row 3: Phone + Age */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRenderer field="phone" type="number" required value={form.phone} error={errors.phone} fieldState={getFieldState('phone')} onChange={updateField} onBlur={handleBlur} />
                  <FieldRenderer field="age" type="number" required value={form.age} error={errors.age} fieldState={getFieldState('age')} onChange={updateField} onBlur={handleBlur} />
                </div>

                {/* Row 4: Gender + Country */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRenderer field="gender" options={GENDER_OPTIONS} required value={form.gender} error={errors.gender} fieldState={getFieldState('gender')} onChange={updateField} onBlur={handleBlur} />
                  <FieldRenderer field="country" options={COUNTRY_OPTIONS} required value={form.country} error={errors.country} fieldState={getFieldState('country')} onChange={updateField} onBlur={handleBlur} />
                </div>

                {/* District (conditional) */}
                {form.country === 'Bangladesh' && (
                  <FieldRenderer
                    field="district"
                    options={availableDistricts.map(d => ({ value: d, label: d }))}
                    required
                    value={form.district}
                    error={errors.district}
                    fieldState={getFieldState('district')}
                    onChange={updateField}
                    onBlur={handleBlur}
                  />
                )}
                {form.country === 'International' && (
                  <FieldRenderer
                    field="district"
                    required
                    placeholder="Enter your city or region"
                    value={form.district}
                    error={errors.district}
                    fieldState={getFieldState('district')}
                    onChange={updateField}
                    onBlur={handleBlur}
                  />
                )}

                {/* Address */}
                <FieldRenderer field="address" type="textarea" required value={form.address} error={errors.address} fieldState={getFieldState('address')} onChange={updateField} onBlur={handleBlur} />

                {/* Minimal File Upload */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Profile Image <span className="text-slate-300 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer w-full"
                    />
                    {avatarPreview && (
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-200">
                          <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password (new users only) */}
                {!isAuthenticated && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-700">Account Security</span>
                    </div>
                    <FieldRenderer
                      field="password"
                      required
                      value={form.password}
                      error={errors.password}
                      fieldState={getFieldState('password')}
                      onChange={updateField}
                      onBlur={handleBlur}
                      isAuthenticated={isAuthenticated}
                    />
                    {form.password.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getPasswordStrength(form.password).bg}`}
                              style={{ width: `${getPasswordStrength(form.password).score}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-medium ${getPasswordStrength(form.password).color}`}>
                            {getPasswordStrength(form.password).label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {PASSWORD_REQUIREMENTS.map((req, idx) => {
                            const passed = req.test(form.password)
                            return (
                              <div key={idx} className={`flex items-center gap-1.5 text-[10px] ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {passed ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                                {req.label}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Control Block */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Secure Profile &amp; Securing Seat Ledger...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Submit &amp; Proceed to Secure Payment</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
