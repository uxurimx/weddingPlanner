'use server'

import { db } from '@/db'
import { events, invitations, mediaUploads, notificationsLog } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export type DashboardStats = {
  totalInvitations: number
  totalPasses: number
  confirmed: number
  confirmedPasses: number
  cancelled: number
  present: number
  presentPasses: number
  pending: number          // created + sent + viewed
  photos: number
  videos: number
  unreadNotifications: number
}

export type ActivityItem = {
  id: string
  type: string
  message: string | null
  isRead: boolean
  sentAt: Date
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)

  if (!event) {
    return {
      totalInvitations: 0, totalPasses: 0,
      confirmed: 0, confirmedPasses: 0,
      cancelled: 0, present: 0, presentPasses: 0,
      pending: 0, photos: 0, videos: 0, unreadNotifications: 0,
    }
  }

  const [invRows, mediaRows, notifRows] = await Promise.all([
    db.select({ status: invitations.status, totalPasses: invitations.totalPasses, confirmedCount: invitations.confirmedCount })
      .from(invitations)
      .where(eq(invitations.eventId, event.id)),
    db.select({ type: mediaUploads.type })
      .from(mediaUploads)
      .where(eq(mediaUploads.eventId, event.id)),
    db.select({ isRead: notificationsLog.isRead })
      .from(notificationsLog)
      .where(eq(notificationsLog.eventId, event.id)),
  ])

  const confirmed = invRows.filter(r => r.status === 'confirmed')
  const present   = invRows.filter(r => r.status === 'present')

  return {
    totalInvitations:    invRows.length,
    totalPasses:         invRows.reduce((s, r) => s + r.totalPasses, 0),
    confirmed:           confirmed.length,
    confirmedPasses:     confirmed.reduce((s, r) => s + (r.confirmedCount ?? r.totalPasses), 0),
    cancelled:           invRows.filter(r => r.status === 'cancelled').length,
    present:             present.length,
    presentPasses:       present.reduce((s, r) => s + r.totalPasses, 0),
    pending:             invRows.filter(r => ['created', 'sent', 'viewed'].includes(r.status)).length,
    photos:              mediaRows.filter(r => r.type === 'photo').length,
    videos:              mediaRows.filter(r => r.type === 'video').length,
    unreadNotifications: notifRows.filter(r => !r.isRead).length,
  }
}

export async function getActivityFeed(limit = 15): Promise<ActivityItem[]> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return []

  const rows = await db
    .select({
      id:      notificationsLog.id,
      type:    notificationsLog.type,
      message: notificationsLog.message,
      isRead:  notificationsLog.isRead,
      sentAt:  notificationsLog.sentAt,
    })
    .from(notificationsLog)
    .where(eq(notificationsLog.eventId, event.id))
    .orderBy(desc(notificationsLog.sentAt))
    .limit(limit)

  return rows.map(r => ({ ...r, sentAt: r.sentAt ?? new Date() }))
}
