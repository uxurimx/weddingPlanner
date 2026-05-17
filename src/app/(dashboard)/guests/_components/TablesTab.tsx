'use client'

import { useState, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Pencil, Trash2, X, Table2, Sparkles,
  ChevronDown, ChevronUp, Users, Phone, Mail, LogOut, UserRound, Baby,
} from 'lucide-react'
import {
  upsertTable,
  deleteTable,
  deleteInvitation,
  unassignInvitationFromTable,
  seedDefaultTables,
  type ActionState,
  type TableWithOccupancy,
  type InvitationRow,
  type GuestMember,
} from '@/db/actions/guests'
import SubmitButton from '@/components/SubmitButton'
import InvitationForm from './InvitationForm'

const input = 'w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors'
const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1'

const CATEGORIES = [
  { value: 'vip',     label: 'VIP',     color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { value: 'familia', label: 'Familia', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { value: 'amigos',  label: 'Amigos',  color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  { value: 'trabajo', label: 'Trabajo', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  { value: 'otro',    label: 'Otro',    color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
] as const

function catMeta(v: string | null) {
  return CATEGORIES.find(c => c.value === v) ?? CATEGORIES[2]
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  created:   { label: 'Creado',     color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  sent:      { label: 'Enviado',    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  viewed:    { label: 'Visto',      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  present:   { label: 'Presente',   color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
}

// ─── TableForm ────────────────────────────────────────────────────────────────

function TableForm({ table, onCancel }: { table?: TableWithOccupancy | null; onCancel: () => void }) {
  const router = useRouter()
  const [state, action] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const res = await upsertTable(prev, fd)
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
          {table ? 'Editar mesa' : 'Nueva mesa'}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface)]"
        >
          <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
        </button>
      </div>

      <form action={action} className="space-y-3">
        {table && <input type="hidden" name="id" value={table.id} />}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Número</label>
            <input
              name="number"
              type="number"
              min={1}
              max={99}
              defaultValue={table?.number ?? ''}
              required
              className={input}
              style={inputStyle}
            />
          </div>
          <div className="col-span-2">
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Nombre</label>
            <input
              name="name"
              defaultValue={table?.name ?? ''}
              placeholder={`Mesa ${table?.number ?? ''}`}
              className={input}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Capacidad</label>
            <input
              name="capacity"
              type="number"
              min={1}
              max={50}
              defaultValue={table?.capacity ?? 10}
              required
              className={input}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Categoría</label>
            <select
              name="category"
              defaultValue={table?.category ?? 'amigos'}
              className={input}
              style={inputStyle}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={lbl} style={{ color: 'var(--fg-muted)' }}>Notas</label>
          <input
            name="notes"
            defaultValue={table?.notes ?? ''}
            placeholder="Ej: Cerca del escenario"
            className={input}
            style={inputStyle}
          />
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        <SubmitButton>{table ? 'Actualizar' : 'Agregar'}</SubmitButton>
      </form>
    </div>
  )
}

// ─── GuestRow ─────────────────────────────────────────────────────────────────

function GuestRow({
  invitation,
  tables,
}: {
  invitation: InvitationRow
  tables: TableWithOccupancy[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [, startTransition] = useTransition()

  const sm = STATUS_META[invitation.status] ?? STATUS_META.created

  function handleDelete() {
    if (!confirm(`¿Eliminar la invitación de "${invitation.familyName}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const res = await deleteInvitation(invitation.id)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  function handleUnassign() {
    if (!confirm(`¿Quitar a "${invitation.familyName}" de esta mesa?`)) return
    startTransition(async () => {
      const res = await unassignInvitationFromTable(invitation.id)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  if (editing) {
    return (
      <InvitationForm
        invitation={invitation}
        tables={tables}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl border group transition-colors"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      {/* Número de invitación */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-outfit mt-0.5"
        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--fg-muted)' }}
      >
        #{invitation.invitationNumber ?? '—'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
            {invitation.familyName}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.color}`}>
            {sm.label}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            {invitation.totalPasses} pase{invitation.totalPasses !== 1 ? 's' : ''}
          </span>
        </div>

        {invitation.contactName !== invitation.familyName && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
            {invitation.contactName}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {invitation.contactPhone && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
              <Phone className="w-3 h-3" />
              {invitation.contactPhone}
            </span>
          )}
          {invitation.contactEmail && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
              <Mail className="w-3 h-3" />
              {invitation.contactEmail}
            </span>
          )}
        </div>

        {(invitation.adminNotes || invitation.dietaryNotes) && (
          <p className="text-xs mt-1 italic" style={{ color: 'var(--fg-muted)' }}>
            {[invitation.adminNotes, invitation.dietaryNotes].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Family members */}
        {invitation.members.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {invitation.members.map(m => (
              <span
                key={m.id}
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                {m.ageGroup === 'baby'
                  ? <Baby className="w-2.5 h-2.5" />
                  : <UserRound className="w-2.5 h-2.5" />}
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Editar invitación"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors"
        >
          <Pencil className="w-3 h-3 text-indigo-500" />
        </button>
        <button
          type="button"
          onClick={handleUnassign}
          title="Quitar de esta mesa"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-500/10 transition-colors"
        >
          <LogOut className="w-3 h-3 text-amber-500" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          title="Eliminar invitación"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </button>
      </div>
    </div>
  )
}

// ─── GuestPanel ───────────────────────────────────────────────────────────────

function GuestPanel({
  table,
  guests,
  tables,
}: {
  table: TableWithOccupancy
  guests: InvitationRow[]
  tables: TableWithOccupancy[]
}) {
  return (
    <div
      className="mx-2 mb-1 p-3 rounded-b-2xl border border-t-0 space-y-2"
      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--accent)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
        <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
          {guests.length === 0
            ? 'Sin invitados asignados'
            : `${guests.length} invitación${guests.length !== 1 ? 'es' : ''} · ${table.occupancy} pase${table.occupancy !== 1 ? 's' : ''}`}
        </p>
      </div>

      {guests.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: 'var(--fg-muted)' }}>
          No hay invitados asignados a esta mesa aún.
        </p>
      ) : (
        <div className="space-y-1.5">
          {guests.map(inv => (
            <GuestRow key={inv.id} invitation={inv} tables={tables} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TablesTab({
  tables,
  invitations,
}: {
  tables: TableWithOccupancy[]
  invitations: InvitationRow[]
}) {
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [seedError, setSeedError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta mesa?')) return
    startTransition(async () => {
      const res = await deleteTable(id)
      if (res?.error) alert(res.error)
      else {
        if (selectedTableId === id) setSelectedTableId(null)
        router.refresh()
      }
    })
  }

  function handleSeed() {
    setSeedError(null)
    startTransition(async () => {
      const res = await seedDefaultTables()
      if (res?.error) setSeedError(res.error)
      else router.refresh()
    })
  }

  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0)
  const totalOccupied = tables.reduce((s, t) => s + t.occupancy, 0)

  const guestsByTable = invitations.reduce<Record<string, InvitationRow[]>>((acc, inv) => {
    if (inv.tableId) {
      ;(acc[inv.tableId] ??= []).push(inv)
    }
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Summary */}
      {tables.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Mesas',           value: tables.length },
            { label: 'Capacidad total', value: totalCapacity },
            { label: 'Pases asignados', value: totalOccupied },
          ].map(s => (
            <div
              key={s.label}
              className="p-3 rounded-xl border text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-xl font-bold font-outfit" style={{ color: 'var(--fg)' }}>{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add button / form */}
      {editing === 'new' ? (
        <TableForm onCancel={() => setEditing(null)} />
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing('new')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            <Plus className="w-4 h-4" /> Agregar mesa
          </button>
          {tables.length === 0 && (
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors hover:border-indigo-500/50 hover:text-indigo-500 whitespace-nowrap"
              style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
            >
              <Sparkles className="w-4 h-4" /> Crear 15 mesas
            </button>
          )}
        </div>
      )}

      {seedError && <p className="text-xs text-red-500">{seedError}</p>}

      {/* Empty state */}
      {tables.length === 0 && editing !== 'new' && (
        <div className="text-center py-12" style={{ color: 'var(--fg-muted)' }}>
          <Table2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay mesas configuradas.</p>
          <p className="text-xs mt-1">Crea las mesas individualmente o genera las 15 mesas por defecto.</p>
        </div>
      )}

      {/* Tables list */}
      <div className="space-y-1">
        {tables.map(table => {
          const isOpen = selectedTableId === table.id
          const tableGuests = guestsByTable[table.id] ?? []

          if (editing === table.id) {
            return <TableForm key={table.id} table={table} onCancel={() => setEditing(null)} />
          }

          return (
            <div key={table.id}>
              {/* Table row */}
              <button
                type="button"
                onClick={() => setSelectedTableId(isOpen ? null : table.id)}
                className="w-full group flex items-center gap-4 px-4 py-3 text-left transition-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: isOpen ? '1rem 1rem 0 0' : '1rem',
                }}
              >
                {/* Number */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-outfit"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--fg)' }}
                >
                  {table.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                      {table.name ?? `Mesa ${table.number}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catMeta(table.category).color}`}>
                      {catMeta(table.category).label}
                    </span>
                    {tableGuests.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--fg-muted)' }}>
                        <Users className="w-3 h-3" />
                        {tableGuests.length} inv.
                      </span>
                    )}
                  </div>
                  {/* Occupancy bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (table.occupancy / table.capacity) * 100)}%`,
                          backgroundColor: table.occupancy >= table.capacity ? 'rgb(239,68,68)' : 'rgb(99,102,241)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium flex-shrink-0" style={{ color: 'var(--fg-muted)' }}>
                      {table.occupancy}/{table.capacity} pases
                    </span>
                  </div>
                </div>

                {/* Action buttons + chevron */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setEditing(table.id) }}
                    title="Editar mesa"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleDelete(table.id) }}
                    title="Eliminar mesa"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 ml-1" style={{ color: 'var(--accent)' }} />
                    : <ChevronDown className="w-4 h-4 ml-1" style={{ color: 'var(--fg-muted)' }} />
                  }
                </div>
              </button>

              {/* Expanded guest panel */}
              {isOpen && (
                <GuestPanel table={table} guests={tableGuests} tables={tables} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
