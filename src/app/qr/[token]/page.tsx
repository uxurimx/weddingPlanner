export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CheckCircle2, AlertCircle, Clock, MapPin, Users } from 'lucide-react'
import { checkInByToken } from '@/db/actions/checkin'

type Props = { params: Promise<{ token: string }> }

export default async function QRCheckInPage({ params }: Props) {
  const { token } = await params
  const result = await checkInByToken(token)

  if (result.error || !result.data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-outfit font-bold text-xl" style={{ color: 'var(--fg)' }}>
            {result.error || 'Invitación no encontrada'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Verifica que el QR sea correcto e intenta de nuevo.
          </p>
          <Link
            href="/checkin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            ← Volver al check-in
          </Link>
        </div>
      </div>
    )
  }

  const { familyName, contactName, totalPasses, tableNumber, tableName, alreadyPresent } = result.data

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm space-y-5">

        {/* Status badge */}
        <div className="text-center">
          {alreadyPresent ? (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-sm font-semibold text-yellow-600">Ya registrado anteriormente</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-600">¡Entrada registrada!</p>
            </div>
          )}
        </div>

        {/* Guest card */}
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: alreadyPresent ? 'var(--border)' : 'rgba(34,197,94,0.3)' }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
              Invitado
            </p>
            <h2 className="font-outfit font-bold text-2xl" style={{ color: 'var(--fg)' }}>
              {familyName}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>{contactName}</p>
          </div>

          <div
            className="h-px"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-xl flex items-center gap-2"
              style={{ backgroundColor: 'var(--surface-2)' }}
            >
              <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
              <div>
                <p className="text-lg font-bold font-outfit" style={{ color: 'var(--fg)' }}>{totalPasses}</p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
                  pase{totalPasses > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {tableNumber && (
              <div
                className="p-3 rounded-xl flex items-center gap-2"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
                <div>
                  <p className="text-lg font-bold font-outfit" style={{ color: 'var(--fg)' }}>
                    {tableNumber}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
                    {tableName ?? 'Mesa'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/checkin"
            className="flex-1 text-center py-3 rounded-2xl text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-500"
          >
            Siguiente invitado
          </Link>
          <Link
            href={`/i/${token}`}
            className="px-4 py-3 rounded-2xl text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Ver inv.
          </Link>
        </div>
      </div>
    </div>
  )
}
