'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DoorOpen, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { ClassWaitingRoom } from '@/types'
import toast from 'react-hot-toast'

export default function WaitingRoomPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<ClassWaitingRoom[]>([])

  const fetchData = () => {
    setLoading(true)
    liveClassesAPI.getWaitingRoom(Number(params.id))
      .then(res => setEntries(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])

  const handleAdmit = async (userId: number) => {
    try { await liveClassesAPI.approveWaiting(Number(params.id), userId); toast.success('Admitted'); fetchData() }
    catch { toast.error('Failed') }
  }
  const handleReject = async (userId: number) => {
    try { await liveClassesAPI.rejectWaiting(Number(params.id), userId); toast.success('Rejected'); fetchData() }
    catch { toast.error('Failed') }
  }

  const waiting = entries.filter(e => e.status === 'waiting')

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      {waiting.length === 0 ? (
        <div className="text-center py-16">
          <DoorOpen size={36} className="text-[#8A93AE] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No one in the waiting room</p>
        </div>
      ) : (
        <div className="space-y-2">
          {waiting.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 4 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#FEF9EC] flex items-center justify-center shrink-0">
                <Clock size={16} className="text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0F1B3D] truncate">{e.user?.name || `User #${e.user_id}`}</div>
                {e.requested_at && <div className="text-xs text-[#536078]">Requested {new Date(e.requested_at).toLocaleTimeString()}</div>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleAdmit(e.user_id)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#ECFBF5] text-[#18A878] text-xs font-medium hover:bg-[#18A878]/10 transition-colors">
                  <CheckCircle size={12} /> Admit
                </button>
                <button onClick={() => handleReject(e.user_id)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/15 text-[#E5484D] text-xs font-medium hover:bg-red-500/25 transition-colors">
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
