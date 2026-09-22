'use client'

import { useState, useEffect } from 'react'
import type { Class } from '@/types'

function parseClassDateTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
}

export function useClassStatus(cls: Class): 'live' | 'upcoming' | 'past' {
  const [status, setStatus] = useState<'live' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    function compute() {
      const start = parseClassDateTime(cls.date, cls.time).getTime()
      const durationMin = parseInt(cls.duration || '60') || 60
      const end = start + durationMin * 60000
      const now = Date.now()
      if (now >= start && now <= end) return 'live'
      if (now < start) return 'upcoming'
      return 'past'
    }
    setStatus(compute())
    const id = setInterval(() => setStatus(compute()), 15000)
    return () => clearInterval(id)
  }, [cls.date, cls.time, cls.duration])

  return status
}
