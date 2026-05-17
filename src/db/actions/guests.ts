'use server'

import { db } from '@/db'
import { events, invitations, invitationGuests, tablesSeating } from '@/db/schema'
import { eq, asc, desc, and, ne, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ActionState = { success?: boolean; error?: string; message?: string } | null

export type GuestMember = {
  id: string
  name: string
  ageGroup: string
  isConfirmed: boolean
}

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
  confirmationMessage: string | null
  sentAt: Date | null
  viewedAt: Date | null
  confirmedAt: Date | null
  cancelledAt: Date | null
  checkedInAt: Date | null
  createdAt: Date | null
  tableName: string | null
  tableNumber: number | null
  members: GuestMember[]
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
      confirmationMessage: invitations.confirmationMessage,
      sentAt: invitations.sentAt,
      viewedAt: invitations.viewedAt,
      confirmedAt: invitations.confirmedAt,
      cancelledAt: invitations.cancelledAt,
      checkedInAt: invitations.checkedInAt,
      createdAt: invitations.createdAt,
      tableName: tablesSeating.name,
      tableNumber: tablesSeating.number,
    })
    .from(invitations)
    .leftJoin(tablesSeating, eq(invitations.tableId, tablesSeating.id))
    .where(eq(invitations.eventId, eventId))
    .orderBy(asc(invitations.invitationNumber))

  // Fetch all family members in one query
  const membersByInvId: Record<string, GuestMember[]> = {}
  if (rows.length > 0) {
    const allMembers = await db
      .select()
      .from(invitationGuests)
      .where(inArray(invitationGuests.invitationId, rows.map(r => r.id)))
      .orderBy(asc(invitationGuests.createdAt))

    for (const m of allMembers) {
      ;(membersByInvId[m.invitationId] ??= []).push({
        id: m.id,
        name: m.name,
        ageGroup: m.ageGroup,
        isConfirmed: m.isConfirmed,
      })
    }
  }

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

  const invRows = rows.map(r => ({
    ...r,
    members: membersByInvId[r.id] ?? [],
  })) as InvitationRow[]

  return { invitations: invRows, tables }
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

// ─── Guest Members CRUD ───────────────────────────────────────────────────────

export async function addGuestMember(
  invitationId: string,
  name: string,
  ageGroup: 'adult' | 'child' | 'baby' = 'adult',
): Promise<ActionState> {
  try {
    if (!name.trim()) return { error: 'El nombre es requerido.' }
    await db.insert(invitationGuests).values({ invitationId, name: name.trim(), ageGroup })
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al agregar integrante.' }
  }
}

export async function removeGuestMember(id: string): Promise<ActionState> {
  try {
    await db.delete(invitationGuests).where(eq(invitationGuests.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al eliminar integrante.' }
  }
}

export async function toggleMemberConfirmed(id: string, current: boolean): Promise<ActionState> {
  try {
    await db.update(invitationGuests)
      .set({ isConfirmed: !current })
      .where(eq(invitationGuests.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al actualizar integrante.' }
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

    // Validate unique number per event
    const [conflict] = await db
      .select({ id: tablesSeating.id })
      .from(tablesSeating)
      .where(
        id
          ? and(eq(tablesSeating.eventId, eventId), eq(tablesSeating.number, number), ne(tablesSeating.id, id))
          : and(eq(tablesSeating.eventId, eventId), eq(tablesSeating.number, number)),
      )
      .limit(1)

    if (conflict) return { error: `Ya existe una mesa con el número ${number}.` }

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

export async function unassignInvitationFromTable(id: string): Promise<ActionState> {
  try {
    await db.update(invitations).set({ tableId: null, updatedAt: new Date() }).where(eq(invitations.id, id))
    revalidatePath('/guests')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al quitar de la mesa.' }
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

// ─── Bulk Delete ─────────────────────────────────────────────────────────────

export async function bulkDeleteInvitations(
  ids: string[],
): Promise<{ deleted: number; error?: string }> {
  try {
    if (ids.length === 0) return { deleted: 0 }
    for (const id of ids) {
      await db.delete(invitations).where(eq(invitations.id, id))
    }
    revalidatePath('/guests')
    return { deleted: ids.length }
  } catch (e) {
    console.error(e)
    return { deleted: 0, error: 'Error al eliminar invitaciones.' }
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

// ─── Merge (create family) ────────────────────────────────────────────────────

export async function mergeInvitations(
  ids: string[],
  familyName: string,
  contactName: string,
  contactPhone: string | null,
  totalPasses: number,
): Promise<ActionState> {
  try {
    if (ids.length < 2) return { error: 'Se necesitan al menos 2 invitados para unificar.' }

    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    // Fetch source invitations to preserve names before deletion
    const sourceInvs = await db
      .select({ contactName: invitations.contactName })
      .from(invitations)
      .where(inArray(invitations.id, ids))

    const existing = await db
      .select({ invitationNumber: invitations.invitationNumber })
      .from(invitations)
      .where(eq(invitations.eventId, eventId))

    const maxNum = existing.reduce((max, r) => Math.max(max, r.invitationNumber ?? 0), 0)

    // Create merged invitation, get its ID
    const [newInv] = await db
      .insert(invitations)
      .values({
        eventId,
        familyName,
        contactName,
        contactPhone: contactPhone || null,
        totalPasses: Math.max(1, totalPasses),
        invitationNumber: maxNum + 1,
        status: 'created',
      })
      .returning({ id: invitations.id })

    // Preserve each original person as a family member
    if (sourceInvs.length > 0) {
      await db.insert(invitationGuests).values(
        sourceInvs.map(s => ({
          invitationId: newInv.id,
          name: s.contactName,
          ageGroup: 'adult' as const,
          isConfirmed: false,
        })),
      )
    }

    // Delete individual invitations
    for (const id of ids) {
      await db.delete(invitations).where(eq(invitations.id, id))
    }

    revalidatePath('/guests')
    return { success: true, message: `${ids.length} invitados unificados en "${familyName}".` }
  } catch (e) {
    console.error(e)
    return { error: 'Error al unificar invitaciones.' }
  }
}
