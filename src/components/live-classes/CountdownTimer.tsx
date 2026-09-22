'use client'

import { useState, useEffect } from 'react'

function formatCountdown(ms: number) {
  if (ms <= 0) return 'starting now'
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function formatDateTime(d: Date) {
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function parseClassDateTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
}

export function CountdownTimer({ date, time }: { date: string; time: string }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    const tick = () => {
      const target = parseClassDateTime(date, time).getTime()
      const diff = target - Date.now()
      setDisplay(formatCountdown(diff))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date, time])

  return <span className="font-mono tabular-nums">{display}</span>
}
