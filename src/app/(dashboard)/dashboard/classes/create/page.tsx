'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, CheckCircle, Loader2, Zap, Calendar,
  Clock, Users, Tag, Link, DollarSign, Settings, Eye, Sparkles,
  Mic, MessageSquare, HelpCircle, BarChart3, FileText, Globe,
  ArrowLeft, Copy, Share2, Bell, Lock, Video, Repeat
} from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const steps = ['Basic Info', 'Schedule', 'Features', 'Review']

const durationPresets = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

const quickTags = [
  'JavaScript', 'React', 'Node.js', 'Python', 'UI/UX', 'DevOps',
  'Data Science', 'Machine Learning', 'Web Design', 'TypeScript',
  'Database', 'API', 'Testing', 'Security', 'Cloud', 'Mobile',
]

export default function CreateClassWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isInstant = searchParams.get('instant') === '1'

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const currentTime = now.toTimeString().slice(0, 5)
  const laterTime = new Date(now.getTime() + 30 * 60000).toTimeString().slice(0, 5)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: isInstant ? today : '',
    time: isInstant ? laterTime : '',
    duration_minutes: isInstant ? 30 : 60,
    max_participants: 50,
    tags: '',
    recording_enabled: true,
    waiting_room: true,
    chat_enabled: true,
    qa_enabled: true,
    polls_enabled: true,
    notes_enabled: true,
    resources_enabled: true,
    announcements_enabled: true,
    is_free: true,
    price: 0,
    meeting_url: '',
    is_recurring: false,
    level: 'all',
  })

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 0 && form.description.trim().length > 0
    if (step === 1) return !!form.date && !!form.time
    return true
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        duration: String(form.duration_minutes),
        max_students: form.max_participants,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        price: form.is_free ? 0 : form.price,
        level: form.level === 'all' ? null : form.level,
        auto_record: form.recording_enabled ? 1 : 0,
        waitlist_enabled: form.waiting_room ? 1 : 0,
        allow_chat: form.chat_enabled ? 1 : 0,
        allow_qa: form.qa_enabled ? 1 : 0,
        is_recurring: form.is_recurring ? 1 : 0,
      }
      if (form.meeting_url && form.meeting_url.trim()) {
        payload.meeting_url = form.meeting_url.trim()
      }
      if (isInstant) payload.is_instant = 1

      const res = await liveClassesAPI.create(payload)
      const newId = res.data?.data?.id ?? res.data?.id
      toast.success(isInstant ? 'Instant meeting started!' : 'Class created!')
      if (newId) router.push(`/dashboard/classes/${newId}`)
      else router.push('/dashboard/classes')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create class'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleInstantCreate = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a meeting title')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        title: form.title || `Instant Meeting ${new Date().toLocaleString()}`,
        description: form.description || 'Quick instant meeting',
        date: form.date || today,
        time: form.time || currentTime,
        duration: String(form.duration_minutes),
        max_students: form.max_participants,
        auto_record: form.recording_enabled ? 1 : 0,
        waitlist_enabled: form.waiting_room ? 1 : 0,
        allow_chat: form.chat_enabled ? 1 : 0,
        allow_qa: form.qa_enabled ? 1 : 0,
      }
      if (form.meeting_url && form.meeting_url.trim()) {
        payload.meeting_url = form.meeting_url.trim()
      }
      const res = await liveClassesAPI.createInstant(payload)
      toast.success('Instant meeting created!')
      const id = res.data?.data?.id ?? res.data?.id
      if (id) router.push(`/dashboard/classes/${id}`)
      else router.push('/dashboard/classes/live')
    } catch { toast.error('Failed to start instant meeting') } finally { setSaving(false) }
  }

  if (isInstant) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-[#536078] hover:text-[#6D3DF5] transition-colors">
          <ArrowLeft size={13} /> Back to classes
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-7 rounded-2xl bg-white border border-[#E9E7F5] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#FEF5E7] flex items-center justify-center">
              <Zap size={22} className="text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F1B3D]">Instant Meeting</h2>
              <p className="text-xs text-[#536078]">Start a live session right now</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#536078]">Meeting Title</label>
              <input value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="e.g. Quick Sync, Standup, Review..."
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#536078]">Description (optional)</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2}
                placeholder="Brief agenda or notes..."
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 resize-none transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#536078]">Date</label>
                <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#536078]">Time</label>
                <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#536078]">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {durationPresets.map(p => (
                  <button key={p.value} onClick={() => update('duration_minutes', p.value)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${form.duration_minutes === p.value ? 'bg-[#6D3DF5] text-white border-[#6D3DF5]' : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#536078]">Max Participants</label>
              <div className="flex gap-1.5">
                {[10, 25, 50, 100, 200].map(n => (
                  <button key={n} onClick={() => update('max_participants', n)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${form.max_participants === n ? 'bg-[#6D3DF5] text-white border-[#6D3DF5]' : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#536078]">Meeting URL (optional)</label>
              <input value={form.meeting_url} onChange={e => update('meeting_url', e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#536078]">Features</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'recording_enabled', label: 'Recording', icon: Mic },
                  { key: 'chat_enabled', label: 'Chat', icon: MessageSquare },
                  { key: 'qa_enabled', label: 'Q&A', icon: HelpCircle },
                  { key: 'polls_enabled', label: 'Polls', icon: BarChart3 },
                  { key: 'notes_enabled', label: 'Notes', icon: FileText },
                  { key: 'waiting_room', label: 'Waiting', icon: Lock },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => update(key, !form[key as keyof typeof form])}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-medium border transition-all ${form[key as keyof typeof form] ? 'bg-[#F0EAFF] text-[#572ECE] border-[#572ECE]/25' : 'bg-white text-[#8A93AE] border-[#E9E7F5]'}`}>
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleInstantCreate} disabled={saving}
            className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white text-sm font-bold hover:from-[#F59E0B]/90 hover:to-[#F97316]/90 transition-all disabled:opacity-50 shadow-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {saving ? 'Starting...' : 'Start Instant Meeting'}
          </button>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-[#E9E7F5] text-center">
            <Clock size={16} className="mx-auto mb-1 text-[#6D3DF5]" />
            <div className="text-[10px] font-medium text-[#0F1B3D]">Starts Now</div>
            <div className="text-[9px] text-[#8A93AE]">Immediate</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E9E7F5] text-center">
            <Users size={16} className="mx-auto mb-1 text-[#3478F6]" />
            <div className="text-[10px] font-medium text-[#0F1B3D]">{form.max_participants} Max</div>
            <div className="text-[9px] text-[#8A93AE]">Participants</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E9E7F5] text-center">
            <Video size={16} className="mx-auto mb-1 text-[#572ECE]" />
            <div className="text-[10px] font-medium text-[#0F1B3D]">{form.duration_minutes} min</div>
            <div className="text-[9px] text-[#8A93AE]">Duration</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-[#536078] hover:text-[#6D3DF5] transition-colors">
        <ArrowLeft size={13} /> Back to classes
      </button>

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${i < step ? 'bg-[#572ECE] text-white' : i === step ? 'bg-[#6D3DF5] text-white' : 'bg-[#F3F5FB] text-[#8A93AE] border border-[#E9E7F5]'}`}>
              {i < step ? <CheckCircle size={12} /> : i + 1}
            </div>
            <span className={`text-[11px] hidden sm:inline ${i === step ? 'text-[#0F1B3D] font-semibold' : i < step ? 'text-[#572ECE]' : 'text-[#8A93AE]'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`w-6 h-px ${i < step ? 'bg-[#572ECE]' : 'bg-[#E9E7F5]'}`} />}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[#E9E7F5] shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[#6D3DF5]" />
                  <h3 className="text-sm font-bold text-[#0F1B3D]">Class Details</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Class Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Advanced JavaScript Masterclass"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Description *</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Describe what students will learn in this class..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 resize-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Tags</label>
                  <input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="Comma separated tags..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {quickTags.slice(0, 8).map(tag => {
                      const selected = form.tags.toLowerCase().includes(tag.toLowerCase())
                      return (
                        <button key={tag} onClick={() => {
                          const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
                          if (selected) { update('tags', tags.filter(t => t.toLowerCase() !== tag.toLowerCase()).join(', ')) }
                          else { update('tags', [...tags, tag].join(', ')) }
                        }} className={`px-2 py-1 rounded-md text-[9px] font-medium border transition-all ${selected ? 'bg-[#6D3DF5] text-white border-[#6D3DF5]' : 'bg-[#F8FAFC] text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Meeting URL (optional)</label>
                  <div className="flex gap-2">
                    <input value={form.meeting_url} onChange={e => update('meeting_url', e.target.value)} placeholder="https://zoom.us/j/..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
                    <button className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5] text-[#8A93AE] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 transition-colors">
                      <Link size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#536078]">Free Class</label>
                    <Toggle value={form.is_free} onChange={v => update('is_free', v)} />
                  </div>
                  {!form.is_free && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-[#8A93AE]" />
                      <input type="number" value={form.price || ''} onChange={e => update('price', Number(e.target.value))} placeholder="Price"
                        className="w-20 px-2 py-1.5 rounded-lg bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs text-center focus:outline-none focus:border-[#6D3DF5]/30" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-[#3478F6]" />
                  <h3 className="text-sm font-bold text-[#0F1B3D]">Schedule</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#536078]">Date *</label>
                    <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#536078]">Time *</label>
                    <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs focus:outline-none focus:border-[#6D3DF5]/30 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {durationPresets.map(p => (
                      <button key={p.value} onClick={() => update('duration_minutes', p.value)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-medium border transition-all ${form.duration_minutes === p.value ? 'bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm' : 'bg-white text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#536078]">Max Participants</label>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100, 200].map(n => (
                      <button key={n} onClick={() => update('max_participants', n)}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-medium border transition-all ${form.max_participants === n ? 'bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm' : 'bg-white text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/30'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <div className="flex items-center gap-2">
                    <Repeat size={14} className="text-[#8A93AE]" />
                    <span className="text-xs text-[#536078]">Recurring Class</span>
                  </div>
                  <Toggle value={form.is_recurring} onChange={v => update('is_recurring', v)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={16} className="text-[#572ECE]" />
                  <h3 className="text-sm font-bold text-[#0F1B3D]">Features & Settings</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'recording_enabled', label: 'Recording', desc: 'Auto-record sessions for replay', icon: Mic, color: '#6D3DF5' },
                    { key: 'chat_enabled', label: 'Live Chat', desc: 'Real-time messaging during class', icon: MessageSquare, color: '#3478F6' },
                    { key: 'qa_enabled', label: 'Q&A', desc: 'Students can ask questions', icon: HelpCircle, color: '#572ECE' },
                    { key: 'polls_enabled', label: 'Live Polls', desc: 'Interactive polls and surveys', icon: BarChart3, color: '#F59E0B' },
                    { key: 'notes_enabled', label: 'Notes', desc: 'Students can take notes', icon: FileText, color: '#E5484D' },
                    { key: 'waiting_room', label: 'Waiting Room', desc: 'Control who joins the class', icon: Lock, color: '#8A93AE' },
                    { key: 'resources_enabled', label: 'Resources', desc: 'Share files and materials', icon: FileText, color: '#6D3DF5' },
                    { key: 'announcements_enabled', label: 'Announcements', desc: 'Post class updates', icon: Bell, color: '#3478F6' },
                  ].map(({ key, label, desc, icon: Icon, color }) => (
                    <div key={key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${form[key as keyof typeof form] ? 'bg-white border-[#E9E7F5] shadow-sm' : 'bg-[#F8FAFC] border-[#E9E7F5]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#0F1B3D]">{label}</div>
                          <div className="text-[10px] text-[#8A93AE]">{desc}</div>
                        </div>
                      </div>
                      <Toggle value={!!form[key as keyof typeof form]} onChange={v => update(key, v)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={16} className="text-[#6D3DF5]" />
                  <h3 className="text-sm font-bold text-[#0F1B3D]">Review & Create</h3>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E9E7F5]">
                  <div className="text-sm font-bold text-[#0F1B3D] mb-1">{form.title || 'Untitled Class'}</div>
                  <div className="text-xs text-[#536078] mb-3">{form.description || 'No description'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <ReviewField icon={Calendar} label="Date" value={form.date || 'Not set'} />
                    <ReviewField icon={Clock} label="Time" value={form.time || 'Not set'} />
                    <ReviewField icon={Clock} label="Duration" value={`${form.duration_minutes} min`} />
                    <ReviewField icon={Users} label="Max" value={`${form.max_participants} students`} />
                    <ReviewField icon={DollarSign} label="Price" value={form.is_free ? 'Free' : `$${form.price}`} />
                    <ReviewField icon={Globe} label="Level" value={form.level === 'all' ? 'All Levels' : form.level} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.recording_enabled && <FeatureTag label="Recording" icon={Mic} />}
                  {form.chat_enabled && <FeatureTag label="Chat" icon={MessageSquare} />}
                  {form.qa_enabled && <FeatureTag label="Q&A" icon={HelpCircle} />}
                  {form.polls_enabled && <FeatureTag label="Polls" icon={BarChart3} />}
                  {form.notes_enabled && <FeatureTag label="Notes" icon={FileText} />}
                  {form.waiting_room && <FeatureTag label="Waiting Room" icon={Lock} />}
                  {form.resources_enabled && <FeatureTag label="Resources" icon={FileText} />}
                  {form.announcements_enabled && <FeatureTag label="Announcements" icon={Bell} />}
                </div>
                {form.tags && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag size={12} className="text-[#8A93AE]" />
                    {form.tags.split(',').filter(Boolean).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#F3EEFF] text-[10px] font-medium text-[#6D3DF5]">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-[#E9E7F5] text-[#536078] text-xs font-medium hover:border-[#6D3DF5]/30 hover:text-[#6D3DF5] transition-all disabled:opacity-30">
          <ChevronLeft size={13} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-[#6D3DF5] text-white text-xs font-bold hover:bg-[#5B2FE0] transition-colors disabled:opacity-50 shadow-sm">
            Next <ChevronRight size={13} />
          </button>
        ) : (
          <button onClick={handleCreate} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-xs font-bold hover:from-[#6D3DF5]/90 hover:to-[#3478F6]/90 transition-all disabled:opacity-50 shadow-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {saving ? 'Creating...' : 'Create Class'}
          </button>
        )}
      </div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full transition-all relative ${value ? 'bg-[#572ECE]' : 'bg-[#E9E7F5]'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function ReviewField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white border border-[#E9E7F5]">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="text-[#8A93AE]" />
        <div className="text-[9px] text-[#8A93AE]">{label}</div>
      </div>
      <div className="text-[11px] text-[#0F1B3D] font-medium truncate">{value || '—'}</div>
    </div>
  )
}

function FeatureTag({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#F0EAFF] text-[10px] font-medium text-[#572ECE] border border-[#572ECE]/20">
      <Icon size={10} />
      {label}
    </span>
  )
}
