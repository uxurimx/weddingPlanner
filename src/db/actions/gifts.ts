'use server'

import { db } from '@/db'
import { events, giftRegistries } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ActionState = { success?: boolean; error?: string; message?: string } | null

// ─── Query ────────────────────────────────────────────────────────────────────

export async function getGifts() {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return { eventId: null, gifts: [] }

  const gifts = await db.select().from(giftRegistries)
    .where(eq(giftRegistries.eventId, event.id))
    .orderBy(asc(giftRegistries.order))

  return { eventId: event.id, gifts }
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

export async function upsertGift(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const [event] = await db.select({ id: events.id }).from(events).limit(1)
    if (!event) return { error: 'No se encontró el evento.' }

    const id   = formData.get('id') as string | null
    const type = formData.get('type') as 'registry' | 'bank_transfer' | 'honeymoon' | 'other'

    const data = {
      type,
      storeName:     (formData.get('storeName')     as string) || null,
      url:           (formData.get('url')           as string) || null,
      listNumber:    (formData.get('listNumber')    as string) || null,
      bankName:      (formData.get('bankName')      as string) || null,
      accountHolder: (formData.get('accountHolder') as string) || null,
      accountNumber: (formData.get('accountNumber') as string) || null,
      clabe:         (formData.get('clabe')         as string) || null,
      description:   (formData.get('description')   as string) || null,
      isActive:      true,
      updatedAt:     new Date(),
    }

    if (id) {
      await db.update(giftRegistries).set(data).where(eq(giftRegistries.id, id))
    } else {
      const existing = await db.select({ order: giftRegistries.order })
        .from(giftRegistries).where(eq(giftRegistries.eventId, event.id))
      const maxOrder = existing.reduce((m, g) => Math.max(m, g.order), -1)
      await db.insert(giftRegistries).values({ ...data, eventId: event.id, order: maxOrder + 1 })
    }

    revalidatePath('/gifts')
    return { success: true, message: '¡Guardado!' }
  } catch {
    return { error: 'Error al guardar.' }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteGift(id: string): Promise<ActionState> {
  try {
    await db.delete(giftRegistries).where(eq(giftRegistries.id, id))
    revalidatePath('/gifts')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar.' }
  }
}
