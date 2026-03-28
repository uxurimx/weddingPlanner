'use server'

import { db } from '@/db'
import { events, invitations, tablesSeating } from '@/db/schema'
import { eq, asc, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ActionState = { success?: boolean; error?: string; message?: string } | null

export type InvitationRow = {
  id: string
  token: string
  invitationNumber: number | null
  familyName: string
  contactName: string
  contactPhone: string | null
  contactEmail: string | null
  totalPasses: number
  confirmedCount: number | null
  tableId: string | null
  status: 'created' | 'sent' | 'viewed' | 'confirmed' | 'cancelled' | 'present'
  adminNotes: string | null
  dietaryNotes: string | null
  sentAt: Date | null
  confirmedAt: Date | null
  checkedInAt: Date | null
  createdAt: Date | null
  tableName: string | null
  tableNumber: number | null
}

export type TableWithOccupancy = typeof tablesSeating.$inferSelect & { occupancy: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getFirstEventId(): Promise<string | null> {
  const [ev] = await db.select({ id: events.id }).from(events).limit(1)
  return ev?.id ?? null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getInvitationsData(): Promise<{
  invitations: InvitationRow[]
  tables: TableWithOccupancy[]
}> {
  const eventId = await getFirstEventId()
  if (!eventId) return { invitations: [], tables: [] }

  const rows = await db
    .select({
      id: invitations.id,
      token: invitations.token,
      invitationNumber: invitations.invitationNumber,
      familyName: invitations.familyName,
      contactName: invitations.contactName,
      contactPhone: invitations.contactPhone,
      contactEmail: invitations.contactEmail,
      totalPasses: invitations.totalPasses,
      confirmedCount: invitations.confirmedCount,
      tableId: invitations.tableId,
      status: invitations.status,
      adminNotes: invitations.adminNotes,
      dietaryNotes: invitations.dietaryNotes,
      sentAt: invitations.sentAt,
      confirmedAt: invitations.confirmedAt,
      checkedInAt: invitations.checkedInAt,
      createdAt: invitations.createdAt,
      tableName: tablesSeating.name,
      tableNumber: tablesSeating.number,
    })
    .from(invitations)
    .leftJoin(tablesSeating, eq(invitations.tableId, tablesSeating.id))
    .where(eq(invitations.eventId, eventId))
    .orderBy(asc(invitations.invitationNumber))

  const tableRows = await db
    .select()
    .from(tablesSeating)
    .where(eq(tablesSeating.eventId, eventId))
    .orderBy(asc(tablesSeating.number))

  const occupancy = rows.reduce<Record<string, number>>((acc, inv) => {
    if (inv.tableId) acc[inv.tableId] = (acc[inv.tableId] ?? 0) + inv.totalPasses
    return acc
  }, {})

  const tables = tableRows.map(t => ({ ...t, occupancy: occupancy[t.id] ?? 0 }))

  return { invitations: rows as InvitationRow[], tables }
}

// ─── Invitations CRUD ─────────────────────────────────────────────────────────

const VALID_STATUSES = ['created', 'sent', 'viewed', 'confirmed', 'cancelled', 'present'] as const
type InvStatus = typeof VALID_STATUSES[number]

export async function upsertInvitation(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = formData.get('id') as string | null
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const familyName = String(formData.get('familyName') ?? '').trim()
    const contactName = String(formData.get('contactName') ?? '').trim()
    if (!familyName || !contactName) return { error: 'Nombre de familia y contacto son requeridos.' }

    const totalPasses = Math.max(1, parseInt(String(formData.get('totalPasses') ?? '1'), 10) || 1)
    const tableId = (formData.get('tableId') as string) || null

    const shared = {
      familyName,
      contactName,
      contactPhone: (formData.get('contactPhone') as string) || null,
      contactEmail: (formData.get('contactEmail') as string) || null,
      totalPasses,
      tableId,
      adminNotes: (formData.get('adminNotes') as string) || null,
      updatedAt: new Date(),
    }

    if (id) {
      const statusRaw = formData.get('status') as string
      const status = (VALID_STATUSES as readonly string[]).includes(statusRaw)
        ? (statusRaw as InvStatus)
        : undefined

      await db.update(invitations)
        .set({ ...shared, ...(status ? { status } : {}) })
        .where(eq(invitations.id, id))
    } else {
      const [last] = await db
        .select({ n: invitations.invitationNumber })
        .from(invitations)
        .where(eq(invitations.eventId, eventId))
        .orderBy(desc(invitations.invitationNumber))
        .limit(1)
      const invitationNumber = (last?.n ?? 0) + 1

      await db.insert(invitations).values({
        eventId,
        invitationNumber,
        status: 'created',
        ...shared,
      })
    }

    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al guardar la invitación.' }
  }
}

export async function deleteInvitation(id: string): Promise<ActionState> {
  try {
    await db.delete(invitations).where(eq(invitations.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al eliminar.' }
  }
}

export async function markInvitationSent(id: string): Promise<ActionState> {
  try {
    await db.update(invitations)
      .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      .where(eq(invitations.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al actualizar.' }
  }
}

// ─── Tables CRUD ──────────────────────────────────────────────────────────────

const VALID_CATS = ['vip', 'familia', 'amigos', 'trabajo', 'otro'] as const
type TableCat = typeof VALID_CATS[number]

export async function upsertTable(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = formData.get('id') as string | null
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const number = Math.max(1, parseInt(String(formData.get('number') ?? '1'), 10) || 1)
    const name = (formData.get('name') as string) || null
    const capacity = Math.max(1, parseInt(String(formData.get('capacity') ?? '10'), 10) || 10)
    const catRaw = formData.get('category') as string
    const category: TableCat = (VALID_CATS as readonly string[]).includes(catRaw)
      ? (catRaw as TableCat)
      : 'amigos'
    const notes = (formData.get('notes') as string) || null

    const data = { number, name, capacity, category, notes, updatedAt: new Date() }

    if (id) {
      await db.update(tablesSeating).set(data).where(eq(tablesSeating.id, id))
    } else {
      await db.insert(tablesSeating).values({ eventId, ...data })
    }

    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al guardar la mesa.' }
  }
}

export async function deleteTable(id: string): Promise<ActionState> {
  try {
    const [assigned] = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(eq(invitations.tableId, id))
      .limit(1)
    if (assigned) return { error: 'Hay invitaciones asignadas a esta mesa.' }

    await db.delete(tablesSeating).where(eq(tablesSeating.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al eliminar.' }
  }
}

export async function seedDefaultTables(): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const [existing] = await db
      .select({ id: tablesSeating.id })
      .from(tablesSeating)
      .where(eq(tablesSeating.eventId, eventId))
      .limit(1)
    if (existing) return { error: 'Ya existen mesas. Elimínalas primero si deseas regenerarlas.' }

    const rows = Array.from({ length: 15 }, (_, i) => ({
      eventId,
      number: i + 1,
      name: `Mesa ${i + 1}`,
      capacity: 13,
      category: 'amigos' as TableCat,
    }))

    await db.insert(tablesSeating).values(rows)
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al crear las mesas.' }
  }
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────

export type ImportGuest = {
  nombre: string
  telefono?: string | null
  pases?: number
}

export async function bulkImportInvitations(
  guests: ImportGuest[],
): Promise<{ imported: number; error?: string }> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { imported: 0, error: 'No se encontró el evento.' }

    // Determine next invitationNumber
    const existing = await db
      .select({ invitationNumber: invitations.invitationNumber })
      .from(invitations)
      .where(eq(invitations.eventId, eventId))

    const maxNum = existing.reduce((max, r) => Math.max(max, r.invitationNumber ?? 0), 0)

    const rows = guests
      .filter(g => g.nombre.trim())
      .map((g, i) => ({
        eventId,
        familyName:       g.nombre.trim(),
        contactName:      g.nombre.trim(),
        contactPhone:     g.telefono?.trim() || null,
        totalPasses:      Math.max(1, g.pases ?? 1),
        invitationNumber: maxNum + i + 1,
        status:           'created' as const,
      }))

    if (rows.length === 0) return { imported: 0, error: 'No hay filas válidas para importar.' }

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      await db.insert(invitations).values(rows.slice(i, i + 50))
    }

    revalidatePath('/guests')
    return { imported: rows.length }
  } catch (e) {
    console.error(e)
    return { imported: 0, error: 'Error al importar invitaciones.' }
  }
}
