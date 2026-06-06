'use server'

import { db } from '@/db'
import { events, notificationsLog, invitations } from '@/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'

export type HistorialItem = {
  id: string
  type: string
  message: string | null
  isRead: boolean
  sentAt: Date
  invitationId: string | null
  familyName: string | null
}

export type HistorialFilter = 'all' | 'confirmation' | 'cancellation' | 'checkin' | 'photo' | 'video'

export async function getHistorial(
  page = 1,
  filter: HistorialFilter = 'all',
  pageSize = 50,
): Promise<{ items: HistorialItem[]; total: number; pages: number }> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return { items: [], total: 0, pages: 0 }

  const where = filter === 'all'
    ? eq(notificationsLog.eventId, event.id)
    : and(eq(notificationsLog.eventId, event.id), eq(notificationsLog.type, filter))

  const [{ total }] = await db
    .select({ total: count() })
    .from(notificationsLog)
    .where(where)

  const rows = await db
    .select({
      id:           notificationsLog.id,
      type:         notificationsLog.type,
      message:      notificationsLog.message,
      isRead:       notificationsLog.isRead,
      sentAt:       notificationsLog.sentAt,
      invitationId: notificationsLog.invitationId,
      familyName:   invitations.familyName,
    })
    .from(notificationsLog)
    .leftJoin(invitations, eq(notificationsLog.invitationId, invitations.id))
    .where(where)
    .orderBy(desc(notificationsLog.sentAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const pages = Math.ceil(total / pageSize)

  return {
    items: rows.map(r => ({ ...r, sentAt: r.sentAt ?? new Date() })),
    total,
    pages,
  }
}

export async function markAllHistorialRead(): Promise<void> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return
  await db
    .update(notificationsLog)
    .set({ isRead: true })
    .where(eq(notificationsLog.eventId, event.id))
}
