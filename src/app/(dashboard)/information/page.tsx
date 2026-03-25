export const dynamic = 'force-dynamic'

import { BookOpen, Sparkles } from 'lucide-react'
import { getEventData, seedWeddingData } from '@/db/actions/information'
import InfoTabs from './_components/InfoTabs'

// Wrapper void para usar seedWeddingData como form action
async function handleSeed(_fd: FormData) {
  'use server'
  await seedWeddingData()
}

export default async function InformationPage() {
  const data = await getEventData()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--fg-muted)" }}>
            Evento
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: "var(--fg)" }}>
            Información
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            Todos los datos del evento y la pareja. Los cambios se reflejan en la invitación.
          </p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
            {data ? 'Datos cargados' : 'Sin datos'}
          </span>
        </div>
      </div>

      {!data ? (
        /* No event in DB — show seed option */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Sparkles className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="font-outfit font-bold text-xl mb-2" style={{ color: "var(--fg)" }}>
            Sin datos del evento
          </h2>
          <p className="text-sm max-w-md mb-8" style={{ color: "var(--fg-muted)" }}>
            Carga los datos pre-configurados de la invitación de Jahir & Gilliane, o agrega los datos manualmente desde los formularios.
          </p>
          <form action={handleSeed}>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Cargar datos de la invitación
            </button>
          </form>
        </div>
      ) : (
        <InfoTabs data={data} />
      )}
    </div>
  )
}
