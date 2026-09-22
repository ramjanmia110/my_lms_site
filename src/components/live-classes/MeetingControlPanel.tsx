'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, Users, DoorOpen, HelpCircle, BarChart3, FileText, Bell,
  FolderOpen, X, Send, UserMinus, UserPlus, UserX, File, HardDrive,
  RefreshCw, AlertTriangle, CheckCircle2, Clock, MessageCircle, Pin,
  ThumbsUp, Plus, Trash2, Edit3, Link2, Megaphone, Vote, Loader2,
  ClipboardList, Video, Radio, Play, Pause, Square, Eye, Database, ListChecks,
  Paperclip, Download, ExternalLink, Calendar, StickyNote, BellRing, Save,
  ShieldAlert, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { liveClassesAPI } from '@/lib/api'
import type { ClassParticipant, ClassRecording2 } from '@/types'
import RecordingPlayerModal from './RecordingPlayerModal'
import { getImageUrl, downloadFile } from '@/lib/utils'

type AttendanceRow = { id: number; userId?: number; name: string; email: string; joinTime: string; duration: string; status: 'present' | 'absent' | 'late' | 'excused'; avatar?: string | null }
type Participant = { id: number; userId: number; name: string; role: string }
type Waiter = { id: number; userId: number; name: string }
type QAItem = { id: number; question: string; answer: string | null; status: string; votes: number; is_pinned: boolean; author: string; answeredBy: string | null; created_at: string }
type Poll = { id: number; question: string; options: string[]; is_active: boolean; results: number[]; total_votes: number; created_at: string }
type QuizQ = { question: string; options: string[]; correct: number; points: number }
type Quiz = { id: number; title: string; questions: { question: string; options: string[]; correct_answer?: number; points?: number }[]; is_active: boolean; created_at: string }
type NoteItem = { id: number; title: string | null; content: string; type: string; author: string; created_at: string; file_url: string | null; file_name: string | null }
type ResourceItem = { id: number; title: string; type: string; url: string | null; file_path: string | null; description: string | null; created_at: string }
type RecordingItem = { id: number; title: string; url: string | null; duration_seconds: number | null; size_mb: number | null; is_public: boolean; view_count: number; created_at: string }
type Announcement = { id: number; title: string; message: string; priority: string; author: string; created_at: string; file_url: string | null; file_name: string | null }
type ChatMsg = { id: number; message: string; author: string; created_at: string }

type PanelData = {
  attendance: AttendanceRow[]
  participants: Participant[]
  waitingRoom: Waiter[]
  qa: QAItem[]
  polls: Poll[]
  quizzes: Quiz[]
  notes: NoteItem[]
  resources: ResourceItem[]
  recordings: RecordingItem[]
  announcements: Announcement[]
  chat: ChatMsg[]
  classStatus: string | null
}

const initialData: PanelData = {
  attendance: [],
  participants: [],
  waitingRoom: [],
  qa: [],
  polls: [],
  quizzes: [],
  notes: [],
  resources: [],
  recordings: [],
  announcements: [],
  chat: [],
  classStatus: null,
}

const ACCENT: Record<string, { tile: string; icon: string; active: string; hover: string; dot: string }> = {
  emerald: { tile: 'bg-[#ECFBF5]', icon: 'text-[#18A878]', active: 'border-[#18A878]/40 bg-[#ECFBF5]', hover: 'hover:border-[#18A878]/40', dot: 'bg-[#18A878]' },
  teal: { tile: 'bg-[#EEF4FF]', icon: 'text-[#3478F6]', active: 'border-[#3478F6]/40 bg-[#EEF4FF]', hover: 'hover:border-[#3478F6]/40', dot: 'bg-[#3478F6]' },
  amber: { tile: 'bg-[#FEF5E7]', icon: 'text-[#F59E0B]', active: 'border-[#F59E0B]/40 bg-[#FEF5E7]', hover: 'hover:border-[#F59E0B]/40', dot: 'bg-[#F59E0B]' },
  sky: { tile: 'bg-[#EEF4FF]', icon: 'text-[#3478F6]', active: 'border-[#3478F6]/40 bg-[#EEF4FF]', hover: 'hover:border-[#3478F6]/40', dot: 'bg-[#3478F6]' },
  violet: { tile: 'bg-[#F3EEFF]', icon: 'text-[#6D3DF5]', active: 'border-[#6D3DF5]/40 bg-[#F3EEFF]', hover: 'hover:border-[#6D3DF5]/40', dot: 'bg-[#6D3DF5]' },
  rose: { tile: 'bg-[#FEE8E8]', icon: 'text-[#E5484D]', active: 'border-[#E5484D]/40 bg-[#FEE8E8]', hover: 'hover:border-[#E5484D]/40', dot: 'bg-[#E5484D]' },
  orange: { tile: 'bg-[#FEF5E7]', icon: 'text-[#F59E0B]', active: 'border-[#F59E0B]/40 bg-[#FEF5E7]', hover: 'hover:border-[#F59E0B]/40', dot: 'bg-[#F59E0B]' },
  blue: { tile: 'bg-[#EEF4FF]', icon: 'text-[#3478F6]', active: 'border-[#3478F6]/40 bg-[#EEF4FF]', hover: 'hover:border-[#3478F6]/40', dot: 'bg-[#3478F6]' },
  fuchsia: { tile: 'bg-[#F3EEFF]', icon: 'text-[#6D3DF5]', active: 'border-[#6D3DF5]/40 bg-[#F3EEFF]', hover: 'hover:border-[#6D3DF5]/40', dot: 'bg-[#6D3DF5]' },
  pink: { tile: 'bg-[#FDEEF7]', icon: 'text-[#DB2777]', active: 'border-[#DB2777]/40 bg-[#FDEEF7]', hover: 'hover:border-[#DB2777]/40', dot: 'bg-[#DB2777]' },
  red: { tile: 'bg-[#FEE8E8]', icon: 'text-[#E5484D]', active: 'border-[#E5484D]/40 bg-[#FEE8E8]', hover: 'hover:border-[#E5484D]/40', dot: 'bg-[#E5484D]' },
  slate: { tile: 'bg-[#F8FAFC]', icon: 'text-[#8A93AE]', active: 'border-[#8A93AE]/40 bg-[#F8FAFC]', hover: 'hover:border-[#8A93AE]/40', dot: 'bg-[#8A93AE]' },
}

const FEATURES: { id: string; label: string; desc: string; icon: any; accent: string }[] = [
  { id: 'attendance', label: 'Attendance', desc: 'Mark & track', icon: UserCheck, accent: 'emerald' },
  { id: 'participants', label: 'Participants', desc: 'Who joined', icon: Users, accent: 'teal' },
  { id: 'waiting-room', label: 'Waiting Room', desc: 'Admit requests', icon: DoorOpen, accent: 'amber' },
  { id: 'chat', label: 'Chat', desc: 'Live messages', icon: MessageCircle, accent: 'sky' },
  { id: 'qa', label: 'Q&A', desc: 'Questions', icon: HelpCircle, accent: 'violet' },
  { id: 'polls', label: 'Polls', desc: 'Vote live', icon: BarChart3, accent: 'rose' },
  { id: 'quiz', label: 'Quiz', desc: 'Quick tests', icon: ClipboardList, accent: 'orange' },
  { id: 'notes', label: 'Notes', desc: 'Take notes', icon: FileText, accent: 'blue' },
  { id: 'resources', label: 'Resources', desc: 'Materials', icon: FolderOpen, accent: 'fuchsia' },
  { id: 'recordings', label: 'Recordings', desc: 'Session replays', icon: Video, accent: 'pink' },
  { id: 'announcements', label: 'Announcements', desc: 'Class updates', icon: Bell, accent: 'red' },
  { id: 'session', label: 'Session', desc: 'Start · pause · end', icon: Radio, accent: 'slate' },
]

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDur(sec: number | null, mins: number | null): string {
  if (mins) return `${mins}m`
  if (!sec) return '—'
  const m = Math.round(sec / 60)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

function fmtSize(mb: number | null): string {
  if (!mb) return '—'
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const inputCls = 'w-full px-3 py-1.5 rounded-md bg-white border border-[#E4E8F2] text-xs text-[#0F1B3D] placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/40 transition-all'
const btnCls = 'flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'
const emptyCls = 'py-8 text-center text-xs text-[#8A93AE]'
const cardCls = 'rounded-lg bg-white border border-[#E9E7F5] p-2.5'

export default function MeetingControlPanel({ classId }: { classId?: number }) {
  const [data, setData] = useState<PanelData>(initialData)
  const [active, setActive] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [qaInput, setQaInput] = useState('')
  const [answerFor, setAnswerFor] = useState<number | null>(null)
  const [answerText, setAnswerText] = useState('')

  const [pollQ, setPollQ] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [showPollForm, setShowPollForm] = useState(false)

  const [quizTitle, setQuizTitle] = useState('')
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([{ question: '', options: ['', ''], correct: 0, points: 1 }])
  const [showQuizForm, setShowQuizForm] = useState(false)

  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteFile, setNoteFile] = useState<File | null>(null)
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [resDesc, setResDesc] = useState('')
  const [resType, setResType] = useState('link')
  const [showResForm, setShowResForm] = useState(false)

  const [annTitle, setAnnTitle] = useState('')
  const [annMsg, setAnnMsg] = useState('')
  const [annPriority, setAnnPriority] = useState('normal')
  const [annFile, setAnnFile] = useState<File | null>(null)
  const [editingAnn, setEditingAnn] = useState<number | null>(null)
  const [editAnnTitle, setEditAnnTitle] = useState('')
  const [editAnnMsg, setEditAnnMsg] = useState('')
  const [editAnnPriority, setEditAnnPriority] = useState('normal')
  const [editAnnFile, setEditAnnFile] = useState<File | null>(null)
  const [removingAnnFile, setRemovingAnnFile] = useState(false)

  const [editingTimeId, setEditingTimeId] = useState<number | null>(null)
  const [editTimeValue, setEditTimeValue] = useState('')

  const [chatInput, setChatInput] = useState('')
  const [playingRec, setPlayingRec] = useState<RecordingItem | null>(null)

  const loadData = useCallback((silent = false) => {
    if (!classId) return
    if (!silent) setLoading(true)
    Promise.all([
      liveClassesAPI.getAttendance(classId).catch(() => null),
      liveClassesAPI.getParticipants(classId).catch(() => null),
      liveClassesAPI.getWaitingRoom(classId).catch(() => null),
      liveClassesAPI.getClassQA(classId).catch(() => null),
      liveClassesAPI.getPolls(classId).catch(() => null),
      liveClassesAPI.getNotes(classId).catch(() => null),
      liveClassesAPI.getClassResources(classId).catch(() => null),
      liveClassesAPI.getClassRecordings(classId).catch(() => null),
      liveClassesAPI.getAnnouncements(classId).catch(() => null),
      liveClassesAPI.getClassChat(classId).catch(() => null),
      liveClassesAPI.getOne(classId).catch(() => null),
    ])
      .then(([attRes, pRes, wRes, qRes, pollRes, nRes, rRes, recRes, anRes, cRes, clsRes]) => {
        const attList = (attRes?.data?.data?.records ?? attRes?.data?.data?.data ?? []) as any[]
        const parts = (pRes?.data?.data?.data ?? pRes?.data?.data ?? []) as ClassParticipant[]
        const waiters = (wRes?.data?.data?.data ?? wRes?.data?.data ?? []) as any[]
        const qaList = (qRes?.data?.data?.data ?? qRes?.data?.data ?? []) as any[]
        const pollList = (pollRes?.data?.data ?? []) as any[]
        const noteList = (nRes?.data?.data ?? []) as any[]
        const resList = (rRes?.data?.data ?? []) as any[]
        const recList = (recRes?.data?.data ?? []) as any[]
        const annList = (anRes?.data?.data ?? []) as any[]
        const chatList = (cRes?.data?.data?.data ?? cRes?.data?.data ?? []) as any[]
        const clsData = clsRes?.data?.data ?? null

        const attendance: AttendanceRow[] = (Array.isArray(attList) ? attList : []).map(r => ({
          id: r.id,
          userId: r.user_id,
          name: r.name || `User ${r.user_id}`,
          email: r.email || '',
          joinTime: fmtTime(r.joined_at),
          duration: fmtDur(r.duration_seconds, r.duration_minutes),
          status: ['present', 'absent', 'late', 'excused'].includes(r.status) ? r.status : 'present',
          avatar: r.avatar || r.user?.avatar || r.user?.image || null,
        }))
        const participants: Participant[] = (Array.isArray(parts) ? parts : [])
          .filter(p => p.status === 'joined' && p.user)
          .map(p => ({ id: p.id, userId: p.user_id, name: p.user!.name, role: p.user!.role === 'instructor' ? 'Instructor' : 'Student' }))
        const waitingRoom: Waiter[] = (Array.isArray(waiters) ? waiters : [])
          .filter(w => w.status === 'waiting')
          .map(w => ({ id: w.id, userId: w.user_id, name: w.user?.name || `User ${w.user_id}` }))
        const qa: QAItem[] = (Array.isArray(qaList) ? qaList : []).map(x => ({
          id: x.id, question: x.question, answer: x.answer ?? null,
          status: x.status || 'pending', votes: x.votes ?? 0, is_pinned: !!x.is_pinned,
          author: x.user?.name || `User ${x.user_id}`, answeredBy: x.answerer?.name || null,
          created_at: x.created_at,
        }))
        const allPolls = (Array.isArray(pollList) ? pollList : [])
        const polls: Poll[] = allPolls
          .filter(x => Array.isArray(x.options) && x.options.length && x.options.every((o: any) => typeof o === 'string'))
          .map(x => ({
            id: x.id, question: x.question, options: x.options,
            is_active: !!x.is_active,
            results: x.results && typeof x.results === 'object' ? Object.values(x.results) : [],
            total_votes: x.total_votes ?? 0, created_at: x.created_at,
          }))
        const quizzes: Quiz[] = allPolls
          .filter(x => Array.isArray(x.options) && x.options.length && x.options.some((o: any) => typeof o === 'object'))
          .map(x => ({
            id: x.id, title: x.question,
            questions: (x.options || []).map((q: any) => ({ question: q.question || '', options: Array.isArray(q.options) ? q.options : [], correct_answer: q.correct_answer, points: q.points })),
            is_active: !!x.is_active, created_at: x.created_at,
          }))
        const notes: NoteItem[] = (Array.isArray(noteList) ? noteList : []).map(x => ({
          id: x.id, title: x.title ?? null, content: x.content, type: x.type || 'note',
          author: x.user?.name || 'You', created_at: x.created_at,
          file_url: x.file_url ?? null, file_name: x.file_name ?? null,
        }))
        const resources: ResourceItem[] = (Array.isArray(resList) ? resList : []).map(x => ({
          id: x.id, title: x.title, type: x.type || 'link', url: x.url ?? null,
          file_path: x.file_path ?? null, description: x.description ?? null, created_at: x.created_at,
        }))
        const recordings: RecordingItem[] = (Array.isArray(recList) ? recList : []).map(x => ({
          id: x.id, title: x.title, url: x.url ?? null, duration_seconds: x.duration_seconds ?? null,
          size_mb: x.size_mb ?? null, is_public: !!x.is_public, view_count: x.view_count ?? 0, created_at: x.created_at,
        }))
        const announcements: Announcement[] = (Array.isArray(annList) ? annList : []).map(x => ({
          id: x.id, title: x.title, message: x.message, priority: x.priority || 'normal',
          author: x.user?.name || 'Instructor', created_at: x.created_at,
          file_url: x.file_url ?? null, file_name: x.file_name ?? null,
        }))
        const chat: ChatMsg[] = (Array.isArray(chatList) ? chatList : [])
          .filter(x => x.message)
          .map(x => ({ id: x.id, message: x.message, author: x.user?.name || `User ${x.user_id}`, created_at: x.created_at }))
          .reverse()

        setStudentCount(attendance.length)
        setData({ attendance, participants, waitingRoom, qa, polls, quizzes, notes, resources, recordings, announcements, chat, classStatus: clsData?.status || null })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classId])

  useEffect(() => { loadData() }, [loadData])

  const togglePanel = (id: string) => {
    setError(false)
    setActive(prev => (prev === id ? null : id))
  }

  const handleRetry = () => { setError(false); loadData() }

  const run = async (fn: () => Promise<any>, key: string, success: string, fail: string, refetch?: () => Promise<void>) => {
    setBusy(key)
    try {
      const res = await fn()
      toast.success(success)
      if (refetch) {
        await refetch()
      } else {
        await loadData(true)
      }
      return res
    } catch {
      toast.error(fail)
    } finally {
      setBusy(null)
    }
  }

  const setAttendanceStatus = (id: number, status: 'present' | 'absent') => {
    const row = data.attendance.find(a => a.id === id)
    setData(d => ({ ...d, attendance: d.attendance.map(a => (a.id === id ? { ...a, status } : a)) }))
    if (classId && row) {
      liveClassesAPI.markAttendance(classId, { attendance: [{ user_id: row.userId ?? row.id, present: status === 'present' }] }).catch(() => {})
    }
  }

  const removeParticipant = (id: number) => {
    const p = data.participants.find(x => x.id === id)
    if (!classId || !p) return
    run(() => liveClassesAPI.removeParticipant(classId, p.userId), `rm-${p.userId}`, `${p.name} removed`, 'Failed to remove participant')
  }

  const admitPerson = (id: number) => {
    const w = data.waitingRoom.find(x => x.id === id)
    if (!classId || !w) return
    run(() => liveClassesAPI.approveWaiting(classId, w.userId), `admit-${w.userId}`, `${w.name} admitted`, 'Failed to admit')
  }

  const denyPerson = (id: number) => {
    const w = data.waitingRoom.find(x => x.id === id)
    if (!classId || !w) return
    run(() => liveClassesAPI.rejectWaiting(classId, w.userId), `deny-${w.userId}`, `${w.name} denied`, 'Failed to deny')
  }

  const admitAll = () => {
    if (!classId) return
    run(() => liveClassesAPI.admitAll(classId), 'admit-all', 'All admitted', 'Failed to admit all')
  }

  const askQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !qaInput.trim()) return
    run(() => liveClassesAPI.askQuestion(classId, { question: qaInput.trim() }), 'ask', 'Question posted', 'Failed to post')
      .then(() => setQaInput(''))
  }

  const submitAnswer = (qaId: number) => {
    if (!classId || !answerText.trim()) return
    run(() => liveClassesAPI.answerQuestion(classId, qaId, { answer: answerText.trim() }), `ans-${qaId}`, 'Answer saved', 'Failed to save')
      .then(() => { setAnswerFor(null); setAnswerText('') })
  }

  const voteQuestion = (qaId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.voteQuestion(classId, qaId), `vq-${qaId}`, 'Voted', 'Failed to vote')
  }

  const pinQuestion = (qaId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.pinQuestion(classId, qaId), `pq-${qaId}`, 'Updated', 'Failed to update')
  }

  const createPoll = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !pollQ.trim()) return
    const options = pollOptions.map(o => o.trim()).filter(Boolean)
    if (options.length < 2) { toast.error('Add at least 2 options'); return }
    run(() => liveClassesAPI.sendPoll(classId, { question: pollQ.trim(), options }), 'poll', 'Poll created', 'Failed to create poll')
      .then(() => { setPollQ(''); setPollOptions(['', '']); setShowPollForm(false) })
  }

  const votePoll = (pollId: number, index: number) => {
    if (!classId) return
    run(() => liveClassesAPI.votePoll(classId, pollId, { selected_option: index }), `vp-${pollId}`, 'Vote recorded', 'Failed to vote')
  }

  const endPoll = (pollId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.endPoll(classId, pollId), `ep-${pollId}`, 'Poll ended', 'Failed to end')
  }

  const createQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !quizTitle.trim()) return
    const questions = quizQuestions
      .map(q => ({ question: q.question.trim(), options: q.options.map(o => o.trim()).filter(Boolean), correct_answer: q.correct, points: q.points || 1 }))
      .filter(q => q.question && q.options.length >= 2)
    if (questions.length === 0) { toast.error('Add at least one valid question (2+ options)'); return }
    run(() => liveClassesAPI.sendQuiz(classId, { title: quizTitle.trim(), questions }), 'quiz', 'Quiz created', 'Failed to create quiz')
      .then(() => { setQuizTitle(''); setQuizQuestions([{ question: '', options: ['', ''], correct: 0, points: 1 }]); setShowQuizForm(false) })
  }

  const createNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !noteContent.trim()) return
    const body: any = { title: noteTitle.trim() || null, content: noteContent.trim(), type: 'note' }
    const onSaved = (res: any) => {
      const created = res?.data?.data
      if (created?.id) {
        const note: NoteItem = {
          id: created.id, title: created.title ?? null, content: created.content, type: created.type || 'note',
          author: created.user?.name || 'You', created_at: created.created_at,
          file_url: created.file_url ?? null, file_name: created.file_name ?? null,
        }
        setData(d => ({ ...d, notes: [note, ...d.notes] }))
      }
      setNoteTitle(''); setNoteContent(''); setNoteFile(null)
    }
    if (noteFile) {
      const fd = new FormData()
      fd.append('title', noteTitle.trim() || '')
      fd.append('content', noteContent.trim())
      fd.append('type', 'note')
      fd.append('file', noteFile)
      run(() => liveClassesAPI.createNote(classId, fd), 'note', 'Note saved', 'Failed to save note')
        .then(onSaved)
      return
    }
    run(() => liveClassesAPI.createNote(classId, body), 'note', 'Note saved', 'Failed to save note')
      .then(onSaved)
  }

  const saveEditNote = (noteId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.updateNote(classId, noteId, { content: editContent }), `en-${noteId}`, 'Note updated', 'Failed to update')
      .then(() => {
        setData(d => ({ ...d, notes: d.notes.map(n => (n.id === noteId ? { ...n, content: editContent } : n)) }))
        setEditingNote(null)
      })
  }

  const deleteNote = (noteId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.deleteNote(classId, noteId), `dn-${noteId}`, 'Note deleted', 'Failed to delete')
      .then(() => setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== noteId) })))
  }

  const addResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !resTitle.trim()) return
    run(() => liveClassesAPI.createResource({ title: resTitle.trim(), type: resType, class_id: classId, url: resUrl.trim() || undefined, description: resDesc.trim() || undefined }), 'res', 'Resource added', 'Failed to add resource')
      .then(() => { setResTitle(''); setResUrl(''); setResDesc(''); setShowResForm(false) })
  }

  const deleteResource = (resId: number) => {
    run(() => liveClassesAPI.deleteResource(resId), `dr-${resId}`, 'Resource deleted', 'Failed to delete')
  }

  const deleteRecording = (recId: number) => {
    run(() => liveClassesAPI.deleteRecording(recId), `drec-${recId}`, 'Recording deleted', 'Failed to delete')
  }

  const createAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !annMsg.trim()) return
    const body: any = { title: annTitle.trim() || 'Announcement', message: annMsg.trim(), priority: annPriority }
    const onPosted = (res: any) => {
      const created = res?.data?.data
      if (created?.id) {
        const ann: Announcement = {
          id: created.id, title: created.title || 'Announcement', message: created.message, priority: created.priority || 'normal',
          author: created.user?.name || 'Instructor', created_at: created.created_at,
          file_url: created.file_url ?? null, file_name: created.file_name ?? null,
        }
        setData(d => ({ ...d, announcements: [ann, ...d.announcements] }))
      }
      setAnnTitle(''); setAnnMsg(''); setAnnPriority('normal'); setAnnFile(null)
    }
    if (annFile) {
      const fd = new FormData()
      fd.append('title', annTitle.trim() || 'Announcement')
      fd.append('message', annMsg.trim())
      fd.append('priority', annPriority)
      fd.append('file', annFile)
      run(() => liveClassesAPI.createAnnouncement(classId, fd), 'ann', 'Announcement posted', 'Failed to post')
        .then(onPosted)
      return
    }
    run(() => liveClassesAPI.createAnnouncement(classId, body), 'ann', 'Announcement posted', 'Failed to post')
      .then(onPosted)
  }

  const startEditAnnouncement = (a: Announcement) => {
    setEditingAnn(a.id)
    setEditAnnTitle(a.title)
    setEditAnnMsg(a.message)
    setEditAnnPriority(a.priority || 'normal')
    setEditAnnFile(null)
    setRemovingAnnFile(false)
  }

  const saveEditAnnouncement = (annId: number) => {
    if (!classId) return
    const payload: any = { title: editAnnTitle.trim() || 'Announcement', message: editAnnMsg.trim(), priority: editAnnPriority }
    if (removingAnnFile) payload.remove_file = '1'
    const update = () => {
      if (editAnnFile) {
        const fd = new FormData()
        fd.append('title', payload.title)
        fd.append('message', payload.message)
        fd.append('priority', payload.priority)
        fd.append('file', editAnnFile)
        return liveClassesAPI.updateAnnouncement(classId, annId, fd)
      }
      return liveClassesAPI.updateAnnouncement(classId, annId, payload)
    }
    run(update, `ea-${annId}`, 'Announcement updated', 'Failed to update')
      .then((res) => {
        const updated = res?.data?.data
        if (updated?.id) {
          const ann: Announcement = {
            id: updated.id, title: updated.title || 'Announcement', message: updated.message, priority: updated.priority || 'normal',
            author: updated.user?.name || 'Instructor', created_at: updated.created_at,
            file_url: updated.file_url ?? null, file_name: updated.file_name ?? null,
          }
          setData(d => ({ ...d, announcements: d.announcements.map(x => (x.id === annId ? ann : x)) }))
        }
        setEditingAnn(null)
        setEditAnnFile(null)
        setRemovingAnnFile(false)
      })
  }

  const deleteAnnouncement = (annId: number) => {
    if (!classId) return
    run(() => liveClassesAPI.deleteAnnouncement(classId, annId), `da-${annId}`, 'Announcement deleted', 'Failed to delete')
      .then(() => setData(d => ({ ...d, announcements: d.announcements.filter(x => x.id !== annId) })))
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId || !chatInput.trim()) return
    run(() => liveClassesAPI.sendChat(classId, { message: chatInput.trim() }), 'chat', 'Sent', 'Failed to send')
      .then(() => setChatInput(''))
  }

  const endSessionNow = () => {
    if (!classId) return
    run(() => liveClassesAPI.endSession(classId), 'end', 'Session ended', 'Failed to end session')
  }

  const pauseSessionNow = () => {
    if (!classId) return
    run(() => liveClassesAPI.pauseSession(classId), 'pause', 'Session paused', 'Failed to pause')
  }

  const resumeSessionNow = () => {
    if (!classId) return
    run(() => liveClassesAPI.resumeSession(classId), 'resume', 'Session resumed', 'Failed to resume')
  }

  const countFor = (id: string): number => {
    switch (id) {
      case 'attendance': return data.attendance.length
      case 'participants': return data.participants.length
      case 'waiting-room': return data.waitingRoom.length
      case 'chat': return data.chat.length
      case 'qa': return data.qa.filter(q => q.status !== 'answered').length
      case 'polls': return data.polls.filter(p => p.is_active).length
      case 'quiz': return data.quizzes.length
      case 'notes': return data.notes.length
      case 'resources': return data.resources.length
      case 'recordings': return data.recordings.length
      case 'announcements': return data.announcements.length
      default: return 0
    }
  }

  const priorityBadge: Record<string, string> = {
    low: 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5]',
    normal: 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/25',
    high: 'bg-[#FEF5E7] text-[#F59E0B] border-[#F59E0B]/25',
    urgent: 'bg-red-50 text-[#E5484D] border-[#E5484D]/25',
  }

  const statusBadge: Record<string, string> = {
    live: 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/30',
    scheduled: 'bg-[#EEF4FF] text-[#3478F6] border-[#3478F6]/30',
    completed: 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5]',
    cancelled: 'bg-red-50 text-[#E5484D] border-[#E5484D]/30',
    paused: 'bg-[#FEF5E7] text-[#F59E0B] border-[#F59E0B]/30',
  }

  const errorView = (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertTriangle size={22} className="text-[#F59E0B] mb-2" />
      <p className="text-sm text-[#536078] font-medium mb-3">Something went wrong</p>
      <button onClick={handleRetry} className={`${btnCls} bg-[#F8FAFC] border border-[#E9E7F5] text-[#0F1B3D] hover:bg-[#E9E7F5]`}>
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  )

  const renderPanel = () => {
    if (loading) return <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-[#8A93AE]" /></div>
    switch (active) {
      case 'attendance': {
        const stats = {
          present: data.attendance.filter(a => a.status === 'present').length,
          absent: data.attendance.filter(a => a.status === 'absent').length,
          late: data.attendance.filter(a => a.status === 'late').length,
          excused: data.attendance.filter(a => a.status === 'excused').length,
        }
        const pct = data.attendance.length > 0 ? Math.round((stats.present / data.attendance.length) * 100) : 0
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Present', value: stats.present, cls: 'text-[#18A878] bg-[#ECFBF5] border-[#18A878]/25', dot: 'bg-[#18A878]' },
                { label: 'Absent', value: stats.absent, cls: 'text-[#E5484D] bg-red-50 border-[#E5484D]/25', dot: 'bg-[#E5484D]' },
                { label: 'Late', value: stats.late, cls: 'text-[#F59E0B] bg-[#FEF5E7] border-[#F59E0B]/25', dot: 'bg-[#F59E0B]' },
                { label: 'Excused', value: stats.excused, cls: 'text-[#3478F6] bg-[#ECFBF5] border-[#E9E7F5]', dot: 'bg-[#3478F6]' },
              ].map(s => (
                <div key={s.label} className={`rounded-lg border ${s.cls} p-2 text-center`}>
                  <div className="text-sm font-bold">{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wide opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#F8FAFC] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#18A878] to-[#18A878]/70" />
              </div>
              <span className="text-[10px] text-[#18A878] font-semibold shrink-0">{pct}%</span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
              {data.attendance.map(a => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-[#F8FAFC] border border-[#E9E7F5]">
                  {a.avatar ? (
                    <img src={getImageUrl(a.avatar)} alt={a.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#6D3DF5]/15 flex items-center justify-center text-[10px] font-bold text-[#6D3DF5] shrink-0">{initials(a.name)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#0F1B3D] truncate">{a.name}</div>
                    <div className="text-[9px] text-[#8A93AE] flex items-center gap-1">
                      {editingTimeId === a.id ? (
                        <>
                          <input
                            type="text"
                            value={editTimeValue}
                            onChange={e => setEditTimeValue(e.target.value)}
                            onBlur={() => {
                              setData(d => ({ ...d, attendance: d.attendance.map(row => row.id === a.id ? { ...row, joinTime: editTimeValue } : row) }))
                              setEditingTimeId(null)
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                setData(d => ({ ...d, attendance: d.attendance.map(row => row.id === a.id ? { ...row, joinTime: editTimeValue } : row) }))
                                setEditingTimeId(null)
                              }
                              if (e.key === 'Escape') setEditingTimeId(null)
                            }}
                            className="w-16 px-1 py-0.5 rounded border border-[#6D3DF5]/40 bg-white text-[9px] text-[#0F1B3D] focus:outline-none"
                            autoFocus
                          />
                        </>
                      ) : (
                        <>
                          <Clock size={9} />
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#6D3DF5]/10 text-[#6D3DF5] font-medium text-[9px]">
                            {a.joinTime}
                          </span>
                          <button
                            onClick={() => { setEditingTimeId(a.id); setEditTimeValue(a.joinTime) }}
                            className="p-0.5 rounded hover:bg-[#E9E7F5] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors"
                            title="Edit check-in time"
                          >
                            <Edit3 size={8} />
                          </button>
                          <span>· {a.duration}</span>
                        </>
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        a.status === 'present' ? 'bg-[#18A878]' : a.status === 'absent' ? 'bg-[#E5484D]' : a.status === 'late' ? 'bg-[#F59E0B]' : 'bg-[#3478F6]'
                      }`} />
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setAttendanceStatus(a.id, 'present')} title="Mark present"
                      className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all ${
                        a.status === 'present' ? 'bg-[#ECFBF5] text-[#18A878] border-[#18A878]/25' : 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5] hover:text-[#18A878] hover:border-[#18A878]/25'
                      }`}>
                      <UserCheck size={12} />
                    </button>
                    <button onClick={() => setAttendanceStatus(a.id, 'absent')} title="Mark absent"
                      className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all ${
                        a.status === 'absent' ? 'bg-red-50 text-[#E5484D] border-[#E5484D]/25' : 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5] hover:text-[#E5484D] hover:border-[#E5484D]/25'
                      }`}>
                      <UserX size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {data.attendance.length === 0 && <div className={emptyCls}>No attendance records yet</div>}
            </div>
          </div>
        )
      }

      case 'participants':
        return (
          <div className="space-y-2">
            {data.participants.length === 0 && <div className={emptyCls}>No participants joined yet</div>}
            <ul className="divide-y divide-[#E9E7F5] max-h-72 overflow-y-auto">
              {data.participants.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-[#ECFBF5] flex items-center justify-center text-[10px] font-bold text-[#18A878] shrink-0">{initials(p.name)}</span>
                    <div className="min-w-0">
                      <div className="text-xs text-[#0F1B3D] truncate">{p.name}</div>
                      <div className="text-[10px] text-[#8A93AE]">{p.role}</div>
                    </div>
                  </div>
                  <button onClick={() => removeParticipant(p.id)} disabled={busy === `rm-${p.userId}`}
                    className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5] hover:text-[#E5484D] hover:border-[#E5484D]/25 hover:bg-red-50`}>
                    {busy === `rm-${p.userId}` ? <Loader2 size={12} className="animate-spin" /> : <UserMinus size={12} />} Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )

      case 'waiting-room':
        return (
          <div className="space-y-2">
            {data.waitingRoom.length > 0 && (
              <div className="flex justify-end">
                <button onClick={admitAll} disabled={busy === 'admit-all'}
                  className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                  {busy === 'admit-all' ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />} Admit all
                </button>
              </div>
            )}
            {data.waitingRoom.length === 0 && <div className={emptyCls}>No pending requests</div>}
            <ul className="divide-y divide-[#E9E7F5]">
              {data.waitingRoom.map(w => (
                <li key={w.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[10px] font-bold text-[#536078] shrink-0">{initials(w.name)}</span>
                    <span className="text-xs text-[#0F1B3D] truncate">{w.name}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => admitPerson(w.id)} disabled={busy === `admit-${w.userId}`}
                      className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                      {busy === `admit-${w.userId}` ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />} Admit
                    </button>
                    <button onClick={() => denyPerson(w.id)} disabled={busy === `deny-${w.userId}`}
                      className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5] hover:text-[#E5484D] hover:border-[#E5484D]/25 hover:bg-red-50`}>
                      <UserX size={12} /> Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )

      case 'chat':
        return (
          <div className="space-y-3">
            <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
              {data.chat.map(m => (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[9px] font-bold text-[#3478F6] shrink-0">{initials(m.author)}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8A93AE]">{m.author} · {fmtTime(m.created_at)}</div>
                    <div className="text-xs text-[#0F1B3D] mt-0.5">{m.message}</div>
                  </div>
                </div>
              ))}
              {data.chat.length === 0 && <div className={emptyCls}>No messages yet</div>}
            </div>
            <form onSubmit={sendChat} className="flex gap-1.5">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className={inputCls} />
              <button type="submit" className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white shrink-0`}>
                <Send size={12} /> Send
              </button>
            </form>
          </div>
        )

      case 'qa':
        return (
          <div className="space-y-3">
            <form onSubmit={askQuestion} className="flex gap-1.5">
              <input value={qaInput} onChange={e => setQaInput(e.target.value)} placeholder="Ask a question..." className={inputCls} />
              <button type="submit" className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white shrink-0`}>
                <Send size={12} /> Ask
              </button>
            </form>
            <div className="space-y-2">
              {data.qa.map(q => (
                <div key={q.id} className={cardCls}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-[#0F1B3D] leading-relaxed flex-1">{q.is_pinned && <Pin size={10} className="inline text-[#F59E0B] mr-1" />}{q.question}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${
                      q.status === 'answered' ? 'bg-[#ECFBF5] text-[#18A878]' : 'bg-[#FEF5E7] text-[#F59E0B]'
                    }`}>{q.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8A93AE]">
                    <span>{q.author}</span>
                    <button onClick={() => voteQuestion(q.id)} disabled={busy === `vq-${q.id}`}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E9E7F5] hover:text-[#18A878] hover:border-[#18A878]/25">
                      <ThumbsUp size={9} /> {q.votes}
                    </button>
                    <button onClick={() => pinQuestion(q.id)} disabled={busy === `pq-${q.id}`}
                      className={`px-1.5 py-0.5 rounded border ${q.is_pinned ? 'bg-[#FEF5E7] text-[#F59E0B] border-[#F59E0B]/25' : 'bg-[#F8FAFC] text-[#8A93AE] border-[#E9E7F5] hover:text-[#F59E0B]'}`}>
                      <Pin size={9} />
                    </button>
                  </div>
                  {q.answer ? (
                    <div className="mt-2 p-2 rounded-md bg-[#ECFBF5] border border-[#18A878]/25">
                      <div className="text-[10px] text-[#18A878]/80 font-medium mb-0.5">Answer{q.answeredBy ? ` by ${q.answeredBy}` : ''}</div>
                      <p className="text-[11px] text-[#536078] leading-relaxed">{q.answer}</p>
                    </div>
                  ) : answerFor === q.id ? (
                    <div className="mt-2 flex gap-1.5">
                      <input value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Write answer..." className={inputCls} autoFocus />
                      <button onClick={() => submitAnswer(q.id)} className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white shrink-0`}>Save</button>
                    </div>
                  ) : (
                    <button onClick={() => { setAnswerFor(q.id); setAnswerText('') }}
                      className="mt-1.5 text-[10px] text-[#18A878]/80 hover:text-[#18A878] font-medium">Answer</button>
                  )}
                </div>
              ))}
              {data.qa.length === 0 && <div className={emptyCls}>No questions yet</div>}
            </div>
          </div>
        )

      case 'polls':
        return (
          <div className="space-y-3">
            {showPollForm ? (
              <form onSubmit={createPoll} className="space-y-2">
                <input value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Poll question..." className={inputCls} autoFocus />
                {pollOptions.map((o, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input value={o} onChange={e => setPollOptions(list => list.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className={inputCls} />
                    {i > 1 && (
                      <button type="button" onClick={() => setPollOptions(list => list.filter((_, j) => j !== i))}
                        className="w-7 h-7 rounded-md border border-[#E9E7F5] text-[#8A93AE] hover:text-[#E5484D] flex items-center justify-center shrink-0">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button type="button" onClick={() => setPollOptions(list => [...list, ''])}
                    className="flex items-center gap-1 text-[10px] text-[#18A878]/80 hover:text-[#18A878]">
                    <Plus size={10} /> Add option
                  </button>
                )}
                <div className="flex gap-1.5">
                  <button type="submit" className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-[#0F1B3D]`}>
                    <Vote size={12} /> Create poll
                  </button>
                  <button type="button" onClick={() => setShowPollForm(false)} className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5]`}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowPollForm(true)} className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                <Plus size={12} /> New poll
              </button>
            )}
            <div className="space-y-3">
              {data.polls.map(poll => {
                const total = poll.options.map((_, i) => poll.results[i] ?? 0).reduce((s, v) => s + v, 0)
                return (
                  <div key={poll.id} className={cardCls}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#0F1B3D]">{poll.question}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${poll.is_active ? 'bg-[#ECFBF5] text-[#18A878]' : 'bg-[#FEF5E7] text-[#8A93AE]'}`}>
                        {poll.is_active ? 'Live' : 'Ended'}
                      </span>
                    </div>
                    <div className="space-y-2 mt-2">
                      {poll.options.map((opt, i) => {
                        const v = poll.results[i] ?? 0
                        const pct = total > 0 ? Math.round((v / total) * 100) : 0
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-[10px] text-[#8A93AE] mb-1">
                              <span className="text-[#536078]">{opt}</span>
                              <span className="flex items-center gap-1">{v} · {pct}%</span>
                            </div>
                            {poll.is_active ? (
                              <button onClick={() => votePoll(poll.id, i)} disabled={busy === `vp-${poll.id}`}
                                className="w-full h-1.5 rounded-full bg-[#F8FAFC] overflow-hidden hover:bg-[#E9E7F5] transition-colors">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
                                  className="h-full rounded-full bg-gradient-to-r from-[#18A878] to-[#18A878]/70" />
                              </button>
                            ) : (
                              <div className="h-1.5 rounded-full bg-[#F8FAFC] overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-[#8A93AE]/50 to-[#8A93AE]/30" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-[#8A93AE]">
                      <span>{total} votes</span>
                      {poll.is_active && (
                        <button onClick={() => endPoll(poll.id)} disabled={busy === `ep-${poll.id}`}
                          className="text-[10px] text-[#8A93AE] hover:text-[#E5484D] font-medium">End poll</button>
                      )}
                    </div>
                  </div>
                )
              })}
              {data.polls.length === 0 && <div className={emptyCls}>No polls yet</div>}
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-3">
            {showQuizForm ? (
              <form onSubmit={createQuiz} className="space-y-3">
                <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Quiz title" className={inputCls} autoFocus />
                <div className="space-y-2">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className="rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] p-2.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <ListChecks size={12} className="text-[#F59E0B] shrink-0" />
                        <span className="text-[10px] font-semibold text-[#8A93AE] shrink-0">Q{qi + 1}</span>
                        <input value={q.question} onChange={e => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, question: e.target.value } : x)))}
                          placeholder="Question..." className={inputCls} />
                        {qi > 0 && (
                          <button type="button" onClick={() => setQuizQuestions(list => list.filter((_, j) => j !== qi))}
                            className="w-7 h-7 rounded-md border border-[#E9E7F5] text-[#8A93AE] hover:text-[#E5484D] flex items-center justify-center shrink-0">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      {q.options.map((o, oi) => (
                        <div key={oi} className="flex gap-1.5 items-center">
                          <input value={o} onChange={e => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, options: x.options.map((y, k) => (k === oi ? e.target.value : y)) } : x)))}
                            placeholder={`Option ${oi + 1}`} className={inputCls} />
                          {oi > 1 && (
                            <button type="button" onClick={() => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, options: x.options.filter((_, k) => k !== oi) } : x)))}
                              className="w-7 h-7 rounded-md border border-[#E9E7F5] text-[#8A93AE] hover:text-[#E5484D] flex items-center justify-center shrink-0">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                      {q.options.length < 4 && (
                        <button type="button" onClick={() => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, options: [...x.options, ''] } : x)))}
                          className="flex items-center gap-1 text-[10px] text-[#18A878]/80 hover:text-[#18A878]">
                          <Plus size={10} /> Add option
                        </button>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-[#8A93AE]">
                        <label className="flex items-center gap-1">Correct:
                          <select value={q.correct} onChange={e => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, correct: Number(e.target.value) } : x)))}
                            className="bg-[#F8FAFC] border border-[#E9E7F5] rounded px-1 py-0.5 text-[10px] text-[#0F1B3D]">
                            {q.options.map((_, oi) => <option key={oi} value={oi}>#{oi + 1}</option>)}
                          </select>
                        </label>
                        <label className="flex items-center gap-1">Points:
                          <input type="number" min={1} value={q.points} onChange={e => setQuizQuestions(list => list.map((x, j) => (j === qi ? { ...x, points: Number(e.target.value) || 1 } : x)))}
                            className="w-14 bg-[#F8FAFC] border border-[#E9E7F5] rounded px-1 py-0.5 text-[10px] text-[#0F1B3D]" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setQuizQuestions(list => [...list, { question: '', options: ['', ''], correct: 0, points: 1 }])}
                  className="flex items-center gap-1 text-[10px] text-[#18A878]/80 hover:text-[#18A878]">
                  <Plus size={10} /> Add question
                </button>
                <div className="flex gap-1.5">
                  <button type="submit" className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#3478F6] text-white`}>
                    <ClipboardList size={12} /> Create quiz
                  </button>
                  <button type="button" onClick={() => setShowQuizForm(false)} className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5]`}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowQuizForm(true)} className={`${btnCls} text-orange-300 border border-orange-500/25 bg-orange-500/10 hover:bg-orange-500/20`}>
                <Plus size={12} /> New quiz
              </button>
            )}
            <div className="space-y-3">
              {data.quizzes.map(quiz => (
                <div key={quiz.id} className={cardCls}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#0F1B3D] flex items-center gap-1.5"><ClipboardList size={12} className="text-[#F59E0B]" />{quiz.title}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${quiz.is_active ? 'bg-[#ECFBF5] text-[#18A878]' : 'bg-[#FEF5E7] text-[#8A93AE]'}`}>
                      {quiz.is_active ? 'Live' : 'Ended'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {quiz.questions.map((qq, i) => (
                      <div key={i} className="text-[11px] text-[#536078]">
                        <span className="text-[#8A93AE]">Q{i + 1}.</span> {qq.question}
                        <span className="text-[9px] text-[#8A93AE] ml-1.5">{qq.options.length} options · {qq.points ?? 1}pt</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {data.quizzes.length === 0 && <div className={emptyCls}>No quizzes yet</div>}
            </div>
          </div>
        )

      case 'notes':
        return (
          <div className="space-y-3">
            <form onSubmit={createNote} className="rounded-xl bg-white border border-[#E9E7F5] p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#ECFBF5] border border-[#18A878]/25 flex items-center justify-center shrink-0">
                  <StickyNote size={13} className="text-[#18A878]" />
                </span>
                <span className="text-[11px] font-semibold text-[#536078]">New note</span>
                <span className="flex items-center gap-1 text-[9px] text-[#18A878]/70 ml-auto">
                  <Lock size={9} /> Private · only you can see
                </span>
              </div>
              <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Give your note a title..." className={inputCls} />
              <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your note here... What did you learn today?" rows={3} className={`${inputCls} resize-none`} />
              <div className="flex items-center gap-2 flex-wrap">
                <label className={`${btnCls} cursor-pointer text-[#536078] border border-[#E9E7F5] hover:text-[#18A878] hover:border-[#18A878]/25 ${noteFile ? 'text-[#18A878] border-[#18A878]/25 bg-[#ECFBF5]' : ''}`}>
                  <Paperclip size={12} /> {noteFile ? noteFile.name : 'Attach PDF'}
                  <input type="file" accept="application/pdf,.pdf" className="hidden"
                    onChange={e => setNoteFile(e.target.files?.[0] ?? null)} />
                </label>
                {noteFile && (
                  <button type="button" onClick={() => setNoteFile(null)} className="text-[10px] text-[#8A93AE] hover:text-[#18A878]">
                    Remove
                  </button>
                )}
                <div className="flex-1" />
                <button type="submit" disabled={busy === 'note'} className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white shadow-[0_2px_12px_-2px_rgba(109,61,245,0.4)]`}>
                  {busy === 'note' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save note
                </button>
              </div>
            </form>

            {data.notes.length > 0 && (
              <div className="flex items-center gap-2 px-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold">My notes</span>
                <div className="flex-1 h-px bg-[#F8FAFC]" />
                <span className="text-[10px] text-[#8A93AE]">{data.notes.length} total</span>
              </div>
            )}

            <div className="space-y-2">
              {data.notes.map(note => (
                <div key={note.id}
                  className="group relative rounded-lg bg-[#ECFBF5] to-transparent border-l-2 border-[#18A878]/40 border-y border-r border-[#E9E7F5] p-3 pl-3.5 hover:border-[#18A878]/50 hover:bg-[#ECFBF5] transition-all">
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <input value={note.title || ''} disabled placeholder="Note title" className={`${inputCls} opacity-60`} />
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} className={`${inputCls} resize-none`} autoFocus />
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => saveEditNote(note.id)} disabled={busy === `en-${note.id}`} className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                          {busy === `en-${note.id}` ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                        </button>
                        <button onClick={() => setEditingNote(null)} className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5] hover:text-[#6D3DF5]`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {note.title && <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F1B3D] mb-1">
                            <StickyNote size={11} className="text-[#18A878] shrink-0" />
                            {note.title}
                          </div>}
                          <p className={`text-[11px] text-[#536078] whitespace-pre-wrap leading-relaxed ${note.title ? '' : 'text-[#8A93AE] italic'}`}>{note.content}</p>
                        </div>
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingNote(note.id); setEditContent(note.content) }} title="Edit note" className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#6D3DF5] hover:bg-[#E9E7F5]"><Edit3 size={12} /></button>
                          <button onClick={() => deleteNote(note.id)} disabled={busy === `dn-${note.id}`} title="Delete note" className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#E5484D] hover:bg-red-50"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      {note.file_url && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] px-2.5 py-1.5">
                          <span className="w-6 h-6 rounded-md bg-[#ECFBF5] border border-[#18A878]/25 flex items-center justify-center shrink-0">
                            <FileText size={12} className="text-[#18A878]" />
                          </span>
                          <span className="text-[11px] text-[#536078] truncate min-w-0 flex-1">{note.file_name || 'Attached PDF'}</span>
                          <a href={getImageUrl(note.file_url)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#18A878] hover:text-[#18A878] shrink-0">
                            <ExternalLink size={10} /> View
                          </a>
                          <button onClick={() => downloadFile(getImageUrl(note.file_url), note.file_name || 'note.pdf')}
                            className="flex items-center gap-1 text-[10px] text-[#536078] hover:text-[#6D3DF5] shrink-0">
                            <Download size={10} /> Download
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[9px] text-[#8A93AE]">
                        <span className="flex items-center gap-1 text-[#18A878]/60"><Calendar size={9} /> {fmtDate(note.created_at)}</span>
                        <span>by {note.author}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {data.notes.length === 0 && (
                <div className={emptyCls}>
                  <StickyNote size={20} className="mx-auto mb-2 text-[#8A93AE]" />
                  No notes yet — start capturing your ideas above.
                </div>
              )}
            </div>
          </div>
        )

      case 'resources':
        return (
          <div className="space-y-3">
            {showResForm ? (
              <form onSubmit={addResource} className="space-y-2">
                <input value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="Resource title" className={inputCls} autoFocus />
                <div className="flex gap-1.5">
                  <input value={resUrl} onChange={e => setResUrl(e.target.value)} placeholder="https://..." className={inputCls} />
                  <select value={resType} onChange={e => setResType(e.target.value)} className={`${inputCls} w-28 shrink-0`}>
                    <option value="link">Link</option>
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="doc">Doc</option>
                  </select>
                </div>
                <input value={resDesc} onChange={e => setResDesc(e.target.value)} placeholder="Short description (optional)" className={inputCls} />
                <div className="flex gap-1.5">
                  <button type="submit" className={`${btnCls} bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white`}><Link2 size={12} /> Add resource</button>
                  <button type="button" onClick={() => setShowResForm(false)} className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5]`}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowResForm(true)} className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                <Plus size={12} /> Add resource
              </button>
            )}
            <div className="space-y-1.5">
              {data.resources.map(r => (
                <div key={r.id} className={cardCls}>
                  <div className="flex items-center justify-between gap-2">
                    <a href={r.url || undefined} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 min-w-0 flex-1 hover:text-[#18A878] transition-colors">
                      <span className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                        <File size={13} className="text-blue-400" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-[#0F1B3D] truncate">{r.title}</span>
                        <span className="block text-[9px] text-[#8A93AE] uppercase tracking-wide">{r.type}{r.url ? ' · link' : ' · file'}</span>
                      </span>
                    </a>
                    <button onClick={() => deleteResource(r.id)} disabled={busy === `dr-${r.id}`}
                      className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#E5484D] hover:bg-red-50 shrink-0">
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {r.description && <p className="text-[10px] text-[#8A93AE] mt-1">{r.description}</p>}
                </div>
              ))}
              {data.resources.length === 0 && <div className={emptyCls}>No resources yet</div>}
            </div>
          </div>
        )

      case 'recordings':
        return (
          <div className="space-y-1.5">
            {data.recordings.length === 0 && <div className={emptyCls}>No recordings yet</div>}
            {data.recordings.map(rec => (
              <div key={rec.id} className={cardCls}>
                <div className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => setPlayingRec(rec)}
                    className="flex items-center gap-2 min-w-0 flex-1 hover:text-[#DB2777] transition-colors text-left cursor-pointer group">
                    <span className="w-7 h-7 rounded-md bg-[#FDEEF7] flex items-center justify-center shrink-0 group-hover:bg-[#FDEEF7] transition-colors">
                      <Play size={12} className="text-[#DB2777]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-[#0F1B3D] truncate">{rec.title}</span>
                      <span className="block text-[9px] text-[#8A93AE]">
                        {fmtDur(rec.duration_seconds, null)} · {fmtSize(rec.size_mb)} · {fmtDate(rec.created_at)}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {rec.is_public && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-[#ECFBF5] text-[#18A878] border border-[#18A878]/25">Public</span>}
                    <span className="flex items-center gap-0.5 text-[9px] text-[#8A93AE]"><Eye size={9} />{rec.view_count}</span>
                    <button onClick={() => deleteRecording(rec.id)} disabled={busy === `drec-${rec.id}`}
                      className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#E5484D] hover:bg-red-50">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'announcements':
        return (
          <div className="space-y-3">
            <form onSubmit={createAnnouncement} className="rounded-xl bg-white border border-[#F59E0B]/25 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FEF5E7] border border-[#F59E0B]/25 flex items-center justify-center shrink-0">
                  <Megaphone size={13} className="text-[#F59E0B]" />
                </span>
                <span className="text-[11px] font-semibold text-[#536078]">New announcement</span>
                <span className="flex items-center gap-1 text-[9px] text-[#F59E0B]/70 ml-auto">
                  <Users size={9} /> Visible to all students
                </span>
              </div>
              <div className="flex gap-1.5">
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" className={inputCls} />
                <select value={annPriority} onChange={e => setAnnPriority(e.target.value)} className={`${inputCls} w-28 shrink-0`}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <textarea value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Write your announcement message..." rows={2} className={`${inputCls} resize-none`} />
              <div className="flex items-center gap-2 flex-wrap">
                <label className={`${btnCls} cursor-pointer text-[#536078] border border-[#E9E7F5] hover:text-[#F59E0B] hover:border-[#F59E0B]/25 ${annFile ? 'text-[#F59E0B] border-[#F59E0B]/25 bg-[#FEF5E7]' : ''}`}>
                  <Paperclip size={12} /> {annFile ? annFile.name : 'Attach PDF'}
                  <input type="file" accept="application/pdf,.pdf" className="hidden"
                    onChange={e => setAnnFile(e.target.files?.[0] ?? null)} />
                </label>
                {annFile && (
                  <button type="button" onClick={() => setAnnFile(null)} className="text-[10px] text-[#8A93AE] hover:text-[#F59E0B]">
                    Remove
                  </button>
                )}
                <div className="flex-1" />
                <button type="submit" disabled={busy === 'ann'} className={`${btnCls} bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-[0_2px_12px_-2px_rgba(109,61,245,0.4)]`}>
                  {busy === 'ann' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Post announcement
                </button>
              </div>
            </form>

            {data.announcements.length > 0 && (
              <div className="flex items-center gap-2 px-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[#8A93AE] font-semibold">Announcements</span>
                <div className="flex-1 h-px bg-[#F8FAFC]" />
                <span className="text-[10px] text-[#8A93AE]">{data.announcements.length} total</span>
              </div>
            )}

            <div className="space-y-2">
              {data.announcements.map(a => (
                <div key={a.id}
                  className={`group relative rounded-lg border bg-gradient-to-b p-3 transition-all
                    ${a.priority === 'urgent' ? 'from-red-50 to-transparent border-l-2 border-[#E5484D]/60 border-y border-r border-[#E9E7F5] hover:bg-red-50'
                    : a.priority === 'high' ? 'from-[#FEF5E7] to-transparent border-l-2 border-[#F59E0B]/50 border-y border-r border-[#E9E7F5] hover:bg-[#FEF5E7]'
                    : a.priority === 'low' ? 'from-[#F8FAFC] to-transparent border-l-2 border-[#8A93AE]/40 border-y border-r border-[#E9E7F5] hover:bg-[#F8FAFC]'
                    : 'from-[#ECFBF5] to-transparent border-l-2 border-[#18A878]/40 border-y border-r border-[#E9E7F5] hover:bg-[#ECFBF5]'}`}>
                  {editingAnn === a.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <input value={editAnnTitle} onChange={e => setEditAnnTitle(e.target.value)} placeholder="Title" className={inputCls} />
                        <select value={editAnnPriority} onChange={e => setEditAnnPriority(e.target.value)} className={`${inputCls} w-28 shrink-0`}>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <textarea value={editAnnMsg} onChange={e => setEditAnnMsg(e.target.value)} rows={2} className={`${inputCls} resize-none`} autoFocus />
                      {(a.file_url || editAnnFile) && (
                        <div className="flex items-center gap-2">
                          <label className={`${btnCls} cursor-pointer text-[#536078] border border-[#E9E7F5] hover:text-[#F59E0B] hover:border-[#F59E0B]/25 ${editAnnFile ? 'text-[#F59E0B] border-[#F59E0B]/25 bg-[#FEF5E7]' : ''}`}>
                            <Paperclip size={11} /> {editAnnFile ? editAnnFile.name : (a.file_name || 'Replace PDF')}
                            <input type="file" accept="application/pdf,.pdf" className="hidden"
                              onChange={e => setEditAnnFile(e.target.files?.[0] ?? null)} />
                          </label>
                          <button type="button" onClick={() => { setEditAnnFile(null); setRemovingAnnFile(!removingAnnFile) }}
                            className={`${btnCls} border ${removingAnnFile ? 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#FEF5E7]' : 'text-[#8A93AE] border-[#E9E7F5] hover:text-[#F59E0B]'}`}>
                            {removingAnnFile ? 'Remove pending' : 'Remove file'}
                          </button>
                        </div>
                      )}
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => saveEditAnnouncement(a.id)} disabled={busy === `ea-${a.id}`} className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                          {busy === `ea-${a.id}` ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save changes
                        </button>
                        <button onClick={() => setEditingAnn(null)} className={`${btnCls} text-[#8A93AE] border border-[#E9E7F5] hover:text-[#6D3DF5]`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border
                            ${a.priority === 'urgent' ? 'bg-red-50 border-[#E5484D]/25 text-[#E5484D]'
                            : a.priority === 'high' ? 'bg-[#FEF5E7] border-[#F59E0B]/25 text-[#F59E0B]'
                            : a.priority === 'low' ? 'bg-[#EEF4FF] border-[#3478F6]/30 text-[#3478F6]'
                            : 'bg-[#ECFBF5] border-[#18A878]/25 text-[#18A878]'}`}>
                            <Megaphone size={13} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#0F1B3D] truncate">{a.title}</div>
                            <div className="text-[9px] text-[#8A93AE] mt-0.5">by {a.author} · {fmtDate(a.created_at)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border capitalize ${priorityBadge[a.priority] || priorityBadge.normal}`}>
                            {a.priority === 'urgent' ? <ShieldAlert size={9} /> : <BellRing size={9} />} {a.priority}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditAnnouncement(a)} title="Edit announcement" className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#6D3DF5] hover:bg-[#E9E7F5]"><Edit3 size={12} /></button>
                            <button onClick={() => deleteAnnouncement(a.id)} disabled={busy === `da-${a.id}`} title="Delete announcement" className="p-1.5 rounded-md text-[#8A93AE] hover:text-[#E5484D] hover:bg-red-50"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#536078] leading-relaxed mt-2">{a.message}</p>
                      {a.file_url && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] px-2.5 py-1.5">
                          <span className="w-6 h-6 rounded-md bg-[#FEF5E7] border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                            <FileText size={12} className="text-[#F59E0B]" />
                          </span>
                          <span className="text-[11px] text-[#536078] truncate min-w-0 flex-1">{a.file_name || 'Attached PDF'}</span>
                          <a href={getImageUrl(a.file_url)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#F59E0B] hover:text-[#F59E0B] shrink-0">
                            <ExternalLink size={10} /> View
                          </a>
                          <button onClick={() => downloadFile(getImageUrl(a.file_url), a.file_name || 'announcement.pdf')}
                            className="flex items-center gap-1 text-[10px] text-[#536078] hover:text-[#6D3DF5] shrink-0">
                            <Download size={10} /> Download
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {data.announcements.length === 0 && (
                <div className={emptyCls}>
                  <Megaphone size={20} className="mx-auto mb-2 text-[#8A93AE]" />
                  No announcements yet — share updates with your class.
                </div>
              )}
            </div>
          </div>
        )

      case 'session':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-[#8A93AE]">
                <Database size={13} className="text-[#18A878]" /> Session status
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusBadge[data.classStatus || 'scheduled'] || statusBadge.scheduled}`}>
                {data.classStatus || 'scheduled'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Enrolled', value: studentCount ?? 0, icon: Users, cls: 'text-[#3478F6]' },
                { label: 'Joined', value: data.participants.length, icon: UserCheck, cls: 'text-[#18A878]' },
                { label: 'Present', value: data.attendance.filter(a => a.status === 'present').length, icon: CheckCircle2, cls: 'text-[#F59E0B]' },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] p-2 text-center">
                  <s.icon size={14} className={`${s.cls} mx-auto`} />
                  <div className="text-sm font-bold text-[#0F1B3D] mt-1">{s.value}</div>
                  <div className="text-[9px] text-[#8A93AE] uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={resumeSessionNow} disabled={busy === 'resume' || data.classStatus === 'live'}
                className={`${btnCls} text-[#18A878] border border-[#18A878]/25 bg-[#ECFBF5] hover:bg-[#ECFBF5]`}>
                {busy === 'resume' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Resume
              </button>
              <button onClick={pauseSessionNow} disabled={busy === 'pause' || data.classStatus !== 'live'}
                className={`${btnCls} text-[#F59E0B] border border-[#F59E0B]/25 bg-[#FEF5E7] hover:bg-[#FEF5E7]`}>
                {busy === 'pause' ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />} Pause
              </button>
              <button onClick={endSessionNow} disabled={busy === 'end' || data.classStatus === 'completed' || data.classStatus === 'cancelled'}
                className={`${btnCls} text-[#E5484D] border border-[#E5484D]/25 bg-red-50 hover:bg-red-50`}>
                {busy === 'end' ? <Loader2 size={12} className="animate-spin" /> : <Square size={12} />} End session
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const activeFeature = FEATURES.find(f => f.id === active)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] text-[#8A93AE]">
        <Users size={11} className="text-[#18A878]" />
        <span><span className="text-[#0F1B3D] font-semibold">{studentCount ?? 0}</span> enrolled students loaded from database</span>
        <button onClick={() => loadData()} className="flex items-center gap-1 ml-auto px-2 py-1 rounded-md text-[10px] text-[#8A93AE] border border-[#E9E7F5] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 transition-colors" title="Refresh">
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          const a = ACCENT[f.accent]
          const isActive = active === f.id
          const count = countFor(f.id)
          return (
            <motion.button key={f.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => togglePanel(f.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 group text-left ${
                isActive
                  ? `bg-white ${a.active}`
                  : `bg-white border-[#E9E7F5] ${a.hover} hover:bg-[#F8FAFC]`
              }`}
            >
              {count > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#6D3DF5] text-white text-[8px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.tile} border border-[#E9E7F5] flex items-center justify-center transition-transform group-hover:scale-105`}>
                <Icon size={17} className={a.icon} />
              </div>
              <span className={`text-[11px] font-semibold leading-tight text-center ${isActive ? 'text-[#6D3DF5]' : 'text-[#536078]'}`}>{f.label}</span>
              <span className="text-[9px] text-[#8A93AE] leading-tight -mt-0.5">{f.desc}</span>
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[#18A878]/70" />
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}
            className="rounded-xl bg-white border border-[#E9E7F5] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E9E7F5]">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0F1B3D]">
                {activeFeature && <activeFeature.icon size={13} className="text-[#18A878]" />}
                {activeFeature?.label}
                <span className="text-[9px] text-[#8A93AE] font-normal">· {activeFeature?.desc}</span>
              </span>
              <button onClick={() => setActive(null)} className="p-1 rounded-md hover:bg-[#F3EEFF] text-[#8A93AE] hover:text-[#6D3DF5] transition-colors cursor-pointer">
                <X size={13} />
              </button>
            </div>
            <div className="p-3">{error ? errorView : renderPanel()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <RecordingPlayerModal rec={playingRec ? (playingRec as unknown as ClassRecording2) : null} onClose={() => setPlayingRec(null)} />
    </div>
  )
}
