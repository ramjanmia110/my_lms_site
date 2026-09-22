'use client'

import { motion } from 'framer-motion'
import type { Class } from '@/types'

interface StatCardsProps {
  classes: Class[]
  loading: boolean
}

function parseClassDateTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
}

export function StatCards({ classes, loading }: StatCardsProps) {
  const now = Date.now()
  const total = classes.length

  const upcoming = classes.filter(c => {
    const start = parseClassDateTime(c.date, c.time).getTime()
    return start > now
  }).length

  const liveNow = classes.filter(c => {
    const start = parseClassDateTime(c.date, c.time).getTime()
    const durationMin = parseInt(c.duration || '60') || 60
    return start <= now && start + durationMin * 60000 >= now
  }).length

  const past = classes.filter(c => {
    const start = parseClassDateTime(c.date, c.time).getTime()
    const durationMin = parseInt(c.duration || '60') || 60
    return start + durationMin * 60000 < now
  }).length

  const stats = [
    { label: 'Total', value: total, color: '#f2fbf6' },
    { label: 'Upcoming', value: upcoming, color: '#34d399' },
    { label: 'Live now', value: liveNow, color: '#f87171' },
    { label: 'Past', value: past, color: '#f2fbf6' },
  ]

  if (loading) {
    return (
      <div className="flex gap-3 mb-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 bg-[#0c231c] border border-[#163a2d] rounded-xl p-4 text-center animate-pulse">
            <div className="h-7 w-12 bg-[#163a2d] rounded mx-auto mb-2" />
            <div className="h-4 w-16 bg-[#163a2d] rounded mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex-1 bg-[#0c231c] border border-[#163a2d] rounded-xl py-4 px-3 text-center"
        >
          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          <div className="text-xs text-[#9cb8ab] mt-1">{s.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
