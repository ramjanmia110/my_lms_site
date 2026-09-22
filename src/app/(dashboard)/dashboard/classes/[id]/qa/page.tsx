'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { HelpCircle, ThumbsUp, Loader2 } from 'lucide-react'
import { liveClassesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function QAPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = () => {
    liveClassesAPI.getClassQA(Number(params.id))
      .then(res => setItems(res.data?.data?.data ?? res.data?.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [params.id])

  const handleSubmit = async () => {
    if (!question.trim()) return
    setSubmitting(true)
    try { await liveClassesAPI.askQuestion(Number(params.id), { question: question.trim() }); setQuestion(''); fetchData(); toast.success('Question submitted') }
    catch { toast.error('Failed') } finally { setSubmitting(false) }
  }

  const handleUpvote = async (id: number) => {
    try { await liveClassesAPI.voteQuestion(Number(params.id), id); fetchData() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-[#8A93AE]" /></div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Ask a question..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E8F2] text-[#0F1B3D] text-xs placeholder:text-[#A5AEC2] focus:outline-none focus:border-[#6D3DF5]/30 transition-colors"
        />
        <button onClick={handleSubmit} disabled={submitting || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#18A878] to-[#18A878]/90 text-white text-xs font-semibold hover:from-[#18A878]/90 hover:to-[#18A878]/80 transition-all disabled:opacity-50 shadow-sm"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Ask'}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle size={36} className="text-[#536078] mx-auto mb-3" />
          <p className="text-sm text-[#536078]">No questions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((q, i) => (
            <motion.div key={q.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-[#E9E7F5] shadow-sm"
            >
              <div className="flex items-start gap-3">
                <button onClick={() => handleUpvote(q.id)} className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-[#ECFBF5] transition-colors min-w-[40px]">
                  <ThumbsUp size={13} className="text-[#18A878]" />
                  <span className="text-[10px] font-bold text-[#536078]">{q.votes ?? 0}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0F1B3D]">{q.question}</div>
                  {q.answer && (
                    <div className="mt-3 p-3 rounded-lg bg-[#ECFBF5] border border-[#18A878]/15">
                      <div className="text-[11px] font-semibold text-[#18A878] mb-1">Answer</div>
                      <div className="text-xs text-[#8A93AE]">{q.answer}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#536078]">
                    <span>{q.created_at ? new Date(q.created_at).toLocaleDateString() : ''}</span>
                    <span className={q.status === 'answered' ? 'text-[#18A878]' : 'text-[#F59E0B]'}>{q.status}</span>
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
