'use server'

import { db } from '@/db'
import { events, couple, venues, itineraryItems, giftRegistries } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ActionState = { success?: boolean; error?: string; message?: string } | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getFirstEventId(): Promise<string | null> {
  const [ev] = await db.select({ id: events.id }).from(events).limit(1)
  return ev?.id ?? null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getEventData() {
  const [event] = await db.select().from(events).limit(1)
  if (!event) return null

  const [coupleRow] = await db.select().from(couple).where(eq(couple.eventId, event.id))
  const venueRows = await db.select().from(venues)
    .where(eq(venues.eventId, event.id))
    .orderBy(asc(venues.order))

  return { event, couple: coupleRow ?? null, venues: venueRows }
}

// ─── Couple ───────────────────────────────────────────────────────────────────

export async function upsertCouple(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const data = {
      groomName:      String(formData.get('groomName')      ?? ''),
      groomNickname:  (formData.get('groomNickname')  as string) || null,
      groomFather:    (formData.get('groomFather')    as string) || null,
      groomMother:    (formData.get('groomMother')    as string) || null,
      brideName:      String(formData.get('brideName')      ?? ''),
      brideNickname:  (formData.get('brideNickname')  as string) || null,
      brideFather:    (formData.get('brideFather')    as string) || null,
      brideMother:    (formData.get('brideMother')    as string) || null,
      story:          (formData.get('story')          as string) || null,
      quote:          (formData.get('quote')          as string) || null,
      quoteSource:    (formData.get('quoteSource')    as string) || null,
      invitationText: (formData.get('invitationText') as string) || null,
      updatedAt: new Date(),
    }

    const [existing] = await db.select({ id: couple.id }).from(couple).where(eq(couple.eventId, eventId))

    if (existing) {
      await db.update(couple).set(data).where(eq(couple.id, existing.id))
    } else {
      await db.insert(couple).values({ ...data, eventId })
    }

    revalidatePath('/information')
    return { success: true, message: '¡Guardado correctamente!' }
  } catch {
    return { error: 'Error al guardar. Intenta de nuevo.' }
  }
}

// ─── Event ────────────────────────────────────────────────────────────────────

export async function upsertEvent(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const dateStr = formData.get('date') as string

    const data = {
      dressCode:      (formData.get('dressCode')      as string) || null,
      dressCodeNotes: (formData.get('dressCodeNotes') as string) || null,
      eventNotes:     (formData.get('eventNotes')     as string) || null,
      ...(dateStr ? { date: new Date(dateStr) } : {}),
      updatedAt: new Date(),
    }

    await db.update(events).set(data).where(eq(events.id, eventId))

    revalidatePath('/information')
    return { success: true, message: '¡Guardado correctamente!' }
  } catch {
    return { error: 'Error al guardar. Intenta de nuevo.' }
  }
}

// ─── Venue ────────────────────────────────────────────────────────────────────

export async function upsertVenue(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const type = formData.get('type') as string
    const startTimeStr = formData.get('startTime') as string

    const data = {
      type,
      name:          String(formData.get('name') ?? ''),
      address:       (formData.get('address')       as string) || null,
      city:          (formData.get('city')          as string) || null,
      state:         (formData.get('state')         as string) || null,
      zipCode:       (formData.get('zipCode')       as string) || null,
      googleMapsUrl: (formData.get('googleMapsUrl') as string) || null,
      wazeUrl:       (formData.get('wazeUrl')       as string) || null,
      notes:         (formData.get('notes')         as string) || null,
      ...(startTimeStr ? { startTime: new Date(startTimeStr) } : {}),
      updatedAt: new Date(),
    }

    const [existing] = await db.select({ id: venues.id }).from(venues)
      .where(and(eq(venues.eventId, eventId), eq(venues.type, type)))

    if (existing) {
      await db.update(venues).set(data).where(eq(venues.id, existing.id))
    } else {
      const order = type === 'ceremony' ? 0 : 1
      await db.insert(venues).values({ ...data, eventId, order })
    }

    revalidatePath('/information')
    return { success: true, message: '¡Guardado correctamente!' }
  } catch {
    return { error: 'Error al guardar. Intenta de nuevo.' }
  }
}

// ─── Song ─────────────────────────────────────────────────────────────────────

export async function upsertSong(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No se encontró el evento.' }

    const data = {
      songTitle: (formData.get('songTitle') as string) || null,
      songUrl:   (formData.get('songUrl')   as string) || null,
      updatedAt: new Date(),
    }

    const [existing] = await db.select({ id: couple.id }).from(couple).where(eq(couple.eventId, eventId))

    if (existing) {
      await db.update(couple).set(data).where(eq(couple.id, existing.id))
    } else {
      await db.insert(couple).values({ ...data, eventId, groomName: '', brideName: '' })
    }

    revalidatePath('/information')
    return { success: true, message: '¡Guardado correctamente!' }
  } catch {
    return { error: 'Error al guardar. Intenta de nuevo.' }
  }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export async function seedWeddingData(): Promise<ActionState> {
  try {
    // Event
    let [event] = await db.select().from(events).limit(1)
    if (!event) {
      const [newEvent] = await db.insert(events).values({
        name:       'Boda Jahir & Gilliane',
        slug:       'jahir-gilliane-2026',
        date:       new Date('2026-06-06T14:30:00'),
        dressCode:  'Formal',
        eventNotes: 'Pases intransferibles · Respetuosamente No niños.',
      }).returning()
      event = newEvent
    }

    // Couple
    const [existingCouple] = await db.select({ id: couple.id }).from(couple).where(eq(couple.eventId, event.id))
    if (!existingCouple) {
      await db.insert(couple).values({
        eventId:        event.id,
        groomName:      'Jahir Aréchiga Cárdenas',
        groomNickname:  'Jair',
        groomFather:    'José Arturo Aréchiga Cárdenas',
        groomMother:    'Ana Velia Torres Laveaga',
        brideName:      'Gilliane Sauceda',
        brideNickname:  'Gilli',
        brideFather:    'Jehú Sauceda González',
        brideMother:    'Neyda Villarreal Torres',
        quote:          'Me comprometeré contigo para siempre; me comprometeré en rectitud y justicia, en amor leal y misericordia',
        quoteSource:    'Oseas 2:19',
        invitationText: 'Nos complace que seas parte de este día tan especial.',
      })
    }

    // Venues
    const existingVenues = await db.select({ type: venues.type }).from(venues).where(eq(venues.eventId, event.id))
    const venueTypes = existingVenues.map(v => v.type)

    if (!venueTypes.includes('ceremony')) {
      await db.insert(venues).values({
        eventId:   event.id,
        type:      'ceremony',
        name:      'Salón del Reino de los Testigos de Jehová',
        address:   'Blvd F. Toscana 3385, Fracc. Statos Toscane',
        city:      'Culiacán',
        state:     'Sinaloa',
        startTime: new Date('2026-06-06T14:30:00'),
        order:     0,
      })
    }

    if (!venueTypes.includes('reception')) {
      await db.insert(venues).values({
        eventId:   event.id,
        type:      'reception',
        name:      'Salón de Eventos Queen Palace',
        address:   'De Los Insurgentes 396, Centro',
        city:      'Culiacán',
        state:     'Sinaloa',
        zipCode:   '40000',
        startTime: new Date('2026-06-06T17:00:00'),
        order:     1,
      })
    }

    // Itinerary
    const [existingItem] = await db.select({ id: itineraryItems.id }).from(itineraryItems).where(eq(itineraryItems.eventId, event.id))
    if (!existingItem) {
      await db.insert(itineraryItems).values([
        { eventId: event.id, order: 0, time: '2:30 PM', icon: '🕍', title: 'Discurso Bíblico',     description: 'Salón del Reino de los Testigos de Jehová' },
        { eventId: event.id, order: 1, time: '4:00 PM', icon: '📸', title: 'Sesión de fotos',       description: 'Sesión fotográfica oficial' },
        { eventId: event.id, order: 2, time: '5:00 PM', icon: '🥂', title: 'Cóctel de bienvenida',  description: 'Salón de Eventos Queen Palace' },
        { eventId: event.id, order: 3, time: '6:00 PM', icon: '🍽️', title: 'Cena',                 description: 'Salón principal' },
        { eventId: event.id, order: 4, time: '8:00 PM', icon: '💃', title: 'Primer baile',          description: 'Jahir & Gilliane' },
        { eventId: event.id, order: 5, time: '9:00 PM', icon: '🎂', title: 'Pastel',                description: '' },
        { eventId: event.id, order: 6, time: '9:30 PM', icon: '🎉', title: 'Fiesta',                description: '¡A bailar!' },
      ])
    }

    // Gifts
    const [existingGift] = await db.select({ id: giftRegistries.id }).from(giftRegistries).where(eq(giftRegistries.eventId, event.id))
    if (!existingGift) {
      await db.insert(giftRegistries).values([
        { eventId: event.id, type: 'registry',      storeName: 'Sears',             listNumber: '234094',              description: 'Mesa de regalos Sears',    order: 0 },
        { eventId: event.id, type: 'registry',      storeName: 'Liverpool',         listNumber: '51947675',            description: 'Mesa de regalos Liverpool', order: 1 },
        { eventId: event.id, type: 'bank_transfer', bankName:  'BBVA',              accountHolder: 'Gilliane Aréchiga', accountNumber: '4152 2929 2680 6136', description: 'Efectivo o Transferencia', order: 2 },
        { eventId: event.id, type: 'honeymoon',     storeName: 'Luna de miel',      description: 'Contribuye a su viaje soñado', order: 3 },
      ])
    }

    revalidatePath('/information')
    revalidatePath('/itinerary')
    revalidatePath('/gifts')
    return { success: true, message: 'Datos iniciales cargados correctamente.' }
  } catch (err) {
    console.error('Seed error:', err)
    return { error: 'Error al cargar datos iniciales.' }
  }
}

// ─── Event flags ──────────────────────────────────────────────────────────────

export async function getEventFlags(): Promise<{
  isCheckinActive: boolean
  isPostEventActive: boolean
} | null> {
  const [event] = await db
    .select({ isCheckinActive: events.isCheckinActive, isPostEventActive: events.isPostEventActive })
    .from(events)
    .limit(1)
  return event ?? null
}

export async function toggleEventFlag(
  flag: 'isCheckinActive' | 'isPostEventActive',
  value: boolean,
): Promise<ActionState> {
  try {
    const eventId = await getFirstEventId()
    if (!eventId) return { error: 'No hay evento configurado.' }
    await db.update(events).set({ [flag]: value, updatedAt: new Date() }).where(eq(events.id, eventId))
    revalidatePath('/settings')
    revalidatePath('/checkin')
    return { success: true, message: 'Guardado.' }
  } catch {
    return { error: 'Error al actualizar.' }
  }
}
