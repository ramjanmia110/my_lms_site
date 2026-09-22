'use client'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X, Plus, Trash2, Upload, UserPlus, Bell, BellOff, Mail, Smartphone,
  Monitor, FileText, Settings2, ChevronDown, ChevronUp, Users, Lock,
} from 'lucide-react'
import type { Class } from '@/types'

interface Props {
  editingClass: Class | null
  onClose: () => void
  onSave: (data: FormData) => void
}

const CATEGORIES = [
  'Web Development', 'Computer Science', 'Design', 'Programming',
  'Marketing', 'Mathematics', 'Data Science', 'English', 'Writing', 'Business',
]

export default function CreateClassForm({ editingClass, onClose, onSave }: Props) {
  const [title, setTitle] = useState(editingClass?.title || '')
  const [description, setDescription] = useState(editingClass?.description || '')
  const [date, setDate] = useState(editingClass?.date || '')
  const [time, setTime] = useState(editingClass?.time || '')
  const [duration, setDuration] = useState(editingClass?.duration || '60')
  const [meetingUrl, setMeetingUrl] = useState(editingClass?.meeting_url || '')
  const [category, setCategory] = useState(editingClass?.category || '')
  const [level, setLevel] = useState<string>(editingClass?.level || '')
  const [language, setLanguage] = useState(editingClass?.language || 'English')
  const [maxStudents, setMaxStudents] = useState(String(editingClass?.max_students || 50))
  const [price, setPrice] = useState(String(editingClass?.price || ''))
  const [platform, setPlatform] = useState<string>(editingClass?.platform || 'zoom')
  const [autoRecord, setAutoRecord] = useState(editingClass?.auto_record || false)
  const [allowChat, setAllowChat] = useState(editingClass?.allow_chat !== false)
  const [allowQa, setAllowQa] = useState(editingClass?.allow_qa !== false)
  const [prerequisites, setPrerequisites] = useState(editingClass?.prerequisites || '')
  const [materialsUrl, setMaterialsUrl] = useState(editingClass?.materials_url || '')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [tags, setTags] = useState((editingClass?.tags || []).join(', '))

  // New: co-host invite
  const [coHosts, setCoHosts] = useState<string[]>([])
  const [coHostInput, setCoHostInput] = useState('')

  // New: notification settings
  const [notify24h, setNotify24h] = useState(true)
  const [notify1h, setNotify1h] = useState(true)
  const [notify5min, setNotify5min] = useState(true)
  const [emailNotify, setEmailNotify] = useState(true)
  const [pushNotify, setPushNotify] = useState(true)
  const [smsNotify, setSmsNotify] = useState(false)

  // New: advanced settings
  const [waitlistEnabled, setWaitlistEnabled] = useState(editingClass?.waitlist_enabled || false)
  const [allowScreenShare, setAllowScreenShare] = useState(true)
  const [allowBreakoutRooms, setAllowBreakoutRooms] = useState(false)
  const [enableCaptions, setEnableCaptions] = useState(false)
  const [lowBandwidth, setLowBandwidth] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setThumbnailFile(file)
  }, [])

  const addCoHost = () => {
    if (coHostInput.trim() && !coHosts.includes(coHostInput.trim())) {
      setCoHosts(prev => [...prev, coHostInput.trim()])
      setCoHostInput('')
    }
  }

  const handleSubmit = (status: 'draft' | 'published') => {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('date', date)
    fd.append('time', time)
    fd.append('duration', duration)
    fd.append('meeting_url', meetingUrl)
    fd.append('category', category)
    fd.append('level', level)
    fd.append('language', language)
    fd.append('max_students', maxStudents)
    fd.append('price', price || '0')
    fd.append('platform', platform)
    fd.append('auto_record', autoRecord ? '1' : '0')
    fd.append('allow_chat', allowChat ? '1' : '0')
    fd.append('allow_qa', allowQa ? '1' : '0')
    fd.append('prerequisites', prerequisites)
    fd.append('materials_url', materialsUrl)
    fd.append('tags', tags)
    fd.append('status', status)
    fd.append('co_hosts', JSON.stringify(coHosts))
    fd.append('waitlist_enabled', waitlistEnabled ? '1' : '0')
    fd.append('notify_24h', notify24h ? '1' : '0')
    fd.append('notify_1h', notify1h ? '1' : '0')
    fd.append('notify_5min', notify5min ? '1' : '0')
    fd.append('email_notify', emailNotify ? '1' : '0')
    fd.append('push_notify', pushNotify ? '1' : '0')
    fd.append('sms_notify', smsNotify ? '1' : '0')
    if (thumbnailFile) fd.append('thumbnail', thumbnailFile)
    onSave(fd)
  }

  const inputStyle = { background: '#0d251c', border: '1px solid #1f3a2d', color: '#e8fff3' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: '#0a1b14', border: '1px solid #1f6f52' }}
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[#1f3a2d]" style={{ background: '#0a1b14' }}>
          <h2 className="text-lg font-bold text-white">{editingClass ? 'Edit class' : 'Create class'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.05]"><X size={18} color="#8fae9f" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Title */}
          <div><label className="text-xs text-white font-medium block mb-1">Class title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={inputStyle} /></div>

          {/* Description */}
          <div><label className="text-xs text-white font-medium block mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none resize-none" style={inputStyle} /></div>

          {/* Category chips */}
          <div><label className="text-xs text-white font-medium block mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                  style={{
                    background: category === cat ? '#1fbf7a20' : '#0d251c',
                    color: category === cat ? '#1fbf7a' : '#a9c9bb',
                    border: category === cat ? '1px solid #1fbf7a' : '1px solid #1f3a2d',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white font-medium block mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
            <div><label className="text-xs text-white font-medium block mb-1">Time *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
          </div>

          {/* Duration / Max students */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white font-medium block mb-1">Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
            <div><label className="text-xs text-white font-medium block mb-1">Max students</label>
              <input type="number" value={maxStudents} onChange={e => setMaxStudents(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
          </div>

          {/* Level / Language */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white font-medium block mb-1">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer" style={{ ...inputStyle, color: '#a9c9bb' }}>
                <option value="">None</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label className="text-xs text-white font-medium block mb-1">Language</label>
              <input value={language} onChange={e => setLanguage(e.target.value)} placeholder="English"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
          </div>

          {/* Price / Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white font-medium block mb-1">Price ($)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0 for free"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>
            <div><label className="text-xs text-white font-medium block mb-1">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer" style={{ ...inputStyle, color: '#a9c9bb' }}>
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="custom">Custom RTMP</option>
              </select>
            </div>
          </div>

          {/* Meeting link */}
          <div><label className="text-xs text-white font-medium block mb-1">Meeting link</label>
            <input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://zoom.us/j/..."
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>

          {/* Tags */}
          <div><label className="text-xs text-white font-medium block mb-1">Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. react, javascript, frontend"
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>

          {/* Prerequisites */}
          <div><label className="text-xs text-white font-medium block mb-1">Prerequisites</label>
            <textarea value={prerequisites} onChange={e => setPrerequisites(e.target.value)} rows={2}
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none resize-none" style={inputStyle} placeholder="Any prerequisites for this class..." /></div>

          {/* Materials upload */}
          <div><label className="text-xs text-white font-medium block mb-1">Materials URL</label>
            <input value={materialsUrl} onChange={e => setMaterialsUrl(e.target.value)} placeholder="https://..."
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} /></div>

          {/* Thumbnail */}
          <div><label className="text-xs text-white font-medium block mb-1">Thumbnail</label>
            <label className="rounded-xl px-4 py-6 text-center text-xs cursor-pointer block"
              style={{ border: '1px dashed #1f3a2d', color: thumbnailFile ? '#5eead4' : '#8fae9f', background: '#0d251c' }}>
              <Upload size={18} className="mx-auto mb-1" color="#5eead4" />
              {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Co-host invite */}
          <div>
            <label className="text-xs text-white font-medium block mb-1 flex items-center gap-1.5">
              <UserPlus size={12} /> Co-host / Instructor invite
            </label>
            <div className="flex gap-2">
              <input value={coHostInput} onChange={e => setCoHostInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCoHost())}
                placeholder="Email address"
                className="flex-1 text-sm rounded-xl px-4 py-2.5 outline-none" style={{ ...inputStyle, color: '#a9c9bb' }} />
              <button onClick={addCoHost}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: '#1fbf7a', color: '#04231a' }}>
                <Plus size={14} />
              </button>
            </div>
            {coHosts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coHosts.map(email => (
                  <span key={email} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: '#1fbf7a15', border: '1px solid #1fbf7a30', color: '#5eead4' }}>
                    <Users size={10} /> {email}
                    <button onClick={() => setCoHosts(prev => prev.filter(e => e !== email))}
                      className="bg-transparent border-none p-0 cursor-pointer ml-0.5"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toggles row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Auto record', value: autoRecord, setter: setAutoRecord },
              { label: 'Allow chat', value: allowChat, setter: setAllowChat },
              { label: 'Allow Q&A', value: allowQa, setter: setAllowQa },
              { label: 'Screen share', value: allowScreenShare, setter: setAllowScreenShare },
              { label: 'Breakout rooms', value: allowBreakoutRooms, setter: setAllowBreakoutRooms },
              { label: 'Waitlist', value: waitlistEnabled, setter: setWaitlistEnabled },
            ].map(t => (
              <button key={t.label} onClick={() => t.setter(!t.value)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer"
                style={{ background: t.value ? '#1fbf7a15' : '#0d251c', border: `1px solid ${t.value ? '#1fbf7a' : '#1f3a2d'}`, color: t.value ? '#5eead4' : '#8fae9f' }}>
                <div className="w-7 h-4 rounded-full relative shrink-0" style={{ background: t.value ? '#1fbf7a' : '#1f3a2d' }}>
                  <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform" style={{ left: t.value ? '14px' : '2px' }} />
                </div>
                {t.label}
              </button>
            ))}
          </div>

          {/* Notification settings */}
          <div className="rounded-xl p-4" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-3">
              <Bell size={13} /> Notification & Reminder Settings
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-medium" style={{ color: '#8fae9f' }}>Reminders before class:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '24 hours', value: notify24h, setter: setNotify24h },
                  { label: '1 hour', value: notify1h, setter: setNotify1h },
                  { label: '5 minutes', value: notify5min, setter: setNotify5min },
                ].map(t => (
                  <button key={t.label} onClick={() => t.setter(!t.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer"
                    style={{ background: t.value ? '#1fbf7a15' : 'transparent', border: `1px solid ${t.value ? '#1fbf7a' : '#1f3a2d'}`, color: t.value ? '#5eead4' : '#8fae9f' }}>
                    {t.value ? <Bell size={10} /> : <BellOff size={10} />}
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-medium mt-2" style={{ color: '#8fae9f' }}>Notify via:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Email', value: emailNotify, setter: setEmailNotify, icon: Mail },
                  { label: 'Push', value: pushNotify, setter: setPushNotify, icon: Smartphone },
                  { label: 'SMS', value: smsNotify, setter: setSmsNotify, icon: FileText },
                ].map(t => (
                  <button key={t.label} onClick={() => t.setter(!t.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer"
                    style={{ background: t.value ? '#1fbf7a15' : 'transparent', border: `1px solid ${t.value ? '#1fbf7a' : '#1f3a2d'}`, color: t.value ? '#5eead4' : '#8fae9f' }}>
                    <t.icon size={10} /> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced settings expandable */}
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 w-full text-xs font-semibold bg-transparent border-none p-0 cursor-pointer text-left"
            style={{ color: '#5eead4' }}>
            <Settings2 size={13} /> Advanced settings
            {showAdvanced ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-xl p-4" style={{ background: '#0d251c', border: '1px solid #1f3a2d' }}>
              {[
                { label: 'Live captions / subtitles', value: enableCaptions, setter: setEnableCaptions },
                { label: 'Low-bandwidth mode', value: lowBandwidth, setter: setLowBandwidth },
              ].map(t => (
                <button key={t.label} onClick={() => t.setter(!t.value)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs cursor-pointer bg-transparent border-none text-left"
                  style={{ color: t.value ? '#5eead4' : '#8fae9f' }}>
                  <div className="w-7 h-4 rounded-full relative shrink-0" style={{ background: t.value ? '#1fbf7a' : '#1f3a2d' }}>
                    <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform" style={{ left: t.value ? '14px' : '2px' }} />
                  </div>
                  {t.label}
                </button>
              ))}
              <div className="text-[10px]" style={{ color: '#8fae9f' }}>
                <Lock size={10} className="inline mr-1" />
                Captions require compatible platform (Zoom/Meet). Low-bandwidth mode reduces video quality.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#1f3a2d]">
          <button onClick={() => handleSubmit('draft')}
            className="px-5 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: '1px solid #1f3a2d', color: '#a9c9bb' }}>
            Save as draft
          </button>
          <button onClick={() => handleSubmit('published')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer" style={{ background: '#1fbf7a', color: '#04231a' }}>
            {editingClass ? 'Update class' : 'Publish class'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
