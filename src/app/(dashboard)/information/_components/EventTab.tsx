'use client'

import { useActionState } from 'react'
import { upsertEvent, type ActionState } from '@/db/actions/information'
import SubmitButton from '@/components/SubmitButton'

type EventData = {
  date: Date; dressCode: string | null; dressCodeNotes: string | null; eventNotes: string | null
} | null

const input = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }
const label = "block text-xs font-semibold uppercase tracking-wide mb-1.5"

function formatDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 16)
}

function StatusBar({ state }: { state: ActionState }) {
  if (!state) return null
  return (
    <p className={`text-sm font-medium ${state.success ? 'text-emerald-500' : 'text-red-500'}`}>
      {state.success ? `✓ ${state.message}` : `✗ ${state.error}`}
    </p>
  )
}

export default function EventTab({ event }: { event: EventData }) {
  const [state, action] = useActionState(upsertEvent, null)

  return (
    <form action={action} className="space-y-6">
      {/* Fecha */}
      <div>
        <h3 className="font-outfit font-semibold text-base mb-4 pb-3 border-b" style={{ color: "var(--fg)", borderColor: "var(--border)" }}>
          Fecha y hora
        </h3>
        <div className="max-w-xs">
          <label className={label} style={{ color: "var(--fg-muted)" }}>Fecha de la ceremonia *</label>
          <input type="datetime-local" name="date" defaultValue={formatDatetimeLocal(event?.date)}
            required className={input} style={inputStyle} />
          <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
            Sábado 6 de junio, 2026 · 2:30 PM (hora configurada en la invitación)
          </p>
        </div>
      </div>

      {/* Dress code */}
      <div>
        <h3 className="font-outfit font-semibold text-base mb-4 pb-3 border-b" style={{ color: "var(--fg)", borderColor: "var(--border)" }}>
          Dress code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Etiqueta</label>
            <input name="dressCode" defaultValue={event?.dressCode ?? ''} placeholder="Formal"
              className={input} style={inputStyle} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Descripción</label>
            <input name="dressCodeNotes" defaultValue={event?.dressCodeNotes ?? ''}
              placeholder="Ej: Traje o vestido de gala"
              className={input} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Notas generales */}
      <div>
        <h3 className="font-outfit font-semibold text-base mb-4 pb-3 border-b" style={{ color: "var(--fg)", borderColor: "var(--border)" }}>
          Notas del evento
        </h3>
        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>Avisos para los invitados</label>
          <textarea name="eventNotes" defaultValue={event?.eventNotes ?? ''}
            placeholder="Ej: Pases intransferibles · Respetuosamente No niños."
            rows={3} className={`${input} resize-none`} style={inputStyle} />
          <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
            Aparece al final de la invitación como aviso destacado.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton>Guardar evento</SubmitButton>
        <StatusBar state={state} />
      </div>
    </form>
  )
}
