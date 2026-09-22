'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Search, Download, Trash2, Loader2, Clock, LayoutGrid, List, SortAsc, Calendar, Plus, X, Upload, Link, FileVideo, Tag, Eye, EyeOff, ChevronDown, Edit3, HardDrive, Film, Camera } from 'lucide-react'
import { liveClassesAPI, enrollmentAPI } from '@/lib/api'
import type { ClassRecording2, Class } from '@/types'
import RecordingPlayerModal from '@/components/live-classes/RecordingPlayerModal'
import toast from 'react-hot-toast'

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatSize(mb: number | null): string {
  if (!mb) return '—'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${Math.round(mb)} MB`
}

function extractError(err: any, fallback: string): string {
  const data = err?.response?.data
  if (data?.meta?.errors) {
    return Object.values(data.meta.errors).flat().map(String).join(', ')
  }
  return data?.message || data?.error || err?.message || fallback
}

function validateVideoUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (yt && yt[1].length !== 11) return 'YouTube video ID looks invalid — it must be exactly 11 characters (e.g. hQAHSlTtcmY)'
  return null
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function getThumbnailUrl(rec: ClassRecording2): string | null {
  if (rec.thumbnail) {
    if (/^(https?:|data:|blob:)/i.test(rec.thumbnail)) return rec.thumbnail
    return `${API_BASE}/storage/${rec.thumbnail.replace(/^\/?storage\//, '')}`
  }
  if (rec.file_path) return `${API_BASE}/storage/${rec.file_path.replace(/^\/?storage\//, '')}`
  const ytMatch = rec.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`
  const vimeoMatch = rec.url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`
  return null
}

function getDownloadUrl(rec: ClassRecording2): string {
  return `${API_BASE}/api/live-classes/recordings/${rec.id}/download`
}

function getDownloadFilename(rec: ClassRecording2): string {
  const base = (rec.title || 'recording').replace(/[^a-zA-Z0-9-_ ]+/g, '').trim().replace(/\s+/g, '_') || 'recording'
  if (rec.file_path) {
    const ext = (rec.file_path.split(/[?#]/)[0].split('.').pop() || 'mp4').toLowerCase()
    return `${base}.${ext}`
  }
  const ext = (rec.url.split(/[?#]/)[0].split('.').pop() || '').toLowerCase()
  return `${base}.${ext || 'mp4'}`
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function todayInput(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDateInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DEFAULT_FORM = { title: '', url: '', description: '', duration_minutes: 30, size_mb: 0, class_id: 0, is_public: true, date: todayInput() }

function saveBlob(blob: Blob, rec: ClassRecording2) {
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = getDownloadFilename(rec)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)
}

async function handleDownload(rec: ClassRecording2) {
  const url = getDownloadUrl(rec)
  const toastId = toast.loading('Preparing download...')
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(url, { mode: 'cors', headers })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || `Download failed (HTTP ${res.status})`)
    }
    const total = Number(res.headers.get('Content-Length')) || 0
    const reader = res.body?.getReader()
    if (!reader) {
      const blob = await res.blob()
      saveBlob(blob, rec)
      toast.success(`Download complete (${formatBytes(blob.size)})`, { id: toastId })
      return
    }
    const chunks: BlobPart[] = []
    let received = 0
    let lastUpdate = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        received += value.length
        const now = Date.now()
        if (total > 0 && now - lastUpdate > 150) {
          lastUpdate = now
          toast.loading(`Downloading ${Math.min(100, Math.round((received / total) * 100))}%`, { id: toastId })
        }
      }
    }
    const blob = new Blob(chunks, { type: res.headers.get('Content-Type') || 'application/octet-stream' })
    saveBlob(blob, rec)
    toast.success(`Download complete (${formatBytes(blob.size)})`, { id: toastId })
  } catch (err: any) {
    toast.error(err?.message || 'Download failed', { id: toastId })
  }
}

export default function RecordingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#6D3DF5] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RecordingsContent />
    </Suspense>
  )
}

function RecordingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classFilterId = searchParams.get('class_id')
  const [loading, setLoading] = useState(true)
  const [recordings, setRecordings] = useState<ClassRecording2[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'date' | 'title' | 'duration'>('date')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editRec, setEditRec] = useState<ClassRecording2 | null>(null)
  const [playingRec, setPlayingRec] = useState<ClassRecording2 | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [autoThumb, setAutoThumb] = useState<string | null>(null)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [classesList, setClassesList] = useState<Class[]>([])
  const [showClassDropdown, setShowClassDropdown] = useState(false)

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))
  const formRef = useRef(form)
  formRef.current = form

  const probeDirectVideo = useCallback(async (url: string, need: { needDur: boolean; needSize: boolean; needThumb: boolean }) => {
    if (need.needSize) {
      try {
        const head = await fetch(url, { method: 'HEAD', mode: 'cors' })
        const len = Number(head.headers.get('Content-Length'))
        if (head.ok && len > 0) update('size_mb', Number((len / (1024 * 1024)).toFixed(1)))
      } catch { /* silent fail */ }
    }
    const probe = (cross: boolean) => new Promise<boolean>(resolve => {
      const video = document.createElement('video')
      if (cross) video.crossOrigin = 'anonymous'
      video.preload = need.needThumb ? 'auto' : 'metadata'
      let settled = false
      const finish = (ok: boolean) => { if (!settled) { settled = true; resolve(ok) } }
      video.onloadedmetadata = () => {
        if (need.needDur && video.duration && isFinite(video.duration)) {
          update('duration_minutes', Math.max(1, Math.ceil(video.duration / 60)))
        }
        if (!need.needThumb) { finish(true); return }
        try {
          video.currentTime = Math.min(video.duration || 0, 1)
          video.onseeked = () => {
            try {
              const canvas = document.createElement('canvas')
              const w = Math.min(video.videoWidth || 640, 640)
              const h = Math.round(w * (video.videoHeight && video.videoWidth ? video.videoHeight / video.videoWidth : 9 / 16))
              canvas.width = w
              canvas.height = h
              canvas.getContext('2d')?.drawImage(video, 0, 0, w, h)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
              if (dataUrl && dataUrl.length > 100) { setAutoThumb(dataUrl); setThumbnailPreview(dataUrl) }
            } catch { /* silent fail */ }
            finish(true)
          }
        } catch { finish(true) }
      }
      video.onerror = () => finish(false)
      video.src = url
    })
    const corsOk = await probe(true)
    if (!corsOk && need.needDur) await probe(false)
  }, [update])

  const autoFillFromUrl = useCallback(async (url: string, warn = false) => {
    if (!url.trim()) return
    setFetchingMeta(true)
    const isDirect = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?|#|$)/i.test(url.trim())
    try {
      const res = await liveClassesAPI.getRecordingMetadata(url.trim())
      const d = res.data?.data
      if (d) {
        if (typeof d.title === 'string' && d.title && !formRef.current.title.trim()) update('title', d.title)
        if (typeof d.duration_seconds === 'number' && d.duration_seconds > 0) {
          update('duration_minutes', Number((d.duration_seconds / 60).toFixed(2)))
        }
        if (typeof d.size_mb === 'number' && d.size_mb > 0) update('size_mb', d.size_mb)
        if (typeof d.thumbnail === 'string' && d.thumbnail) { setAutoThumb(d.thumbnail); setThumbnailPreview(d.thumbnail) }
      }
      if (isDirect) {
        const needDur = !(d && typeof d.duration_seconds === 'number' && d.duration_seconds > 0)
        const needSize = !(d && typeof d.size_mb === 'number' && d.size_mb > 0)
        const needThumb = !(d && typeof d.thumbnail === 'string' && d.thumbnail)
        if (needDur || needSize || needThumb) await probeDirectVideo(url.trim(), { needDur, needSize, needThumb })
      }
    } catch {
      if (isDirect) await probeDirectVideo(url.trim(), { needDur: true, needSize: true, needThumb: true })
      else if (warn) toast.error('Could not read video info from this URL. Check the link or enter Duration / Size manually.')
    } finally { setFetchingMeta(false) }
  }, [probeDirectVideo])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setShowClassDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUrlBlur = () => {
    autoFillFromUrl(form.url, true)
  }

  useEffect(() => {
    if (!form.url.trim()) return
    const t = setTimeout(() => autoFillFromUrl(form.url), 900)
    return () => clearTimeout(t)
  }, [form.url])

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.url.trim()) { toast.error('Video URL is required'); return }
    const urlErr = validateVideoUrl(form.url)
    if (urlErr) { toast.error(urlErr); return }
    if (!form.class_id) { toast.error('Please select a class'); return }
    setSaving(true)
    try {
      const file = fileRef.current?.files?.[0]
      const payload: Record<string, any> = {
        title: form.title,
        url: form.url,
        description: form.description,
        duration_minutes: form.duration_minutes,
        size_mb: form.size_mb,
        class_id: form.class_id,
        is_public: form.is_public,
        date: form.date,
      }
      if (file) payload.thumbnail = await readFileAsDataURL(file)
      else if (autoThumb) payload.thumbnail = autoThumb
      await liveClassesAPI.createRecording(payload)
      toast.success('Recording created')
      setShowCreate(false)
      setForm({ ...DEFAULT_FORM })
      setThumbnailPreview(null)
      setAutoThumb(null)
      fetchData()
    } catch (err: any) {
      const msg = extractError(err, 'Failed to create recording')
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.url.trim()) { toast.error('Video URL is required'); return }
    const urlErr = validateVideoUrl(form.url)
    if (urlErr) { toast.error(urlErr); return }
    if (!form.class_id) { toast.error('Please select a class'); return }
    if (!editRec) return
    setSaving(true)
    try {
      const file = fileRef.current?.files?.[0]
      const payload: Record<string, any> = {
        title: form.title,
        url: form.url,
        description: form.description,
        duration_minutes: form.duration_minutes,
        size_mb: form.size_mb,
        class_id: form.class_id,
        is_public: form.is_public,
        date: form.date,
      }
      if (file) payload.thumbnail = await readFileAsDataURL(file)
      else if (autoThumb) payload.thumbnail = autoThumb
      await liveClassesAPI.updateRecording(editRec.id, payload)
      toast.success('Recording updated')
      setShowEdit(false)
      setEditRec(null)
      setForm({ ...DEFAULT_FORM })
      setThumbnailPreview(null)
      setAutoThumb(null)
      fetchData()
    } catch (err: any) {
      const msg = extractError(err, 'Failed to update recording')
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const openEdit = (rec: ClassRecording2) => {
    refreshClasses()
    setEditRec(rec)
    setForm({
      title: rec.title,
      url: rec.url,
      description: rec.description || '',
      duration_minutes: Math.ceil((rec.duration_seconds || 0) / 60),
      size_mb: rec.size_mb || 0,
      class_id: rec.class_id,
      is_public: rec.is_public,
      date: rec.created_at ? toDateInput(rec.created_at) : todayInput(),
    })
    setThumbnailPreview(getThumbnailUrl(rec))
    setAutoThumb(null)
    setShowEdit(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setThumbnailPreview(URL.createObjectURL(file)); setAutoThumb(null) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [recRes, clsRes] = await Promise.all([
        liveClassesAPI.getRecordings({ per_page: 50 }),
        liveClassesAPI.getAll({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
      ])
      const d = recRes.data?.data?.data ?? recRes.data?.data ?? []; setRecordings(Array.isArray(d) ? d : [])
      const c = clsRes.data?.data?.data ?? clsRes.data?.data ?? []; setClassesList(Array.isArray(c) ? c : [])
    } catch { setRecordings([]); setClassesList([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const refreshClasses = async () => {
    try {
      const res = await liveClassesAPI.getAll({ per_page: 100 })
      const c = res.data?.data?.data ?? res.data?.data ?? []
      setClassesList(Array.isArray(c) ? c : [])
    } catch { /* keep current list */ }
  }

  let filtered = recordings.filter(r => {
    if (classFilterId) {
      const id = Number(classFilterId)
      if (id && r.class_id !== id) return false
    }
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  })

  filtered.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    if (sort === 'duration') return (b.duration_seconds || 0) - (a.duration_seconds || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536078]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recordings..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-white border border-[#E9E7F5] text-sm text-[#0F1B3D] placeholder:text-[#536078]/60 focus:outline-none focus:border-[#6D3DF5]/40 focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => { refreshClasses(); setShowCreate(true) }}
            className="flex h-9 items-center gap-1.5 px-4 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-sm font-semibold hover:from-[#5C2ED5] hover:to-[#2D6AE0] transition-all shadow-[0_2px_10px_rgba(109,61,245,0.3)]">
            <Plus size={15} /> Create Recording
          </button>
          <div className="flex items-center gap-0.5 bg-white rounded-xl p-0.5 border border-[#E9E7F5]">
            <button onClick={() => setViewMode('grid')} className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`} title="Grid view">
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`} title="List view">
              <List size={14} />
            </button>
          </div>
          <div className="flex items-center gap-0.5 bg-white rounded-xl p-0.5 border border-[#E9E7F5]">
            <button onClick={() => setSort('date')} className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sort === 'date' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}>
              <SortAsc size={12} /> Date
            </button>
            <button onClick={() => setSort('title')} className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sort === 'title' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}>
              <SortAsc size={12} /> Title
            </button>
            <button onClick={() => setSort('duration')} className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sort === 'duration' ? 'bg-[#F3EEFF] text-[#6D3DF5]' : 'text-[#536078] hover:text-[#0F1B3D]'}`}>
              <SortAsc size={12} /> Duration
            </button>
          </div>
        </div>
      </div>

      {classFilterId && (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#F0EAFF] border border-[#572ECE]/20 text-xs">
          <span className="flex items-center gap-2 text-[#572ECE] min-w-0 truncate">
            <Film size={14} className="shrink-0" />
            Showing recordings for <span className="font-semibold text-[#0F1B3D] truncate">{classesList.find(c => c.id === Number(classFilterId))?.title || `Class #${classFilterId}`}</span>
          </span>
          <button onClick={() => router.replace('/dashboard/classes/recordings')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F3EEFF] border border-[#E9E7F5] transition-all shrink-0">
            <X size={12} /> Clear filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[#6D3DF5]" />
            <span className="text-sm text-[#536078]">Loading recordings...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 rounded-2xl bg-white border border-[#E9E7F5]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F3EEFF] border border-[#6D3DF5]/15 flex items-center justify-center mb-5">
            <Play size={28} className="text-[#6D3DF5] ml-0.5" />
          </div>
          <p className="text-sm font-semibold text-[#0F1B3D]">{search ? 'No matching recordings' : 'No recordings available'}</p>
          <p className="text-xs text-[#536078] mt-1.5">{search ? 'Try a different search term' : 'Create your first recording to get started'}</p>
          {!search && (
            <button onClick={() => { refreshClasses(); setShowCreate(true) }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold shadow-[0_2px_10px_rgba(109,61,245,0.3)] hover:from-[#5C2ED5] hover:to-[#2D6AE0] transition-all">
              <Plus size={14} /> Create Recording
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((rec, i) => {
            const thumb = getThumbnailUrl(rec)
            const progressWidth = ((rec.id * 37 + 12) % 50) + 25
            return (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group relative rounded-2xl bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/30 transition-all duration-300 overflow-hidden shadow-[0_2px_12px_rgba(15,27,61,0.06)] hover:shadow-[0_12px_40px_rgba(109,61,245,0.12)] hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <button type="button" onClick={() => setPlayingRec(rec)} title={rec.title} className="relative block w-full aspect-video overflow-hidden bg-[#0F1B3D] cursor-pointer text-left rounded-t-2xl">
                {thumb ? (
                  <>
                    <img src={thumb} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] via-[#0F1B3D] to-[#0a1225]" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film size={22} className="text-white/15" />
                    </div>
                  </>
                )}
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setPlayingRec(rec) }} title="Play"
                    className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:bg-[#6D3DF5] transition-all duration-300 cursor-pointer group-hover:shadow-[0_4px_24px_rgba(109,61,245,0.5)]">
                    <Play size={18} className="text-[#6D3DF5] ml-0.5 group-hover:text-white transition-colors duration-300" fill="currentColor" />
                  </button>
                </div>
                {/* HD badge */}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white tracking-wide">HD</span>
                {/* Duration badge */}
                {rec.duration_seconds > 0 && (
                  <span className="absolute bottom-8 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white">
                    {formatDuration(rec.duration_seconds)}
                  </span>
                )}
                {/* Views */}
                <span className="absolute bottom-8 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white/90">
                  <Eye size={10} /> {rec.view_count || 0}
                </span>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E9E7F5]/80">
                  <div className="h-full bg-[#6D3DF5] rounded-r-full" style={{ width: `${progressWidth}%` }} />
                </div>
              </button>
              {/* Body */}
              <div className="p-4 space-y-2.5">
                <h3 className="text-sm font-semibold text-[#0F1B3D] truncate block leading-snug w-full">{rec.title}</h3>
                {rec.description && (
                  <p className="text-xs text-[#536078] line-clamp-2 leading-relaxed">{rec.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#536078]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#536078]" />
                    {new Date(rec.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HardDrive size={12} className="text-[#536078]" />
                    {formatSize(rec.size_mb)}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#E9E7F5]">
                  <button onClick={() => setPlayingRec(rec)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:from-[#5C2ED5] hover:to-[#2D6AE0] transition-all shadow-[0_2px_8px_rgba(109,61,245,0.3)]">
                    <Play size={13} fill="currentColor" /> Play
                  </button>
                  <button onClick={() => openEdit(rec)}
                    className="p-1.5 rounded-xl bg-[#FEF5E7] border border-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/15 transition-all duration-200" title="Edit">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleDownload(rec)}
                    className="p-1.5 rounded-xl bg-[#EEF4FF] border border-[#3478F6]/20 text-[#3478F6] hover:bg-[#3478F6]/10 transition-all duration-200" title="Download">
                    <Download size={13} />
                  </button>
                  <button onClick={() => { if (confirm('Delete recording?')) liveClassesAPI.deleteRecording(rec.id).then(() => { toast.success('Deleted'); fetchData() }).catch(() => toast.error('Failed')) }}
                    className="p-1.5 rounded-xl bg-[#FEE8E8] border border-[#E5484D]/20 text-[#E5484D] hover:bg-[#E5484D]/10 transition-all duration-200" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
            )})}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-white border border-[#E9E7F5] overflow-hidden shadow-[0_2px_12px_rgba(15,27,61,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E9E7F5] text-[#536078]">
                  <th className="text-left px-5 py-3.5 font-semibold">Recording</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden sm:table-cell">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden lg:table-cell">Size</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden lg:table-cell">Views</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => {
                  const thumb = getThumbnailUrl(rec)
                  return (
                  <tr key={rec.id} className="border-b border-[#E9E7F5]/50 hover:bg-[#F3EEFF]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <button type="button" onClick={() => setPlayingRec(rec)} title={rec.title} className="relative w-24 aspect-video rounded-xl overflow-hidden shrink-0 bg-[#0F1B3D] group/list-thumb cursor-pointer text-left">
                          {thumb ? (
                            <img src={thumb} alt={rec.title} className="w-full h-full object-cover group-hover/list-thumb:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2744] via-[#0F1B3D] to-[#0a1225]">
                              <Film size={18} className="text-white/15" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/list-thumb:opacity-100 transition-opacity duration-300 bg-black/40">
                            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setPlayingRec(rec) }} title="Play"
                              className="p-2.5 rounded-full bg-white/95 flex items-center justify-center cursor-pointer hover:bg-[#6D3DF5] transition-colors duration-300">
                              <Play size={14} className="text-[#6D3DF5] ml-0.5 hover:text-white transition-colors" fill="currentColor" />
                            </button>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white">
                            {formatDuration(rec.duration_seconds || 0)}
                          </span>
                        </button>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#0F1B3D] truncate block w-full">{rec.title}</h3>
                          <div className="text-xs text-[#536078] mt-0.5 truncate max-w-[280px]">{rec.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#536078] hidden sm:table-cell">{new Date(rec.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-sm text-[#536078] hidden lg:table-cell">{formatSize(rec.size_mb)}</td>
                    <td className="px-5 py-3.5 text-sm text-[#536078] hidden lg:table-cell">{rec.view_count || 0}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPlayingRec(rec)} className="p-1.5 rounded-xl hover:bg-[#F3EEFF] text-[#6D3DF5] transition-colors" title="Play">
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button onClick={() => openEdit(rec)} className="p-1.5 rounded-xl hover:bg-[#FEF5E7] text-[#F59E0B] transition-colors" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDownload(rec)} className="p-1.5 rounded-xl hover:bg-[#EEF4FF] text-[#3478F6] transition-colors" title="Download">
                          <Download size={14} />
                        </button>
                        <button onClick={() => { if (confirm('Delete?')) liveClassesAPI.deleteRecording(rec.id).then(() => { toast.success('Deleted'); fetchData() }).catch(() => toast.error('Failed')) }}
                          className="p-1.5 rounded-xl hover:bg-[#FEE8E8] text-[#E5484D] transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Recording Modal */}
      <AnimatePresence>
        {(showCreate || showEdit) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { if (!saving) { setShowCreate(false); setShowEdit(false); setEditRec(null); setForm({ ...DEFAULT_FORM }); setThumbnailPreview(null); setAutoThumb(null) }}}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white border border-[#E9E7F5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E7F5]">
                <h2 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-2"><FileVideo size={16} className="text-[#6D3DF5]" /> {showEdit ? 'Edit Recording' : 'Create Recording'}</h2>
                <button onClick={() => { setShowCreate(false); setShowEdit(false); setEditRec(null); setForm({ ...DEFAULT_FORM }); setThumbnailPreview(null); setAutoThumb(null) }} className="p-1.5 rounded-xl hover:bg-[#F3EEFF] text-[#536078] hover:text-[#0F1B3D] transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] h-[2px]" />

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Thumbnail */}
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Thumbnail</label>
                  <div onClick={() => fileRef.current?.click()} className="relative aspect-video rounded-xl border-2 border-dashed border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:bg-[#F3EEFF]/40 transition-all cursor-pointer flex items-center justify-center overflow-hidden bg-[#F3EEFF]/20">
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 text-[#536078]">
                        <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] border border-[#6D3DF5]/15 flex items-center justify-center">
                          <Camera size={18} className="text-[#6D3DF5]" />
                        </div>
                        <span className="text-xs font-medium">Click to upload thumbnail</span>
                        <span className="text-[11px] text-[#536078]/60">JPG, PNG or GIF</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Title <span className="text-[#E5484D]">*</span></label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Introduction to React"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
                </div>

                {/* Video URL */}
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Video URL <span className="text-[#E5484D]">*</span></label>
                  <div className="relative">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536078]" />
                    <input value={form.url} onChange={e => update('url', e.target.value)} onBlur={handleUrlBlur} placeholder="https://example.com/video.mp4"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
                    {fetchingMeta && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D3DF5] animate-spin" />}
                  </div>
                  <p className="text-xs text-[#536078] mt-1.5">Supports YouTube, Vimeo, and direct video URLs. Duration and size auto-detect live from the link.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Brief description of this recording..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all resize-none" />
                </div>

                {/* Duration + Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Duration (min)</label>
                    <Clock size={14} className="absolute ml-3 mt-[13px] text-[#536078]" />
                    <input type="number" value={form.duration_minutes} onChange={e => update('duration_minutes', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Size (MB)</label>
                    <input type="number" value={form.size_mb} onChange={e => update('size_mb', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536078]" />
                    <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E9E7F5] bg-white text-[#0F1B3D] text-sm placeholder:text-[#536078]/50 focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
                  </div>
                </div>

                {/* Class */}
                <div className="relative" ref={classDropdownRef}>
                  <label className="text-xs font-semibold text-[#0F1B3D] mb-2 block">Class <span className="text-[#E5484D]">*</span></label>
                  <button type="button" onClick={() => { refreshClasses(); setShowClassDropdown(v => !v) }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-[#E9E7F5] text-sm text-left transition-colors hover:border-[#6D3DF5]/30 focus:outline-none focus:border-[#6D3DF5]/30 focus:ring-[3px] focus:ring-[#6D3DF5]/10">
                    <span className={form.class_id ? 'text-[#0F1B3D]' : 'text-[#536078]'}>
                      {form.class_id ? classesList.find(c => c.id === form.class_id)?.title || `Class #${form.class_id}` : 'Select a class...'}
                    </span>
                    <ChevronDown size={14} className="text-[#536078]" />
                  </button>
                  {showClassDropdown && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-white border border-[#E9E7F5] shadow-xl max-h-48 overflow-y-auto">
                      {classesList.length === 0 ? (
                        <div className="p-3">
                          <p className="text-xs text-[#536078] mb-2">No classes available</p>
                          <button type="button" onClick={() => { setShowClassDropdown(false); toast('Create a class from the Classes dashboard first') }}
                            className="w-full text-xs text-[#6D3DF5] font-medium hover:text-[#5C2ED5] transition-colors py-1.5 rounded-lg bg-[#F3EEFF] border border-[#6D3DF5]/20">
                            + Create New Class
                          </button>
                        </div>
                      ) : classesList.map(cls => (
                        <button key={cls.id} type="button" onClick={() => { update('class_id', cls.id); setShowClassDropdown(false) }}
                          className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-[#F3EEFF]/50 ${form.class_id === cls.id ? 'text-[#6D3DF5] bg-[#F3EEFF]' : 'text-[#0F1B3D]'}`}>
                          <span className="font-medium">{cls.title}</span>
                          <span className="text-[#536078] ml-2">{cls.date}</span>
                        </button>
                      ))}
                      <button type="button" onClick={() => { setShowClassDropdown(false); toast('Create a class from the Classes dashboard first') }}
                        className="w-full text-left px-3.5 py-2.5 text-sm text-[#6D3DF5] font-medium hover:bg-[#F3EEFF]/50 transition-colors border-t border-[#E9E7F5]">
                        + Create New Class
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-[#536078] mt-1.5">Recording will be linked to this live class</p>
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    {form.is_public ? <Eye size={15} className="text-[#572ECE]" /> : <EyeOff size={15} className="text-[#536078]" />}
                    <div>
                      <span className="text-xs font-semibold text-[#0F1B3D]">Public</span>
                      <p className="text-xs text-[#536078]">{form.is_public ? 'Visible to all students' : 'Only visible to instructors'}</p>
                    </div>
                  </div>
                  <button onClick={() => update('is_public', !form.is_public)}
                    className={`w-10 h-5 rounded-full transition-all relative ${form.is_public ? 'bg-[#6D3DF5]' : 'bg-[#E9E7F5]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.is_public ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#E9E7F5] bg-[#F8F6FF]">
                <button onClick={() => { setShowCreate(false); setShowEdit(false); setEditRec(null); setForm({ ...DEFAULT_FORM }); setThumbnailPreview(null); setAutoThumb(null) }} disabled={saving}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E9E7F5] text-[#536078] text-xs font-medium hover:text-[#0F1B3D] hover:bg-[#F3EEFF] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={showEdit ? handleEdit : handleCreate} disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-bold hover:from-[#5C2ED5] hover:to-[#2D6AE0] transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(109,61,245,0.3)]">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <FileVideo size={13} />}
                  {saving ? 'Saving...' : showEdit ? 'Update Recording' : 'Create Recording'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RecordingPlayerModal rec={playingRec} onClose={() => setPlayingRec(null)} />
    </div>
  )
}
