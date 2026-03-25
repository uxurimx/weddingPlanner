'use client'

import { useActionState } from 'react'
import { upsertVenue, type ActionState } from '@/db/actions/information'
import SubmitButton from '@/components/SubmitButton'

type Venue = {
  id: string; type: string; name: string; address: string | null; city: string | null
  state: string | null; zipCode: string | null; googleMapsUrl: string | null
  wazeUrl: string | null; startTime: Date | null; notes: string | null
}

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

function VenueForm({ type, venue, label: title, emoji }: {
  type: 'ceremony' | 'reception'
  venue: Venue | null
  label: string
  emoji: string
}) {
  const [state, action] = useActionState(upsertVenue, null)

  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">{emoji}</span>
        <h3 className="font-outfit font-semibold text-lg" style={{ color: "var(--fg)" }}>{title}</h3>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="type" value={type} />

        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>Nombre del lugar *</label>
          <input name="name" defaultValue={venue?.name ?? ''} required
            placeholder={type === 'ceremony' ? 'Salón del Reino de los Testigos de Jehová' : 'Salón Queen Palace'}
            className={input} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Hora de inicio</label>
            <input type="datetime-local" name="startTime" defaultValue={formatDatetimeLocal(venue?.startTime)}
              className={input} style={inputStyle} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Código postal</label>
            <input name="zipCode" defaultValue={venue?.zipCode ?? ''} placeholder="40000"
              className={input} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>Dirección</label>
          <input name="address" defaultValue={venue?.address ?? ''}
            placeholder="Blvd F. Toscana 3385, Fracc. Statos Toscane"
            className={input} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Ciudad</label>
            <input name="city" defaultValue={venue?.city ?? ''} placeholder="Culiacán"
              className={input} style={inputStyle} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Estado</label>
            <input name="state" defaultValue={venue?.state ?? ''} placeholder="Sinaloa"
              className={input} style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Link Google Maps</label>
            <input name="googleMapsUrl" defaultValue={venue?.googleMapsUrl ?? ''}
              placeholder="https://maps.google.com/..."
              className={input} style={inputStyle} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--fg-muted)" }}>Link Waze</label>
            <input name="wazeUrl" defaultValue={venue?.wazeUrl ?? ''}
              placeholder="https://waze.com/ul?..."
              className={input} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>Notas adicionales</label>
          <input name="notes" defaultValue={venue?.notes ?? ''}
            placeholder="Ej: Estacionamiento gratuito"
            className={input} style={inputStyle} />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <SubmitButton>Guardar venue</SubmitButton>
          <StatusBar state={state} />
        </div>
      </form>
    </div>
  )
}

export default function VenuesTab({ venues }: { venues: Venue[] }) {
  const ceremony  = venues.find(v => v.type === 'ceremony')  ?? null
  const reception = venues.find(v => v.type === 'reception') ?? null

  return (
    <div className="space-y-6">
      <VenueForm type="ceremony"  venue={ceremony}  label="Discurso Bíblico / Ceremonia" emoji="🕍" />
      <VenueForm type="reception" venue={reception} label="Recepción"                    emoji="🥂" />
    </div>
  )
}
