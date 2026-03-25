'use server'

import { db } from '@/db'
import { events, itineraryItems } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ActionState = { success?: boolean; error?: string; message?: string } | null

// ─── Query ────────────────────────────────────────────────────────────────────

export async function getItinerary() {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) return { eventId: null, items: [] }

  const items = await db.select().from(itineraryItems)
    .where(eq(itineraryItems.eventId, event.id))
    .orderBy(asc(itineraryItems.order))

  return { eventId: event.id, items }
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

export async function upsertItineraryItem(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const [event] = await db.select({ id: events.id }).from(events).limit(1)
    if (!event) return { error: 'No se encontró el evento.' }

    const id    = formData.get('id') as string | null
    const data  = {
      time:        String(formData.get('time')        ?? ''),
      title:       String(formData.get('title')       ?? ''),
      description: (formData.get('description') as string) || null,
      icon:        (formData.get('icon')        as string) || null,
      isVisible:   formData.get('isVisible') !== 'false',
      updatedAt:   new Date(),
    }

    if (id) {
      await db.update(itineraryItems).set(data).where(eq(itineraryItems.id, id))
    } else {
      const existing = await db.select({ order: itineraryItems.order })
        .from(itineraryItems).where(eq(itineraryItems.eventId, event.id))
      const maxOrder = existing.reduce((m, i) => Math.max(m, i.order), -1)
      await db.insert(itineraryItems).values({ ...data, eventId: event.id, order: maxOrder + 1 })
    }

    revalidatePath('/itinerary')
    return { success: true, message: '¡Guardado!' }
  } catch {
    return { error: 'Error al guardar.' }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteItineraryItem(id: string): Promise<ActionState> {
  try {
    await db.delete(itineraryItems).where(eq(itineraryItems.id, id))
    revalidatePath('/itinerary')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar.' }
  }
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function moveItineraryItem(id: string, direction: 'up' | 'down'): Promise<ActionState> {
  try {
    const [item] = await db.select().from(itineraryItems).where(eq(itineraryItems.id, id))
    if (!item) return { error: 'Item no encontrado.' }

    const allItems = await db.select({ id: itineraryItems.id, order: itineraryItems.order })
      .from(itineraryItems)
      .where(eq(itineraryItems.eventId, item.eventId))
      .orderBy(asc(itineraryItems.order))

    const idx       = allItems.findIndex(i => i.id === id)
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1

    if (targetIdx < 0 || targetIdx >= allItems.length) return { success: true }

    const target = allItems[targetIdx]
    await db.update(itineraryItems).set({ order: target.order }).where(eq(itineraryItems.id, item.id))
    await db.update(itineraryItems).set({ order: item.order  }).where(eq(itineraryItems.id, target.id))

    revalidatePath('/itinerary')
    return { success: true }
  } catch {
    return { error: 'Error al reordenar.' }
  }
}

// ─── Toggle visibility ────────────────────────────────────────────────────────

export async function toggleItineraryItemVisibility(id: string, current: boolean): Promise<ActionState> {
  try {
    await db.update(itineraryItems).set({ isVisible: !current }).where(eq(itineraryItems.id, id))
    revalidatePath('/itinerary')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar.' }
  }
}
