'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Radio, Video, Clock, Users, Calendar, Copy, Trash2, Star,
  Edit3, MessageCircle, Loader2, ChevronLeft, ChevronRight, MonitorPlay,
} from 'lucide-react'
import MeetingControlPanel from '@/components/live-classes/MeetingControlPanel'
import ClassRecordingWidget from '@/components/live-classes/ClassRecordingWidget'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'
import toast from 'react-hot-toast'

const subNav: { id: string; label: string; icon: any; href?: string }[] = [
  { id: 'zoom', label: 'Zoom', icon: MonitorPlay },
  { id: 'edit', label: 'Edit', icon: Edit3 },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/dashboard/messages' },
]

function sc(s?: string) {
  return s === 'live' ? 'bg-[#572ECE]' : s === 'scheduled' ? 'bg-[#3478F6]' : s === 'completed' ? 'bg-[#8A93AE]' : s === 'cancelled' ? 'bg-[#E5484D]' : 'bg-[#8A93AE]/20'
}

export default function ClassDetailHub() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [cls, setCls] = useState<Class | null>(null)
  const subNavRef = useRef<HTMLDivElement>(null)

  const scrollSubNav = (dir: number) => {
    subNavRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  const loadClass = useCallback(() => {
    liveClassesAPI.getOne(Number(params.id))
      .then(res => setCls(res.data?.data ?? null))
      .catch(() => { toast.error('Failed to load class'); router.push('/dashboard/classes') })
      .finally(() => setLoading(false))
  }, [params.id, router])

  useEffect(() => { loadClass() }, [loadClass])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#8A93AE]" /></div>
  if (!cls) return <div className="text-center py-16 text-[#536078]">Class not found</div>

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm">
        <button onClick={() => router.push('/dashboard/classes')} className="flex items-center gap-1.5 text-[11px] text-[#536078] hover:text-[#6D3DF5] transition-colors mb-3">
          <ArrowLeft size={12} /> Back to Classes
        </button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg ${sc(cls.status)} bg-opacity-20 flex items-center justify-center shrink-0`}>
              <Radio size={18} className={cls.status ? 'text-[#0F1B3D]' : 'text-[#8A93AE]'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0F1B3D]">{cls.title}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${sc(cls.status)} text-white`}>{cls.status || 'scheduled'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-[#536078]">
                {cls.instructor && <span className="flex items-center gap-1"><Users size={11} />{cls.instructor.name}</span>}
                <span className="flex items-center gap-1"><Calendar size={11} />{cls.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{cls.time}</span>
                <span className="flex items-center gap-1"><Users size={11} />{cls.enrolled_count || 0} enrolled</span>
                {cls.rating && <span className="flex items-center gap-1 text-amber-400"><Star size={11} />{cls.rating}</span>}
              </div>
              {cls.description && <p className="text-[11px] text-[#536078] mt-1.5 max-w-xl line-clamp-2">{cls.description}</p>}
            </div>
          </div>
          <div className="flex gap-1.5">
            {cls.status === 'live' && (
              <button onClick={() => router.push(`/dashboard/classes/${params.id}`)} className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-[#572ECE] text-white text-xs font-semibold hover:bg-[#572ECE]/90 transition-colors shadow-sm">
                <Radio size={12} /> Join Live
              </button>
            )}
            <button onClick={() => router.push(`/dashboard/classes/${params.id}/edit`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#EEF4FF] text-[#3478F6] transition-colors" title="Edit">
              <Edit3 size={13} />
            </button>
            <button onClick={() => { liveClassesAPI.duplicateClass(Number(params.id)).then(() => toast.success('Duplicated!')).catch(() => toast.error('Failed')) }} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#F3EEFF] text-[#6D3DF5] transition-colors" title="Duplicate">
              <Copy size={13} />
            </button>
            <button onClick={() => { if (confirm('Delete this class?')) liveClassesAPI.delete(Number(params.id)).then(() => { toast.success('Deleted'); router.push('/dashboard/classes') }).catch(() => toast.error('Failed')) }} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 text-[#E5484D] transition-colors" title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphism pill toolbar */}
      <div className="group relative rounded-2xl bg-[#F3F5FB] border border-[#E9E7F5] p-1.5">
        <div ref={subNavRef} className="flex items-center gap-1 overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x select-none rounded-2xl p-1.5 border border-[#E9E7F5]">
          {subNav.map(item => {
            const Icon = item.icon
            const route = item.href ?? `/dashboard/classes/${params.id}/${item.id}`
            const active = pathname === route
            return (
              <motion.button key={item.id} whileTap={{ scale: 0.94 }}
                onClick={() => router.push(route)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 group
                  ${active
                    ? 'bg-[#6D3DF5] text-white border border-[#6D3DF5]/20 shadow-[0_2px_14px_-2px_rgba(109,61,245,0.35)]'
                    : 'text-[#536078] border border-transparent hover:text-[#0F1B3D] hover:bg-[#F8FAFC]'}`}
              >
                <Icon size={12} className={`${active ? 'text-white' : 'text-[#8A93AE] group-hover:text-[#6D3DF5]'} transition-colors`} />
                {item.label}
                {active && (
                  <motion.span layoutId="class-subnav-glow" className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[#6D3DF5] shadow-[0_0_10px_2px_rgba(109,61,245,0.4)]" />
                )}
              </motion.button>
            )
          })}
        </div>
        {/* Side scroll arrows — appear on hover */}
        <button onClick={() => scrollSubNav(-1)}
          className="absolute left-0.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-md border border-[#E9E7F5] flex items-center justify-center text-[#536078] hover:text-[#0F1B3D] hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer"
          title="Scroll left">
          <ChevronLeft size={13} />
        </button>
        <button onClick={() => scrollSubNav(1)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-md border border-[#E9E7F5] flex items-center justify-center text-[#536078] hover:text-[#0F1B3D] hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer"
          title="Scroll right">
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Duration', value: (cls as any).duration_minutes ? `${(cls as any).duration_minutes} min` : (cls.duration || '—'), icon: Clock, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]', route: `edit` },
          { label: 'Participants', value: (cls as any).participants_count ?? cls.enrolled_count ?? 0, icon: Users, color: 'text-[#572ECE]', bg: 'bg-[#F0EAFF]', route: `participants` },
          { label: 'Status', value: cls.status || 'scheduled', icon: Radio, color: 'text-amber-500', bg: 'bg-[#FEF5E7]', route: `` },
          { label: 'Recordings', value: (cls as any).recordings_count ?? 0, icon: Video, color: 'text-pink-500', bg: 'bg-[#FDEEF7]', route: `/dashboard/classes/recordings?class_id=${params.id}` },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => { if (s.route) router.push(s.route.startsWith('/') ? s.route : `/dashboard/classes/${params.id}/${s.route}`) }}
              className={`p-3 rounded-lg bg-white border border-[#E9E7F5] shadow-sm flex items-center gap-2.5 ${s.route ? 'cursor-pointer hover:border-[#E9E7F5]' : ''}`}
            >
              <div className={`w-8 h-8 rounded-md ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={s.color} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#0F1B3D] truncate capitalize">{s.value}</div>
                <div className="text-[10px] text-[#8A93AE] mt-0.5 truncate">{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <ClassRecordingWidget
        classId={Number(params.id)}
        status={cls.status || 'scheduled'}
        title={cls.title}
        date={cls.date}
        time={cls.time}
        onClassEnded={loadClass}
      />

      <MeetingControlPanel classId={Number(params.id)} />
    </div>
  )
}
