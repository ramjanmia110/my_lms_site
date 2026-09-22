'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle, XCircle, Clock, Loader2, Search, UserCheck, UserX } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface AttendanceRecord {
  id: number
  user_id: number
  name: string
  email: string
  avatar: string | null
  status: AttendanceStatus
  marked: boolean
  joined_at: string | null
  left_at: string | null
  duration_minutes: number | null
}

const STATUS_META: Record<AttendanceStatus, { label: string; badge: string; dot: string }> = {
  present: { label: 'Present', badge: 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/25', dot: 'bg-[#18A878]' },
  absent: { label: 'Absent', badge: 'bg-red-500/15 text-[#E5484D] border-red-500/25', dot: 'bg-[#E5484D]' },
  late: { label: 'Late', badge: 'bg-[#FEF9EC] text-[#F59E0B] border-[#F59E0B]/25', dot: 'bg-[#F59E0B]' },
  excused: { label: 'Excused', badge: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/25', dot: 'bg-[#3478F6]' },
}

const FILTERS: { key: 'all' | AttendanceStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'late', label: 'Late' },
  { key: 'excused', label: 'Excused' },
]

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function AttendancePage() {
  const params = useParams()
  const classId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all')

  useEffect(() => {
    liveClassesAPI.getAttendance(classId)
      .then(res => {
        const data: AttendanceRecord[] = res.data?.data?.records ?? res.data?.data?.data ?? []
        setRecords(Array.isArray(data) ? data : [])
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [classId])

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    excused: records.filter(r => r.status === 'excused').length,
  }
  const total = records.length
  const pct = total > 0 ? Math.round((stats.present / total) * 100) : 0

  const setStatus = (userId: number, status: 'present' | 'absent') => {
    setRecords(prev => prev.map(r => (r.user_id === userId ? { ...r, status } : r)))
  }

  const persist = (userId: number, status: 'present' | 'absent') => {
    liveClassesAPI
      .markAttendance(classId, { attendance: [{ user_id: userId, present: status === 'present' }] })
      .then(() => toast.success('Attendance updated'))
      .catch(() => toast.error('Failed to save attendance'))
  }

  const toggleStatus = (userId: number, status: 'present' | 'absent') => {
    setStatus(userId, status)
    persist(userId, status)
  }

  const markAll = (status: 'present' | 'absent') => {
    if (records.length === 0) return
    setSaving(true)
    const next = records.map(r => ({ user_id: r.user_id, present: status === 'present' }))
    setRecords(prev => prev.map(r => ({ ...r, status })))
    liveClassesAPI
      .markAttendance(classId, { attendance: next })
      .then(() => toast.success(`All marked ${status}`))
      .catch(() => toast.error('Failed to save attendance'))
      .finally(() => setSaving(false))
  }

  const filtered = records.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)
  })

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-[#E5484D]', bg: 'bg-red-500/10' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#FEF9EC]' },
          { label: 'Excused', value: stats.excused, icon: CalendarDays, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm`}>
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon size={15} className={s.color} /></div>
            <div className="text-lg font-bold text-[#0F1B3D]">{s.value}</div>
            <div className="text-xs text-[#536078]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[#F8FAFC] overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-gradient-to-r from-[#18A878] to-[#18A878]/90" />
        </div>
        <span className="text-xs font-semibold text-[#18A878]">{pct}% present</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A93AE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30" />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filter === f.key
                  ? 'bg-[#6D3DF5] text-white border-[#6D3DF5]'
                  : 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          <button onClick={() => markAll('present')} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 bg-[#ECFBF5] text-[#18A878] border-[#18A878]/25 hover:bg-[#18A878]/10">
            <UserCheck size={13} /> All present
          </button>
          <button onClick={() => markAll('absent')} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 bg-red-500/10 text-[#E5484D] border-red-500/25 hover:bg-red-500/15">
            <UserX size={13} /> All absent
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-[#536078] text-sm">No records</div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3.5 rounded-xl bg-white border border-[#E9E7F5] shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#8A93AE]">{initials(r.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0F1B3D] truncate">{r.name}</div>
                <div className="text-[11px] text-[#536078] truncate">{r.email}{r.duration_minutes ? ` · ${r.duration_minutes}min` : ''}</div>
              </div>
              <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border shrink-0 ${STATUS_META[r.status].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[r.status].dot}`} />
                {STATUS_META[r.status].label}
              </span>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => toggleStatus(r.user_id, 'present')} title="Mark present"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    r.status === 'present'
                      ? 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/40'
                      : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:text-[#18A878] hover:border-[#18A878]/30'
                  }`}>
                  <UserCheck size={12} /> Present
                </button>
                <button onClick={() => toggleStatus(r.user_id, 'absent')} title="Mark absent"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    r.status === 'absent'
                      ? 'bg-red-500/15 text-[#E5484D] border-red-500/40'
                      : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:text-[#E5484D] hover:border-[#E5484D]/30'
                  }`}>
                  <UserX size={12} /> Absent
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
