'use server'

import { db } from '@/db'
import { events, notificationsLog } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type NotificationRow = {
  id: string
  type: string
  message: string | null
  isRead: boolean
  sentAt: Date
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
