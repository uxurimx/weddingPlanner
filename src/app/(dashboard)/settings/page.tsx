export const dynamic = 'force-dynamic'

import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import ThemeToggle from '@/components/ThemeToggle'
import { getEventFlags } from '@/db/actions/information'
import EventFlagsPanel from './_components/EventFlagsPanel'
import { requireRole } from '@/lib/requireRole'

export default async function SettingsPage() {
  await requireRole('super_admin', 'admin')
  const [user, flags] = await Promise.all([currentUser(), getEventFlags()])

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
          Admin
        </p>
        <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>
          Configuración
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Ajustes del sistema y controles operativos del evento.
        </p>
      </div>

      {/* Event flags */}
      {flags && <EventFlagsPanel initialFlags={flags} />}

      {/* Account */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-muted)' }}>
          Cuenta
        </h2>
        <div
          className="p-5 rounded-2xl border flex items-center gap-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: 'w-12 h-12 rounded-xl' } }}
          />
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-muted)' }}>
          Apariencia
        </h2>
        <div
          className="p-5 rounded-2xl border flex items-center justify-between"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Tema</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Alternar entre modo claro y oscuro.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>
    </div>
  )
}
