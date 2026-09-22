'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Plus, Loader2, Trash2, Paperclip, Download, ExternalLink } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import { getImageUrl, downloadFile } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function NotesPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [adding, setAdding] = useState(false)

  const fetchData = () => {
    liveClassesAPI.getNotes(Number(params.id))
      .then(res => setNotes(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])

  const handleAdd = async () => {
    if (!newNote.trim()) return
    setAdding(true)
    try {
      if (newFile) {
        const fd = new FormData()
        fd.append('title', '')
        fd.append('content', newNote.trim())
        fd.append('type', 'note')
        fd.append('file', newFile)
        await liveClassesAPI.createNote(Number(params.id), fd)
      } else {
        await liveClassesAPI.createNote(Number(params.id), { content: newNote.trim() })
      }
      setNewNote(''); setNewFile(null); fetchData(); toast.success('Note added')
    }
    catch { toast.error('Failed') } finally { setAdding(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete note?')) return
    try { await liveClassesAPI.deleteNote(Number(params.id), id); fetchData(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Write a note..." rows={2}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors resize-none"
        />
        <div className="flex items-center gap-2">
          <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${newFile ? 'border-[#18A878]/25 bg-[#ECFBF5] text-[#18A878]' : 'border-[#E9E7F5] bg-[#F8FAFC] text-[#8A93AE] hover:text-[#18A878] hover:border-[#18A878]/25'}`}>
            <Paperclip size={12} /> {newFile ? newFile.name : 'Attach PDF'}
            <input type="file" accept="application/pdf,.pdf" className="hidden"
              onChange={e => setNewFile(e.target.files?.[0] ?? null)} />
          </label>
          {newFile && (
            <button onClick={() => setNewFile(null)} className="text-xs text-[#8A93AE] hover:text-[#E5484D]">Remove</button>
          )}
          <div className="flex-1" />
          <button onClick={handleAdd} disabled={adding || !newNote.trim()}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white hover:from-[#18A878]/90 hover:to-[#18A878] transition-all disabled:opacity-50 shadow-sm">
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No notes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((n, i) => (
            <motion.div key={n.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {n.title && <div className="text-sm font-semibold text-[#0F1B3D] mb-1">{n.title}</div>}
                  <div className="text-sm text-[#536078] whitespace-pre-wrap">{n.content}</div>
                  {n.file_url && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] px-2.5 py-1.5">
                      <FileText size={13} className="text-[#E5484D] shrink-0" />
                      <span className="text-[11px] text-[#8A93AE] truncate max-w-[200px]">{n.file_name || 'Attached PDF'}</span>
                      <a href={getImageUrl(n.file_url)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#18A878] hover:text-[#18A878]/80 shrink-0">
                        <ExternalLink size={10} /> View
                      </a>
                      <button onClick={() => downloadFile(getImageUrl(n.file_url), n.file_name || 'note.pdf')}
                        className="flex items-center gap-1 text-[10px] text-[#8A93AE] hover:text-[#6D3DF5] shrink-0 cursor-pointer">
                        <Download size={10} /> Download
                      </button>
                    </div>
                  )}
                  {n.created_at && <div className="text-xs text-[#536078] mt-1">{new Date(n.created_at).toLocaleString()}</div>}
                </div>
                <button onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg hover:bg-[#E5484D]/15 text-[#8A93AE] hover:text-[#E5484D] opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
