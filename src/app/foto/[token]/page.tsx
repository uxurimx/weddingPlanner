export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { Camera } from 'lucide-react'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import PhotographerUploader from './_components/PhotographerUploader'

type Props = { params: Promise<{ token: string }> }

export default async function PhotographerPage({ params }: Props) {
  const { token } = await params

  const [event] = await db
    .select({ id: events.id, name: events.name, photographerToken: events.photographerToken })
    .from(events)
    .where(eq(events.photographerToken, token))
    .limit(1)

  if (!event) notFound()

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0f0f0f', color: '#e5e5e5' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Camera className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Fotógrafo</p>
          <p className="text-sm font-semibold text-white">{event.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pt-8">
        <div className="mb-8 text-center">
          <h1 className="font-outfit font-bold text-2xl text-white mb-2">
            Subir fotos del evento
          </h1>
          <p className="text-sm text-neutral-400">
            Selecciona o arrastra las fotos. Soporta hasta 200 archivos por lote, 16 MB por imagen.
          </p>
        </div>

        <PhotographerUploader photographerToken={token} />
      </div>
    </div>
  )
}
