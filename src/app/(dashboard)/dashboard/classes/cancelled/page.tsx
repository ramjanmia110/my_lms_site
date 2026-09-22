'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, Loader2, Search, Trash2, Copy } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class } from '@/types'
import toast from 'react-hot-toast'

export default function CancelledClassesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await liveClassesAPI.getCancelled()
      const d = res.data?.data?.data ?? res.data?.data ?? []
      setClasses(Array.isArray(d) ? d : [])
    } catch { setClasses([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const filtered = classes.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return c.title?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cancelled..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/30 transition-colors" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <XCircle size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No cancelled classes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(cls => (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
              className="p-4 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.06] hover:border-red-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <XCircle size={16} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{cls.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cls.date} at {cls.time} &middot; {cls.instructor?.name || '—'}</p>
                </div>
                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { liveClassesAPI.duplicateClass(cls.id).then(() => toast.success('Duplicated!')).catch(() => toast.error('Failed')) }} className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400 transition-colors" title="Duplicate">
                    <Copy size={13} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this class?')) liveClassesAPI.delete(cls.id).then(() => { toast.success('Deleted'); fetchData() }).catch(() => toast.error('Failed')) }} className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
