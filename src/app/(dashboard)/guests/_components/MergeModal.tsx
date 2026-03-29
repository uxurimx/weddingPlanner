'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Users, AlertCircle } from 'lucide-react'
import { mergeInvitations, type InvitationRow } from '@/db/actions/guests'

export default function MergeModal({
  invitations,
  onClose,
}: {
  invitations: InvitationRow[]
  onClose: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const phonesAvailable = invitations.filter(i => i.contactPhone)

  // Default family name: "Familia {last word of first person}"
  const lastName = invitations[0]?.contactName.trim().split(/\s+/).at(-1) ?? ''
  const defaultFamily = lastName ? `Familia ${lastName}` : invitations[0]?.contactName ?? ''

  const [familyName,   setFamilyName]   = useState(defaultFamily)
  const [contactName,  setContactName]  = useState(invitations[0]?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(phonesAvailable[0]?.contactPhone ?? '')
  const [totalPasses,  setTotalPasses]  = useState(invitations.length)
  const [error,        setError]        = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)

  function handleSubmit() {
    if (!familyName.trim()) { setError('El nombre de familia es requerido.'); return }
    setError(null)
    setLoading(true)
    startTransition(async () => {
      const res = await mergeInvitations(
        invitations.map(i => i.id),
        familyName.trim(),
        contactName.trim(),
        contactPhone || null,
        totalPasses,
      )
      setLoading(false)
      if (res?.error) { setError(res.error); return }
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md rounded-2xl border shadow-xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-outfit font-semibold text-lg" style={{ color: 'var(--fg)' }}>
              Crear familia / grupo
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Unificar {invitations.length} invitados en una sola invitación
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Who is being merged */}
          <div
            className="p-3 rounded-xl border space-y-1"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--fg-muted)' }}>
              Invitados a unificar
            </p>
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg)' }}>
                <span className="opacity-40">·</span>
                <span className="flex-1">{inv.contactName}</span>
                {inv.contactPhone && (
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{inv.contactPhone}</span>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-muted)' }}>
                Nombre de la familia / grupo *
              </label>
              <input
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="Familia García"
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-muted)' }}>
                Nombre del contacto principal
              </label>
              <input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-muted)' }}>
                Teléfono de contacto
              </label>
              {phonesAvailable.length > 1 ? (
                <select
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
                >
                  <option value="">Sin teléfono</option>
                  {phonesAvailable.map(i => (
                    <option key={i.id} value={i.contactPhone!}>
                      {i.contactName}: {i.contactPhone}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="(667) 123 45 67"
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
                />
              )}
              {phonesAvailable.length === 0 && (
                <p className="text-[10px] mt-1 text-yellow-500">
                  Ninguno de los seleccionados tiene teléfono. Puedes ingresarlo manualmente.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-muted)' }}>
                Total de pases
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={totalPasses}
                onChange={e => setTotalPasses(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--fg-muted)' }}>
                Valor sugerido: {invitations.length} (uno por invitado unificado)
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !familyName.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--fg)', color: 'var(--bg)' }}
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            <Users className="w-3.5 h-3.5" />
            Crear familia
          </button>
        </div>
      </div>
    </div>
  )
}
