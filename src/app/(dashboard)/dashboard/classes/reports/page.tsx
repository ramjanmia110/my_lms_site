'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2, Calendar, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface ReportItem {
  id: number
  title: string
  type: string
  date: string
  metrics: { label: string; value: string | number }[]
  status?: string
}

const typeConfig: Record<string, { color: string; bg: string }> = {
  attendance: { color: 'text-[#6D3DF5]', bg: 'bg-[#F3EEFF]' },
  recordings: { color: 'text-[#E5484D]', bg: 'bg-[#FEE8E8]' },
  history: { color: 'text-[#3478F6]', bg: 'bg-[#EEF4FF]' },
  performance: { color: 'text-[#572ECE]', bg: 'bg-[#F0EAFF]' },
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [type, setType] = useState('attendance')

  useEffect(() => {
    setLoading(true)
    const fetcher = type === 'attendance' ? liveClassesAPI.getReports.attendance()
      : type === 'recordings' ? liveClassesAPI.getReports.recordings()
      : type === 'history' ? liveClassesAPI.getReports.history()
      : liveClassesAPI.getReports.performance()
    fetcher.then(res => { const d = res.data?.data?.data ?? res.data?.data ?? []; setReports(Array.isArray(d) ? d : []) })
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [type])

  const handleDownload = async (reportId: number, format: string) => {
    setGenerating(`${reportId}-${format}`)
    try {
      const res = await liveClassesAPI.exportClass(reportId, format)
      const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `report-${reportId}.${format}`
      a.click(); URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} downloaded`)
    } catch { toast.error('Download failed') } finally { setGenerating(null) }
  }

  const cfg = typeConfig[type] || typeConfig.attendance

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-[#F3EEFF]/50 rounded-lg p-0.5">
          {['attendance', 'recordings', 'history', 'performance'].map(k => (
            <button key={k} onClick={() => setType(k)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border ${type === k ? 'bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm' : 'text-[#536078] hover:text-[#0F1B3D] border-transparent'}`}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[#536078]">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#536078]" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No reports available for {type}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rpt, i) => (
            <motion.div key={rpt.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-5 rounded-xl bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <FileText size={16} className={cfg.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1B3D]">{rpt.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#536078] mt-0.5">
                      <span className="flex items-center gap-1"><Calendar size={10} />{rpt.date}</span>
                      <span>&middot;</span>
                      <span className={`capitalize ${cfg.color}`}>{rpt.type || type}</span>
                      {rpt.status && (
                        <>
                          <span>&middot;</span>
                          <span className={`flex items-center gap-1 ${rpt.status === 'completed' ? 'text-[#572ECE]' : 'text-[#536078]'}`}>
                            {rpt.status === 'completed' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {rpt.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleDownload(rpt.id, 'csv')} disabled={generating === `${rpt.id}-csv`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] text-[11px] font-medium hover:text-[#0F1B3D] transition-colors disabled:opacity-50">
                    {generating === `${rpt.id}-csv` ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />} CSV
                  </button>
                  <button onClick={() => handleDownload(rpt.id, 'pdf')} disabled={generating === `${rpt.id}-pdf`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-[11px] font-semibold hover:opacity-90 transition-colors disabled:opacity-50">
                    {generating === `${rpt.id}-pdf` ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />} PDF
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {rpt.metrics.map(m => (
                  <div key={m.label} className="p-3 rounded-lg bg-[#F3EEFF]/30 border border-[#E9E7F5]">
                    <div className="text-lg font-bold text-[#0F1B3D]">{m.value}</div>
                    <div className="text-[10px] text-[#536078] mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
