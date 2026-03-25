'use server'

import { db } from '@/db'
import { events, couple, venues, itineraryItems, giftRegistries, invitations } from '@/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logNotification } from './notifications'

export type ActionState = { success?: boolean; error?: string; rsvpAction?: string } | null

export type PublicData = {
  event: typeof events.$inferSelect
  couple: typeof couple.$inferSelect | null
  venues: typeof venues.$inferSelect[]
  itinerary: typeof itineraryItems.$inferSelect[]
  gifts: typeof giftRegistries.$inferSelect[]
}

export type InvitationPublicData = PublicData & {
  invitation: typeof invitations.$inferSelect
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPublicEventData(): Promise<PublicData | null> {
  const [event] = await db.select().from(events).limit(1)
  if (!event) return null

  const [coupleRow] = await db.select().from(couple).where(eq(couple.eventId, event.id))

  const venueRows = await db
    .select()
    .from(venues)
    .where(eq(venues.eventId, event.id))
    .orderBy(asc(venues.order))

  const itineraryRows = await db
    .select()
    .from(itineraryItems)
    .where(and(eq(itineraryItems.eventId, event.id), eq(itineraryItems.isVisible, true)))
    .orderBy(asc(itineraryItems.order))

  const giftRows = await db
    .select()
    .from(giftRegistries)
    .where(and(eq(giftRegistries.eventId, event.id), eq(giftRegistries.isActive, true)))
    .orderBy(asc(giftRegistries.order))

  return {
    event,
    couple: coupleRow ?? null,
    venues: venueRows,
    itinerary: itineraryRows,
    gifts: giftRows,
  }
}

export async function getInvitationByToken(token: string): Promise<InvitationPublicData | null> {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)
  if (!invitation) return null

  const publicData = await getPublicEventData()
  if (!publicData) return null

  return { ...publicData, invitation }
}

export async function trackView(token: string): Promise<void> {
  try {
    const [inv] = await db
      .select({ id: invitations.id, status: invitations.status })
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1)
    if (!inv || inv.status !== 'sent') return
    await db
      .update(invitations)
      .set({ status: 'viewed', viewedAt: new Date(), updatedAt: new Date() })
      .where(eq(invitations.id, inv.id))
  } catch {
    // Non-critical — don't fail the page
  }
}

// ─── RSVP ─────────────────────────────────────────────────────────────────────

export async function submitRSVP(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token       = formData.get('token') as string
    const rsvpAction  = formData.get('rsvpAction') as 'confirm' | 'decline'
    const countRaw    = parseInt(String(formData.get('confirmedCount') ?? '1'), 10)
    const message     = (formData.get('message') as string) || null

    if (!token) return { error: 'Token inválido.' }

    const [inv] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1)
    if (!inv) return { error: 'Invitación no encontrada.' }
    if (inv.status === 'present') return { error: 'Esta invitación ya fue registrada en el evento.' }

    if (rsvpAction === 'confirm') {
      const confirmedCount = Math.min(Math.max(1, countRaw), inv.totalPasses)
      await db.update(invitations).set({
        status: 'confirmed',
        confirmedCount,
        confirmedAt: new Date(),
        confirmationMessage: message,
        updatedAt: new Date(),
      }).where(eq(invitations.id, inv.id))
    } else {
      await db.update(invitations).set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(invitations.id, inv.id))
    }

    // Log notification
    const [event] = await db.select({ id: events.id }).from(events).limit(1)
    if (event) {
      await logNotification({
        eventId:      event.id,
        invitationId: inv.id,
        type:         rsvpAction === 'confirm' ? 'confirmation' : 'cancellation',
        message:      rsvpAction === 'confirm'
          ? `${inv.familyName} confirmó asistencia`
          : `${inv.familyName} canceló su asistencia`,
      })
    }

    revalidatePath(`/i/${token}`)
    return { success: true, rsvpAction }
  } catch (e) {
    console.error(e)
    return { error: 'Error al guardar tu respuesta. Intenta de nuevo.' }
  }
}
