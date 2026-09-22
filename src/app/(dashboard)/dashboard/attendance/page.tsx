'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const records = [
  { id: 1, student: 'Rahim Karim', class: 'Class 10', date: '2026-07-10', status: 'present', time: '08:55 AM' },
  { id: 2, student: 'Fatima Karim', class: 'Class 8', date: '2026-07-10', status: 'present', time: '08:50 AM' },
  { id: 3, student: 'Hasan Ahmed', class: 'Class 12', date: '2026-07-10', status: 'absent', time: '—' },
  { id: 4, student: 'Nusrat Islam', class: 'Class 9', date: '2026-07-10', status: 'late', time: '09:15 AM' },
  { id: 5, student: 'Tanvir Ahammed', class: 'Class 11', date: '2026-07-10', status: 'present', time: '08:45 AM' },
  { id: 6, student: 'Sumaiya Rahman', class: 'Class 7', date: '2026-07-10', status: 'absent', time: '—' },
  { id: 7, student: 'Jamil Rahman', class: 'Class 5', date: '2026-07-10', status: 'present', time: '08:52 AM' },
  { id: 8, student: 'Rafiul Islam', class: 'Class 6', date: '2026-07-10', status: 'present', time: '08:48 AM' },
  { id: 9, student: 'Ayesha Rahman', class: 'Class 4', date: '2026-07-10', status: 'late', time: '09:05 AM' },
  { id: 10, student: 'Kabir Islam', class: 'Class 9', date: '2026-07-10', status: 'present', time: '08:55 AM' },
]

export default function AttendancePage() {
  const [search, setSearch] = useState('')
  const filtered = records.filter(r => !search || r.student.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Attendance</h1><p className="text-xs text-slate-400 mt-0.5">Track daily student attendance</p></div>
        <GlassButton size="sm"><Calendar className="w-3.5 h-3.5" /> Mark Attendance</GlassButton>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: records.length, icon: <Users className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Present', value: records.filter(r => r.status === 'present').length, icon: <CheckCircle className="w-4 h-4" />, color: 'from-[#10B981] to-emerald-600' },
          { label: 'Absent', value: records.filter(r => r.status === 'absent').length, icon: <XCircle className="w-4 h-4" />, color: 'from-red-500 to-rose-600' },
          { label: 'Late', value: records.filter(r => r.status === 'late').length, icon: <Clock className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>
            <Badge variant="outline" className="border-white/[0.1] text-slate-400"><Calendar className="w-3 h-3 text-[#10B981] mr-1" /> 10 July 2026</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Student</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Class</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Time</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-2"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">{r.student.charAt(0)}</div><p className="text-xs font-medium text-white">{r.student}</p></div></td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{r.class}</span></td>
                    <td className="py-2.5 pr-2 text-center">
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', r.status === 'present' ? 'border-emerald-500/30 text-emerald-400' : r.status === 'absent' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-400')}>
                        {r.status === 'present' ? <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> : r.status === 'absent' ? <XCircle className="w-2.5 h-2.5 mr-0.5" /> : <Clock className="w-2.5 h-2.5 mr-0.5" />}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-slate-400">{r.time}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
