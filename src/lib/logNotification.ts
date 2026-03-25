// Server-side utility (NOT a server action) — safe to import from API routes and UploadThing callbacks
import { db } from '@/db'
import { notificationsLog } from '@/db/schema'
import { pusherServer, ADMIN_CHANNEL, NOTIFICATION_EVENT } from '@/lib/pusher'

export type NotificationType = 'confirmation' | 'cancellation' | 'checkin' | 'photo' | 'video'

export async function logNotification(params: {
  eventId: string
  type: NotificationType
  message: string
  invitationId?: string
}): Promise<void> {
  try {
    const [row] = await db
      .insert(notificationsLog)
      .values({
        eventId:      params.eventId,
        invitationId: params.invitationId ?? null,
        type:         params.type,
        channel:      'pusher',
        message:      params.message,
        isRead:       false,
      })
      .returning({ id: notificationsLog.id })

    if (pusherServer && row) {
      await pusherServer.trigger(ADMIN_CHANNEL, NOTIFICATION_EVENT, {
        id:      row.id,
        type:    params.type,
        message: params.message,
        sentAt:  new Date().toISOString(),
      }).catch(console.error)
    }
  } catch (e) {
    console.error('[logNotification]', e)
  }
}
