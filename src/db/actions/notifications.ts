'use server'

import { db } from '@/db'
import { events, notificationsLog, invitations } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { pusherServer, ADMIN_CHANNEL, NOTIFICATION_EVENT } from '@/lib/pusher'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'confirmation' | 'cancellation' | 'checkin' | 'photo' | 'video'

export type NotificationRow = {
  id: string
  type: string
  message: string | null
  isRead: boolean
  sentAt: Date
}

// ─── Log + broadcast a new notification ──────────────────────────────────────

export async function logNotification(params: {
  eventId: string
  type: NotificationType
  message: string
  invitationId?: string
}): Promise<void> {
  try {
    const [row] = await db
      .insert(notificationsLog)
      .values({
        eventId:      params.eventId,
        invitationId: params.invitationId ?? null,
        type:         params.type,
        channel:      'pusher',
        message:      params.message,
        isRead:       false,
      })
      .returning({ id: notificationsLog.id })

    if (pusherServer && row) {
      await pusherServer.trigger(ADMIN_CHANNEL, NOTIFICATION_EVENT, {
        id:      row.id,
        type:    params.type,
        message: params.message,
        sentAt:  new Date().toISOString(),
      }).catch(console.error)
    }
  } catch (e) {
    console.error('[logNotification]', e)
  }
}

// ─── Get recent notifications ─────────────────────────────────────────────────

export async function getNotifications(limit = 30): Promise<NotificationRow[]> {
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

// ─── Unread count ─────────────────────────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const rows = await getNotifications(100)
  return rows.filter(r => !r.isRead).length
}

// ─── Mark all read ────────────────────────────────────────────────────────────

export async function markAllRead(): Promise<void> {
  try {
    const [event] = await db.select({ id: events.id }).from(events).limit(1)
    if (!event) return

    await db
      .update(notificationsLog)
      .set({ isRead: true })
      .where(eq(notificationsLog.eventId, event.id))

    revalidatePath('/overview')
  } catch (e) {
    console.error('[markAllRead]', e)
  }
}
