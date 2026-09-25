'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { studentAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, Calendar, Image as ImageIcon, MapPin,
  BookOpen, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle,
  Upload, X, ChevronRight, Shield, Award, GraduationCap,
  Heart, PhoneCall, Building, Globe, ChevronLeft, Check
} from 'lucide-react'

const COURSES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'app-development', label: 'App Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
]

const GENDERS = [
  { value: 'male', label: 'Male', icon: User },
  { value: 'female', label: 'Female', icon: User },
  { value: 'other', label: 'Other', icon: User },
]

interface FormData {
  name: string
  father_name: string
  mother_name: string
  email: string
  phone: string
  alternative_phone: string
  date_of_birth: string
  gender: string
  nid_passport: string
  country: string
  city: string
  address: string
  educational_background: string
  institution: string
  course: string
  emergency_contact_name: string
  emergency_contact_number: string
  password: string
}

interface FormErrors {
  [key: string]: string
}

const initialForm: FormData = {
  name: '', father_name: '', mother_name: '', email: '',
  phone: '', alternative_phone: '', date_of_birth: '', gender: '',
  nid_passport: '', country: '', city: '', address: '',
  educational_background: '', institution: '', course: '',
  emergency_contact_name: '', emergency_contact_number: '', password: '',
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

function validateForm(form: FormData, image: File | null): FormErrors {
  const errors: FormErrors = {}

  if (!form.name.trim()) errors.name = 'Full name is required'
  else if (!/^[A-Za-z\s]+$/.test(form.name)) errors.name = 'Only letters and spaces allowed'

  if (!form.father_name.trim()) errors.father_name = "Father's name is required"
  else if (!/^[A-Za-z\s]+$/.test(form.father_name)) errors.father_name = 'Only letters and spaces allowed'

  if (!form.mother_name.trim()) errors.mother_name = "Mother's name is required"
  else if (!/^[A-Za-z\s]+$/.test(form.mother_name)) errors.mother_name = 'Only letters and spaces allowed'

  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format'

  if (!form.phone.trim()) errors.phone = 'Mobile number is required'
  else if (!/^\d{10,15}$/.test(form.phone.replace(/[\s\-()]/g, ''))) errors.phone = 'Enter 10–15 digits'

  if (form.alternative_phone && !/^\d{10,15}$/.test(form.alternative_phone.replace(/[\s\-()]/g, ''))) {
    errors.alternative_phone = 'Enter 10–15 digits'
  }

  if (!form.gender) errors.gender = 'Select your gender'

  if (!form.country.trim()) errors.country = 'Country is required'

  if (!form.address.trim()) errors.address = 'Address is required'

  if (!form.course) errors.course = 'Select a course'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8) errors.password = 'At least 8 characters'

  if (image && image.size > 2 * 1024 * 1024) {
    errors.image = 'Image must be under 2MB'
  }

  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [detectedCountry, setDetectedCountry] = useState('')

  useEffect(() => {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale
      const detected = locale.split('-')[1] || ''
      setDetectedCountry(detected)
      if (detected) {
        setForm(prev => ({ ...prev, country: detected }))
      }
    } catch {}
  }, [])

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (touched.has(field)) {
      const newForm = { ...form, [field]: value }
      const newErrors = validateForm(newForm, profileImage)
      setErrors(prev => {
        const updated = { ...prev }
        if (newErrors[field]) updated[field] = newErrors[field]
        else delete updated[field]
        return updated
      })
    }
  }, [form, touched, profileImage])

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field))
    const newErrors = validateForm(form, profileImage)
    setErrors(prev => {
      const updated = { ...prev }
      if (newErrors[field]) updated[field] = newErrors[field]
      else delete updated[field]
      return updated
    })
  }, [form, profileImage])

  const totalFields = 18
  const filledFields = Object.entries(form).filter(([k, v]) => {
    if (k === 'alternative_phone') return false
    return v.toString().trim().length > 0
  }).length + (profileImage ? 1 : 0)
  const progressPct = Math.min(Math.round((filledFields / totalFields) * 100), 100)

  const handleImageSelect = (file: File | null) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    setProfileImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setErrors(prev => { const c = { ...prev }; delete c.image; return c })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleImageSelect(e.dataTransfer.files?.[0] || null)
  }

  const clearForm = () => {
    setForm(initialForm)
    setErrors({})
    setTouched(new Set())
    setProfileImage(null)
    setImagePreview(null)
    setStep(1)
    toast.success('Form cleared')
  }

  const fillTestData = () => {
    const testData: FormData = {
      name: 'John Doe',
      father_name: 'Robert Doe',
      mother_name: 'Sarah Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      alternative_phone: '0987654321',
      date_of_birth: '2000-01-15',
      gender: 'male',
      nid_passport: 'A12345678',
      country: 'United States',
      city: 'New York',
      address: '123 Main Street, Apt 4B, New York, NY 10001',
      educational_background: "Bachelor's Degree in Computer Science",
      institution: 'MIT',
      course: 'web-development',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_number: '1234567891',
      password: 'Test@1234',
    }
    setForm(testData)
    setTouched(new Set(Object.keys(testData)))
    setErrors({})
    toast.success('Test data loaded')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = new Set<string>(Object.keys(form))
    allTouched.add('image')
    setTouched(allTouched)

    const validation = validateForm(form, profileImage)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      toast.error('Please fix the highlighted errors')
      const firstErrorField = Object.keys(validation)[0]
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById(firstErrorField)?.focus()
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('father_name', form.father_name)
      fd.append('mother_name', form.mother_name)
      fd.append('email', form.email)
      fd.append('phone', form.phone)
      if (form.alternative_phone) fd.append('alternative_phone', form.alternative_phone)
      if (form.date_of_birth) fd.append('date_of_birth', form.date_of_birth)
      fd.append('gender', form.gender)
      if (form.nid_passport) fd.append('nid_passport', form.nid_passport)
      fd.append('country', form.country)
      if (form.city) fd.append('city', form.city)
      fd.append('address', form.address)
      if (form.educational_background) fd.append('educational_background', form.educational_background)
      if (form.institution) fd.append('institution', form.institution)
      fd.append('course_id', '1')
      fd.append('course_title', COURSES.find(c => c.value === form.course)?.label || form.course)
      fd.append('course_price', '0')
      fd.append('emergency_contact_name', form.emergency_contact_name)
      fd.append('emergency_contact_number', form.emergency_contact_number)
      fd.append('password', form.password)
      fd.append('role', 'student')
      if (profileImage) fd.append('image', profileImage)

      const res = await studentAPI.register(fd)
      const data = res.data?.data

      if (data?.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        useAuthStore.getState().setUser(data.user)
      }

      toast.success('Registration successful!')
      const courseId = data?.course?.id || 1
      setTimeout(() => router.push(`/student-information?courseId=${courseId}`), 1500)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed'
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors) {
        const backendErrors: FormErrors = {}
        Object.entries(fieldErrors).forEach(([key, msgs]) => {
          backendErrors[key] = (msgs as string[])[0]
        })
        setErrors(prev => ({ ...prev, ...backendErrors }))
        toast.error(Object.values(backendErrors)[0] || msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const FieldError = ({ field }: { field: string }) => {
    if (!touched.has(field) || !errors[field]) return null
    return (
      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    )
  }

  const inputClass = (field: string) => {
    const base = 'w-full py-2.5 px-3.5 text-sm rounded-xl border bg-white transition-all duration-150 focus:outline-none focus:ring-0 placeholder:text-slate-300'
    if (touched.has(field) && errors[field]) {
      return `${base} border-red-300 bg-red-50/30 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`
    }
    if (touched.has(field) && !errors[field] && form[field as keyof FormData]?.toString().trim()) {
      return `${base} border-emerald-200 bg-emerald-50/10 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)]`
    }
    return `${base} border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)]`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
              <defs>
                <linearGradient id="regLogoBg" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#0B3B24" />
                  <stop offset="100%" stopColor="#1F4D3C" />
                </linearGradient>
                <linearGradient id="regL2eGem" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#FF8A36" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <filter id="regSd">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#FF8A36" floodOpacity="0.4" />
                </filter>
              </defs>
              <circle cx="18" cy="18" r="16" fill="url(#regLogoBg)" />
              <circle cx="18" cy="18" r="14" stroke="white" strokeOpacity="0.06" fill="none" />
              <circle cx="26" cy="26" r="8" fill="#FF8A36" opacity="0.06" />
              <rect x="9.5" y="7.5" width="5" height="15" rx="2.5" fill="white" />
              <rect x="9.5" y="18.5" width="13" height="5" rx="2.5" fill="white" />
              <path d="M15 16L19.5 11.5L24 16L19.5 20.5Z" fill="url(#regL2eGem)" filter="url(#regSd)" />
              <path d="M19.5 10V11.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 11.5L19.5 10L21 11.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="text-lg font-bold text-slate-800">Learn<span className="text-[#FF8A36]">2</span>Earn</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={clearForm} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
            <button onClick={fillTestData} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors">
              <Check className="w-3 h-3" /> Fill Test Data
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Student Registration</h1>
          <p className="text-slate-500 mt-1">Fill in your details to enroll in a course</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Form Progress</span>
            <span className="text-xs font-semibold text-emerald-600">{progressPct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">{filledFields} of {totalFields} fields filled</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Personal Information</h2>
                <p className="text-[11px] text-slate-400">Basic details about the student</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => updateField('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`${inputClass('name')} pl-10`}
                    />
                  </div>
                  <FieldError field="name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Father&apos;s Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="father_name"
                      type="text"
                      placeholder="Robert Doe"
                      value={form.father_name}
                      onChange={e => updateField('father_name', e.target.value)}
                      onBlur={() => handleBlur('father_name')}
                      className={`${inputClass('father_name')} pl-10`}
                    />
                  </div>
                  <FieldError field="father_name" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mother&apos;s Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="mother_name"
                      type="text"
                      placeholder="Sarah Doe"
                      value={form.mother_name}
                      onChange={e => updateField('mother_name', e.target.value)}
                      onBlur={() => handleBlur('mother_name')}
                      className={`${inputClass('mother_name')} pl-10`}
                    />
                  </div>
                  <FieldError field="mother_name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => updateField('date_of_birth', e.target.value)}
                      onBlur={() => handleBlur('date_of_birth')}
                      className={`${inputClass('date_of_birth')} pl-10`}
                    />
                  </div>
                  <FieldError field="date_of_birth" />
                </div>
              </div>

              {/* Gender - Radio Buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Gender <span className="text-red-400">*</span></label>
                <div className="flex gap-3">
                  {GENDERS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => { updateField('gender', g.value); handleBlur('gender') }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                        form.gender === g.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        form.gender === g.value ? 'border-emerald-500' : 'border-slate-300'
                      }`}>
                        {form.gender === g.value && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </div>
                      {g.label}
                    </button>
                  ))}
                </div>
                <FieldError field="gender" />
              </div>
            </div>
          </div>

          {/* Section 2: Profile Image */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Profile Image</h2>
                <p className="text-[11px] text-slate-400">Upload a passport-size photo</p>
              </div>
            </div>
            <div className="p-6">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700">{profileImage?.name}</p>
                      <p className="text-xs text-slate-400">{(profileImage?.size || 0) > 1024 * 1024
                        ? `${((profileImage?.size || 0) / (1024 * 1024)).toFixed(1)} MB`
                        : `${((profileImage?.size || 0) / 1024).toFixed(0)} KB`
                      }</p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setProfileImage(null); setImagePreview(null) }}
                        className="text-xs text-red-500 hover:text-red-600 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Drop image here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP · Max 2MB</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="flex items-center gap-1 text-[11px] text-red-500 mt-2"><AlertCircle className="w-3 h-3" />{errors.image}</p>}
            </div>
          </div>

          {/* Section 3: Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Contact Information</h2>
                <p className="text-[11px] text-slate-400">How to reach you</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`${inputClass('email')} pl-10`}
                  />
                </div>
                <FieldError field="email" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="phone"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567890"
                      value={form.phone}
                      onChange={e => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 15))}
                      onBlur={() => handleBlur('phone')}
                      className={`${inputClass('phone')} pl-10`}
                    />
                  </div>
                  <FieldError field="phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Alternative Mobile</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="alternative_phone"
                      type="text"
                      inputMode="numeric"
                      placeholder="0987654321"
                      value={form.alternative_phone}
                      onChange={e => updateField('alternative_phone', e.target.value.replace(/\D/g, '').slice(0, 15))}
                      onBlur={() => handleBlur('alternative_phone')}
                      className={`${inputClass('alternative_phone')} pl-10`}
                    />
                  </div>
                  <FieldError field="alternative_phone" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">NID / Passport Number</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="nid_passport"
                    type="text"
                    placeholder="A12345678"
                    value={form.nid_passport}
                    onChange={e => updateField('nid_passport', e.target.value)}
                    onBlur={() => handleBlur('nid_passport')}
                    className={`${inputClass('nid_passport')} pl-10`}
                  />
                </div>
                <FieldError field="nid_passport" />
              </div>
            </div>
          </div>

          {/* Section 4: Address */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Address Details</h2>
                <p className="text-[11px] text-slate-400">Your current location</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Country <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="country"
                      type="text"
                      placeholder="United States"
                      value={form.country}
                      onChange={e => updateField('country', e.target.value)}
                      onBlur={() => handleBlur('country')}
                      className={`${inputClass('country')} pl-10`}
                    />
                  </div>
                  <FieldError field="country" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">City</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="city"
                      type="text"
                      placeholder="New York"
                      value={form.city}
                      onChange={e => updateField('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      className={`${inputClass('city')} pl-10`}
                    />
                  </div>
                  <FieldError field="city" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Address <span className="text-red-400">*</span></label>
                <textarea
                  id="address"
                  placeholder="123 Main Street, Apt 4B, New York, NY 10001"
                  value={form.address}
                  onChange={e => updateField('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  rows={3}
                  className={`${inputClass('address')} resize-none`}
                />
                <FieldError field="address" />
              </div>
            </div>
          </div>

          {/* Section 5: Education & Course */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Education & Course</h2>
                <p className="text-[11px] text-slate-400">Your background and course selection</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Educational Background</label>
                  <input
                    id="educational_background"
                    type="text"
                    placeholder="Bachelor's Degree in CS"
                    value={form.educational_background}
                    onChange={e => updateField('educational_background', e.target.value)}
                    onBlur={() => handleBlur('educational_background')}
                    className={inputClass('educational_background')}
                  />
                  <FieldError field="educational_background" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Institution Name</label>
                  <input
                    id="institution"
                    type="text"
                    placeholder="MIT"
                    value={form.institution}
                    onChange={e => updateField('institution', e.target.value)}
                    onBlur={() => handleBlur('institution')}
                    className={inputClass('institution')}
                  />
                  <FieldError field="institution" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Course Selection <span className="text-red-400">*</span></label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <select
                    id="course"
                    value={form.course}
                    onChange={e => updateField('course', e.target.value)}
                    onBlur={() => handleBlur('course')}
                    className={`${inputClass('course')} pl-10 appearance-none`}
                  >
                    <option value="">Select a course</option>
                    {COURSES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
                </div>
                <FieldError field="course" />
              </div>
            </div>
          </div>

          {/* Section 6: Emergency Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Emergency Contact</h2>
                <p className="text-[11px] text-slate-400">Who to reach in case of emergency</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Emergency Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="emergency_contact_name"
                      type="text"
                      placeholder="Jane Doe"
                      value={form.emergency_contact_name}
                      onChange={e => updateField('emergency_contact_name', e.target.value)}
                      onBlur={() => handleBlur('emergency_contact_name')}
                      className={`${inputClass('emergency_contact_name')} pl-10`}
                    />
                  </div>
                  <FieldError field="emergency_contact_name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Emergency Contact Number</label>
                  <div className="relative">
                    <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="emergency_contact_number"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567891"
                      value={form.emergency_contact_number}
                      onChange={e => updateField('emergency_contact_number', e.target.value.replace(/\D/g, '').slice(0, 15))}
                      onBlur={() => handleBlur('emergency_contact_number')}
                      className={`${inputClass('emergency_contact_number')} pl-10`}
                    />
                  </div>
                  <FieldError field="emergency_contact_number" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Account Security */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Account Security</h2>
                <p className="text-[11px] text-slate-400">Create a secure password</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={e => updateField('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`${inputClass('password')} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError field="password" />

                {/* Password Strength */}
                {form.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(form.password).bg}`}
                          style={{ width: `${getPasswordStrength(form.password).score}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-medium ${getPasswordStrength(form.password).color}`}>
                        {getPasswordStrength(form.password).label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PASSWORD_REQUIREMENTS.map((req, idx) => {
                        const passed = req.test(form.password)
                        return (
                          <div key={idx} className={`flex items-center gap-1.5 text-[11px] ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {passed ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-slate-300" />
                            )}
                            {req.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Complete Registration
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
