'use server'

import { db } from '@/db'
import { events, invitations, mediaUploads } from '@/db/schema'
import { eq, desc, and, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { UTApi } from 'uploadthing/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MediaRow = {
  id: string
  type: 'photo' | 'video'
  url: string
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
  isApproved: boolean
  uploadedAt: Date
  invitationId: string | null
  familyName: string | null
  source: 'photographer' | 'guest'
}

export type MediaStats = {
  totalPhotos: number
  totalVideos: number
  photographerPhotos: number
  guestPhotos: number
  guestVideos: number
}

export type PhotographerData = {
  photographerToken: string | null
  eventName: string
  uploadCount: number
}

// ─── Get event ID ─────────────────────────────────────────────────────────────

async function getEventId(): Promise<string> {
  const [event] = await db.select({ id: events.id }).from(events).limit(1)
  if (!event) throw new Error('No event found')
  return event.id
}

// ─── Admin media list ─────────────────────────────────────────────────────────

export async function getMediaForAdmin(): Promise<{ photos: MediaRow[]; stats: MediaStats }> {
  const eventId = await getEventId()

  const rows = await db
    .select({
      id:           mediaUploads.id,
      type:         mediaUploads.type,
      url:          mediaUploads.url,
      fileName:     mediaUploads.fileName,
      fileSize:     mediaUploads.fileSize,
      mimeType:     mediaUploads.mimeType,
      isApproved:   mediaUploads.isApproved,
      uploadedAt:   mediaUploads.uploadedAt,
      invitationId: mediaUploads.invitationId,
      familyName:   invitations.familyName,
    })
    .from(mediaUploads)
    .leftJoin(invitations, eq(mediaUploads.invitationId, invitations.id))
    .where(eq(mediaUploads.eventId, eventId))
    .orderBy(desc(mediaUploads.uploadedAt))

  const photos: MediaRow[] = rows.map(r => ({
    ...r,
    type: r.type as 'photo' | 'video',
    uploadedAt: r.uploadedAt ?? new Date(),
    source: r.invitationId ? 'guest' : 'photographer',
  }))

  const stats: MediaStats = {
    totalPhotos:       photos.filter(p => p.type === 'photo').length,
    totalVideos:       photos.filter(p => p.type === 'video').length,
    photographerPhotos: photos.filter(p => p.source === 'photographer').length,
    guestPhotos:       photos.filter(p => p.source === 'guest' && p.type === 'photo').length,
    guestVideos:       photos.filter(p => p.source === 'guest' && p.type === 'video').length,
  }

  return { photos, stats }
}

// ─── Delete a media upload ────────────────────────────────────────────────────

export async function deleteMediaUpload(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const [row] = await db
      .select({ url: mediaUploads.url })
      .from(mediaUploads)
      .where(eq(mediaUploads.id, id))
      .limit(1)

    if (!row) return { error: 'Archivo no encontrado.' }

    // Extract UploadThing file key from URL
    const fileKey = row.url.split('/f/')[1]
    if (fileKey) {
      const utapi = new UTApi()
      await utapi.deleteFiles([fileKey])
    }

    await db.delete(mediaUploads).where(eq(mediaUploads.id, id))
    revalidatePath('/social')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar el archivo.' }
  }
}

// ─── Photographer data ────────────────────────────────────────────────────────

export async function getPhotographerData(): Promise<PhotographerData> {
  const [event] = await db
    .select({ id: events.id, name: events.name, photographerToken: events.photographerToken })
    .from(events)
    .limit(1)

  if (!event) return { photographerToken: null, eventName: '', uploadCount: 0 }

  const uploads = await db
    .select({ id: mediaUploads.id })
    .from(mediaUploads)
    .where(and(eq(mediaUploads.eventId, event.id), isNull(mediaUploads.invitationId)))

  return {
    photographerToken: event.photographerToken ?? null,
    eventName: event.name,
    uploadCount: uploads.length,
  }
}

// ─── Regenerate photographer token ───────────────────────────────────────────

export async function regeneratePhotographerToken(): Promise<{ token?: string; error?: string }> {
  try {
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .limit(1)

    if (!event) return { error: 'No hay evento configurado.' }

    // Generate a new UUID token by setting it to defaultRandom() via raw SQL approach
    // Drizzle doesn't expose gen_random_uuid() directly, so we use a JS UUID
    const { randomUUID } = await import('crypto')
    const newToken = randomUUID()

    await db
      .update(events)
      .set({ photographerToken: newToken })
      .where(eq(events.id, event.id))

    revalidatePath('/photographer')
    return { token: newToken }
  } catch {
    return { error: 'Error al regenerar el token.' }
  }
}

// ─── Get uploads for a guest invitation ───────────────────────────────────────

export async function getGuestUploads(invitationToken: string): Promise<MediaRow[]> {
  const [inv] = await db
    .select({ id: invitations.id, familyName: invitations.familyName })
    .from(invitations)
    .where(eq(invitations.token, invitationToken))
    .limit(1)

  if (!inv) return []

  const rows = await db
    .select({
      id:           mediaUploads.id,
      type:         mediaUploads.type,
      url:          mediaUploads.url,
      fileName:     mediaUploads.fileName,
      fileSize:     mediaUploads.fileSize,
      mimeType:     mediaUploads.mimeType,
      isApproved:   mediaUploads.isApproved,
      uploadedAt:   mediaUploads.uploadedAt,
      invitationId: mediaUploads.invitationId,
    })
    .from(mediaUploads)
    .where(eq(mediaUploads.invitationId, inv.id))
    .orderBy(desc(mediaUploads.uploadedAt))

  return rows.map(r => ({
    ...r,
    type: r.type as 'photo' | 'video',
    uploadedAt: r.uploadedAt ?? new Date(),
    familyName: inv.familyName,
    source: 'guest' as const,
  }))
}
