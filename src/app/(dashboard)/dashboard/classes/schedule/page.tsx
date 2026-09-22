'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, ArrowRight, Video, User, Zap, Target, TrendingUp, BarChart3, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string; border: string; bar: string }> = {
  live:      { dot: 'bg-[#6D3DF5]', bg: 'bg-[#F3EEFF]', text: 'text-[#6D3DF5]', border: 'border-[#6D3DF5]', bar: 'bg-[#6D3DF5]' },
  scheduled: { dot: 'bg-[#3478F6]', bg: 'bg-[#EBF3FF]', text: 'text-[#3478F6]', border: 'border-[#3478F6]', bar: 'bg-[#3478F6]' },
  completed: { dot: 'bg-[#8A93AE]', bg: 'bg-[#F1F3F7]', text: 'text-[#8A93AE]', border: 'border-[#8A93AE]', bar: 'bg-[#8A93AE]' },
  cancelled: { dot: 'bg-[#E5484D]', bg: 'bg-[#FFF0F0]', text: 'text-[#E5484D]', border: 'border-[#E5484D]', bar: 'bg-[#E5484D]' },
}

const HOUR_HEIGHT = 64
const START_HOUR = 6
const END_HOUR = 22
const ALL_HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number)
  return { hours: h, minutes: m }
}

function getDurationMinutes(cls: Class): number {
  if (cls.duration) {
    const match = cls.duration.match(/(\d+)/)
    if (match) return parseInt(match[1])
  }
  return 60
}

function getEventPosition(timeStr: string, durationMinutes: number) {
  const { hours, minutes } = parseTime(timeStr)
  const startOffset = (hours - START_HOUR) + minutes / 60
  const duration = durationMinutes / 60
  return {
    top: Math.max(0, startOffset * HOUR_HEIGHT),
    height: Math.max(28, duration * HOUR_HEIGHT - 2),
  }
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now'
  const totalMins = Math.floor(ms / 60000)
  const hrs = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  const secs = Math.floor((ms % 60000) / 1000)
  if (hrs > 24) return `${Math.floor(hrs / 24)}d ${(hrs % 24)}h`
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
}

export default function SchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tick, setTick] = useState(0)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const timeGridRef = useRef<HTMLDivElement>(null)
  const didScroll = useRef(false)

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  useEffect(() => {
    const t = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setLoading(true)
    const from = formatDateKey(weekDays[0])
    const to = formatDateKey(weekDays[6])
    Promise.all([
      liveClassesAPI.getToday().catch(() => ({ data: { data: [] } })),
      liveClassesAPI.getUpcoming({ from, to, per_page: 100 }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([todayRes, upRes]) => {
        const today = todayRes.data?.data?.data ?? todayRes.data?.data ?? []
        const up = upRes.data?.data?.data ?? upRes.data?.data ?? []
        const seen = new Set(today.map((c: Class) => c.id))
        const all = [...today, ...up.filter((c: Class) => !seen.has(c.id))]
        all.sort((a: any, b: any) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
        setClasses(all)
      })
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [weekStart])

  const classesByDate = useMemo(() => {
    const map: Record<string, Class[]> = {}
    weekDays.forEach(d => { map[formatDateKey(d)] = [] })
    classes.forEach(cls => { if (map[cls.date]) map[cls.date].push(cls) })
    Object.keys(map).forEach(k => { map[k].sort((a, b) => a.time.localeCompare(b.time)) })
    return map
  }, [classes, weekDays])

  const selectedDateKey = formatDateKey(selectedDate)
  const selectedClasses = classesByDate[selectedDateKey] || []
  const today = new Date()

  useEffect(() => {
    if (!loading && !didScroll.current && timeGridRef.current) {
      const now = new Date()
      const currentHour = now.getHours()
      if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
        timeGridRef.current.scrollTop = Math.max(0, (currentHour - START_HOUR) * HOUR_HEIGHT - 60)
      }
      didScroll.current = true
    }
  }, [loading])

  const goToPrevWeek = useCallback(() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); didScroll.current = false }, [weekStart])
  const goToNextWeek = useCallback(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); didScroll.current = false }, [weekStart])
  const goToToday = useCallback(() => { setWeekStart(getWeekStart(new Date())); setSelectedDate(new Date()); didScroll.current = false }, [])

  const isCurrentWeek = isSameDay(weekStart, getWeekStart(new Date()))
  const isToday = (d: Date) => isSameDay(d, today)
  const isSelected = (d: Date) => isSameDay(d, selectedDate)

  const weekLabel = useMemo(() => {
    const s = weekDays[0], e = weekDays[6]
    if (s.getMonth() === e.getMonth()) return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
    return `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  }, [weekDays])

  const nowLineHour = today.getHours() + today.getMinutes() / 60
  const showNowLine = nowLineHour >= START_HOUR && nowLineHour <= END_HOUR && isCurrentWeek
  const nowLineTop = (nowLineHour - START_HOUR) * HOUR_HEIGHT

  const nextClass = useMemo(() => {
    const now = Date.now()
    return classes.find(c => {
      if (c.status === 'completed' || c.status === 'cancelled') return false
      return new Date(c.date + 'T' + c.time).getTime() > now
    })
  }, [classes])

  const countdownMs = useMemo(() => {
    if (!nextClass) return 0
    return Math.max(0, new Date(nextClass.date + 'T' + nextClass.time).getTime() - Date.now())
  }, [nextClass, tick])

  const weekStats = useMemo(() => {
    let totalClasses = 0, totalMinutes = 0
    const hourHeat: Record<number, number> = {}
    const dayCounts: Record<string, number> = {}
    const statusCounts: Record<string, number> = {}
    Object.entries(classesByDate).forEach(([key, dayClasses]) => {
      totalClasses += dayClasses.length
      dayCounts[key] = dayClasses.length
      dayClasses.forEach(cls => {
        totalMinutes += getDurationMinutes(cls)
        const { hours } = parseTime(cls.time)
        hourHeat[hours] = (hourHeat[hours] || 0) + 1
        const st = cls.status || 'scheduled'
        statusCounts[st] = (statusCounts[st] || 0) + 1
      })
    })
    const busiestHour = Object.entries(hourHeat).sort((a, b) => b[1] - a[1])[0]
    return {
      totalClasses,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      utilization: Math.min(100, Math.round((totalMinutes / (7 * 12 * 60)) * 100)),
      busiestHourLabel: busiestHour ? formatHourLabel(Number(busiestHour[0])) : null,
      statusCounts,
      totalEnrolled: classes.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
    }
  }, [classesByDate, classes])

  const hourHeatmap = useMemo(() => {
    const heat: Record<number, number> = {}
    ALL_HOURS.forEach(h => { heat[h] = 0 })
    classes.forEach(cls => {
      const { hours } = parseTime(cls.time)
      if (heat[hours] !== undefined) heat[hours]++
    })
    const max = Math.max(...Object.values(heat), 1)
    return ALL_HOURS.map(h => ({ hour: h, count: heat[h], intensity: heat[h] / max }))
  }, [classes])

  const dayProgressData = useMemo(() => {
    const now = new Date()
    return weekDays.map((d, i) => {
      const key = formatDateKey(d)
      return { day: DAY_NAMES[i], count: (classesByDate[key] || []).length, isPast: d < now && !isToday(d), isCurrent: isToday(d) }
    })
  }, [weekDays, classesByDate, tick])

  const maxDayCount = Math.max(...dayProgressData.map(d => d.count), 1)

  const scrollToHour = useCallback((hour: number) => {
    timeGridRef.current?.scrollTo({ top: Math.max(0, (hour - START_HOUR) * HOUR_HEIGHT), behavior: 'smooth' })
  }, [])

  const scrollToNow = useCallback(() => {
    const now = new Date()
    timeGridRef.current?.scrollTo({ top: Math.max(0, (now.getHours() - START_HOUR) * HOUR_HEIGHT - 60), behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F6FF]">
      <div className="max-w-[1440px] mx-auto p-3 md:p-4">
        {/* Top Bar */}
        <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm mb-3 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <button onClick={goToPrevWeek} className="p-1 rounded hover:bg-[#F3EEFF] transition-colors"><ChevronLeft size={15} className="text-[#6D3DF5]" /></button>
                <button onClick={goToNextWeek} className="p-1 rounded hover:bg-[#F3EEFF] transition-colors"><ChevronRight size={15} className="text-[#6D3DF5]" /></button>
              </div>
              <h2 className="text-[13px] font-bold text-[#0F1B3D] tracking-tight whitespace-nowrap">{weekLabel}</h2>
              {!isCurrentWeek && (
                <button onClick={goToToday} className="px-2.5 py-1 text-[10px] font-bold text-[#6D3DF5] hover:bg-[#F3EEFF] rounded-md transition-colors">Today</button>
              )}
              <button onClick={scrollToNow} className="p-1 rounded hover:bg-[#F3EEFF] transition-colors" title="Jump to now">
                <Circle size={13} className={`text-[#E5484D] ${isCurrentWeek ? 'fill-[#E5484D]' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {nextClass && isCurrentWeek && countdownMs > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#F3EEFF] to-[#EEF4FF] border border-[#6D3DF5]/15">
                  <Zap size={10} className="text-[#F59E0B]" />
                  <span className="text-[9px] font-bold text-[#6D3DF5] tabular-nums">{formatCountdown(countdownMs)}</span>
                </div>
              )}
              <a href="/dashboard/classes/create" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[10px] font-bold hover:brightness-110 transition-all shadow-sm whitespace-nowrap">
                <Calendar size={11} /> New
              </a>
            </div>
          </div>

          {/* Day Selector */}
          <div className="border-t border-[#E9E7F5]/60 px-3 py-2">
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const dayKey = formatDateKey(day)
                const dayClasses = classesByDate[dayKey] || []
                const tf = isToday(day)
                const sf = isSelected(day)
                const liveToday = dayClasses.some(c => c.status === 'live')
                return (
                  <button key={dayKey} onClick={() => setSelectedDate(day)}
                    className={`relative flex flex-col items-center py-1.5 px-1 rounded-lg transition-all ${sf ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/20' : tf ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'hover:bg-[#F8F6FF] text-[#0F1B3D]'}`}
                  >
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${sf ? 'text-white/70' : 'text-[#8A93AE]'}`}>{DAY_NAMES[i]}</span>
                    <span className={`text-sm font-bold ${sf ? 'text-white' : tf ? 'text-[#6D3DF5]' : 'text-[#0F1B3D]'}`}>{day.getDate()}</span>
                    <div className="flex items-center gap-[2px] mt-0.5 h-[4px]">
                      {dayClasses.length > 0 && dayClasses.slice(0, 3).map(cls => (
                        <span key={cls.id} className={`w-[3px] h-[3px] rounded-full ${sf ? 'bg-white/70' : STATUS_COLORS[cls.status || 'scheduled']?.dot || 'bg-[#8A93AE]'}`} />
                      ))}
                      {dayClasses.length > 3 && <span className={`text-[5px] font-bold ${sf ? 'text-white/70' : 'text-[#8A93AE]'}`}>+</span>}
                    </div>
                    {liveToday && !sf && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-pulse border border-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="border-t border-[#E9E7F5]/60 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1"><BarChart3 size={10} className="text-[#6D3DF5]" /><span className="text-[9px] font-bold text-[#536078]"><span className="text-[#0F1B3D]">{weekStats.totalClasses}</span> cls</span></div>
                <div className="flex items-center gap-1"><Clock size={10} className="text-[#3478F6]" /><span className="text-[9px] font-bold text-[#536078]"><span className="text-[#0F1B3D]">{weekStats.totalHours}h</span></span></div>
                {weekStats.busiestHourLabel && <div className="flex items-center gap-1"><TrendingUp size={10} className="text-[#F59E0B]" /><span className="text-[9px] font-bold text-[#536078]">Peak: <span className="text-[#0F1B3D]">{weekStats.busiestHourLabel}</span></span></div>}
                {weekStats.totalEnrolled > 0 && <div className="flex items-center gap-1"><Users size={10} className="text-[#0891B2]" /><span className="text-[9px] font-bold text-[#536078]"><span className="text-[#0F1B3D]">{weekStats.totalEnrolled}</span> enr</span></div>}
              </div>
              <button onClick={() => setStatsExpanded(!statsExpanded)} className="p-1 rounded hover:bg-[#F3EEFF] transition-colors">
                {statsExpanded ? <ChevronUp size={12} className="text-[#8A93AE]" /> : <ChevronDown size={12} className="text-[#8A93AE]" />}
              </button>
            </div>
            <AnimatePresence>
              {statsExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="mt-2 space-y-1">
                    {dayProgressData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold w-6 ${d.isCurrent ? 'text-[#6D3DF5]' : d.isPast ? 'text-[#8A93AE]' : 'text-[#536078]'}`}>{d.day}</span>
                        <div className="flex-1 h-[6px] rounded-full bg-[#F3F5FB] overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${d.isCurrent ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6]' : d.isPast ? 'bg-[#8A93AE]/40' : 'bg-[#6D3DF5]/60'}`} style={{ width: `${(d.count / maxDayCount) * 100}%` }} />
                        </div>
                        <span className="text-[8px] font-bold text-[#8A93AE] w-4 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E9E7F5]/40">
                    {Object.entries(weekStats.statusCounts).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className={`w-[5px] h-[5px] rounded-full ${STATUS_COLORS[key]?.dot || 'bg-[#8A93AE]'}`} />
                        <span className="text-[8px] font-bold text-[#536078]">{count} {key}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Heatmap */}
          <div className="border-t border-[#E9E7F5]/60 px-4 py-2">
            <div className="flex items-end gap-[2px] h-4">
              {hourHeatmap.map(({ hour, intensity, count }) => (
                <div key={hour} className="flex-1 rounded-sm cursor-pointer hover:opacity-80 transition-all" onClick={() => scrollToHour(hour)}
                  style={{ height: `${Math.max(2, intensity * 14)}px`, backgroundColor: count > 0 ? `rgba(109,61,245,${0.2 + intensity * 0.7})` : '#F3F5FB' }}
                  title={`${formatHourLabel(hour)}: ${count} classes`} />
              ))}
            </div>
            <div className="flex items-center gap-[2px] mt-0.5">
              {ALL_HOURS.map(h => (
                <div key={h} className="flex-1 text-center"><span className="text-[6px] font-bold text-[#8A93AE]">{h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-3">
          {/* Time Grid — 6AM to 10PM, fully scrollable */}
          <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-[3px] border-[#E9E7F5] border-t-[#6D3DF5] animate-spin" />
                  <span className="text-[10px] font-bold text-[#6D3DF5]">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-280px)]" ref={timeGridRef}>
                <div className="relative min-w-[560px]">
                  {/* Sticky day headers */}
                  <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-[#E9E7F5]/50 sticky top-0 bg-white z-10">
                    <div className="py-1.5" />
                    {weekDays.map((day) => {
                      const sel = isSelected(day)
                      const td = isToday(day)
                      return (
                        <div key={formatDateKey(day)} className={`py-1.5 px-1 text-center border-l border-[#E9E7F5]/30 ${sel ? 'bg-[#6D3DF5]/[0.03]' : ''}`}>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${td ? 'text-[#6D3DF5]' : 'text-[#8A93AE]'}`}>{DAY_NAMES[day.getDay()]}</span>
                          <span className={`block text-[10px] font-bold ${td ? 'text-[#6D3DF5]' : sel ? 'text-[#0F1B3D]' : 'text-[#536078]'}`}>{day.getDate()}</span>
                          {td && <div className="w-1 h-1 rounded-full bg-[#6D3DF5] mx-auto mt-0.5" />}
                        </div>
                      )
                    })}
                  </div>

                  {/* Grid body — ALL hours 6AM to 10PM */}
                  <div className="grid grid-cols-[48px_repeat(7,1fr)] relative">
                    {ALL_HOURS.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="px-1 flex items-start justify-end border-t border-[#E9E7F5]/20" style={{ height: `${HOUR_HEIGHT}px` }}>
                          <span className="text-[8px] font-bold text-[#8A93AE] -mt-2 bg-white px-0.5">{formatHourLabel(hour)}</span>
                        </div>
                        {weekDays.map((day) => (
                          <div key={`${hour}-${formatDateKey(day)}`}
                            className={`border-t border-l border-[#E9E7F5]/20 ${isSelected(day) ? 'bg-[#6D3DF5]/[0.012]' : ''}`}
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          />
                        ))}
                      </div>
                    ))}

                    {/* Now line */}
                    {showNowLine && (
                      <div className="absolute left-[48px] right-0 z-20 pointer-events-none" style={{ top: `${nowLineTop}px` }}>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#E5484D] -ml-1 shrink-0 shadow-sm shadow-[#E5484D]/30" />
                          <div className="h-[2px] flex-1 bg-[#E5484D]/50" />
                        </div>
                      </div>
                    )}

                    {/* Event blocks */}
                    <div className="absolute left-[48px] right-0 top-0 bottom-0 pointer-events-none">
                      {weekDays.map((day, dayIdx) => {
                        const dayKey = formatDateKey(day)
                        const dayClassesList = classesByDate[dayKey] || []
                        const colWidth = `calc(100% / 7)`
                        const colLeft = `calc(${dayIdx} * ${colWidth})`
                        return dayClassesList.map((cls) => {
                          const status = cls.status || 'scheduled'
                          const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled
                          const pos = getEventPosition(cls.time, getDurationMinutes(cls))
                          const enrolled = cls.enrolled_count || cls.students_count || 0
                          return (
                            <motion.div key={cls.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                              style={{ position: 'absolute', left: `calc(${colLeft} + 2px)`, width: `calc(${colWidth} - 4px)`, top: `${pos.top}px`, height: `${pos.height}px` }}
                              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                              className={`pointer-events-auto cursor-pointer rounded-md border-l-[3px] ${colors.border} ${colors.bg} px-1.5 py-1 overflow-hidden hover:shadow-md transition-shadow group`}
                            >
                              <div className="flex items-center gap-0.5 min-w-0">
                                <Clock size={7} className={colors.text} />
                                <span className={`text-[8px] font-bold ${colors.text} truncate`}>{cls.time?.slice(0, 5)}</span>
                                {cls.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-[#6D3DF5] animate-pulse" />}
                              </div>
                              <div className="text-[9px] font-bold text-[#0F1B3D] truncate leading-tight">{cls.title}</div>
                              {pos.height > 36 && <div className="flex items-center gap-0.5"><Users size={7} className="text-[#8A93AE]" /><span className="text-[7px] font-bold text-[#8A93AE]">{enrolled}</span></div>}
                              {pos.height > 52 && cls.instructor?.name && <div className="text-[7px] font-semibold text-[#536078] truncate">{cls.instructor.name}</div>}
                            </motion.div>
                          )
                        })
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-2.5">
            {nextClass && isCurrentWeek && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#572ECE] text-white p-3 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/5 -mr-4 -mt-4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1.5"><Zap size={10} className="text-[#F59E0B]" /><span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">Up Next</span></div>
                  <div className="text-[12px] font-bold leading-snug">{nextClass.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold text-white/70">
                    <span className="flex items-center gap-0.5"><Clock size={8} />{nextClass.time?.slice(0, 5)}</span>
                    <span className="flex items-center gap-0.5"><Calendar size={8} />{nextClass.date}</span>
                  </div>
                  {countdownMs > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold tabular-nums">{formatCountdown(countdownMs)}</div>
                      <button onClick={() => router.push(`/dashboard/classes/${nextClass.id}`)} className="px-2 py-0.5 rounded bg-white text-[#6D3DF5] text-[9px] font-bold hover:bg-white/90 transition-colors">View</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="rounded-xl bg-white border border-[#E9E7F5] shadow-sm overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[#E9E7F5]/60">
                <h3 className="text-[11px] font-bold text-[#0F1B3D]">{DAY_NAMES_FULL[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>
                <p className="text-[9px] text-[#536078] mt-0.5">{selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''}</p>
              </div>
              <div className="px-3 py-2.5 min-h-[140px] max-h-[calc(100vh-380px)] overflow-auto">
                {selectedClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F6FF] flex items-center justify-center mb-2 shadow-inner"><Calendar size={16} className="text-[#8A93AE]" /></div>
                    <p className="text-[11px] font-bold text-[#0F1B3D]">No classes</p>
                    <p className="text-[9px] font-semibold text-[#536078] mt-0.5">All clear</p>
                    <a href="/dashboard/classes/create" className="inline-flex items-center gap-0.5 mt-2 px-2.5 py-1 rounded-md bg-[#F3EEFF] text-[#6D3DF5] text-[9px] font-bold hover:bg-[#EDE5FF] transition-colors border border-[#6D3DF5]/15"><Calendar size={9} /> Create</a>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {selectedClasses.map((cls, idx) => {
                        const status = cls.status || 'scheduled'
                        const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled
                        const enrolled = cls.enrolled_count || cls.students_count || 0
                        return (
                          <motion.div key={cls.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ delay: idx * 0.03 }}
                            onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                            className="group relative p-2.5 rounded-lg bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/20 cursor-pointer transition-all hover:shadow-md">
                            <div className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full ${colors.bar}`} />
                            <div className="flex items-start gap-2 pl-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] font-bold ${colors.text}`}>{cls.time?.slice(0, 5)}</span>
                                  <span className={`px-1 py-[1px] rounded text-[7px] font-bold ${colors.bg} ${colors.text} uppercase`}>{status}</span>
                                </div>
                                <div className="text-[11px] font-bold text-[#0F1B3D] mt-0.5 truncate">{cls.title}</div>
                                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#536078] mt-0.5">
                                  <span className="flex items-center gap-0.5"><Clock size={7} />{cls.time?.slice(0, 5)}</span>
                                  <span className="flex items-center gap-0.5"><Users size={7} />{enrolled}</span>
                                  {cls.duration && <span className="flex items-center gap-0.5"><Video size={7} />{cls.duration}</span>}
                                </div>
                                {cls.instructor?.name && (
                                  <div className="text-[8px] font-semibold text-[#536078] mt-0.5 flex items-center gap-0.5">
                                    <span className="w-3 h-3 rounded-full bg-[#F3EEFF] flex items-center justify-center"><User size={6} className="text-[#6D3DF5]" /></span>
                                    {cls.instructor.name}
                                  </div>
                                )}
                              </div>
                              <ArrowRight size={11} className="text-[#8A93AE] group-hover:text-[#6D3DF5] transition-colors shrink-0 mt-0.5" />
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div className="px-3 py-2 border-t border-[#E9E7F5]/60 bg-[#FAFAFE]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {Object.entries(STATUS_COLORS).map(([key, c]) => (
                    <div key={key} className="flex items-center gap-0.5">
                      <div className={`w-[6px] h-[6px] rounded-sm ${c.bar}`} />
                      <span className="text-[8px] font-bold text-[#536078] capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
