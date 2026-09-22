'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Loader2, Search, UserMinus, Clock, ShieldCheck, UserCheck, Hourglass, UserPlus, GraduationCap } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { ClassParticipant, User } from '@/types'
import toast from 'react-hot-toast'
import { ProfileAvatar } from '@/components/ui/profile-avatar'

type ParticipantStatus = ClassParticipant['status'] | 'enrolled'

type ParticipantRow = Omit<ClassParticipant, 'status'> & {
  status: ParticipantStatus
  user: User
}

type EnrolledStudent = {
  id: number
  name: string
  email: string
  avatar: string | null
  role: string
  enrolled_at: string | null
  progress: number
  completed: boolean
}

const filters: { key: 'all' | ParticipantStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'joined', label: 'Joined' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'left', label: 'Left' },
  { key: 'enrolled', label: 'Enrolled' },
]

function fmtDuration(sec: number | null): string {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toUser(s: EnrolledStudent): User {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: (s.role as User['role']) || 'student',
    avatar: s.avatar,
    email_verified_at: null,
    created_at: s.enrolled_at || '',
    onboarding_completed: true,
    skills: [],
    bio: null,
  }
}

function toRow(s: EnrolledStudent): ParticipantRow {
  return {
    id: -s.id,
    class_id: 0,
    user_id: s.id,
    status: 'enrolled',
    joined_at: null,
    left_at: null,
    duration_seconds: 0,
    hand_raised: false,
    is_muted: false,
    is_video_on: false,
    is_screen_sharing: false,
    created_at: s.enrolled_at || '',
    user: toUser(s),
  }
}

export default function ParticipantsPage() {
  const params = useParams()
  const classId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ParticipantRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ParticipantStatus>('all')
  const [busy, setBusy] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [partRes, enrolledRes] = await Promise.all([
        liveClassesAPI.getParticipants(classId),
        liveClassesAPI.getEnrolledStudents(classId),
      ])
      const participants = (partRes.data?.data?.data ?? partRes.data?.data ?? []) as ClassParticipant[]
      const enrolled = (enrolledRes.data?.data ?? []) as EnrolledStudent[]
      const enrolledIds = new Set(enrolled.map(s => s.id))
      const participantIds = new Set(participants.map(p => p.user_id))

      const real: ParticipantRow[] = participants
        .filter(p => p.user)
        .map(p => ({
          id: p.id,
          class_id: p.class_id,
          user_id: p.user_id,
          status: p.status,
          joined_at: p.joined_at,
          left_at: p.left_at,
          duration_seconds: p.duration_seconds ?? 0,
          hand_raised: !!p.hand_raised,
          is_muted: !!p.is_muted,
          is_video_on: !!p.is_video_on,
          is_screen_sharing: !!p.is_screen_sharing,
          created_at: p.created_at,
          user: p.user!,
        }))

      const notJoined = enrolled
        .filter(s => !participantIds.has(s.id))
        .map(toRow)

      const sorted = [...real, ...notJoined].sort((a, b) => {
        const order: Record<ParticipantStatus, number> = { joined: 0, waiting: 1, left: 2, enrolled: 3, kicked: 4 }
        const d = order[a.status] - order[b.status]
        return d !== 0 ? d : a.user.name.localeCompare(b.user.name)
      })

      setRows(sorted)
    } catch {
      setRows([])
      toast.error('Failed to load participants')
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = rows.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.user.name.toLowerCase().includes(q) || p.user.email.toLowerCase().includes(q)
  })

  const remove = async (p: ParticipantRow) => {
    setBusy(p.user_id)
    try {
      await liveClassesAPI.removeParticipant(classId, p.user_id)
      toast.success(`${p.user.name} removed`)
      await fetchData()
    } catch {
      toast.error('Failed to remove participant')
    } finally {
      setBusy(null)
    }
  }

  const enroll = async (p: ParticipantRow) => {
    setBusy(p.user_id)
    try {
      await liveClassesAPI.enrollStudent(classId, p.user_id)
      toast.success(`${p.user.name} enrolled in course`)
      await fetchData()
    } catch {
      toast.error('Failed to enroll student')
    } finally {
      setBusy(null)
    }
  }

  const enrolled = rows.filter(r => r.status === 'enrolled').length
  const joined = rows.filter(r => r.status === 'joined').length
  const waiting = rows.filter(r => r.status === 'waiting').length
  const left = rows.filter(r => r.status === 'left').length

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Enrolled', value: enrolled + joined + waiting, icon: GraduationCap, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Joined', value: joined, icon: UserCheck, color: 'text-[#18A878]', bg: 'bg-[#ECFBF5]' },
          { label: 'Waiting', value: waiting, icon: Hourglass, color: 'text-[#F59E0B]', bg: 'bg-[#FEF9EC]' },
          { label: 'Left', value: left, icon: Clock, color: 'text-[#8A93AE]', bg: 'bg-[#F8FAFC]' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-3 rounded-lg bg-white border border-[#E9E7F5] shadow-sm flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-md ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={s.color} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#0F1B3D]">{s.value}</div>
                <div className="text-[10px] text-[#536078]">{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A93AE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            className="w-full h-8 pl-8 pr-3 rounded-md bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30" />
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-md p-0.5 border border-[#E9E7F5]">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`h-6 px-2.5 rounded text-xs font-medium transition-all ${filter === f.key ? 'bg-[#6D3DF5] text-white' : 'text-[#8A93AE] hover:text-[#6D3DF5]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#536078] text-sm">No students found</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                className={`p-3.5 rounded-xl bg-white border transition-colors shadow-sm ${
                  p.status === 'enrolled' ? 'border-teal-500/25' : 'border-[#E9E7F5] hover:border-[#6D3DF5]/30'
                }`}>
                  <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <ProfileAvatar src={p.user.avatar} name={p.user.name} size="sm"
                      className={p.status === 'enrolled' ? 'ring-2 ring-teal-500/30' : p.status === 'joined' ? 'ring-2 ring-[#18A878]/30' : ''} />
                    {p.status !== 'enrolled' && (
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${p.status === 'joined' ? 'bg-[#18A878]' : p.status === 'waiting' ? 'bg-[#F59E0B]' : 'bg-[#8A93AE]'}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#0F1B3D] truncate">{p.user.name}</span>
                      {p.user.role === 'instructor' && <ShieldCheck size={12} className="text-[#F59E0B] shrink-0" />}
                      {p.hand_raised && p.status === 'joined' && <span className="px-1 py-0.5 rounded bg-[#EEF4FF] text-[#3478F6] text-[8px] font-bold shrink-0">✋</span>}
                    </div>
                    <div className="text-[11px] text-[#536078] truncate">{p.user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-semibold shrink-0 ${
                    p.status === 'joined' ? 'bg-[#ECFBF5] text-[#18A878]' :
                    p.status === 'waiting' ? 'bg-[#FEF9EC] text-[#F59E0B]' :
                    p.status === 'left' ? 'bg-[#F8FAFC] text-[#8A93AE]' :
                    'bg-teal-500/15 text-teal-400'
                  }`}>{p.status}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E9E7F5]">
                  <div className="flex items-center gap-3 text-[10px] text-[#536078]">
                    <span className="flex items-center gap-1"><Clock size={10} />{fmtTime(p.joined_at)}</span>
                    <span className="flex items-center gap-1"><UserCheck size={10} />{fmtDuration(p.duration_seconds)}</span>
                  </div>
                  {p.status === 'enrolled' ? (
                    <button onClick={() => enroll(p)} disabled={busy === p.user_id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-teal-400 border border-teal-500/25 bg-teal-500/10 hover:bg-teal-500/20 transition-all disabled:opacity-50">
                      {busy === p.user_id ? <Loader2 size={10} className="animate-spin" /> : <UserPlus size={10} />} Enroll
                    </button>
                  ) : (
                    <button onClick={() => remove(p)} disabled={busy === p.user_id}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[#8A93AE] border border-[#E9E7F5] hover:text-[#E5484D] hover:border-[#E5484D]/30 hover:bg-red-500/10 transition-all disabled:opacity-50">
                      {busy === p.user_id ? <Loader2 size={10} className="animate-spin" /> : <UserMinus size={10} />} Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
