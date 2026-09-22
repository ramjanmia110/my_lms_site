'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, Clock, Users, Copy, Trash2, Loader2, Bell, Search, CalendarDays, Video, Globe, ArrowRight, AlarmClock, X } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'
import toast from 'react-hot-toast'
import { ProfileAvatar } from '@/components/ui/profile-avatar'

const LEVEL_META: Record<string, { label: string; cls: string }> = {
  beginner: { label: 'Beginner', cls: 'bg-[#F0EAFF] text-[#572ECE] border-[#572ECE]/25' },
  intermediate: { label: 'Intermediate', cls: 'bg-[#FFF8ED] text-[#D97706] border-[#D97706]/25' },
  advanced: { label: 'Advanced', cls: 'bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/25' },
}

const GRADS = [
  'from-[#F0EAFF] via-[#F0EAFF]/40 to-transparent',
  'from-[#EEF4FF] via-[#EEF4FF]/40 to-transparent',
  'from-[#FFF8ED] via-[#FFF8ED]/40 to-transparent',
  'from-[#F3EEFF] via-[#F3EEFF]/40 to-transparent',
  'from-[#FFF1F2] via-[#FFF1F2]/40 to-transparent',
]

const PLATFORM_META: Record<string, { label: string; cls: string }> = {
  zoom: { label: 'Zoom', cls: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/25' },
  google_meet: { label: 'Google Meet', cls: 'bg-[#F0EAFF] text-[#572ECE] border-[#572ECE]/25' },
  custom: { label: 'Custom Link', cls: 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/25' },
}

const clamp2 = 'line-clamp-2 min-w-0'

export default function UpcomingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [search, setSearch] = useState('')
  const [joining, setJoining] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await liveClassesAPI.getUpcoming({ per_page: 100 })
      const d = res.data?.data?.data ?? res.data?.data ?? []
      setClasses(Array.isArray(d) ? d : [])
    } catch { setClasses([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const filtered = classes.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (c.title || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.instructor?.name || '').toLowerCase().includes(q) ||
      (c.course?.title || '').toLowerCase().includes(q)
  })

  const sortedByDate = [...classes].sort((a, b) =>
    new Date(`${a.date}T${a.time || '00:00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00:00'}`).getTime())
  const nextClass = sortedByDate[0] || null

  const countdownLabel = (c: Class): string => {
    const target = new Date(`${c.date}T${c.time || '00:00:00'}`).getTime()
    const ms = Math.max(0, target - now)
    const d = Math.floor(ms / 86400000)
    const h = Math.floor((ms % 86400000) / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  const totalSeats = classes.reduce((sum, c) => sum + Math.max(0, (c.max_students || 50) - (c.enrolled_count || 0)), 0)

  const platformCounts: Record<string, number> = {}
  classes.forEach(c => {
    const k = c.platform || 'custom'
    platformCounts[k] = (platformCounts[k] || 0) + 1
  })
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]
  const nextPlatform = topPlatform ? PLATFORM_META[topPlatform[0]]?.label ?? null : null

  const handleJoin = async (id: number) => {
    setJoining(id)
    try {
      await liveClassesAPI.join(id)
      toast.success('You joined the class!')
      router.push(`/dashboard/classes/${id}`)
    } catch {
      toast.error('Failed to join')
    } finally { setJoining(null) }
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return {
      day: date.getDate(),
      month: date.toLocaleString('en', { month: 'short' }),
      weekday: date.toLocaleString('en', { weekday: 'short' }),
    }
  }

  const formatTime = (t: string): string => {
    const parts = (t || '10:00:00').split(':')
    const hh = parseInt(parts[0], 10)
    const mm = parts[1] || '00'
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const hr = ((hh + 11) % 12) + 1
    return `${hr}:${mm} ${ampm}`
  }

  const durationLabel = (d?: string | null): string => {
    if (!d) return '60 min'
    const h = d.match(/^(\d+(?:\.\d+)?)\s*h/i)
    if (h) return `${h[1]}h`
    const n = parseInt(d, 10)
    if (!isNaN(n)) return `${n} min`
    return d
  }

  const seatsLeft = (c: Class) => Math.max(0, (c.max_students || 50) - (c.enrolled_count || 0))

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bg-white border border-[#E9E7F5] shadow-sm rounded-2xl p-5">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: label + title + subtitle + feature chips */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6D3DF5]/80">
              <CalendarDays size={12} /> Live Classes
            </div>
            <h1 className="mt-1 text-xl font-bold text-[#0F1B3D] tracking-tight flex items-center gap-2.5 flex-wrap">
              Upcoming Classes
              <span className="inline-flex items-center justify-center min-w-9 h-9 px-1.5 rounded-xl bg-[#F0EAFF] text-[#572ECE] text-sm font-bold tabular-nums border border-[#572ECE]/25">{filtered.length}</span>
            </h1>
            <p className="mt-1 text-xs text-[#536078]">Upcoming live sessions — reserve your spot and get notified before it starts.</p>

            {/* Feature chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {nextClass && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#536078]">
                  <AlarmClock size={11} className="text-[#6D3DF5]" />
                  Next session in <span className="font-bold text-[#6D3DF5] tabular-nums">{countdownLabel(nextClass)}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#536078]">
                <Users size={11} className="text-[#6D3DF5]" />
                {totalSeats} seats open
              </span>
              {nextPlatform && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E9E7F5] text-[10px] text-[#536078]">
                  <Globe size={11} className="text-[#6D3DF5]" />
                  {nextPlatform} sessions
                </span>
              )}
            </div>
          </div>

          {/* Right: search - fixed width + height, vertically aligned */}
          <div className="relative w-full sm:w-72 lg:w-80 shrink-0 lg:self-center">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5AEC2]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, category, instructor..."
              className="w-full h-10 pl-10 pr-8 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-2 focus:ring-[#6D3DF5]/10 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A5AEC2] hover:text-[#0F1B3D] transition-colors" title="Clear search">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={22} className="animate-spin text-[#8A93AE]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#F8FAFC] border border-[#E9E7F5]">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E9E7F5] flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-[#8A93AE]" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F1B3D] mb-1">{search ? 'No matching classes' : 'No upcoming classes'}</h3>
          <p className="text-xs text-[#8A93AE]">{search ? 'Try a different search term.' : 'New live sessions will appear here once scheduled.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filtered.map((cls, i) => {
            const d = formatDate(cls.date)
            const pct = Math.min(100, Math.round(((cls.enrolled_count || 0) / (cls.max_students || 50)) * 100))
            const level = cls.level ? LEVEL_META[cls.level] : null
            const platform = cls.platform ? PLATFORM_META[cls.platform] : null
            return (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                className="flex flex-col min-w-0 rounded-2xl bg-white border border-[#E9E7F5] shadow-sm hover:border-[#6D3DF5]/30 hover:shadow-[0_14px_40px_-14px_rgba(109,61,245,0.12)] transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Card header */}
                <div className={`relative w-full px-4 pt-3.5 pb-3 bg-gradient-to-br ${GRADS[i % GRADS.length]}`}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E7F5] flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#6D3DF5] leading-none">{d.day}</span>
                        <span className="text-[8px] uppercase tracking-widest text-[#8A93AE] mt-0.5">{d.month}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-[#536078] font-semibold uppercase tracking-wide truncate">{d.weekday}</div>
                        <div className="text-[9px] text-[#8A93AE] truncate">{cls.category || 'Live Class'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F0EAFF] text-[#572ECE] text-[8px] font-semibold border border-[#572ECE]/25 whitespace-nowrap">
                        <span className="w-1 h-1 rounded-full bg-[#572ECE] animate-pulse" /> Scheduled
                      </span>
                      <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { liveClassesAPI.duplicateClass(cls.id).then(() => toast.success('Class duplicated')).catch(() => toast.error('Failed')) }}
                          className="p-1 rounded-md bg-white border border-[#E9E7F5] text-[#8A93AE] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 transition-colors" title="Duplicate class">
                          <Copy size={11} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this class?')) liveClassesAPI.delete(cls.id).then(() => { toast.success('Class deleted'); fetchData() }).catch(() => toast.error('Failed')) }}
                          className="p-1 rounded-md bg-white border border-[#E9E7F5] text-[#8A93AE] hover:text-[#E11D48] hover:border-[#E11D48]/30 transition-colors" title="Delete class">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex-1 w-full min-w-0 px-4 pt-3 pb-4 flex flex-col">
                  <h3 className={`text-[13px] font-bold text-[#0F1B3D] leading-snug group-hover:text-[#6D3DF5] transition-colors ${clamp2} break-words`}>{cls.title}</h3>
                  <p className={`mt-1 text-[11px] text-[#536078] leading-relaxed ${clamp2} break-words`}>
                    {cls.description || 'Join this live session and learn directly from the instructor in real time.'}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mt-3 min-w-0">
                    <ProfileAvatar src={cls.instructor?.avatar} name={cls.instructor?.name || 'Instructor'} size="xs" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-[#0F1B3D] truncate">{cls.instructor?.name || 'Course Instructor'}</div>
                      <div className="text-[9px] text-[#8A93AE]">Instructor</div>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-2.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E9E7F5] text-[9px] text-[#536078] whitespace-nowrap">
                      <Clock size={9} className="text-[#6D3DF5]" />{formatTime(cls.time)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E9E7F5] text-[9px] text-[#536078] whitespace-nowrap">
                      <Video size={9} className="text-[#6D3DF5]" />{durationLabel(cls.duration)}
                    </span>
                    {platform && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium border whitespace-nowrap ${platform.cls}`}>
                        <Globe size={9} />{platform.label}
                      </span>
                    )}
                    {level && (
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-medium border whitespace-nowrap ${level.cls}`}>{level.label}</span>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="mt-auto pt-3 w-full min-w-0">
                    <div className="flex items-center justify-between gap-2 text-[9px] text-[#8A93AE] mb-1">
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <Users size={9} className="shrink-0" />{cls.enrolled_count || 0} enrolled · {seatsLeft(cls)} seats left
                      </span>
                      <span className="text-[#572ECE] font-semibold shrink-0">{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#E9E7F5] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#572ECE] to-[#572ECE]/70" />
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="px-4 pb-3.5 w-full min-w-0">
                  <div className="flex gap-1.5 border-t border-[#E9E7F5] pt-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleJoin(cls.id)} disabled={joining === cls.id}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 h-8 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[11px] font-bold shadow-[0_6px_16px_-6px_rgba(109,61,245,0.4)] hover:from-[#6D3DF5]/90 hover:to-[#3478F6]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {joining === cls.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      <span className="truncate">Join Session</span>
                    </button>
                    <button onClick={() => { liveClassesAPI.remind(cls.id).then(() => toast.success('Reminder set')).catch(() => toast.error('Failed')) }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFC] border border-[#E9E7F5] text-[#8A93AE] hover:text-[#F59E0B] hover:border-[#F59E0B]/30 transition-colors" title="Set reminder">
                      <Bell size={12} />
                    </button>
                    <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFC] border border-[#E9E7F5] text-[#8A93AE] hover:text-[#0F1B3D] hover:border-[#E9E7F5] transition-colors" title="View details">
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
