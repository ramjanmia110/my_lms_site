'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye, BookOpen, CalendarClock, BarChart3, Loader2, Trophy, Users, AlertCircle, RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { blogAPI } from '@/lib/api'
import Link from 'next/link'

interface AnalyticsData {
  total_posts: number
  published_posts: number
  total_views: number
  views_today: number
  views_by_day: Record<string, number>
  top_posts: any[]
  by_status: Record<string, number>
  top_authors: any[]
}

function buildSeries(v: Record<string, number>) {
  return Object.keys(v).sort().map((d) => ({ date: d.slice(5), views: v[d] || 0 }))
}

export default function BlogAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    blogAPI.getAnalytics({ days })
      .then((res) => setData(res.data?.data ?? null))
      .catch((err: any) => {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          setError('You do not have permission to view blog analytics. Admin access required.')
        } else {
          setError('Failed to load analytics. The analytics service may be unavailable.')
        }
      })
      .finally(() => setLoading(false))
  }, [days])

  const series = data ? buildSeries(data.views_by_day || {}) : []

  const retry = () => {
    setLoading(true); setError(null)
    blogAPI.getAnalytics({ days }).then((res) => setData(res.data?.data ?? null)).catch((err: any) => {
      setError(err?.response?.status === 403 || err?.response?.status === 401 ? 'You do not have permission to view blog analytics.' : 'Failed to load analytics.')
    }).finally(() => setLoading(false))
  }

  return (
    <div>
      <PageHeader title="Blog Analytics" subtitle="Views, top posts and author performance" backHref="/dashboard/blog" />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`h-8 px-3 rounded-xl text-[11px] font-semibold transition-all ${days === d ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-md shadow-[#6D3DF5]/15' : 'text-[#536078] bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/30 hover:text-[#6D3DF5]'}`}>
              Last {d} days
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
              <p className="text-xs text-[#536078]">Loading analytics...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E9E7F5] rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-[#6D3DF5]" />
            </div>
            <h3 className="text-base font-semibold text-[#0F1B3D] mb-1">Unable to load analytics</h3>
            <p className="text-sm text-[#536078] mb-5 max-w-sm mx-auto">{error}</p>
            <button onClick={retry} className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={BookOpen} label="Total Posts" value={data.total_posts} />
              <StatCard icon={CalendarClock} label="Published" value={data.published_posts} hint={`${data.by_status.draft || 0} drafts · ${data.by_status.scheduled || 0} scheduled`} />
              <StatCard icon={Eye} label="Total Views" value={data.total_views.toLocaleString()} hint={`${data.views_today} today`} />
              <StatCard icon={Users} label="Authors" value={data.top_authors?.length || 0} />
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-[#E9E7F5] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#6D3DF5]" />
                </div>
                <h3 className="text-xs font-semibold text-[#0F1B3D]">Views Over Time</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" />
                    <XAxis dataKey="date" tick={{ fill: '#536078', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#536078', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E9E7F5', borderRadius: 12, fontSize: 11, color: '#0F1B3D' }} labelStyle={{ color: '#0F1B3D', fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#536078' }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#6D3DF5" fill="url(#blogViewsGrad)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="blogViewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D3DF5" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6D3DF5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white border border-[#E9E7F5] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-[#6D3DF5]" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#0F1B3D]">Top Posts</h3>
                </div>
                <div className="space-y-3">
                  {data.top_posts.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[#94A3B8] w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/blog/${p.id}`} className="text-xs font-semibold text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors block truncate">{p.title}</Link>
                        <span className="text-[10px] text-[#94A3B8]">/{p.slug}</span>
                      </div>
                      <StatusBadge status={p.status} />
                      <span className="text-[11px] text-[#536078] flex items-center gap-1 shrink-0"><Eye className="w-3 h-3" />{p.views_count?.toLocaleString() || 0}</span>
                    </div>
                  ))}
                  {data.top_posts.length === 0 && <p className="text-xs text-[#536078] text-center py-4">No posts with views yet.</p>}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-[#E9E7F5] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#3478F6]" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#0F1B3D]">Top Authors</h3>
                </div>
                <div className="space-y-3">
                  {data.top_authors.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[#94A3B8] w-4 shrink-0">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[#F3EEFF] border border-[#E9E7F5] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {a.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.avatar} alt={a.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#6D3DF5]">{(a.name || 'A').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F1B3D] truncate">{a.name}</p>
                      </div>
                      <span className="text-[11px] text-[#536078] shrink-0">{a.posts_count || 0} posts</span>
                    </div>
                  ))}
                  {data.top_authors.length === 0 && <p className="text-xs text-[#536078] text-center py-4">No authors yet.</p>}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
