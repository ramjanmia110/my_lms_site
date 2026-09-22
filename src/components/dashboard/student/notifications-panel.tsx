'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SectionHeader, EmptyState } from './shared'
import type { StudentNotification } from './types'

export function NotificationsPanel({
  notifications,
  onMarkAllRead,
  onOpen,
}: {
  notifications: StudentNotification[]
  onMarkAllRead?: () => void
  onOpen?: (n: StudentNotification) => void
}) {
  const unread = notifications.filter((n) => !n.read).length
  return (
    <SectionCard className="p-4">
      <SectionHeader
        icon={Bell}
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'You are all caught up'}
        action={
          unread > 0 ? (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-[#6D3DF5] hover:text-[#5A2DE0] font-medium inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark read
            </button>
          ) : null
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Updates about your courses, payments and classes will land here." />
      ) : (
        <div className="space-y-2 mt-3">
          {notifications.slice(0, 4).map((n) => (
            <div
              key={n.id}
              onClick={() => onOpen?.(n)}
              className={cn(
                'flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer',
                n.read ? 'border-[#E9E7F5] bg-white' : 'border-[#6D3DF5]/20 bg-[#F8F6FF]',
              )}
            >
              <div className={cn('mt-0.5 w-2 h-2 rounded-full shrink-0', n.read ? 'bg-[#E9E7F5]' : 'bg-[#6D3DF5]')} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#0F1B3D] truncate">{n.title}</p>
                {n.message && <p className="text-[10px] text-[#536078] leading-snug mt-0.5 truncate">{n.message}</p>}
                {n.created_at && <p className="text-[9px] text-[#536078]/70 mt-1">{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}