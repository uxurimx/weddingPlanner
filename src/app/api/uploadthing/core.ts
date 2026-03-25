import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { z } from 'zod'
import { db } from '@/db'
import { events, invitations, mediaUploads, videoMessages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { logNotification } from '@/lib/logNotification'
import { uploadLog } from '@/lib/uploadLogger'

const f = createUploadthing()

export const ourFileRouter = {
  // ─── Photographer: bulk photo upload ─────────────────────────────────────────
  photographerUpload: f({ image: { maxFileSize: '16MB', maxFileCount: 200 } })
    .input(z.object({ photographerToken: z.string().uuid() }))
    .middleware(async ({ input }) => {
      await uploadLog({ slug: 'photographerUpload', phase: 'middleware_start', details: { token: input.photographerToken.slice(0, 8) + '...' } })
      try {
        const [event] = await db
          .select({ id: events.id })
          .from(events)
          .where(eq(events.photographerToken, input.photographerToken))
          .limit(1)

        if (!event) {
          await uploadLog({ slug: 'photographerUpload', phase: 'middleware_error', status: 'error', message: 'Token inválido — no se encontró evento', details: { token: input.photographerToken.slice(0, 8) + '...' } })
          throw new UploadThingError('Token de fotógrafo inválido.')
        }

        await uploadLog({ slug: 'photographerUpload', phase: 'middleware_ok', details: { eventId: event.id } })
        return { eventId: event.id }
      } catch (e) {
        if (!(e instanceof UploadThingError)) {
          await uploadLog({ slug: 'photographerUpload', phase: 'middleware_error', status: 'error', error: e })
        }
        throw e
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadLog({ slug: 'photographerUpload', phase: 'complete_start', details: { eventId: metadata.eventId, fileName: file.name, fileSize: file.size, fileType: file.type, fileUrl: file.url } })
      try {
        await db.insert(mediaUploads).values({
          eventId:  metadata.eventId,
          type:     'photo',
          url:      file.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })
        await uploadLog({ slug: 'photographerUpload', phase: 'complete_db_ok', details: { eventId: metadata.eventId, fileName: file.name } })
        await logNotification({ eventId: metadata.eventId, type: 'photo', message: `Fotógrafo subió ${file.name}` })
        await uploadLog({ slug: 'photographerUpload', phase: 'complete_ok', details: { fileName: file.name } })
      } catch (e) {
        await uploadLog({ slug: 'photographerUpload', phase: 'complete_error', status: 'error', error: e, details: { eventId: metadata.eventId, fileName: file.name } })
        throw e
      }
    }),

  // ─── Guest: photos & videos during the event ─────────────────────────────────
  guestUpload: f({
    image: { maxFileSize: '16MB', maxFileCount: 20 },
    video: { maxFileSize: '128MB', maxFileCount: 3 },
  })
    .input(z.object({ invitationToken: z.string().uuid() }))
    .middleware(async ({ input }) => {
      await uploadLog({ slug: 'guestUpload', phase: 'middleware_start', details: { token: input.invitationToken.slice(0, 8) + '...' } })
      try {
        const [inv] = await db
          .select({ id: invitations.id, eventId: invitations.eventId })
          .from(invitations)
          .where(eq(invitations.token, input.invitationToken))
          .limit(1)

        if (!inv) {
          await uploadLog({ slug: 'guestUpload', phase: 'middleware_error', status: 'error', message: 'Invitación no encontrada' })
          throw new UploadThingError('Invitación no encontrada.')
        }

        await uploadLog({ slug: 'guestUpload', phase: 'middleware_ok', details: { invitationId: inv.id, eventId: inv.eventId } })
        return { eventId: inv.eventId, invitationId: inv.id }
      } catch (e) {
        if (!(e instanceof UploadThingError)) {
          await uploadLog({ slug: 'guestUpload', phase: 'middleware_error', status: 'error', error: e })
        }
        throw e
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadLog({ slug: 'guestUpload', phase: 'complete_start', details: { eventId: metadata.eventId, invitationId: metadata.invitationId, fileName: file.name, fileType: file.type } })
      try {
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
        await uploadLog({ slug: 'guestUpload', phase: 'complete_db_ok', details: { fileName: file.name, isVideo } })
        const [inv] = await db.select({ familyName: invitations.familyName }).from(invitations).where(eq(invitations.id, metadata.invitationId)).limit(1)
        await logNotification({ eventId: metadata.eventId, invitationId: metadata.invitationId, type: isVideo ? 'video' : 'photo', message: `${inv?.familyName ?? 'Invitado'} compartió ${isVideo ? 'un video' : 'una foto'}` })
        await uploadLog({ slug: 'guestUpload', phase: 'complete_ok', details: { fileName: file.name } })
      } catch (e) {
        await uploadLog({ slug: 'guestUpload', phase: 'complete_error', status: 'error', error: e, details: { eventId: metadata.eventId, invitationId: metadata.invitationId, fileName: file.name } })
        throw e
      }
    }),

  // ─── Private video message for the couple ─────────────────────────────────────
  videoMessage: f({ video: { maxFileSize: '256MB', maxFileCount: 1 } })
    .input(z.object({ invitationToken: z.string().uuid() }))
    .middleware(async ({ input }) => {
      await uploadLog({ slug: 'videoMessage', phase: 'middleware_start', details: { token: input.invitationToken.slice(0, 8) + '...' } })
      try {
        const [inv] = await db
          .select({ id: invitations.id, eventId: invitations.eventId })
          .from(invitations)
          .where(eq(invitations.token, input.invitationToken))
          .limit(1)

        if (!inv) {
          await uploadLog({ slug: 'videoMessage', phase: 'middleware_error', status: 'error', message: 'Invitación no encontrada' })
          throw new UploadThingError('Invitación no encontrada.')
        }

        await uploadLog({ slug: 'videoMessage', phase: 'middleware_ok', details: { invitationId: inv.id, eventId: inv.eventId } })
        return { eventId: inv.eventId, invitationId: inv.id }
      } catch (e) {
        if (!(e instanceof UploadThingError)) {
          await uploadLog({ slug: 'videoMessage', phase: 'middleware_error', status: 'error', error: e })
        }
        throw e
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadLog({ slug: 'videoMessage', phase: 'complete_start', details: { eventId: metadata.eventId, invitationId: metadata.invitationId, fileName: file.name } })
      try {
        await db.insert(videoMessages).values({
          eventId:      metadata.eventId,
          invitationId: metadata.invitationId,
          url:          file.url,
        })
        await db.update(invitations).set({ videoMessageUploaded: true }).where(eq(invitations.id, metadata.invitationId))
        await uploadLog({ slug: 'videoMessage', phase: 'complete_db_ok' })
        await logNotification({ eventId: metadata.eventId, invitationId: metadata.invitationId, type: 'video', message: 'Un invitado dejó un video mensaje privado para los novios' })
        await uploadLog({ slug: 'videoMessage', phase: 'complete_ok', details: { fileName: file.name } })
      } catch (e) {
        await uploadLog({ slug: 'videoMessage', phase: 'complete_error', status: 'error', error: e, details: { eventId: metadata.eventId, invitationId: metadata.invitationId } })
        throw e
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
