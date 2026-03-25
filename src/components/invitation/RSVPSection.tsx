'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Heart, RefreshCw } from 'lucide-react'
import { submitRSVP, type ActionState } from '@/db/actions/public'

type RSVPProps = {
  token: string
  familyName: string
  totalPasses: number
  currentStatus: 'created' | 'sent' | 'viewed' | 'confirmed' | 'cancelled' | 'present'
  confirmedCount: number | null
}

export default function RSVPSection({
  token,
  familyName,
  totalPasses,
  currentStatus,
  confirmedCount,
}: RSVPProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(
    !['confirmed', 'cancelled', 'present'].includes(currentStatus)
  )

  const [state, action] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const res = await submitRSVP(prev, fd)
      if (res?.success) {
        setShowForm(false)
        router.refresh()
      }
      return res
    },
    null,
  )

  const effectiveStatus =
    state?.success
      ? state.rsvpAction === 'confirm' ? 'confirmed' : 'cancelled'
      : currentStatus

  return (
    <section
      id="rsvp"
      className="rounded-3xl border-2 overflow-hidden"
      style={{ borderColor: 'var(--w-blue-border)', backgroundColor: 'var(--w-cream-dark)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 text-center border-b"
        style={{ borderColor: 'var(--w-blue-border)', backgroundColor: 'var(--w-blue-light)', opacity: 0.9 }}
      >
        <Heart className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--w-blue-dark)' }} />
        <p
          className="text-xs uppercase tracking-[0.2em] font-semibold"
          style={{ color: 'var(--w-blue-dark)' }}
        >
          Confirmar Asistencia
        </p>
        <p className="text-base font-outfit font-bold mt-1" style={{ color: 'var(--w-text)' }}>
          {familyName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--w-text-muted)' }}>
          {totalPasses} pase{totalPasses > 1 ? 's' : ''}
        </p>
      </div>

      <div className="px-6 py-6">
        {/* Already present at event */}
        {effectiveStatus === 'present' && (
          <div className="text-center space-y-2 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border-2"
              style={{ backgroundColor: 'var(--w-blue-light)', borderColor: 'var(--w-blue)' }}
            >
              <Check className="w-6 h-6" style={{ color: 'var(--w-blue-dark)' }} />
            </div>
            <p className="text-base font-semibold font-outfit" style={{ color: 'var(--w-text)' }}>
              ¡Ya estás en el evento!
            </p>
            <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
              Que disfrutes este día tan especial. 🎉
            </p>
          </div>
        )}

        {/* Confirmed status (not showing form) */}
        {effectiveStatus === 'confirmed' && !showForm && (
          <div className="text-center space-y-3 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border-2"
              style={{ backgroundColor: 'var(--w-blue-light)', borderColor: 'var(--w-blue)' }}
            >
              <Check className="w-6 h-6" style={{ color: 'var(--w-blue-dark)' }} />
            </div>
            <div>
              <p className="text-base font-semibold font-outfit" style={{ color: 'var(--w-text)' }}>
                ¡Asistencia confirmada!
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--w-text-muted)' }}>
                {state?.success
                  ? `${confirmedCount ?? totalPasses} persona${(confirmedCount ?? totalPasses) > 1 ? 's' : ''} · ¡Los esperamos!`
                  : `${confirmedCount ?? totalPasses} persona${(confirmedCount ?? totalPasses) > 1 ? 's' : ''} confirmadas`
                }
              </p>
            </div>
            {currentStatus !== 'present' && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-xs mx-auto mt-2 transition-opacity hover:opacity-70"
                style={{ color: 'var(--w-text-muted)' }}
              >
                <RefreshCw className="w-3 h-3" /> Modificar respuesta
              </button>
            )}
          </div>
        )}

        {/* Cancelled status (not showing form) */}
        {effectiveStatus === 'cancelled' && !showForm && (
          <div className="text-center space-y-3 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border-2"
              style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'var(--w-cream)' }}
            >
              <X className="w-6 h-6" style={{ color: 'var(--w-text-muted)' }} />
            </div>
            <div>
              <p className="text-base font-semibold font-outfit" style={{ color: 'var(--w-text)' }}>
                Lamentamos que no puedas asistir
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--w-text-muted)' }}>
                Gracias por avisarnos.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-xs mx-auto mt-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--w-text-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Cambiar respuesta
            </button>
          </div>
        )}

        {/* RSVP Form */}
        {showForm && effectiveStatus !== 'present' && (
          <form action={action} className="space-y-5">
            <input type="hidden" name="token" value={token} />

            {/* How many attending */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2.5 text-center"
                style={{ color: 'var(--w-text-muted)' }}>
                ¿Cuántos de ustedes asistirán?
              </p>
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPasses }, (_, i) => i + 1).map(n => (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="confirmedCount"
                      value={n}
                      defaultChecked={n === (confirmedCount ?? totalPasses)}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all peer-checked:border-[var(--w-blue)] peer-checked:bg-[var(--w-blue)] peer-checked:text-white"
                      style={{ borderColor: 'var(--w-cream-border)', color: 'var(--w-text-muted)' }}
                    >
                      {n}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional message */}
            <div>
              <textarea
                name="message"
                rows={2}
                placeholder="Mensaje para los novios (opcional)"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                style={{
                  backgroundColor: 'var(--w-cream)',
                  borderColor: 'var(--w-cream-border)',
                  color: 'var(--w-text)',
                }}
              />
            </div>

            {state?.error && (
              <p className="text-xs text-red-500 text-center">{state.error}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                name="rsvpAction"
                value="confirm"
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--w-blue)' }}
              >
                ✓ &nbsp;Confirmar asistencia
              </button>
              <button
                type="submit"
                name="rsvpAction"
                value="decline"
                className="w-full py-2.5 rounded-2xl text-sm font-medium border transition-all hover:opacity-70"
                style={{
                  borderColor: 'var(--w-cream-border)',
                  color: 'var(--w-text-muted)',
                  backgroundColor: 'transparent',
                }}
              >
                No podré asistir
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
