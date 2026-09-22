'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Radio, Video, Clock, Users, Calendar, BarChart3, FileText,
  Download, Search, Play, Trash2, Edit3, Copy, Zap,
  Eye, Loader2, X, GraduationCap, UserCheck, CheckCircle,
  Award, TrendingUp, ChevronRight, BookOpen, ArrowRight,
  LayoutGrid, List, MapPin,
} from 'lucide-react'
import { liveClassesAPI, enrollmentAPI } from '@/lib/api'
import type { Class, LiveClassDashboard, ClassRecording2 } from '@/types'
import RecordingPlayerModal from '@/components/live-classes/RecordingPlayerModal'
import toast from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  live: 'bg-[#F0EAFF] text-[#572ECE] border-[#572ECE]/25',
  scheduled: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/25',
  completed: 'bg-[#F1F3F9] text-[#536078] border-[#E9E7F5]',
  cancelled: 'bg-red-50 text-[#E5484D] border-red-200',
}

const statusDot: Record<string, string> = {
  live: 'bg-[#572ECE] animate-pulse shadow-[0_0_6px_rgba(87,46,206,0.5)]',
  scheduled: 'bg-[#3478F6]',
  completed: 'bg-[#A5AEC2]',
  cancelled: 'bg-[#E5484D]',
}

const statRoutes: Record<string, string> = {
  'Total Classes': '/dashboard/classes',
  'Live Now': '/dashboard/classes/live',
  'Upcoming': '/dashboard/classes/upcoming',
  'Completed': '/dashboard/classes/completed',
  'Cancelled': '/dashboard/classes/cancelled',
  "Today's Classes": '/dashboard/classes/upcoming',
  'Avg Attendance': '/dashboard/classes/analytics',
  'Total Participants': '/dashboard/classes/analytics',
  'Recordings': '/dashboard/classes/recordings',
  'Total Hours': '/dashboard/classes/analytics',
}

function StatCard({ icon: Icon, label, value, suffix, color, onClick }: { icon: any; label: string; value: any; suffix?: string; color: string; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="p-3.5 rounded-xl bg-white border border-[#E9E7F5] shadow-sm hover:shadow-md hover:border-[#6D3DF5]/30 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center text-center"
    >
      <div className={`w-9 h-9 rounded-lg ${color.replace('text', 'bg')}/15 flex items-center justify-center mb-2.5`}>
        <Icon size={16} className={color} />
      </div>
      <div className="text-2xl font-bold text-[#0F1B3D] tracking-tight">{value}{suffix || ''}</div>
      <div className="text-[11px] text-[#8A93AE] mt-0.5">{label}</div>
    </motion.div>
  )
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex group/tip shrink-0">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md bg-[#0F1B3D] border border-white/10 text-[11px] text-white shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-20">
        {label}
      </span>
    </span>
  )
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const classColors = [
  { bg: 'bg-[#F3EEFF]', text: 'text-[#6D3DF5]', ring: 'ring-[#6D3DF5]/20' },
  { bg: 'bg-[#EEF4FF]', text: 'text-[#3478F6]', ring: 'ring-[#3478F6]/20' },
  { bg: 'bg-[#F0EAFF]', text: 'text-[#572ECE]', ring: 'ring-[#572ECE]/20' },
  { bg: 'bg-[#FEF5E7]', text: 'text-[#F59E0B]', ring: 'ring-[#F59E0B]/20' },
  { bg: 'bg-[#FEE8E8]', text: 'text-[#E5484D]', ring: 'ring-[#E5484D]/20' },
]

function getColor(idx: number) {
  return classColors[idx % classColors.length]
}

export default function LiveClassesDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dash, setDash] = useState<LiveClassDashboard | null>(null)
  const [myClassesList, setMyClassesList] = useState<Class[]>([])
  const [recordings, setRecordings] = useState<ClassRecording2[]>([])
  const [playingRec, setPlayingRec] = useState<ClassRecording2 | null>(null)
  const [search, setSearch] = useState('')
  const [now, setNow] = useState(Date.now())
  const [courseMap, setCourseMap] = useState<Record<number, string>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t) }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dashRes, myRes, recRes, enrolledRes] = await Promise.all([
        liveClassesAPI.getDashboard(),
        liveClassesAPI.myClasses({ per_page: 50 }).catch(() => ({ data: { data: [] } })),
        liveClassesAPI.getRecordings(),
        enrollmentAPI.myCourses().catch(() => ({ data: { data: [] } })),
      ])
      setDash(dashRes.data?.data ?? null)

      setRecordings((recRes.data?.data?.data ?? recRes.data?.data ?? []).slice(0, 5))

      const enrolled = enrolledRes.data?.data?.data ?? enrolledRes.data?.data ?? []
      const map: Record<number, string> = {}
      const enrolledIds = new Set<number>()
      if (Array.isArray(enrolled)) {
        enrolled.forEach((e: any) => {
          const cId = e.course_id ?? e.id
          const cTitle = e.title ?? e.course?.title ?? `Course #${cId}`
          if (cId) { map[cId] = cTitle; enrolledIds.add(cId) }
        })
      }
      setCourseMap(map)

      const my = myRes.data?.data?.data ?? myRes.data?.data ?? []
      setMyClassesList(Array.isArray(my) ? my.filter(c => !c.course_id || enrolledIds.has(c.course_id)) : [])
    } catch { /* defaults */ } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const parseDurationMin = (d: string | null | undefined): number => {
    if (!d) return 60
    const n = parseInt(d, 10)
    return isNaN(n) ? 60 : n
  }

  const liveCount = myClassesList.filter(c => {
    if (c.status === 'live') return true
    try {
      const s = new Date(`${c.date}T${c.time}`).getTime()
      const e = s + parseDurationMin(c.duration) * 60000
      return now >= s && now <= e
    } catch { return false }
  }).length

  const stats = [
    { icon: GraduationCap, label: 'Total Classes', value: dash?.total_classes ?? myClassesList.length, color: 'text-[#572ECE]' },
    { icon: Radio, label: 'Live Now', value: dash?.live_now ?? liveCount, color: 'text-[#E5484D]' },
    { icon: Clock, label: 'Upcoming', value: dash?.upcoming_classes ?? myClassesList.filter(c => c.status === 'scheduled').length, color: 'text-[#3478F6]' },
    { icon: CheckCircle, label: 'Completed', value: dash?.completed ?? myClassesList.filter(c => c.status === 'completed').length, color: 'text-[#572ECE]' },
    { icon: X, label: 'Cancelled', value: dash?.cancelled ?? 0, color: 'text-[#E5484D]' },
    { icon: Calendar, label: "Today's Classes", value: dash?.today_classes ?? 0, color: 'text-[#F97316]' },
    { icon: UserCheck, label: 'Avg Attendance', value: dash?.attendance_percentage ?? 0, suffix: '%', color: 'text-[#6D3DF5]' },
    { icon: Users, label: 'Total Participants', value: dash?.average_participants ?? 0, color: 'text-[#0891B2]' },
    { icon: Video, label: 'Recordings', value: dash?.recordings ?? recordings.length, color: 'text-[#DB2777]' },
    { icon: Clock, label: 'Total Hours', value: dash?.total_hours ?? 0, suffix: 'h', color: 'text-[#D97706]' },
  ]

  const getCourseName = (cls: Class): string => {
    if (cls.course_id && courseMap[cls.course_id]) return courseMap[cls.course_id]
    if ((cls as any).course_title) return (cls as any).course_title
    if ((cls as any).course?.title) return (cls as any).course.title
    if ((cls as any).module_name) return (cls as any).module_name
    return '—'
  }

  const handleDeleteRecording = async (rec: ClassRecording2) => {
    if (!window.confirm(`Delete recording "${rec.title}"?`)) return
    try {
      await liveClassesAPI.deleteRecording(rec.id)
      toast.success('Recording deleted')
      setRecordings(prev => prev.filter(r => r.id !== rec.id))
    } catch {
      toast.error('Failed to delete recording')
    }
  }

  const filtered = myClassesList.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [c.title, c.instructor?.name, c.category, c.course_id?.toString(), getCourseName(c)].some(f => f?.toLowerCase().includes(q))
  })

  const myLiveSessions = myClassesList.filter(c => c.status === 'live')

  const getTimeUntil = (cls: Class): string => {
    if (cls.status === 'live') return 'Live now'
    if (cls.status === 'completed') return 'Ended'
    if (cls.status === 'cancelled') return 'Cancelled'
    try {
      const start = new Date(`${cls.date}T${cls.time}`).getTime()
      const diff = start - Date.now()
      if (diff < 0) return 'Started'
      const mins = Math.floor(diff / 60000)
      if (mins < 60) return `In ${mins}m`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `In ${hrs}h ${mins % 60}m`
      const days = Math.floor(hrs / 24)
      return `In ${days}d`
    } catch { return cls.date || '' }
  }

  return (
    <>
      <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <a href="/dashboard/classes/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] hover:brightness-110 transition-all shadow-md shadow-[#6D3DF5]/25">
          <Plus size={14} /> Create Class
        </a>
        <a href="/dashboard/classes/create?instant=1" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#F59E0B] hover:brightness-110 transition-all shadow-md shadow-[#F97316]/25">
          <Zap size={14} /> Instant Meeting
        </a>
        <div className="inline-flex items-center gap-1 bg-white border border-[#E9E7F5] rounded-xl p-1 shadow-sm">
          <a href="/dashboard/classes/schedule" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#536078] hover:bg-[#F0EAFF] hover:text-[#572ECE] hover:shadow-sm transition-all">
            <Calendar size={13} className="text-[#572ECE]" /> Schedule
          </a>
          <a href="/dashboard/classes/calendar" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#536078] hover:bg-[#F0EAFF] hover:text-[#572ECE] hover:shadow-sm transition-all">
            <Calendar size={13} className="text-[#572ECE]" /> Calendar
          </a>
          <a href="/dashboard/classes/recordings" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#536078] hover:bg-[#F0EAFF] hover:text-[#572ECE] hover:shadow-sm transition-all">
            <Video size={13} className="text-[#572ECE]" /> Recordings
          </a>
          <div className="w-px h-4 bg-[#E9E7F5] mx-0.5" />
          <a href="/dashboard/classes/analytics" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#536078] hover:bg-[#FEF5E7] hover:text-[#F97316] hover:shadow-sm transition-all">
            <BarChart3 size={13} className="text-[#F97316]" /> Analytics
          </a>
          <a href="/dashboard/classes/reports" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#536078] hover:bg-[#FEF5E7] hover:text-[#F97316] hover:shadow-sm transition-all">
            <Download size={13} className="text-[#F97316]" /> Reports
          </a>
        </div>
      </div>

      {/* Stat cards — 5 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {stats.map(s => (
          <StatCard key={s.label} {...s} onClick={() => router.push(statRoutes[s.label] || '/dashboard/classes')} />
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A93AE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your enrolled classes..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-sm placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] focus:outline-none focus:border-[#6D3DF5]/60 focus:ring-2 focus:ring-[#6D3DF5]/15 transition-colors" />
        </div>
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 border border-[#E9E7F5]">
          <button onClick={() => setViewMode('grid')} className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#8A93AE] hover:text-[#0F1B3D]'}`}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => setViewMode('list')} className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'list' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#8A93AE] hover:text-[#0F1B3D]'}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* My Enrolled Classes */}
      <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#EEF1F8] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-2">
            <BookOpen size={14} className="text-[#6D3DF5]" />
            My Enrolled Classes ({filtered.length})
          </h2>
          <a href="/dashboard/classes/upcoming" className="flex items-center gap-1 text-[11px] font-medium text-[#6D3DF5] hover:text-[#3478F6] transition-colors">
            View All <ChevronRight size={12} />
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-[#6D3DF5]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#F3EEFF] flex items-center justify-center mb-3">
              <BookOpen size={20} className="text-[#6D3DF5]" />
            </div>
            <p className="text-sm font-medium text-[#0F1B3D]">{search ? 'No matching classes' : 'No enrolled classes yet'}</p>
            <p className="text-xs text-[#8A93AE] mt-1">{search ? 'Try a different search' : 'Enroll in a course to see classes here'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View — Card Layout */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((cls, i) => {
              const color = getColor(cls.id || i)
              const timeLabel = getTimeUntil(cls)
              const isLive = cls.status === 'live'
              return (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                  className={`group relative rounded-xl border border-[#E9E7F5] hover:border-[#6D3DF5]/30 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${isLive ? 'ring-1 ring-[#572ECE]/20' : ''}`}
                >
                  {/* Color strip top */}
                  <div className={`h-1 w-full ${isLive ? 'bg-[#572ECE]' : 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6]'}`} />

                  <div className="p-4">
                    {/* Header: Avatar + Title + Status */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${color.bg} ring-2 ${color.ring} flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-bold ${color.text}`}>{getInitials(cls.title)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#0F1B3D] truncate group-hover:text-[#6D3DF5] transition-colors leading-snug">
                          {cls.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge[cls.status || 'scheduled']}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[cls.status || 'scheduled']}`} />
                            {cls.status || 'scheduled'}
                          </span>
                          {timeLabel && timeLabel !== 'Live now' && cls.status !== 'completed' && cls.status !== 'cancelled' && (
                            <span className="text-[10px] text-[#8A93AE] font-medium">{timeLabel}</span>
                          )}
                          {isLive && (
                            <span className="text-[10px] text-[#572ECE] font-bold animate-pulse">{timeLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      {cls.instructor?.name && (
                        <div className="flex items-center gap-2 text-xs text-[#536078]">
                          <UserCheck size={12} className="text-[#8A93AE] shrink-0" />
                          <span className="truncate">{cls.instructor.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#536078]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#8A93AE] shrink-0" />
                          {cls.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#8A93AE] shrink-0" />
                          {cls.time}
                        </span>
                      </div>
                      {getCourseName(cls) !== '—' && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin size={12} className="text-[#8A93AE] shrink-0" />
                          <span className="text-[#572ECE] font-medium truncate">{getCourseName(cls)}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom row: Enrolled count + Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E9E7F5]/60">
                      <div className="flex items-center gap-1.5 text-xs text-[#8A93AE]">
                        <Users size={12} />
                        <span>{cls.enrolled_count || 0} enrolled</span>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {isLive && (
                          <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#572ECE] text-white text-[11px] font-semibold hover:bg-[#572ECE]/90 transition-colors">
                            <Play size={10} fill="currentColor" /> Join
                          </button>
                        )}
                        <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)} className="p-1.5 rounded-md hover:bg-[#F3EEFF] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors" title="View">
                          <Eye size={13} />
                        </button>
                        {cls.status === 'scheduled' && (
                          <button onClick={() => router.push(`/dashboard/classes/${cls.id}/edit`)} className="p-1.5 rounded-md hover:bg-[#EEF4FF] text-[#8A93AE] hover:text-[#3478F6] transition-colors" title="Edit">
                            <Edit3 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* List View — Table Layout */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EEF1F8] text-[#8A93AE]">
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider">Class</th>
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">Instructor</th>
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider hidden md:table-cell">Schedule</th>
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider hidden lg:table-cell">Course</th>
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">Enrolled</th>
                  <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cls, i) => {
                  const color = getColor(cls.id || i)
                  const isLive = cls.status === 'live'
                  return (
                    <tr key={cls.id} className="border-b border-[#F4F6FB] hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-xs font-bold ${color.text}`}>{getInitials(cls.title)}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors block truncate">{cls.title}</span>
                            <span className="text-[11px] text-[#8A93AE]">{cls.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#536078] text-sm hidden sm:table-cell">{cls.instructor?.name || '—'}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="text-sm text-[#536078]">{cls.date}</div>
                        <div className="text-[11px] text-[#8A93AE]">{getTimeUntil(cls)}</div>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-[#572ECE] text-sm font-medium">{getCourseName(cls)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge[cls.status || 'scheduled']}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[cls.status || 'scheduled']}`} />
                          {cls.status || 'scheduled'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#536078] text-sm hidden sm:table-cell">{cls.enrolled_count || 0}</td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {isLive && (
                            <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)} className="px-2.5 py-1 rounded-md bg-[#572ECE] text-white text-[11px] font-semibold hover:bg-[#572ECE]/90 transition-colors">
                              <Play size={11} className="inline mr-0.5" fill="currentColor" /> Join
                            </button>
                          )}
                          <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)} className="p-1.5 rounded-md hover:bg-[#F3EEFF] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          {cls.status === 'scheduled' && (
                            <button onClick={() => router.push(`/dashboard/classes/${cls.id}/edit`)} className="p-1.5 rounded-md hover:bg-[#EEF4FF] text-[#8A93AE] hover:text-[#3478F6] transition-colors" title="Edit">
                              <Edit3 size={14} />
                            </button>
                          )}
                          <button onClick={() => { liveClassesAPI.duplicateClass(cls.id).then(() => { toast.success('Duplicated'); fetchData() }).catch(() => toast.error('Failed')) }} className="p-1.5 rounded-md hover:bg-[#F3EEFF] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors" title="Duplicate">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this class?')) liveClassesAPI.delete(cls.id).then(() => { toast.success('Deleted'); fetchData() }).catch(() => toast.error('Failed')) }} className="p-1.5 rounded-md hover:bg-red-50 text-[#8A93AE] hover:text-[#E5484D] transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Now + Recent Recordings panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Live Now */}
        <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#572ECE] animate-pulse shadow-sm shadow-[#572ECE]/50" />
              Live Now
            </h2>
            <a href="/dashboard/classes/live" className="text-[11px] font-medium text-[#6D3DF5] hover:text-[#3478F6] transition-colors">View All</a>
          </div>
          {myLiveSessions.length === 0 ? (
            <p className="text-sm text-[#8A93AE] py-6 text-center">No live sessions right now</p>
          ) : myLiveSessions.slice(0, 3).map(cls => (
            <div key={cls.id} onClick={() => router.push(`/dashboard/classes/${cls.id}`)} className="flex items-center justify-between py-2.5 border-b border-[#F4F6FB] last:border-0 cursor-pointer hover:bg-[#F8FAFC] rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F0EAFF] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#572ECE]">{getInitials(cls.title)}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0F1B3D]">{cls.title}</div>
                  <div className="text-xs text-[#8A93AE] mt-0.5">{cls.instructor?.name} &middot; {cls.enrolled_count || 0} students</div>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); router.push(`/dashboard/classes/${cls.id}`) }} className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[11px] font-semibold hover:brightness-110 transition-all shadow-sm">
                Join
              </button>
            </div>
          ))}
        </div>

        {/* Recent Recordings */}
        <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-2.5">
              <Video size={15} className="text-[#EC4899]" />
              Recent Recordings
            </h2>
            <a href="/dashboard/classes/recordings" className="text-[11px] font-medium text-[#6D3DF5] hover:text-[#3478F6] transition-colors">View All</a>
          </div>
          {recordings.length === 0 ? (
            <p className="text-sm text-[#8A93AE] py-6 text-center">No recordings available</p>
          ) : recordings.slice(0, 3).map(rec => (
            <div key={rec.id} onClick={() => router.push(`/dashboard/classes/${rec.class_id}`)} className="flex items-center justify-between py-2.5 border-b border-[#F4F6FB] last:border-0 cursor-pointer hover:bg-[#F8FAFC] rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={e => { e.stopPropagation(); setPlayingRec(rec) }} className="w-9 h-9 rounded-lg bg-[#FDEEF7] flex items-center justify-center shrink-0 hover:bg-[#F9D9EF] transition-colors">
                  <Play size={12} className="text-[#EC4899] ml-0.5" fill="currentColor" />
                </button>
                <div className="min-w-0">
                  <button onClick={e => { e.stopPropagation(); router.push(`/dashboard/classes/${rec.class_id}`) }} className="text-sm font-medium text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors truncate block w-full text-left">{rec.title}</button>
                  <div className="text-xs text-[#8A93AE]">{Math.round((rec.duration_seconds || 0) / 60)}min &middot; {rec.size_mb}MB</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Tip label="View class recordings">
                  <button onClick={e => { e.stopPropagation(); router.push(`/dashboard/classes/recordings?class_id=${rec.class_id}`) }}
                    className="p-1.5 rounded-lg hover:bg-[#F3EEFF] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors">
                    <Eye size={13} />
                  </button>
                </Tip>
                <Tip label="Delete recording">
                  <button onClick={e => { e.stopPropagation(); handleDeleteRecording(rec) }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#8A93AE] hover:text-[#E5484D] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </Tip>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <RecordingPlayerModal rec={playingRec} onClose={() => setPlayingRec(null)} />
    </>
  )
}
