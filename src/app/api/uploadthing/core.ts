import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { z } from 'zod'
import { db } from '@/db'
import { events, invitations, mediaUploads } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { logNotification } from '@/db/actions/notifications'

const f = createUploadthing()

export const ourFileRouter = {
  // ─── Photographer: bulk photo upload (tokenized, no auth required) ───────────
  photographerUpload: f({ image: { maxFileSize: '16MB', maxFileCount: 200 } })
    .input(z.object({ photographerToken: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const [event] = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.photographerToken, input.photographerToken))
        .limit(1)
      if (!event) throw new UploadThingError('Token de fotógrafo inválido.')
      return { eventId: event.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(mediaUploads).values({
        eventId:  metadata.eventId,
        type:     'photo',
        url:      file.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })
      await logNotification({
        eventId: metadata.eventId,
        type:    'photo',
        message: `Fotógrafo subió ${file.name}`,
      })
    }),

  // ─── Guest: photos & videos from invitation token ────────────────────────────
  guestUpload: f({
    image: { maxFileSize: '16MB', maxFileCount: 20 },
    video: { maxFileSize: '128MB', maxFileCount: 3 },
  })
    .input(z.object({ invitationToken: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const [inv] = await db
        .select({ id: invitations.id, eventId: invitations.eventId })
        .from(invitations)
        .where(eq(invitations.token, input.invitationToken))
        .limit(1)
      if (!inv) throw new UploadThingError('Invitación no encontrada.')
      return { eventId: inv.eventId, invitationId: inv.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isVideo = file.type.startsWith('video/')
      await db.insert(mediaUploads).values({
        eventId:      metadata.eventId,
        invitationId: metadata.invitationId,
        type:         isVideo ? 'video' : 'photo',
        url:          file.url,
        fileName:     file.name,
        fileSize:     file.size,
        mimeType:     file.type,
      })
      // Look up family name for the notification message
      const [inv] = await db
        .select({ familyName: invitations.familyName })
        .from(invitations)
        .where(eq(invitations.id, metadata.invitationId))
        .limit(1)
      await logNotification({
        eventId:      metadata.eventId,
        invitationId: metadata.invitationId,
        type:         isVideo ? 'video' : 'photo',
        message:      `${inv?.familyName ?? 'Invitado'} compartió ${isVideo ? 'un video' : 'una foto'}`,
      })
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
