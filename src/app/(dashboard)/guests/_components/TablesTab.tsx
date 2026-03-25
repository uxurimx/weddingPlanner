'use client'

import { useState, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Table2, Sparkles } from 'lucide-react'
import {
  upsertTable,
  deleteTable,
  seedDefaultTables,
  type ActionState,
  type TableWithOccupancy,
} from '@/db/actions/guests'
import SubmitButton from '@/components/SubmitButton'

const input = 'w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors'
const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1'

const CATEGORIES = [
  { value: 'vip',     label: 'VIP',       color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { value: 'familia', label: 'Familia',   color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { value: 'amigos',  label: 'Amigos',    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  { value: 'trabajo', label: 'Trabajo',   color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  { value: 'otro',    label: 'Otro',      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
] as const

type CatValue = typeof CATEGORIES[number]['value']

function catMeta(v: string | null) {
  return CATEGORIES.find(c => c.value === v) ?? CATEGORIES[2]
}

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

export default function TablesTab({ tables }: { tables: TableWithOccupancy[] }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [, startTransition] = useTransition()
  const [seedError, setSeedError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta mesa?')) return
    startTransition(async () => {
      const res = await deleteTable(id)
      if (res?.error) alert(res.error)
      else router.refresh()
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

  return (
    <div className="space-y-4">
      {/* Summary */}
      {tables.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Mesas', value: tables.length },
            { label: 'Capacidad total', value: totalCapacity },
            { label: 'Pases asignados', value: totalOccupied },
          ].map(s => (
            <div
              key={s.label}
              className="p-3 rounded-xl border text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-xl font-bold font-outfit" style={{ color: 'var(--fg)' }}>{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
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
      <div className="space-y-2">
        {tables.map(table => (
          <div key={table.id}>
            {editing === table.id ? (
              <TableForm table={table} onCancel={() => setEditing(null)} />
            ) : (
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-2xl border group transition-colors"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
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
                  </div>
                  {/* Occupancy bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (table.occupancy / table.capacity) * 100)}%`,
                          backgroundColor: table.occupancy >= table.capacity ? 'rgb(239,68,68)' : 'rgb(99,102,241)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium flex-shrink-0" style={{ color: 'var(--fg-muted)' }}>
                      {table.occupancy}/{table.capacity}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(table.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(table.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
