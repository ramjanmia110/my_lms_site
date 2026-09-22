'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, CheckCircle, XCircle, Clock, Search, Plus, AlertCircle } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const leaves = [
  { id: 1, teacher: 'Dr. Sarah Rahman', type: 'Sick Leave', from: '2026-08-01', to: '2026-08-03', days: 3, reason: 'Medical treatment', status: 'approved' },
  { id: 2, teacher: 'Prof. Kamal Hossain', type: 'Annual Leave', from: '2026-08-10', to: '2026-08-14', days: 5, reason: 'Family vacation', status: 'pending' },
  { id: 3, teacher: 'Ms. Fatima Begum', type: 'Personal Leave', from: '2026-07-25', to: '2026-07-25', days: 1, reason: 'Personal matter', status: 'approved' },
  { id: 4, teacher: 'Mr. Rajib Ahmed', type: 'Medical Leave', from: '2026-08-15', to: '2026-08-20', days: 6, reason: 'Surgery recovery', status: 'approved' },
  { id: 5, teacher: 'Dr. Nusrat Jahan', type: 'Maternity Leave', from: '2026-09-01', to: '2026-11-30', days: 90, reason: 'Maternity', status: 'approved' },
  { id: 6, teacher: 'Prof. Hasan Mahmud', type: 'Emergency Leave', from: '2026-07-20', to: '2026-07-22', days: 3, reason: 'Family emergency', status: 'rejected' },
  { id: 7, teacher: 'Mrs. Shahana Parvin', type: 'Sick Leave', from: '2026-08-05', to: '2026-08-06', days: 2, reason: 'Fever', status: 'pending' },
]

export default function LeavesPage() {
  const [search, setSearch] = useState('')
  const filtered = leaves.filter(l => !search || l.teacher.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Leaves</h1><p className="text-xs text-slate-400 mt-0.5">Manage staff leave requests</p></div>
        <GlassButton size="sm"><Plus className="w-3.5 h-3.5" /> Apply Leave</GlassButton>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: leaves.length, icon: <Calendar className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, icon: <CheckCircle className="w-4 h-4" />, color: 'from-[#10B981] to-emerald-600' },
          { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, icon: <Clock className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, icon: <XCircle className="w-4 h-4" />, color: 'from-red-500 to-rose-600' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Staff</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Type</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Duration</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Days</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Reason</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-2"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">{l.teacher.charAt(0)}</div><p className="text-xs font-medium text-white">{l.teacher}</p></div></td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{l.type}</span></td>
                    <td className="py-2.5 pr-2"><p className="text-[10px] text-slate-300">{l.from}</p><p className="text-[9px] text-slate-500">to {l.to}</p></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-xs font-semibold text-white">{l.days}d</span></td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{l.reason}</span></td>
                    <td className="py-2.5 pr-2 text-center">
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', l.status === 'approved' ? 'border-emerald-500/30 text-emerald-400' : l.status === 'pending' ? 'border-amber-500/30 text-amber-400' : 'border-red-500/30 text-red-400')}>
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
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
