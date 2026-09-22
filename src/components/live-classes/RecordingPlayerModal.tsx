'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Rewind, FastForward, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, X, Film, Clock, Calendar, Eye, Download, Loader2, ExternalLink, HardDrive } from 'lucide-react'
import type { ClassRecording2 } from '@/types'
import toast from 'react-hot-toast'

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatTime(sec: number): string {
  if (!sec || !isFinite(sec) || sec < 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function PlayerSlider({ value, max, onChange, onCommit, label, className }: {
  value: number
  max: number
  onChange?: (v: number) => void
  onCommit: (v: number) => void
  label: string
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragValue, setDragValue] = useState<number | null>(null)
  const draggingRef = useRef(false)

  const displayed = Math.max(0, Math.min(dragValue ?? value, max || 0))
  const pct = max > 0 ? (displayed / max) * 100 : 0

  const calc = (clientX: number): number => {
    const el = trackRef.current
    if (!el || !max) return 0
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return ratio * max
  }

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    draggingRef.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const v = calc(e.clientX)
    setDragValue(v)
    onChange?.(v)
  }

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const v = calc(e.clientX)
    setDragValue(v)
    onChange?.(v)
  }

  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const v = calc(e.clientX)
    setDragValue(null)
    onCommit(v)
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(displayed)}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={`group relative flex items-center h-5 cursor-pointer touch-none select-none ${className || 'flex-1 min-w-0'}`}
    >
      <div className="relative w-full h-1.5 rounded-full bg-[#E9E7F5]">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#3478F6] shadow-[0_0_6px_rgba(52,120,246,0.5)]" style={{ width: `${pct}%` }} />
      </div>
      <div
        className={`absolute w-3.5 h-3.5 rounded-full bg-[#6D3DF5] border-2 border-white shadow-[0_1px_6px_rgba(0,0,0,0.3)] transition-transform ${draggingRef.current ? 'scale-125' : 'group-hover:scale-110'}`}
        style={{ left: `calc(${pct}% - 7px)` }}
      />
    </div>
  )
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

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

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|mkv|avi|flv|m4v|3gp|ogg)(?:[?#]|$)/i.test(url)
}

function getEmbedUrl(rec: ClassRecording2): string | null {
  const ytMatch = rec.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{1,})/)
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&controls=0&enablejsapi=1&playsinline=1`
  const vimeoMatch = rec.url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0&controls=0&api=1`
  return null
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

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

export default function RecordingPlayerModal({ rec, onClose }: { rec: ClassRecording2 | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerBoxRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [curTime, setCurTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)
  const [buffering, setBuffering] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const playingRef = useRef(false)
  const hideTimerRef = useRef<number | null>(null)
  const syncValRef = useRef(0)
  const syncTimeRef = useRef(0)

  const markSynced = (t: number) => {
    syncValRef.current = t
    syncTimeRef.current = performance.now()
  }

  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    const embed = !!rec && !isDirectVideoUrl(rec.url)
    setPlaying(embed); setCurTime(0); setMuted(false); setIsFullscreen(false)
    setPlayError(null); setBuffering(false)
    setControlsVisible(true)
    syncValRef.current = 0
    syncTimeRef.current = 0
    setDuration(rec && rec.duration_seconds > 0 ? rec.duration_seconds : 0)
  }, [rec])

  // Auto-hide controls in fullscreen while playing; reveal on mouse/touch/key activity
  useEffect(() => {
    if (!rec) return
    const poke = () => {
      setControlsVisible(true)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = window.setTimeout(() => {
        if (document.fullscreenElement && playingRef.current) setControlsVisible(false)
      }, 3000)
    }
    window.addEventListener('mousemove', poke)
    window.addEventListener('pointerdown', poke)
    window.addEventListener('keydown', poke)
    poke()
    return () => {
      window.removeEventListener('mousemove', poke)
      window.removeEventListener('pointerdown', poke)
      window.removeEventListener('keydown', poke)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
  }, [rec])

  // Always show controls when paused or not fullscreen
  useEffect(() => {
    if (!isFullscreen || !playing) setControlsVisible(true)
  }, [isFullscreen, playing])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data
      if (!d || typeof d !== 'object') return
      if (d.event === 'infoDelivery' && d.info) {
        if (typeof d.info.currentTime === 'number') { setCurTime(d.info.currentTime); markSynced(d.info.currentTime) }
        if (typeof d.info.duration === 'number') setDuration(d.info.duration)
        if (typeof d.info.volume === 'number') setVolume(d.info.volume / 100)
        if (typeof d.info.muted === 'boolean') setMuted(d.info.muted)
      }
      if (d.event === 'volumechange' && d.data) {
        if (typeof d.data.volume === 'number') setVolume(d.data.volume)
      }
      if (d.event === 'onStateChange') {
        const st = typeof d.info?.playerState === 'number' ? d.info.playerState : d.data
        if (typeof st === 'number') setPlaying(st === 1)
      }
      if (d.event === 'playProgress' && d.data) {
        if (typeof d.data.seconds === 'number') { setCurTime(d.data.seconds); markSynced(d.data.seconds) }
        if (typeof d.data.duration === 'number') setDuration(d.data.duration)
      }
      if (d.event === 'timeupdate' && d.data) {
        if (typeof d.data.seconds === 'number') { setCurTime(d.data.seconds); markSynced(d.data.seconds) }
        if (typeof d.data.duration === 'number') setDuration(d.data.duration)
      }
      if (d.event === 'durationchange' && d.data) {
        if (typeof d.data.duration === 'number') setDuration(d.data.duration)
      }
      if (d.event === 'loadeddata' && d.data) {
        if (typeof d.data.duration === 'number') setDuration(d.data.duration)
      }
      if (d.event === 'play') setPlaying(true)
      if (d.event === 'pause') setPlaying(false)
      if (d.event === 'ended') setPlaying(false)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const isYT = (u: string) => /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{1,})/.test(u)
  const isVimeoUrl = (u: string) => /vimeo\.com\/(\d+)/.test(u)

  const postToPlayer = (payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), '*')
  }
  const iframePlay = () => {
    const u = rec?.url; if (!u) return
    if (isYT(u)) postToPlayer({ event: 'command', func: 'playVideo', args: '' })
    else if (isVimeoUrl(u)) postToPlayer({ method: 'play' })
  }
  const iframePause = () => {
    const u = rec?.url; if (!u) return
    if (isYT(u)) postToPlayer({ event: 'command', func: 'pauseVideo', args: '' })
    else if (isVimeoUrl(u)) postToPlayer({ method: 'pause' })
  }
  const iframeSeek = (t: number) => {
    const u = rec?.url; if (!u) return
    if (isYT(u)) postToPlayer({ event: 'command', func: 'seekTo', args: [t, true] })
    else if (isVimeoUrl(u)) postToPlayer({ method: 'seekTo', value: t })
  }
  const iframeSetVolume = (v: number) => {
    const u = rec?.url; if (!u) return
    if (isYT(u)) postToPlayer({ event: 'command', func: 'setVolume', args: [Math.round(v * 100)] })
    else if (isVimeoUrl(u)) postToPlayer({ method: 'setVolume', value: v })
  }
  const iframeMute = (m: boolean) => {
    const u = rec?.url; if (!u) return
    if (isYT(u)) postToPlayer({ event: 'command', func: m ? 'mute' : 'unMute', args: '' })
    else if (isVimeoUrl(u)) postToPlayer({ method: 'setMuted', value: m })
  }

  const togglePlay = () => {
    if (!rec) return
    if (isDirectVideoUrl(rec.url)) {
      const v = videoRef.current
      if (!v) return
      if (v.paused) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    } else if (playing) {
      iframePause(); setPlaying(false)
    } else {
      iframePlay(); setPlaying(true)
    }
  }

  const seekTo = (t: number) => {
    if (!rec) return
    const clamped = Math.max(0, Math.min(t, duration || t))
    if (isDirectVideoUrl(rec.url)) {
      const v = videoRef.current
      if (v) v.currentTime = clamped
    } else iframeSeek(clamped)
    setCurTime(clamped)
    markSynced(clamped)
  }

  const restart = () => seekTo(0)
  const skipBackward = () => seekTo(curTime - 10)
  const skipForward = () => seekTo(curTime + 10)

  const toggleMute = () => {
    if (!rec) return
    if (isDirectVideoUrl(rec.url)) {
      const v = videoRef.current
      if (v) v.muted = !v.muted
    } else {
      const next = !muted
      setMuted(next)
      iframeMute(next)
    }
  }

  const setVolumeLive = (v: number) => {
    if (!rec) return
    setVolume(v)
    if (isDirectVideoUrl(rec.url)) {
      const el = videoRef.current
      if (el) { el.volume = v; el.muted = v === 0 }
    } else {
      iframeSetVolume(v)
      iframeMute(v === 0)
    }
  }

  const toggleFullscreen = () => {
    const el = playerBoxRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen()
    }
  }

  const togglePiP = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture?.()
    } catch { /* unsupported */ }
  }

  useEffect(() => {
    if (!rec) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); togglePlay() }
      else if (e.key === 'ArrowRight') skipForward()
      else if (e.key === 'ArrowLeft') skipBackward()
      else if (e.key === 'Home') restart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rec, playing])

  useEffect(() => {
    if (!rec || isDirectVideoUrl(rec.url)) return
    const poll = () => {
      const u = rec?.url
      if (!u) return
      if (isYT(u)) {
        postToPlayer({ event: 'command', func: 'getCurrentTime', args: '' })
        postToPlayer({ event: 'command', func: 'getDuration', args: '' })
      } else if (isVimeoUrl(u)) {
        postToPlayer({ method: 'getCurrentTime' })
        postToPlayer({ method: 'getDuration' })
      }
    }
    poll()
    const id = window.setInterval(poll, 400)
    return () => window.clearInterval(id)
  }, [rec])

  // Smooth 60fps progress sync for direct videos while playing
  useEffect(() => {
    if (!rec || !playing || !isDirectVideoUrl(rec.url)) return
    let raf = 0
    const loop = () => {
      const v = videoRef.current
      if (v && !v.paused) {
        setCurTime(v.currentTime)
        const d = v.duration
        if (isFinite(d) && d > 0) setDuration(d)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rec, playing])

  // Clock-based fallback for embeds: keeps the progress bar moving while
  // playing even if the embed stops delivering timeupdate/infoDelivery events.
  useEffect(() => {
    if (!rec || !playing || isDirectVideoUrl(rec.url)) return
    if (!syncTimeRef.current) syncTimeRef.current = performance.now()
    let raf = 0
    const loop = () => {
      const now = performance.now()
      if (now - syncTimeRef.current > 600) {
        const elapsed = (now - syncTimeRef.current) / 1000
        setCurTime(syncValRef.current + elapsed)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rec, playing])

  return (
    <AnimatePresence>
      {rec && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-[#010604] border border-white/[0.1] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div ref={playerBoxRef} className={`relative bg-black ${isFullscreen && !controlsVisible ? 'cursor-none' : ''}`}>
              <div className="aspect-video" onClick={() => { setControlsVisible(true); togglePlay() }}>
                {isDirectVideoUrl(rec.url) ? (
                  <video ref={videoRef} src={rec.url} autoPlay playsInline className="w-full h-full"
                    onTimeUpdate={e => {
                      const v = e.currentTarget
                      setCurTime(v.currentTime)
                      markSynced(v.currentTime)
                      if (isFinite(v.duration) && v.duration > 0) setDuration(v.duration)
                    }}
                    onLoadedMetadata={e => {
                      const d = e.currentTarget.duration
                      if (isFinite(d) && d > 0) setDuration(d)
                    }}
                    onDurationChange={e => {
                      const d = e.currentTarget.duration
                      if (isFinite(d) && d > 0) setDuration(d)
                    }}
                    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
                    onWaiting={() => setBuffering(true)}
                    onPlaying={() => setBuffering(false)}
                    onCanPlay={() => setBuffering(false)}
                    onError={() => {
                      setPlayError('This recording could not be loaded. The source URL appears to be offline or unsupported.')
                      setBuffering(false)
                    }}
                    onVolumeChange={e => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume) }} />
                ) : getEmbedUrl(rec) ? (
                  <iframe ref={iframeRef} src={getEmbedUrl(rec) as string} title={rec.title} className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Film size={40} className="text-white/15" />
                    <p className="text-sm text-slate-500">This video cannot be played inline</p>
                  </div>
                )}
              </div>

              {/* Buffering spinner */}
              {buffering && !playError && isDirectVideoUrl(rec.url) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
                  <Loader2 size={36} className="text-emerald-400 animate-spin" />
                </div>
              )}

              {/* Load error overlay */}
              {playError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 px-6 text-center bg-black/85">
                  <Film size={36} className="text-rose-400/80" />
                  <p className="text-sm font-medium text-white">{playError}</p>
                  <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">
                    Open in browser instead
                  </a>
                </div>
              )}

              {/* Bottom gradient for control readability */}
              <div className={`absolute inset-x-0 bottom-0 h-24 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`} />

              {/* Overlay header: title left, cross top-right */}
              <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl border-b border-[#E9E7F5] pointer-events-none transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-sm font-bold text-[#0F1B3D] truncate">{rec.title}</h2>
                <button onClick={onClose} title="Close" aria-label="Close"
                  className="pointer-events-auto w-8 h-8 rounded-full bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center text-[#0F1B3D] hover:bg-[#E9E7F5] hover:border-[#6D3DF5] transition-all shrink-0 shadow-lg">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {(isDirectVideoUrl(rec.url) || getEmbedUrl(rec)) && !playError && (
                <div className={`absolute inset-x-0 bottom-0 z-30 px-4 pb-2.5 pt-10 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {/* Seek bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-[#536078] tabular-nums w-9 text-right shrink-0">{formatTime(curTime)}</span>
                    <PlayerSlider value={curTime} max={duration || 0} onChange={v => setCurTime(v)} onCommit={seekTo} label="Seek" />
                    <span className="text-[11px] font-medium text-[#536078] tabular-nums w-9 shrink-0">{formatTime(duration)}</span>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-0.5 mt-1.5">
                    <button onClick={restart} title="Restart" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                      <RotateCcw size={14} />
                    </button>
                    <button onClick={skipBackward} title="Back 10 seconds" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                      <Rewind size={14} />
                    </button>
                    <button onClick={togglePlay} title={playing ? 'Pause' : 'Play'} className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                      {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <button onClick={skipForward} title="Forward 10 seconds" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                      <FastForward size={14} />
                    </button>
                    <button onClick={toggleMute} title={muted || volume === 0 ? 'Unmute' : 'Mute'} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                      {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <PlayerSlider value={muted ? 0 : volume} max={1} className="w-24 shrink-0"
                      onChange={setVolumeLive} onCommit={setVolumeLive} label="Volume" />
                    {isDirectVideoUrl(rec.url) && (
                      <button onClick={togglePiP} title="Picture in picture" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                        <PictureInPicture2 size={14} />
                      </button>
                    )}
                    <div className="flex-1" />
                    <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                      {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-[#E9E7F5] bg-white/95 backdrop-blur-xl">
              <div className="flex items-center gap-4 text-xs text-[#536078] min-w-0">
                {rec.duration_seconds > 0 && (
                  <span className="flex items-center gap-1.5 shrink-0"><Clock size={12} /> {formatDuration(rec.duration_seconds)}</span>
                )}
                {rec.size_mb != null && rec.size_mb > 0 && (
                  <span className="flex items-center gap-1.5 shrink-0"><HardDrive size={12} /> {formatBytes((rec.size_mb || 0) * 1024 * 1024)}</span>
                )}
                <span className="flex items-center gap-1.5 shrink-0"><Calendar size={12} /> {new Date(rec.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5 shrink-0"><Eye size={12} /> {rec.view_count || 0} views</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={rec.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F3EEFF] border border-[#E9E7F5] text-[#536078] text-xs font-semibold hover:bg-[#E9E7F5] transition-all">
                  <ExternalLink size={13} /> Open Original
                </a>
                <button onClick={() => handleDownload(rec)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] text-white text-xs font-semibold hover:from-[#5C2ED5] hover:to-[#7C4FEE] transition-all shadow-sm">
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
