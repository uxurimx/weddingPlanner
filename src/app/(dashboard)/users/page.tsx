export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { ShieldCheck } from 'lucide-react'
import { getUsers, getCurrentUserRole } from '@/db/actions/users'
import UsersManager from './_components/UsersManager'

export default async function UsersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [userRole, userList] = await Promise.all([
    getCurrentUserRole(),
    getUsers(),
  ])

  // Only super_admin can access this page
  if (userRole !== 'super_admin') redirect('/overview')

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            Admin
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Usuarios</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Gestión de acceso al panel. Roles y permisos del equipo.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
            {userList.length} usuario{userList.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <UsersManager
        users={userList}
        currentUserId={userId}
        currentUserRole={userRole}
      />
    </div>
  )
}
