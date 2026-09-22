'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Calendar, FileText, Award, Search, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const exams = [
  { id: 1, title: 'Midterm Examination 2026', course: 'Computer Science 101', date: '2026-08-15', time: '10:00 AM - 12:00 PM', totalStudents: 45, passed: 38, status: 'completed' },
  { id: 2, title: 'Final Examination 2026', course: 'Data Structures', date: '2026-09-20', time: '02:00 PM - 05:00 PM', totalStudents: 38, passed: 0, status: 'upcoming' },
  { id: 3, title: 'Quiz 3', course: 'Algorithms', date: '2026-07-25', time: '11:00 AM - 12:00 PM', totalStudents: 42, passed: 40, status: 'completed' },
  { id: 4, title: 'Practical Exam', course: 'Physics Lab', date: '2026-08-05', time: '09:00 AM - 11:00 AM', totalStudents: 30, passed: 28, status: 'completed' },
  { id: 5, title: 'Class Test 2', course: 'Mathematics 201', date: '2026-07-30', time: '03:00 PM - 04:00 PM', totalStudents: 35, passed: 0, status: 'upcoming' },
  { id: 6, title: 'Term Final', course: 'English Literature', date: '2026-10-10', time: '10:00 AM - 01:00 PM', totalStudents: 28, passed: 0, status: 'upcoming' },
  { id: 7, title: 'Viva Voce', course: 'Thesis Project', date: '2026-08-25', time: '10:00 AM - 04:00 PM', totalStudents: 12, passed: 12, status: 'completed' },
  { id: 8, title: 'Makeup Exam', course: 'Calculus', date: '2026-09-05', time: '02:00 PM - 04:00 PM', totalStudents: 8, passed: 0, status: 'upcoming' },
]

export default function ExaminationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const filtered = exams.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.course.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk">Examinations</h1>
          <p className="text-xs text-slate-400 mt-0.5">Schedule and manage exams</p>
        </div>
        <GlassButton size="sm"><Plus className="w-3.5 h-3.5" /> Create Exam</GlassButton>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Exams', value: exams.length, icon: <FileText className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Upcoming', value: exams.filter(e => e.status === 'upcoming').length, icon: <Calendar className="w-4 h-4" />, color: 'from-[#FF8A36] to-orange-600' },
          { label: 'Completed', value: exams.filter(e => e.status === 'completed').length, icon: <CheckCircle className="w-4 h-4" />, color: 'from-[#10B981] to-emerald-600' },
          { label: 'Pass Rate', value: exams.filter(e => e.status === 'completed').length ? Math.round(exams.filter(e => e.status === 'completed').reduce((s, e) => s + (e.passed / e.totalStudents) * 100, 0) / exams.filter(e => e.status === 'completed').length) + '%' : '—', icon: <Award className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
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
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>
            {(['all', 'upcoming', 'completed'] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', statusFilter === f ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10')}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Exam</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Course</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Date & Time</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Students</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Passed</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-2"><p className="text-xs font-medium text-white">{e.title}</p></td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{e.course}</span></td>
                    <td className="py-2.5 pr-2"><p className="text-[10px] text-slate-300">{e.date}</p><p className="text-[9px] text-slate-500">{e.time}</p></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-xs text-slate-300">{e.totalStudents}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className={cn('text-xs font-medium', e.status === 'completed' ? 'text-emerald-400' : 'text-slate-500')}>{e.status === 'completed' ? e.passed : '—'}</span></td>
                    <td className="py-2.5 pr-2 text-center">
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', e.status === 'completed' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400')}>
                        {e.status === 'completed' ? <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> : <Clock className="w-2.5 h-2.5 mr-0.5" />}
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </Badge>
                    </td>
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
