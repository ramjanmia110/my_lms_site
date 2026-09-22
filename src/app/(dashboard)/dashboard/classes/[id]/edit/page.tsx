'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, Calendar, Clock, Users, Settings, Tag, DollarSign, Repeat } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const durationPresets = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

const featureConfig = [
  { key: 'recording_enabled', label: 'Recording', desc: 'Auto-record sessions', icon: '🎙️' },
  { key: 'chat_enabled', label: 'Live Chat', desc: 'Real-time messaging', icon: '💬' },
  { key: 'qa_enabled', label: 'Q&A', desc: 'Student questions', icon: '❓' },
  { key: 'polls_enabled', label: 'Polls', desc: 'Interactive surveys', icon: '📊' },
  { key: 'notes_enabled', label: 'Notes', desc: 'Note-taking enabled', icon: '📝' },
  { key: 'waiting_room', label: 'Waiting Room', desc: 'Admit control', icon: '🚪' },
  { key: 'resources_enabled', label: 'Resources', desc: 'File sharing', icon: '📁' },
  { key: 'announcements_enabled', label: 'Announcements', desc: 'Class updates', icon: '📢' },
]

export default function EditClassPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', duration_minutes: 60,
    max_participants: 50, recording_enabled: true, waiting_room: true,
    chat_enabled: true, qa_enabled: true, polls_enabled: true,
    notes_enabled: true, resources_enabled: true, announcements_enabled: true,
    is_recurring: false, is_free: true, price: 0,
    tags: '', meeting_url: '', level: 'all',
  })

  useEffect(() => {
    liveClassesAPI.getOne(Number(params.id))
      .then(res => {
        const d = res.data?.data ?? {}
        setForm({
          title: d.title || '', description: d.description || '', date: d.date || '', time: d.time || '',
          duration_minutes: d.duration_minutes || 60, max_participants: d.max_participants || 50,
          recording_enabled: d.recording_enabled ?? true, waiting_room: d.waiting_room ?? true,
          chat_enabled: d.chat_enabled ?? true, qa_enabled: d.qa_enabled ?? true, polls_enabled: d.polls_enabled ?? true,
          notes_enabled: d.notes_enabled ?? true, resources_enabled: d.resources_enabled ?? true,
          announcements_enabled: d.announcements_enabled ?? true, is_recurring: d.is_recurring ?? false,
          is_free: d.is_free ?? true, price: d.price || 0,
          tags: Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || ''),
          meeting_url: d.meeting_url || '', level: d.level || 'all',
        })
      })
      .catch(() => { toast.error('Failed to load class'); router.push(`/dashboard/classes/${params.id}`) })
      .finally(() => setLoading(false))
  }, [params.id, router])

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        price: form.is_free ? 0 : form.price,
      }
      await liveClassesAPI.update(Number(params.id), payload)
      toast.success('Class updated!')
      router.push(`/dashboard/classes/${params.id}`)
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#6D3DF5]" />
        <span className="text-sm text-[#8A93AE]">Loading class data...</span>
      </div>
    </div>
  )

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="w-full space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E9E7F5] text-[#536078] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 hover:bg-[#F3EEFF] transition-all text-sm">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D3DF5]/10 to-[#3478F6]/10 flex items-center justify-center">
          <Settings size={20} className="text-[#6D3DF5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0F1B3D]">Edit Class</h1>
          <p className="text-sm text-[#8A93AE]">Update class details and settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E9E7F5] shadow-[0_2px_12px_rgba(15,27,61,0.04)] border-t-2 border-t-[#6D3DF5]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#6D3DF5]/10 flex items-center justify-center">
              <Tag size={14} className="text-[#6D3DF5]" />
            </div>
            <h2 className="text-sm font-bold text-[#0F1B3D]">Basic Information</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Class Title</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Advanced JavaScript Masterclass"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4}
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 resize-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Tags</label>
              <input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="Comma separated tags..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Meeting URL</label>
              <input value={form.meeting_url} onChange={e => update('meeting_url', e.target.value)} placeholder="https://zoom.us/j/..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E9E7F5] shadow-[0_2px_12px_rgba(15,27,61,0.04)] border-t-2 border-t-[#3478F6]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#3478F6]/10 flex items-center justify-center">
              <Calendar size={14} className="text-[#3478F6]" />
            </div>
            <h2 className="text-sm font-bold text-[#0F1B3D]">Schedule</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0F1B3D]">Date</label>
                <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0F1B3D]">Time</label>
                <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/10 transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Duration</label>
              <div className="flex flex-wrap gap-2">
                {durationPresets.map(p => (
                  <button key={p.value} onClick={() => update('duration_minutes', p.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.duration_minutes === p.value ? 'bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-[0_2px_8px_rgba(109,61,245,0.3)]' : 'bg-white text-[#536078] border-[#E9E7F5] hover:border-[#6D3DF5]/40 hover:bg-[#F3EEFF]/30'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0F1B3D]">Max Participants</label>
              <div className="flex gap-2">
                {[10, 25, 50, 100, 200].map(n => (
                  <button key={n} onClick={() => update('max_participants', n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.max_participants === n ? 'bg-[#3478F6] text-white border-[#3478F6] shadow-[0_2px_8px_rgba(52,120,246,0.3)]' : 'bg-white text-[#536078] border-[#E9E7F5] hover:border-[#3478F6]/40 hover:bg-[#EEF4FF]/30'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Repeat size={14} className="text-[#8A93AE]" />
                <span className="text-sm font-semibold text-[#0F1B3D]">Recurring Class</span>
              </div>
              <Toggle value={form.is_recurring} onChange={v => update('is_recurring', v)} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E9E7F5] shadow-[0_2px_12px_rgba(15,27,61,0.04)] border-t-2 border-t-[#18A878]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#18A878]/10 flex items-center justify-center">
              <Settings size={14} className="text-[#18A878]" />
            </div>
            <h2 className="text-sm font-bold text-[#0F1B3D]">Features & Settings</h2>
          </div>
          <div className="space-y-2">
            {featureConfig.map(({ key, label, desc, icon }) => (
              <div key={key} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${form[key as keyof typeof form] ? 'bg-[#F3EEFF]/30 border-[#6D3DF5]/20 border-l-[3px] border-l-[#6D3DF5]' : 'bg-white border-[#E9E7F5] hover:border-[#6D3DF5]/20'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center text-sm">
                    {icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0F1B3D]">{label}</div>
                    <div className="text-xs text-[#8A93AE]">{desc}</div>
                  </div>
                </div>
                <Toggle value={!!form[key as keyof typeof form]} onChange={v => update(key, v)} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E9E7F5] shadow-[0_2px_12px_rgba(15,27,61,0.04)] border-t-2 border-t-[#F59E0B]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <DollarSign size={14} className="text-[#F59E0B]" />
            </div>
            <h2 className="text-sm font-bold text-[#0F1B3D]">Pricing</h2>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[#0F1B3D]">Free Class</label>
              <Toggle value={form.is_free} onChange={v => update('is_free', v)} />
            </div>
            {!form.is_free && (
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F3EEFF] border border-[#E9E7F5]">
                  <DollarSign size={14} className="text-[#6D3DF5]" />
                </div>
                <input type="number" value={form.price || ''} onChange={e => update('price', Number(e.target.value))} placeholder="Price"
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#E9E7F5] text-[#0F1B3D] text-sm text-center focus:outline-none focus:border-[#6D3DF5] focus:ring-[3px] focus:ring-[#6D3DF5]/10 transition-all" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button onClick={() => router.back()}
          className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-white border border-[#E9E7F5] text-[#536078] text-sm font-semibold hover:bg-[#F3EEFF] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 transition-all">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white text-sm font-bold shadow-[0_4px_14px_rgba(109,61,245,0.35)] hover:shadow-[0_6px_20px_rgba(109,61,245,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-[#18A878]' : 'bg-[#E9E7F5]'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}
