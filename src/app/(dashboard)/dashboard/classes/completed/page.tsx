'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Play, Clock, Users, Star, Eye, Search, Loader2, Video } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { Class, ClassRecording2 } from '@/types'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function getThumbnailUrl(rec: ClassRecording2): string | null {
  if (rec.thumbnail) return rec.thumbnail
  if (rec.file_path) return `${API_BASE}/storage/${rec.file_path.replace(/^\/?storage\//, '')}`
  const ytMatch = rec.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`
  const vimeoMatch = rec.url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`
  return null
}

export default function CompletedClassesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [recordings, setRecordings] = useState<ClassRecording2[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'classes' | 'recordings'>('classes')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [clsRes, recRes] = await Promise.all([
        liveClassesAPI.getCompleted(),
        liveClassesAPI.getRecordings(),
      ])
      const c = clsRes.data?.data?.data ?? clsRes.data?.data ?? []; setClasses(Array.isArray(c) ? c : [])
      const r = recRes.data?.data?.data ?? recRes.data?.data ?? []; setRecordings(Array.isArray(r) ? r : [])
    } catch { setClasses([]); setRecordings([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const filtered = (tab === 'classes' ? classes : recordings).filter((item: any) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (item.title || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A5AEC2]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === 'classes' ? 'Search completed...' : 'Search recordings...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
        </div>
        <div className="flex gap-1 bg-[#F3F5FB] border border-[#E9E7F5] rounded-lg p-0.5">
          <button onClick={() => setTab('classes')} className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${tab === 'classes' ? 'bg-white text-[#572ECE] border border-[#572ECE]/25 shadow-sm' : 'text-[#8A93AE] hover:text-[#0F1B3D]'}`}>
            <FileText size={12} className="inline mr-1.5" />Classes
          </button>
          <button onClick={() => setTab('recordings')} className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${tab === 'recordings' ? 'bg-white text-[#572ECE] border border-[#572ECE]/25 shadow-sm' : 'text-[#8A93AE] hover:text-[#0F1B3D]'}`}>
            <Video size={12} className="inline mr-1.5" />Recordings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8A93AE] text-sm">No {tab === 'classes' ? 'completed classes' : 'recordings'} found</div>
      ) : tab === 'recordings' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(filtered as ClassRecording2[]).map(rec => {
            const thumb = getThumbnailUrl(rec)
            return (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-2xl bg-white border border-[#E9E7F5] shadow-sm hover:border-[#6D3DF5]/30 transition-all duration-300 overflow-hidden hover:shadow-[0_12px_40px_-12px_rgba(109,61,245,0.12)] hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              <a href={rec.url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden">
                {thumb ? (
                  <div className="aspect-video relative">
                    <img src={thumb} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/[0.02] transition-colors duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video relative bg-gradient-to-br from-[#F3EEFF] via-[#F3EEFF]/80 to-[#EEF4FF]/60">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(109,61,245,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(52,120,246,0.06) 0%, transparent 50%)' }} />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(15,27,61,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(15,27,61,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  </div>
                )}
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#572ECE] to-[#572ECE]/90 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-[0_4px_20px_rgba(87,46,206,0.25)] group-hover:shadow-[0_8px_30px_rgba(87,46,206,0.3)]">
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                </div>
                {/* Duration badge */}
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white/90 shadow-sm">
                  {Math.floor((rec.duration_seconds || 0) / 60)}:{(rec.duration_seconds || 0) % 60 < 10 ? '0' : ''}{(rec.duration_seconds || 0) % 60}
                </span>
              </a>

              {/* Body */}
              <div className="p-4 space-y-2">
                <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0F1B3D] hover:text-[#572ECE] transition-colors leading-tight truncate block">{rec.title}</a>
                {rec.description && (
                  <p className="text-[11px] text-[#536078] line-clamp-1 leading-relaxed">{rec.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-[#8A93AE]">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#572ECE]/60" />
                    {rec.size_mb}MB
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#F59E0B]/60" />
                    {rec.view_count || 0} views
                  </span>
                  {(rec as any).date && (
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#6D3DF5]/60" />
                      {(rec as any).date}
                    </span>
                  )}
                </div>
                <a href={rec.url} target="_blank" className="mt-1 flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-[#F0EAFF] border border-[#572ECE]/20 text-[#572ECE] text-xs font-bold hover:bg-[#F0EAFF]/80 hover:border-[#572ECE]/30 transition-all duration-200">
                  <Play size={12} /> Play Recording
                </a>
              </div>
            </motion.div>
            )})}
        </div>
      ) : (
        <div className="space-y-2">
          {(filtered as Class[]).map(cls => (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/20 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3EEFF] flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#6D3DF5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#0F1B3D]">{cls.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#536078] mt-1">
                    <span className="flex items-center gap-1"><Users size={11} />{cls.instructor?.name || '—'}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{cls.date} {cls.time}</span>
                    {cls.rating && <span className="flex items-center gap-1 text-[#F59E0B]"><Star size={11} />{cls.rating}</span>}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/classes/${cls.id}`) }} className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] text-[#536078] text-[11px] font-medium hover:text-[#0F1B3D] transition-colors">
                  <Eye size={12} className="inline mr-1" />View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
