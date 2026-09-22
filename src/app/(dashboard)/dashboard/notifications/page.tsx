'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, CheckCheck, Loader2, Trash2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notificationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await notificationsAPI.getAll()
      setNotifications(res.data.notifications?.data || res.data.notifications || [])
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications((prev: any[]) =>
        prev.map((n: any) => (n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n))
      )
    } catch { toast.error('Failed to mark as read') }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationsAPI.delete(id)
      setNotifications((prev: any[]) => prev.filter((n: any) => n.id !== id))
      toast.success('Notification deleted')
    } catch { toast.error('Failed to delete') }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <Mail className="w-5 h-5 text-[#FF8A36]" />
      case 'order': return <CheckCheck className="w-5 h-5 text-[#10B981]" />
      case 'payment': return <CheckCheck className="w-5 h-5 text-[#FF8A36]" />
      default: return <Bell className="w-5 h-5 text-[#8A93AE]" />
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F1B3D]">Notifications</h1>
          <p className="text-[#536078] text-sm">Stay updated with your activity</p>
        </div>
        {notifications.some((n: any) => !n.read_at) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#8A93AE]" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchNotifications}>Try Again</Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="w-12 h-12 mx-auto mb-4 text-[#8A93AE]/50" />
          <h3 className="text-lg font-medium mb-1 text-[#0F1B3D]">No notifications</h3>
          <p className="text-sm text-[#536078]">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                !notif.read_at
                  ? 'bg-[#F3EEFF]/60 border-[#6D3DF5]/20'
                  : 'bg-white border-[#E9E7F5]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#F3EEFF] flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#0F1B3D]">{notif.title}</p>
                    <p className="text-sm text-[#536078] mt-0.5">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.read_at && (
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleMarkRead(notif.id)} title="Mark as read">
                        <CheckCheck className="w-4 h-4 text-[#8A93AE]" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400" onClick={() => handleDelete(notif.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-[#8A93AE] mt-2">
                  {new Date(notif.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {!notif.read_at && <span className="w-2 h-2 rounded-full bg-[#6D3DF5] shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
