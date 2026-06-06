export const dynamic = 'force-dynamic'

import { ScrollText } from 'lucide-react'
import { getHistorial } from '@/db/actions/historial'
import HistorialView from './_components/HistorialView'
import type { HistorialFilter } from '@/db/actions/historial'

type Props = { searchParams: Promise<{ filter?: string; page?: string }> }

export default async function HistorialPage({ searchParams }: Props) {
  const { filter: f, page: p } = await searchParams
  const filter = (['all','confirmation','cancellation','checkin','photo','video'].includes(f ?? '')
    ? f : 'all') as HistorialFilter
  const page = Math.max(1, parseInt(p ?? '1', 10) || 1)

  const { items, total, pages } = await getHistorial(page, filter)

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
          Operación
        </p>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <ScrollText className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Historial</h1>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              {total} evento{total !== 1 ? 's' : ''} registrados
            </p>
          </div>
        </div>
      </div>

      <HistorialView
        initialItems={items}
        total={total}
        pages={pages}
        initialFilter={filter}
      />
    </div>
  )
}
