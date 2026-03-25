'use client'

import { useState, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import {
  upsertItineraryItem,
  deleteItineraryItem,
  moveItineraryItem,
  toggleItineraryItemVisibility,
  type ActionState,
} from '@/db/actions/itinerary'
import SubmitButton from '@/components/SubmitButton'

type Item = {
  id: string; order: number; time: string; title: string
  description: string | null; icon: string | null; isVisible: boolean; eventId: string
}

const ICONS = ['🕍', '⛪', '📸', '🥂', '🍽️', '💃', '🎂', '🎉', '🚗', '🌹', '🎵', '🌙', '✈️', '🎊', '💑', '📸']

const input = "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors"
const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }
const lbl = "block text-xs font-semibold uppercase tracking-wide mb-1"

function ItemForm({ item, onCancel }: { item?: Item | null; onCancel: () => void }) {
  const router = useRouter()

  const [state, action] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const res = await upsertItineraryItem(prev, fd)
      if (res?.success) { onCancel(); router.refresh() }
      return res
    },
    null,
  )

  return (
    <div className="p-5 rounded-2xl border-2 space-y-4"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--accent)", borderStyle: "dashed" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
        {item ? 'Editar fase' : 'Nueva fase'}
      </p>

      <form action={action} className="space-y-3">
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={{ color: "var(--fg-muted)" }}>Hora *</label>
            <input name="time" defaultValue={item?.time ?? ''} placeholder="2:30 PM" required
              className={input} style={inputStyle} />
          </div>
          <div>
            <label className={lbl} style={{ color: "var(--fg-muted)" }}>Ícono (emoji)</label>
            <input name="icon" defaultValue={item?.icon ?? ''} placeholder="🎉"
              className={input} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className={lbl} style={{ color: "var(--fg-muted)" }}>Título *</label>
          <input name="title" defaultValue={item?.title ?? ''} placeholder="Ej: Primer baile" required
            className={input} style={inputStyle} />
        </div>

        <div>
          <label className={lbl} style={{ color: "var(--fg-muted)" }}>Descripción</label>
          <input name="description" defaultValue={item?.description ?? ''} placeholder="Salón principal"
            className={input} style={inputStyle} />
        </div>

        {/* Quick icon picker */}
        <div>
          <p className="text-xs mb-1.5" style={{ color: "var(--fg-muted)" }}>Íconos rápidos:</p>
          <div className="flex flex-wrap gap-1">
            {ICONS.map(icon => (
              <button key={icon} type="button"
                className="w-8 h-8 rounded-lg border text-sm hover:bg-indigo-500/10 transition-colors"
                style={{ borderColor: "var(--border)" }}
                onClick={e => {
                  const form = (e.currentTarget as HTMLElement).closest('form')!
                  ;(form.querySelector('[name="icon"]') as HTMLInputElement).value = icon
                }}
              >{icon}</button>
            ))}
          </div>
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <SubmitButton>{item ? 'Actualizar' : 'Agregar'}</SubmitButton>
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ItineraryManager({ items }: { items: Item[] }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function mutate(fn: () => Promise<unknown>) {
    startTransition(async () => { await fn(); router.refresh() })
  }

  return (
    <div className="space-y-3">
      {/* Add button / form */}
      {editing === 'new' ? (
        <ItemForm onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
          <Plus className="w-4 h-4" /> Agregar fase
        </button>
      )}

      {/* Items list */}
      {items.length === 0 && editing !== 'new' && (
        <div className="text-center py-12" style={{ color: "var(--fg-muted)" }}>
          <p className="text-sm">No hay fases en el itinerario.</p>
          <p className="text-xs mt-1">Haz clic en "Agregar fase" para comenzar.</p>
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id}>
          {editing === item.id ? (
            <ItemForm item={item} onCancel={() => setEditing(null)} />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl border group transition-colors"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>

              {/* Reorder */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button type="button" disabled={idx === 0}
                  onClick={() => mutate(() => moveItineraryItem(item.id, 'up'))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-2)] transition-colors disabled:opacity-20">
                  <ChevronUp className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                </button>
                <button type="button" disabled={idx === items.length - 1}
                  onClick={() => mutate(() => moveItineraryItem(item.id, 'down'))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-2)] transition-colors disabled:opacity-20">
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                </button>
              </div>

              {/* Icon */}
              <span className="text-2xl w-9 text-center flex-shrink-0">{item.icon || '📌'}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: "var(--fg-muted)" }}>{item.time}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{item.title}</span>
                  {!item.isVisible && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold">
                      Oculto
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--fg-muted)" }}>
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions (show on hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button type="button" title={item.isVisible ? 'Ocultar' : 'Mostrar'}
                  onClick={() => mutate(() => toggleItineraryItemVisibility(item.id, item.isVisible))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                  {item.isVisible
                    ? <Eye className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                    : <EyeOff className="w-3.5 h-3.5 text-yellow-500" />}
                </button>
                <button type="button" title="Editar" onClick={() => setEditing(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button type="button" title="Eliminar"
                  onClick={() => { if (confirm('¿Eliminar esta fase?')) mutate(() => deleteItineraryItem(item.id)) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
