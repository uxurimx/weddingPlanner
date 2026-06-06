'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, CheckCircle2 } from 'lucide-react'
import {
  checkInByToken,
  type CheckInStats,
  type CheckInRow,
} from '@/db/actions/checkin'
import QRScanner from './QRScanner'
import ResultPanel, { type ResultState } from './ResultPanel'
import PusherClient from 'pusher-js'

// ─── Status labels ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created:   { label: 'Creado',     color: 'text-gray-500 bg-gray-500/10' },
  sent:      { label: 'Enviado',    color: 'text-blue-500 bg-blue-500/10' },
  viewed:    { label: 'Visto',      color: 'text-yellow-500 bg-yellow-500/10' },
  confirmed: { label: 'Confirmado', color: 'text-emerald-500 bg-emerald-500/10' },
  cancelled: { label: 'Cancelado',  color: 'text-red-500 bg-red-500/10' },
  present:   { label: 'Presente',   color: 'text-violet-500 bg-violet-500/10' },
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: CheckInStats }) {
  const pct = stats.totalPasses > 0
    ? Math.round((stats.presentPasses / stats.totalPasses) * 100)
    : 0

  return (
    <div
      className="p-4 rounded-2xl border space-y-3"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
          Presentes
        </p>
        <p className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
          {pct}%
        </p>
      </div>
      {/* Big number */}
      <div className="flex items-baseline gap-2">
        <span className="font-outfit text-4xl font-bold" style={{ color: 'var(--fg)' }}>
          {stats.presentPasses}
        </span>
        <span className="text-lg" style={{ color: 'var(--fg-muted)' }}>
          / {stats.totalPasses}
        </span>
        <span className="text-xs ml-1" style={{ color: 'var(--fg-muted)' }}>pases</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {[
          { label: 'Invitaciones', value: stats.presentCount, color: 'text-violet-500' },
          { label: 'Confirmados',  value: stats.confirmed,    color: 'text-emerald-500' },
          { label: 'Pendientes',   value: stats.pending,      color: 'text-yellow-500' },
          { label: 'Cancelados',   value: stats.cancelled,    color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={`text-lg font-bold font-outfit ${s.color}`}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Guest Row ────────────────────────────────────────────────────────────────

function GuestRow({
  guest,
  onCheckIn,
}: {
  guest: CheckInRow
  onCheckIn: (token: string) => void
}) {
  const sm = STATUS_LABELS[guest.status]
  const isPresent = guest.status === 'present'

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
      style={{
        backgroundColor: isPresent ? 'rgba(139,92,246,0.05)' : 'var(--surface)',
        borderColor: isPresent ? 'rgba(139,92,246,0.2)' : 'var(--border)',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
            {guest.familyName}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${sm.color}`}>
            {sm.label}
          </span>
        </div>
        <div className="flex gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            {guest.totalPasses} pase{guest.totalPasses > 1 ? 's' : ''}
          </span>
          {guest.tableNumber && (
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              · Mesa {guest.tableNumber}
            </span>
          )}
          {isPresent && guest.checkedInAt && (
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              · {new Date(guest.checkedInAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
      {!isPresent && (
        <button
          onClick={() => onCheckIn(guest.token)}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          ✓ Registrar
        </button>
      )}
      {isPresent && (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-violet-500" />
      )}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function CheckInDashboard({
  initialStats,
  initialGuests,
}: {
  initialStats: CheckInStats
  initialGuests: CheckInRow[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [result, setResult] = useState<ResultState>(null)
  const [tab, setTab] = useState<'scanner' | 'list'>('scanner')

  // ─── Pusher real-time ──────────────────────────────────────────────────────
  useEffect(() => {
    const key     = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!key || !cluster) return

    const pusher  = new PusherClient(key, { cluster })
    const channel = pusher.subscribe('wedding-checkin')

    channel.bind('guest-arrived', () => {
      router.refresh()
    })

    return () => pusher.disconnect()
  }, [router])

  // ─── Check-in handler ─────────────────────────────────────────────────────
  const handleToken = useCallback((token: string) => {
    startTransition(async () => {
      const res = await checkInByToken(token)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else if (res.data) {
        setResult({
          type: res.data.alreadyPresent ? 'duplicate' : 'success',
          data: res.data,
        })
        if (!res.data.alreadyPresent) {
          router.refresh()
        }
      }
    })
  }, [router])

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = search.length >= 1
    ? initialGuests.filter(g =>
        g.familyName.toLowerCase().includes(search.toLowerCase()) ||
        g.contactName.toLowerCase().includes(search.toLowerCase()) ||
        String(g.invitationNumber ?? '').includes(search)
      )
    : initialGuests.filter(g => g.status === 'present')
           .sort((a, b) => {
             const ta = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0
             const tb = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0
             return tb - ta
           })
           .slice(0, 30)

  const listLabel = search
    ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
    : 'Últimos ingresos'

  return (
    <>
      {/* Full-screen result panel — manual dismiss only */}
      <ResultPanel result={result} onDismiss={() => setResult(null)} />

      <div className="space-y-5">
        {/* Stats */}
        <StatsBar stats={initialStats} />

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {[
            { id: 'scanner', label: '📷 Escáner' },
            { id: 'list',    label: '🔍 Buscar' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                tab === t.id
                  ? { backgroundColor: 'var(--bg)', color: 'var(--fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--fg-muted)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scanner tab */}
        {tab === 'scanner' && (
          <div className="space-y-4">
            <QRScanner onToken={handleToken} />
            <div
              className="p-3 rounded-xl border text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                El escáner lee el QR de la invitación del celular del invitado.
                También puedes escanear con la cámara de tu celular —
                la URL abre la página de confirmación automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* List/Search tab */}
        {tab === 'list' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por familia, contacto o #..."
                autoFocus
                className="w-full pl-10 pr-9 py-3 rounded-2xl border text-sm focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
                </button>
              )}
            </div>

            {/* List header */}
            <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--fg-muted)' }}>
              {listLabel}
            </p>

            {/* Guest rows */}
            <div className="space-y-1.5">
              {filtered.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--fg-muted)' }}>
                  {search ? 'Sin resultados' : 'Nadie ha llegado aún'}
                </p>
              )}
              {filtered.map(g => (
                <GuestRow key={g.id} guest={g} onCheckIn={handleToken} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
