'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Megaphone, CalendarDays, X, Search } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/dashboard/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const baseNotices = [
  { id: 1, title: 'Summer Semester 2026 Registration Open', excerpt: 'Registration for summer courses is now open from July 15–25.', full: 'All students are invited to register for the Summer 2026 semester. Courses include Computer Science, Mathematics, Physics, and more. Early registration ends July 20 with a 10% discount. Visit the admin office or register online.', date: '2026-07-10', type: 'academic', priority: 'high' },
  { id: 2, title: 'Faculty Workshop on AI in Education', excerpt: 'A 3-day workshop on integrating AI tools in teaching.', full: 'The Faculty Development Committee is organizing a 3-day workshop "AI in Education" from July 18–20. All faculty members are encouraged to attend. The workshop will cover generative AI tools, personalized learning, and assessment design. Venue: Conference Hall A, 9 AM–4 PM daily.', date: '2026-07-08', type: 'event', priority: 'medium' },
  { id: 3, title: 'Exam Schedule: Midterm 2026', excerpt: 'Midterm exams will run from August 1–10.', full: 'The official midterm exam schedule has been published. Students should check their department notice boards and online portals for exact dates and room assignments. Any scheduling conflicts must be reported to the exam controller by July 25.', date: '2026-07-05', type: 'academic', priority: 'high' },
  { id: 4, title: 'Library Extended Hours During Exams', excerpt: 'Library will remain open until midnight during exams.', full: 'To support students during the exam period, the university library will extend its operating hours from 7 AM to 12 AM (midnight) starting July 25. All reading rooms and computer labs will be available. Quiet zones will be strictly enforced.', date: '2026-07-03', type: 'general', priority: 'low' },
  { id: 5, title: 'Campus Blood Donation Drive', excerpt: 'Join the blood donation campaign on July 20.', full: 'The Student Welfare Society is organizing a blood donation drive on July 20 from 10 AM to 4 PM in the Main Auditorium. All eligible donors are requested to participate. Free health checkup and refreshments for all donors.', date: '2026-07-01', type: 'event', priority: 'medium' },
  { id: 6, title: 'Holiday Notice: Eid-ul-Azha', excerpt: 'University will remain closed from July 28–31.', full: 'In observance of Eid-ul-Azha, the university will remain closed from July 28 to July 31. All classes and administrative activities will resume on August 1. Students and staff are advised to plan accordingly.', date: '2026-06-28', type: 'general', priority: 'high' },
]

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState(baseNotices)
  const [search, setSearch] = useState('')
  const [modalNotice, setModalNotice] = useState<typeof baseNotices[number] | null>(null)
  const typeCount = Array.from(new Set(notices.map(n => n.type))).length
  const filtered = notices.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white font-space-grotesk">Notice Board</h1><p className="text-xs text-slate-400 mt-0.5">University announcements and updates</p></div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Notices', value: notices.length, icon: <Megaphone className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'High Priority', value: notices.filter(n => n.priority === 'high').length, icon: <Bell className="w-4 h-4" />, color: 'from-red-500 to-rose-600' },
          { label: 'Academic', value: notices.filter(n => n.type === 'academic').length, icon: <CalendarDays className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
          { label: 'Categories', value: typeCount, icon: <Megaphone className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
        ].map(stat => (
          <GlassCard key={stat.label} hover><GlassCardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>{stat.icon}</div></div>
            <div className="text-lg font-bold text-white">{stat.value}</div><div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </GlassCardContent></GlassCard>
        ))}
      </div>

      <div className="relative mb-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notices..." className="bg-black/20 border-0 h-10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981] rounded-xl text-sm" /></div>

      <div className="grid gap-3">
        {filtered.map(n => (
          <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors cursor-pointer" onClick={() => setModalNotice(n)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                  <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0 border uppercase tracking-wider', n.priority === 'high' ? 'border-red-500/30 text-red-400' : n.priority === 'medium' ? 'border-amber-500/30 text-amber-400' : 'border-slate-500/30 text-slate-400')}>{n.priority}</Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{n.excerpt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-slate-500">{n.date}</span>
                  <Badge className="text-[8px] bg-white/5 text-slate-400 border-0 capitalize">{n.type}</Badge>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0"><Megaphone className="w-3.5 h-3.5 text-[#10B981]" /></div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalNotice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalNotice(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#042718] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-[#10B981]" /><h2 className="text-base font-bold text-white">{modalNotice.title}</h2></div>
                <button onClick={() => setModalNotice(null)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-slate-500">{modalNotice.date}</span>
                <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0 border uppercase tracking-wider', modalNotice.priority === 'high' ? 'border-red-500/30 text-red-400' : modalNotice.priority === 'medium' ? 'border-amber-500/30 text-amber-400' : 'border-slate-500/30 text-slate-400')}>{modalNotice.priority}</Badge>
                <Badge className="text-[8px] bg-white/5 text-slate-400 border-0 capitalize">{modalNotice.type}</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{modalNotice.full}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
