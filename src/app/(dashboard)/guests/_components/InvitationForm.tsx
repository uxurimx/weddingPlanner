'use client'

import { useState, useActionState } from 'react'
import { X } from 'lucide-react'
import { upsertInvitation, type ActionState, type InvitationRow, type TableWithOccupancy } from '@/db/actions/guests'
import SubmitButton from '@/components/SubmitButton'
import { useRouter } from 'next/navigation'

const input = 'w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors'
const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'

const STATUSES = [
  { value: 'created',   label: 'Creado',     color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  { value: 'sent',      label: 'Enviado',    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'viewed',    label: 'Visto',      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { value: 'cancelled', label: 'Cancelado',  color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { value: 'present',   label: 'Presente',   color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
] as const

export default function InvitationForm({
  invitation,
  tables,
  onCancel,
}: {
  invitation?: InvitationRow | null
  tables: TableWithOccupancy[]
  onCancel: () => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState(invitation?.status ?? 'created')

  const [state, action] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const res = await upsertInvitation(prev, fd)
      if (res?.success) { onCancel(); router.refresh() }
      return res
    },
    null,
  )

  return (
    <div
      className="p-5 rounded-2xl border-2 space-y-4"
      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--accent)', borderStyle: 'dashed' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
          {invitation ? 'Editar invitación' : 'Nueva invitación'}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface)]"
        >
          <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
        </button>
      </div>

      <form action={action} className="space-y-4">
        {invitation && <input type="hidden" name="id" value={invitation.id} />}
        {invitation && <input type="hidden" name="status" value={status} />}

        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Familia / Grupo *</label>
            <input
              name="familyName"
              defaultValue={invitation?.familyName ?? ''}
              placeholder="Familia García"
              required
              className={input}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Contacto principal *</label>
            <input
              name="contactName"
              defaultValue={invitation?.contactName ?? ''}
              placeholder="Carlos García"
              required
              className={input}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Teléfono (WhatsApp)</label>
            <input
              name="contactPhone"
              defaultValue={invitation?.contactPhone ?? ''}
              placeholder="+52 55 1234 5678"
              className={input}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Correo</label>
            <input
              name="contactEmail"
              type="email"
              defaultValue={invitation?.contactEmail ?? ''}
              placeholder="correo@ejemplo.com"
              className={input}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Passes + Table */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Pases</label>
            <select
              name="totalPasses"
              defaultValue={invitation?.totalPasses ?? 1}
              className={input}
              style={inputStyle}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} pase{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Mesa</label>
            <select
              name="tableId"
              defaultValue={invitation?.tableId ?? ''}
              className={input}
              style={inputStyle}
            >
              <option value="">Sin asignar</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Mesa ${t.number}`} ({t.occupancy}/{t.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status (edit only) */}
        {invitation && (
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    status === s.value ? s.color : 'opacity-40'
                  } ${s.color}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Notas internas</label>
          <input
            name="adminNotes"
            defaultValue={invitation?.adminNotes ?? ''}
            placeholder="Ej: Vegetariano, silla de ruedas, etc."
            className={input}
            style={inputStyle}
          />
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

        <SubmitButton>{invitation ? 'Actualizar' : 'Crear invitación'}</SubmitButton>
      </form>
    </div>
  )
}
