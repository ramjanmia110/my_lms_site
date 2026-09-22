'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Star, Mail, Phone, Search, Plus, Filter } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const teachers = [
  { id: 1, name: 'Dr. Sarah Rahman', email: 'sarah@learn2earn.edu', phone: '+880 1712-345678', department: 'Computer Science', courses: 4, students: 120, rating: 4.8, status: 'active', subjects: ['Algorithms', 'Data Structures', 'Machine Learning'] },
  { id: 2, name: 'Prof. Kamal Hossain', email: 'kamal@learn2earn.edu', phone: '+880 1712-345679', department: 'Mathematics', courses: 3, students: 95, rating: 4.6, status: 'active', subjects: ['Calculus', 'Linear Algebra', 'Statistics'] },
  { id: 3, name: 'Ms. Fatima Begum', email: 'fatima@learn2earn.edu', phone: '+880 1712-345680', department: 'English', courses: 2, students: 78, rating: 4.9, status: 'active', subjects: ['Academic Writing', 'Literature'] },
  { id: 4, name: 'Mr. Rajib Ahmed', email: 'rajib@learn2earn.edu', phone: '+880 1712-345681', department: 'Physics', courses: 3, students: 88, rating: 4.5, status: 'on_leave', subjects: ['Mechanics', 'Electromagnetism'] },
  { id: 5, name: 'Dr. Nusrat Jahan', email: 'nusrat@learn2earn.edu', phone: '+880 1712-345682', department: 'Chemistry', courses: 2, students: 65, rating: 4.7, status: 'active', subjects: ['Organic Chemistry', 'Biochemistry'] },
  { id: 6, name: 'Prof. Hasan Mahmud', email: 'hasan@learn2earn.edu', phone: '+880 1712-345683', department: 'Economics', courses: 3, students: 102, rating: 4.4, status: 'inactive', subjects: ['Microeconomics', 'Macroeconomics'] },
]

export default function TeachersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all')
  const deptCount = Array.from(new Set(teachers.map(t => t.department))).length
  const filtered = teachers.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.department.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk">Teachers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage faculty and instructors</p>
        </div>
        <GlassButton size="sm"><Plus className="w-3.5 h-3.5" /> Add Teacher</GlassButton>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Teachers', value: teachers.length, icon: <Users className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Active', value: teachers.filter(t => t.status === 'active').length, icon: <Star className="w-4 h-4" />, color: 'from-[#10B981] to-emerald-600' },
          { label: 'On Leave', value: teachers.filter(t => t.status === 'on_leave').length, icon: <Mail className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Departments', value: deptCount, icon: <BookOpen className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div>
            </div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" />
            </div>
            {(['all', 'active', 'on_leave', 'inactive'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filter === f ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10')}>
                {f === 'all' ? 'All' : f === 'on_leave' ? 'On Leave' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Teacher</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Department</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Courses</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Students</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Rating</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-xs font-semibold shrink-0">{t.name.charAt(0)}</div>
                        <div><p className="text-xs font-medium text-white">{t.name}</p><p className="text-[9px] text-slate-400">{t.email}</p></div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{t.department}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-xs text-slate-300">{t.courses}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-xs text-slate-300">{t.students}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="inline-flex items-center gap-1 text-xs"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{t.rating}</span></td>
                    <td className="py-2.5 pr-2 text-center">
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', t.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : t.status === 'on_leave' ? 'border-amber-500/30 text-amber-400' : 'border-slate-500/30 text-slate-400')}>
                        {t.status === 'on_leave' ? 'On Leave' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
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
