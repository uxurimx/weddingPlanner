'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShieldCheck, AlertCircle, Check } from 'lucide-react'
import { updateUserRole, removeUser, type UserRow } from '@/db/actions/users'
import { ROLES, ROLE_LABELS, ROLE_COLORS, type UserRole } from '@/lib/rbac'

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string
  currentRole: UserRole
  disabled: boolean
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [role, setRole] = useState<UserRole>(currentRole)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (newRole: UserRole) => {
    setRole(newRole)
    setSaving(true)
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      setSaving(false)
      if (res?.error) {
        setError(res.error)
        setRole(currentRole)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={e => handleChange(e.target.value as UserRole)}
        disabled={disabled || saving}
        className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
      >
        {ROLES.map(r => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>
      {saving && (
        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      )}
      {saved && <Check className="w-3.5 h-3.5 text-emerald-500" />}
      {error && (
        <span className="text-[10px] text-red-500">{error}</span>
      )}
    </div>
  )
}

function UserCard({
  user,
  isSelf,
  isSuperAdmin,
}: {
  user: UserRow
  isSelf: boolean
  isSuperAdmin: boolean
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = user.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleRemove = () => {
    if (!confirm(`¿Eliminar acceso de ${user.name}? Su cuenta de Clerk no se elimina, solo pierde acceso al panel.`)) return
    setRemoving(true)
    startTransition(async () => {
      const res = await removeUser(user.id)
      setRemoving(false)
      if (res?.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl border"
      style={{
        backgroundColor: isSelf ? 'rgba(99,102,241,0.04)' : 'var(--surface)',
        borderColor: isSelf ? 'rgba(99,102,241,0.2)' : 'var(--border)',
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--fg-muted)' }}
      >
        {initials || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
            {user.name}
          </p>
          {isSelf && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold">
              Tú
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
          {user.email}
        </p>
        {error && (
          <p className="text-[10px] text-red-500 mt-0.5">{error}</p>
        )}
      </div>

      {/* Role */}
      <div className="flex-shrink-0">
        {isSuperAdmin && !isSelf ? (
          <RoleSelect userId={user.id} currentRole={user.role} disabled={false} />
        ) : (
          <RoleBadge role={user.role} />
        )}
      </div>

      {/* Remove */}
      {isSuperAdmin && !isSelf && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="flex-shrink-0 p-2 rounded-xl border transition-colors hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-40"
          style={{ borderColor: 'var(--border)' }}
          title="Eliminar acceso"
        >
          {removing
            ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-3.5 h-3.5 text-red-500" />
          }
        </button>
      )}
    </div>
  )
}

export default function UsersManager({
  users,
  currentUserId,
  currentUserRole,
}: {
  users: UserRow[]
  currentUserId: string
  currentUserRole: UserRole
}) {
  const isSuperAdmin = currentUserRole === 'super_admin'

  return (
    <div className="space-y-4">
      {/* Access info for non-super-admin */}
      {!isSuperAdmin && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ backgroundColor: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.2)' }}
        >
          <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Solo el <strong style={{ color: 'var(--fg)' }}>Super Admin</strong> puede cambiar roles o eliminar usuarios.
          </p>
        </div>
      )}

      {/* User list */}
      <div className="space-y-2">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
            isSuperAdmin={isSuperAdmin}
          />
        ))}
      </div>

      {/* How new users join */}
      <div
        className="p-4 rounded-2xl border space-y-2"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
            Agregar un nuevo usuario
          </p>
        </div>
        <ol className="space-y-1 pl-1">
          {[
            'El nuevo usuario accede a /sign-up y crea su cuenta.',
            'Al entrar al panel por primera vez, queda registrado con rol Admin.',
            'El Super Admin cambia su rol desde esta página.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
              <span className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
