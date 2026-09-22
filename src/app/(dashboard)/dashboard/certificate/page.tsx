'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Download, Search, FileText, GraduationCap } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

interface Certificate {
  id: number
  user_id: number
  course_id: number
  certificate_number: string | null
  file_path: string | null
  issued_at: string | null
  status: string | null
  user?: { id: number; name: string; email?: string } | null
  course?: { id: number; title: string; slug?: string } | null
  created_at?: string | null
}

export default function CertificatePage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const res = await api.get(`/students/${user?.id ?? 0}/certificates`, { params: { per_page: 100 } })
        if (cancelled) return
        const data = res.data?.data?.data
        setCerts(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setError('Could not load certificates right now.')
        setCerts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const issuedCount = certs.filter(c => c.status === 'issued').length
  const pendingCount = certs.filter(c => c.status !== 'issued').length
  const studentCount = Array.from(new Set(certs.map(c => c.user?.name || '').filter(Boolean))).length
  const typeCount = Array.from(new Set(certs.map(c => c.course?.title || 'Course Completion'))).length
  const filtered = certs.filter(c => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      String(c.certificate_number || '').toLowerCase().includes(q) ||
      String(c.user?.name || '').toLowerCase().includes(q) ||
      String(c.course?.title || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Certificates</h1><p className="text-xs text-slate-400 mt-0.5">Certificates issued on the platform</p></div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Issued', value: issuedCount, icon: <Award className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Pending', value: pendingCount, icon: <FileText className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Students Certified', value: studentCount, icon: <GraduationCap className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
          { label: 'Courses', value: typeCount, icon: <Award className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, cert ID or course..." className="bg-white/5 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-amber-400/90 text-center py-12">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No certificates found.</p>
              <p className="text-xs text-slate-600 mt-1">Certificates appear here once a completed course has been issued its credential.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Cert ID</th>
                  <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Student</th>
                  <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Course</th>
                  <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Type</th>
                  <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Date</th>
                  <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Status</th>
                  <th className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 pr-2">Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map(c => {
                    const certDate = c.issued_at || c.created_at
                    const isIssued = (c.status || 'issued') === 'issued'
                    return (
                    <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 pr-2"><span className="text-[10px] font-mono text-[#10B981]">{c.certificate_number || `CERT-${String(c.id).padStart(3, '0')}`}</span></td>
                      <td className="py-2.5 pr-2"><p className="text-xs font-medium text-white">{c.user?.name || 'Student'}</p></td>
                      <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">{c.course?.title || 'Course'}</span></td>
                      <td className="py-2.5 pr-2"><span className="text-[10px] text-slate-400">Course Completion</span></td>
                      <td className="py-2.5 pr-2 text-center"><span className="text-[10px] text-slate-400">{certDate ? formatDate(certDate) : '—'}</span></td>
                      <td className="py-2.5 pr-2 text-center"><Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border', isIssued ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400')}>{isIssued ? 'Issued' : 'Pending'}</Badge></td>
                      <td className="py-2.5 pr-2 text-center">{isIssued ? (c.file_path ? <a href={c.file_path} target="_blank" rel="noreferrer" className="text-[10px] text-[#10B981] hover:text-emerald-300 transition-colors flex items-center gap-1 mx-auto"><Download className="w-3 h-3" /> PDF</a> : <span className="text-[10px] text-slate-500">—</span>) : <span className="text-[10px] text-slate-500">—</span>}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}