'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye, Zap, Wrench, CalendarClock, BarChart3, Loader2, Trophy, AlertCircle, RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { toolsAPI } from '@/lib/api'
import Link from 'next/link'

interface AnalyticsData {
  total_tools: number
  published_tools: number
  total_views: number
  total_usage: number
  views_today: number
  usage_today: number
  views_by_day: Record<string, number>
  usage_by_day: Record<string, number>
  top_tools: any[]
  by_status: Record<string, number>
}

function buildSeries(v: Record<string, number>, u: Record<string, number>) {
  const dates = new Set([...Object.keys(v), ...Object.keys(u)])
  return Array.from(dates).sort().map((d) => ({
    date: d.slice(5),
    views: v[d] || 0,
    usage: u[d] || 0,
  }))
}

export default function ToolsAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    toolsAPI.getAnalytics({ days })
      .then((res) => {
        setData(res.data?.data ?? null)
      })
      .catch((err: any) => {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          setError('You do not have permission to view analytics. Admin access required.')
        } else {
          setError('Failed to load analytics. The analytics service may be unavailable.')
        }
      })
      .finally(() => setLoading(false))
  }, [days])

  const series = data ? buildSeries(data.views_by_day || {}, data.usage_by_day || {}) : []

  return (
    <div>
      <PageHeader title="Tools Analytics" subtitle="Views, usage and top-performing tools" />

      <div className="space-y-4">
        {/* Days selector */}
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`h-8 px-3 rounded-xl text-[11px] font-semibold transition-all ${days === d ? 'bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-md shadow-[#6D3DF5]/15' : 'text-[#536078] bg-white border border-[#E9E7F5] hover:border-[#6D3DF5]/30 hover:text-[#6D3DF5]'}`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#6D3DF5]" />
              <p className="text-xs text-[#536078]">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E9E7F5] rounded-2xl p-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-[#6D3DF5]" />
            </div>
            <h3 className="text-base font-semibold text-[#0F1B3D] mb-1">Unable to load analytics</h3>
            <p className="text-sm text-[#536078] mb-5 max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); toolsAPI.getAnalytics({ days }).then((res) => setData(res.data?.data ?? null)).catch((err: any) => { setError(err?.response?.status === 403 || err?.response?.status === 401 ? 'You do not have permission to view analytics.' : 'Failed to load analytics.') }).finally(() => setLoading(false)) }}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white hover:shadow-lg hover:shadow-[#6D3DF5]/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Data */}
        {!loading && !error && data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Wrench} label="Total Tools" value={data.total_tools} />
              <StatCard icon={CalendarClock} label="Published" value={data.published_tools} hint={`${data.by_status.draft || 0} drafts · ${data.by_status.archived || 0} archived`} />
              <StatCard icon={Eye} label="Total Views" value={data.total_views.toLocaleString()} hint={`${data.views_today} today`} />
              <StatCard icon={Zap} label="Total Usage" value={data.total_usage.toLocaleString()} hint={`${data.usage_today} today`} />
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-[#E9E7F5] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#6D3DF5]" />
                </div>
                <h3 className="text-xs font-semibold text-[#0F1B3D]">Views & Usage Over Time</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" />
                    <XAxis dataKey="date" tick={{ fill: '#536078', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#536078', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E9E7F5', borderRadius: 12, fontSize: 11, color: '#0F1B3D' }}
                      labelStyle={{ color: '#0F1B3D', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#536078' }} />
                    <Bar dataKey="views" name="Views" fill="#6D3DF5" radius={[4, 4, 0, 0]} />
                    <Line dataKey="usage" name="Usage" stroke="#3478F6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top tools */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2 p-5 pb-0">
                <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-[#6D3DF5]" />
                </div>
                <h3 className="text-xs font-semibold text-[#0F1B3D]">Top Tools</h3>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E9E7F5] bg-[#F8F7FC] text-[10px] uppercase tracking-widest text-[#536078]">
                      <th className="px-5 py-3 font-semibold">#</th>
                      <th className="px-5 py-3 font-semibold">Tool</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Views</th>
                      <th className="px-5 py-3 font-semibold text-right">Usage</th>
                      <th className="px-5 py-3 font-semibold text-right">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_tools.map((t, i) => (
                      <tr key={t.id} className="border-b border-[#E9E7F5]/60 last:border-0 hover:bg-[#F8F7FC] transition-colors">
                        <td className="px-5 py-3 text-xs text-[#94A3B8]">{i + 1}</td>
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/tools/${t.id}`} className="text-xs font-semibold text-[#0F1B3D] hover:text-[#6D3DF5] transition-colors">
                            {t.title}
                          </Link>
                          <span className="block text-[10px] text-[#94A3B8]">/{t.slug}</span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-5 py-3 text-xs text-[#536078] text-right">{t.views_count?.toLocaleString() || 0}</td>
                        <td className="px-5 py-3 text-xs text-[#536078] text-right">{t.usage_count?.toLocaleString() || 0}</td>
                        <td className="px-5 py-3 text-xs text-[#94A3B8] text-right font-mono">v{t.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.top_tools.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-[#536078]">No tools with usage data yet.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
