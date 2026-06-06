'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Ban, ScanLine, Camera, Video, Circle } from 'lucide-react'
import type { HistorialItem, HistorialFilter } from '@/db/actions/historial'

const FILTER_LABELS: { value: HistorialFilter; label: string }[] = [
  { value: 'all',          label: 'Todos'          },
  { value: 'confirmation', label: 'Confirmaciones' },
  { value: 'cancellation', label: 'Cancelaciones'  },
  { value: 'checkin',      label: 'Check-ins'      },
  { value: 'photo',        label: 'Fotos'          },
  { value: 'video',        label: 'Videos'         },
]

function typeIcon(type: string) {
  switch (type) {
    case 'confirmation': return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
    case 'cancellation': return <Ban className="w-4 h-4 text-red-500 flex-shrink-0" />
    case 'checkin':      return <ScanLine className="w-4 h-4 text-violet-500 flex-shrink-0" />
    case 'photo':        return <Camera className="w-4 h-4 text-indigo-500 flex-shrink-0" />
    case 'video':        return <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
    default:             return <Circle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
  }
}

function fmtDateTime(d: Date) {
  const date = new Date(d)
  return `${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} · ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
}

type Props = {
  initialItems: HistorialItem[]
  total: number
  pages: number
  initialFilter: HistorialFilter
}

function HistorialViewInner({ initialItems, total, pages, initialFilter }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentFilter = (searchParams.get('filter') ?? initialFilter) as HistorialFilter
  const currentPage   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)

  function navigate(filter: HistorialFilter, page: number) {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('filter', filter)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    router.push(`/historial${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_LABELS.map(f => {
          const isActive = currentFilter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => navigate(f.value, 1)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'hover:border-indigo-500/50 hover:text-indigo-500',
              ].join(' ')}
              style={isActive ? {} : { borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* List */}
      {initialItems.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Sin eventos registrados</p>
          {currentFilter !== 'all' && (
            <button
              type="button"
              onClick={() => navigate('all', 1)}
              className="mt-2 text-xs text-indigo-500 hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden divide-y"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          {initialItems.map(item => (
            <div
              key={item.id}
              className="flex items-start gap-3 px-4 py-3"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              {/* Icon */}
              <div className="mt-0.5">
                {typeIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                {item.familyName && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                    {item.familyName}
                  </p>
                )}
                {item.message && (
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    {item.message}
                  </p>
                )}
                <p className="text-[10px] font-mono" style={{ color: 'var(--fg-muted)' }}>
                  {fmtDateTime(item.sentAt)}
                </p>
              </div>

              {/* Unread dot */}
              {!item.isRead && (
                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="No leído" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate(currentFilter, currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors disabled:opacity-40 hover:border-indigo-500/50 hover:text-indigo-500 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--fg-muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            ← Anterior
          </button>

          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            Página {currentPage} de {pages}
          </span>

          <button
            type="button"
            onClick={() => navigate(currentFilter, currentPage + 1)}
            disabled={currentPage >= pages}
            className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors disabled:opacity-40 hover:border-indigo-500/50 hover:text-indigo-500 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--fg-muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default function HistorialView(props: Props) {
  return (
    <Suspense fallback={
      <div className="py-10 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
        Cargando historial…
      </div>
    }>
      <HistorialViewInner {...props} />
    </Suspense>
  )
}
