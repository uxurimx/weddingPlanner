'use client'

import { CheckCircle2, Clock, AlertCircle, Users, MapPin } from 'lucide-react'
import type { CheckInResult } from '@/db/actions/checkin'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResultState =
  | { type: 'success';   data: CheckInResult }
  | { type: 'duplicate'; data: CheckInResult }
  | { type: 'error';     message: string }
  | null

// ─── ResultPanel ──────────────────────────────────────────────────────────────

export default function ResultPanel({
  result,
  onDismiss,
}: {
  result: ResultState
  onDismiss: () => void
}) {
  if (!result) return null

  const isSuccess   = result.type === 'success'
  const isDuplicate = result.type === 'duplicate'
  const isError     = result.type === 'error'

  // Colors per type
  const bgColor     = isSuccess   ? 'rgba(16,185,129,0.06)'  : isDuplicate ? 'rgba(234,179,8,0.06)'  : 'rgba(239,68,68,0.06)'
  const borderColor = isSuccess   ? 'rgba(16,185,129,0.25)'  : isDuplicate ? 'rgba(234,179,8,0.25)'  : 'rgba(239,68,68,0.25)'

  const hasData = result.type === 'success' || result.type === 'duplicate'
  const data    = hasData ? result.data : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div
        className="max-w-sm w-full rounded-3xl p-8 text-center space-y-5 shadow-2xl"
        style={{ backgroundColor: bgColor, border: `1.5px solid ${borderColor}`, backdropFilter: 'blur(24px)' }}
      >
        {/* Icon */}
        <div className="flex justify-center">
          {isSuccess   && <CheckCircle2 className="w-16 h-16 text-emerald-500" />}
          {isDuplicate && <Clock        className="w-16 h-16 text-yellow-500" />}
          {isError     && <AlertCircle  className="w-16 h-16 text-red-500" />}
        </div>

        {/* Title */}
        <div className="space-y-1">
          {isSuccess && (
            <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>¡Bienvenidos!</p>
          )}
          {isDuplicate && (
            <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>
              Ya registrado
            </p>
          )}
          {isError && (
            <p className="text-xl font-bold text-red-500">Error al registrar</p>
          )}
        </div>

        {/* Family name */}
        {data && (
          <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {data.familyName}
          </p>
        )}

        {isError && (
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {result.message}
          </p>
        )}

        {/* Mesa — very prominent */}
        {data?.tableNumber && (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-violet-400" />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                Mesa
              </span>
            </div>
            <p className="text-6xl font-bold text-violet-500 font-outfit leading-none">
              {data.tableNumber}
            </p>
            {data.tableName && (
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{data.tableName}</p>
            )}
          </div>
        )}

        {/* Pases */}
        {data && (
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
            <span className="text-base font-semibold" style={{ color: 'var(--fg-muted)' }}>
              {data.totalPasses} pase{data.totalPasses !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="w-full mt-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: isSuccess ? 'rgba(16,185,129,0.15)' : isDuplicate ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
            color: isSuccess ? 'rgb(16,185,129)' : isDuplicate ? 'rgb(202,138,4)' : 'rgb(239,68,68)',
            border: `1px solid ${borderColor}`,
          }}
        >
          Escanear siguiente
        </button>
      </div>
    </div>
  )
}
