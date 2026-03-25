export const dynamic = 'force-dynamic'

import { Clock } from 'lucide-react'
import { getItinerary } from '@/db/actions/itinerary'
import ItineraryManager from './_components/ItineraryManager'

export default async function ItineraryPage() {
  const { items } = await getItinerary()

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--fg-muted)" }}>
            Evento
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: "var(--fg)" }}>Itinerario</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            Fases del evento con horarios. Ordena con ↑↓ y oculta lo que no quieres mostrar.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>{items.length} fases</span>
        </div>
      </div>

      <ItineraryManager items={items} />
    </div>
  )
}
