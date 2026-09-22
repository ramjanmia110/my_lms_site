'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Loader2, Megaphone, CalendarDays, Paperclip, FileText, Download, ExternalLink } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import { getImageUrl, downloadFile } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AnnouncementsPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [text, setText] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)

  const fetchData = () => {
    liveClassesAPI.getAnnouncements(Number(params.id))
      .then(res => setAnnouncements(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      if (newFile) {
        const fd = new FormData()
        fd.append('title', 'Announcement')
        fd.append('message', text.trim())
        fd.append('priority', 'normal')
        fd.append('file', newFile)
        await liveClassesAPI.createAnnouncement(Number(params.id), fd)
      } else {
        await liveClassesAPI.createAnnouncement(Number(params.id), { message: text.trim() })
      }
      setText(''); setNewFile(null); fetchData(); toast.success('Announcement sent')
    }
    catch { toast.error('Failed') } finally { setSending(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write an announcement..." rows={2}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#F59E0B]/30 transition-colors resize-none"
        />
        <div className="flex items-center gap-2">
          <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${newFile ? 'border-[#F59E0B]/25 bg-[#FEF3C7] text-[#F59E0B]' : 'border-[#E9E7F5] bg-[#F8FAFC] text-[#8A93AE] hover:text-[#F59E0B] hover:border-[#F59E0B]/25'}`}>
            <Paperclip size={12} /> {newFile ? newFile.name : 'Attach PDF'}
            <input type="file" accept="application/pdf,.pdf" className="hidden"
              onChange={e => setNewFile(e.target.files?.[0] ?? null)} />
          </label>
          {newFile && (
            <button onClick={() => setNewFile(null)} className="text-xs text-[#8A93AE] hover:text-[#E5484D]">Remove</button>
          )}
          <div className="flex-1" />
          <button onClick={handleSend} disabled={sending || !text.trim()}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/90 text-white text-xs font-semibold hover:from-[#F59E0B]/90 hover:to-[#F59E0B] transition-all disabled:opacity-50 shadow-sm">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />} Send
          </button>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No announcements</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((a, i) => (
            <motion.div key={a.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Bell size={14} className="text-[#F59E0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  {a.title && a.title !== 'Announcement' && <div className="text-sm font-semibold text-[#0F1B3D] mb-0.5">{a.title}</div>}
                  <div className="text-sm text-[#536078]">{a.message}</div>
                  {a.file_url && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] px-2.5 py-1.5">
                      <FileText size={13} className="text-[#E5484D] shrink-0" />
                      <span className="text-[11px] text-[#8A93AE] truncate max-w-[200px]">{a.file_name || 'Attached PDF'}</span>
                      <a href={getImageUrl(a.file_url)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#18A878] hover:text-[#18A878]/80 shrink-0">
                        <ExternalLink size={10} /> View
                      </a>
                      <button onClick={() => downloadFile(getImageUrl(a.file_url), a.file_name || 'announcement.pdf')}
                        className="flex items-center gap-1 text-[10px] text-[#8A93AE] hover:text-[#6D3DF5] shrink-0 cursor-pointer">
                        <Download size={10} /> Download
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#536078]">
                    <span className="flex items-center gap-1"><CalendarDays size={11} />{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                    <span>&middot;</span>
                    <span>{a.user?.name || 'Instructor'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
