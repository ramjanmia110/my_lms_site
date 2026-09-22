'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchData = () => {
    liveClassesAPI.getClassChat(Number(params.id))
      .then(res => setMessages(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try { await liveClassesAPI.sendChat(Number(params.id), { message: text.trim() }); setText(''); fetchData() }
    catch { toast.error('Failed to send') } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-[520px] rounded-xl bg-white border border-[#E9E7F5] shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E9E7F5] shrink-0">
        <MessageSquare size={15} className="text-[#18A878]" />
        <span className="text-sm font-bold text-[#0F1B3D]">Chat</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-[#536078] text-sm">No messages yet</div>
          ) : (
            messages.map((m, i) => (
              <motion.div key={m.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${m.user?.id === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className={`max-w-[75%] p-3 rounded-xl ${m.user?.id === 1 ? 'bg-[#F3EEFF] border border-[#6D3DF5]/20 rounded-tr-sm' : 'bg-[#F8FAFC] rounded-tl-sm'}`}>
                  <div className="text-[11px] font-semibold text-[#8A93AE] mb-0.5">{m.user?.name || 'User'}</div>
                  <div className="text-sm text-[#0F1B3D]">{m.message}</div>
                  <div className="text-[10px] text-[#536078] text-right mt-1">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="p-4 border-t border-[#E9E7F5] flex gap-2 shrink-0">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors"
        />
        <button onClick={handleSend} disabled={sending || !text.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white hover:from-[#18A878]/90 hover:to-[#18A878] transition-all disabled:opacity-50 shadow-sm"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  )
}
