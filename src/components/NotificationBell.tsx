'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, X, CheckCircle2, ScanLine, Camera, Video, Ban } from 'lucide-react'
import PusherClient from 'pusher-js'
import {
  getNotifications,
  markAllRead,
  type NotificationRow,
} from '@/db/actions/notifications'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ReactNode> = {
  confirmation: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  cancellation: <Ban className="w-3.5 h-3.5 text-red-500" />,
  checkin:      <ScanLine className="w-3.5 h-3.5 text-violet-500" />,
  photo:        <Camera className="w-3.5 h-3.5 text-indigo-500" />,
  video:        <Video className="w-3.5 h-3.5 text-blue-500" />,
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'ahora'
  if (mins < 60)  return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen]              = useState(false)
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unread, setUnread]          = useState(0)
  const [loaded, setLoaded]          = useState(false)
  const dropdownRef                  = useRef<HTMLDivElement>(null)

  // Load initial notifications
  useEffect(() => {
    getNotifications(20).then(rows => {
      setNotifications(rows)
      setUnread(rows.filter(r => !r.isRead).length)
      setLoaded(true)
    })
  }, [])

  // Pusher subscription
  useEffect(() => {
    const key     = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!key || !cluster) return

    const pusher  = new PusherClient(key, { cluster })
    const channel = pusher.subscribe('wedding-admin')

    channel.bind('notification', (data: { id: string; type: string; message: string; sentAt: string }) => {
      const newItem: NotificationRow = {
        id:      data.id,
        type:    data.type,
        message: data.message,
        isRead:  false,
        sentAt:  new Date(data.sentAt),
      }
      setNotifications(prev => [newItem, ...prev].slice(0, 30))
      setUnread(prev => prev + 1)
    })

    return () => pusher.disconnect()
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = useCallback(async () => {
    setOpen(prev => !prev)
    if (!open && unread > 0) {
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      await markAllRead()
    }
  }, [open, unread])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
        aria-label="Notificaciones"
      >
        <Bell className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
              Notificaciones
            </p>
            <button onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-20" style={{ color: 'var(--fg-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {loaded ? 'Sin notificaciones' : 'Cargando…'}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 px-3 py-2.5"
                    style={{ backgroundColor: n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)' }}
                  >
                    <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg"
                      style={{ backgroundColor: 'var(--surface)' }}>
                      {TYPE_ICON[n.type] ?? <Bell className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug" style={{ color: 'var(--fg)' }}>
                        {n.message ?? n.type}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                        {timeAgo(n.sentAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
