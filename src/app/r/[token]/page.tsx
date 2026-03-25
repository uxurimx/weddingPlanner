export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { Heart, Camera } from 'lucide-react'
import { db } from '@/db'
import { invitations, events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getGuestUploads } from '@/db/actions/media'
import GuestUploader from './_components/GuestUploader'

type Props = { params: Promise<{ token: string }> }

export default async function PostEventPage({ params }: Props) {
  const { token } = await params

  const [inv] = await db
    .select({
      id:         invitations.id,
      familyName: invitations.familyName,
      eventId:    invitations.eventId,
    })
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!inv) notFound()

  const [event] = await db
    .select({ isPostEventActive: events.isPostEventActive, name: events.name })
    .from(events)
    .where(eq(events.id, inv.eventId))
    .limit(1)

  const uploads = await getGuestUploads(token)

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--w-cream)', color: 'var(--w-text)' }}
    >
      <div className="max-w-sm mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Heart
            className="w-8 h-8 mx-auto animate-float"
            style={{ color: 'var(--w-gold)' }}
          />
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--w-text-muted)' }}>
            {inv.familyName}
          </p>
          <h1 className="font-outfit font-bold text-2xl" style={{ color: 'var(--w-text)' }}>
            Gracias por acompañarnos
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
            Fue un honor celebrar este día tan especial con ustedes.
            Compartan sus fotos y videos — cada recuerdo cuenta.
          </p>
        </div>

        {/* Upload section */}
        {event?.isPostEventActive ? (
          <div
            className="rounded-2xl border p-4 space-y-4"
            style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'white' }}
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" style={{ color: 'var(--w-blue)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
                Compartir fotos y videos
              </p>
            </div>
            <GuestUploader invitationToken={token} />
          </div>
        ) : (
          <div
            className="rounded-2xl border p-5 text-center opacity-60"
            style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'white' }}
          >
            <Camera className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--w-blue)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
              Galería próximamente
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>
              Pronto podrán ver y subir fotos del evento aquí.
            </p>
          </div>
        )}

        {/* Already uploaded by this guest */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--w-text-muted)' }}>
              Tus archivos compartidos ({uploads.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {uploads.map(u => (
                <div
                  key={u.id}
                  className="aspect-square rounded-xl overflow-hidden border"
                  style={{ borderColor: 'var(--w-cream-border)' }}
                >
                  {u.type === 'photo' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.url} alt={u.fileName ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: 'var(--w-cream)', color: 'var(--w-text-muted)' }}
                    >
                      Video
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-center uppercase tracking-[0.2em]" style={{ color: 'var(--w-text-light)' }}>
          J &amp; G · 06·06·2026
        </p>
      </div>
    </div>
  )
}
