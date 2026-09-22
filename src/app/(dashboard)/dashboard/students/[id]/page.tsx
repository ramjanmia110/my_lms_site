'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { studentsAPI, adminAPI, assignmentsAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Trophy,
  Zap,
  Flame,
  CalendarCheck,
  ClipboardList,
  FileText,
  CheckCircle,
  AlertTriangle,
  Shield,
  KeyRound,
  Download,
  RefreshCw,
  Loader2,
  Clock,
  Award,
  TrendingUp,
  Activity,
  Star,
  Target,
  Trash2,
  Video,
  Banknote,
  FolderOpen,
  LayoutDashboard,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Upload,
  TrendingDown,
  CreditCard,
  Send,
  X,
  Medal,
  CalendarDays,
  Rocket,
  ScrollText,
  Plus,
  Undo2,
  BadgeCheck,
  Wallet,
  Users,
  Lightbulb,
  Search,
  StickyNote,
  History,
  CalendarClock,
  CircleDollarSign,
  ReceiptText,
  FlaskConical,
  PlayCircle,
  PenTool,
  Code2,
  Layers,
  Copy,
  Eye,
  EyeOff,
  Paperclip,
  ListChecks,
  Timer,
  Gauge,
  ExternalLink,
  BookMarked,
  Boxes,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { formatDate, formatDateRelative } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface BundleData {
  student: any
  summary: any
  courses: any[]
  attendance: any
  assignments: any[]
  quizzes: any[]
  projects: any
  certificates: any[]
  payments: any[]
  messages: any[]
  live_classes: any
  progress: any
  activity: any[]
  achievements: any[]
  notes: any[]
  documents: any[]
  analytics: any
  notifications: any[]
  leaderboard: any[]
  leaderboard_position: number
  learning_path: any[]
}

function statusBadgeVariant(status: string): 'success' | 'warning' | 'secondary' | 'destructive' {
  if (status === 'active' || status === 'graduated') return 'success'
  if (status === 'at-risk') return 'warning'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

function progressColor(p: number) {
  if (p >= 80) return 'from-emerald-500 to-teal-400'
  if (p >= 50) return 'from-[#3E1CA0] to-amber-400'
  if (p >= 30) return 'from-amber-500 to-yellow-400'
  return 'from-red-500 to-rose-400'
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const achievementIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  trophy: Trophy,
  award: Award,
  clipboard: ClipboardList,
  send: Send,
  scroll: ScrollText,
  zap: Zap,
  flame: Flame,
  fire: Flame,
  star: Star,
  medal: Medal,
  certificate: Award,
  target: Target,
  'check-circle': CheckCircle,
  'calendar-check': CalendarCheck,
  activity: Activity,
  book: BookOpen,
  pencil: FileText,
}

function AchievementIcon({ icon, className = 'w-4 h-4' }: { icon?: string; className?: string }) {
  const Icon = achievementIconMap[(icon || '').toLowerCase().trim()]
  if (Icon) return <Icon className={`${className} text-[#3E1CA0]`} />
  return <span className="text-sm leading-none">{icon || '🎖️'}</span>
}

const cardBase = 'bg-white border-[#E9E7F5]'

const tabAccents: Record<string, { tile: string; text: string }> = {
  overview: { tile: 'bg-[#3E1CA0]/10', text: 'text-[#3E1CA0]' },
  'learning-path': { tile: 'bg-emerald-500/10', text: 'text-emerald-400' },
  analytics: { tile: 'bg-cyan-500/10', text: 'text-cyan-400' },
  courses: { tile: 'bg-purple-500/10', text: 'text-purple-400' },
  progress: { tile: 'bg-blue-500/10', text: 'text-blue-400' },
  attendance: { tile: 'bg-amber-500/10', text: 'text-amber-400' },
  assignments: { tile: 'bg-rose-500/10', text: 'text-rose-400' },
  projects: { tile: 'bg-pink-500/10', text: 'text-pink-400' },
  certificates: { tile: 'bg-yellow-500/10', text: 'text-yellow-400' },
  payments: { tile: 'bg-emerald-500/10', text: 'text-emerald-400' },
  activity: { tile: 'bg-teal-500/10', text: 'text-teal-400' },
  achievements: { tile: 'bg-orange-500/10', text: 'text-orange-400' },
  files: { tile: 'bg-slate-500/10', text: 'text-[#536078]' },
}

function StatTile({ icon, label, value, accent, iconBg }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: string; iconBg: string }) {
  return (
    <div className="bg-[#F3EEFF] rounded-xl p-2.5 flex flex-col items-center text-center">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center mb-1.5`}>{icon}</div>
      <div className="text-xs font-bold text-[#0F1B3D] leading-none">{value}</div>
      <div className="text-[10px] text-[#536078] mt-1">{label}</div>
      <span className="sr-only">{accent}</span>
    </div>
  )
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#E9E7F5]/60 flex items-center justify-center mb-3">{icon}</div>
      <p className="text-sm font-medium text-[#0F1B3D]">{title}</p>
      {sub && <p className="text-[11px] text-[#94A3B8] mt-1 max-w-xs">{sub}</p>}
    </div>
  )
}

function HeatmapGrid({ data }: { data: { date: string; value: number }[] }) {
  const weeks: { date: string; value: number; key: string }[][] = []
  const sorted = [...(data || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  sorted.forEach((e) => {
    const day = new Date(e.date).getDay()
    const last = weeks[weeks.length - 1]
    if (!last || last.length >= 7) weeks.push([])
    const cur = weeks[weeks.length - 1]
    while (cur.length < day) cur.push({ date: '', value: 0, key: `pad-${cur.length}-${cur.length}` })
    cur.push({ date: e.date, value: e.value, key: e.date })
  })
  const max = Math.max(...sorted.map((e) => e.value), 1)
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = week[di]
              if (!cell || !cell.date) return <div key={`${wi}-${di}`} className="w-3 h-3 rounded-[3px] bg-white/[0.03]" />
              const intensity = cell.value === 0 ? 0.12 : 0.25 + (cell.value / max) * 0.75
              return (
                <div
                  key={cell.key}
                  title={`${formatDate(cell.date)}: ${cell.value} min`}
                  className="w-3 h-3 rounded-[3px]"
                  style={{ backgroundColor: `rgba(109,61,245,${intensity})` }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-[#94A3B8] mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.12, 0.35, 0.6, 0.85, 1].map((o) => (
            <span key={o} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: `rgba(109,61,245,${o})` }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

function AttendanceCalendar({ studentId, initial }: { studentId: number; initial?: { date: string; status: string }[] }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [calData, setCalData] = useState<{ date: string; status: string }[] | null>(null)
  const [loadedKey, setLoadedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`
  const _d = new Date()
  const todayStr = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`
  const currentKey = todayStr.slice(0, 7)
  const isCurrentMonth = monthKey === currentKey

  useEffect(() => {
    let alive = true
    setLoading(true)
    studentsAPI
      .getAttendanceCalendar(studentId, { month: monthKey })
      .then((res: any) => {
        if (!alive) return
        setCalData(res?.data?.data?.days || [])
        setLoadedKey(monthKey)
        setError(false)
      })
      .catch(() => {
        if (!alive) return
        setError(true)
        setCalData([])
        setLoadedKey(monthKey)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [studentId, monthKey])

  const data = loadedKey === monthKey ? (calData ?? []) : isCurrentMonth ? (initial ?? []) : []

  const cells: ({ date: string; status: string } | null)[] = []
  data.forEach((c) => {
    if (cells.length === 0) {
      const pad = new Date(c.date).getDay()
      for (let i = 0; i < pad; i++) cells.push(null)
    }
    cells.push(c)
  })
  const present = data.filter((c) => c.status === 'present').length
  const absent = data.filter((c) => c.status === 'absent').length
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isToday = (d: string) => isCurrentMonth && d === todayStr
  const isWeekend = (d: string) => [0, 6].includes(new Date(d).getDay())
  const isFuture = (d: string) => d > todayStr
  const navBtn =
    'w-7 h-7 rounded-lg bg-[#EFE8D8]/70 hover:bg-[#E5DCC8] active:scale-95 border border-[#D9CDB2] text-[#5C5343] flex items-center justify-center transition-all'

  return (
    <div className="rounded-2xl border border-[#E5DCC8]/70 bg-gradient-to-b from-[#FBF7EE] to-[#F3ECDC] p-4 shadow-[inset_0_1px_0_rgba(109,61,245,0.7)]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous month" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className={navBtn}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold text-[#463F33] min-w-[112px] text-center">{monthLabel}</p>
          <button type="button" aria-label="Next month" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className={navBtn}>
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="ml-1 text-[10px] font-semibold text-[#3E1CA0] hover:text-[#3E1CA0] px-1.5 py-1 rounded-lg border border-[#3E1CA0]/30 hover:bg-[#3E1CA0]/10 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] font-medium shrink-0">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3E1CA0]" />}
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 border border-emerald-600/40 shadow-[inset_0_0_0_1px_rgba(109,61,245,0.3)]" />
            {present} present
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-rose-500 border border-rose-600/40 shadow-[inset_0_0_0_1px_rgba(109,61,245,0.3)]" />
            {absent} absent
          </span>
        </div>
      </div>
      <div className={`grid grid-cols-7 gap-1.5 transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
        {dayNames.map((d) => (
          <span key={d} className="text-center text-[10px] font-medium text-[#8A8171]">{d}</span>
        ))}
        {cells.length === 0 && !loading ? (
          <div className="col-span-7 text-center text-[11px] text-[#8A8171] py-4">{error ? "Couldn't load this month" : 'No records'}</div>
        ) : (
          cells.map((c, i) =>
            c ? (
              (() => {
                const day = new Date(c.date).getDate()
                const weekend = isWeekend(c.date)
                const future = isFuture(c.date)
                const today = isToday(c.date)
                let cell: string, badge: string
                if (today) {
                  cell = 'bg-[#FFF3E4]'
                  badge = 'bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white'
                } else if (c.status === 'present') {
                  cell = 'bg-[#F5EFE3]'
                  badge = 'bg-[#463F33] text-[#FBF6EA] shadow-sm'
                } else if (c.status === 'absent') {
                  cell = 'bg-[#E5DCC8]/60'
                  badge = 'bg-[#CFC3A4] text-[#5C5343]'
                } else if (weekend) {
                  cell = 'bg-transparent'
                  badge = 'bg-transparent text-[#A99F8B]'
                } else if (future) {
                  cell = 'bg-transparent'
                  badge = 'bg-transparent text-[#BDB39D]'
                } else {
                  cell = 'bg-[#EFE8D8]/40'
                  badge = 'bg-[#E2D9C4]/50 text-[#6B6352]'
                }
                return (
                  <div
                    key={c.date}
                    title={`${new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${c.status}`}
                    className={`h-9 rounded-lg flex items-center justify-center ${cell}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${badge}`}>{day}</div>
                  </div>
                )
              })()
            ) : (
              <div key={`pad-${i}`} />
            ),
          )
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-[#E2D9C4]/70 flex items-center justify-between text-[10px] text-[#6B6352]">
        <span>{present > 0 || absent > 0 ? `${Math.round((present / Math.max(present + absent, 1)) * 100)}% attendance this month` : 'No sessions recorded yet'}</span>
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Mon–Fri sessions</span>
      </div>
    </div>
  )
}

function LiveClassCountdown({ date, time }: { date: string; time: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(`${date}T${time}`).getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return (
    <span className="flex items-center gap-2 text-sm font-bold text-[#3E1CA0] tabular-nums shrink-0">
      <Video className="w-4 h-4" />
      {d > 0 ? `${d}d ` : ''}{h}h {m}m
    </span>
  )
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatMoney(amount: number, currency?: string) {
  const symbol = currency === 'BDT' ? '৳' : currency ? `${currency} ` : '$'
  return `${symbol}${Number(amount || 0).toLocaleString()}`
}

function assignmentTypeIcon(type?: string) {
  switch ((type || 'file').toLowerCase()) {
    case 'text':
      return <BookOpen className="w-4 h-4" />
    case 'quiz':
      return <Lightbulb className="w-4 h-4" />
    case 'group':
      return <Users className="w-4 h-4" />
    case 'file':
    default:
      return <FileText className="w-4 h-4" />
  }
}

function projectTypeIcon(type?: string) {
  switch ((type || 'build').toLowerCase()) {
    case 'design':
      return <PenTool className="w-4 h-4" />
    case 'research':
      return <FlaskConical className="w-4 h-4" />
    case 'portfolio':
      return <Layers className="w-4 h-4" />
    case 'build':
    default:
      return <Code2 className="w-4 h-4" />
  }
}

function projectTypeLabel(type?: string) {
  return { build: 'Build', design: 'Design', research: 'Research', portfolio: 'Portfolio' }[(type || 'build').toLowerCase()] || 'Build'
}

const activityMeta: Record<string, { icon: React.ReactNode; cls: string; bg: string }> = {
  attendance: { icon: <CalendarCheck className="w-3.5 h-3.5" />, cls: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  absent: { icon: <CalendarClock className="w-3.5 h-3.5" />, cls: 'text-rose-400', bg: 'bg-rose-500/10' },
  submission: { icon: <ClipboardList className="w-3.5 h-3.5" />, cls: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  payment: { icon: <Banknote className="w-3.5 h-3.5" />, cls: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  certificate: { icon: <Award className="w-3.5 h-3.5" />, cls: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  enrollment: { icon: <BookOpen className="w-3.5 h-3.5" />, cls: 'text-purple-400', bg: 'bg-purple-500/10' },
  note: { icon: <StickyNote className="w-3.5 h-3.5" />, cls: 'text-orange-400', bg: 'bg-orange-500/10' },
  log: { icon: <History className="w-3.5 h-3.5" />, cls: 'text-[#536078]', bg: 'bg-slate-500/10' },
}

function activityBadge(type: string) {
  const m = activityMeta[type] || activityMeta.log
  return (
    <div className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
      <span className={m.cls}>{m.icon}</span>
    </div>
  )
}

function groupActivityByDay(events: any[]) {
  const groups: { label: string; date: string; items: any[] }[] = []
  for (const ev of events) {
    const d = new Date(ev.at)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
    const label = same(d, today)
      ? 'Today'
      : same(d, yesterday)
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const last = groups[groups.length - 1]
    if (!last || last.label !== label) {
      groups.push({ label, date: d.toDateString(), items: [] })
    }
    groups[groups.length - 1].items.push(ev)
  }
  return groups
}

function dueInLabel(dueDate?: string) {
  if (!dueDate) return null
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) {
    const d = Math.abs(Math.round(diff / 86400000))
    return { label: d === 0 ? 'Overdue' : `Overdue ${d}d ago`, overdue: true }
  }
  const d = Math.round(diff / 86400000)
  return { label: d === 0 ? 'Due today' : `Due in ${d}d`, overdue: false }
}

const coursePalette = [
  { tile: 'bg-gradient-to-br from-cyan-500/25 to-cyan-500/[0.06] text-cyan-400 shadow-[0_8px_20px_rgba(34,211,238,0.12)]', dot: 'bg-cyan-400' },
  { tile: 'bg-gradient-to-br from-violet-500/25 to-violet-500/[0.06] text-violet-400 shadow-[0_8px_20px_rgba(167,139,250,0.12)]', dot: 'bg-violet-400' },
  { tile: 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/[0.06] text-emerald-400 shadow-[0_8px_20px_rgba(52,211,153,0.12)]', dot: 'bg-emerald-400' },
  { tile: 'bg-gradient-to-br from-amber-500/25 to-amber-500/[0.06] text-amber-400 shadow-[0_8px_20px_rgba(251,191,36,0.12)]', dot: 'bg-amber-400' },
  { tile: 'bg-gradient-to-br from-rose-500/25 to-rose-500/[0.06] text-rose-400 shadow-[0_8px_20px_rgba(251,113,133,0.12)]', dot: 'bg-rose-400' },
  { tile: 'bg-gradient-to-br from-sky-500/25 to-sky-500/[0.06] text-sky-400 shadow-[0_8px_20px_rgba(56,189,248,0.12)]', dot: 'bg-sky-400' },
  { tile: 'bg-gradient-to-br from-fuchsia-500/25 to-fuchsia-500/[0.06] text-fuchsia-400 shadow-[0_8px_20px_rgba(232,121,249,0.12)]', dot: 'bg-fuchsia-400' },
  { tile: 'bg-gradient-to-br from-orange-500/25 to-orange-500/[0.06] text-orange-400 shadow-[0_8px_20px_rgba(251,146,60,0.12)]', dot: 'bg-orange-400' },
]

function courseStyle(name?: string) {
  let h = 7
  const s = name || 'course'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return coursePalette[h % coursePalette.length]
}

function difficultyMeta(d?: string) {
  if (d === 'hard') return { label: 'Hard', cls: 'text-rose-400' }
  if (d === 'easy') return { label: 'Easy', cls: 'text-emerald-400' }
  return { label: 'Medium', cls: 'text-amber-400' }
}

function assignmentCategoryLabel(cat?: string) {
  const map: Record<string, string> = { homework: 'Homework', quiz: 'Quiz', project: 'Project', exam: 'Exam', exercise: 'Exercise' }
  return map[(cat || 'homework').toLowerCase()] || (cat || 'Homework')
}

function submissionTypeLabel(t?: string) {
  const map: Record<string, string> = { upload: 'File upload', text: 'Text answer', url: 'Link submission', multiple: 'Files + text' }
  return map[(t || 'upload').toLowerCase()] || 'File upload'
}

const VALID_TABS = new Set(['overview', 'learning-path', 'analytics', 'courses', 'progress', 'attendance', 'assignments', 'projects', 'certificates', 'payments', 'activity', 'achievements', 'files'])

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tab')
      if (t && VALID_TABS.has(t)) return t
    }
    return 'overview'
  })
  const [showReset, setShowReset] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [showSuspend, setShowSuspend] = useState(false)

  const [docForm, setDocForm] = useState({ title: '', type: 'other', description: '', file: null as File | null })
  const [showAssignmentCreate, setShowAssignmentCreate] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    course_id: '',
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    start_date: '',
    max_score: 100,
    passing_marks: '',
    type: 'file',
    category: 'homework',
    difficulty: 'medium',
    estimated_minutes: '',
    submission_type: 'upload',
    max_files: 1,
    max_file_size_mb: 20,
    attempts_allowed: 1,
    visibility: 'all',
    status: 'published',
  })
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'graded' | 'pending' | 'late'>('all')
  const [assignmentSearch, setAssignmentSearch] = useState('')
  const [assignmentSort, setAssignmentSort] = useState<'due' | 'title' | 'marks'>('due')
  const [assignmentCourseFilter, setAssignmentCourseFilter] = useState('all')
  const [submitFor, setSubmitFor] = useState<any>(null)
  const [submitText, setSubmitText] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submitFiles, setSubmitFiles] = useState<File[]>([])
  const [gradeFor, setGradeFor] = useState<any>(null)
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' })
  const [deleteFor, setDeleteFor] = useState<any>(null)
  const [detailsFor, setDetailsFor] = useState<any>(null)
  const [detailsData, setDetailsData] = useState<any>(null)
  const [detailsResources, setDetailsResources] = useState<any[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [resourceForm, setResourceForm] = useState<{ title: string; type: string; url: string; description: string; file: File | null }>({ title: '', type: 'link', url: '', description: '', file: null })
  const [showProjectCreate, setShowProjectCreate] = useState(false)
  const [projectForm, setProjectForm] = useState({ course_id: '', title: '', description: '', technologies: '', category: 'build', difficulty: 'medium', max_points: 100, due_date: '' })
  const [showCertUpload, setShowCertUpload] = useState(false)
  const [certForm, setCertForm] = useState({ title: '', description: '', file: null as File | null })
  const [refundTarget, setRefundTarget] = useState<any>(null)
  const [activityFilter, setActivityFilter] = useState('all')

  const {
    data: bundle,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['student-profile-bundle', id],
    queryFn: () => studentsAPI.getProfileBundle(id).then((r) => r.data?.data as BundleData),
    staleTime: 0,
    refetchInterval: 45_000,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => studentsAPI.update(id, { password }),
    onSuccess: () => {
      toast.success('Password reset')
      setShowReset(false)
      setResetPassword('')
    },
    onError: () => toast.error('Failed to reset password'),
  })

  const suspendMutation = useMutation({
    mutationFn: (status: 'suspended' | 'active') => adminAPI.manageUser(id, { status }),
    onSuccess: (_, status) => {
      toast.success(status === 'suspended' ? 'Student suspended' : 'Student activated')
      setShowSuspend(false)
      queryClient.invalidateQueries({ queryKey: ['student-profile-bundle', id] })
    },
    onError: () => toast.error('Failed to update student status'),
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('title', docForm.title)
      fd.append('type', docForm.type)
      fd.append('description', docForm.description)
      if (docForm.file) fd.append('file', docForm.file)
      return studentsAPI.uploadDocument(id, fd)
    },
    onSuccess: () => {
      toast.success('Document uploaded')
      setDocForm({ title: '', type: 'other', description: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['student-profile-bundle', id] })
    },
    onError: () => toast.error('Failed to upload document'),
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (docId: number) => studentsAPI.deleteDocument(id, docId),
    onSuccess: () => {
      toast.success('Document deleted')
      queryClient.invalidateQueries({ queryKey: ['student-profile-bundle', id] })
    },
    onError: () => toast.error('Failed to delete document'),
  })

  const invalidateBundle = () => queryClient.invalidateQueries({ queryKey: ['student-profile-bundle', id] })

  const createAssignmentMutation = useMutation({
    mutationFn: (data: any) => assignmentsAPI.create(data),
    onSuccess: () => {
      toast.success('Assignment created')
      setShowAssignmentCreate(false)
      setAssignmentForm({
        course_id: '',
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        start_date: '',
        max_score: 100,
        passing_marks: '',
        type: 'file',
        category: 'homework',
        difficulty: 'medium',
        estimated_minutes: '',
        submission_type: 'upload',
        max_files: 1,
        max_file_size_mb: 20,
        attempts_allowed: 1,
        visibility: 'all',
        status: 'published',
      })
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create assignment'),
  })

  const submitAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, files, text, url }: { assignmentId: number; files: File[]; text: string; url: string }) => {
      const fd = new FormData()
      fd.append('user_id', String(id))
      if (text) fd.append('text', text)
      if (text) fd.append('notes', text)
      if (url) fd.append('url', url)
      files.forEach((f) => fd.append('files', f))
      return assignmentsAPI.submit(assignmentId, fd)
    },
    onSuccess: () => {
      toast.success('Assignment submitted for review')
      setSubmitFor(null)
      setSubmitText('')
      setSubmitUrl('')
      setSubmitFiles([])
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to submit assignment'),
  })

  const duplicateAssignmentMutation = useMutation({
    mutationFn: (assignmentId: number) => assignmentsAPI.duplicate(assignmentId),
    onSuccess: (res: any) => {
      toast.success(`Duplicated as draft${res?.data?.data?.assignment_code ? ` (${res.data.data.assignment_code})` : ''}`)
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to duplicate assignment'),
  })

  const publishAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: number; status: 'draft' | 'published' }) => assignmentsAPI.publishToggle(assignmentId, status),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || 'Assignment status updated')
      invalidateBundle()
      setDetailsFor(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update status'),
  })

  const withdrawSubmissionMutation = useMutation({
    mutationFn: (submissionId: number) => assignmentsAPI.deleteSubmission(submissionId),
    onSuccess: () => {
      toast.success('Submission withdrawn — back to to-do')
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to withdraw submission'),
  })

  const gradeAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, submissionId, grade, feedback }: { assignmentId: number; submissionId: number; grade: number; feedback: string }) =>
      assignmentsAPI.grade(assignmentId, { submission_id: submissionId, grade, feedback }),
    onSuccess: () => {
      toast.success('Submission graded')
      setGradeFor(null)
      setGradeForm({ grade: '', feedback: '' })
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to grade submission'),
  })

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: number) => assignmentsAPI.delete(assignmentId),
    onSuccess: () => {
      toast.success('Assignment deleted')
      setDeleteFor(null)
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete assignment'),
  })

  const addResourceMutation = useMutation({
    mutationFn: ({ assignmentId }: { assignmentId: number }) => {
      const fd = new FormData()
      fd.append('title', resourceForm.title)
      fd.append('type', resourceForm.type)
      fd.append('description', resourceForm.description)
      if (resourceForm.url) fd.append('url', resourceForm.url)
      if (resourceForm.file) fd.append('file', resourceForm.file)
      return assignmentsAPI.addResource(assignmentId, fd)
    },
    onSuccess: () => {
      toast.success('Resource added')
      setResourceForm({ title: '', type: 'link', url: '', description: '', file: null })
      if (detailsFor) {
        assignmentsAPI.getResources(detailsFor.assignment_id).then((r: any) => setDetailsResources(r?.data?.data || []))
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to add resource'),
  })

  const deleteResourceMutation = useMutation({
    mutationFn: ({ assignmentId, resourceId }: { assignmentId: number; resourceId: number }) => assignmentsAPI.deleteResource(assignmentId, resourceId),
    onSuccess: () => {
      toast.success('Resource deleted')
      if (detailsFor) {
        assignmentsAPI.getResources(detailsFor.assignment_id).then((r: any) => setDetailsResources(r?.data?.data || []))
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete resource'),
  })

  useEffect(() => {
    if (!detailsFor) {
      setDetailsData(null)
      setDetailsResources([])
      return
    }
    setDetailsLoading(true)
    assignmentsAPI
      .getOne(detailsFor.assignment_id)
      .then((r: any) => {
        setDetailsData(r?.data?.data || null)
        return assignmentsAPI.getResources(detailsFor.assignment_id)
      })
      .then((r: any) => setDetailsResources(r?.data?.data || []))
      .catch(() => toast.error('Failed to load assignment details'))
      .finally(() => setDetailsLoading(false))
  }, [detailsFor])

  const createProjectMutation = useMutation({
    mutationFn: () =>
      studentsAPI.createCourseProject(id, {
        course_id: Number(projectForm.course_id),
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        technologies: projectForm.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        type: projectForm.category,
        difficulty: projectForm.difficulty,
        max_points: projectForm.max_points || 100,
        due_date: projectForm.due_date ? new Date(projectForm.due_date).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success('Project created')
      setShowProjectCreate(false)
      setProjectForm({ course_id: '', title: '', description: '', technologies: '', category: 'build', difficulty: 'medium', max_points: 100, due_date: '' })
      invalidateBundle()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create project'),
  })

  const uploadCertificateMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('title', certForm.title)
      fd.append('type', 'certificate')
      fd.append('description', certForm.description)
      if (certForm.file) fd.append('file', certForm.file)
      return studentsAPI.uploadDocument(id, fd)
    },
    onSuccess: () => {
      toast.success('Certificate uploaded')
      setShowCertUpload(false)
      setCertForm({ title: '', description: '', file: null })
      invalidateBundle()
    },
    onError: () => toast.error('Failed to upload certificate'),
  })

  const approvePaymentMutation = useMutation({
    mutationFn: (paymentId: number) => adminAPI.approvePayment(paymentId),
    onSuccess: () => {
      toast.success('Payment approved')
      invalidateBundle()
    },
    onError: () => toast.error('Failed to approve payment'),
  })

  const refundPaymentMutation = useMutation({
    mutationFn: (paymentId: number) => adminAPI.refundPayment(paymentId),
    onSuccess: () => {
      toast.success('Payment refunded')
      setRefundTarget(null)
      invalidateBundle()
    },
    onError: () => toast.error('Failed to refund payment'),
  })

  const exportBlob = (kind: 'pdf' | 'csv') => {
    const fn = kind === 'pdf' ? studentsAPI.exportPdf(id) : studentsAPI.exportCsv(id)
    fn.then((r: any) => saveBlob(r.data, `${(bundle?.student?.name || 'student').replace(/\s+/g, '_')}_report.${kind}`))
      .catch(() => toast.error(`Failed to export ${kind.toUpperCase()}`))
  }

  const downloadDoc = (doc: any) => {
    studentsAPI
      .downloadDocument(id, doc.id)
      .then((r: any) => saveBlob(r.data, `${doc.title || 'document'}.${doc.file_type?.split('/')[1] || 'pdf'}`))
      .catch(() => toast.error('Failed to download document'))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F3EEFF]/60 animate-pulse rounded-xl" />
          <div className="h-6 w-48 bg-[#F3EEFF]/60 animate-pulse rounded" />
        </div>
        <Card className={cardBase}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#F3EEFF]/60 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-[#F3EEFF]/60 animate-pulse rounded" />
              <div className="h-3 w-64 bg-[#F3EEFF]/60 animate-pulse rounded" />
              <div className="h-3 w-40 bg-[#F3EEFF]/60 animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#F3EEFF]/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !bundle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1 text-[#0F1B3D]">Failed to load student profile</h3>
        <p className="text-sm text-[#536078] mb-4 max-w-sm">We could not load this student's profile. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2 rounded-xl border-[#E9E7F5]">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const s = bundle.student
  const isStudentViewer = user?.role === 'student'
  const sum = bundle.summary || {}
  const warnings = sum.warnings || 0
  const courses = bundle.courses || []
  const attendance = bundle.attendance || {}
  const projects = bundle.projects || {}
  const liveClasses = bundle.live_classes || {}
  const progress = bundle.progress || {}
  const isSuspended = s.status === 'suspended'

  const tabs: { key: string; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { key: 'learning-path', label: 'Learning Path', icon: <Target className="w-3.5 h-3.5" />, count: bundle.learning_path?.length || 0 },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'courses', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" />, count: courses.length },
    { key: 'progress', label: 'Progress', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { key: 'assignments', label: 'Assignments', icon: <ClipboardList className="w-3.5 h-3.5" />, count: bundle.assignments.length },
    { key: 'projects', label: 'Projects', icon: <Target className="w-3.5 h-3.5" />, count: sum.projects?.total || 0 },
    { key: 'certificates', label: 'Certificates', icon: <Award className="w-3.5 h-3.5" />, count: bundle.certificates.length },
    { key: 'payments', label: 'Payments', icon: <Banknote className="w-3.5 h-3.5" />, count: bundle.payments.length },
    { key: 'activity', label: 'Activity', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'achievements', label: 'Achievements', icon: <Trophy className="w-3.5 h-3.5" />, count: bundle.achievements.length },
    { key: 'files', label: 'Files', icon: <FolderOpen className="w-3.5 h-3.5" />, count: bundle.documents.length },
  ]

  const trendData = (progress.trend || []).map((t: any) => ({ ...t, label: formatDate(t.date).slice(0, 6) }))

  const xpData = (progress.xp_history || []).map((p: any) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))
  const weeklyAnalytics = bundle.analytics?.weekly || []
  const monthlyAnalytics = bundle.analytics?.monthly || {}
  const attendanceCalendar = bundle.analytics?.attendance_calendar || []
  const leaderboard = bundle.leaderboard || []
  const myPosition = bundle.leaderboard_position || 0
  const learningPath = bundle.learning_path || []

  const monthlyMetrics: { key: string; label: string }[] = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'submissions', label: 'Submissions' },
    { key: 'study_hours', label: 'Study Hours' },
    { key: 'activity', label: 'Activity' },
    { key: 'certificates', label: 'Certificates' },
  ]

  const isAdmin = user?.role === 'admin'
  const canManage = !isStudentViewer

  const certDocuments = bundle.documents.filter((d: any) => d.type === 'certificate')

  const filteredAssignments = (bundle.assignments || []).filter((a: any) => {
    if (assignmentSearch && !`${a.title} ${a.course} ${a.category || ''} ${a.assignment_code || ''}`.toLowerCase().includes(assignmentSearch.toLowerCase())) return false
    if (assignmentCourseFilter !== 'all' && a.course !== assignmentCourseFilter) return false
    if (assignmentFilter === 'assigned') return a.status === 'assigned'
    if (assignmentFilter === 'graded') return a.status === 'graded'
    if (assignmentFilter === 'pending') return a.status !== 'assigned' && a.status !== 'graded'
    if (assignmentFilter === 'late') return a.is_late
    return true
  })
  const sortedAssignments = [...filteredAssignments].sort((a: any, b: any) => {
    if (assignmentSort === 'title') return a.title.localeCompare(b.title)
    if (assignmentSort === 'marks') return (b.max_score || 0) - (a.max_score || 0)
    const da = a.due_date ? new Date(a.due_date).getTime() : 0
    const db = b.due_date ? new Date(b.due_date).getTime() : 0
    return da - db
  })
  const assignedItems = sortedAssignments.filter((a: any) => a.status === 'assigned')
  const submittedItems = sortedAssignments.filter((a: any) => a.status !== 'assigned')

  const allAssignments = bundle.assignments || []
  const assignmentFilterDefs: { key: typeof assignmentFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allAssignments.length },
    { key: 'assigned', label: 'To submit', count: allAssignments.filter((a: any) => a.status === 'assigned').length },
    { key: 'graded', label: 'Graded', count: allAssignments.filter((a: any) => a.status === 'graded').length },
    { key: 'pending', label: 'In review', count: allAssignments.filter((a: any) => a.status !== 'assigned' && a.status !== 'graded').length },
    { key: 'late', label: 'Late', count: allAssignments.filter((a: any) => a.is_late).length },
  ]
  const overdueCount = assignedItems.filter((a: any) => dueInLabel(a.due_date)?.overdue).length
  const upcomingCount = assignedItems.length - overdueCount

  const assignmentCourseOptions = Array.from(new Set((bundle.assignments || []).map((a: any) => a.course).filter(Boolean))) as string[]
  const asgStats = (bundle as any).assignmentStats || sum.assignments || {}

  const activityFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'submission', label: 'Submissions' },
    { key: 'payment', label: 'Payments' },
    { key: 'certificate', label: 'Certificates' },
    { key: 'enrollment', label: 'Enrollments' },
    { key: 'note', label: 'Notes' },
    { key: 'log', label: 'System' },
  ]
  const filteredActivity = (bundle.activity || []).filter((a: any) => {
    if (activityFilter === 'all') return true
    if (activityFilter === 'attendance') return a.type === 'attendance' || a.type === 'absent'
    return a.type === activityFilter
  })

  const paymentFees = (sum.payments?.total_paid || 0) + (sum.payments?.outstanding || 0)
  const paymentProgress = paymentFees > 0 ? Math.min(100, Math.round(((sum.payments?.total_paid || 0) / paymentFees) * 100)) : 0

  return (
    <div className="space-y-6 mx-auto w-full max-w-[900px]">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/students')}
        className="flex items-center gap-1.5 text-xs text-[#536078] hover:text-[#0F1B3D] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Students
      </button>

      {/* Header Card */}
      <Card className={`${cardBase} overflow-hidden`}>
        <div className="relative h-16 overflow-hidden bg-gradient-to-br from-[#F3EEFF] via-[#EEF4FF] to-white border-b border-[#E9E7F5]">
          <div className="absolute -top-10 -right-8 w-48 h-48 rounded-full bg-[#3E1CA0]/10 blur-3xl" />
          <div className="absolute -bottom-14 left-1/3 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-6 select-none pointer-events-none">
            <span className="text-[56px] font-black leading-none text-[#0F1B3D]/[0.04] tracking-tighter">{initialsOf(s.name)}</span>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative shrink-0">
              <ProfileAvatar src={s.avatar || null} name={s.name} size="xl" className="ring-4 ring-[#E9E7F5]" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-4 border-white ${s.is_online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0F1B3D] tracking-tight">{s.name}</h1>
                <Badge variant={statusBadgeVariant(s.status)} className="capitalize text-[10px]">{s.status}</Badge>
                {s.is_online && (
                  <Badge variant="success" className="text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    Online
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#536078] mt-1">@{s.username} · Student ID: {s.student_id || s.id}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-[#536078]">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                {(s.city || s.division) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[s.city, s.division].filter(Boolean).join(', ')}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Joined {formatDate(s.created_at)}</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />Last active {s.last_activity ? formatDateRelative(s.last_activity) : 'never'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!isStudentViewer && (
                <>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => exportBlob('pdf')}>
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => exportBlob('csv')}>
                    <FileText className="w-3.5 h-3.5" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl border-[#E9E7F5]" onClick={() => { setShowReset(true); setResetPassword('') }}>
                    <KeyRound className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className={`h-9 gap-1.5 text-xs rounded-xl ${isSuspended ? '' : 'bg-red-600 hover:bg-red-700'}`}
                    variant={isSuspended ? 'default' : 'default'}
                    onClick={() => setShowSuspend(true)}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {isSuspended ? 'Activate' : 'Suspend'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {warnings > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">{warnings} warning{warnings > 1 ? 's' : ''} for this student</p>
                <p className="text-[11px] text-amber-200/70 mt-0.5">Low progress, poor attendance, pending payments, or inactivity may require follow-up.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatTile icon={<Trophy className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" accent="orange" label="Rank" value={sum.rank ?? '—'} />
        <StatTile icon={<Zap className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10" accent="amber" label="XP" value={sum.xp ?? 0} />
        <StatTile icon={<Activity className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10" accent="emerald" label="Level" value={sum.level ?? 1} />
        <StatTile icon={<Flame className="w-4 h-4 text-orange-400" />} iconBg="bg-orange-500/10" accent="orange2" label="Streak" value={`${sum.streak ?? 0}d`} />
        <StatTile icon={<BookOpen className="w-4 h-4 text-cyan-400" />} iconBg="bg-cyan-500/10" accent="cyan" label="Enrolled" value={sum.enrolled_courses ?? 0} />
        <StatTile icon={<GraduationCap className="w-4 h-4 text-blue-400" />} iconBg="bg-blue-500/10" accent="blue" label="Completed" value={sum.completed_courses ?? 0} />
        <StatTile icon={<BarChart3 className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" accent="orange3" label="Avg Progress" value={`${sum.average_progress ?? 0}%`} />
        <StatTile icon={<CalendarCheck className="w-4 h-4 text-purple-400" />} iconBg="bg-purple-500/10" accent="purple" label="Attendance" value={sum.attendance_rate !== undefined ? `${sum.attendance_rate}%` : '—'} />
      </div>

      {/* Tabs menu bar */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="sticky top-[68px] z-20 rounded-2xl border border-[#E9E7F5] bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E9E7F5] p-2">
          <div className="flex items-center gap-3">
            {/* Leading brand */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 pr-1 shrink-0 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4 text-[#3E1CA0]" />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">Student Dashboard</p>
                <p className="text-[9px] text-[#94A3B8] truncate">{tabs.find((x) => x.key === tab)?.label || 'Overview'} view</p>
              </div>
            </div>
            <Separator className="w-px h-7 bg-white/[0.08] hidden md:block shrink-0" />
            {/* Tab pills */}
            <ScrollArea className="flex-1 min-w-0">
              <TabsList className="inline-flex h-auto w-max items-center gap-1 bg-transparent p-0">
                {tabs.map((t) => {
                  const accent = tabAccents[t.key] || tabAccents.overview
                  return (
                    <TabsTrigger
                      key={t.key}
                      value={t.key}
                      className="gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#536078] hover:text-[#0F1B3D] hover:bg-white/[0.05] transition-colors data-[state=active]:text-[#3E1CA0] data-[state=active]:bg-[#3E1CA0]/[0.12] data-[state=active]:shadow-[inset_0_0_0_1px_rgba(109,61,245,0.25),0_4px_14px_rgba(109,61,245,0.1)]"
                    >
                      <span className={`w-5 h-5 rounded-md ${accent.tile} flex items-center justify-center shrink-0 transition-colors`}>
                        <span className={`${accent.text}`}>{t.icon}</span>
                      </span>
                      {t.label}
                      {t.count !== undefined && t.count > 0 && (
                        <span className="ml-0.5 text-[9px] bg-white/[0.08] rounded-full px-1.5 py-0.5 text-[#536078] data-[state=active]:bg-[#3E1CA0]/20 data-[state=active]:text-[#3E1CA0]">{t.count}</span>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {/* Right: avg progress chip */}
            <div className="hidden xl:flex items-center gap-2.5 pl-2 pr-1 shrink-0">
              <div className="text-right leading-tight">
                <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Avg progress</p>
                <p className="text-[11px] font-bold text-[#0F1B3D]">{sum.average_progress ?? 0}%</p>
              </div>
              <div className="w-16 h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3E1CA0] to-amber-400" style={{ width: `${Math.min(Math.max(sum.average_progress ?? 0, 0), 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left: progress donut + summary */}
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3E1CA0]" />
                  Course Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-center gap-6">
                  <div className="relative w-36 h-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Progress', value: sum.average_progress || 0, color: '#3E1CA0' },
                            { name: 'Remaining', value: Math.max(100 - (sum.average_progress || 0), 0), color: 'rgba(109,61,245,0.06)' },
                          ]}
                          dataKey="value"
                          innerRadius={52}
                          outerRadius={68}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          <Cell fill="#3E1CA0" />
                          <Cell fill="rgba(109,61,245,0.06)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-[#0F1B3D]">{sum.average_progress || 0}%</span>
                      <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider">Avg</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {[
                      { label: 'Enrolled courses', value: sum.enrolled_courses ?? 0 },
                      { label: 'In progress', value: sum.in_progress ?? 0 },
                      { label: 'Completed', value: sum.completed_courses ?? 0 },
                      { label: 'Certificates', value: sum.certificates ?? 0 },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-[#94A3B8]">{row.label}</span>
                        <span className="text-xs font-bold text-[#0F1B3D]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-[#E9E7F5] my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F3EEFF] rounded-xl p-3">
                    <div className="text-xs font-bold text-[#0F1B3D]">{sum.study_time?.total_hours ?? 0}h</div>
                    <div className="text-[10px] text-[#536078]">Total study time</div>
                  </div>
                  <div className="bg-[#F3EEFF] rounded-xl p-3">
                    <div className="text-xs font-bold text-[#0F1B3D]">{sum.study_time?.this_week ?? 0}h</div>
                    <div className="text-[10px] text-[#536078]">This week</div>
                  </div>
                  <div className="bg-[#F3EEFF] rounded-xl p-3">
                    <div className="text-xs font-bold text-[#3E1CA0]">${(sum.payments?.outstanding ?? 0).toLocaleString()}</div>
                    <div className="text-[10px] text-[#536078]">Outstanding</div>
                  </div>
                  <div className="bg-[#F3EEFF] rounded-xl p-3">
                    <div className="text-xs font-bold text-emerald-400">{sum.payments?.plan || 'pending'}</div>
                    <div className="text-[10px] text-[#536078]">Payment plan</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Middle: recent activity */}
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3E1CA0]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {bundle.activity.length > 0 ? (
                  <div className="space-y-3">
                    {bundle.activity.slice(0, 5).map((a: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#3E1CA0] mt-1.5 shrink-0" />
                          {i < Math.min(bundle.activity.length, 5) - 1 && <div className="w-px flex-1 bg-[#E9E7F5] my-0.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-[#0F1B3D] capitalize">{a.title}</p>
                          <p className="text-[10px] text-[#536078] line-clamp-1">{a.description}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">{formatDateRelative(a.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Activity className="w-5 h-5 text-[#94A3B8]" />} title="No recent activity" sub="Activity events will appear here as the student uses the platform." />
                )}
              </CardContent>
            </Card>

            {/* Right: achievements + bio */}
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#3E1CA0]" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {bundle.achievements.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {bundle.achievements.slice(0, 9).map((a: any, i: number) => (
                      <div key={i} title={a.title} className="bg-[#F3EEFF] rounded-xl p-2.5 flex flex-col items-center text-center">
                        <AchievementIcon icon={a.icon} />
                        <div className="text-[9px] text-[#536078] mt-1 leading-tight line-clamp-2">{a.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Trophy className="w-5 h-5 text-[#94A3B8]" />} title="No achievements yet" />
                )}
                {s.bio && (
                  <>
                    <Separator className="bg-[#E9E7F5] my-4" />
                    <p className="text-[11px] text-[#536078] leading-relaxed">{s.bio}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current courses preview */}
          <Card className={cardBase}>
            <CardHeader className="pb-2 px-5 pt-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3E1CA0]" />
                Current Courses
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs rounded-xl text-[#536078] hover:text-[#0F1B3D]" onClick={() => setTab('courses')}>
                View all <ChevronRight className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {courses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {courses.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="bg-[#F3EEFF] rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3E1CA0]/10 flex items-center justify-center shrink-0">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-[#3E1CA0]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#0F1B3D] truncate">{c.title}</p>
                        <p className="text-[10px] text-[#536078] truncate">by {c.instructor?.name || '—'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-1.5 flex-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${progressColor(c.progress)}`} style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-[#536078]">{c.progress}%</span>
                        </div>
                        {c.current_lesson && <p className="text-[10px] text-[#94A3B8] truncate mt-1.5">Currently: {c.current_lesson}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<BookOpen className="w-5 h-5 text-[#94A3B8]" />} title="No course enrollments" />
              )}
            </CardContent>
          </Card>

          {/* Next live class countdown */}
          {liveClasses.upcoming?.length > 0 && (
            <div className="rounded-3xl border border-[#3E1CA0]/20 bg-gradient-to-r from-[#3E1CA0]/10 via-transparent to-emerald-500/10 px-5 py-4 flex flex-wrap items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#3E1CA0]/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-[#3E1CA0]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#0F1B3D]">Next live class</p>
                <p className="text-[11px] text-[#536078] truncate mt-0.5">{liveClasses.upcoming[0].title}</p>
              </div>
              <LiveClassCountdown date={liveClasses.upcoming[0].date} time={liveClasses.upcoming[0].time} />
            </div>
          )}

          {/* XP History + Learning Path + Leaderboard */}
          <div className={`grid gap-4 ${isStudentViewer ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3E1CA0]" />
                  XP History (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {xpData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={xpData}>
                      <defs>
                        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3E1CA0" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#3E1CA0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,61,245,0.05)" />
                      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(109,61,245,0.08)', borderRadius: 12, fontSize: 11 }}
                        labelStyle={{ color: '#0F1B3D' }}
                        itemStyle={{ color: '#3E1CA0' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3E1CA0" fill="url(#xpGrad)" strokeWidth={2} name="XP" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<TrendingUp className="w-5 h-5 text-[#94A3B8]" />} title="No XP data yet" sub="XP accrues from attendance, submissions, and activity." />
                )}
              </CardContent>
            </Card>

            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#3E1CA0]" />
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                {learningPath.length > 0 ? (
                  <div>
                    {learningPath.map((lp: any, i: number) => (
                      <div key={lp.course_id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                              lp.status === 'completed'
                                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                : lp.status === 'in_progress'
                                  ? 'bg-[#3E1CA0]/20 border-[#3E1CA0]/40 text-[#3E1CA0]'
                                  : 'bg-[#F3EEFF] border-[#E9E7F5] text-[#94A3B8]'
                            }`}
                          >
                            {lp.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          {i < learningPath.length - 1 && <div className="w-px flex-1 bg-[#E9E7F5] my-1" />}
                        </div>
                        <div className="pb-4 min-w-0">
                          <p className="text-xs font-medium text-[#0F1B3D] truncate">{lp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 flex-1 rounded-full bg-[#E9E7F5] overflow-hidden max-w-[140px]">
                              <div className={`h-full rounded-full ${lp.status === 'completed' ? 'bg-emerald-400' : 'bg-[#3E1CA0]'}`} style={{ width: `${lp.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-[#536078]">{lp.progress}%</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5 capitalize">{lp.status.replace(/_/g, ' ')}{lp.completed_at ? ` · ${formatDate(lp.completed_at)}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Target className="w-5 h-5 text-[#94A3B8]" />} title="No learning path" sub="Enrolled courses will build this student's learning path." />
                )}
              </CardContent>
            </Card>

            {!isStudentViewer && (
              <Card className={cardBase}>
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                    <Medal className="w-4 h-4 text-[#3E1CA0]" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((l: any, i: number) => (
                        <div
                          key={l.id}
                          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 ${
                            l.id === s.id ? 'bg-[#3E1CA0]/10 border border-[#3E1CA0]/20' : 'bg-[#F3EEFF] border border-transparent'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-lg bg-[#3E1CA0]/10 flex items-center justify-center text-[9px] font-bold text-[#3E1CA0] shrink-0">
                            {l.rank || i + 1}
                          </div>
                          <ProfileAvatar src={l.avatar || null} name={l.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#0F1B3D] truncate">{l.name}</p>
                            <p className="text-[10px] text-[#536078]">Lv {l.level ?? 1}</p>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400 shrink-0">{l.xp ?? 0} XP</span>
                        </div>
                      ))}
                      {myPosition > 0 && (
                        <div className="pt-2 mt-1 border-t border-[#E9E7F5] flex items-center justify-between text-[10px]">
                          <span className="text-[#536078]">Your rank</span>
                          <span className="font-bold text-[#3E1CA0]">#{myPosition}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState icon={<Medal className="w-5 h-5 text-[#94A3B8]" />} title="No leaderboard yet" />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="courses" className="mt-4 space-y-4">
          <Card className={cardBase}>
            <CardContent className="p-5">
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((c: any) => (
                    <div key={c.id} className="bg-[#F3EEFF] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#3E1CA0]/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 text-[#3E1CA0]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-[#0F1B3D]">{c.title}</h4>
                          {c.completed && <Badge variant="success" className="text-[9px]">Completed</Badge>}
                          {!c.completed && <Badge variant="secondary" className="text-[9px] capitalize">{c.status || 'active'}</Badge>}
                        </div>
                        <p className="text-[11px] text-[#536078] mt-1 truncate">
                          {c.category || 'Course'} · {c.level || 'All levels'} · Instructor: {c.instructor?.name || '—'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] text-[#94A3B8]">
                          <span>Enrolled {formatDate(c.enrolled_at)}</span>
                          {c.estimated_completion && <span>{c.completed ? 'Completed' : `Est. ${c.estimated_completion}`}</span>}
                          {c.completed_at && <span>Done {formatDate(c.completed_at)}</span>}
                        </div>
                      </div>
                      <div className="w-full md:w-56">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-[#536078]">{c.lessons_completed || 0} lessons done</span>
                          <span className="text-[#0F1B3D] font-semibold">{c.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E9E7F5] overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${progressColor(c.progress)}`} style={{ width: `${c.progress}%` }} />
                        </div>
                        {c.current_lesson && <p className="text-[10px] text-[#94A3B8] mt-1.5 truncate">Now: {c.current_lesson}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<BookOpen className="w-6 h-6 text-[#94A3B8]" />} title="Not enrolled in any courses" sub="Enrolled courses and live progress will appear here." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEARNING PATH */}
        <TabsContent value="learning-path" className="mt-4 space-y-4">
          <Card className={cardBase}>
            <CardContent className="p-5">
              {learningPath.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Timeline */}
                  <div className="lg:col-span-2">
                    <p className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-[#3E1CA0]" />
                      Learning Path Timeline
                    </p>
                    <div>
                      {learningPath.map((lp: any, i: number) => (
                        <div key={lp.course_id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
                                lp.status === 'completed'
                                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                  : lp.status === 'in_progress'
                                    ? 'bg-[#3E1CA0]/20 border-[#3E1CA0]/40 text-[#3E1CA0]'
                                    : 'bg-[#F3EEFF] border-[#E9E7F5] text-[#94A3B8]'
                              }`}
                            >
                              {lp.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < learningPath.length - 1 && <div className="w-px flex-1 bg-[#E9E7F5] my-1.5" />}
                          </div>
                          <div className="pb-6 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[#0F1B3D]">{lp.title}</p>
                              <Badge
                                variant={lp.status === 'completed' ? 'success' : lp.status === 'in_progress' ? 'warning' : 'secondary'}
                                className="text-[9px] capitalize"
                              >
                                {lp.status.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="h-2 flex-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${lp.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-[#3E1CA0] to-amber-400'}`}
                                  style={{ width: `${lp.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-[#0F1B3D] shrink-0">{lp.progress}%</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-[#94A3B8]">
                              <span>Enrolled {lp.enrolled_at ? formatDate(lp.enrolled_at) : '—'}</span>
                              {lp.completed_at && <span className="text-emerald-400">Completed {formatDate(lp.completed_at)}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#3E1CA0]" />
                      Path Summary
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-3.5">
                        <div className="text-lg font-bold text-emerald-400">{learningPath.filter((l: any) => l.status === 'completed').length}</div>
                        <div className="text-[10px] text-[#536078] mt-0.5">Completed</div>
                      </div>
                      <div className="bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 rounded-2xl p-3.5">
                        <div className="text-lg font-bold text-[#3E1CA0]">{learningPath.filter((l: any) => l.status === 'in_progress').length}</div>
                        <div className="text-[10px] text-[#536078] mt-0.5">In progress</div>
                      </div>
                      <div className="bg-[#F3EEFF] border border-[#E9E7F5] rounded-2xl p-3.5">
                        <div className="text-lg font-bold text-[#0F1B3D]">{learningPath.filter((l: any) => l.status === 'not_started').length}</div>
                        <div className="text-[10px] text-[#536078] mt-0.5">Not started</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl p-3.5">
                        <div className="text-lg font-bold text-purple-400">{learningPath.reduce((a: number, l: any) => a + (l.progress || 0), 0) / Math.max(learningPath.length, 1)}%</div>
                        <div className="text-[10px] text-[#536078] mt-0.5">Avg progress</div>
                      </div>
                    </div>
                    <div className="bg-[#F3EEFF] rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-[#536078] font-medium uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-[#3E1CA0]" />
                          Next up
                        </span>
                      </div>
                      {(() => {
                        const next = learningPath.find((l: any) => l.status === 'in_progress' || l.status === 'not_started')
                        if (!next) return <p className="text-xs text-emerald-400 font-medium">All courses completed — congratulations!</p>
                        const active = next.status === 'in_progress'
                        return (
                          <div className="flex gap-3 items-start">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                active ? 'bg-[#3E1CA0]/20 border-[#3E1CA0]/40 text-[#3E1CA0]' : 'bg-[#F3EEFF] border-[#E9E7F5] text-[#94A3B8]'
                              }`}
                            >
                              {active ? <PlayCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#0F1B3D] truncate">{next.title}</p>
                                <Badge variant={active ? 'warning' : 'secondary'} className="text-[9px] capitalize">
                                  {next.status.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-2 flex-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${active ? 'bg-gradient-to-r from-[#3E1CA0] to-amber-400' : 'bg-slate-500/50'}`}
                                    style={{ width: `${next.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-[#0F1B3D] shrink-0">{next.progress}%</span>
                              </div>
                              <div className="text-[10px] text-[#94A3B8] mt-2">
                                Enrolled {next.enrolled_at ? formatDate(next.enrolled_at) : '—'}
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<Target className="w-6 h-6 text-[#94A3B8]" />} title="No learning path" sub="Enrolled courses will build this student's personalized learning path." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROGRESS */}
        <TabsContent value="progress" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3E1CA0]" />
                  Performance Trend (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3E1CA0" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#3E1CA0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,61,245,0.06)" />
                      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(109,61,245,0.08)', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: '#0F1B3D' }}
                      />
                      <Area type="monotone" dataKey="value" name="Points" stroke="#3E1CA0" strokeWidth={2} fill="url(#trendFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<TrendingUp className="w-6 h-6 text-[#94A3B8]" />} title="No progress trend yet" />
                )}
              </CardContent>
            </Card>

            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3E1CA0]" />
                  Activity Heatmap (60 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {progress.heatmap?.length ? (
                  <HeatmapGrid data={progress.heatmap} />
                ) : (
                  <EmptyState icon={<Activity className="w-6 h-6 text-[#94A3B8]" />} title="No activity recorded" sub="Daily learning activity will appear here." />
                )}
              </CardContent>
            </Card>
          </div>

          <Card className={cardBase}>
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#3E1CA0]" />
                Enrollment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((c: any) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#536078] truncate mr-3">{c.title}</span>
                        <span className="font-semibold text-[#0F1B3D] shrink-0">{c.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E9E7F5] overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${progressColor(c.progress)}`} style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<BarChart3 className="w-6 h-6 text-[#94A3B8]" />} title="No enrollment progress" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          {/* Monthly comparison */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#3E1CA0]" />
                  Monthly Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {monthlyAnalytics?.current ? (
                  <div className="space-y-2.5">
                    {monthlyMetrics.map((m) => {
                      const cur = monthlyAnalytics.current?.[m.key] ?? 0
                      const prev = monthlyAnalytics.previous?.[m.key] ?? 0
                      const delta = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0
                      return (
                        <div key={m.key} className="flex items-center justify-between rounded-xl bg-[#F3EEFF] px-3.5 py-2.5">
                          <div>
                            <p className="text-[10px] text-[#536078]">{m.label}</p>
                            <p className="text-sm font-bold text-[#0F1B3D]">{cur}{m.key === 'study_hours' ? 'h' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-[#94A3B8]">last month · {prev}{m.key === 'study_hours' ? 'h' : ''}</p>
                            <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {delta > 0 ? '+' : ''}{delta}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState icon={<BarChart3 className="w-6 h-6 text-[#94A3B8]" />} title="No monthly data yet" />
                )}
              </CardContent>
            </Card>

            {/* Weekly activity chart */}
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3E1CA0]" />
                  Weekly Activity (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {weeklyAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,61,245,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v: string) => String(new Date(v).getDate())} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} width={26} />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(109,61,245,0.08)', borderRadius: 12, fontSize: 11 }}
                        labelStyle={{ color: '#0F1B3D' }}
                        labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      />
                      <Bar dataKey="attendance" name="Attendance" fill="#3E1CA0" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="submissions" name="Submissions" fill="#34d399" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="activity" name="Activity" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<Activity className="w-6 h-6 text-[#94A3B8]" />} title="No weekly data yet" />
                )}
                <div className="flex items-center gap-4 px-2 mt-2 text-[9px] text-[#94A3B8]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3E1CA0]" />Attendance</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" />Submissions</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400" />Activity</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance calendar */}
          <Card className={cardBase}>
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#3E1CA0]" />
                Attendance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AttendanceCalendar studentId={id} initial={attendanceCalendar} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <StatTile icon={<CalendarCheck className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10" accent="e" label="Present" value={attendance.present ?? 0} />
            <StatTile icon={<X className="w-4 h-4 text-red-400" />} iconBg="bg-red-500/10" accent="r" label="Absent" value={attendance.absent ?? 0} />
            <StatTile icon={<Clock className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10" accent="a" label="Late" value={attendance.late ?? 0} />
            <StatTile icon={<BarChart3 className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" accent="o" label="Rate" value={`${attendance.rate ?? 0}%`} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#3E1CA0]" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {attendance.history?.length ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {attendance.history.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-3 bg-[#F3EEFF] rounded-xl px-3 py-2.5">
                        <Badge variant={a.present ? 'success' : 'destructive'} className="text-[9px] shrink-0">{a.present ? 'Present' : 'Absent'}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#0F1B3D] truncate">{a.class_title || 'Class'}</p>
                          <p className="text-[10px] text-[#94A3B8]">{formatDate(a.date)}</p>
                        </div>
                        {a.check_in_time && <span className="text-[10px] text-[#536078] shrink-0">{new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<CalendarCheck className="w-6 h-6 text-[#94A3B8]" />} title="No attendance records" sub="Attendance for classes will appear here." />
                )}
              </CardContent>
            </Card>

            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#3E1CA0]" />
                  By Day of Week
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {attendance.by_day_of_week?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={attendance.by_day_of_week.map((d: any) => ({ ...d, name: dayNames[(Number(d.day) || 1) - 1] }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,61,245,0.06)" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(109,61,245,0.08)', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: '#0F1B3D' }} />
                      <Bar dataKey="total" name="Total" fill="#3E1CA0" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="present_count" name="Present" fill="#34d399" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<BarChart3 className="w-6 h-6 text-[#94A3B8]" />} title="No weekly attendance data" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ASSIGNMENTS */}
        <TabsContent value="assignments" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Assignments</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">
                {asgStats.graded ?? 0} graded · {asgStats.pending ?? 0} in review · {asgStats.assigned ?? 0} to submit · {asgStats.upcoming_deadlines ?? 0} due soon
              </p>
            </div>
            {canManage && (
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
                onClick={() => setShowAssignmentCreate(true)}
              >
                <Plus className="w-4 h-4" />
                New Assignment
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatTile icon={<ClipboardList className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" accent="o" label="Total" value={asgStats.total ?? 0} />
            <StatTile icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10" accent="e" label="Graded" value={asgStats.graded ?? 0} />
            <StatTile icon={<Clock className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10" accent="a" label="In review" value={asgStats.pending ?? 0} />
            <StatTile icon={<AlertTriangle className="w-4 h-4 text-red-400" />} iconBg="bg-red-500/10" accent="r" label="Late" value={asgStats.late ?? 0} />
            <StatTile icon={<TrendingUp className="w-4 h-4 text-purple-400" />} iconBg="bg-purple-500/10" accent="p" label="Avg %" value={asgStats.avg_percentage ?? 0} />
            <StatTile icon={<Timer className="w-4 h-4 text-cyan-400" />} iconBg="bg-cyan-500/10" accent="c" label="Due soon" value={asgStats.upcoming_deadlines ?? 0} />
          </div>

          <Card className={cardBase}>
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {assignmentFilterDefs.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setAssignmentFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-colors inline-flex items-center gap-1.5 ${
                        assignmentFilter === f.key ? 'bg-[#3E1CA0]/15 text-[#3E1CA0]' : 'bg-white/[0.03] text-[#536078] hover:text-[#0F1B3D]'
                      }`}
                    >
                      {f.label}
                      <span
                        className={`text-[9px] font-semibold rounded-full px-1.5 py-px leading-none ${
                          assignmentFilter === f.key ? 'bg-[#3E1CA0]/20 text-[#3E1CA0]' : 'bg-[#E9E7F5] text-[#94A3B8]'
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                  {assignmentCourseOptions.length > 1 && (
                    <select
                      value={assignmentCourseFilter}
                      onChange={(e) => setAssignmentCourseFilter(e.target.value)}
                      className="h-8 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#0F1B3D] px-2 focus:outline-none focus:border-[#3E1CA0]/40 [&>option]:bg-white max-w-[150px]"
                      aria-label="Filter by course"
                    >
                      <option value="all">All courses</option>
                      {assignmentCourseOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                  <div className="relative flex-1 sm:w-52 sm:flex-none">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                      placeholder="Search assignments..."
                      className="h-8 pl-8 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-[11px] text-[#0F1B3D] placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <select
                    value={assignmentSort}
                    onChange={(e) => setAssignmentSort(e.target.value as typeof assignmentSort)}
                    className="h-8 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#0F1B3D] px-2 focus:outline-none focus:border-[#3E1CA0]/40 [&>option]:bg-white"
                    aria-label="Sort assignments"
                  >
                    <option value="due">Sort · Due date</option>
                    <option value="title">Sort · Title</option>
                    <option value="marks">Sort · Max marks</option>
                  </select>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-xl text-[#3E1CA0] hover:bg-[#3E1CA0]/10"
                      onClick={() => setShowAssignmentCreate(true)}
                      aria-label="New assignment"
                      title="New assignment"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {filteredAssignments.length > 0 ? (
                <div className="space-y-5">
                  {assignedItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <p className="text-[10px] font-semibold text-[#536078] uppercase tracking-wider">To submit</p>
                        <span className="text-[9px] bg-amber-400/10 text-amber-300 rounded-full px-2 py-0.5">{assignedItems.length}</span>
                        <span className="ml-auto text-[9px] text-[#94A3B8]">
                          {overdueCount > 0 && <span className="text-red-400">{overdueCount} overdue</span>}
                          {overdueCount > 0 && upcomingCount > 0 && <span className="text-[#C4C0D6]"> · </span>}
                          {upcomingCount > 0 && <span>{upcomingCount} upcoming</span>}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {assignedItems.map((a: any) => {
                          const due = dueInLabel(a.due_date)
                          const cs = courseStyle(a.course)
                          const dm = difficultyMeta(a.difficulty)
                          return (
                            <div
                              key={a.id}
                              className="group rounded-xl bg-[#F3EEFF] p-4 border border-[#E9E7F5] hover:border-[#3E1CA0]/25 hover:bg-[#3E1CA0]/[0.03] transition-colors"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className={`w-11 h-11 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{assignmentTypeIcon(a.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold text-[#0F1B3D] truncate">{a.title}</p>
                                    <span className={`text-[9px] font-medium ${dm.cls}`}>● {dm.label}</span>
                                  </div>
                                  <p className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                                    <span className="truncate">{a.course || 'Assignment'}</span>
                                    <span className="text-[#C4C0D6]">·</span>
                                    <span className="shrink-0 text-[#536078]">{a.max_score} marks</span>
                                  </p>
                                  {a.description && <p className="text-[10px] text-[#536078] mt-1.5 line-clamp-2">{a.description}</p>}
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  {due && (
                                    <span
                                      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-lg ${
                                        due.overdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-300'
                                      }`}
                                    >
                                      <CalendarClock className="w-3 h-3" />
                                      {due.label}
                                    </span>
                                  )}
                                  {a.is_late && (
                                    <Badge variant="destructive" className="text-[9px]">
                                      Late submission
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E9E7F5]">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDetailsFor(a)}
                                  className="h-7 gap-1.5 rounded-lg text-[10px] text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF]"
                                >
                                  <Eye className="w-3 h-3" />
                                  Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={submitAssignmentMutation.isPending}
                                  onClick={() => {
                                    setSubmitFor(a)
                                    setSubmitText('')
                                    setSubmitUrl('')
                                    setSubmitFiles([])
                                  }}
                                  className="h-7 gap-1.5 rounded-lg text-[10px] text-[#3E1CA0] border-[#3E1CA0]/25 hover:bg-[#3E1CA0]/10 hover:text-[#3E1CA0] ml-auto"
                                >
                                  {submitAssignmentMutation.isPending && submitFor?.assignment_id === a.assignment_id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Send className="w-3 h-3" />
                                  )}
                                  Submit
                                </Button>
                                {canManage && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={duplicateAssignmentMutation.isPending}
                                      onClick={() => duplicateAssignmentMutation.mutate(a.assignment_id)}
                                      className="h-7 w-7 p-0 rounded-lg text-[#94A3B8] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10"
                                      aria-label="Duplicate assignment"
                                      title="Duplicate"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeleteFor(a)}
                                      className="h-7 w-7 p-0 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"
                                      aria-label="Delete assignment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {submittedItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <p className="text-[10px] font-semibold text-[#536078] uppercase tracking-wider">Submitted</p>
                        <span className="text-[9px] bg-emerald-400/10 text-emerald-300 rounded-full px-2 py-0.5">{submittedItems.length}</span>
                      </div>
                      <div className="space-y-2.5">
                        {submittedItems.map((a: any) => {
                          const cs = courseStyle(a.course)
                          return (
                            <div
                              key={a.id}
                              className="group rounded-xl bg-[#F3EEFF] p-4 border border-[#E9E7F5] hover:border-emerald-400/20 hover:bg-emerald-400/[0.02] transition-colors"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className={`w-11 h-11 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{assignmentTypeIcon(a.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold text-[#0F1B3D] truncate">{a.title}</p>
                                    <Badge variant={a.status === 'graded' ? 'success' : 'warning'} className="text-[9px] capitalize">
                                      {a.status === 'graded' ? 'Graded' : 'In review'}
                                    </Badge>
                                    {a.is_late && (
                                      <Badge variant="destructive" className="text-[9px]">
                                        Late
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                                    <span className="truncate">{a.course || 'Assignment'}</span>
                                    <span className="text-[#C4C0D6]">·</span>
                                    <span className="shrink-0">
                                      Attempt {a.attempt_number || 1}
                                      {a.submitted_at ? ` · ${formatDateRelative(a.submitted_at)}` : ''}
                                    </span>
                                  </p>
                                  {a.status === 'graded' && a.percentage !== null ? (
                                    <div className="mt-2.5 flex items-center gap-2.5">
                                      <div className="flex-1 h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${Math.min(100, a.percentage)}%`,
                                            backgroundColor: a.percentage >= 80 ? '#34d399' : a.percentage >= 50 ? '#fbbf24' : '#f87171',
                                          }}
                                        />
                                      </div>
                                      <span
                                        className={`text-[11px] font-bold shrink-0 ${
                                          a.percentage >= 80 ? 'text-emerald-400' : a.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                                        }`}
                                      >
                                        {a.percentage}%
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="mt-2.5 flex items-center gap-1.5">
                                      <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                      <span className="text-[9px] text-amber-300">Awaiting review</span>
                                    </div>
                                  )}
                                  {a.feedback && (
                                    <p className="text-[10px] text-[#536078] mt-2 border-l-2 border-[#3E1CA0]/30 pl-2 line-clamp-1">“{a.feedback}”</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E9E7F5]">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDetailsFor(a)}
                                  className="h-7 gap-1.5 rounded-lg text-[10px] text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF]"
                                >
                                  <Eye className="w-3 h-3" />
                                  Details
                                </Button>
                                {a.status !== 'graded' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={withdrawSubmissionMutation.isPending}
                                    onClick={() => withdrawSubmissionMutation.mutate(a.id)}
                                    className="h-7 gap-1.5 rounded-lg text-[10px] text-[#536078] hover:text-amber-300 hover:bg-amber-400/10"
                                  >
                                    <Undo2 className="w-3 h-3" />
                                    Withdraw
                                  </Button>
                                )}
                                {canManage && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setGradeFor(a)
                                        setGradeForm({ grade: a.grade ?? '', feedback: a.feedback ?? '' })
                                      }}
                                      className="h-7 gap-1.5 rounded-lg text-[10px] text-[#3E1CA0] border-[#3E1CA0]/25 hover:bg-[#3E1CA0]/10 hover:text-[#3E1CA0] ml-auto"
                                    >
                                      <BadgeCheck className="w-3 h-3" />
                                      {a.status === 'graded' ? 'Regrade' : 'Grade'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={duplicateAssignmentMutation.isPending}
                                      onClick={() => duplicateAssignmentMutation.mutate(a.assignment_id)}
                                      className="h-7 w-7 p-0 rounded-lg text-[#94A3B8] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10"
                                      aria-label="Duplicate assignment"
                                      title="Duplicate"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeleteFor(a)}
                                      className="h-7 w-7 p-0 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"
                                      aria-label="Delete assignment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<ClipboardList className="w-6 h-6 text-[#94A3B8]" />}
                  title={assignmentFilter === 'all' ? 'No assignments yet' : `No ${assignmentFilter} assignments`}
                  sub={canManage ? 'Assign homework, quizzes and tasks for this student\'s courses.' : 'Assignments will appear here once they are assigned.'}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECTS */}
        <TabsContent value="projects" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Projects</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">
                {sum.projects?.course_projects ?? 0} course projects · {sum.projects?.proposals ?? 0} proposals · {sum.projects?.accepted ?? 0} accepted
              </p>
            </div>
            {canManage && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs rounded-xl bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
                onClick={() => setShowProjectCreate(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile icon={<Target className="w-4 h-4 text-[#3E1CA0]" />} iconBg="bg-[#3E1CA0]/10" accent="o" label="Total" value={sum.projects?.total ?? 0} />
            <StatTile icon={<BookOpen className="w-4 h-4 text-cyan-400" />} iconBg="bg-cyan-500/10" accent="c" label="Course Projects" value={sum.projects?.course_projects ?? 0} />
            <StatTile icon={<FileText className="w-4 h-4 text-purple-400" />} iconBg="bg-purple-500/10" accent="p" label="Proposals" value={sum.projects?.proposals ?? 0} />
            <StatTile icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10" accent="e" label="Accepted" value={sum.projects?.accepted ?? 0} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#3E1CA0]" />
                    Course Projects
                  </span>
                  {canManage && (
                    <Button size="icon" className="h-6 w-6 rounded-lg bg-[#3E1CA0]/10 hover:bg-[#3E1CA0]/20 text-[#3E1CA0]" onClick={() => setShowProjectCreate(true)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {projects.course_projects?.length ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {projects.course_projects.map((p: any) => {
                      const cs = courseStyle(p.course_title)
                      const dm = difficultyMeta(p.difficulty)
                      const due = dueInLabel(p.due_date)
                      const st = (p.status || 'in_progress').toLowerCase()
                      const statusCls =
                        st === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        st === 'review' ? 'bg-amber-400/10 text-amber-300' :
                        st === 'not_started' ? 'bg-slate-500/10 text-[#536078]' :
                        'bg-[#3E1CA0]/10 text-[#3E1CA0]'
                      return (
                        <div key={p.id} className="bg-[#F3EEFF] rounded-xl overflow-hidden border border-[#E9E7F5] hover:border-[#E9E7F5] transition-colors">
                          <div className={`h-1 bg-gradient-to-r ${st === 'completed' ? 'from-emerald-400 to-teal-500' : st === 'review' ? 'from-amber-400 to-orange-500' : 'from-[#3E1CA0] to-pink-500'}`} />
                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className={`w-9 h-9 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{projectTypeIcon(p.category)}</div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${statusCls}`}>
                                  <span className={`w-1 h-1 rounded-full ${st === 'completed' ? 'bg-emerald-400' : st === 'review' ? 'bg-amber-300' : st === 'not_started' ? 'bg-slate-400' : 'bg-[#3E1CA0]'}`} />
                                  {st.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-[#0F1B3D] mt-2 truncate">{p.title}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5 truncate flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                              {p.course_title || 'Course project'}
                              <span className="text-[#C4C0D6]">·</span>
                              <span className={dm.cls}>{dm.label}</span>
                              <span className="text-[#C4C0D6]">·</span>
                              <span className="capitalize text-[#536078]">{projectTypeLabel(p.category)}</span>
                            </p>
                            {p.description && <p className="text-[10px] text-[#536078] mt-1.5 line-clamp-2">{p.description}</p>}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(p.technologies) ? p.technologies : String(p.technologies || '').split(',')).slice(0, 3).map((t: string, i: number) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-[#3E1CA0]/10 text-[9px] text-[#3E1CA0]">{t.trim()}</span>
                                ))}
                              </div>
                              <span className="text-[9px] font-semibold text-[#536078] shrink-0">{p.max_points ?? 100} pts</span>
                            </div>
                            {due && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#E9E7F5]">
                                <CalendarClock className={`w-3 h-3 ${due.overdue ? 'text-red-400' : 'text-[#94A3B8]'}`} />
                                <span className={`text-[9px] font-medium ${due.overdue ? 'text-red-400' : 'text-[#94A3B8]'}`}>{due.label}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<BookOpen className="w-6 h-6 text-[#94A3B8]" />}
                    title="No course projects"
                    sub={canManage ? 'Assign hands-on projects for the courses this student is enrolled in.' : 'Course projects will appear here.'}
                  />
                )}
              </CardContent>
            </Card>

            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3E1CA0]" />
                  Proposals
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {projects.proposals?.length ? (
                  <div className="space-y-3">
                    {projects.proposals.map((p: any) => (
                      <div key={p.id} className="bg-[#F3EEFF] rounded-xl p-3.5 border border-[#E9E7F5]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#0F1B3D] truncate">{p.title || 'Proposal'}</p>
                          <Badge variant={p.status === 'accepted' || p.status === 'approved' || p.status === 'completed' ? 'success' : 'secondary'} className="text-[9px] capitalize shrink-0">{p.status || 'submitted'}</Badge>
                        </div>
                        {p.bid_amount != null && (
                          <p className="text-[10px] font-semibold text-[#3E1CA0] mt-1.5">Bid: ${p.bid_amount}</p>
                        )}
                        {p.description && <p className="text-[10px] text-[#536078] mt-1 line-clamp-2">{p.description}</p>}
                        {p.submitted_at && <p className="text-[9px] text-[#94A3B8] mt-1.5">{formatDate(p.submitted_at)}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<FileText className="w-6 h-6 text-[#94A3B8]" />} title="No proposals submitted" sub="Freelance proposals the student sends will show here." />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CERTIFICATES */}
        <TabsContent value="certificates" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Certificates</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">
                {bundle.certificates.length} issued · {certDocuments.length} uploaded files
              </p>
            </div>
            {canManage && (
              <Button size="sm" className="h-8 gap-1.5 text-xs rounded-xl" onClick={() => setShowCertUpload(true)}>
                <Upload className="w-3.5 h-3.5" />
                Upload Certificate
              </Button>
            )}
          </div>

          {bundle.certificates.length === 0 && certDocuments.length === 0 && (
            <Card className={cardBase}>
              <CardContent className="p-5">
                <EmptyState
                  icon={<Award className="w-6 h-6 text-[#94A3B8]" />}
                  title="No certificates yet"
                  sub={canManage ? 'Upload a certificate file or issue one once the student completes a course.' : 'Certificates will appear here once courses are completed.'}
                />
              </CardContent>
            </Card>
          )}

          {bundle.certificates.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#536078] uppercase tracking-wider mb-2">Issued certificates · {bundle.certificates.length}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bundle.certificates.map((c: any) => (
                  <div key={c.id} className="bg-gradient-to-br from-[#3E1CA0]/10 to-transparent border border-[#3E1CA0]/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#3E1CA0]/10" />
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#3E1CA0]/15 flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#3E1CA0]" />
                      </div>
                      <Badge variant={c.status === 'valid' || !c.status ? 'success' : 'warning'} className="text-[9px] capitalize">{c.status || 'valid'}</Badge>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F1B3D] mt-3">{c.title}</h4>
                    <p className="text-[10px] text-[#536078] mt-1">{c.certificate_number}</p>
                    <div className="flex items-center justify-between mt-4 text-[10px]">
                      <span className="text-[#536078]">Issued {formatDate(c.issued_at)}</span>
                      {c.expires_at ? <span className="text-[#94A3B8]">Expires {formatDate(c.expires_at)}</span> : <span className="text-emerald-400">No expiry</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certDocuments.length > 0 && (
            <Card className={cardBase}>
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#3E1CA0]" />
                  Uploaded certificate files
                  <span className="text-[10px] font-normal text-[#94A3B8]">({certDocuments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {certDocuments.map((doc: any) => (
                    <div key={doc.id} className="bg-[#F3EEFF] rounded-xl p-4 border border-[#E9E7F5]">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-yellow-400" />
                        </div>
                        {doc.is_verified && <Badge variant="success" className="text-[9px]">Verified</Badge>}
                      </div>
                      <p className="text-xs font-semibold text-[#0F1B3D] mt-2 truncate">{doc.title}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{doc.file_type || 'pdf'}{doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ''}</p>
                      <div className="flex gap-1.5 mt-3">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] rounded-lg border-[#E9E7F5] flex-1" onClick={() => downloadDoc(doc)}>
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#94A3B8] hover:text-red-400" onClick={() => deleteDocumentMutation.mutate(doc.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Payments</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">
                Plan: <span className="capitalize text-[#0F1B3D]">{sum.payments?.plan || 'pending'}</span>
                {sum.payments?.renewal_date ? ` · Renewal ${formatDate(sum.payments.renewal_date)}` : ''}
                {sum.payments?.coupons_used ? ` · ${sum.payments.coupons_used} coupon(s) used` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile icon={<Wallet className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10" accent="e" label="Total Paid" value={formatMoney(sum.payments?.total_paid ?? 0)} />
            <StatTile icon={<Clock className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10" accent="a" label="Pending" value={formatMoney(sum.payments?.pending ?? 0)} />
            <StatTile icon={<AlertTriangle className="w-4 h-4 text-red-400" />} iconBg="bg-red-500/10" accent="r" label="Outstanding" value={formatMoney(sum.payments?.outstanding ?? 0)} />
            <StatTile icon={<CreditCard className="w-4 h-4 text-cyan-400" />} iconBg="bg-cyan-500/10" accent="c" label="Plan" value={<span className="capitalize">{sum.payments?.plan || 'pending'}</span>} />
          </div>

          <Card className={cardBase}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#0F1B3D]">Enrollment fees settled</p>
                <p className="text-[10px] text-[#536078]">{formatMoney(sum.payments?.total_paid ?? 0)} of {formatMoney(paymentFees)}</p>
              </div>
              <div className="h-2 rounded-full bg-[#E9E7F5] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-[#94A3B8]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-emerald-400" />{paymentProgress}% paid</span>
                <span>{formatMoney(sum.payments?.outstanding ?? 0)} remaining</span>
              </div>
            </CardContent>
          </Card>

          <Card className={cardBase}>
            <CardContent className="p-5">
              {bundle.payments.length > 0 ? (
                <div className="space-y-2">
                  {bundle.payments.map((p: any) => (
                    <div key={p.id} className="bg-[#F3EEFF] rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F1B3D] truncate">{p.course || 'Payment'}</p>
                        <p className="text-[10px] text-[#94A3B8] truncate">
                          {p.method || '—'}{p.transaction_id ? ` · ${p.transaction_id}` : ''} · {formatDateRelative(p.created_at)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#0F1B3D] shrink-0">{formatMoney(p.amount, p.currency)}</span>
                      <Badge variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'secondary'} className="text-[9px] shrink-0 capitalize">{p.status}</Badge>
                      {isAdmin && p.status === 'pending' && (
                        <Button
                          size="sm"
                          className="h-7 gap-1 text-[10px] rounded-lg shrink-0"
                          disabled={approvePaymentMutation.isPending}
                          onClick={() => approvePaymentMutation.mutate(p.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                      )}
                      {isAdmin && p.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-[10px] rounded-lg border-[#E9E7F5] text-[#536078] hover:text-red-400 shrink-0"
                          onClick={() => setRefundTarget(p)}
                        >
                          <Undo2 className="w-3 h-3" />
                          Refund
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Banknote className="w-6 h-6 text-[#94A3B8]" />} title="No payment records" sub="Payment transactions will appear here." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVITY TIMELINE */}
        <TabsContent value="activity" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B3D]">Activity Timeline</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{bundle.activity.length} events tracked</p>
            </div>
          </div>

          <Card className={cardBase}>
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                {activityFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActivityFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-colors ${
                      activityFilter === f.key ? 'bg-[#3E1CA0]/15 text-[#3E1CA0]' : 'bg-white/[0.03] text-[#536078] hover:text-[#0F1B3D]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredActivity.length > 0 ? (
                <div className="max-w-2xl space-y-5">
                  {groupActivityByDay(filteredActivity).map((group) => (
                    <div key={group.date}>
                      <p className="text-[10px] font-semibold text-[#536078] uppercase tracking-wider mb-2">{group.label}</p>
                      <div className="space-y-0">
                        {group.items.map((a: any, i: number) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              {activityBadge(a.type)}
                              {i < group.items.length - 1 && <div className="w-px flex-1 bg-[#E9E7F5] my-1" />}
                            </div>
                            <div className="pb-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-[#0F1B3D] capitalize">{a.title}</p>
                                <span className="text-[9px] text-[#94A3B8]">
                                  {a.at ? new Date(a.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              {a.description && <p className="text-[11px] text-[#536078] mt-0.5">{a.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Activity className="w-6 h-6 text-[#94A3B8]" />} title="No activity events" sub="The student's platform activity timeline will appear here." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACHIEVEMENTS */}
        <TabsContent value="achievements" className="mt-4">
          <Card className={cardBase}>
            <CardContent className="p-5">
              {bundle.achievements.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bundle.achievements.map((a: any, i: number) => (
                    <div key={i} className={`rounded-2xl p-3.5 border ${a.earned ? 'bg-[#3E1CA0]/5 border-[#3E1CA0]/20' : 'bg-[#EEF4FF] border-[#E9E7F5] opacity-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3EEFF] flex items-center justify-center"><AchievementIcon icon={a.icon} /></div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#0F1B3D]">{a.title}</p>
                          {a.description && <p className="text-[10px] text-[#536078] mt-0.5 line-clamp-2">{a.description}</p>}
                        </div>
                      </div>
                      {a.earned && <Badge variant="success" className="text-[9px] mt-2.5">Earned</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Trophy className="w-6 h-6 text-[#94A3B8]" />} title="No achievements yet" sub="Achievements unlock as the student hits learning milestones." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files" className="mt-4 space-y-4">
          <Card className={cardBase}>
            <CardHeader className="pb-2 px-5 pt-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#3E1CA0]" />
                Documents
              </CardTitle>
              <Button size="sm" className="h-8 gap-1.5 text-xs rounded-xl" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setDocForm((f) => ({ ...f, file, title: f.title || file?.name?.split('.')[0] || '' }))
                  if (file) {
                    toast.success('File selected')
                  }
                }}
              />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {docForm.file && (
                <div className="mb-4 rounded-xl bg-[#3E1CA0]/5 border border-[#3E1CA0]/20 p-4 space-y-3">
                  <p className="text-[11px] text-[#536078] truncate">Selected: <span className="text-[#0F1B3D] font-medium">{docForm.file.name}</span> ({(docForm.file.size / 1024).toFixed(1)} KB)</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      placeholder="Document title *"
                      className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
                    />
                    <select
                      value={docForm.type}
                      onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                      className="h-9 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] text-xs text-[#0F1B3D] px-3 focus:outline-none focus:ring-1 focus:ring-[#3E1CA0]"
                    >
                      <option value="certificate">Certificate</option>
                      <option value="transcript">Transcript</option>
                      <option value="id">ID / Card</option>
                      <option value="payment">Payment Proof</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[#E9E7F5]" onClick={() => { setDocForm({ title: '', type: 'other', description: '', file: null }); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                      Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs rounded-xl gap-1.5" disabled={!docForm.title.trim() || uploadDocumentMutation.isPending} onClick={() => uploadDocumentMutation.mutate()}>
                      {uploadDocumentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      Upload
                    </Button>
                  </div>
                </div>
              )}
              {bundle.documents.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bundle.documents.map((doc: any) => (
                    <div key={doc.id} className="bg-[#F3EEFF] rounded-xl p-4 border border-[#E9E7F5]">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-[#3E1CA0]/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#3E1CA0]" />
                        </div>
                        {doc.is_verified && <Badge variant="success" className="text-[9px]">Verified</Badge>}
                      </div>
                      <p className="text-xs font-semibold text-[#0F1B3D] mt-2 truncate">{doc.title}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5 capitalize">{doc.type || 'document'}{doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ''}</p>
                      {doc.description && <p className="text-[10px] text-[#536078] mt-1 line-clamp-2">{doc.description}</p>}
                      <div className="flex gap-1.5 mt-3">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] rounded-lg border-[#E9E7F5] flex-1" onClick={() => downloadDoc(doc)}>
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#94A3B8] hover:text-red-400" onClick={() => deleteDocumentMutation.mutate(doc.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<FolderOpen className="w-6 h-6 text-[#94A3B8]" />} title="No documents yet" sub="Upload certificates, transcripts, and other files for this student." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Details Drawer */}
      <Dialog open={!!detailsFor} onOpenChange={(o) => { if (!o) { setDetailsFor(null); setDetailsData(null); setResourceForm({ title: '', type: 'link', url: '', description: '', file: null }) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 gap-0 bg-white border border-[#E9E7F5] text-[#0F1B3D] overflow-hidden">
          {detailsLoading && !detailsData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#3E1CA0]" />
            </div>
          ) : detailsData ? (
            <>
              <div className="relative overflow-hidden border-b border-[#E9E7F5] bg-gradient-to-br from-[#F3EEFF] via-[#EEF4FF] to-white px-5 py-4 shrink-0">
                <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[#3E1CA0]/15 blur-3xl" />
                <div className="absolute -bottom-12 left-1/4 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 flex items-center justify-center shrink-0">
                    {assignmentTypeIcon(detailsData.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-[#0F1B3D] truncate">{detailsData.title}</h2>
                      {detailsData.assignment_code && (
                        <span className="text-[9px] font-mono text-[#536078] bg-[#F3EEFF] rounded-md px-1.5 py-0.5">{detailsData.assignment_code}</span>
                      )}
                      <Badge variant={detailsData.status === 'published' ? 'success' : 'warning'} className="text-[9px] capitalize">{detailsData.status === 'published' ? 'Published' : 'Draft'}</Badge>
                    </div>
                    <p className="text-[10px] text-[#536078] mt-1 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${courseStyle(detailsData.course?.title).dot}`} />
                      <span className="truncate">{detailsData.course?.title || 'Assignment'}</span>
                      {detailsData.module?.title && (
                        <>
                          <span className="text-[#C4C0D6]">·</span>
                          <span className="truncate text-[#94A3B8]">{detailsData.module.title}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={publishAssignmentMutation.isPending}
                        onClick={() => publishAssignmentMutation.mutate({ assignmentId: detailsData.id, status: detailsData.status === 'published' ? 'draft' : 'published' })}
                        className="h-8 gap-1.5 rounded-lg text-[10px] text-[#3E1CA0] border-[#3E1CA0]/25 hover:bg-[#3E1CA0]/10 hover:text-[#3E1CA0]"
                      >
                        {detailsData.status === 'published' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {detailsData.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={duplicateAssignmentMutation.isPending}
                        onClick={() => duplicateAssignmentMutation.mutate(detailsData.id)}
                        className="h-8 w-8 p-0 rounded-lg text-[#536078] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10"
                        aria-label="Duplicate assignment"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setDeleteFor(detailsFor); setDetailsFor(null) }}
                        className="h-8 w-8 p-0 rounded-lg text-[#536078] hover:text-red-400 hover:bg-red-500/10"
                        aria-label="Delete assignment"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { icon: <CalendarClock className="w-3.5 h-3.5 text-amber-400" />, label: 'Due', value: detailsData.due_date ? formatDate(detailsData.due_date) : '—' },
                      { icon: <Timer className="w-3.5 h-3.5 text-cyan-400" />, label: 'Starts', value: detailsData.start_date ? formatDate(detailsData.start_date) : '—' },
                      { icon: <Award className="w-3.5 h-3.5 text-emerald-400" />, label: 'Max marks', value: String(detailsData.max_score ?? 100) },
                      { icon: <Target className="w-3.5 h-3.5 text-[#3E1CA0]" />, label: 'Passing', value: detailsData.passing_marks ? String(detailsData.passing_marks) : '—' },
                      { icon: <Gauge className="w-3.5 h-3.5 text-rose-400" />, label: 'Difficulty', value: (detailsData.difficulty || 'medium').charAt(0).toUpperCase() + (detailsData.difficulty || 'medium').slice(1) },
                      { icon: <ListChecks className="w-3.5 h-3.5 text-violet-400" />, label: 'Category', value: assignmentCategoryLabel(detailsData.category) },
                      { icon: <Boxes className="w-3.5 h-3.5 text-fuchsia-400" />, label: 'Submission', value: submissionTypeLabel(detailsData.submission_type) },
                      { icon: <RefreshCw className="w-3.5 h-3.5 text-sky-400" />, label: 'Attempts', value: String(detailsData.attempts_allowed ?? 1) },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-2.5">
                        <div className="flex items-center gap-1.5 text-[9px] text-[#94A3B8]">{m.icon}{m.label}</div>
                        <p className="text-[11px] font-semibold text-[#0F1B3D] mt-1 truncate">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Late policy</p>
                      <p className="text-[11px] text-[#536078]">
                        {detailsData.allow_late_submission ? `Late submissions allowed (${detailsData.late_penalty_percent ?? 0}% penalty)` : 'Late submissions not allowed'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Visibility</p>
                      <p className="text-[11px] text-[#536078] capitalize">{(detailsData.visibility || 'all').replace(/_/g, ' ')} · max {detailsData.max_files ?? 1} file(s), {detailsData.max_file_size_mb ?? 20} MB each</p>
                    </div>
                  </div>

                  {detailsData.description && (
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3.5">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Description</p>
                      <p className="text-[11px] text-[#536078] whitespace-pre-wrap">{detailsData.description}</p>
                    </div>
                  )}
                  {detailsData.instructions && (
                    <div className="rounded-xl bg-[#3E1CA0]/[0.04] border border-[#3E1CA0]/15 p-3.5">
                      <p className="text-[9px] font-semibold text-[#3E1CA0] uppercase tracking-wider mb-1.5">Instructions</p>
                      <p className="text-[11px] text-slate-200 whitespace-pre-wrap">{detailsData.instructions}</p>
                    </div>
                  )}

                  {detailsData.resources && detailsData.resources.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Resources ({detailsData.resources.length})</p>
                      <div className="space-y-2">
                        {detailsData.resources.map((r: any) => (
                          <div key={r.id} className="flex items-center gap-2.5 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#3E1CA0]/10 flex items-center justify-center shrink-0">
                              <Paperclip className="w-3.5 h-3.5 text-[#3E1CA0]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{r.title}</p>
                              <p className="text-[9px] text-[#94A3B8] capitalize truncate">{(r.type || 'file').replace(/_/g, ' ')}{r.description ? ` · ${r.description}` : ''}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {(r.url || r.file_path) && (
                                <a
                                  href={r.url || r.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-[#536078] hover:text-[#3E1CA0] hover:bg-[#3E1CA0]/10"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {canManage && (
                                <button
                                  onClick={() => deleteResourceMutation.mutate({ assignmentId: detailsData.id, resourceId: r.id })}
                                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {canManage && (
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3.5">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Add resource</p>
                      <div className="space-y-2">
                        <Input
                          value={resourceForm.title}
                          onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                          placeholder="Resource title"
                          className="h-8 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-[11px] text-[#0F1B3D] placeholder:text-[#94A3B8]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={resourceForm.type} onValueChange={(v) => setResourceForm({ ...resourceForm, type: v })}>
                            <SelectTrigger className="h-8 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-[11px] text-[#0F1B3D]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                              <SelectItem value="file" className="text-xs">File</SelectItem>
                              <SelectItem value="link" className="text-xs">Link</SelectItem>
                              <SelectItem value="video" className="text-xs">Video</SelectItem>
                              <SelectItem value="document" className="text-xs">Document</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={resourceForm.url}
                            onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                            placeholder="https://... or leave for file"
                            className="h-8 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-[11px] text-[#0F1B3D] placeholder:text-[#94A3B8]"
                          />
                        </div>
                        <Input
                          value={resourceForm.description}
                          onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                          placeholder="Short description (optional)"
                          className="h-8 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-[11px] text-[#0F1B3D] placeholder:text-[#94A3B8]"
                        />
                        <label className="flex items-center gap-2.5 rounded-xl bg-[#F3EEFF] border border-dashed border-[#E9E7F5] hover:border-[#3E1CA0]/40 transition-colors px-3 py-2 cursor-pointer">
                          <Paperclip className="w-3.5 h-3.5 text-[#3E1CA0] shrink-0" />
                          <span className="text-[10px] text-[#536078] truncate">{resourceForm.file ? resourceForm.file.name : 'Attach a file (optional)'}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files ? e.target.files[0] : null })}
                          />
                        </label>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg text-[10px] bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
                          disabled={!resourceForm.title.trim() || addResourceMutation.isPending}
                          onClick={() => addResourceMutation.mutate({ assignmentId: detailsData.id })}
                        >
                          {addResourceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Add Resource
                        </Button>
                      </div>
                    </div>
                  )}

                  {canManage ? (
                    <div>
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Submissions ({detailsData.submissions?.length || 0})</p>
                      {detailsData.submissions?.length > 0 ? (
                        <div className="space-y-2">
                          {detailsData.submissions.map((sub: any) => (
                            <div key={sub.id} className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3">
                              <div className="flex items-center gap-2.5">
                                <ProfileAvatar src={sub.user?.avatar || null} name={sub.user?.name || 'Student'} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{sub.user?.name || 'Student'}</p>
                                  <p className="text-[9px] text-[#94A3B8]">
                                    Attempt {sub.attempt_number || 1} · {sub.submitted_at ? formatDateRelative(sub.submitted_at) : ''}
                                    {sub.is_late ? ' · late' : ''}
                                  </p>
                                </div>
                                {sub.grade !== null ? (
                                  <div className="text-right shrink-0">
                                    <p className={`text-[12px] font-bold ${sub.grade >= (detailsData.passing_marks ?? 0) ? 'text-emerald-400' : 'text-red-400'}`}>{sub.grade}/{detailsData.max_score}</p>
                                    <p className="text-[9px] text-[#94A3B8]">{sub.graded_at ? `Graded ${formatDateRelative(sub.graded_at)}` : ''}</p>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setGradeFor({ ...sub, assignment_id: detailsData.id, max_score: detailsData.max_score ?? 100 })
                                      setGradeForm({ grade: '', feedback: '' })
                                    }}
                                    className="h-7 gap-1.5 rounded-lg text-[10px] text-[#3E1CA0] border-[#3E1CA0]/25 hover:bg-[#3E1CA0]/10 hover:text-[#3E1CA0] shrink-0"
                                  >
                                    <BadgeCheck className="w-3 h-3" />
                                    Grade
                                  </Button>
                                )}
                              </div>
                              {sub.text && <p className="text-[10px] text-[#536078] mt-2 border-l-2 border-[#3E1CA0]/30 pl-2 line-clamp-2">“{sub.text}”</p>}
                              {sub.feedback && <p className="text-[10px] text-[#536078] mt-1.5 line-clamp-2">Feedback: {sub.feedback}</p>}
                              {(sub.file_url || sub.url) && (
                                <div className="flex items-center gap-2 mt-2">
                                  {sub.url && (
                                    <a href={sub.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] text-cyan-300 hover:text-cyan-200">
                                      <ExternalLink className="w-3 h-3" /> Link
                                    </a>
                                  )}
                                  {sub.file_url && (
                                    <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] text-[#3E1CA0] hover:text-[#]">
                                      <Paperclip className="w-3 h-3" /> View file
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#94A3B8] bg-[#F3EEFF] rounded-xl border border-[#E9E7F5] p-3">No submissions yet.</p>
                      )}
                    </div>
                  ) : detailsData.my_submission ? (
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3.5">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">My submission</p>
                      {detailsData.my_submission.grade !== null ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-[#E9E7F5] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, detailsData.my_submission.percentage ?? 0)}%`, backgroundColor: (detailsData.my_submission.percentage ?? 0) >= 80 ? '#34d399' : (detailsData.my_submission.percentage ?? 0) >= 50 ? '#fbbf24' : '#f87171' }}
                            />
                          </div>
                          <span className="text-[13px] font-bold text-[#0F1B3D] shrink-0">{detailsData.my_submission.grade}/{detailsData.max_score}</span>
                          <span className="text-[11px] font-bold text-[#3E1CA0] shrink-0">{detailsData.my_submission.letter_grade || '—'}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-300 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Awaiting review
                        </p>
                      )}
                      {detailsData.my_submission.feedback && (
                        <p className="text-[10px] text-[#536078] mt-2 border-l-2 border-[#3E1CA0]/30 pl-2">“{detailsData.my_submission.feedback}”</p>
                      )}
                      {detailsData.my_submission.versions && detailsData.my_submission.versions.length > 1 && (
                        <div className="mt-3">
                          <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Version history</p>
                          <div className="space-y-1.5">
                            {detailsData.my_submission.versions.map((v: any) => (
                              <div key={v.id} className="flex items-center gap-2 text-[10px] text-[#536078]">
                                <span className="w-5 h-5 rounded-md bg-[#3E1CA0]/10 text-[#3E1CA0] flex items-center justify-center text-[9px] font-bold shrink-0">v{v.version_number}</span>
                                <span className="truncate">{v.submitted_at ? formatDateRelative(v.submitted_at) : 'Submitted'}{v.is_late ? ' · late' : ''}</span>
                                {v.url && <a href={v.url} target="_blank" rel="noreferrer" className="text-cyan-300 shrink-0 ml-auto"><ExternalLink className="w-3 h-3" /></a>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#94A3B8] bg-[#F3EEFF] rounded-xl border border-[#E9E7F5] p-3">Not submitted yet.</p>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog open={showAssignmentCreate} onOpenChange={setShowAssignmentCreate}>
        <DialogContent className="max-w-md p-0 gap-0 bg-white border border-[#E9E7F5] text-[#0F1B3D] overflow-hidden">
          <div className="relative overflow-hidden border-b border-[#E9E7F5] bg-gradient-to-br from-[#F3EEFF] via-[#EEF4FF] to-white px-5 py-4">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[#3E1CA0]/15 blur-3xl" />
            <div className="absolute -bottom-12 left-1/4 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-[#3E1CA0]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1B3D]">Create Assignment</h2>
                <p className="text-[10px] text-[#536078] mt-0.5">Assign homework to {s.name} for one of their enrolled courses.</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {courses.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg p-3">This student has no enrolled courses yet — add an enrollment before creating assignments.</p>
            ) : (
              <>
                {(() => {
                  const selectedCourse = courses.find((c: any) => String(c.course_id) === assignmentForm.course_id)
                  const cs = courseStyle(selectedCourse?.title)
                  const dm = difficultyMeta(assignmentForm.difficulty)
                  const due = dueInLabel(assignmentForm.due_date)
                  return (
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3.5">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Live preview</p>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{assignmentTypeIcon(assignmentForm.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-[#0F1B3D] truncate">{assignmentForm.title.trim() || 'Untitled assignment'}</p>
                            <span className={`text-[9px] font-medium ${dm.cls}`}>● {dm.label}</span>
                            <span className="text-[9px] font-medium text-sky-400/90 bg-sky-500/10 rounded-full px-1.5 py-0.5">{assignmentCategoryLabel(assignmentForm.category)}</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                            <span className="truncate">{selectedCourse?.title || 'No course selected'}</span>
                            <span className="text-[#C4C0D6]">·</span>
                            <span className="shrink-0 text-[#536078]">{assignmentForm.max_score || 100} marks</span>
                          </p>
                        </div>
                        {due && (
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-lg shrink-0 ${
                              due.overdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-300'
                            }`}
                          >
                            <CalendarClock className="w-3 h-3" />
                            {due.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Course *</Label>
                  <Select value={assignmentForm.course_id} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, course_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                      {courses.map((c: any) => (
                        <SelectItem key={c.course_id} value={String(c.course_id)} className="text-xs">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Title *</Label>
                  <Input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="e.g. React State Management Exercise" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Description *</Label>
                  <Textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} placeholder="Short summary students see on their dashboard" className="rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] min-h-[56px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Instructions</Label>
                  <Textarea value={assignmentForm.instructions} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} placeholder="Detailed task brief, steps and requirements (optional)" className="rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] min-h-[70px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Due date *</Label>
                    <Input type="datetime-local" value={assignmentForm.due_date} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] [color-scheme:light]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Starts</Label>
                    <Input type="datetime-local" value={assignmentForm.start_date} onChange={(e) => setAssignmentForm({ ...assignmentForm, start_date: e.target.value })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] [color-scheme:light]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Max marks</Label>
                    <Input type="number" min={1} max={1000} value={assignmentForm.max_score} onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: Number(e.target.value) })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Passing marks</Label>
                    <Input type="number" min={0} max={1000} value={assignmentForm.passing_marks} onChange={(e) => setAssignmentForm({ ...assignmentForm, passing_marks: e.target.value })} placeholder="Optional" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Type</Label>
                    <Select value={assignmentForm.type} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, type: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="file" className="text-xs">File upload</SelectItem>
                        <SelectItem value="text" className="text-xs">Text / written</SelectItem>
                        <SelectItem value="quiz" className="text-xs">Quiz</SelectItem>
                        <SelectItem value="group" className="text-xs">Group task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Category</Label>
                    <Select value={assignmentForm.category} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, category: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="homework" className="text-xs">Homework</SelectItem>
                        <SelectItem value="quiz" className="text-xs">Quiz</SelectItem>
                        <SelectItem value="project" className="text-xs">Project</SelectItem>
                        <SelectItem value="exam" className="text-xs">Exam</SelectItem>
                        <SelectItem value="exercise" className="text-xs">Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Difficulty</Label>
                    <Select value={assignmentForm.difficulty} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, difficulty: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="easy" className="text-xs">Easy</SelectItem>
                        <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                        <SelectItem value="hard" className="text-xs">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Est. minutes</Label>
                    <Input type="number" min={5} max={10080} value={assignmentForm.estimated_minutes} onChange={(e) => setAssignmentForm({ ...assignmentForm, estimated_minutes: e.target.value })} placeholder="Optional" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Submission type</Label>
                    <Select value={assignmentForm.submission_type} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, submission_type: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="upload" className="text-xs">File upload</SelectItem>
                        <SelectItem value="text" className="text-xs">Text answer</SelectItem>
                        <SelectItem value="url" className="text-xs">Link submission</SelectItem>
                        <SelectItem value="multiple" className="text-xs">Files + text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Attempts</Label>
                    <Input type="number" min={1} max={50} value={assignmentForm.attempts_allowed} onChange={(e) => setAssignmentForm({ ...assignmentForm, attempts_allowed: Number(e.target.value) })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Max files</Label>
                    <Input type="number" min={1} max={20} value={assignmentForm.max_files} onChange={(e) => setAssignmentForm({ ...assignmentForm, max_files: Number(e.target.value) })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">File size (MB)</Label>
                    <Input type="number" min={1} max={512} value={assignmentForm.max_file_size_mb} onChange={(e) => setAssignmentForm({ ...assignmentForm, max_file_size_mb: Number(e.target.value) })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Visibility</Label>
                    <Select value={assignmentForm.visibility} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, visibility: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="all" className="text-xs">All enrolled</SelectItem>
                        <SelectItem value="enrolled" className="text-xs">Enrolled only</SelectItem>
                        <SelectItem value="selected" className="text-xs">Selected students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Publish</Label>
                    <Select value={assignmentForm.status} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, status: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="published" className="text-xs">Published now</SelectItem>
                        <SelectItem value="draft" className="text-xs">Save as draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setShowAssignmentCreate(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
                disabled={!assignmentForm.course_id || !assignmentForm.title.trim() || !assignmentForm.description.trim() || !assignmentForm.due_date || createAssignmentMutation.isPending}
                onClick={() => createAssignmentMutation.mutate({
                  course_id: Number(assignmentForm.course_id),
                  title: assignmentForm.title.trim(),
                  description: assignmentForm.description.trim(),
                  instructions: assignmentForm.instructions.trim() || undefined,
                  due_date: new Date(assignmentForm.due_date).toISOString(),
                  start_date: assignmentForm.start_date ? new Date(assignmentForm.start_date).toISOString() : undefined,
                  max_score: assignmentForm.max_score || 100,
                  passing_marks: assignmentForm.passing_marks ? Number(assignmentForm.passing_marks) : undefined,
                  type: assignmentForm.type,
                  category: assignmentForm.category,
                  difficulty: assignmentForm.difficulty,
                  estimated_minutes: assignmentForm.estimated_minutes ? Number(assignmentForm.estimated_minutes) : undefined,
                  submission_type: assignmentForm.submission_type,
                  max_files: assignmentForm.max_files || 1,
                  max_file_size_mb: assignmentForm.max_file_size_mb || 20,
                  attempts_allowed: assignmentForm.attempts_allowed || 1,
                  visibility: assignmentForm.visibility,
                  status: assignmentForm.status,
                })}
              >
                {createAssignmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={!!submitFor} onOpenChange={(o) => { if (!o) { setSubmitFor(null); setSubmitText(''); setSubmitUrl(''); setSubmitFiles([]) } }}>
        <DialogContent className="sm:max-w-md bg-white border-[#E9E7F5]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-[#3E1CA0]" />
              Submit Assignment
            </DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Submit “{submitFor?.title}”{submitFor?.course ? ` (${submitFor.course})` : ''} for {s.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {submitFor && (
              <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3 space-y-1.5">
                {(() => {
                  const due = dueInLabel(submitFor.due_date)
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8]">Due</span>
                      <span className={`text-[10px] font-semibold ${due?.overdue ? 'text-red-400' : 'text-amber-300'}`}>{due?.label || '—'}</span>
                    </div>
                  )
                })()}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8]">Max marks</span>
                  <span className="text-[10px] text-[#536078]">{submitFor.max_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8]">Attempt</span>
                  <span className="text-[10px] text-[#536078]">
                    {(submitFor.attempt_number || 0) + 1} of {submitFor.attempts_allowed || 1}
                  </span>
                </div>
                {submitFor.allow_late_submission === false && (() => { const dued = dueInLabel(submitFor.due_date); return dued?.overdue && (
                  <div className="flex items-center gap-1.5 text-[9px] text-red-400 bg-red-500/10 rounded-lg px-2 py-1">
                    <AlertTriangle className="w-3 h-3" />
                    Late submissions are not allowed for this assignment
                  </div>
                ) })()}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Answer / note</Label>
              <Textarea
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
                placeholder="Write your answer or a short note for the reviewer..."
                className="rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] min-h-[80px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Files</Label>
              <label className="flex items-center gap-2.5 rounded-xl bg-[#F3EEFF] border border-dashed border-[#E9E7F5] hover:border-[#3E1CA0]/40 transition-colors px-3 py-2.5 cursor-pointer">
                <Paperclip className="w-4 h-4 text-[#3E1CA0] shrink-0" />
                <span className="text-[10px] text-[#536078] truncate">
                  {submitFiles.length > 0 ? `${submitFiles.length} file${submitFiles.length > 1 ? 's' : ''} ready — ${submitFiles.map((f) => f.name).join(', ')}` : `Choose files (max ${submitFor?.max_files || 1}, ${submitFor?.max_file_size_mb || 20} MB each)`}
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setSubmitFiles(e.target.files ? Array.from(e.target.files) : [])}
                />
              </label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Link (optional)</Label>
              <Input
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                placeholder="https://... (for link submissions)"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => { setSubmitFor(null); setSubmitText(''); setSubmitUrl(''); setSubmitFiles([]) }}>Cancel</Button>
            <Button
              size="sm"
              className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
              disabled={submitAssignmentMutation.isPending || (!submitText.trim() && !submitUrl.trim() && submitFiles.length === 0)}
              onClick={() => submitFor && submitAssignmentMutation.mutate({ assignmentId: submitFor.assignment_id, files: submitFiles, text: submitText.trim(), url: submitUrl.trim() })}
            >
              {submitAssignmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Confirm Submission
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={!!gradeFor} onOpenChange={(o) => { if (!o) setGradeFor(null) }}>
        <DialogContent className="sm:max-w-md bg-white border-[#E9E7F5]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#3E1CA0]" />
              {gradeFor?.status === 'graded' ? 'Regrade Submission' : 'Grade Submission'}
            </DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {gradeFor?.title} — {s.name}'s attempt {gradeFor?.attempt_number || 1} submitted {gradeFor?.submitted_at ? formatDateRelative(gradeFor.submitted_at) : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Score (out of {gradeFor?.max_score ?? 100})</Label>
              <Input
                type="number"
                min={0}
                max={gradeFor?.max_score ?? 100}
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                placeholder="0"
                className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] [color-scheme:light]"
              />
              {gradeForm.grade !== '' && !isNaN(Number(gradeForm.grade)) && (
                (() => {
                  const pct = (Number(gradeForm.grade) / (gradeFor?.max_score ?? 100)) * 100
                  const letter = pct >= 90 ? 'A+' : pct >= 85 ? 'A' : pct >= 80 ? 'A-' : pct >= 75 ? 'B+' : pct >= 70 ? 'B' : pct >= 65 ? 'B-' : pct >= 60 ? 'C+' : pct >= 55 ? 'C' : pct >= 50 ? 'C-' : pct >= 45 ? 'D' : 'F'
                  return (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#E9E7F5] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171' }} />
                      </div>
                      <span className={`text-[11px] font-bold shrink-0 ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {Math.round(pct)}% · {letter}
                      </span>
                    </div>
                  )
                })()
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Feedback</Label>
              <Textarea
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Write constructive feedback for the student..."
                className="rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] min-h-[90px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setGradeFor(null)}>Cancel</Button>
            <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90"
              disabled={gradeForm.grade === '' || Number(gradeForm.grade) > (gradeFor?.max_score ?? 100) || gradeAssignmentMutation.isPending}
              onClick={() =>
                gradeFor &&
                gradeAssignmentMutation.mutate({
                  assignmentId: gradeFor.assignment_id,
                  submissionId: gradeFor.id,
                  grade: Number(gradeForm.grade),
                  feedback: gradeForm.feedback.trim(),
                })
              }
            >
              {gradeAssignmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
              {gradeFor?.status === 'graded' ? 'Update Grade' : 'Publish Grade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <Dialog open={!!deleteFor} onOpenChange={(o) => { if (!o) setDeleteFor(null) }}>
        <DialogContent className="sm:max-w-md bg-white border-[#E9E7F5]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Delete Assignment?
            </DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              “{deleteFor?.title}” and all of its submissions will be permanently removed from the course. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setDeleteFor(null)}>Cancel</Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-9 text-xs rounded-xl gap-1.5"
              disabled={deleteAssignmentMutation.isPending}
              onClick={() => deleteFor && deleteAssignmentMutation.mutate(deleteFor.assignment_id)}
            >
              {deleteAssignmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={showProjectCreate} onOpenChange={setShowProjectCreate}>
        <DialogContent className="max-w-md p-0 gap-0 bg-white border border-[#E9E7F5] text-[#0F1B3D] overflow-hidden">
          <div className="relative overflow-hidden border-b border-[#E9E7F5] bg-gradient-to-br from-[#F3EEFF] via-[#EEF4FF] to-white px-5 py-4">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[#3E1CA0]/15 blur-3xl" />
            <div className="absolute -bottom-12 left-1/4 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#3E1CA0]/10 border border-[#3E1CA0]/20 flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5 text-[#3E1CA0]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1B3D]">Create Project</h2>
                <p className="text-[10px] text-[#536078] mt-0.5">Assign a hands-on project to {s.name} for one of their enrolled courses.</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {courses.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg p-3">This student has no enrolled courses yet — add an enrollment before creating projects.</p>
            ) : (
              <>
                {(() => {
                  const selectedCourse = courses.find((c: any) => String(c.course_id) === projectForm.course_id)
                  const cs = courseStyle(selectedCourse?.title)
                  const dm = difficultyMeta(projectForm.difficulty)
                  const due = dueInLabel(projectForm.due_date)
                  return (
                    <div className="rounded-xl bg-[#F3EEFF] border border-[#E9E7F5] p-3.5">
                      <p className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Live preview</p>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cs.tile} flex items-center justify-center shrink-0`}>{projectTypeIcon(projectForm.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-[#0F1B3D] truncate">{projectForm.title.trim() || 'Untitled project'}</p>
                            <span className={`text-[9px] font-medium ${dm.cls}`}>● {dm.label}</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                            <span className="truncate">{selectedCourse?.title || 'No course selected'}</span>
                            <span className="text-[#C4C0D6]">·</span>
                            <span className="shrink-0 capitalize text-[#536078]">{projectTypeLabel(projectForm.category)}</span>
                            <span className="text-[#C4C0D6]">·</span>
                            <span className="shrink-0 text-[#536078]">{projectForm.max_points || 100} pts</span>
                          </p>
                        </div>
                        {due && (
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-lg shrink-0 ${
                              due.overdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-300'
                            }`}
                          >
                            <CalendarClock className="w-3 h-3" />
                            {due.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Course *</Label>
                  <Select value={projectForm.course_id} onValueChange={(v) => setProjectForm({ ...projectForm, course_id: v })}>
                    <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                      {courses.map((c: any) => (
                        <SelectItem key={c.course_id} value={String(c.course_id)} className="text-xs">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Title *</Label>
                  <Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="e.g. Build a Restaurant Landing Page" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Description *</Label>
                  <Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="What should the student build?" className="rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] min-h-[70px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#536078]">Technologies <span className="text-[#94A3B8] font-normal">(comma separated)</span></Label>
                  <Input value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} placeholder="React, Tailwind, Firebase" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Type</Label>
                    <Select value={projectForm.category} onValueChange={(v) => setProjectForm({ ...projectForm, category: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="build" className="text-xs">Build / implement</SelectItem>
                        <SelectItem value="design" className="text-xs">Design</SelectItem>
                        <SelectItem value="research" className="text-xs">Research</SelectItem>
                        <SelectItem value="portfolio" className="text-xs">Portfolio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Difficulty</Label>
                    <Select value={projectForm.difficulty} onValueChange={(v) => setProjectForm({ ...projectForm, difficulty: v })}>
                      <SelectTrigger className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E9E7F5] text-[#0F1B3D]">
                        <SelectItem value="easy" className="text-xs">Easy</SelectItem>
                        <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                        <SelectItem value="hard" className="text-xs">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Due date</Label>
                    <Input type="datetime-local" value={projectForm.due_date} onChange={(e) => setProjectForm({ ...projectForm, due_date: e.target.value })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] [color-scheme:light]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#536078]">Max points</Label>
                    <Input type="number" min={10} max={1000} value={projectForm.max_points} onChange={(e) => setProjectForm({ ...projectForm, max_points: Number(e.target.value) })} className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D]" />
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setShowProjectCreate(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] hover:opacity-90 text-white font-semibold"
                disabled={!projectForm.course_id || !projectForm.title.trim() || !projectForm.description.trim() || createProjectMutation.isPending}
                onClick={() => createProjectMutation.mutate()}
              >
                {createProjectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Certificate Dialog */}
      <Dialog open={showCertUpload} onOpenChange={setShowCertUpload}>
        <DialogContent className="max-w-md bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] flex items-center gap-2"><Upload className="w-4 h-4 text-[#3E1CA0]" />Upload Certificate</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">Upload a scanned certificate or PDF for {s.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Certificate file *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setCertForm((f) => ({ ...f, file, title: f.title || file?.name?.split('.')[0] || '' }))
                  }}
                  className="block w-full text-[11px] text-[#536078] file:mr-3 file:rounded-lg file:border-0 file:bg-[#3E1CA0]/15 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-[#3E1CA0] hover:file:bg-[#3E1CA0]/25 cursor-pointer"
                />
              </div>
              {certForm.file && (
                <p className="text-[10px] text-[#94A3B8]">{(certForm.file.size / 1024).toFixed(1)} KB selected</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Title *</Label>
              <Input value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} placeholder="e.g. Python Programming Certificate" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">Description <span className="text-[#94A3B8] font-normal">(optional)</span></Label>
              <Input value={certForm.description} onChange={(e) => setCertForm({ ...certForm, description: e.target.value })} placeholder="e.g. Verified by Bangladesh ICT Division" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => { setShowCertUpload(false); setCertForm({ title: '', description: '', file: null }) }}>Cancel</Button>
              <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" disabled={!certForm.file || !certForm.title.trim() || uploadCertificateMutation.isPending} onClick={() => uploadCertificateMutation.mutate()}>
                {uploadCertificateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Payment Dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <DialogContent className="max-w-sm bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] flex items-center gap-2"><Undo2 className="w-4 h-4 text-red-400" />Refund Payment</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Refund {refundTarget ? formatMoney(refundTarget.amount, refundTarget.currency) : ''} for {refundTarget?.course || 'this course'}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button size="sm" className="h-9 text-xs rounded-xl bg-red-600 hover:bg-red-700 gap-1.5" disabled={refundPaymentMutation.isPending} onClick={() => refundTarget && refundPaymentMutation.mutate(refundTarget.id)}>
              {refundPaymentMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Confirm Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent className="max-w-sm bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">Reset Password</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">Set a new password for {s.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#536078]">New Password *</Label>
              <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Min 6 characters" className="h-9 rounded-xl bg-[#F3EEFF] border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8]" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setShowReset(false)}>Cancel</Button>
              <Button size="sm" className="h-9 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-[#3E1CA0] to-[#6D3DF5] text-white hover:opacity-90" disabled={!resetPassword.trim() || resetPasswordMutation.isPending} onClick={() => resetPasswordMutation.mutate(resetPassword.trim())}>
                {resetPasswordMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspend} onOpenChange={setShowSuspend}>
        <DialogContent className="max-w-sm bg-white border border-[#E9E7F5] text-[#0F1B3D]">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D]">{isSuspended ? 'Activate Student' : 'Suspend Student'}</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              {isSuspended ? `Restore access for ${s.name}?` : `Block ${s.name} from the platform?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[#E9E7F5]" onClick={() => setShowSuspend(false)}>Cancel</Button>
            <Button size="sm" className="h-9 text-xs rounded-xl bg-red-600 hover:bg-red-700 gap-1.5" disabled={suspendMutation.isPending} onClick={() => suspendMutation.mutate(isSuspended ? 'active' : 'suspended')}>
              {suspendMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
