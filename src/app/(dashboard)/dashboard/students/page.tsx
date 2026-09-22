'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { studentsAPI, adminAPI, coursesAPI } from '@/lib/api'
import {
  Search,
  Users,
  Mail,
  Phone,
  BookOpen,
  Clock,
  MoreHorizontal,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Shield,
  Eye,
  MessageSquare,
  StickyNote,
  KeyRound,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Activity,
  Award,
  Banknote,
  BarChart3,
  Flame,
  Video,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  Wifi,
  Moon,
  ClipboardList,
  CalendarCheck,
  Sparkles,
  Trophy,
  ChevronRight,
  X,
  Filter,
  Star,
  PlayCircle,
  MapPin,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { formatDate, formatDateRelative } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface CourseLite {
  id: number
  title: string
  thumbnail?: string | null
  instructor_name?: string
}

interface EnrolledCourse {
  id: number
  course: CourseLite | null
  progress: number
  status: string
  completed: boolean
  enrolled_at: string
}

interface Student {
  id: number
  name: string
  email: string
  username: string
  avatar: string | null
  phone: string | null
  student_id: string | null
  city: string | null
  division: string | null
  country: string | null
  institution: string | null
  payment_status: string | null
  enrollment_status: string | null
  skills: string[]
  interests: string[]
  is_online: boolean
  last_activity: string | null
  created_at: string
  status: string
  enrolled_courses: number
  completed_courses: number
  average_progress: number
  xp: number | null
  level: number | null
  attendance_rate: number | null
  attendance_total: number | null
  attendance_present: number | null
  submissions_count: number | null
  streak?: number
  rank?: number | null
  certificates_count?: number
  quiz_average?: number | null
  study_hours?: number
  weekly_activity?: number
  current_lesson?: string | null
  next_live_class?: { title: string; date: string; time: string; duration: number; starts_at: string } | null
  mentor?: string | null
  learning_track?: string | null
  badges_earned?: number
  bio?: string | null
  goal?: string | null
  career_goal?: string | null
  skill_level?: string | null
  learning_hours?: string | null
  educational_background?: string | null
  assignment_completion?: { submitted: number; total: number; percentage: number }
  enrollments: EnrolledCourse[]
}

type SortKey = 'default' | 'name' | 'xp' | 'level' | 'streak' | 'progress' | 'attendance' | 'quiz' | 'study' | 'certs' | 'rank' | 'lastLogin' | 'joined'

const healthScore = (s: Student): number => {
  const progress = Math.min(s.average_progress || 0, 100)
  const attendance = s.attendance_rate ?? 50
  const study = Math.min((s.study_hours || 0) / 100, 1) * 100
  const streak = Math.min((s.streak || 0) / 10, 1) * 100
  const activity = Math.min((s.weekly_activity || 0) / 20, 1) * 100
  return Math.round(progress * 0.4 + attendance * 0.25 + study * 0.15 + streak * 0.1 + activity * 0.1)
}

interface CourseOption {
  id: number
  title: string
  category: string | null
  instructorId: number | null
  instructorName: string | null
}

type StatusFilter = 'all' | 'active' | 'online' | 'offline' | 'new' | 'completed' | 'at-risk' | 'suspended' | 'graduated'

const statusPills: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'online', label: 'Online' },
  { key: 'offline', label: 'Offline' },
  { key: 'new', label: 'New' },
  { key: 'completed', label: 'Completed' },
  { key: 'at-risk', label: 'At Risk' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'graduated', label: 'Graduated' },
]

function statusBadgeVariant(status: string): 'success' | 'warning' | 'secondary' | 'destructive' {
  if (status === 'active' || status === 'graduated') return 'success'
  if (status === 'at-risk') return 'warning'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

function avgOf(values: (number | null | undefined)[]): number {
  const nums = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

const cardBase = 'bg-white border border-[#E9E7F5] shadow-sm'

function SummaryCard({
  icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  accent: string
  sub?: ReactNode
}) {
  return (
    <Card className={cardBase}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center shrink-0`}>{icon}</div>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-[#0F1B3D] leading-none">{value}</div>
            <div className="text-[11px] text-[#536078] mt-1.5 truncate">{label}</div>
            {sub && <div className="text-[10px] text-[#94A3B8] mt-0.5">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatTile({ icon, label, value, iconBg }: { icon: ReactNode; label: string; value: ReactNode; iconBg: string }) {
  return (
    <Card className={cardBase}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
          <div className="min-w-0">
            <div className="text-base font-bold text-[#0F1B3D] leading-tight truncate">{value}</div>
            <div className="text-[10px] text-[#536078] mt-0.5 leading-snug">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveClassCountdown({ startsAt, title }: { startsAt: string; title?: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(startsAt).getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return (
    <div className="flex items-center gap-2 text-[10px] min-w-0">
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/25 text-[#3E1CA0] min-w-0">
        <Video className="w-3 h-3 shrink-0" />
        <span className="font-medium truncate">{title ? `Live: ${title}` : 'Live class'}</span>
      </span>
      <span className="font-semibold text-[#0F1B3D] tabular-nums shrink-0">
        {d > 0 ? `${d}d ` : ''}{h}h {m}m
      </span>
      <span className="text-[#94A3B8] hidden md:inline shrink-0">until live</span>
    </div>
  )
}

function formatDuration(sec?: number | null): string {
  if (!sec || sec <= 0) return '—'
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function ActionChip({ children, onClick }: { children: ReactNode; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#536078] hover:text-[#0F1B3D] hover:border-[#3E1CA0]/40 hover:bg-[#3E1CA0]/10 transition-all"
    >
      {children}
    </button>
  )
}

function ringColor(p: number) {
  if (p >= 80) return '#3E1CA0'
  if (p >= 50) return '#3E1CA0'
  if (p >= 30) return '#3E1CA0'
  return '#3E1CA0'
}

function ProgressRing({ value, size = 54, strokeWidth = 4, className }: { value: number; size?: number; strokeWidth?: number; className?: string }) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(Math.max(value || 0, 0), 100)
  const off = c - (pct / 100) * c
  return (
    <div className={`relative shrink-0 ${className || ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E9E7F5" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor(pct)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[11px] font-bold text-[#0F1B3D]">{pct}%</span>
        <span className="text-[7px] text-[#94A3B8] uppercase tracking-wider mt-0.5">Progress</span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-28 bg-[#F3EEFF]/60 animate-pulse rounded" />
          <div className="h-3 w-56 bg-[#F3EEFF]/60 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-[#F3EEFF]/60 animate-pulse rounded-xl" />
          <div className="h-9 w-28 bg-[#F3EEFF]/60 animate-pulse rounded-xl" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className={cardBase}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3EEFF]/60 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-6 w-10 bg-[#F3EEFF]/60 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-[#F3EEFF]/60 animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className={`${cardBase} overflow-hidden`}>
        <div className="px-5 py-3 text-xs font-medium text-[#536078] uppercase tracking-wider bg-[#F3EEFF]">
          Loading students...
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-[#E9E7F5] last:border-0">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3EEFF]/60 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-[#F3EEFF]/60 animate-pulse rounded" />
                <div className="h-3 w-44 bg-[#F3EEFF]/60 animate-pulse rounded" />
              </div>
            </div>
            <div className="col-span-2"><div className="h-4 w-24 bg-[#F3EEFF]/60 animate-pulse rounded" /></div>
            <div className="col-span-2"><div className="h-1.5 w-full bg-[#F3EEFF]/60 animate-pulse rounded-full" /></div>
            <div className="col-span-2"><div className="h-4 w-16 bg-[#F3EEFF]/60 animate-pulse rounded" /></div>
            <div className="col-span-2"><div className="h-5 w-16 bg-[#F3EEFF]/60 animate-pulse rounded-full" /></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#3E1CA0]/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[#3E1CA0]" />
      </div>
      <h3 className="text-lg font-semibold mb-1 text-[#0F1B3D]">Failed to load students</h3>
      <p className="text-sm text-[#536078] mb-4 max-w-sm">{message}</p>
      <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 rounded-xl border-[#E9E7F5]">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </Button>
    </div>
  )
}

export default function StudentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState<'name' | 'id' | 'email' | 'phone' | 'username'>('name')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [courseFilter, setCourseFilter] = useState<number | ''>('')
  const [instructorFilter, setInstructorFilter] = useState<number | ''>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [progressMin, setProgressMin] = useState<string>('')
  const [showHardError, setShowHardError] = useState(false)
  const [studentsStuck, setStudentsStuck] = useState(false)
  const [attendanceMin, setAttendanceMin] = useState<string>('')
  const [lastLogin, setLastLogin] = useState<string>('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkMessage, setBulkMessage] = useState(false)
  const [bulkMessageText, setBulkMessageText] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', bio: '' })
  const [addError, setAddError] = useState<string | null>(null)

  const [messageStudent, setMessageStudent] = useState<Student | null>(null)
  const [messageText, setMessageText] = useState('')

  const [noteStudent, setNoteStudent] = useState<Student | null>(null)
  const [noteForm, setNoteForm] = useState({ note: '', category: 'general', important: false })

  const [resetStudent, setResetStudent] = useState<Student | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  const [suspendStudent, setSuspendStudent] = useState<Student | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['students-dashboard'],
    queryFn: () => studentsAPI.getDashboard().then((r) => r.data?.data ?? r.data),
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    isError: studentsError,
    isFetching: studentsFetching,
    dataUpdatedAt: studentsUpdatedAt,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () =>
      studentsAPI
        .getAll({ per_page: 200 })
        .then((r) => {
          const raw = r.data?.users || r.data?.data || r.data
          return (Array.isArray(raw) ? raw : raw?.data || []) as Student[]
        }),
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const {
    data: coursesResponse,
  } = useQuery({
    queryKey: ['courses', 'student-filters'],
    queryFn: () => coursesAPI.getAll({ per_page: 200 }).then((r) => r.data?.data ?? r.data),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const students = studentsResponse || []
  const isStudent = user?.role === 'student'
  const selfStudent = students.find((s) => s.id === user?.id)
  const courseList = selfStudent?.enrollments?.filter((e) => e.course) || []

  const { data: myBundle } = useQuery({
    queryKey: ['student-bundle', 'mine', user?.id],
    queryFn: () => studentsAPI.getProfileBundle(user!.id).then((r) => r.data?.data ?? r.data),
    enabled: Boolean(isStudent && user?.id),
    staleTime: 0,
    refetchInterval: 60_000,
  })

  const myAtt = myBundle?.attendance || {}
  const myCoursesArr = myBundle?.courses || []
  const classesCompleted = myCoursesArr.reduce((s: number, c: any) => s + (c.lessons_completed || 0), 0)
  const totalClasses = myAtt.total ?? (myAtt.present || 0) + (myAtt.absent || 0)
  const classStats = {
    total: (myAtt.total ?? 0) || totalClasses,
    present: myAtt.present ?? 0,
    absent: myAtt.absent ?? 0,
    late: myAtt.late ?? 0,
    rate: myAtt.rate ?? 0,
    completed: classesCompleted,
  }
  const academyStats = {
    total: students.reduce((s, x) => s + (x.attendance_total || 0), 0),
    present: students.reduce((s, x) => s + (x.attendance_present || 0), 0),
    absent: 0,
    completed: students.reduce((s, x) => s + (x.completed_courses || 0), 0),
    enrolled: students.reduce((s, x) => s + (x.enrolled_courses || 0), 0),
  }
  academyStats.absent = Math.max(0, academyStats.total - academyStats.present)
  const courses: CourseOption[] = useMemo(() => {
    const raw = coursesResponse
    const list = Array.isArray(raw) ? raw : raw?.data || []
    return list.map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category || null,
      instructorId: c.user_id ?? c.instructor?.id ?? null,
      instructorName: c.instructor?.name || null,
    }))
  }, [coursesResponse])

  const instructors = useMemo(() => {
    const map = new Map<number, string>()
    courses.forEach((c) => {
      if (c.instructorId && c.instructorName) map.set(c.instructorId, c.instructorName)
    })
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [courses])

  const trackOptions = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((c) => {
      const track = c.category || c.title
      if (!map.has(track)) map.set(track, c.id)
    })
    return Array.from(map, ([track, courseId]) => ({ track, courseId }))
  }, [courses])

  const paymentOptions = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => s.payment_status && set.add(s.payment_status))
    return Array.from(set).sort()
  }, [students])

  const now = Date.now()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      if (statusFilter === 'online' && !s.is_online) return false
      if (statusFilter === 'offline' && s.is_online) return false
      if (statusFilter === 'new' && new Date(s.created_at) < new Date(weekAgo)) return false
      if (statusFilter === 'completed' && !(s.completed_courses > 0 || s.enrollment_status === 'graduated')) return false
      if (statusFilter === 'graduated' && s.status !== 'graduated' && s.enrollment_status !== 'graduated') return false
      if (statusFilter === 'at-risk' && s.status !== 'at-risk') return false
      if (statusFilter === 'suspended' && s.status !== 'suspended') return false
      if (statusFilter === 'active' && s.status !== 'active') return false

      if (courseFilter !== '') {
        const has = s.enrollments?.some((e) => e.course?.id === courseFilter)
        if (!has) return false
      }
      if (instructorFilter !== '') {
        const has = s.enrollments?.some((e) => e.course?.instructor_name && courses.some((c) => c.id === e.course?.id && c.instructorId === instructorFilter))
        if (!has) return false
      }
      if (paymentFilter && s.payment_status !== paymentFilter) return false
      if (progressMin !== '' && s.average_progress < Number(progressMin)) return false
      if (attendanceMin !== '' && (s.attendance_rate === null || s.attendance_rate < Number(attendanceMin))) return false
      if (lastLogin) {
        const la = s.last_activity ? new Date(s.last_activity).getTime() : null
        if (lastLogin === 'never') {
          if (la !== null) return false
        } else {
          if (la === null) return false
          if (lastLogin === 'today') {
            const start = new Date().setHours(0, 0, 0, 0)
            if (la < start) return false
          } else if (lastLogin === 'week') {
            if (la < new Date(now - 7 * 24 * 60 * 60 * 1000).getTime()) return false
          } else if (lastLogin === 'month') {
            if (la < new Date(now - 30 * 24 * 60 * 60 * 1000).getTime()) return false
          }
        }
      }

      if (q) {
        let fieldValue = ''
        if (searchField === 'name') fieldValue = s.name
        else if (searchField === 'id') fieldValue = `${s.id} ${s.student_id || ''}`
        else if (searchField === 'email') fieldValue = s.email
        else if (searchField === 'phone') fieldValue = s.phone || ''
        else if (searchField === 'username') fieldValue = s.username
        if (!fieldValue.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [students, statusFilter, courseFilter, instructorFilter, paymentFilter, progressMin, attendanceMin, lastLogin, search, searchField, now, weekAgo, courses])

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'Default order' },
    { key: 'name', label: 'Name' },
    { key: 'xp', label: 'XP' },
    { key: 'level', label: 'Level' },
    { key: 'streak', label: 'Streak' },
    { key: 'progress', label: 'Progress' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'quiz', label: 'Quiz Avg' },
    { key: 'study', label: 'Study Hours' },
    { key: 'certs', label: 'Certificates' },
    { key: 'rank', label: 'Rank' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'joined', label: 'Joined' },
  ]

  const sortedStudents = useMemo(() => {
    const arr = [...filtered]
    if (sortKey === 'default') return arr
    const get = (s: Student): number | string => {
      switch (sortKey) {
        case 'name':
          return s.name?.toLowerCase() ?? ''
        case 'xp':
          return s.xp ?? 0
        case 'level':
          return s.level ?? 0
        case 'streak':
          return s.streak ?? 0
        case 'progress':
          return s.average_progress ?? 0
        case 'attendance':
          return s.attendance_rate ?? -1
        case 'quiz':
          return s.quiz_average ?? -1
        case 'study':
          return s.study_hours ?? 0
        case 'certs':
          return s.certificates_count ?? 0
        case 'rank':
          return s.rank ?? Number.MAX_SAFE_INTEGER
        case 'lastLogin':
          return s.last_activity ? new Date(s.last_activity).getTime() : -1
        case 'joined':
          return s.created_at ? new Date(s.created_at).getTime() : 0
        default:
          return 0
      }
    }
    arr.sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va)
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const displayStudents = isStudent ? (selfStudent ? [selfStudent] : []) : sortedStudents

  const allVisibleSelected = sortedStudents.length > 0 && sortedStudents.every((s) => selectedIds.has(s.id))

  const atRiskStudents = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000
    return students
      .filter((s) => s.status === 'at-risk' || s.average_progress < 30 || (s.attendance_rate !== null && s.attendance_rate < 40))
      .map((s) => {
        const reasons: string[] = []
        if (s.status === 'at-risk') reasons.push('Flagged')
        if (s.average_progress < 30) reasons.push(`Progress ${s.average_progress}%`)
        if (s.attendance_rate !== null && s.attendance_rate < 40) reasons.push(`Attendance ${s.attendance_rate}%`)
        if (s.last_activity && new Date(s.last_activity).getTime() < cutoff) reasons.push('Inactive 14d+')
        return { student: s, reasons }
      })
      .sort((a, b) => a.student.average_progress - b.student.average_progress)
  }, [students])

  const courseDist = useMemo(() => {
    const m = new Map<string, number>()
    students.forEach((s) => {
      const t = s.learning_track || s.enrollments?.find((e) => e.course)?.course?.title || '—'
      m.set(t, (m.get(t) || 0) + 1)
    })
    return Array.from(m, ([track, count]) => ({ track, count })).sort((a, b) => b.count - a.count)
  }, [students])

  const d = dashboard as any

  const total = d?.total_students ?? students.length
  const active = students.filter((s) => s.status === 'active').length
  const online = d?.online_students ?? students.filter((s) => s.is_online).length
  const offline = Math.max(total - online, 0)
  const newWeek = students.filter((s) => new Date(s.created_at) >= new Date(weekAgo)).length
  const atRisk = students.filter((s) => s.status === 'at-risk').length
  const graduated = d?.graduated_students ?? students.filter((s) => s.status === 'graduated' || s.enrollment_status === 'graduated').length
  const suspended = d?.suspended_students ?? students.filter((s) => s.status === 'suspended').length
  const attendanceRate = avgOf(students.map((s) => s.attendance_rate))
  const avgProgress = avgOf(students.map((s) => s.average_progress))
  const submissionsTotal = d?.total_submissions ?? students.reduce((a, s) => a + (s.submissions_count || 0), 0)
  const certificates = d?.certificates_count ?? 0
  const totalRevenue = d?.total_revenue ?? 0
  const pendingPayments = d?.pending_payments ?? 0
  const completedEnrollments = d?.completed_enrollments ?? 0
  const maxWeekly = Math.max(...students.map((s) => s.weekly_activity || 0), 1)

  const tabCounts: Record<string, number> = {
    all: total,
    active,
    online,
    offline,
    new: newWeek,
    completed: students.filter((s) => s.completed_courses > 0 || s.enrollment_status === 'graduated').length,
    'at-risk': atRisk,
    suspended,
    graduated,
  }

  const createStudentMutation = useMutation({
    mutationFn: (data: typeof addForm) => studentsAPI.create({ ...data, role: 'student' }),
    onSuccess: () => {
      toast.success('Student added successfully')
      setShowAddModal(false)
      setAddForm({ name: '', email: '', password: '', phone: '', bio: '' })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students-dashboard'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add student')
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) => studentsAPI.sendMessage(id, { message }),
    onSuccess: () => {
      toast.success('Message sent')
      setMessageStudent(null)
      setMessageText('')
    },
    onError: () => toast.error('Failed to send message'),
  })

  const addNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { note: string; category: string; important: boolean } }) =>
      studentsAPI.addNote(id, data),
    onSuccess: () => {
      toast.success('Note added')
      setNoteStudent(null)
      setNoteForm({ note: '', category: 'general', important: false })
    },
    onError: () => toast.error('Failed to add note'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => studentsAPI.update(id, { password }),
    onSuccess: () => {
      toast.success('Password reset')
      setResetStudent(null)
      setResetPassword('')
    },
    onError: () => toast.error('Failed to reset password'),
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'suspended' | 'active' }) =>
      adminAPI.manageUser(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'suspended' ? 'Student suspended' : 'Student activated')
      setSuspendStudent(null)
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students-dashboard'] })
    },
    onError: () => toast.error('Failed to update student status'),
  })

  const bulkMessageMutation = useMutation({
    mutationFn: ({ ids, message }: { ids: number[]; message: string }) =>
      Promise.all(ids.map((id) => studentsAPI.sendMessage(id, { message }))),
    onSuccess: (_, vars) => {
      toast.success(`Message sent to ${vars.ids.length} students`)
      setBulkMessage(false)
      setBulkMessageText('')
      setSelectedIds(new Set())
    },
    onError: () => toast.error('Failed to send messages'),
  })

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: 'suspended' | 'active' }) =>
      Promise.all(ids.map((id) => adminAPI.manageUser(id, { status }))),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'suspended' ? `${vars.ids.length} students suspended` : `${vars.ids.length} students activated`)
      setSelectedIds(new Set())
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students-dashboard'] })
    },
    onError: () => toast.error('Failed to update students'),
  })

  const toCsv = (list: Student[]) => {
    const headers = ['Name', 'ID', 'Username', 'Email', 'Phone', 'Status', 'Enrolled', 'Completed', 'Progress', 'XP', 'Level', 'Attendance', 'Submissions', 'Payment Status', 'Joined']
    const rows = list.map((s) => [
      `"${s.name}"`,
      `"${s.student_id || s.id}"`,
      `"${s.username}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      s.status,
      s.enrolled_courses,
      s.completed_courses,
      `${s.average_progress}%`,
      s.xp ?? '',
      s.level ?? '',
      s.attendance_rate !== null ? `${s.attendance_rate}%` : '',
      s.submissions_count ?? '',
      `"${s.payment_status || ''}"`,
      `"${formatDate(s.created_at)}"`,
    ])
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    downloadCsv(toCsv(sortedStudents), 'students.csv')
    toast.success('Students exported')
  }

  const handleExportSelected = () => {
    const selected = students.filter((s) => selectedIds.has(s.id))
    downloadCsv(toCsv(selected), 'selected-students.csv')
    toast.success(`${selected.length} students exported`)
  }

  const handleAddStudent = () => {
    setAddError(null)
    if (!addForm.name || !addForm.email || !addForm.password) {
      setAddError('Name, email, and password are required.')
      return
    }
    createStudentMutation.mutate(addForm)
  }

  const hasActiveFilters =
    statusFilter !== 'all' ||
    courseFilter !== '' ||
    instructorFilter !== '' ||
    paymentFilter !== '' ||
    progressMin !== '' ||
    attendanceMin !== '' ||
    lastLogin !== ''

  const clearFilters = () => {
    setStatusFilter('all')
    setCourseFilter('')
    setInstructorFilter('')
    setPaymentFilter('')
    setProgressMin('')
    setAttendanceMin('')
    setLastLogin('')
  }

  // Transient fetch failures auto-recover via the 30s background refetch, so a
  // hard error screen is only shown once a failure has persisted for a while.
  useEffect(() => {
    const failing = dashboardError && studentsError && !studentsResponse && !dashboard
    if (!failing) {
      setShowHardError(false)
      return
    }
    const t = setTimeout(() => setShowHardError(true), 12_000)
    return () => clearTimeout(t)
  }, [dashboardError, studentsError, studentsResponse, dashboard])

  useEffect(() => {
    if (!studentsError || studentsResponse) {
      setStudentsStuck(false)
      return
    }
    const t = setTimeout(() => setStudentsStuck(true), 12_000)
    return () => clearTimeout(t)
  }, [studentsError, studentsResponse])

  if (dashboardLoading && studentsLoading) return <LoadingSkeleton />
  if (showHardError && dashboardError && studentsError) {
    return (
      <ErrorState
        message="We could not load the student directory. Please try again."
        onRetry={() => {
          refetchDashboard()
          refetchStudents()
        }}
      />
    )
  }
  if (!studentsResponse && !dashboard) return <LoadingSkeleton />

  return (
    <div className="space-y-6 mx-auto w-full max-w-[900px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D] tracking-tight">{isStudent ? 'My Student Profile' : 'Students'}</h1>
          <p className="text-xs text-[#536078] mt-1">
            {isStudent ? 'Your personal learning data at a glance.' : 'View, manage, and track every learner in your academy.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStudent ? null : (
            <>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-xl border-[#E9E7F5]" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
              <Button className="h-9 gap-2 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-3.5 h-3.5" />
                Add Student
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      {!isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
        <SummaryCard icon={<Users className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Total Students" value={total} sub={`${completedEnrollments} completed enrollments`} />
        <SummaryCard icon={<CheckCircle className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Active" value={active} sub="enrolled in live courses" />
        <SummaryCard icon={<Wifi className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Online Now" value={online} sub="active in last 5 min" />
        <SummaryCard icon={<Moon className="w-5 h-5 text-[#536078]" />} accent="bg-[#3E1CA0]/10" label="Offline" value={offline} sub="not currently active" />
        <SummaryCard icon={<UserPlus className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="New This Week" value={`+${newWeek}`} sub="joined recently" />
        <SummaryCard icon={<AlertTriangle className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="At Risk" value={atRisk} sub="avg progress below 30%" />
        <SummaryCard icon={<GraduationCap className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Graduated" value={graduated} sub="finished all courses" />
        <SummaryCard icon={<Shield className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Suspended" value={suspended} sub="account disabled" />
        <SummaryCard icon={<CalendarCheck className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Attendance Rate" value={`${attendanceRate}%`} sub="average attendance" />
        <SummaryCard icon={<ClipboardList className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Submissions" value={submissionsTotal} sub="across the academy" />
        <SummaryCard icon={<TrendingUp className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Avg Progress" value={`${avgProgress}%`} sub="across all courses" />
        <SummaryCard icon={<Sparkles className="w-5 h-5 text-[#3E1CA0]" />} accent="bg-[#3E1CA0]/10" label="Certificates" value={certificates} sub="issued to date" />
        </motion.div>
      )}

      {/* Academy classes & attendance */}
      {!isStudent && (
        <Card className={cardBase}>
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#3E1CA0]" />
              Classes & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatTile icon={<BookOpen className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Total Classes" value={academyStats.total} />
              <StatTile icon={<CheckCircle className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Present" value={academyStats.present} />
              <StatTile icon={<X className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Absent" value={academyStats.absent} />
              <StatTile icon={<BookOpen className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Enrolled Classes" value={academyStats.enrolled} />
              <StatTile icon={<Award className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Completed Classes" value={academyStats.completed} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filter Pills */}
      {!isStudent && (
        <div className="flex items-center gap-2 flex-wrap">
        {statusPills.map((pill) => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(pill.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === pill.key
                ? 'bg-[#3E1CA0]/20 text-[#3E1CA0] border border-[#3E1CA0]/30'
                : 'bg-[#EEF4FF] text-[#536078] border border-[#E9E7F5] hover:border-[#E9E7F5] hover:text-[#0F1B3D]'
            }`}
          >
            {pill.label}
            <span className="ml-1.5 text-[10px] opacity-60">({tabCounts[pill.key]})</span>
          </button>
        ))}
        </div>
      )}

      {/* Toolbar */}
      {!isStudent && (
      <>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536078]" />
          <Input
            placeholder={`Search by ${searchField}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-white"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-[#E9E7F5] bg-[#EEF4FF] text-[11px]">
          {(['name', 'id', 'email', 'phone', 'username'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSearchField(f)}
              className={`px-3 h-9 transition-colors capitalize ${searchField === f ? 'bg-[#3E1CA0]/20 text-[#3E1CA0]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className={`h-9 gap-2 text-xs rounded-xl border-[#E9E7F5] ${showFilters || hasActiveFilters ? 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-white text-[#3E1CA0] text-[9px] font-bold flex items-center justify-center">
              {[courseFilter !== '', instructorFilter !== '', paymentFilter !== '', progressMin !== '', attendanceMin !== '', lastLogin !== ''].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs rounded-xl text-[#536078] hover:text-[#0F1B3D]" onClick={clearFilters}>
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-2xl border border-[#E9E7F5] bg-white p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-[#3E1CA0]" />
            <span className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">Show students</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Course / Track</Label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
              >
                <option value="">All Courses</option>
                {trackOptions.map((t) => (
                  <option key={t.courseId} value={t.courseId}>{t.track}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Instructor</Label>
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
              >
                <option value="">All Instructors</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Payment Status</Label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
              >
                <option value="">Any</option>
                {paymentOptions.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Min Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={progressMin}
                onChange={(e) => setProgressMin(e.target.value)}
                placeholder="e.g. 50"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Min Attendance (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={attendanceMin}
                onChange={(e) => setAttendanceMin(e.target.value)}
                placeholder="e.g. 70"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-[#536078] uppercase tracking-wider">Last Login</Label>
              <select
                value={lastLogin}
                onChange={(e) => setLastLogin(e.target.value)}
                className="w-full h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
              >
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#3E1CA0]" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort students"
            className="h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
          >
            {sortOptions.map((o) => (
              <option key={o.key} value={o.key}>
                Sort by: {o.label}
              </option>
            ))}
          </select>
        </div>
        {sortKey !== 'default' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="h-9 gap-1.5 rounded-xl border-[#E9E7F5] text-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortDir === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStudents()
            refetchDashboard()
          }}
          className="h-9 gap-1.5 rounded-xl border-[#E9E7F5] text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${studentsFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <div className="flex items-center gap-1.5 pl-1">
          <input
            type="checkbox"
            aria-label="Select all students"
            className="w-4 h-4 rounded cursor-pointer accent-[#3E1CA0]"
            checked={allVisibleSelected}
            onChange={(e) => {
              if (e.target.checked) setSelectedIds(new Set(sortedStudents.map((s) => s.id)))
              else setSelectedIds(new Set())
            }}
          />
          <span className="text-[10px] text-[#536078] select-none">Select all</span>
        </div>
        <span className="text-[10px] text-[#94A3B8] ml-auto hidden sm:block">
          {studentsUpdatedAt > 0 && <>Updated {new Date(studentsUpdatedAt).toLocaleTimeString()} · </>}
          Sorted by <span className="text-[#536078] capitalize">{sortKey === 'default' ? 'default order' : sortKey.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
        </span>
      </div>
      </>
      )}

      {/* Student live status */}
      {isStudent && (
        <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
          {studentsUpdatedAt > 0 && <span>Updated {new Date(studentsUpdatedAt).toLocaleTimeString()}</span>}
          <span className="ml-auto">Showing your student record only</span>
        </div>
      )}

      {/* Bulk selection bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#3E1CA0]/25 bg-[#3E1CA0]/5 px-4 py-2.5"
        >
          <span className="text-xs font-semibold text-[#3E1CA0]">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={handleExportSelected}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => { setBulkMessageText(''); setBulkMessage(true) }}>
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => bulkStatusMutation.mutate({ ids: Array.from(selectedIds), status: 'active' })}>
            <Shield className="w-3.5 h-3.5" />
            Activate
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => bulkStatusMutation.mutate({ ids: Array.from(selectedIds), status: 'suspended' })}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Suspend
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs rounded-xl text-[#536078] hover:text-[#0F1B3D]" onClick={() => setSelectedIds(new Set())}>
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        </motion.div>
      )}

      {/* Main: Card Grid */}
      <div className="space-y-6">
        {studentsLoading || (studentsError && !studentsStuck) ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#E9E7F5] bg-white p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F3EEFF]/60 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 bg-[#F3EEFF]/60 animate-pulse rounded" />
                    <div className="h-3 w-24 bg-[#F3EEFF]/60 animate-pulse rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div key={j} className="h-14 bg-[#F3EEFF]/60 animate-pulse rounded-xl" />
                  ))}
                </div>
                <div className="h-1.5 w-full bg-[#F3EEFF]/60 animate-pulse rounded-full" />
                <div className="h-8 w-full bg-[#F3EEFF]/60 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        ) : studentsError && studentsStuck ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-[#536078]/40 mb-4" />
            <h3 className="text-lg font-medium mb-1 text-[#0F1B3D]">Failed to load students</h3>
            <p className="text-sm text-[#536078] mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetchStudents()} variant="outline" size="sm" className="gap-2 rounded-xl border-[#E9E7F5]">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-[#536078]/40 mb-4" />
            <h3 className="text-lg font-medium mb-1 text-[#0F1B3D]">No students yet</h3>
            <p className="text-sm text-[#536078]">Get started by adding your first student.</p>
          </div>
        ) : isStudent && !selfStudent ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-[#536078]/40 mb-4" />
            <h3 className="text-lg font-medium mb-1 text-[#0F1B3D]">Student record not found</h3>
            <p className="text-sm text-[#536078]">Your student record could not be loaded.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-[#536078]/40 mb-4" />
            <h3 className="text-lg font-medium mb-1 text-[#0F1B3D]">No students found</h3>
            <p className="text-sm text-[#536078]">Try adjusting your search or filters.</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2 rounded-xl border-[#E9E7F5]" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          </div>
        ) : (
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
            initial="hidden"
            animate="show"
            className={`grid gap-4 ${isStudent ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'}`}
          >
            {displayStudents.map((student) => {
              const att = student.attendance_rate
              const quiz = student.quiz_average
              const assignment = student.assignment_completion || { submitted: 0, total: 0, percentage: 0 }
              const nextClass = student.next_live_class
              const courseList = student.enrollments?.filter((e) => e.course) || []
              const track = courseList[0]?.course?.title || student.learning_track || '—'
              const payment = student.payment_status
              const kpis = [
                { label: 'XP', value: student.xp ?? 0, icon: <Trophy className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Level', value: student.level ?? 1, icon: <Activity className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Streak', value: `${student.streak ?? 0}d`, icon: <Flame className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Badges', value: student.badges_earned ?? 0, icon: <Star className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Attend', value: att !== null ? `${att}%` : '—', icon: <CalendarCheck className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Quiz Avg', value: quiz !== null ? `${quiz}%` : '—', icon: <ClipboardList className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Study', value: `${student.study_hours ?? 0}h`, icon: <Clock className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Certs', value: student.certificates_count ?? 0, icon: <Award className="w-3 h-3 text-[#3E1CA0]" /> },
                { label: 'Rank', value: student.rank ? `#${student.rank}` : '—', icon: <TrendingUp className="w-3 h-3 text-[#3E1CA0]" /> },
              ]
              const weeklyPct = Math.min(Math.round(((student.weekly_activity || 0) / maxWeekly) * 100), 100)
              return (
                <motion.div key={student.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                  {isStudent ? (
                    <div className="relative overflow-hidden rounded-3xl border border-[#E9E7F5] bg-white">
                      {/* Hero banner */}
                      <div className="relative overflow-hidden px-5 sm:px-6 pt-6 pb-5 bg-gradient-to-br from-[#F3EEFF] via-[#EEF4FF]/60 to-white">
                        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-[#3E1CA0]/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-[#3E1CA0]/10 blur-3xl pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(109,61,245,0.05)_1px,transparent_0)] [background-size:20px_20px] opacity-40 pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative shrink-0">
                              <ProfileAvatar src={student.avatar || null} name={student.name} size="xl" className="ring-2 ring-[#3E1CA0]/30 ring-offset-2 ring-offset-white" />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${student.is_online ? 'bg-[#3E1CA0]' : 'bg-slate-600'}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-bold text-[#0F1B3D] tracking-tight truncate">{student.name}</h2>
                                {student.rank != null && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3E1CA0] bg-[#3E1CA0]/10 border border-[#3E1CA0]/25 px-2 py-0.5 rounded-full shrink-0">
                                    <Trophy className="w-3 h-3" /> Rank #{student.rank}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#536078] mt-1">
                                @{student.username}
                                {student.student_id && (
                                  <>
                                    <span className="mx-1.5 text-[#C4C0D6]">·</span>
                                    <span className="font-mono text-[#3E1CA0]/90">{student.student_id}</span>
                                  </>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <Badge variant={statusBadgeVariant(student.status)} className="text-[10px] px-2 py-0 h-5 capitalize">
                                  {student.status === 'active' ? 'Active learner' : student.status}
                                </Badge>
                                {payment && (
                                  <Badge variant={payment === 'completed' ? 'success' : payment === 'pending' ? 'warning' : 'secondary'} className="text-[10px] px-2 py-0 h-5 capitalize">
                                    {payment === 'completed' ? 'Enrollment paid' : payment === 'pending' ? 'Payment due' : payment}
                                  </Badge>
                                )}
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-[#E9E7F5] text-[#536078]">
                                  <Star className="w-3 h-3 text-[#3E1CA0]" /> Level {student.level ?? 1}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="sm:ml-auto flex items-center gap-2 shrink-0">
                            <Button className="h-9 gap-2 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                              View Full Profile
                            </Button>
                          </div>
                        </div>

                        {/* Contact row */}
                        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] text-[#536078]">
                          {student.email && (
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </span>
                          )}
                          {student.phone && (
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                              <span className="truncate">{student.phone}</span>
                            </span>
                          )}
                          {(student.city || student.division || student.country) && (
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                              <span className="truncate">{[student.city, student.division, student.country].filter(Boolean).join(', ')}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 min-w-0 sm:ml-auto">
                            <Wifi className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                            Last active {student.last_activity ? formatDateRelative(student.last_activity) : 'never'}
                          </span>
                        </div>
                      </div>

                      {/* Stat strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-5 sm:p-6">
                        {[
                          { label: 'Courses', value: student.enrolled_courses ?? 0, icon: <BookOpen className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                          { label: 'Completed', value: student.completed_courses ?? 0, icon: <CheckCircle className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                          { label: 'Certificates', value: student.certificates_count ?? 0, icon: <Award className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                          { label: 'XP', value: student.xp ?? 0, icon: <Trophy className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                          { label: 'Streak', value: `${student.streak ?? 0}d`, icon: <Flame className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                          { label: 'Study', value: `${student.study_hours ?? 0}h`, icon: <Clock className="w-4 h-4 text-[#3E1CA0]" />, bg: 'bg-[#3E1CA0]/10' },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-2.5 rounded-2xl bg-[#F3EEFF] border border-[#E9E7F5] px-3 py-2.5">
                            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
                            <div className="min-w-0">
                              <p className="text-base font-bold text-[#0F1B3D] leading-none truncate">{s.value}</p>
                              <p className="text-[10px] text-[#536078] mt-0.5 truncate">{s.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Content grid */}
                      <div className="grid lg:grid-cols-5 gap-5 px-5 sm:px-6 pb-5">
                        {/* Left: progress + courses */}
                        <div className="lg:col-span-3 space-y-4">
                          <div className="rounded-2xl bg-[#F3EEFF] border border-[#E9E7F5] p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="w-4 h-4 text-[#3E1CA0]" />
                              <h3 className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">Learning progress</h3>
                            </div>
                            <div className="flex items-center gap-4">
                              <ProgressRing value={student.average_progress} size={64} strokeWidth={5} />
                              <div className="flex-1 space-y-2.5 min-w-0">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-[#536078] flex items-center gap-1"><Flame className="w-3 h-3 text-[#3E1CA0]" />Weekly activity</span>
                                    <span className="font-semibold text-[#0F1B3D]">{student.weekly_activity ?? 0} events</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${weeklyPct}%` }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-[#536078] flex items-center gap-1"><CalendarCheck className="w-3 h-3 text-[#3E1CA0]" />Attendance</span>
                                    <span className="font-semibold text-[#0F1B3D]">{att !== null ? `${att}%` : '—'}</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${Math.min(att ?? 0, 100)}%` }} />
                                  </div>
                                </div>
                                {assignment.total > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between text-[10px] mb-1">
                                      <span className="text-[#536078] flex items-center gap-1"><ClipboardList className="w-3 h-3 text-[#3E1CA0]" />Assignments</span>
                                      <span className="font-semibold text-[#0F1B3D]">{assignment.submitted}/{assignment.total} submitted</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                                      <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${Math.min(assignment.percentage ?? 0, 100)}%` }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {courseList.length > 0 && (
                            <div className="rounded-2xl bg-[#F3EEFF] border border-[#E9E7F5] p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-[#3E1CA0]" />
                                <h3 className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">Current courses</h3>
                              </div>
                              <div className="space-y-3">
                                {courseList.map((e) => {
                                  const bar = e.progress >= 80 ? 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5]' : e.progress >= 50 ? 'bg-[#3E1CA0]' : e.progress >= 30 ? 'bg-[#6D3DF5]' : 'bg-[#3E1CA0]'
                                  return (
                                    <div key={e.id}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[11px] font-semibold text-[#0F1B3D] truncate flex-1">{e.course?.title || 'Course'}</p>
                                        {e.completed && <Badge variant="success" className="text-[9px] shrink-0">Completed</Badge>}
                                        <span className="text-[10px] font-bold text-[#536078] shrink-0">{e.progress}%</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(Math.max(e.progress, 0), 100)}%` }} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: about + skills */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="rounded-2xl bg-[#F3EEFF] border border-[#E9E7F5] p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="w-4 h-4 text-[#3E1CA0]" />
                              <h3 className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">About</h3>
                            </div>
                            <p className="text-[11px] text-[#536078] leading-relaxed">
                              {student.bio || 'No bio yet — tell us a little about yourself in your full profile.'}
                            </p>
                            {student.career_goal && (
                              <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#3E1CA0]/[0.06] border border-[#3E1CA0]/15 p-2.5">
                                <Target className="w-3.5 h-3.5 text-[#3E1CA0] mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Career goal</p>
                                  <p className="text-[11px] text-[#0F1B3D] font-medium leading-snug">{student.career_goal}</p>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-3">
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Skill level</p>
                                <p className="text-[11px] font-medium text-[#0F1B3D] capitalize mt-0.5">{student.skill_level || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Study / week</p>
                                <p className="text-[11px] font-medium text-[#0F1B3D] capitalize mt-0.5">{student.learning_hours || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Education</p>
                                <p className="text-[11px] font-medium text-[#0F1B3D] capitalize mt-0.5">{student.educational_background || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Joined</p>
                                <p className="text-[11px] font-medium text-[#0F1B3D] mt-0.5">{formatDate(student.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {(student.skills?.length || student.interests?.length) && (
                            <div className="rounded-2xl bg-[#F3EEFF] border border-[#E9E7F5] p-4">
                              <h3 className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-2.5">Skills & interests</h3>
                              <div className="flex flex-wrap gap-1.5">
                                {student.skills?.map((s) => (
                                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 text-[#3E1CA0]">{s}</span>
                                ))}
                                {student.interests?.map((s) => (
                                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 text-[#3E1CA0]">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: learning info + quick links */}
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <div className="rounded-2xl border border-[#E9E7F5] bg-[#EEF4FF] p-4">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GraduationCap className="w-4 h-4 text-[#3E1CA0] shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Track</p>
                                <p className="text-[11px] text-[#0F1B3D] font-medium truncate">{track}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Users className="w-4 h-4 text-[#3E1CA0] shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Mentor</p>
                                <p className="text-[11px] text-[#0F1B3D] font-medium truncate">{student.mentor || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Banknote className="w-4 h-4 text-[#3E1CA0] shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Enrollment</p>
                                <p className="text-[11px] text-[#0F1B3D] font-medium truncate capitalize">
                                  {payment === 'completed' ? 'Paid' : payment === 'pending' ? 'Payment due' : (payment || '—')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Award className="w-4 h-4 text-[#3E1CA0] shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Badges earned</p>
                                <p className="text-[11px] text-[#0F1B3D] font-medium">{student.badges_earned ?? 0}</p>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3 bg-[#E9E7F5]" />
                          <div className="flex flex-wrap gap-1.5">
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}`)}><Eye className="w-3 h-3" />Full Profile</ActionChip>
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=courses`)}><BookOpen className="w-3 h-3" />Courses</ActionChip>
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=attendance`)}><CalendarCheck className="w-3 h-3" />Attendance</ActionChip>
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=assignments`)}><ClipboardList className="w-3 h-3" />Assignments</ActionChip>
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=certificates`)}><Award className="w-3 h-3" />Certificates</ActionChip>
                            <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=payments`)}><Banknote className="w-3 h-3" />Payments</ActionChip>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div
                    className="relative h-full rounded-3xl border border-[#E9E7F5] bg-white p-4 group cursor-pointer hover:border-[#3E1CA0]/30 hover:shadow-[0_8px_30px_rgba(109,61,245,0.08)] transition-all"
                    onClick={() => router.push(`/dashboard/students/${student.id}`)}
                  >
                    {/* Selection checkbox */}
                    {!isStudent && (
                      <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        aria-label={`Select ${student.name}`}
                        className="w-4 h-4 rounded cursor-pointer accent-[#3E1CA0]"
                        checked={selectedIds.has(student.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          setSelectedIds((prev) => {
                            const next = new Set(prev)
                            if (e.target.checked) next.add(student.id)
                            else next.delete(student.id)
                            return next
                          })
                        }}
                      />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <ProfileAvatar src={student.avatar || null} name={student.name} size="md" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${student.is_online ? 'bg-[#3E1CA0]' : 'bg-slate-600'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-[#0F1B3D] truncate group-hover:text-[#3E1CA0] transition-colors">{student.name}</p>
                          {student.rank !== null && student.rank !== undefined && (
                            <span className="text-[9px] font-bold text-[#3E1CA0] bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 px-1.5 py-0.5 rounded-full">#{student.rank}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#536078] truncate">@{student.username} · ID {student.student_id || student.id}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant={statusBadgeVariant(student.status)} className="text-[9px] px-2 py-0 h-5 capitalize">{student.status}</Badge>
                          {payment && (
                            <Badge variant={payment === 'completed' ? 'success' : payment === 'pending' ? 'warning' : 'secondary'} className="text-[9px] px-2 py-0 h-5 capitalize">
                              {payment === 'completed' ? 'Paid' : payment === 'pending' ? 'Payment due' : payment}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="relative" ref={openMenuId === student.id ? menuRef : undefined}>
                        {isStudent ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/students/${student.id}`)
                            }}
                            aria-label="View profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                        <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === student.id ? null : student.id)
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {openMenuId === student.id && (
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-[#E9E7F5] rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                router.push(`/dashboard/students/${student.id}`)
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Profile
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                setMessageStudent(student)
                                setMessageText('')
                              }}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Send Message
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                setNoteStudent(student)
                                setNoteForm({ note: '', category: 'general', important: false })
                              }}
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                              Add Note
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                setResetStudent(student)
                                setResetPassword('')
                              }}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              Reset Password
                            </button>
                            <Separator className="bg-[#E9E7F5]" />
                            <button
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                                student.status === 'suspended'
                                  ? 'text-[#3E1CA0] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10'
                                  : 'text-[#3E1CA0] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                setSuspendStudent(student)
                              }}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {student.status === 'suspended' ? 'Activate Student' : 'Suspend Student'}
                            </button>
                          </div>
                        )}
                        </>
                        )}
                      </div>
                    </div>

                    {/* Track + mentor */}
                    <div className="flex items-center gap-2 mt-3 text-[10px] text-[#536078]">
                      <span className="flex items-center gap-1 min-w-0">
                        <GraduationCap className="w-3 h-3 text-[#3E1CA0] shrink-0" />
                        <span className="truncate">{track}</span>
                      </span>
                      {student.mentor && (
                        <span className="flex items-center gap-1 min-w-0">
                          <BookOpen className="w-3 h-3 text-[#3E1CA0] shrink-0" />
                          <span className="truncate">by {student.mentor}</span>
                        </span>
                      )}
                    </div>

                    {/* KPI grid */}
                    <div className={`grid gap-1.5 mt-3 ${isStudent ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-9' : 'grid-cols-3'}`}>
                      {kpis.map((k) => (
                        <div key={k.label} className="bg-[#F3EEFF] rounded-xl px-2 py-1.5">
                          <div className="flex items-center gap-1">
                            {k.icon}
                            <span className="text-[9px] text-[#94A3B8] truncate">{k.label}</span>
                          </div>
                          <p className="text-xs font-bold text-[#0F1B3D] mt-0.5 truncate">{k.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Health score */}
                    {(() => {
                      const h = healthScore(student)
                      const hColor = h >= 75 ? 'from-[#3E1CA0] to-[#6D3DF5]' : h >= 50 ? 'from-[#3E1CA0] to-[#6D3DF5]' : 'from-[#3E1CA0] to-[#6D3DF5]'
                      return (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[9px] mb-1">
                            <span className="text-[#94A3B8] uppercase tracking-wider">Health score</span>
                            <span className={`font-bold ${h >= 75 ? 'text-[#3E1CA0]' : h >= 50 ? 'text-[#3E1CA0]' : 'text-[#3E1CA0]'}`}>{h}/100</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${hColor} transition-all`} style={{ width: `${h}%` }} />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Progress ring + mini analytics */}
                    <div className="flex items-center gap-3 mt-3">
                      <ProgressRing value={student.average_progress} />
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-[#536078] flex items-center gap-1"><Activity className="w-2.5 h-2.5" />Weekly activity</span>
                            <span className="font-semibold text-[#0F1B3D]">{student.weekly_activity ?? 0} events</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${weeklyPct}%` }} />
                          </div>
                        </div>
                        {assignment.total > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-[#536078] flex items-center gap-1"><ClipboardList className="w-2.5 h-2.5" />Assignments</span>
                              <span className="font-semibold text-[#0F1B3D]">{assignment.submitted}/{assignment.total} · {assignment.percentage ?? 0}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${Math.min(assignment.percentage ?? 0, 100)}%` }} />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-[#536078] flex items-center gap-1"><CalendarCheck className="w-2.5 h-2.5" />Attendance</span>
                            <span className="font-semibold text-[#0F1B3D]">{att !== null ? `${att}%` : '—'}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] transition-all" style={{ width: `${Math.min(att ?? 0, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1 mt-3 text-[10px] text-[#94A3B8]">
                      {student.current_lesson && (
                        <p className="flex items-center gap-1.5 truncate">
                          <PlayCircle className="w-3 h-3 text-[#3E1CA0] shrink-0" />
                          <span className="truncate">Now: {student.current_lesson}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Wifi className="w-3 h-3 shrink-0" />
                        Last login {student.last_activity ? formatDateRelative(student.last_activity) : 'never'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3 h-3 shrink-0" />
                        Joined {formatDate(student.created_at)}
                      </p>
                      {nextClass?.starts_at && (
                        <LiveClassCountdown startsAt={nextClass.starts_at} title={nextClass.title} />
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#E9E7F5]">
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}`)}><Eye className="w-3 h-3" />Profile</ActionChip>
                      <ActionChip onClick={(e) => { e.stopPropagation(); setMessageStudent(student); setMessageText('') }}><MessageSquare className="w-3 h-3" />Message</ActionChip>
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=progress`)}><BarChart3 className="w-3 h-3" />Progress</ActionChip>
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=attendance`)}><CalendarCheck className="w-3 h-3" />Attendance</ActionChip>
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=assignments`)}><ClipboardList className="w-3 h-3" />Assignments</ActionChip>
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=certificates`)}><Award className="w-3 h-3" />Certificates</ActionChip>
                      <ActionChip onClick={() => router.push(`/dashboard/students/${student.id}?tab=payments`)}><Banknote className="w-3 h-3" />Payments</ActionChip>
                      <ActionChip onClick={(e) => { e.stopPropagation(); setNoteStudent(student); setNoteForm({ note: '', category: 'general', important: false }) }}><StickyNote className="w-3 h-3" />Notes</ActionChip>
                    </div>
                  </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
        <p className="text-[11px] text-[#94A3B8] px-1">
          Showing {isStudent ? displayStudents.length : filtered.length} of {isStudent ? displayStudents.length : students.length} students · Click the card to open the full profile dashboard
        </p>

        {/* Student dashboard widgets */}
        {isStudent && selfStudent && (
          <>
            {/* My classes & attendance */}
            <Card className={`${cardBase} relative overflow-hidden`}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3E1CA0]/70 to-transparent" />
              <CardHeader className="pb-3 px-5 pt-4 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4 text-[#3E1CA0]" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-[#0F1B3D] leading-tight">My Classes & Attendance</CardTitle>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{classStats.total} session{classStats.total === 1 ? '' : 's'} recorded</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] rounded-lg text-[#536078] hover:text-[#0F1B3D] shrink-0" onClick={() => router.push(`/dashboard/students/${selfStudent.id}?tab=attendance`)}>
                  Full report <ChevronRight className="w-3 h-3" />
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Attendance ring + legend */}
                  {(() => {
                    const rate = Math.min(Math.max(classStats.rate || 0, 0), 100)
                    const r = 34
                    const c = 2 * Math.PI * r
                    const color = rate >= 80 ? '#3E1CA0' : rate >= 60 ? '#3E1CA0' : '#f87171'
                    return (
                      <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                        <div className="relative w-28 h-28">
                          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r={r} fill="none" stroke="#E9E7F5" strokeWidth="8" />
                            <circle
                              cx="40"
                              cy="40"
                              r={r}
                              fill="none"
                              stroke={color}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={c}
                              strokeDashoffset={c * (1 - rate / 100)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-[#0F1B3D] leading-none">{Math.round(rate)}%</span>
                            <span className="text-[9px] text-[#94A3B8] mt-1">attendance</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 text-[9px] text-[#3E1CA0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3E1CA0]" />{classStats.present} present
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 text-[9px] text-[#3E1CA0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3E1CA0]" />{classStats.late} late
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 text-[9px] text-[#3E1CA0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3E1CA0]" />{classStats.absent} absent
                          </span>
                        </div>
                        <p className="text-[10px] text-[#536078] text-center max-w-[11rem] leading-relaxed">
                          {rate >= 80 ? 'Great consistency, keep it up!' : rate >= 60 ? 'Attending well, try to be on time.' : 'Attendance needs improvement'}
                        </p>
                      </div>
                    )
                  })()}

                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <StatTile icon={<BookOpen className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Total Classes" value={classStats.total} />
                      <StatTile icon={<CheckCircle className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Present" value={classStats.present} />
                      <StatTile icon={<Clock className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Late" value={classStats.late} />
                      <StatTile icon={<X className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Absent" value={classStats.absent} />
                      <StatTile icon={<GraduationCap className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" label="Classes Done" value={classStats.completed} />
                    </div>

                    {/* Distribution bar */}
                    {classStats.total > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] mb-1.5">
                          <span className="text-[#536078]">Session breakdown</span>
                          <span className="text-[#94A3B8]">
                            {Math.round((classStats.present / classStats.total) * 100)}% attended
                          </span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#E9E7F5]">
                          <div className="bg-[#3E1CA0] transition-all" style={{ width: `${(classStats.present / classStats.total) * 100}%` }} />
                          <div className="bg-[#3E1CA0] transition-all" style={{ width: `${(classStats.late / classStats.total) * 100}%` }} />
                          <div className="bg-[#3E1CA0] transition-all" style={{ width: `${(classStats.absent / classStats.total) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent sessions */}
                {(myAtt.history || []).length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E9E7F5]">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[11px] font-semibold text-[#536078]">Recent sessions</p>
                      <span className="text-[10px] text-[#94A3B8]">{myAtt.history.length} recorded</span>
                    </div>
                    <ul className="space-y-1.5">
                      {(myAtt.history || []).slice(0, 5).map((h: any) => (
                        <li key={h.id} className="flex items-center gap-3 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] px-3 py-2">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${h.present ? 'bg-[#3E1CA0]/10' : 'bg-[#3E1CA0]/10'}`}>
                            <CalendarCheck className={`w-3.5 h-3.5 ${h.present ? 'text-[#3E1CA0]' : 'text-[#3E1CA0]'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-[#0F1B3D] truncate">{h.class_title || 'Class session'}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                              {h.date ? formatDate(h.date) : ''}{h.duration_seconds ? ` · ${formatDuration(h.duration_seconds)}` : ''}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${h.present ? 'bg-[#3E1CA0]/10 text-[#3E1CA0]' : 'bg-[#3E1CA0]/10 text-[#3E1CA0]'}`}>
                            {h.present ? 'Present' : 'Absent'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Next live class */}
              <Card className={cardBase}>
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#3E1CA0]" />
                    Next Live Class
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {selfStudent.next_live_class ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3E1CA0]/10 flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 text-[#3E1CA0]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F1B3D] truncate">{selfStudent.next_live_class.title}</p>
                          <p className="text-[10px] text-[#536078] mt-0.5">
                            {formatDate(selfStudent.next_live_class.date)} · {selfStudent.next_live_class.time}
                            {selfStudent.next_live_class.duration ? ` · ${selfStudent.next_live_class.duration} min` : ''}
                          </p>
                        </div>
                      </div>
                      <LiveClassCountdown startsAt={selfStudent.next_live_class.starts_at} title={selfStudent.next_live_class.title} />
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="text-2xl font-bold text-[#0F1B3D]">0</div>
                      <p className="text-[10px] text-[#94A3B8] mt-1">No upcoming sessions yet. New live classes will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card className={cardBase}>
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#3E1CA0]" />
                    Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {(() => {
                    const a = selfStudent.assignment_completion || { submitted: 0, total: 0, percentage: 0 }
                    const pct = Math.min(Math.max(a.percentage || 0, 0), 100)
                    return (
                      <div>
                        <div className="text-2xl font-bold text-[#0F1B3D]">
                          {a.submitted ?? 0}<span className="text-sm text-[#94A3B8] font-medium"> / {a.total ?? 0} submitted</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-[#536078]">Completion</span>
                            <span className="text-[#0F1B3D] font-semibold">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 80 ? 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5]' : pct >= 50 ? 'bg-[#3E1CA0]' : pct > 0 ? 'bg-[#6D3DF5]' : 'bg-[#3E1CA0]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className={cardBase}>
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#3E1CA0]" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selfStudent.payment_status ? (
                      <Badge variant={selfStudent.payment_status === 'completed' ? 'success' : selfStudent.payment_status === 'pending' ? 'warning' : 'secondary'} className="text-[10px] capitalize">
                        {selfStudent.payment_status === 'completed' ? 'Paid' : selfStudent.payment_status === 'pending' ? 'Payment due' : selfStudent.payment_status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">No records</Badge>
                    )}
                    <span className="text-[10px] text-[#536078]">enrollment fees</span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-3">Payment history and plan details are in your full profile.</p>
                </CardContent>
              </Card>

              {/* Learning info */}
              <Card className={cardBase}>
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#3E1CA0]" />
                    Learning Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#536078]">Track</span>
                    <span className="text-[#0F1B3D] font-medium truncate ml-3">{selfStudent.learning_track || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#536078]">Mentor</span>
                    <span className="text-[#0F1B3D] font-medium truncate ml-3">{selfStudent.mentor || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#536078]">Enrolled</span>
                    <span className="text-[#0F1B3D] font-medium truncate ml-3">{selfStudent.enrollments?.length ?? selfStudent.enrolled_courses ?? 0} course(s)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#536078]">Joined</span>
                    <span className="text-[#0F1B3D] font-medium truncate ml-3">{formatDate(selfStudent.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Courses */}
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#3E1CA0]" />
                  My Courses
                  <span className="text-[9px] bg-[#E9E7F5] rounded-full px-1.5 py-0.5 text-[#536078]">{courseList.length}</span>
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs rounded-xl text-[#536078] hover:text-[#0F1B3D]" onClick={() => router.push(`/dashboard/students/${selfStudent.id}?tab=courses`)}>
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {courseList.length > 0 ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {courseList.map((e) => {
                      const bar = e.progress >= 80 ? 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5]' : e.progress >= 50 ? 'bg-[#3E1CA0]' : e.progress >= 30 ? 'bg-[#6D3DF5]' : 'bg-[#3E1CA0]'
                      return (
                        <div key={e.id} className="bg-[#F3EEFF] rounded-2xl p-4 border border-[#E9E7F5]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3E1CA0]/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {e.course?.thumbnail ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 text-[#3E1CA0]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-[#0F1B3D] truncate">{e.course?.title || 'Course'}</p>
                                {e.completed && <Badge variant="success" className="text-[9px] shrink-0">Completed</Badge>}
                              </div>
                              <p className="text-[10px] text-[#536078] truncate mt-0.5">by {e.course?.instructor_name || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <div className="h-1.5 flex-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                              <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(Math.max(e.progress, 0), 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-[#536078]">{e.progress}%</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-1.5 capitalize">{e.status || 'active'}{e.enrolled_at ? ` · enrolled ${formatDate(e.enrolled_at)}` : ''}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <BookOpen className="w-8 h-8 text-[#536078]/40 mb-2" />
                    <p className="text-xs text-[#94A3B8]">You are not enrolled in any courses yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Insights */}
      {!isStudent && (
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className={cardBase}>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3E1CA0]" />
              Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {(() => {
              const trend = d?.enrollment_trend || []
              if (trend.length > 0) {
                const items = Array.isArray(trend) ? trend.slice(-6) : []
                const max = Math.max(...items.map((t: any) => Number(t.count || 0)), 1)
                return (
                  <div className="space-y-2">
                    {items.map((t: any) => {
                      const monthLabel = new Date(`${t.month}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                      return (
                        <div key={t.month} className="flex items-center gap-2.5">
                          <span className="text-[10px] text-[#536078] w-10 shrink-0">{monthLabel}</span>
                          <div className="flex-1 h-5 bg-[#F3EEFF] rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] rounded-sm transition-all"
                              style={{ width: `${(Number(t.count || 0) / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-[#536078] w-5 text-right">{t.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              }
              return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="w-8 h-8 text-[#536078]/30 mb-2" />
                  <p className="text-[11px] text-[#94A3B8]">No growth data available</p>
                </div>
              )
            })()}
            <div className="mt-3 pt-3 border-t border-[#E9E7F5] space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#536078]">Total revenue</span>
                <span className="text-[#0F1B3D] font-semibold">${Number(totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#536078]">Pending payments</span>
                <span className="text-[#3E1CA0] font-semibold">{pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#536078]">Completed enrollments</span>
                <span className="text-[#3E1CA0] font-semibold">{completedEnrollments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardBase}>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#3E1CA0]" />
              Top Students
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {d?.top_students?.length ? (
              <div className="space-y-3">
                {d.top_students.slice(0, 5).map((s: any, i: number) => (
                  <button
                    key={s.id}
                    className="w-full flex items-center gap-3 text-left hover:bg-[#F3EEFF]/60 rounded-xl p-1.5 transition-colors"
                    onClick={() => router.push(`/dashboard/students/${s.id}`)}
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#3E1CA0]/10 flex items-center justify-center text-[10px] font-bold text-[#3E1CA0] shrink-0">
                      {i + 1}
                    </div>
                    <ProfileAvatar src={s.avatar || null} name={s.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#0F1B3D] truncate">{s.name}</p>
                      <p className="text-[10px] text-[#536078] truncate">{s.enrolled_courses_count || 0} courses</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C4C0D6] shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Trophy className="w-8 h-8 text-[#536078]/30 mb-2" />
                <p className="text-[11px] text-[#94A3B8]">No top students yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardBase}>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3E1CA0]" />
              Enrollment by Course
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {courseDist.length > 0 ? (
              <div className="space-y-2">
                {courseDist.slice(0, 7).map((c) => {
                  const max = courseDist[0].count || 1
                  return (
                    <div key={c.track} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-[#536078] w-24 truncate shrink-0">{c.track}</span>
                      <div className="flex-1 h-5 bg-[#F3EEFF] rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] rounded-sm transition-all"
                          style={{ width: `${(c.count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#536078] w-5 text-right">{c.count}</span>
                    </div>
                  )
                })}
                {courseDist.length > 7 && (
                  <p className="text-[10px] text-[#94A3B8] pt-1">+{courseDist.length - 7} more tracks</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="w-8 h-8 text-[#536078]/30 mb-2" />
                <p className="text-[11px] text-[#94A3B8]">No enrollment data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* At-Risk Students */}
      {!isStudent && (
      <Card className={cardBase}>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#3E1CA0]" />
            At-Risk Students
            <span className="ml-auto text-[10px] font-medium text-[#3E1CA0] bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 px-2 py-0.5 rounded-full">{atRiskStudents.length} flagged</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {atRiskStudents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {atRiskStudents.map(({ student: s, reasons }) => {
                const h = healthScore(s)
                return (
                  <button
                    key={s.id}
                    className="text-left rounded-2xl border border-[#3E1CA0]/20 bg-[#3E1CA0]/10 p-3 hover:border-[#3E1CA0]/40 hover:bg-[#3E1CA0]/15 transition-colors"
                    onClick={() => router.push(`/dashboard/students/${s.id}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      <ProfileAvatar src={s.avatar || null} name={s.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#0F1B3D] truncate">{s.name}</p>
                        <p className="text-[10px] text-[#536078] truncate">@{s.username}</p>
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ${h < 50 ? 'text-[#3E1CA0]' : 'text-[#3E1CA0]'}`}>{h}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                      <div className={`h-full rounded-full ${h < 50 ? 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5]' : 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5]'}`} style={{ width: `${h}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reasons.map((r) => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#3E1CA0]/10 text-[#3E1CA0] border border-[#3E1CA0]/20">{r}</span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-8 h-8 text-[#3E1CA0]/40 mb-2" />
              <p className="text-[11px] text-[#94A3B8]">No at-risk students — everyone is on track</p>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Add Student Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Add Student</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Create a new student account manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Full Name *</Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Email *</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Password *</Label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="Min 6 characters"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="e.g. +1234567890"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Bio</Label>
              <Textarea
                value={addForm.bio}
                onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                placeholder="Short description..."
                className="min-h-20 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] resize-none"
              />
            </div>
            {addError && <p className="text-xs text-[#3E1CA0]">{addError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" onClick={handleAddStudent} disabled={createStudentMutation.isPending}>
                {createStudentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                {createStudentMutation.isPending ? 'Creating...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={!!messageStudent} onOpenChange={(open) => !open && setMessageStudent(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Send Message</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {messageStudent ? `Send a message to ${messageStudent.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-24 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setMessageStudent(null)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" onClick={() => {
                  if (messageStudent && messageText.trim()) {
                    sendMessageMutation.mutate({ id: messageStudent.id, message: messageText.trim() })
                  }
                }}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={bulkMessage} onOpenChange={setBulkMessage}>
        <DialogContent className="max-w-md bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Send Message to {selectedIds.size} Students</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              A single message will be sent to every selected student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={bulkMessageText}
              onChange={(e) => setBulkMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-24 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setBulkMessage(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" onClick={() => {
                  if (bulkMessageText.trim()) {
                    bulkMessageMutation.mutate({ ids: Array.from(selectedIds), message: bulkMessageText.trim() })
                  }
                }}
                disabled={!bulkMessageText.trim() || bulkMessageMutation.isPending}
              >
                {bulkMessageMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {bulkMessageMutation.isPending ? 'Sending...' : `Send to ${selectedIds.size}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={!!noteStudent} onOpenChange={(open) => !open && setNoteStudent(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Add Note</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {noteStudent ? `Private note for ${noteStudent.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Note *</Label>
              <Textarea
                value={noteForm.note}
                onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                placeholder="e.g. Follow up on outstanding fee this week..."
                className="min-h-24 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#536078]">Category</Label>
                <select
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  className="w-full h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="attendance">Attendance</option>
                  <option value="payment">Payment</option>
                  <option value="behavior">Behavior</option>
                </select>
              </div>
              <div className="space-y-1.5 flex items-end">
                <label className="flex items-center gap-2 text-xs text-[#536078] cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={noteForm.important}
                    onChange={(e) => setNoteForm({ ...noteForm, important: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#3E1CA0]"
                  />
                  Mark important
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setNoteStudent(null)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90"
                onClick={() => {
                  if (noteStudent && noteForm.note.trim()) {
                    addNoteMutation.mutate({
                      id: noteStudent.id,
                      data: { note: noteForm.note.trim(), category: noteForm.category, important: noteForm.important },
                    })
                  }
                }}
                disabled={!noteForm.note.trim() || addNoteMutation.isPending}
              >
                {addNoteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetStudent} onOpenChange={(open) => !open && setResetStudent(null)}>
        <DialogContent className="max-w-sm bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Reset Password</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {resetStudent ? `Set a new password for ${resetStudent.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">New Password *</Label>
              <Input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setResetStudent(null)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90"
                onClick={() => {
                  if (resetStudent && resetPassword.trim()) {
                    resetPasswordMutation.mutate({ id: resetStudent.id, password: resetPassword.trim() })
                  }
                }}
                disabled={!resetPassword.trim() || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirm Dialog */}
      <Dialog open={!!suspendStudent} onOpenChange={(open) => !open && setSuspendStudent(null)}>
        <DialogContent className="max-w-sm bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">
              {suspendStudent && suspendStudent.status === 'suspended' ? 'Activate Student' : 'Suspend Student'}
            </DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {suspendStudent
                ? suspendStudent.status === 'suspended'
                  ? `Are you sure you want to reactivate ${suspendStudent.name}?`
                  : `Are you sure you want to suspend ${suspendStudent.name}? They will lose platform access.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setSuspendStudent(null)}>
              Cancel
            </Button>
            <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90"
              variant={suspendStudent?.status === 'suspended' ? 'default' : 'destructive'}
              disabled={suspendMutation.isPending}
              onClick={() => {
                if (suspendStudent) {
                  const target = suspendStudent.status === 'suspended' ? 'active' : 'suspended'
                  suspendMutation.mutate({ id: suspendStudent.id, status: target })
                }
              }}
            >
              {suspendMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {suspendMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}