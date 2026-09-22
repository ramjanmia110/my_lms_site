'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Clock, Video, Loader2, Award, Calendar, ChevronRight, Target } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface AnalyticsData {
  total_classes: number
  total_hours: number
  total_participants: number
  avg_attendance: number
  completion_rate: number
  total_recordings: number
  top_classes: { id: number; title: string; attendance: number; rating: number }[]
  weekly_trend: { week: string; count: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [range, setRange] = useState('month')

  useEffect(() => {
    setLoading(true)
    liveClassesAPI.getAnalytics({ range })
      .then(res => setData(res.data?.data ?? res.data ?? null))
      .catch(() => { setData(null); toast.error('Failed to load analytics') })
      .finally(() => setLoading(false))
  }, [range])

  const cards = [
    { label: 'Total Classes', value: data?.total_classes ?? 0, icon: Calendar, color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]', route: '/dashboard/classes' },
    { label: 'Total Hours', value: data?.total_hours ?? 0, suffix: 'h', icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#FEF5E7]', route: '' },
    { label: 'Participants', value: data?.total_participants ?? 0, icon: Users, color: 'text-[#572ECE]', bg: 'bg-[#F0EAFF]', route: '/dashboard/classes/upcoming' },
    { label: 'Avg Attendance', value: data?.avg_attendance ?? 0, suffix: '%', icon: Target, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]', route: '' },
    { label: 'Completion Rate', value: data?.completion_rate ?? 0, suffix: '%', icon: Award, color: 'text-[#F59E0B]', bg: 'bg-[#FEF5E7]', route: '/dashboard/classes/completed' },
    { label: 'Recordings', value: data?.total_recordings ?? 0, icon: Video, color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]', route: '/dashboard/classes/recordings' },
  ]

  const maxTrend = Math.max(...(data?.weekly_trend ?? []).map(w => w.count), 1)

  return (
    <div className="space-y-4 bg-[#F8F6FF] min-h-screen p-4">
      {/* Range selector */}
      <div className="flex gap-1 bg-[#F3EEFF]/50 rounded-lg p-0.5 w-fit">
        {['week', 'month', 'quarter', 'year'].map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${range === r ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D]'}`}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#536078]" /></div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div key={card.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => { if (card.route) router.push(card.route) }}
                  className={`p-4 rounded-xl bg-white border border-[#E9E7F5] ${card.route ? 'cursor-pointer hover:border-[#6D3DF5]/30 hover:shadow-md' : ''} transition-all`}
                >
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2.5`}>
                    <Icon size={16} className={card.color} />
                  </div>
                  <div className="text-xl font-bold text-[#0F1B3D]">{card.value}{card.suffix || ''}</div>
                  <div className="text-[11px] text-[#536078] mt-0.5">{card.label}</div>
                </motion.div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Weekly Trend Chart */}
            <div className="p-5 rounded-xl bg-white border border-[#E9E7F5]">
              <h3 className="text-sm font-bold text-[#0F1B3D] mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-[#572ECE]" />
                {range.charAt(0).toUpperCase() + range.slice(1)}ly Trend
              </h3>
              {(data.weekly_trend ?? []).length > 0 ? (
                <div className="relative h-32">
                  <div className="absolute inset-0 flex items-end gap-1.5">
                    {(data.weekly_trend ?? []).map((w, i) => {
                      const pct = (w.count / maxTrend) * 100
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className="w-full rounded-md bg-gradient-to-t from-[#572ECE]/50 to-[#F0EAFF] hover:from-[#572ECE]/70 transition-all relative"
                            style={{ height: `${Math.max(pct, 5)}%` }}
                          >
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#572ECE] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {w.count}
                            </div>
                          </div>
                          <span className="text-[8px] text-[#536078] truncate w-full text-center">{w.week}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#536078] text-center py-8">No trend data available</div>
              )}
            </div>

            {/* Top Classes */}
            <div className="p-5 rounded-xl bg-white border border-[#E9E7F5]">
              <h3 className="text-sm font-bold text-[#0F1B3D] mb-4 flex items-center gap-2">
                <Award size={15} className="text-[#F59E0B]" />
                Top Classes
              </h3>
              {(data.top_classes ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(data.top_classes ?? []).slice(0, 5).map((cls, i) => {
                    const pct = cls.attendance || 0
                    return (
                      <div key={cls.id} onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-[#F3EEFF]/50 rounded-lg px-2 -mx-2 py-1.5 transition-colors"
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-[#FEF5E7] text-[#F59E0B]' : 'bg-[#F3EEFF]/50 text-[#536078]'}`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#0F1B3D] truncate hover:text-[#572ECE] transition-colors">{cls.title}</div>
                          <div className="w-full h-1 rounded-full bg-[#E9E7F5] mt-1 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#572ECE] to-[#3478F6]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#572ECE] font-semibold">{pct}%</span>
                          {cls.rating > 0 && <span className="text-[10px] text-[#F59E0B]">{'★'.repeat(Math.round(cls.rating))}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-[#536078] text-center py-8">No class data yet</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Loader2 size={20} className="animate-spin text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">Analytics data unavailable</p>
        </div>
      )}
    </div>
  )
}
