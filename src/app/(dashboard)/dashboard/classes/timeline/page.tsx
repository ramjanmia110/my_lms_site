'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { History, Clock, Radio, Video, XCircle, Loader2 } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { ClassTimelineEvent } from '@/types'

const eventConfig: Record<string, { icon: any; color: string; bg: string }> = {
  created: { icon: History, color: 'text-[#3478F6]', bg: 'border-[#3478F6]/25' },
  started: { icon: Radio, color: 'text-[#572ECE]', bg: 'border-[#572ECE]/25' },
  attendance_started: { icon: Clock, color: 'text-[#F59E0B]', bg: 'border-[#F59E0B]/25' },
  break: { icon: XCircle, color: 'text-[#E5484D]', bg: 'border-[#E5484D]/25' },
  recording_started: { icon: Video, color: 'text-[#DB2777]', bg: 'border-[#DB2777]/25' },
  ended: { icon: XCircle, color: 'text-[#E5484D]', bg: 'border-[#E5484D]/25' },
  recording_uploaded: { icon: Video, color: 'text-[#6D3DF5]', bg: 'border-[#6D3DF5]/25' },
}

export default function TimelinePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ClassTimelineEvent[]>([])

  useEffect(() => {
    liveClassesAPI.getTimeline()
      .then(res => { const d = res.data?.data?.data ?? res.data?.data ?? []; setEvents(Array.isArray(d) ? d : []) })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <History size={36} className="text-[#8A93AE] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No timeline events</p>
        </div>
      ) : (
        <div className="relative pl-10">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#E9E7F5]" />
          <div className="space-y-3">
            {events.map((ev, i) => {
              const cfg = eventConfig[ev.type] || { icon: History, color: 'text-[#8A93AE]', bg: 'border-[#E9E7F5]' }
              const Icon = cfg.icon
              return (
                <motion.div key={ev.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                  onClick={() => router.push(`/dashboard/classes/${ev.class_id}`)}
                  className="flex gap-4 cursor-pointer hover:bg-[#F8FAFC] rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className={`w-[38px] h-[38px] rounded-full bg-white border ${cfg.bg} flex items-center justify-center shrink-0 z-10`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 pb-3 border-b border-[#E9E7F5]">
                    <div className="text-sm font-semibold text-[#0F1B3D] hover:text-[#572ECE] transition-colors">{ev.title || ev.type.replace(/_/g, ' ')}</div>
                    {ev.description && <div className="text-xs text-[#536078] mt-0.5">{ev.description}</div>}
                    <div className="text-[11px] text-[#8A93AE] mt-1">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : ''}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
