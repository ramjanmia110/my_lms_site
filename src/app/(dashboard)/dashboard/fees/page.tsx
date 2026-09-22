'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CreditCard, TrendingUp, Users, Search, Plus, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { GlassButton } from '@/components/dashboard/GlassButton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const payments = [
  { id: 'INV-001', student: 'Rahim Karim', class: 'Class 10', fee: 'Tuition Fee', amount: 5500, date: '2026-07-01', method: 'bKash', status: 'paid' },
  { id: 'INV-002', student: 'Fatima Karim', class: 'Class 8', fee: 'Tuition Fee', amount: 4500, date: '2026-07-01', method: 'Nagad', status: 'paid' },
  { id: 'INV-003', student: 'Hasan Ahmed', class: 'Class 12', fee: 'Lab Fee', amount: 2000, date: '2026-07-05', method: 'Bank', status: 'paid' },
  { id: 'INV-004', student: 'Nusrat Islam', class: 'Class 9', fee: 'Tuition Fee', amount: 5000, date: '2026-07-10', method: 'bKash', status: 'pending' },
  { id: 'INV-005', student: 'Tanvir Ahammed', class: 'Class 11', fee: 'Admission Fee', amount: 8000, date: '2026-07-15', method: 'Cash', status: 'overdue' },
  { id: 'INV-006', student: 'Sumaiya Rahman', class: 'Class 7', fee: 'Tuition Fee', amount: 4000, date: '2026-07-20', method: 'Rocket', status: 'pending' },
  { id: 'INV-007', student: 'Jamil Rahman', class: 'Class 5', fee: 'Transport Fee', amount: 1500, date: '2026-07-01', method: 'bKash', status: 'paid' },
  { id: 'INV-008', student: 'Rafiul Islam', class: 'Class 6', fee: 'Tuition Fee', amount: 3500, date: '2026-07-25', method: 'Bank', status: 'overdue' },
]

export default function FeesPage() {
  const [search, setSearch] = useState('')
  const filtered = payments.filter(p => !search || p.student.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Fees Collection</h1><p className="text-xs text-slate-400 mt-0.5">Manage tuition and fee payments</p></div>
        <div className="flex gap-2"><GlassButton variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /> Export</GlassButton><GlassButton size="sm"><Plus className="w-3.5 h-3.5" /> Record Payment</GlassButton></div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Collected', value: `৳${totalCollected.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Pending', value: `৳${totalPending.toLocaleString()}`, icon: <Clock className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Transactions', value: payments.length, icon: <CreditCard className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
          { label: 'Collection Rate', value: payments.length ? `${Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)}%` : '—', icon: <TrendingUp className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or invoice..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Invoice</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Student</th>
                <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Fee Type</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Amount</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Date</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Method</th>
                <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-2"><span className="text-[10px] font-mono text-[#10B981]">{p.id}</span></td>
                    <td className="py-2.5 pr-2"><p className="text-xs text-white">{p.student}</p><p className="text-[9px] text-slate-500">{p.class}</p></td>
                    <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{p.fee}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-xs font-semibold text-white">৳{p.amount.toLocaleString()}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-slate-400">{p.date}</span></td>
                    <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-slate-400">{p.method}</span></td>
                    <td className="py-2.5 pr-2 text-center">
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', p.status === 'paid' ? 'border-emerald-500/30 text-emerald-400' : p.status === 'pending' ? 'border-amber-500/30 text-amber-400' : 'border-red-500/30 text-red-400')}>
                        {p.status === 'paid' ? <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> : p.status === 'pending' ? <Clock className="w-2.5 h-2.5 mr-0.5" /> : <XCircle className="w-2.5 h-2.5 mr-0.5" />}
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
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
