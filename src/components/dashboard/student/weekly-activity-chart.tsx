'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { WeeklyActivityDay } from './types'

export function WeeklyActivityChart({ weekly }: { weekly: WeeklyActivityDay[] }) {
  const data = (weekly || []).map((d) => ({
    day: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    'Study (min)': Math.round(d.study_minutes ?? 0),
    Activity: d.activity ?? 0,
  }))

  const totalMinutes = (weekly || []).reduce((acc, d) => acc + (d.study_minutes ?? 0), 0)
  const activeDays = (weekly || []).filter((d) => (d.activity ?? 0) > 0).length

  return (
    <SectionCard className="p-4">
      <SectionHeader icon={BarChart3} title="Weekly Activity" subtitle={activeDays > 0 ? `${activeDays} active days this week` : 'Your learning rhythm this week'} />
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[#536078]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6D3DF5]" /> Study
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#18A878]" /> Activity
        </span>
        <span className="ml-auto font-semibold text-[#0F1B3D]">{Math.round(totalMinutes / 60 * 10) / 10}h studied</span>
      </div>
      {data.length === 0 || totalMinutes === 0 ? (
        <EmptyState icon={BarChart3} title="No activity recorded" description="Spend a little time in your courses and your weekly rhythm will appear here." className="py-6" />
      ) : (
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E7F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#536078' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#536078' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #E9E7F5', fontSize: 11, boxShadow: '0 4px 16px rgba(15,27,61,.06)' }}
              />
              <Bar dataKey="Study (min)" fill="#6D3DF5" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="Activity" fill="#18A878" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  )
}