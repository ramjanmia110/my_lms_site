'use client'
import { Calendar } from 'lucide-react'
import type { Class } from '@/types'

function generateIcs(c: Class): string {
  const parseTime = (dateStr: string, timeStr: string) => {
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
  }

  const start = parseTime(c.date, c.time)
  const durationMin = parseInt(c.duration || '60') || 60
  const end = new Date(start.getTime() + durationMin * 60000)

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Learn2Earn//Live Class//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${c.title}`,
    `DESCRIPTION:${c.category || 'Live'} class with ${c.instructor?.name || 'Instructor'}`,
    `LOCATION:${c.meeting_url || 'Online'}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

interface AddToCalendarProps { classItem: Class }

export function AddToCalendar({ classItem }: AddToCalendarProps) {
  const handleDownload = () => {
    const ics = generateIcs(classItem)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classItem.title.replace(/\s+/g, '_')}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  return (
    <button onClick={handleDownload}
      className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3.5 rounded-xl cursor-pointer"
      style={{ border: '1px solid #1f6f52', color: '#5eead4' }}>
      <Calendar size={14} /> Add to calendar
    </button>
  )
}
