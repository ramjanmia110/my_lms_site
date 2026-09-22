'use client'

import { useState, useEffect, useCallback } from 'react'
import { Radio, Play, Square, Copy, Check, Loader2, Link2, Video, Clock } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import type { ClassRecording2 } from '@/types'
import toast from 'react-hot-toast'
import RecordingPlayerModal from './RecordingPlayerModal'

function fmtClock(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

export default function ClassRecordingWidget({ classId, status, title, date, time, onClassEnded }: {
  classId: number
  status: string
  title: string
  date?: string
  time?: string
  onClassEnded?: () => void
}) {
  const [recording, setRecording] = useState<ClassRecording2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [playing, setPlaying] = useState<ClassRecording2 | null>(null)

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  const fetchRecording = useCallback(async () => {
    try {
      const res = await liveClassesAPI.getRecordings({ per_page: 100 })
      const d = res.data?.data?.data ?? res.data?.data ?? []
      const all = Array.isArray(d) ? d : []
      const found = all
        .filter((r: any) => Number(r.class_id) === Number(classId))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null
      setRecording(found)
    } catch {
      setRecording(null)
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => { fetchRecording() }, [fetchRecording])

  const start = date && time ? new Date(`${date}T${time}`).getTime() : now
  const elapsed = Math.max(0, Math.floor((now - start) / 1000))

  const handleEnd = async () => {
    setEnding(true)
    try {
      await liveClassesAPI.endSession(classId)
      toast.success('Session ended — recording link generated')
      onClassEnded?.()
      await fetchRecording()
    } catch {
      toast.error('Failed to end session')
    } finally {
      setEnding(false)
    }
  }

  const copyUrl = async () => {
    if (!recording?.url) return
    try {
      await navigator.clipboard.writeText(recording.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  const card = 'rounded-xl bg-white border border-[#E9E7F5] p-4'

  if (loading) {
    return (
      <div className={`${card} flex items-center gap-3 text-xs text-[#536078]`}>
        <Loader2 size={14} className="animate-spin text-[#6D3DF5]" /> Loading recording status...
      </div>
    )
  }

  if (status === 'live') {
    return (
      <div className={`${card} border-red-500/20`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]" />
              <span className="text-[10px] font-bold text-red-300 tracking-widest">REC</span>
            </span>
            <div>
              <div className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2">
                <Radio size={13} className="text-[#18A878]" /> Recording in progress
              </div>
              <div className="text-[11px] text-[#536078] mt-0.5 flex items-center gap-1.5">
                <Clock size={11} /> <span className="font-mono text-[#18A878]">{fmtClock(elapsed)}</span> elapsed
              </div>
            </div>
          </div>
          <button onClick={handleEnd} disabled={ending}
            className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors shadow-sm disabled:opacity-50">
            {ending ? <Loader2 size={13} className="animate-spin" /> : <Square size={12} fill="currentColor" />}
            {ending ? 'Generating link...' : 'Stop & Generate Link'}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'completed') {
    if (!recording) {
      return (
        <div className={`${card} flex items-center gap-3 text-xs text-[#536078]`}>
          <Video size={14} className="text-[#536078]" /> No recording was generated for this session.
        </div>
      )
    }
    return (
      <div className={`${card} border-[#18A878]/20`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-lg bg-[#ECFBF5] flex items-center justify-center shrink-0">
              <Video size={15} className="text-[#18A878]" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#0F1B3D] truncate">{recording.title}</div>
              <div className="text-[11px] text-[#536078] mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Clock size={11} />{fmtDuration(recording.duration_seconds || 0)}</span>
                <span className="flex items-center gap-1 text-[#18A878]"><Link2 size={11} />Recording link ready</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setPlaying(recording)}
              className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-semibold hover:from-[#5B2FE0] hover:to-[#2D6AE0] transition-all shadow-sm">
              <Play size={12} fill="currentColor" /> Play
            </button>
            <button onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] text-[#536078] text-xs font-medium hover:text-[#0F1B3D] hover:bg-[#F3EEFF]/80 transition-all">
              {copied ? <Check size={12} className="text-[#18A878]" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
        {recording.url && (
          <p className="mt-3 pt-3 border-t border-[#E9E7F5] text-[10px] text-[#536078] truncate">{recording.url}</p>
        )}
        <RecordingPlayerModal rec={playing} onClose={() => setPlaying(null)} />
      </div>
    )
  }

  return (
    <div className={`${card} border-[#6D3DF5]/20 bg-[#F3EEFF] flex items-center gap-3 text-xs text-[#6D3DF5]`}>
      <Video size={14} className="text-[#6D3DF5]" /> Recording will be generated automatically when this class ends.
    </div>
  )
}