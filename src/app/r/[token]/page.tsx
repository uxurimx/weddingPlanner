export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { Heart, Camera, Play } from 'lucide-react'
import { db } from '@/db'
import { invitations, events } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Props = { params: Promise<{ token: string }> }

export default async function PostEventPage({ params }: Props) {
  const { token } = await params

  const [inv] = await db
    .select({ id: invitations.id, familyName: invitations.familyName })
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!inv) notFound()

  const [event] = await db
    .select({ isPostEventActive: events.isPostEventActive })
    .from(events)
    .limit(1)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: 'var(--w-cream)', color: 'var(--w-text)' }}
    >
      <Heart
        className="w-10 h-10 mb-6 animate-float"
        style={{ color: 'var(--w-gold)' }}
      />
      <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--w-text-muted)' }}>
        {inv.familyName}
      </p>
      <h1 className="font-outfit font-bold text-3xl mb-3" style={{ color: 'var(--w-text)' }}>
        Gracias por acompañarnos
      </h1>
      <p className="text-sm max-w-xs leading-relaxed mb-10" style={{ color: 'var(--w-text-muted)' }}>
        Fue un honor celebrar este día tan especial con ustedes. Pronto podrán ver las fotos y videos de la boda aquí.
      </p>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div
          className="w-full p-5 rounded-2xl border space-y-2 opacity-60"
          style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'white' }}
        >
          <Camera className="w-7 h-7 mx-auto" style={{ color: 'var(--w-blue)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
            Subir fotos
          </p>
          <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
            Próximamente
          </p>
        </div>
        <div
          className="w-full p-5 rounded-2xl border space-y-2 opacity-60"
          style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'white' }}
        >
          <Play className="w-7 h-7 mx-auto" style={{ color: 'var(--w-blue)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
            Galería del evento
          </p>
          <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
            Próximamente
          </p>
        </div>
      </div>

      <p className="text-[10px] mt-12 uppercase tracking-[0.2em]" style={{ color: 'var(--w-text-light)' }}>
        J &amp; G · 06·06·2026
      </p>
    </div>
  )
}
