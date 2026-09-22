'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, MessageCircle, Users,
  PhoneOff, Copy, Check, Loader2, MonitorPlay, ArrowLeft, Send,
  Lock, Unlock, KeyRound, FileText, Download, Trash2, Crown, Shield,
  ShieldCheck, UserPlus, UserMinus, X, Clock, CalendarPlus, Play, Square,
  Cloud, HardDrive, ImagePlus, LayoutGrid, Maximize, MoreHorizontal,
  Radio, CheckCircle2, ShieldAlert, UserCog, DoorOpen, Presentation,
  GripVertical, UploadCloud, BadgeCheck, Sparkles, Timer, FolderOpen,
  Calendar, RefreshCw,
} from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import type { Class } from '@/types'
import toast from 'react-hot-toast'

type Role = 'host' | 'cohost' | 'participant'

type Participant = {
  id: number
  name: string
  color: string
  avatar?: string | null
  isSelf: boolean
  isMuted: boolean
  isSpeaking: boolean
  isVideoOn: boolean
  role: Role
  joinedAt: string
}

type EnrolledStudent = {
  id: number
  name: string
  email: string
  avatar?: string | null
  role?: string
  enrolled_at?: string | null
  progress?: number | null
  completed?: boolean
  status?: string
}

type ChatMsg = { id: number; name: string; text: string; time: string }

type SharedFile = { id: number; name: string; size: number; url: string; sender: string; time: string }

type BreakoutRoom = { id: number; name: string; members: number[]; open: boolean }

type Scheduled = { id: number; title: string; date: string; time: string; duration: number; link: string }

type Recording = { id: number; mode: 'cloud' | 'local'; duration: string; size: string; time: string }

const backgrounds = [
  { name: 'Default', cls: 'bg-gradient-to-br from-slate-700/60 to-slate-950/80' },
  { name: 'Blur', cls: 'bg-gradient-to-br from-[#0a1b14] to-[#042718]' },
  { name: 'Emerald', cls: 'bg-gradient-to-br from-emerald-600 to-teal-900' },
  { name: 'Ocean', cls: 'bg-gradient-to-br from-blue-600 to-indigo-900' },
  { name: 'Sunset', cls: 'bg-gradient-to-br from-orange-500 to-rose-700' },
  { name: 'City Night', cls: 'bg-gradient-to-br from-slate-800 to-slate-950' },
  { name: 'Beach', cls: 'bg-gradient-to-br from-cyan-400 to-teal-700' },
  { name: 'Aurora', cls: 'bg-gradient-to-br from-violet-600 to-fuchsia-800' },
]

const tileColors = [
  'from-emerald-500/25 to-teal-500/10',
  'from-blue-500/25 to-indigo-500/10',
  'from-purple-500/25 to-pink-500/10',
  'from-amber-500/25 to-orange-500/10',
  'from-rose-500/25 to-red-500/10',
  'from-cyan-500/25 to-sky-500/10',
  'from-fuchsia-500/25 to-purple-500/10',
  'from-lime-500/25 to-emerald-500/10',
]

const selfParticipant: Participant = {
  id: 1,
  name: 'You',
  color: 'from-slate-600/40 to-slate-800/30',
  avatar: null,
  isSelf: true,
  isMuted: false,
  isSpeaking: false,
  isVideoOn: true,
  role: 'host',
  joinedAt: '10:00',
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const roleBadge: Record<Role, string> = {
  host: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  cohost: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  participant: 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5]',
}

const modalCls = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
const panelCls = 'w-full max-w-md rounded-2xl bg-white border border-[#E9E7F5] overflow-hidden shadow-2xl'

export default function ZoomMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const [cls, setCls] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)

  const [participants, setParticipants] = useState<Participant[]>([selfParticipant])
  const participantsRef = useRef<Participant[]>(participants)
  useEffect(() => { participantsRef.current = participants }, [participants])
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [rosterLoaded, setRosterLoaded] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(false)
  const [camStream, setCamStream] = useState<MediaStream | null>(null)
  const [screenShare, setScreenShare] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [screenMode, setScreenMode] = useState<'none' | 'live' | 'simulated'>('none')
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker'>('speaker')
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const [showSidebar, setShowSidebar] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants' | 'files' | 'breakout'>('chat')
  const [chatMsg, setChatMsg] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([])

  const [recording, setRecording] = useState(false)
  const [recMode, setRecMode] = useState<'cloud' | 'local' | null>(null)
  const [recSeconds, setRecSeconds] = useState(0)
  const [recordings, setRecordings] = useState<Recording[]>([])

  const [bgIndex, setBgIndex] = useState(0)

  const [rooms, setRooms] = useState<BreakoutRoom[]>([])
  const [roomCount, setRoomCount] = useState(3)

  const [files, setFiles] = useState<SharedFile[]>([])

  const [scheduled, setScheduled] = useState<Scheduled[]>(() => {
    try { return JSON.parse(localStorage.getItem('lms_zoom_schedule') || '[]') } catch { return [] }
  })
  const [schTitle, setSchTitle] = useState('')
  const [schDate, setSchDate] = useState('')
  const [schTime, setSchTime] = useState('')
  const [schDur, setSchDur] = useState(60)

  const [locked, setLocked] = useState(false)
  const [passcode, setPasscode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString())
  const [showPasscode, setShowPasscode] = useState(false)
  const [joinModal, setJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const [moreOpen, setMoreOpen] = useState(false)
  const [modal, setModal] = useState<'none' | 'background' | 'recording' | 'schedule' | 'lock'>('none')

  const selfVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)

  const meetingId = `840 2647 334${String(Number(params.id) % 10)}`
  const self = participants.find(p => p.isSelf)!

  useEffect(() => {
    liveClassesAPI.getOne(Number(params.id))
      .then(res => setCls(res.data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    liveClassesAPI.getEnrolledStudents(Number(params.id))
      .then(res => {
        const list: EnrolledStudent[] = res.data?.data ?? []
        setEnrolledStudents(list)
        setRosterLoaded(true)
        const roster: Participant[] = list.map((s, i) => ({
          id: s.id + 1000,
          name: s.name,
          avatar: s.avatar ?? null,
          color: tileColors[i % tileColors.length],
          isSelf: false,
          isMuted: false,
          isSpeaking: false,
          isVideoOn: true,
          role: 'participant',
          joinedAt: nowTime(),
        }))
        const presentCount = Math.max(6, Math.ceil(roster.length * 0.6))
        const present = roster.slice(0, presentCount)
        const late = roster.slice(presentCount)
        setParticipants([selfParticipant, ...present])
        if (late.length > 0) {
          const t = setInterval(() => {
            const prev = participantsRef.current
            const absent = late.filter(s => !prev.some(p => p.name === s.name))
            if (!absent.length) { clearInterval(t); return }
            const next = absent[0]
            setParticipants(p => [...p, next])
            setMessages(m => [...m, { id: Date.now(), name: next.name, text: 'joined the meeting', time: nowTime() }])
            toast.success(`${next.name} joined the meeting`)
          }, 18000)
          return () => clearInterval(t)
        }
      })
      .catch(() => setRosterLoaded(true))
  }, [params.id])

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setParticipants(prev => {
        const others = prev.filter(p => !p.isSelf && p.isVideoOn)
        if (!others.length) return prev
        const target = others[Math.floor(Math.random() * others.length)]
        return prev.map(p => ({ ...p, isSpeaking: p.id === target.id }))
      })
    }, 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setRecSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  useEffect(() => {
    if (selfVideoRef.current && camStream) selfVideoRef.current.srcObject = camStream
  }, [camStream])

  useEffect(() => {
    if (screenVideoRef.current && screenStream) screenVideoRef.current.srcObject = screenStream
  }, [screenStream])

  useEffect(() => {
    localStorage.setItem('lms_zoom_schedule', JSON.stringify(scheduled))
  }, [scheduled])

  const activeSpeaker = participants.find(p => p.isSpeaking) || self

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamOn(true)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
      setCamStream(stream)
      setCamOn(true)
    } catch {
      setCamOn(true)
      toast.error('Camera unavailable — using avatar')
    }
  }

  const stopCamera = useCallback(() => {
    camStream?.getTracks().forEach(t => t.stop())
    setCamStream(null)
    setCamOn(false)
  }, [camStream])

  useEffect(() => () => stopCamera(), [stopCamera])

  const toggleCam = () => {
    if (camOn) stopCamera()
    else startCamera()
  }

  const toggleMic = () => setMicOn(v => !v)

  const toggleScreen = async () => {
    if (screenShare) {
      screenStream?.getTracks().forEach(t => t.stop())
      setScreenStream(null)
      setScreenShare(false)
      setScreenMode('none')
      return
    }
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('unsupported')
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStream(null); setScreenShare(false); setScreenMode('none')
      })
      setScreenStream(stream)
      setScreenMode('live')
    } catch {
      setScreenMode('simulated')
    }
    setScreenShare(true)
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(meetingId.replace(/ /g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { toast.error('Copy failed') }
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    const text = chatMsg.trim()
    if (!text) return
    setMessages(m => [...m, { id: Date.now(), name: 'You', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setChatMsg('')
  }

  const startRecording = (mode: 'cloud' | 'local') => {
    setRecMode(mode)
    setRecSeconds(0)
    setRecording(true)
    setModal('none')
    toast.success(`Recording started · ${mode === 'cloud' ? 'Cloud' : 'Local'}`)
  }

  const stopRecording = () => {
    setRecording(false)
    const dur = fmtClock(recSeconds)
    const size = `${Math.max(0.4, recSeconds * 0.42).toFixed(1)} MB`
    setRecordings(r => [{ id: Date.now(), mode: recMode!, duration: dur, size, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...r])
    setRecMode(null)
    setRecSeconds(0)
    toast.success('Recording saved')
  }

  const promote = (id: number) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, role: 'cohost' } : p))
  const demote = (id: number) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, role: 'participant' } : p))
  const muteOne = (id: number) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: true } : p))
  const unmuteOne = (id: number) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: false } : p))
  const removeOne = (id: number) => setParticipants(prev => prev.filter(p => p.id !== id))
  const muteAll = () => { setParticipants(prev => prev.map(p => p.id === 1 ? p : { ...p, isMuted: true })); toast.success('All participants muted') }

  const addSimulatedParticipant = () => {
    const presentNames = new Set(participants.map(p => p.name))
    const pending = enrolledStudents.filter(s => !presentNames.has(s.name))
    if (!pending.length) { toast.error('All enrolled students are present'); return }
    const next = pending[0]
    const p: Participant = {
      id: next.id + 1000,
      name: next.name,
      avatar: next.avatar ?? null,
      color: tileColors[participants.length % tileColors.length],
      isSelf: false, isMuted: false, isSpeaking: false, isVideoOn: true,
      role: 'participant',
      joinedAt: nowTime(),
    }
    setParticipants(prev => [...prev, p])
    setMessages(m => [...m, { id: Date.now(), name: next.name, text: 'joined the meeting', time: nowTime() }])
    toast.success(`${next.name} joined`)
  }

  const requestJoin = () => {
    if (locked) setJoinModal(true)
    else addSimulatedParticipant()
  }

  const confirmJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode === passcode) {
      setJoinModal(false)
      setJoinCode('')
      addSimulatedParticipant()
    } else {
      toast.error('Incorrect passcode')
    }
  }

  const createRooms = (count: number) => {
    const others = participants.filter(p => !p.isSelf)
    const shuffled = [...others].sort(() => 0.5 - Math.random())
    const rs: BreakoutRoom[] = Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Room ${i + 1}`, members: [], open: false }))
    shuffled.forEach((p, idx) => { rs[idx % count].members.push(p.id) })
    setRooms(rs)
    setRoomCount(count)
    toast.success(`${count} breakout rooms created`)
  }

  const toggleRoom = (id: number) => setRooms(rs => rs.map(r => r.id === id ? { ...r, open: !r.open } : r))

  const moveMember = (memberId: number, fromId: number, toId: number) => {
    setRooms(rs => rs.map(r => {
      if (r.id === fromId) return { ...r, members: r.members.filter(m => m !== memberId) }
      if (r.id === toId) return { ...r, members: [...r.members, memberId] }
      return r
    }))
  }

  const closeAllRooms = () => { setRooms(rs => rs.map(r => ({ ...r, open: false }))); toast.success('All rooms closed') }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    if (!list.length) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newFiles: SharedFile[] = list.map(f => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, url: URL.createObjectURL(f), sender: 'You', time }))
    setFiles(f => [...newFiles, ...f])
    e.target.value = ''
    toast.success(`${list.length} file${list.length > 1 ? 's' : ''} shared`)
  }

  const scheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!schTitle.trim() || !schDate || !schTime) { toast.error('Fill all fields'); return }
    const link = `https://us05web.zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`
    const s: Scheduled = { id: Date.now(), title: schTitle.trim(), date: schDate, time: schTime, duration: schDur, link }
    setScheduled(sl => [s, ...sl])
    setSchTitle(''); setSchDate(''); setSchTime('')
    toast.success('Meeting scheduled')
  }

  const copyLink = async (link: string) => {
    try { await navigator.clipboard.writeText(link); toast.success('Link copied') } catch { toast.error('Copy failed') }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-500" /></div>

  const tabBtn = (id: 'chat' | 'participants' | 'files' | 'breakout', Icon: any, label: string, count?: number) => (
    <button onClick={() => { setSidebarTab(id); setShowSidebar(true) }}
      className={`relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[9px] transition-all cursor-pointer ${sidebarTab === id && showSidebar ? 'text-[#6D3DF5] bg-[#F3EEFF]' : 'text-[#8A93AE] hover:text-[#0F1B3D]'}`}>
      <Icon size={13} />
      <span>{label}</span>
      {count ? <span className="absolute top-0.5 right-1.5 min-w-[13px] h-3.5 px-0.5 rounded-full bg-emerald-500/90 text-black text-[7px] font-bold flex items-center justify-center">{count}</span> : null}
    </button>
  )

  const sidePanel = (
    <div className="w-80 shrink-0 rounded-xl bg-white border border-[#E9E7F5] shadow-sm flex flex-col overflow-hidden">
      <div className="flex gap-1 p-1.5 border-b border-[#E9E7F5]">
        {tabBtn('chat', MessageCircle, 'Chat', messages.length)}
        {tabBtn('participants', Users, 'People', participants.length)}
        {tabBtn('files', FolderOpen, 'Files', files.length)}
        {tabBtn('breakout', LayoutGrid, 'Rooms', rooms.length)}
        <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={13} /></button>
      </div>

      {sidebarTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[240px] max-h-[300px]">
            {messages.map(m => (
              <div key={m.id} className={`p-2 rounded-lg ${m.name === 'You' ? 'bg-[#F3EEFF] border border-[#6D3DF5]/20' : m.text === 'joined the meeting' ? 'bg-[#F8FAFC] border border-[#E9E7F5] text-center' : 'bg-[#F8FAFC] border border-[#E9E7F5]'}`}>
                {m.text === 'joined the meeting' ? (
                  <p className="text-[10px] text-[#536078]">{m.name} joined the meeting</p>
                ) : (
                  <>
                    <div className="text-[10px] font-semibold text-[#8A93AE]">{m.name} <span className="text-[#8A93AE]/60 font-normal">· {m.time}</span></div>
                    <p className="text-[11px] text-[#0F1B3D] mt-0.5">{m.text}</p>
                  </>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="p-2 border-t border-[#E9E7F5] flex gap-1.5">
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type a message..." className="flex-1 px-2.5 h-8 rounded-md bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] placeholder:text-[#8A93AE] focus:outline-none focus:border-[#6D3DF5]/40" />
            <button type="submit" className="px-2.5 h-8 rounded-md bg-[#6D3DF5] text-white text-xs font-semibold hover:bg-[#6D3DF5]/90 transition-colors cursor-pointer">Send</button>
          </form>
        </div>
      )}

      {sidebarTab === 'participants' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[240px] max-h-[300px]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold">Participants</span>
            <button onClick={muteAll} className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] text-[#536078] border border-[#E9E7F5] hover:text-[#18A878] hover:border-[#18A878]/30 cursor-pointer"><MicOff size={10} /> Mute all</button>
          </div>
          {rosterLoaded && enrolledStudents.length > 0 && (
            <p className="px-2 text-[9px] text-[#18A878]/70">{participants.filter(p => !p.isSelf).length} of {enrolledStudents.length} enrolled students present</p>
          )}
          {participants.map(p => (
            <div key={p.id} className="group flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 overflow-hidden`}>
                {p.avatar ? <img src={getImageUrl(p.avatar)} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-white/90">{initials(p.name)}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0F1B3D] truncate">
                  {p.name}
                  {p.isSelf && <span className="text-[8px] text-[#8A93AE]">(you)</span>}
                  {p.role === 'host' && <Crown size={10} className="text-amber-400 shrink-0" />}
                  {p.role === 'cohost' && <BadgeCheck size={10} className="text-sky-400 shrink-0" />}
                  {p.isSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                </div>
                <span className={`inline-block px-1.5 py-px rounded-full border text-[8px] capitalize ${roleBadge[p.role]}`}>{p.role}</span>
              </div>
              {p.isMuted ? <MicOff size={12} className="text-rose-400 shrink-0" /> : <Mic size={12} className="text-[#8A93AE] shrink-0" />}
              {p.role === 'host' ? null : (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {p.role === 'cohost'
                    ? <button onClick={() => demote(p.id)} title="Demote" className="p-1 rounded hover:bg-[#F8FAFC] text-[#8A93AE] hover:text-[#0F1B3D] cursor-pointer"><UserMinus size={11} /></button>
                    : <button onClick={() => promote(p.id)} title="Make co-host" className="p-1 rounded hover:bg-[#F8FAFC] text-[#8A93AE] hover:text-sky-300 cursor-pointer"><UserCog size={11} /></button>}
                  {p.isMuted
                    ? <button onClick={() => unmuteOne(p.id)} title="Unmute" className="p-1 rounded hover:bg-[#F8FAFC] text-[#8A93AE] hover:text-emerald-300 cursor-pointer"><Mic size={11} /></button>
                    : <button onClick={() => muteOne(p.id)} title="Mute" className="p-1 rounded hover:bg-[#F8FAFC] text-[#8A93AE] hover:text-rose-300 cursor-pointer"><MicOff size={11} /></button>}
                  <button onClick={() => removeOne(p.id)} title="Remove" className="p-1 rounded hover:bg-[#F8FAFC] text-[#8A93AE] hover:text-rose-400 cursor-pointer"><X size={11} /></button>
                </div>
              )}
            </div>
          ))}
          <div className="pt-2 border-t border-[#E9E7F5]">
            <button onClick={requestJoin} className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]/80 cursor-pointer">
              <UserPlus size={11} /> {enrolledStudents.filter(s => !participants.some(p => p.name === s.name)).length > 0 ? 'Simulate next student joining' : 'All enrolled students present'}
            </button>
          </div>
        </div>
      )}

      {sidebarTab === 'files' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-2 border-b border-[#E9E7F5]">
            <label className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] text-[#18A878] border border-dashed border-[#18A878]/30 bg-[#ECFBF5]/50 hover:bg-[#ECFBF5] cursor-pointer">
              <UploadCloud size={12} /> Share files to meeting
              <input type="file" multiple className="hidden" onChange={onFileInput} />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[240px] max-h-[300px]">
            {files.length === 0 && (
              <div className="py-8 text-center">
                <FolderOpen size={22} className="mx-auto mb-2 text-[#8A93AE]" />
                <p className="text-[11px] text-[#536078]">No files shared yet</p>
              </div>
            )}
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
                <span className="w-8 h-8 rounded-lg bg-[#FEF5E7] border border-amber-500/20 flex items-center justify-center shrink-0"><FileText size={14} className="text-amber-400" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-[#0F1B3D] truncate">{f.name}</div>
                  <div className="text-[9px] text-[#536078]">{f.sender} · {fmtSize(f.size)} · {f.time}</div>
                </div>
                <a href={f.url} download={f.name} className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><Download size={12} /></a>
              </div>
            ))}
          </div>
        </div>
      )}

      {sidebarTab === 'breakout' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[240px] max-h-[300px]">
          {rooms.length === 0 ? (
            <div className="pt-4 text-center space-y-3">
              <DoorOpen size={22} className="mx-auto text-[#8A93AE]" />
              <p className="text-[11px] text-[#536078]">Split the meeting into smaller groups</p>
              <div className="flex items-center justify-center gap-1.5">
                {[2, 3, 4].map(c => (
                  <button key={c} onClick={() => createRooms(c)} className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all cursor-pointer ${roomCount === c ? 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/30' : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:text-[#0F1B3D]'}`}>{c} rooms</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold">Breakout rooms</span>
                <button onClick={closeAllRooms} className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] text-[#536078] border border-[#E9E7F5] hover:text-rose-300 hover:border-rose-500/30 cursor-pointer"><Lock size={9} /> Close all</button>
              </div>
              {rooms.map(r => (
                <div key={r.id} className="rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#0F1B3D] flex items-center gap-1.5"><DoorOpen size={11} className="text-[#18A878]" /> {r.name}</span>
                    <button onClick={() => toggleRoom(r.id)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] border transition-all cursor-pointer ${r.open ? 'text-[#18A878] border-[#18A878]/40 bg-[#ECFBF5]' : 'text-[#536078] border-[#E9E7F5] bg-[#F8FAFC]'}`}>
                      {r.open ? <CheckCircle2 size={9} /> : <Clock size={9} />} {r.open ? 'Open' : 'Closed'}
                    </button>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {r.members.length === 0 && <p className="text-[10px] text-[#8A93AE]">Empty room</p>}
                    {r.members.map(mid => {
                      const p = participants.find(x => x.id === mid)
                      if (!p) return null
                      return (
                        <div key={mid} className="flex items-center gap-1.5 text-[10px] text-[#536078]">
                          <GripVertical size={9} className="text-[#8A93AE] shrink-0" />
                          <span className="truncate flex-1">{p.name}</span>
                          <select value={r.id} onChange={e => moveMember(mid, r.id, Number(e.target.value))} className="text-[9px] bg-white border border-[#E9E7F5] rounded px-1 py-0.5 text-[#536078] outline-none cursor-pointer">
                            {rooms.map(rr => <option key={rr.id} value={rr.id}>{rr.name}</option>)}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <button onClick={() => setRooms([])} className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-[#536078] border border-[#E9E7F5] hover:text-rose-300 hover:border-rose-500/30 cursor-pointer">
                <Trash2 size={11} /> Delete all rooms
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  const videoTile = (p: Participant, small: boolean) => {
    const active = p.isSpeaking
    const ring = active ? 'ring-2 ring-emerald-400/80 shadow-[0_0_20px_-2px_rgba(16,185,129,0.5)]' : 'border border-white/[0.1]'
    return (
      <div className={`relative ${small ? 'aspect-video' : 'aspect-video'} rounded-xl overflow-hidden bg-gradient-to-br ${p.color} ${p.isSelf && camOn && !camStream ? backgrounds[bgIndex].cls : ''} ${ring} flex items-center justify-center transition-all`}>
        {p.isSelf && camStream ? (
          <video ref={selfVideoRef} autoPlay muted playsInline className="w-full h-full object-cover -scale-x-100" />
        ) : p.isSelf && camOn && !camStream ? (
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
        ) : null}
        {p.isVideoOn || p.isSelf ? (
          <div className={`${small ? 'w-9 h-9' : 'w-12 h-12'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center z-10 overflow-hidden ${p.isSelf && camOn && !camStream ? 'bg-white/20' : ''}`}>
            {p.avatar ? <img src={getImageUrl(p.avatar)} alt={p.name} className="w-full h-full object-cover" /> : <span className={`${small ? 'text-[11px]' : 'text-base'} font-bold text-white/80`}>{initials(p.name)}</span>}
          </div>
        ) : (
          <div className={`${small ? 'w-9 h-9' : 'w-12 h-12'} rounded-full bg-slate-600/50 flex items-center justify-center overflow-hidden`}>
            {p.avatar ? <img src={getImageUrl(p.avatar)} alt={p.name} className="w-full h-full object-cover" /> : <span className={`${small ? 'text-[11px]' : 'text-base'} font-bold text-white/80`}>{initials(p.name)}</span>}
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-20">
          {p.role === 'host' && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[8px] font-bold"><Crown size={8} /> Host</span>}
          {p.role === 'cohost' && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-500/90 text-black text-[8px] font-bold"><BadgeCheck size={8} /> Co-host</span>}
          {p.isSelf && <span className="px-1.5 py-0.5 rounded bg-black/50 text-[8px] font-semibold text-white">You</span>}
        </div>
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
          {!small && <span className="px-1.5 py-0.5 rounded bg-black/50 text-[8px] font-semibold text-emerald-300 flex items-center gap-0.5"><Radio size={7} className="animate-pulse" /> HD</span>}
        </div>
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 z-20">
          <span className={`${small ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-black/50 flex items-center justify-center ${p.isMuted ? 'text-rose-400' : 'text-emerald-300'}`}>
            {p.isMuted ? <MicOff size={small ? 8 : 10} /> : <Mic size={small ? 8 : 10} />}
          </span>
          {p.isSpeaking && <span className={`px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-black text-[8px] font-bold flex items-center gap-0.5`}><Sparkles size={7} /> Speaking</span>}
        </div>
        <div className="absolute bottom-1.5 right-1.5 z-20">
          <span className={`${small ? 'text-[9px]' : 'text-[10px]'} text-white/80 drop-shadow`}>{p.name}</span>
        </div>
      </div>
    )
  }

  const galleryView = (
    <div className={`grid gap-2.5 ${screenShare ? '' : 'grid-cols-2 lg:grid-cols-3'}`}>
      {participants.map(p => videoTile(p, false))}
    </div>
  )

  const speakerView = (
    <div className="space-y-2.5">
      <div className="relative">
        {videoTile(activeSpeaker, false)}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {participants.filter(p => p.id !== activeSpeaker.id).map(p => videoTile(p, true))}
      </div>
    </div>
  )

  const simulatedScreen = (
    <div className="w-full h-full bg-gradient-to-br from-[#042718] to-[#000B05] p-6 flex flex-col items-center justify-center text-center">
      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 mb-4 flex items-center gap-1.5"><Presentation size={12} /> Presentation · Screen Share</span>
      <h3 className="text-xl font-bold text-white">{cls?.title || 'Live Class'}</h3>
      <p className="text-[11px] text-slate-400 mt-1">Interactive session · {participants.length} participants</p>
      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
        {['Today’s objectives', 'Key concepts', 'Live demo', 'Q&A'].map((s, i) => (
          <div key={s} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left">
            <div className="text-[10px] text-emerald-400 font-semibold">Slide {i + 1}</div>
            <div className="text-xs text-white mt-1">{s}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const stage = screenShare ? (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.1] aspect-video bg-black">
      {screenMode === 'live'
        ? <video ref={screenVideoRef} autoPlay className="w-full h-full object-contain" />
        : simulatedScreen}
      <div className="absolute bottom-2 right-2 w-44 z-20">{videoTile(activeSpeaker, true)}</div>
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold flex items-center gap-1"><ScreenShare size={9} /> You are sharing</span>
      </div>
    </div>
  ) : viewMode === 'speaker' ? speakerView : galleryView

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl bg-white border border-[#E9E7F5] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push(`/dashboard/classes/${params.id}`)} className="flex items-center gap-1.5 text-[11px] text-[#536078] hover:text-[#6D3DF5] transition-colors cursor-pointer">
            <ArrowLeft size={12} /> Back
          </button>
          <span className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
            <MonitorPlay size={14} className="text-blue-400" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#0F1B3D] truncate">{cls?.title || 'Zoom Meeting'}</div>
            <div className="text-[11px] text-[#536078]">Zoom Meeting · {viewMode === 'speaker' ? 'Speaker view' : 'Gallery view'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
          {recording && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> REC {recMode === 'cloud' ? <Cloud size={10} /> : <HardDrive size={10} />} {fmtClock(recSeconds)}
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E9E7F5] text-[10px] font-medium text-[#536078]">
            <Clock size={10} /> {fmtClock(elapsed)}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E9E7F5] text-[10px] font-medium text-[#536078]">
            {meetingId}
            <button onClick={copyId} className="text-[#8A93AE] hover:text-[#0F1B3D] transition-colors cursor-pointer">
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          </span>
          {locked && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold text-amber-300">
              <Lock size={10} /> Locked
              <button onClick={() => setShowPasscode(v => !v)} className="cursor-pointer" title={showPasscode ? 'Hide passcode' : 'Show passcode'}>
                {showPasscode ? <KeyRound size={10} /> : <KeyRound size={10} />}
              </button>
              {showPasscode && <span className="tracking-widest">{passcode}</span>}
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E9E7F5] text-[10px] font-medium text-[#536078]">
            <Users size={11} /> {participants.length}
          </span>
        </div>
      </div>

      {/* Main stage + sidebar */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={`${screenShare}-${viewMode}-${participants.length}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              {stage}
            </motion.div>
          </AnimatePresence>
        </div>
        {showSidebar && sidePanel}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white border border-[#E9E7F5] shadow-sm flex-wrap">
        <button onClick={toggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${micOn ? 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]' : 'bg-rose-500 text-white hover:bg-rose-400'}`} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn ? <Mic size={17} /> : <MicOff size={17} />}
        </button>
        <button onClick={toggleCam} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${camOn ? 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]' : 'bg-rose-500 text-white hover:bg-rose-400'}`} title={camOn ? 'Stop video' : 'Start video'}>
          {camOn ? <Video size={17} /> : <VideoOff size={17} />}
        </button>
        <button onClick={toggleScreen} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${screenShare ? 'bg-[#6D3DF5] text-white hover:bg-[#6D3DF5]/90' : 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]'}`} title="Share screen">
          <ScreenShare size={17} />
        </button>
        <button onClick={() => setViewMode(v => v === 'gallery' ? 'speaker' : 'gallery')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${viewMode === 'speaker' ? 'bg-[#6D3DF5] text-white hover:bg-[#6D3DF5]/90' : 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]'}`} title={viewMode === 'speaker' ? 'Gallery view' : 'Speaker view'}>
          {viewMode === 'speaker' ? <LayoutGrid size={17} /> : <Maximize size={17} />}
        </button>

        <div className="relative">
          <button onClick={() => setMoreOpen(v => !v)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${moreOpen ? 'bg-[#6D3DF5] text-white' : 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]'}`} title="More controls">
            <MoreHorizontal size={17} />
          </button>
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 z-50 rounded-xl bg-white border border-[#E9E7F5] p-1.5 shadow-xl">
                {[
                  { icon: ImagePlus, label: 'Virtual background', action: () => setModal('background') },
                  { icon: recMode ? Square : Play, label: recording ? 'Stop recording' : 'Record (Cloud/Local)', action: () => recording ? stopRecording() : setModal('recording') },
                  { icon: LayoutGrid, label: 'Breakout rooms', action: () => { setSidebarTab('breakout'); setShowSidebar(true) } },
                  { icon: CalendarPlus, label: 'Schedule a meeting', action: () => setModal('schedule') },
                  { icon: locked ? Unlock : Lock, label: locked ? 'Unlock meeting' : 'Lock meeting', action: () => setModal('lock') },
                  { icon: FolderOpen, label: 'Share files', action: () => { setSidebarTab('files'); setShowSidebar(true) } },
                ].map(item => (
                  <button key={item.label} onClick={() => { setMoreOpen(false); item.action() }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] text-[#536078] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer text-left">
                    <item.icon size={14} className="text-[#8A93AE]" /> {item.label}
                  </button>
                ))}
                <div className="mt-1 pt-1.5 border-t border-[#E9E7F5] px-2.5 pb-1 flex items-center justify-between">
                  <span className="text-[9px] text-[#8A93AE] flex items-center gap-1"><ShieldCheck size={9} /> Meeting secured</span>
                  {locked ? <Lock size={9} className="text-amber-400" /> : <Unlock size={9} className="text-[#8A93AE]" />}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={() => { setSidebarTab('chat'); setShowSidebar(v => !v) }} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${showSidebar && sidebarTab === 'chat' ? 'bg-[#6D3DF5] text-white' : 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]'}`} title="Chat">
          <MessageCircle size={17} />
        </button>
        <button onClick={() => { setSidebarTab('participants'); setShowSidebar(v => !v) }} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E9E7F5] ${showSidebar && sidebarTab === 'participants' ? 'bg-[#6D3DF5] text-white' : 'bg-[#F8FAFC] text-[#536078] hover:bg-[#F3EEFF] hover:text-[#6D3DF5]'}`} title="Participants">
          <Users size={17} />
        </button>
        <button onClick={() => router.push(`/dashboard/classes/${params.id}`)} className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 transition-all cursor-pointer" title="Leave meeting">
          <PhoneOff size={17} />
        </button>
      </div>

      {/* Background modal */}
      <AnimatePresence>
        {modal === 'background' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={modalCls} onClick={() => setModal('none')}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className={panelCls} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E7F5]">
                <span className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2"><ImagePlus size={15} className="text-[#18A878]" /> Virtual Background</span>
                <button onClick={() => setModal('none')} className="p-1 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={15} /></button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {backgrounds.map((b, i) => (
                    <button key={b.name} onClick={() => setBgIndex(i)}
                      className={`aspect-video rounded-lg ${b.cls} border relative overflow-hidden cursor-pointer ${bgIndex === i ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-white/[0.1] hover:border-white/[0.3]'}`}>
                      {bgIndex === i && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-black" /></span>}
                      <span className="absolute bottom-1 left-1.5 text-[9px] text-white/90 drop-shadow">{b.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#536078] mt-3">Background applies to your video when the camera is active.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording modal */}
      <AnimatePresence>
        {modal === 'recording' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={modalCls} onClick={() => setModal('none')}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className={panelCls} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E7F5]">
                <span className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2"><Radio size={15} className="text-rose-400" /> Record Meeting</span>
                <button onClick={() => setModal('none')} className="p-1 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={15} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => startRecording('cloud')} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#18A878]/30 hover:bg-[#ECFBF5]/50 transition-all cursor-pointer">
                    <Cloud size={18} className="text-[#18A878] mx-auto mb-1.5" />
                    <div className="text-[11px] font-semibold text-[#0F1B3D] text-center">Cloud</div>
                    <div className="text-[9px] text-[#536078] text-center mt-0.5">Stored securely online</div>
                  </button>
                  <button onClick={() => startRecording('local')} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#18A878]/30 hover:bg-[#ECFBF5]/50 transition-all cursor-pointer">
                    <HardDrive size={18} className="text-sky-400 mx-auto mb-1.5" />
                    <div className="text-[11px] font-semibold text-[#0F1B3D] text-center">Local</div>
                    <div className="text-[9px] text-[#536078] text-center mt-0.5">Saved to your device</div>
                  </button>
                </div>
                {recordings.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold mb-1.5">Recent recordings</div>
                    <div className="space-y-1.5">
                      {recordings.map(r => (
                        <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
                          {r.mode === 'cloud' ? <Cloud size={12} className="text-[#18A878] shrink-0" /> : <HardDrive size={12} className="text-sky-400 shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] text-[#0F1B3D] capitalize">{r.mode} recording</div>
                            <div className="text-[9px] text-[#536078]">{r.duration} · {r.size} · {r.time}</div>
                          </div>
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule modal */}
      <AnimatePresence>
        {modal === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={modalCls} onClick={() => setModal('none')}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className={`${panelCls} max-w-md`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E7F5]">
                <span className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2"><CalendarPlus size={15} className="text-[#18A878]" /> Schedule a Meeting</span>
                <button onClick={() => setModal('none')} className="p-1 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={15} /></button>
              </div>
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                <form onSubmit={scheduleMeeting} className="space-y-2.5">
                  <input value={schTitle} onChange={e => setSchTitle(e.target.value)} placeholder="Meeting topic" className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] placeholder:text-[#8A93AE] focus:outline-none focus:border-[#6D3DF5]/40" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={schDate} onChange={e => setSchDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]/40" />
                    <input type="time" value={schTime} onChange={e => setSchTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] focus:outline-none focus:border-[#6D3DF5]/40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#536078] flex items-center gap-1"><Timer size={11} /> Duration</span>
                    <div className="flex gap-1 flex-1">
                      {[30, 60, 90, 120].map(d => (
                        <button type="button" key={d} onClick={() => setSchDur(d)} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] border transition-all cursor-pointer ${schDur === d ? 'bg-[#F3EEFF] text-[#6D3DF5] border-[#6D3DF5]/30' : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:text-[#0F1B3D]'}`}>{d}m</button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#6D3DF5] text-white hover:bg-[#6D3DF5]/90 transition-all cursor-pointer">
                    <CalendarPlus size={13} /> Schedule
                  </button>
                </form>
                {scheduled.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold mb-1.5">Upcoming meetings</div>
                    <div className="space-y-1.5">
                      {scheduled.map(s => (
                        <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5]">
                          <span className="w-8 h-8 rounded-lg bg-[#ECFBF5] border border-[#18A878]/20 flex items-center justify-center shrink-0"><Calendar size={13} className="text-[#18A878]" /></span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] text-[#0F1B3D] truncate">{s.title}</div>
                            <div className="text-[9px] text-[#536078]">{s.date} · {s.time} · {s.duration}m</div>
                            <div className="text-[8px] text-[#18A878]/70 truncate">{s.link}</div>
                          </div>
                          <button onClick={() => copyLink(s.link)} className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] text-[#536078] border border-[#E9E7F5] hover:text-[#0F1B3D] cursor-pointer"><Copy size={9} /> Copy</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock modal */}
      <AnimatePresence>
        {modal === 'lock' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={modalCls} onClick={() => setModal('none')}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className={`${panelCls} max-w-sm`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E7F5]">
                <span className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2"><Lock size={15} className="text-amber-400" /> Meeting Security</span>
                <button onClick={() => setModal('none')} className="p-1 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={15} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <div>
                    <div className="text-[11px] font-semibold text-[#0F1B3D] flex items-center gap-1.5">{locked ? <Lock size={11} className="text-amber-400" /> : <Unlock size={11} className="text-[#536078]" />} Lock meeting</div>
                    <div className="text-[9px] text-[#536078] mt-0.5">{locked ? 'New participants need a passcode to join' : 'Prevent new participants from joining'}</div>
                  </div>
                  <button onClick={() => setLocked(v => !v)} className={`relative w-10 rounded-full transition-all cursor-pointer ${locked ? 'bg-amber-500' : 'bg-white/[0.12]'}`} style={{ height: 22 }}>
                    <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${locked ? 'left-[20px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <div className="text-[11px] font-semibold text-[#0F1B3D] flex items-center gap-1.5 mb-2"><KeyRound size={11} className="text-[#18A878]" /> Passcode</div>
                  <div className="flex items-center gap-2">
                    <span className={`flex-1 px-3 py-2 rounded-lg bg-white border border-[#E9E7F5] text-sm font-bold tracking-[0.3em] text-[#6D3DF5] text-center ${showPasscode ? '' : 'blur-[6px]'}`}>{passcode}</span>
                    <button onClick={() => setShowPasscode(v => !v)} className="p-2 rounded-lg border border-[#E9E7F5] text-[#536078] hover:text-[#0F1B3D] cursor-pointer">{showPasscode ? <X size={13} /> : <Shield size={13} />}</button>
                    <button onClick={() => { setPasscode(Math.floor(100000 + Math.random() * 900000).toString()); toast.success('New passcode generated') }} className="p-2 rounded-lg border border-[#E9E7F5] text-[#536078] hover:text-[#18A878] cursor-pointer" title="Regenerate"><RefreshCw size={13} /></button>
                  </div>
                </div>
                <p className="text-[9px] text-[#8A93AE] flex items-center gap-1.5"><ShieldAlert size={10} /> Passcode is shown to participants when they try to join a locked meeting.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join modal (simulated) */}
      <AnimatePresence>
        {joinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={modalCls} onClick={() => setJoinModal(false)}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className={`${panelCls} max-w-sm`} onClick={e => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-[#E9E7F5] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0F1B3D] flex items-center gap-2"><Lock size={15} className="text-amber-400" /> Meeting is locked</span>
                <button onClick={() => setJoinModal(false)} className="p-1 rounded-md text-[#8A93AE] hover:text-[#0F1B3D] hover:bg-[#F8FAFC] cursor-pointer"><X size={15} /></button>
              </div>
              <form onSubmit={confirmJoin} className="p-4 space-y-3">
                <p className="text-[11px] text-[#536078]">This meeting is locked. A new participant needs the passcode to join.</p>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Enter 6-digit passcode" className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] text-center tracking-[0.3em] placeholder:text-[#8A93AE] placeholder:tracking-normal focus:outline-none focus:border-[#6D3DF5]/40" />
                <button type="submit" className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#6D3DF5] text-white hover:bg-[#6D3DF5]/90 transition-all cursor-pointer">
                  <KeyRound size={13} /> Join with passcode
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
