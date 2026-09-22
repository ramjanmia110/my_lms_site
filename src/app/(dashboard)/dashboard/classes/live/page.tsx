'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Radio, Users, Clock, Play, Pause, Loader2, MessageCircle, HelpCircle, BarChart3 } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'
import toast from 'react-hot-toast'

function elapsed(start: number): string {
  const diff = Math.floor((Date.now() - start) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function LiveSessionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Class[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await liveClassesAPI.getLive()
      const d = res.data?.data?.data ?? res.data?.data ?? []
      setSessions(Array.isArray(d) ? d : [])
    } catch { setSessions([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleEnd = async (id: number) => { try { await liveClassesAPI.endSession(id); toast.success('Session ended'); fetchData() } catch { toast.error('Failed') } }
  const handlePause = async (id: number) => { try { await liveClassesAPI.pauseSession(id); toast.success('Session paused'); fetchData() } catch { toast.error('Failed') } }

  const liveSessions = sessions.filter(c => c.status === 'live')

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-500" /></div>
      ) : liveSessions.length === 0 ? (
        <div className="text-center py-16">
          <Radio size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No live sessions right now</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          {liveSessions.map(cls => (
            <motion.div key={cls.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-emerald-500/15 cursor-pointer hover:border-emerald-500/30 transition-all"
              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">{cls.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  {elapsed(new Date(`${cls.date}T${cls.time}`).getTime())}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1.5"><Users size={12} />{cls.enrolled_count || 0} participants</span>
                <span className="flex items-center gap-1.5"><Clock size={12} />Started {cls.time}</span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => router.push(`/dashboard/classes/${cls.id}/chat`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs font-medium hover:text-white transition-colors">
                  <MessageCircle size={12} /> Chat
                </button>
                <button onClick={() => router.push(`/dashboard/classes/${cls.id}/qa`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs font-medium hover:text-white transition-colors">
                  <HelpCircle size={12} /> Q&A
                </button>
                <button onClick={() => router.push(`/dashboard/classes/${cls.id}/polls`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs font-medium hover:text-white transition-colors">
                  <BarChart3 size={12} /> Polls
                </button>
                <button onClick={() => router.push(`/dashboard/classes/${cls.id}/participants`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 text-xs font-medium hover:text-white transition-colors">
                  <Users size={12} /> People
                </button>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]" onClick={e => e.stopPropagation()}>
                <button onClick={() => router.push(`/dashboard/classes/${cls.id}`)} className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors">
                  Join Session
                </button>
                <button onClick={() => handlePause(cls.id)} className="px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors">
                  <Pause size={13} />
                </button>
                <button onClick={() => handleEnd(cls.id)} className="px-3 py-2 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors">
                  <Play size={13} className="rotate-90" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
