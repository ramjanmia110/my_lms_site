'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Search, Sparkles } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const events = [
  { id: 1, title: 'AI in Education Workshop', date: '2026-07-18', time: '9:00 AM', venue: 'Conference Hall A', type: 'workshop', attendees: 45, desc: 'A 3-day workshop on integrating AI tools in modern teaching methodologies.' },
  { id: 2, title: 'Blood Donation Campaign', date: '2026-07-20', time: '10:00 AM', venue: 'Main Auditorium', type: 'campaign', attendees: 120, desc: 'Annual blood donation drive organized by the Student Welfare Society.' },
  { id: 3, title: 'Faculty Meeting', date: '2026-07-15', time: '2:00 PM', venue: 'Room 301', type: 'meeting', attendees: 30, desc: 'Monthly faculty meeting to discuss curriculum updates and student progress.' },
  { id: 4, title: 'Cultural Fest 2026', date: '2026-08-05', time: '10:00 AM', venue: 'University Ground', type: 'festival', attendees: 500, desc: 'Annual cultural festival featuring music, dance, art, and food stalls.' },
  { id: 5, title: 'Career Counseling Session', date: '2026-07-22', time: '11:00 AM', venue: 'Career Center', type: 'seminar', attendees: 60, desc: 'Career guidance session for final-year students with industry professionals.' },
  { id: 6, title: 'Science Olympiad', date: '2026-08-10', time: '8:00 AM', venue: 'Science Building', type: 'competition', attendees: 200, desc: 'Inter-university science competition with multiple categories.' },
]

const types = ['all', 'workshop', 'seminar', 'campaign', 'meeting', 'festival', 'competition'] as const

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const typeCount = Array.from(new Set(events.map(e => e.type))).length
  const filtered = events.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.venue.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Events</h1><p className="text-xs text-slate-400 mt-0.5">Upcoming campus events and activities</p></div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: events.length, icon: <Sparkles className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'This Month', value: events.filter(e => e.date.startsWith('2026-07')).length, icon: <Calendar className="w-4 h-4" />, color: 'from-[#10B981] to-emerald-600' },
          { label: 'Total Attendees', value: events.reduce((s, e) => s + e.attendees, 0), icon: <Users className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Categories', value: typeCount, icon: <Sparkles className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" />
        </div>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize', typeFilter === t ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10')}>{t}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(e => (
          <motion.div key={e.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline" className="text-[9px] border-white/[0.1] text-slate-400 capitalize">{e.type}</Badge>
              <div className="flex items-center gap-1 text-[10px] text-slate-500"><Users className="w-3 h-3" />{e.attendees}</div>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">{e.title}</h3>
            <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">{e.desc}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><Calendar className="w-3 h-3 text-[#10B981]" />{e.date}</div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><Clock className="w-3 h-3 text-[#10B981]" />{e.time}</div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><MapPin className="w-3 h-3 text-[#10B981]" />{e.venue}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
