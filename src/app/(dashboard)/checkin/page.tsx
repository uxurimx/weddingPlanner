export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ScanLine, Zap } from 'lucide-react'
import { getCheckInStats, getCheckInList } from '@/db/actions/checkin'
import CheckInDashboard from './_components/CheckInDashboard'

export default async function CheckInPage() {
  const [stats, guests] = await Promise.all([
    getCheckInStats(),
    getCheckInList(),
  ])

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            Operación
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Check-in</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Escáner QR y registro de entrada en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ScanLine className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
              {stats.presentCount} / {stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Live mode CTA */}
      <Link
        href="/checkin/live"
        className="flex items-center justify-between w-full mb-5 px-4 py-3 rounded-2xl border transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 group"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Modo evento en vivo</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Vista optimizada para tablet en el salón</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-500 group-hover:translate-x-0.5 transition-transform">→</span>
      </Link>

      <CheckInDashboard initialStats={stats} initialGuests={guests} />
    </div>
  )
}
