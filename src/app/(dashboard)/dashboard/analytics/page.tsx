'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, DollarSign, BookOpen, ClipboardList, FolderKanban,
  ShoppingBag, Briefcase, Wallet, Activity, ArrowUpRight,
  Calendar, Clock, Video, CheckCircle, AlertTriangle, UserX,
  Star, Sparkles, Loader2, RefreshCcw, UserCheck, Award, CreditCard,
  GraduationCap, Zap, ChevronLeft, ChevronRight,
  Bell, Newspaper, Trophy, X, ExternalLink,
} from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { cn } from '@/lib/utils'
import { analyticsAPI } from '@/lib/api'
import type { AnalyticsOverview } from '@/types'
import Link from 'next/link'

const CHART_GREEN = '#10B981'
const CHART_GREEN_LIGHT = '#6EE7B7'
const CHART_ORANGE = '#FF8A36'
const CHART_ORANGE_LIGHT = '#FFB067'

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#FF8A36', '#F59E0B', '#6366F1', '#EC4899']

const statIcons: Record<string, React.ReactNode> = {
  courses: <BookOpen className="w-4 h-4" />,
  enrollments: <Users className="w-4 h-4" />,
  assignments: <ClipboardList className="w-4 h-4" />,
  projects: <FolderKanban className="w-4 h-4" />,
  services: <ShoppingBag className="w-4 h-4" />,
  jobs: <Briefcase className="w-4 h-4" />,
  wallet: <Wallet className="w-4 h-4" />,
  revenue: <DollarSign className="w-4 h-4" />,
}

const quickActions = [
  { label: 'New Course', href: '/dashboard/courses?create=1', icon: <BookOpen className="w-4 h-4" />, color: 'from-emerald-500 to-teal-600' },
  { label: 'New Assignment', href: '/dashboard/assignments?create=1', icon: <ClipboardList className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
  { label: 'New Class', href: '/dashboard/classes?create=1', icon: <Video className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  { label: 'New Project', href: '/dashboard/projects?create=1', icon: <FolderKanban className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
  { label: 'New Service', href: '/dashboard/marketplace?create=1', icon: <ShoppingBag className="w-4 h-4" />, color: 'from-rose-500 to-red-500' },
  { label: 'New Job', href: '/dashboard/jobs?create=1', icon: <Briefcase className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
]

// ---- Shared chart tooltip ----
const ChartTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-[#0A2418] border border-white/[0.1] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const formatCurrencyValue = (value: number) => '৳' + value.toLocaleString()

// =====================================================================
// MONTH NAMES & DAYS
// =====================================================================
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// =====================================================================
// CALENDAR COMPONENT
// =====================================================================
function CalendarWidget({
  selectedDate,
  onSelectDate,
  className,
}: {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  className?: string
}) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  useEffect(() => {
    setViewYear(selectedDate.getFullYear())
    setViewMonth(selectedDate.getMonth())
  }, [selectedDate])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className={cn('select-none', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-500 font-medium py-1">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const date = day !== null ? new Date(viewYear, viewMonth, day) : null
          const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString()
          const isToday = date && date.toDateString() === today.toDateString()
          return (
            <button
              key={i}
              disabled={day === null}
              onClick={() => date && onSelectDate(date)}
              className={cn(
                'w-full aspect-square flex items-center justify-center rounded-lg text-xs transition-all duration-150',
                day === null ? 'cursor-default' : 'cursor-pointer',
                isSelected
                  ? 'bg-[#FF8A36] text-white font-bold shadow-lg shadow-orange-500/30 scale-105'
                  : isToday
                    ? 'text-white font-semibold bg-white/10 ring-1 ring-white/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              {day ?? ''}
            </button>
          )
        })}
      </div>
      {/* Today quick-jump */}
      {!isCurrentMonth && (
        <button
          onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); onSelectDate(today) }}
          className="mt-2 w-full text-[10px] text-[#FF8A36] hover:text-orange-300 transition-colors font-medium"
        >
          Back to today
        </button>
      )}
    </div>
  )
}

// =====================================================================
// DONUT / PROGRESS RING COMPONENT
// =====================================================================
function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  color = CHART_GREEN,
  bgColor = 'rgba(255,255,255,0.05)',
  label,
  sublabel,
}: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  label?: string
  sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-sm font-bold text-white">{label ?? `${Math.round(progress * 100)}%`}</span>
      {sublabel && <span className="text-[9px] text-slate-400 -mt-0.5">{sublabel}</span>}
    </div>
  )
}

// =====================================================================
// NOTICE / NEWS MODAL
// =====================================================================
function NoticeModal({
  notice,
  onClose,
}: {
  notice: { id: number; title: string; content: string; date: string; author?: string } | null
  onClose: () => void
}) {
  if (!notice) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg bg-gradient-to-b from-[#0E2E1F] to-[#0A2418] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">{notice.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {notice.date}{notice.author ? ` · ${notice.author}` : ''}
                </p>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =====================================================================
// MAIN PAGE
// =====================================================================
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [noticeModal, setNoticeModal] = useState<{ id: number; title: string; content: string; date: string; author?: string } | null>(null)
  const [leaderboardTab, setLeaderboardTab] = useState<'instructors' | 'students'>('students')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const res = await analyticsAPI.getOverview()
      if (res.data?.status === 'success') setData(res.data.data)
      else setError('Failed to load analytics data')
    } catch { setError('Failed to load analytics data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ---- Derived stats cards ----
  const statsCards = useMemo(() => data ? [
    { label: 'Courses', value: data.stats.total_courses.toString(), icon: statIcons.courses, color: 'from-emerald-500 to-teal-500', change: '' },
    { label: 'Enrollments', value: data.stats.total_enrollments.toString(), subtitle: `${data.stats.active_enrollments} active`, icon: statIcons.enrollments, color: 'from-[#10B981] to-emerald-600', change: '' },
    { label: 'Assignments', value: data.stats.total_assignments.toString(), subtitle: `${data.stats.submitted_assignments} submitted`, icon: statIcons.assignments, color: 'from-blue-500 to-indigo-500', change: '' },
    { label: 'Projects', value: data.stats.total_projects.toString(), icon: statIcons.projects, color: 'from-amber-500 to-orange-500', change: '' },
    { label: 'Services', value: data.stats.total_services.toString(), icon: statIcons.services, color: 'from-rose-500 to-red-500', change: '' },
    { label: 'Jobs', value: data.stats.total_jobs.toString(), icon: statIcons.jobs, color: 'from-cyan-500 to-blue-500', change: '' },
    { label: 'Wallet', value: `৳${data.stats.wallet_balance.toLocaleString()}`, icon: statIcons.wallet, color: 'from-violet-500 to-purple-500', change: '' },
    { label: 'Revenue', value: `৳${data.stats.total_revenue.toLocaleString()}`, subtitle: `Net: ৳${data.stats.net_revenue.toLocaleString()}`, icon: statIcons.revenue, color: 'from-pink-500 to-rose-500', change: '' },
  ] : [], [data])

  // ---- Calendar: filtered schedule for selected date ----
  const filteredSlots = useMemo(() => {
    if (!data) return { classes: [], assignments: [], projects: [] }
    const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    return {
      classes: data.schedule.upcoming_classes.filter(c => c.date.startsWith(dateStr)),
      assignments: data.schedule.assignment_deadlines.filter(a => a.due_date && a.due_date.startsWith(dateStr)),
      projects: data.schedule.project_deadlines.filter(p => p.deadline && p.deadline.startsWith(dateStr)),
    }
  }, [data, selectedDate])

  // ---- Notices (mock from recent payments + schedule as news feed) ----
  const noticeFeed = useMemo(() => {
    if (!data) return []
    const notices: { id: number; title: string; content: string; date: string; author?: string }[] = []
    data.revenue.recent_payments.slice(0, 4).forEach(p => {
      notices.push({
        id: p.id,
        title: `New enrollment: ${p.course}`,
        content: `${p.user} enrolled in "${p.course}" — ৳${p.amount.toLocaleString()} via ${p.method}`,
        date: p.created_at,
      })
    })
    data.schedule.upcoming_classes.slice(0, 3).forEach(c => {
      notices.push({
        id: 1000 + c.id,
        title: `Upcoming class: ${c.title}`,
        content: `Instructor: ${c.instructor}\nDate: ${c.date} at ${c.time}\nType: ${c.type}`,
        date: c.date,
        author: c.instructor,
      })
    })
    data.schedule.assignment_deadlines.slice(0, 3).forEach(a => {
      notices.push({
        id: 2000 + a.id,
        title: `Assignment due: ${a.title}`,
        content: `Course: ${a.course}\nDue: ${a.due_date}`,
        date: a.due_date,
      })
    })
    notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return notices.slice(0, 8)
  }, [data])

  // ---- Leaderboard mock data (from existing student data + enrich with rankings) ----
  const leaderboard = useMemo(() => {
    if (!data) return { instructors: [], students: [] }
    const instructors = data.course_performance.popular_courses
      .filter((c, i, arr) => arr.findIndex(x => x.slug === c.slug) === i)
      .slice(0, 5)
      .map((c, i) => ({
        id: c.id,
        name: c.title,
        role: 'Instructor',
        courses: c.enrollments_count,
        rating: c.rating,
        students: c.students_count,
        progress: Math.min(100, Math.round((c.completion_rate || 0) * 1.1)),
        avatar: null,
      }))

    const students = (data.student_activity.active_students || data.student_activity.at_risk_students || [])
      .slice(0, 6)
      .map((s, i) => ({
        id: s.id,
        name: s.name,
        role: 'Student',
        courses: s.enrolled_courses,
        rating: 4.0 + Math.random() * 1.0,
        students: 0,
        progress: s.average_progress,
        avatar: s.avatar,
      }))

    return { instructors, students }
  }, [data])

  // ---- Calendar reminder count for each day (from schedule data) ----
  const eventCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    if (!data) return map
    ;[...data.schedule.upcoming_classes, ...data.schedule.assignment_deadlines, ...data.schedule.project_deadlines].forEach(e => {
      const d = (e as any).date || (e as any).due_date || (e as any).deadline || ''
      if (d) {
        const key = d.substring(0, 10)
        map[key] = (map[key] || 0) + 1
      }
    })
    return map
  }, [data])

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981] mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // ---- Error ----
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 mb-4">{error || 'No data available'}</p>
          <GlassButton onClick={fetchData}><RefreshCcw className="w-3.5 h-3.5" /> Retry</GlassButton>
        </div>
      </div>
    )
  }

  const { revenue, enrollments, course_performance, student_activity, schedule, recommendations, charts } = data
  const stats = data.stats

  return (
    <div className="space-y-5 pb-8">
      {/* ===== NOTICE MODAL ===== */}
      <NoticeModal notice={noticeModal} onClose={() => setNoticeModal(null)} />

      {/* ===== HEADER ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white font-space-grotesk">Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive platform performance & diagnostics</p>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton variant="secondary" size="sm" onClick={fetchData}>
              <RefreshCcw className="w-3 h-3" /> Refresh Feed
            </GlassButton>
            <Badge variant="outline" className="gap-1 border-white/[0.1] text-slate-400">
              <Activity className="w-3 h-3 text-[#10B981]" /> Last 12 months
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ===== STATS CARDS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3"
      >
        {statsCards.map((stat, i) => (
          <GlassCard key={stat.label} className="relative overflow-hidden group" hover>
            <GlassCardContent className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                {stat.change && (
                  <Badge variant="success" className="gap-0.5 text-[9px] px-1.5 py-0">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{stat.subtitle || stat.label}</div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 1: Revenue Bar Chart + Calendar — side by side            */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Bar Chart (spans 2 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Revenue & Earnings Statistics</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <DollarSign className="w-3 h-3 text-[#FF8A36] mr-1" /> Monthly
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenue_trends} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_ORANGE} />
                        <stop offset="50%" stopColor={CHART_GREEN} />
                        <stop offset="100%" stopColor={CHART_GREEN_LIGHT} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      content={<ChartTooltip formatter={formatCurrencyValue} />}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#revGradient)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Monthly stats summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                {(() => {
                  const trends = charts.revenue_trends
                  const total = trends.reduce((s, r) => s + r.revenue, 0)
                  const avg = total / (trends.length || 1)
                  const best = trends.reduce((b, r) => r.revenue > (b?.revenue || 0) ? r : b, trends[0])
                  return (
                    <>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="text-sm font-bold text-white mt-0.5">{formatCurrencyValue(total)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Monthly Avg</p>
                        <p className="text-sm font-bold text-white mt-0.5">{formatCurrencyValue(Math.round(avg))}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Best Month</p>
                        <p className="text-sm font-bold text-[#FF8A36] mt-0.5">{best?.month || '-'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Best Revenue</p>
                        <p className="text-sm font-bold text-[#10B981] mt-0.5">{best ? formatCurrencyValue(best.revenue) : '-'}</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#FF8A36]" />
                  Calendar
                </span>
              </GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                {schedule.upcoming_classes.length + schedule.assignment_deadlines.length + schedule.project_deadlines.length} events
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />

              {/* Upcoming Slots */}
              {filteredSlots.classes.length > 0 || filteredSlots.assignments.length > 0 || filteredSlots.projects.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#FF8A36]" />
                    Upcoming Slots
                  </h4>
                  <div className="space-y-1.5 max-h-[130px] overflow-y-auto custom-scrollbar">
                    {filteredSlots.classes.map(c => (
                      <div key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10B981]/20 to-emerald-600/20 border border-[#10B981]/20 flex items-center justify-center shrink-0">
                          <Video className="w-3 h-3 text-[#10B981]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-white truncate">{c.title}</p>
                          <p className="text-[9px] text-slate-400">{c.time} · {c.instructor}</p>
                        </div>
                      </div>
                    ))}
                    {filteredSlots.assignments.map(a => (
                      <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-3 h-3 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-white truncate">{a.title}</p>
                          <p className="text-[9px] text-slate-400">{a.course}</p>
                        </div>
                      </div>
                    ))}
                    {filteredSlots.projects.map(p => (
                      <div key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <FolderKanban className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-white truncate">{p.title}</p>
                          <p className="text-[9px] text-slate-400">Budget: {formatCurrencyValue(p.budget)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-center py-4">
                  <Calendar className="w-5 h-5 text-slate-500/50 mx-auto mb-1.5" />
                  <p className="text-[10px] text-slate-400">No events on this date</p>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 2: CHARTS ROW — Enrollments + Donut Rings + Student Growth */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Enrollment Trends */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Enrollment Trends</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <Users className="w-3 h-3 text-[#10B981] mr-1" /> {enrollments.total} total
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.enrollment_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="count" stroke={CHART_GREEN} strokeWidth={2} dot={{ fill: CHART_GREEN, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* User Base Breakdown — Donut Rings */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>User Base Breakdown</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <Users className="w-3 h-3 text-[#FF8A36] mr-1" /> {student_activity.total}
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <ProgressRing
                  value={student_activity.active}
                  max={student_activity.total || 1}
                  color={CHART_GREEN}
                  size={70}
                  strokeWidth={5}
                  label={student_activity.active.toString()}
                  sublabel="Active"
                />
                <ProgressRing
                  value={student_activity.at_risk}
                  max={student_activity.total || 1}
                  color={CHART_ORANGE}
                  size={70}
                  strokeWidth={5}
                  label={student_activity.at_risk.toString()}
                  sublabel="At Risk"
                />
                <ProgressRing
                  value={student_activity.inactive}
                  max={student_activity.total || 1}
                  color="rgba(148,163,184,0.6)"
                  size={70}
                  strokeWidth={5}
                  label={student_activity.inactive.toString()}
                  sublabel="Inactive"
                />
              </div>
              {/* Pie chart breakdown */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: student_activity.active, color: CHART_GREEN },
                        { name: 'At Risk', value: student_activity.at_risk, color: CHART_ORANGE },
                        { name: 'Inactive', value: student_activity.inactive, color: 'rgba(148,163,184,0.6)' },
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { color: CHART_GREEN },
                        { color: CHART_ORANGE },
                        { color: 'rgba(148,163,184,0.6)' },
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF8A36]" /> At Risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500/60" /> Inactive</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Student Growth */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Student Growth</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <GraduationCap className="w-3 h-3 text-[#10B981] mr-1" /> {student_activity.total} total
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.student_growth}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GREEN} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={CHART_GREEN} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" stroke={CHART_GREEN} strokeWidth={2} fill="url(#growthGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 3: Completion + Course Performance                        */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Course Completion</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <CheckCircle className="w-3 h-3 text-[#10B981] mr-1" /> {enrollments.completion.completion_rate}% rate
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.completion_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="total" stroke={CHART_ORANGE} strokeWidth={2} dot={false} name="Total enrollments" />
                    <Line type="monotone" dataKey="completed" stroke={CHART_GREEN} strokeWidth={2} dot={{ fill: CHART_GREEN, r: 3 }} name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Course Categories Pie */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Course Categories</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <BookOpen className="w-3 h-3 text-[#10B981] mr-1" /> {charts.course_categories.length} categories
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.course_categories.map(c => ({ ...c, fill: COLORS[charts.course_categories.indexOf(c) % COLORS.length] }))}
                      cx="50%" cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="category"
                    >
                      {charts.course_categories.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {charts.course_categories.map((c, i) => (
                  <span key={c.category} className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {c.category}
                  </span>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 4: COURSE PERFORMANCE TABLE                               */}
      {/* ================================================================= */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Course Performance</GlassCardTitle>
            <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
              <Star className="w-3 h-3 text-[#10B981] mr-1" /> Top courses
            </Badge>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Course</th>
                    <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Category</th>
                    <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Students</th>
                    <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Rating</th>
                    <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Completion</th>
                    <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {course_performance.popular_courses.slice(0, 8).map((course, i) => (
                    <tr key={course.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 pr-2">
                        <Link href={`/courses/${course.slug}`} className="text-white text-xs font-medium hover:text-[#10B981] transition-colors truncate block max-w-[200px]">
                          {course.title}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{course.category}</span></td>
                      <td className="py-2.5 pr-2 text-center"><span className="text-xs text-slate-300">{course.students_count || course.enrollments_count}</span></td>
                      <td className="py-2.5 pr-2 text-center">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {course.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span className={cn('text-xs font-medium', course.completion_rate >= 50 ? 'text-emerald-400' : course.completion_rate >= 25 ? 'text-amber-400' : 'text-slate-400')}>
                          {course.completion_rate}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border',
                          course.level === 'beginner' ? 'border-emerald-500/30 text-emerald-400' :
                          course.level === 'intermediate' ? 'border-amber-500/30 text-amber-400' :
                          'border-rose-500/30 text-rose-400')}>
                          {course.level}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 5: STUDENT ACTIVITY + NOTICE BOARD — side by side         */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Student Activity */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Student Activity</GlassCardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                  <Activity className="w-3 h-3 text-[#10B981] mr-1" /> {student_activity.weekly_active} weekly
                </Badge>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-slate-400">Active</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">{student_activity.active}</span>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-slate-400">At Risk</span>
                  </div>
                  <span className="text-xl font-bold text-amber-400">{student_activity.at_risk}</span>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <UserX className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-400">Inactive</span>
                  </div>
                  <span className="text-xl font-bold text-slate-400">{student_activity.inactive}</span>
                </div>
              </div>

              {student_activity.at_risk_students.length > 0 && (
                <div>
                  <h4 className="text-[11px] text-amber-400 font-semibold mb-2 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Needs Attention
                  </h4>
                  <div className="space-y-1.5">
                    {student_activity.at_risk_students.slice(0, 4).map(student => (
                      <div key={student.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{student.name}</p>
                          <p className="text-[10px] text-slate-400">{student.enrolled_courses} courses · {student.average_progress}% avg</p>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FF8A36] to-[#10B981] transition-all"
                              style={{ width: `${Math.min(100, student.average_progress)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Notice Board / News Stream */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>
                <span className="flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5 text-[#FF8A36]" />
                  Notice Board
                </span>
              </GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <Bell className="w-3 h-3 text-[#FF8A36] mr-1" /> {noticeFeed.length} updates
              </Badge>
            </GlassCardHeader>
            <GlassCardContent className="p-0">
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {noticeFeed.length === 0 ? (
                  <div className="text-center py-8 px-5">
                    <Bell className="w-8 h-8 text-slate-500/50 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No notices yet</p>
                  </div>
                ) : (
                  noticeFeed.map((notice, i) => (
                    <button
                      key={notice.id}
                      onClick={() => setNoticeModal(notice)}
                      className={cn(
                        'w-full text-left p-3.5 flex items-start gap-3 transition-colors group',
                        i < noticeFeed.length - 1 && 'border-b border-white/[0.04]',
                        'hover:bg-white/[0.03]',
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        notice.title.toLowerCase().includes('enrollment') || notice.title.toLowerCase().includes('assignment')
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : notice.title.toLowerCase().includes('class')
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-amber-500/10 text-amber-400',
                      )}>
                        {notice.title.toLowerCase().includes('enrollment') ? <Users className="w-4 h-4" />
                          : notice.title.toLowerCase().includes('assignment') ? <ClipboardList className="w-4 h-4" />
                          : notice.title.toLowerCase().includes('class') ? <Video className="w-4 h-4" />
                          : <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate group-hover:text-[#10B981] transition-colors">{notice.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{notice.content.substring(0, 80)}...</p>
                        <p className="text-[9px] text-slate-500 mt-1">{notice.date}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500/50 group-hover:text-[#FF8A36] transition-colors shrink-0 mt-1" />
                    </button>
                  ))
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 6: LEADERBOARD — Top Instructors / Top Students            */}
      {/* ================================================================= */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>
              <span className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#FF8A36]" />
                Leaderboard
              </span>
            </GlassCardTitle>
            <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg p-0.5">
              <button
                onClick={() => setLeaderboardTab('students')}
                className={cn('px-3 py-1 rounded-md text-[10px] font-medium transition-all', leaderboardTab === 'students' ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white')}
              >
                Top Students
              </button>
              <button
                onClick={() => setLeaderboardTab('instructors')}
                className={cn('px-3 py-1 rounded-md text-[10px] font-medium transition-all', leaderboardTab === 'instructors' ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white')}
              >
                Top Instructors
              </button>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-1">
              {leaderboardTab === 'students' ? (
                leaderboard.students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-slate-500/50 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No student data available</p>
                  </div>
                ) : (
                  leaderboard.students.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'bg-white/5 text-slate-500',
                      )}>
                        {i + 1}
                      </div>
                      <ProfileAvatar src={s.avatar} name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate group-hover:text-[#10B981] transition-colors">{s.name}</p>
                        <p className="text-[9px] text-slate-400">{s.courses} courses</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] text-slate-400">Progress</span>
                            <span className="text-[9px] font-semibold text-white">{s.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FF8A36] to-[#10B981] transition-all duration-500"
                              style={{ width: `${Math.min(100, s.progress)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] text-slate-300">{s.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                leaderboard.instructors.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-slate-500/50 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No instructor data available</p>
                  </div>
                ) : (
                  leaderboard.instructors.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'bg-white/5 text-slate-500',
                      )}>
                        {i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B3B24] to-[#065F46] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate group-hover:text-[#10B981] transition-colors">{s.name}</p>
                        <p className="text-[9px] text-slate-400">{s.students} students</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] text-slate-400">Rating</span>
                            <span className="text-[9px] font-semibold text-white">{s.rating.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FF8A36] to-[#10B981] transition-all duration-500"
                              style={{ width: `${Math.min(100, (s.rating / 5) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-white/[0.1] text-slate-400">
                          <Award className="w-2.5 h-2.5 text-[#FF8A36] mr-0.5" />
                          {s.courses} courses
                        </Badge>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 7: REVENUE & PAYMENTS                                     */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Revenue & Transactions</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <CreditCard className="w-3 h-3 text-[#10B981] mr-1" /> {stats.pending_payments} pending
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(revenue.payment_statuses).map(([status, count]) => (
                  <div key={status} className={cn('p-2.5 rounded-lg text-center',
                    status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                    status === 'pending' ? 'bg-amber-500/10 border border-amber-500/20' :
                    status === 'failed' ? 'bg-red-500/10 border border-red-500/20' :
                    'bg-slate-500/10 border border-slate-500/20'
                  )}>
                    <div className={cn('text-lg font-bold',
                      status === 'completed' ? 'text-emerald-400' :
                      status === 'pending' ? 'text-amber-400' :
                      status === 'failed' ? 'text-red-400' : 'text-slate-400'
                    )}>{count as number}</div>
                    <div className="text-[9px] text-slate-400 capitalize mt-0.5">{status}</div>
                  </div>
                ))}
              </div>

              <h4 className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">Recent Transactions</h4>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                {revenue.recent_payments.slice(0, 6).map(pmt => (
                  <div key={pmt.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className={cn('w-2 h-2 rounded-full shrink-0',
                      pmt.status === 'completed' ? 'bg-emerald-400' :
                      pmt.status === 'pending' ? 'bg-amber-400' :
                      pmt.status === 'failed' ? 'bg-red-400' : 'bg-slate-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{pmt.course}</p>
                      <p className="text-[10px] text-slate-400">{pmt.user}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-white">{formatCurrencyValue(pmt.amount)}</p>
                      <p className={cn('text-[9px] capitalize',
                        pmt.status === 'completed' ? 'text-emerald-400' :
                        pmt.status === 'pending' ? 'text-amber-400' :
                        pmt.status === 'failed' ? 'text-red-400' : 'text-slate-400'
                      )}>{pmt.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Upcoming Classes + Deadlines */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Upcoming Classes</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <Video className="w-3 h-3 text-[#10B981] mr-1" /> {schedule.upcoming_classes.length}
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              {schedule.upcoming_classes.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-slate-500/50 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No upcoming classes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.upcoming_classes.slice(0, 5).map(cls => (
                    <div key={cls.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10B981]/20 to-emerald-600/20 border border-[#10B981]/20 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{cls.title}</p>
                        <p className="text-[10px] text-slate-400">{cls.instructor} · {cls.date}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{cls.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 8: QUICK ACTIONS                                          */}
      {/* ================================================================= */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Quick Actions</GlassCardTitle>
            <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
              <Zap className="w-3 h-3 text-[#FF8A36] mr-1" /> Create
            </Badge>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {quickActions.map(action => (
                <Link key={action.label} href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#10B981]/30 transition-all duration-200 group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-[10px] text-slate-400 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 9: RECOMMENDATIONS                                        */}
      {/* ================================================================= */}
      {recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Recommended for You</GlassCardTitle>
              <Badge variant="outline" className="border-white/[0.06] text-[10px] text-slate-400">
                <Sparkles className="w-3 h-3 text-[#10B981] mr-1" /> Personalized
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendations.map(course => (
                  <Link key={course.id} href={`/courses/${course.slug}`}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#10B981]/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium border',
                        course.level === 'beginner' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                        course.level === 'intermediate' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-rose-500/30 text-rose-400 bg-rose-500/10')}>
                        {course.level}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-slate-300">{course.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-white group-hover:text-[#10B981] transition-colors truncate">{course.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{course.category}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {course.reasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-[9px] text-[#10B981]/80 bg-[#10B981]/5 px-1.5 py-0.5 rounded-full">{reason}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

// Custom scrollbar styles for the page
const scrollStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
`
