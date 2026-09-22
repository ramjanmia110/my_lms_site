'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, Loader2 } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { ClassPollNew } from '@/types'
import toast from 'react-hot-toast'

export default function PollsPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [polls, setPolls] = useState<ClassPollNew[]>([])

  const fetchData = () => {
    liveClassesAPI.getPolls(Number(params.id))
      .then(res => setPolls(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setPolls([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])

  const handleVote = async (pollId: number, optionIndex: number) => {
    try { await liveClassesAPI.votePoll(Number(params.id), pollId, { option_index: optionIndex }); toast.success('Vote recorded'); fetchData() }
    catch { toast.error('Failed to vote') }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      {polls.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No polls yet</p>
        </div>
      ) : (
        polls.map((poll, i) => {
          const totalVotes = (poll.options || []).reduce((sum: number, o: any) => sum + (o.votes || 0), 0)
          return (
            <motion.div key={poll.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-white border border-[#E9E7F5] shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0F1B3D]">{poll.question}</h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${poll.is_active ? 'bg-[#ECFBF5] text-[#18A878]' : 'bg-[#F8FAFC] text-[#8A93AE]'}`}>
                  {poll.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="space-y-2.5">
                {(poll.options || []).map((opt: any, oi: number) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0
                  return (
                    <button key={oi} onClick={() => handleVote(poll.id, oi)}
                      className="w-full p-3 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#18A878]/30 transition-all relative overflow-hidden text-left group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#18A878]/15 to-[#18A878]/5 transition-all" style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm text-[#536078] group-hover:text-[#0F1B3D] transition-colors">{opt.text || opt.label || opt.option}</span>
                        <span className="text-xs text-[#536078]">{pct > 0 ? `${pct}%` : ''}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="text-xs text-[#536078] mt-3">{totalVotes} votes</div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
