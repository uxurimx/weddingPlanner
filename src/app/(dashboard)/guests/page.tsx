export const dynamic = 'force-dynamic'

import { Users } from 'lucide-react'
import { getInvitationsData } from '@/db/actions/guests'
import GuestsManager from './_components/GuestsManager'

export default async function GuestsPage() {
  const { invitations, tables } = await getInvitationsData()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            Invitados
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Mesa de Invitados</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Crea invitaciones, asigna mesas y rastrea cada confirmación.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
            {invitations.reduce((s, i) => s + i.totalPasses, 0)} pases
          </span>
        </div>
      </div>

      <GuestsManager invitations={invitations} tables={tables} />
    </div>
  )
}
