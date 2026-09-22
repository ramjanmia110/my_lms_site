'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Clock, Users, Calendar, ArrowRight, Timer, User, X, Video, Zap } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']
const DAYS_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const EC: Record<string, { bg: string; text: string; dot: string; light: string }> = {
  live:      { bg: 'bg-[#572ECE]', text: 'text-white', dot: 'bg-[#572ECE]', light: 'bg-[#F0EAFF]' },
  scheduled: { bg: 'bg-[#3478F6]', text: 'text-white', dot: 'bg-[#3478F6]', light: 'bg-[#EEF4FF]' },
  completed: { bg: 'bg-[#8A93AE]', text: 'text-white', dot: 'bg-[#8A93AE]', light: 'bg-[#F1F3F8]' },
  cancelled: { bg: 'bg-[#E5484D]', text: 'text-white', dot: 'bg-[#E5484D]', light: 'bg-[#FEE8E8]' },
}

export default function CalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState<Date | null>(new Date())
  const [cls, setCls] = useState<Class | null>(null)
  const [hov, setHov] = useState<string | null>(null)

  const y = cur.getFullYear(), m = cur.getMonth(), now = new Date()

  useEffect(() => { setCls(null) }, [cur])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      liveClassesAPI.getCalendar({ month: m + 1, year: y }),
      liveClassesAPI.getUpcoming({ per_page: 200 }).catch(() => ({ data: { data: [] } })),
    ]).then(([r]) => {
      const raw = r.data?.data?.data ?? r.data?.data ?? r.data ?? []
      setClasses(Array.isArray(raw) ? raw : typeof raw === 'object' ? Object.values(raw).flat() as Class[] : [])
    }).catch(() => setClasses([])).finally(() => setLoading(false))
  }, [m, y])

  const fd = new Date(y, m, 1).getDay()
  const dim = new Date(y, m + 1, 0).getDate()
  const pdim = new Date(y, m, 0).getDate()
  const tc = Math.ceil((fd + dim) / 7) * 7

  const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  const isSame = (a: Date | null, b: Date) => a?.getDate() === b.getDate() && a?.getMonth() === b.getMonth() && a?.getFullYear() === b.getFullYear()
  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const getFor = (d: Date) => classes.filter(c => c.date === dateKey(d)).sort((a, b) => a.time.localeCompare(b.time))

  const cells = useMemo(() => {
    const arr: { date: Date; cur: boolean }[] = []
    for (let i = fd - 1; i >= 0; i--) arr.push({ date: new Date(y, m, pdim - i), cur: false })
    for (let i = 1; i <= dim; i++) arr.push({ date: new Date(y, m, i), cur: true })
    for (let i = 1; arr.length < tc; i++) arr.push({ date: new Date(y, m + 1, i), cur: false })
    return arr
  }, [fd, dim, pdim, tc, y, m])

  const selCls = useMemo(() => sel ? getFor(sel) : [], [sel, classes])
  const evDates = useMemo(() => { const s = new Set<string>(); classes.forEach(c => s.add(c.date)); return s }, [classes])
  const stats = useMemo(() => ({
    t: classes.length,
    l: classes.filter(c => c.status === 'live').length,
    u: classes.filter(c => c.status === 'scheduled').length,
    c: classes.filter(c => c.status === 'completed').length,
  }), [classes])

  const weekHdrs = useMemo(() => {
    if (!sel) return []
    const s = new Date(sel)
    s.setDate(s.getDate() - s.getDay())
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d })
  }, [sel])

  const fmt = (t: string) => {
    if (!t) return ''
    const [h, mn] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(mn).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-3 md:p-4 lg:p-5">
      <div className="max-w-[1320px] mx-auto grid xl:grid-cols-[1fr_300px] gap-3">

        {/* ===== CALENDAR ===== */}
        <div className="rounded-xl bg-white border border-[#E5E7EB]/70 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="relative px-4 py-2 border-b border-[#E5E7EB]/50">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#6D3DF5] via-[#3478F6] to-[#6D3DF5]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-px bg-[#F1F3F8] rounded-lg p-px">
                  <button onClick={() => setCur(new Date(y, m - 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#6D3DF5] transition-all"><ChevronLeft size={12} /></button>
                  <button onClick={() => setCur(new Date(y, m + 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#6D3DF5] transition-all"><ChevronRight size={12} /></button>
                </div>
                <div>
                  <h1 className="text-[14px] font-bold text-[#0F1B3D] leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{MONTHS[m]} {y}</h1>
                  <p className="text-[10px] text-[#94A3B8] font-medium leading-tight">{stats.t} event{stats.t !== 1 ? 's' : ''}{stats.l > 0 && <span className="text-[#572ECE] font-bold"> · {stats.l} live</span>}</p>
                </div>
                <button onClick={() => { setCur(new Date()); setSel(new Date()) }} className="px-2 py-0.5 text-[10px] font-semibold text-[#6D3DF5] bg-[#F5F3FF] rounded hover:bg-[#EDE9FD] border border-[#6D3DF5]/10 transition-all">Today</button>
              </div>
              <a href="/dashboard/classes/create" className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[11px] font-bold hover:shadow-md transition-all"><Plus size={12} strokeWidth={2.5} /> New</a>
            </div>
          </div>

          {/* Grid */}
          <div className="px-3 pb-3 pt-2">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 rounded-full border-[2px] border-[#E5E7EB] border-t-[#6D3DF5] animate-spin" />
                  <span className="text-[11px] font-medium text-[#94A3B8]">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-px">
                  {DAYS_FULL.map((d, i) => (
                    <div key={i} className="text-center py-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${i === 0 ? 'text-[#EF4444]/70' : i === 6 ? 'text-[#6D3DF5]/70' : 'text-[#94A3B8]'}`}>{d}</span>
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 border border-[#E5E7EB]/80 rounded-lg overflow-hidden">
                  {cells.map((cell, i) => {
                    const k = dateKey(cell.date)
                    const dayClasses = cell.cur ? getFor(cell.date) : []
                    const hasLive = dayClasses.some(c => c.status === 'live')
                    const td = isToday(cell.date)
                    const selected = isSame(sel, cell.date)
                    const hov_ = hov === k
                    const isWknd = cell.date.getDay() === 0 || cell.date.getDay() === 6

                    return (
                      <div key={i}
                        onClick={() => { if (cell.cur) { setSel(cell.date); setCls(null) } }}
                        onMouseEnter={() => setHov(k)}
                        onMouseLeave={() => setHov(null)}
                        className={`relative min-h-[80px] p-1.5 border-r border-b border-[#E5E7EB]/50 transition-all duration-100 ${
                          !cell.cur ? 'bg-[#FAFAFB]/80' : 'cursor-pointer'
                        } ${hov_ && cell.cur && !selected ? 'bg-[#F8F7FC]' : ''} ${selected ? 'bg-[#F5F3FF]/40 ring-1 ring-inset ring-[#6D3DF5]/10' : ''} ${td && cell.cur ? 'bg-[#F5F3FF]/25' : ''} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''} ${i >= tc - 7 ? 'border-b-0' : ''}`}
                      >
                        {dayClasses.length > 0 ? (
                          <>
                            <div className="flex items-center justify-center mb-0.5">
                              <span className={`inline-flex items-center justify-center w-[20px] h-[20px] rounded-full text-[10px] font-bold transition-all ${
                                td ? 'bg-[#6D3DF5] text-white shadow-sm shadow-[#6D3DF5]/25'
                                  : selected ? 'bg-[#6D3DF5]/10 text-[#6D3DF5]'
                                  : isWknd ? 'text-[#6D3DF5]/50' : 'text-[#1E293B]'
                              }`}>{cell.date.getDate()}</span>
                              {hasLive && <span className="w-[4px] h-[4px] rounded-full bg-[#572ECE] animate-pulse ml-0.5" />}
                            </div>
                            <div className="space-y-px">
                              {dayClasses.slice(0, 2).map(cls => {
                                const ec = EC[cls.status || 'scheduled'] || EC.scheduled
                                const isLive = cls.status === 'live'
                                return (
                                  <div key={cls.id}
                                    onClick={ev => { ev.stopPropagation(); setCls(cls) }}
                                    className={`w-full px-1 py-[2px] rounded-sm text-[9px] font-semibold truncate cursor-pointer transition-all ${ec.bg} ${ec.text} hover:brightness-110 active:scale-[0.97]`}>
                                    {isLive && <span className="inline-block w-[3px] h-[3px] rounded-full bg-white/70 mr-px animate-pulse" />}
                                    {cls.title}
                                  </div>
                                )
                              })}
                              {dayClasses.length > 2 && <div className="text-[8px] font-bold text-[#94A3B8] pl-px">+{dayClasses.length - 2}</div>}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className={`text-[12px] font-semibold ${td ? 'w-[22px] h-[22px] inline-flex items-center justify-center rounded-full bg-[#6D3DF5] text-white shadow-sm shadow-[#6D3DF5]/25' : selected ? 'w-[22px] h-[22px] inline-flex items-center justify-center rounded-full bg-[#6D3DF5]/10 text-[#6D3DF5]' : !cell.cur ? 'text-[#CBD5E1]' : isWknd ? 'text-[#6D3DF5]/40' : 'text-[#475569]'}`}>{cell.date.getDate()}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="space-y-2.5">

          {/* Mini Calendar */}
          <div className="rounded-xl bg-white border border-[#E5E7EB]/70 shadow-sm p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[12px] font-bold text-[#0F1B3D]">{MONTHS[m].slice(0, 3)} {y}</h3>
              <div className="flex items-center gap-px">
                <button onClick={() => setCur(new Date(y, m - 1, 1))} className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F3F8] hover:text-[#6D3DF5] transition-all"><ChevronLeft size={10} /></button>
                <button onClick={() => setCur(new Date(y, m + 1, 1))} className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F3F8] hover:text-[#6D3DF5] transition-all"><ChevronRight size={10} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center py-px">
                  <span className={`text-[8px] font-bold uppercase ${i === 0 ? 'text-[#EF4444]/50' : i === 6 ? 'text-[#6D3DF5]/50' : 'text-[#94A3B8]'}`}>{d}</span>
                </div>
              ))}
              {cells.map((cell, i) => {
                const td = isToday(cell.date)
                const sel_ = isSame(sel, cell.date)
                const has = cell.cur && evDates.has(dateKey(cell.date))
                return (
                  <div key={i} className="flex items-center justify-center py-px">
                    <button onClick={() => { if (cell.cur) { setSel(cell.date); setCls(null) } }} disabled={!cell.cur}
                      className={`w-[20px] h-[20px] flex items-center justify-center text-[9px] font-medium rounded transition-all ${
                        td ? 'bg-[#6D3DF5] text-white font-bold shadow-sm' : sel_ ? 'bg-[#6D3DF5]/10 text-[#6D3DF5] font-bold' : has ? 'text-[#1E293B] font-bold' : !cell.cur ? 'text-[#CBD5E1]' : 'text-[#64748B] hover:bg-[#F1F3F8]'
                      }`}>{cell.date.getDate()}</button>
                  </div>
                )
              })}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-[#E5E7EB]/50">
              {[{ n: stats.t, c: '#6D3DF5', l: 'All', bg: '#F5F3FF' }, { n: stats.l, c: '#572ECE', l: 'Live', bg: '#F0EAFF' }, { n: stats.u, c: '#3478F6', l: 'Soon', bg: '#EEF4FF' }, { n: stats.c, c: '#8A93AE', l: 'Done', bg: '#F1F3F8' }].map(s => (
                <div key={s.l} className="text-center py-1 rounded" style={{ backgroundColor: s.bg }}>
                  <div className="text-[13px] font-extrabold leading-none" style={{ color: s.c }}>{s.n}</div>
                  <div className="text-[7px] font-bold text-[#94A3B8] uppercase mt-px">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Day Detail */}
          {sel && (
            <div className="rounded-xl bg-white border border-[#E5E7EB]/70 shadow-sm overflow-hidden">
              <div className="px-3 pt-2.5 pb-2 border-b border-[#E5E7EB]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isToday(sel) ? 'bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] shadow-sm' : 'bg-[#F1F3F8]'}`}>
                      <span className={`text-[14px] font-extrabold ${isToday(sel) ? 'text-white' : 'text-[#6D3DF5]'}`}>{sel.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold text-[#0F1B3D] leading-tight">{DAYS_FULL[sel.getDay()]}</h3>
                      <p className="text-[9px] text-[#94A3B8] font-medium">{MONTHS[sel.getMonth()].slice(0, 3)} {sel.getDate()}, {sel.getFullYear()}</p>
                    </div>
                  </div>
                  {isToday(sel) && <span className="px-1.5 py-px rounded bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-[8px] font-bold text-white">TODAY</span>}
                </div>
              </div>

              <div className="px-2.5 py-2 max-h-[260px] overflow-auto">
                {selCls.length > 0 ? (
                  <div className="space-y-1">
                    {selCls.map(c => {
                      const e = EC[c.status || 'scheduled'] || EC.scheduled
                      const isLive = c.status === 'live'
                      return (
                        <div key={c.id} onClick={() => setCls(c)}
                          className={`relative p-2 rounded-lg border cursor-pointer transition-all group ${cls?.id === c.id ? 'border-[#6D3DF5]/20 bg-[#F8F7FC] shadow-sm' : 'border-[#E5E7EB]/60 hover:border-[#6D3DF5]/15 hover:bg-[#FAFAFB]'}`}>
                          <div className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full ${e.bg}`} />
                          <div className="pl-1.5">
                            <div className="flex items-center gap-1 mb-px">
                              <span className={`inline-flex items-center gap-0.5 px-1 py-px rounded text-[7px] font-bold uppercase tracking-wide ${e.bg} ${e.text}`}>
                                {isLive && <span className="w-[3px] h-[3px] rounded-full bg-white/70 animate-pulse" />}
                                {c.status || 'scheduled'}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-[#1E293B] truncate group-hover:text-[#6D3DF5] transition-colors">{c.title}</div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[#94A3B8] font-medium">
                              <span className="flex items-center gap-px"><Clock size={8} />{fmt(c.time)}</span>
                              <span className="flex items-center gap-px"><Users size={8} />{c.enrolled_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-5">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F3FF] flex items-center justify-center mb-1.5">
                      <Calendar size={16} className="text-[#6D3DF5]/35" />
                    </div>
                    <p className="text-[11px] font-bold text-[#0F1B3D]">No events</p>
                    <p className="text-[9px] text-[#94A3B8]">Free day</p>
                    <a href="/dashboard/classes/create" className="mt-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[9px] font-bold hover:shadow-md transition-all flex items-center gap-px"><Plus size={9} /> Add</a>
                  </div>
                )}
              </div>

              {/* Week strip */}
              <div className="px-2 py-1.5 border-t border-[#E5E7EB]/50 bg-[#FAFAFB]/80">
                <div className="flex gap-px">
                  {weekHdrs.map((d, i) => {
                    const td = isToday(d)
                    const sel_ = isSame(sel, d)
                    return (
                      <button key={i} onClick={() => { setSel(d); setCls(null) }}
                        className={`flex-1 flex flex-col items-center py-1 rounded transition-all ${sel_ ? 'bg-gradient-to-b from-[#6D3DF5] to-[#5B2FE0] shadow-sm' : td ? 'bg-[#F5F3FF]' : 'hover:bg-[#F1F3F8]'}`}>
                        <span className={`text-[7px] font-bold uppercase ${sel_ ? 'text-white/60' : 'text-[#94A3B8]'}`}>{DAYS[i]}</span>
                        <span className={`text-[10px] font-bold mt-px ${sel_ ? 'text-white' : td ? 'text-[#6D3DF5]' : 'text-[#1E293B]'}`}>{d.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Class Detail */}
          <AnimatePresence>
            {cls && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="rounded-xl bg-white border border-[#E5E7EB]/70 shadow-sm overflow-hidden">
                <div className={`h-1 w-full ${(EC[cls.status || 'scheduled'] || EC.scheduled).bg}`} />
                <div className="px-3 pt-2 pb-0.5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[8px] font-bold uppercase tracking-wide ${(EC[cls.status || 'scheduled'] || EC.scheduled).bg} ${(EC[cls.status || 'scheduled'] || EC.scheduled).text}`}>
                    {cls.status === 'live' && <span className="w-[3px] h-[3px] rounded-full bg-white/70 animate-pulse" />}
                    {cls.status || 'scheduled'}
                  </span>
                  <button onClick={() => setCls(null)} className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F3F8] hover:text-[#6D3DF5] transition-all"><X size={10} /></button>
                </div>
                <div className="px-3 pb-1">
                  <h3 className="text-[13px] font-bold text-[#0F1B3D] leading-snug">{cls.title}</h3>
                  {cls.description && <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">{cls.description}</p>}
                </div>
                <div className="px-3 pb-1 space-y-1">
                  <IR icon={Clock} bg="#F5F3FF" c="#6D3DF5" t={`${fmt(cls.time)}${cls.duration ? ` · ${cls.duration}` : ''}`} />
                  <IR icon={Users} bg="#EEF4FF" c="#3478F6" t={`${cls.enrolled_count || 0} enrolled`} />
                  {cls.instructor?.name && <IR icon={User} bg="#F0EAFF" c="#572ECE" t={cls.instructor.name} />}
                  {cls.meeting_url && <IR icon={Video} bg="#ECFDF5" c="#10B981" t="Meeting link" />}
                </div>
                <div className="px-3 pb-2.5 flex gap-1.5">
                  <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[10px] font-bold hover:shadow-md transition-all">
                    <ArrowRight size={10} /> Open
                  </button>
                  <button onClick={() => setCls(null)} className="px-2.5 py-1.5 rounded-lg bg-[#F1F3F8] text-[#64748B] text-[10px] font-bold hover:bg-[#E5E7EB]/60 transition-all">Close</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          {!cls && (
            <div className="rounded-xl bg-white border border-[#E5E7EB]/70 shadow-sm px-3 py-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                {Object.entries(EC).map(([k, c]) => (
                  <div key={k} className="flex items-center gap-1">
                    <div className={`w-[6px] h-[6px] rounded-sm ${c.bg}`} />
                    <span className="text-[9px] font-semibold text-[#94A3B8] capitalize">{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Overview */}
          {!cls && (
            <div className="rounded-xl bg-gradient-to-br from-[#6D3DF5] to-[#3478F6] text-white p-3 shadow-md shadow-[#6D3DF5]/15">
              <h4 className="text-[11px] font-bold opacity-90">Monthly Overview</h4>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium opacity-70">Total Classes</span>
                  <span className="text-[16px] font-extrabold leading-none">{stats.t}</span>
                </div>
                <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stats.t > 0 ? (stats.l / stats.t) * 100 : 0}%` }} />
                </div>
                <div className="text-[9px] opacity-60">{stats.l} live · {stats.u} upcoming · {stats.c} done</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function IR({ icon: I, bg, c, t }: { icon: any; bg: string; c: string; t: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <I size={11} style={{ color: c }} />
      </div>
      <span className="text-[10px] font-semibold text-[#1E293B] truncate">{t}</span>
    </div>
  )
}
