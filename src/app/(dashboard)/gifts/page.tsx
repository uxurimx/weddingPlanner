export const dynamic = 'force-dynamic'

import { Gift } from 'lucide-react'
import { getGifts } from '@/db/actions/gifts'
import GiftsManager from './_components/GiftsManager'

export default async function GiftsPage() {
  const { gifts } = await getGifts()

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--fg-muted)" }}>
            Evento
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: "var(--fg)" }}>Mesa de Regalos</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            Tiendas, cuentas bancarias y fondo para la luna de miel.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <Gift className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>{gifts.length} registros</span>
        </div>
      </div>

      <div className="mb-5 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-amber-600 font-medium">
          💡 Esta información aparece al final de la invitación.
          <span className="italic ml-1">"Tu presencia es nuestro mejor regalo, pero si deseas añadir algo más:"</span>
        </p>
      </div>

      <GiftsManager gifts={gifts} />
    </div>
  )
}
