'use client'

import { Users, Search, Globe } from 'lucide-react'
import type { Class } from '@/types'

export type FilterTab = 'all' | 'upcoming' | 'live' | 'past' | 'my_enrolled'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'past', label: 'Past' },
  { key: 'my_enrolled', label: 'My Enrolled' },
]

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const TIMEZONES = [
  { label: 'Auto-detect', value: '' },
  { label: 'UTC', value: 'UTC' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'CST (UTC-6)', value: 'America/Chicago' },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'GMT (UTC+0)', value: 'Europe/London' },
  { label: 'CET (UTC+1)', value: 'Europe/Berlin' },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
]

interface FilterTabsProps {
  active: FilterTab
  onChange: (tab: FilterTab) => void
  counts: Record<FilterTab, number>
  searchQuery: string
  onSearchChange: (q: string) => void
  levelFilter: string
  onLevelChange: (l: string) => void
  categoryFilter: string
  onCategoryChange: (c: string) => void
  categories: string[]
  timezone: string
  onTimezoneChange: (tz: string) => void
}

export function FilterTabs({
  active, onChange, counts, searchQuery, onSearchChange,
  levelFilter, onLevelChange, categoryFilter, onCategoryChange, categories,
  timezone, onTimezoneChange,
}: FilterTabsProps) {
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8fae9f' }} />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search classes..."
            className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none"
            style={{ background: '#0c231c', border: '1px solid #163a2d', color: '#e8fff3' }}
          />
        </div>
        {/* Timezone */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs"
          style={{ background: '#0c231c', border: '1px solid #163a2d', color: '#a9c9bb' }}>
          <Globe size={13} />
          <select
            value={timezone}
            onChange={e => onTimezoneChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs cursor-pointer"
            style={{ color: '#e8fff3' }}>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab + filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors cursor-pointer"
              style={{
                background: active === t.key ? '#1fbf7a' : 'transparent',
                color: active === t.key ? '#04231a' : '#a9c9bb',
                borderColor: active === t.key ? 'transparent' : '#163a2d',
              }}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={e => onLevelChange(e.target.value)}
            className="text-sm rounded-xl px-3.5 py-2 outline-none cursor-pointer"
            style={{ background: '#0c231c', border: '1px solid #163a2d', color: '#e8fff3' }}>
            {LEVELS.map(l => (
              <option key={l} value={l === 'All Levels' ? '' : l}>{l}</option>
            ))}
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => onCategoryChange(e.target.value)}
              className="text-sm rounded-xl px-3.5 py-2 outline-none cursor-pointer"
              style={{ background: '#0c231c', border: '1px solid #163a2d', color: '#e8fff3' }}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
