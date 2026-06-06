'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import {
  checkInByToken,
  type CheckInStats,
  type CheckInRow,
} from '@/db/actions/checkin'
import QRScanner from '../../_components/QRScanner'
import ResultPanel, { type ResultState } from '../../_components/ResultPanel'
import PusherClient from 'pusher-js'

// ─── Recent arrival row ───────────────────────────────────────────────────────

function ArrivalRow({ guest }: { guest: CheckInRow }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl border"
      style={{
        backgroundColor: 'rgba(139,92,246,0.05)',
        borderColor: 'rgba(139,92,246,0.15)',
      }}
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-violet-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
          {guest.familyName}
        </p>
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
          {guest.totalPasses} pase{guest.totalPasses !== 1 ? 's' : ''}
          {guest.tableNumber ? ` · Mesa ${guest.tableNumber}` : ''}
        </p>
      </div>
      {guest.checkedInAt && (
        <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'var(--fg-muted)' }}>
          {new Date(guest.checkedInAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}

// ─── LiveCheckIn ──────────────────────────────────────────────────────────────

export default function LiveCheckIn({
  initialStats,
  initialGuests,
}: {
  initialStats: CheckInStats
  initialGuests: CheckInRow[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [result, setResult] = useState<ResultState>(null)

  // Recent arrivals — top 10 present guests, most recent first
  const recentArrivals = initialGuests
    .filter(g => g.status === 'present')
    .sort((a, b) => {
      const ta = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0
      const tb = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0
      return tb - ta
    })
    .slice(0, 10)

  // ─── Pusher real-time ────────────────────────────────────────────────────
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

  // ─── Check-in handler ────────────────────────────────────────────────────
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

  return (
    <>
      {/* Full-screen result panel */}
      <ResultPanel result={result} onDismiss={() => setResult(null)} />

      <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-screen overflow-hidden">
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Link
            href="/checkin"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--fg-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
              Check-in en vivo
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
              {initialStats.presentPasses}
              <span style={{ color: 'var(--fg-muted)' }}> / {initialStats.totalPasses}</span>
              <span className="text-xs font-normal ml-1" style={{ color: 'var(--fg-muted)' }}>pases</span>
            </p>
          </div>

          {/* Progress dot cluster */}
          <div className="flex flex-col items-end gap-0.5">
            <div
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              title="En vivo"
            />
            <p className="text-[10px] font-semibold text-emerald-500">LIVE</p>
          </div>
        </div>

        {/* ── Scanner (60%) ── */}
        <div
          className="flex-shrink-0 px-4 pt-4 pb-3"
          style={{ flexBasis: '60%' }}
        >
          <QRScanner onToken={handleToken} />
        </div>

        {/* ── Feed de llegadas (40%) ── */}
        <div
          className="flex-1 flex flex-col min-h-0 border-t px-4 pt-3 pb-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-muted)' }}>
            Últimas llegadas
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {recentArrivals.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--fg-muted)' }}>
                Nadie ha llegado aún
              </p>
            ) : (
              recentArrivals.map(g => <ArrivalRow key={g.id} guest={g} />)
            )}
          </div>
        </div>
      </div>
    </>
  )
}
