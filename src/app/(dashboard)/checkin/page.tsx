export const dynamic = 'force-dynamic'

import { ScanLine } from 'lucide-react'
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

      <CheckInDashboard initialStats={stats} initialGuests={guests} />
    </div>
  )
}
