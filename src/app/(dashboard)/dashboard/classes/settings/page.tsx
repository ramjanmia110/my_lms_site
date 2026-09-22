'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Video, Shield, Bell, Loader2, Save } from 'lucide-react'
import { settingsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface LiveClassSettings {
  default_duration: number
  max_participants: number
  recording_enabled: boolean
  auto_record: boolean
  waiting_room: boolean
  chat_enabled: boolean
  qa_enabled: boolean
  polls_enabled: boolean
  allow_anonymous_questions: boolean
  notification_before_minutes: number
  language: string
}

export default function ClassSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<LiveClassSettings>({
    default_duration: 60, max_participants: 50, recording_enabled: true,
    auto_record: false, waiting_room: true, chat_enabled: true, qa_enabled: true,
    polls_enabled: true, allow_anonymous_questions: false, notification_before_minutes: 15, language: 'en',
  })

  useEffect(() => {
    setLoading(true)
    settingsAPI.get()
      .then(res => { if (res.data?.data) setSettings({ ...settings, ...res.data.data }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try { await settingsAPI.update(settings); toast.success('Settings saved') }
    catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-emerald-500' : 'bg-white/[0.10]'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    )
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-500" /></div>

  return (
    <div className="max-w-2xl space-y-4">
      <Section icon={<Clock size={15} />} title="General">
        <div className="space-y-3">
          <Field label="Default Duration (min)">
            <input type="number" value={settings.default_duration} onChange={e => setSettings({ ...settings, default_duration: Number(e.target.value) })}
              className="w-20 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-xs text-center focus:outline-none focus:border-emerald-500/30" />
          </Field>
          <Field label="Max Participants">
            <input type="number" value={settings.max_participants} onChange={e => setSettings({ ...settings, max_participants: Number(e.target.value) })}
              className="w-20 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-xs text-center focus:outline-none focus:border-emerald-500/30" />
          </Field>
          <Field label="Default Language">
            <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-xs focus:outline-none focus:border-emerald-500/30">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
          <Field label="Notify Before (min)">
            <input type="number" value={settings.notification_before_minutes} onChange={e => setSettings({ ...settings, notification_before_minutes: Number(e.target.value) })}
              className="w-20 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-xs text-center focus:outline-none focus:border-emerald-500/30" />
          </Field>
        </div>
      </Section>

      <Section icon={<Video size={15} />} title="Recording">
        <div className="space-y-3">
          <Field label="Enable Recording"><Toggle value={settings.recording_enabled} onChange={v => setSettings({ ...settings, recording_enabled: v })} /></Field>
          <Field label="Auto-Record Classes"><Toggle value={settings.auto_record} onChange={v => setSettings({ ...settings, auto_record: v })} /></Field>
        </div>
      </Section>

      <Section icon={<Shield size={15} />} title="Security & Moderation">
        <div className="space-y-3">
          <Field label="Waiting Room"><Toggle value={settings.waiting_room} onChange={v => setSettings({ ...settings, waiting_room: v })} /></Field>
          <Field label="Anonymous Questions"><Toggle value={settings.allow_anonymous_questions} onChange={v => setSettings({ ...settings, allow_anonymous_questions: v })} /></Field>
        </div>
      </Section>

      <Section icon={<Bell size={15} />} title="Features">
        <div className="space-y-3">
          <Field label="Chat"><Toggle value={settings.chat_enabled} onChange={v => setSettings({ ...settings, chat_enabled: v })} /></Field>
          <Field label="Q&A"><Toggle value={settings.qa_enabled} onChange={v => setSettings({ ...settings, qa_enabled: v })} /></Field>
          <Field label="Polls"><Toggle value={settings.polls_enabled} onChange={v => setSettings({ ...settings, polls_enabled: v })} /></Field>
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50 shadow-sm">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-b from-[#042718] to-[#000B05] border border-white/[0.06]">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">{icon} {title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </div>
  )
}
