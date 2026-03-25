'use server'

import { db } from '@/db'
import { events, invitations, tablesSeating } from '@/db/schema'
import { eq, asc, desc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { pusherServer, CHECKIN_CHANNEL, CHECKIN_EVENT } from '@/lib/pusher'
import { logNotification } from './notifications'

export type CheckInResult = {
  familyName: string
  contactName: string
  totalPasses: number
  tableNumber: number | null
  tableName: string | null
  alreadyPresent: boolean
}

export type CheckInStats = {
  total: number
  totalPasses: number
  presentCount: number
  presentPasses: number
  confirmed: number
  pending: number
  cancelled: number
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function checkInByToken(
  token: string,
): Promise<{ error?: string; data?: CheckInResult }> {
  try {
    const [inv] = await db
      .select({
        id:          invitations.id,
        familyName:  invitations.familyName,
        contactName: invitations.contactName,
        totalPasses: invitations.totalPasses,
        status:      invitations.status,
        tableId:     invitations.tableId,
      })
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1)

    if (!inv) return { error: 'Invitación no encontrada.' }

    const alreadyPresent = inv.status === 'present'

    if (!alreadyPresent) {
      await db
        .update(invitations)
        .set({ status: 'present', checkedInAt: new Date(), updatedAt: new Date() })
        .where(eq(invitations.id, inv.id))
    }

    let tableNumber: number | null = null
    let tableName: string | null = null
    if (inv.tableId) {
      const [t] = await db
        .select({ number: tablesSeating.number, name: tablesSeating.name })
        .from(tablesSeating)
        .where(eq(tablesSeating.id, inv.tableId))
        .limit(1)
      if (t) { tableNumber = t.number; tableName = t.name }
    }

    if (!alreadyPresent) {
      const [event] = await db.select({ id: events.id }).from(events).limit(1)
      if (event) {
        await logNotification({
          eventId:      event.id,
          invitationId: inv.id,
          type:         'checkin',
          message:      `${inv.familyName} llegó al evento (${inv.totalPasses} pase${inv.totalPasses > 1 ? 's' : ''})`,
        })
      }
      if (pusherServer) {
        await pusherServer.trigger(CHECKIN_CHANNEL, CHECKIN_EVENT, {
          familyName:  inv.familyName,
          totalPasses: inv.totalPasses,
          tableNumber,
          checkedInAt: new Date().toISOString(),
        }).catch(console.error)
      }
    }

    revalidatePath('/checkin')
    revalidatePath('/overview')
    return { data: { familyName: inv.familyName, contactName: inv.contactName, totalPasses: inv.totalPasses, tableNumber, tableName, alreadyPresent } }
  } catch (e) {
    console.error(e)
    return { error: 'Error al registrar entrada.' }
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getCheckInStats(): Promise<CheckInStats> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return { total: 0, totalPasses: 0, presentCount: 0, presentPasses: 0, confirmed: 0, pending: 0, cancelled: 0 }

  const rows = await db
    .select({ status: invitations.status, totalPasses: invitations.totalPasses })
    .from(invitations)
    .where(eq(invitations.eventId, event.id))

  return {
    total:         rows.length,
    totalPasses:   rows.reduce((s, r) => s + r.totalPasses, 0),
    presentCount:  rows.filter(r => r.status === 'present').length,
    presentPasses: rows.filter(r => r.status === 'present').reduce((s, r) => s + r.totalPasses, 0),
    confirmed:     rows.filter(r => r.status === 'confirmed').length,
    pending:       rows.filter(r => ['created', 'sent', 'viewed'].includes(r.status)).length,
    cancelled:     rows.filter(r => r.status === 'cancelled').length,
  }
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export type CheckInRow = {
  id: string
  token: string
  invitationNumber: number | null
  familyName: string
  contactName: string
  totalPasses: number
  tableNumber: number | null
  tableName: string | null
  status: 'created' | 'sent' | 'viewed' | 'confirmed' | 'cancelled' | 'present'
  checkedInAt: Date | null
}

export async function getCheckInList(): Promise<CheckInRow[]> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return []

  const rows = await db
    .select({
      id:               invitations.id,
      token:            invitations.token,
      invitationNumber: invitations.invitationNumber,
      familyName:       invitations.familyName,
      contactName:      invitations.contactName,
      totalPasses:      invitations.totalPasses,
      status:           invitations.status,
      checkedInAt:      invitations.checkedInAt,
      tableNumber:      tablesSeating.number,
      tableName:        tablesSeating.name,
    })
    .from(invitations)
    .leftJoin(tablesSeating, eq(invitations.tableId, tablesSeating.id))
    .where(eq(invitations.eventId, event.id))
    .orderBy(asc(invitations.invitationNumber))

  return rows as CheckInRow[]
}

export async function getRecentCheckIns(limit = 30): Promise<CheckInRow[]> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return []

  const rows = await db
    .select({
      id:               invitations.id,
      token:            invitations.token,
      invitationNumber: invitations.invitationNumber,
      familyName:       invitations.familyName,
      contactName:      invitations.contactName,
      totalPasses:      invitations.totalPasses,
      status:           invitations.status,
      checkedInAt:      invitations.checkedInAt,
      tableNumber:      tablesSeating.number,
      tableName:        tablesSeating.name,
    })
    .from(invitations)
    .leftJoin(tablesSeating, eq(invitations.tableId, tablesSeating.id))
    .where(and(eq(invitations.eventId, event.id), eq(invitations.status, 'present')))
    .orderBy(desc(invitations.checkedInAt))
    .limit(limit)

  return rows as CheckInRow[]
}
