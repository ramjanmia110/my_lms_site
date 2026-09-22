'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Search, Loader2, ExternalLink } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'

export default function ResourcesPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    liveClassesAPI.getClassResources(Number(params.id))
      .then(res => setResources(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false))
  }, [params.id])

  const filtered = resources.filter(r => {
    if (!search.trim()) return true
    return (r.title || '').toLowerCase().includes(search.toLowerCase())
  })

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A93AE]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No resources</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] hover:border-[#E4E8F2] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6D3DF5]/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#6D3DF5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#0F1B3D] truncate">{r.title}</div>
                  {r.type && <div className="text-xs text-[#536078] mt-0.5 uppercase">{r.type}</div>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a href={r.url || '#'} target="_blank"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#6D3DF5]/15 text-[#6D3DF5] text-xs font-medium hover:bg-[#6D3DF5]/25 transition-colors">
                  <ExternalLink size={12} /> View
                </a>
                <a href={r.url || '#'} download className="p-2 rounded-lg hover:bg-[#F3EEFF] text-[#536078] hover:text-[#6D3DF5] transition-colors">
                  <Download size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
