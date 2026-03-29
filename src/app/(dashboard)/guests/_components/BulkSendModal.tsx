'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle, Check, SkipForward, AlertCircle, Info } from 'lucide-react'
import { markInvitationSent, type InvitationRow } from '@/db/actions/guests'

// Normalize phone to international format for WhatsApp
// Mexico 10-digit → 52XXXXXXXXXX, US +1 → 1XXXXXXXXXX, etc.
function normalizePhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `52${digits}` // Mexico local
  if (digits.startsWith('52') && digits.length === 12) return digits // Mexico with prefix
  if (digits.startsWith('1') && digits.length === 11) return digits  // US/CA
  return digits // Use as-is
}

function buildWhatsAppUrl(phone: string, text: string): string {
  // Opens WhatsApp Web directly in the conversation (reuses named window)
  return `https://web.whatsapp.com/send?phone=${normalizePhone(phone)}&text=${encodeURIComponent(text)}`
}

function buildMessage(inv: InvitationRow, origin: string): string {
  const url = `${origin}/i/${inv.token}`
  return (
    `¡Hola ${inv.contactName}! 💍\n\n` +
    `Estás invitado(a) a la boda de *Jahir & Gilliane* el *06 de junio de 2026*.\n\n` +
    `Aquí está tu invitación digital con todos los detalles:\n\n` +
    `${url}\n\n` +
    `¡Esperamos contar contigo! 🥂`
  )
}

export default function BulkSendModal({
  invitations,
  onClose,
}: {
  invitations: InvitationRow[]
  onClose: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const origin = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    : ''

  const withPhone    = invitations.filter(inv => inv.contactPhone)
  const withoutPhone = invitations.filter(inv => !inv.contactPhone)

  const [idx, setIdx]             = useState<number>(-1)  // -1 = not started
  const [sentIds, setSentIds]     = useState<Set<string>>(new Set())
  const [skippedIds, setSkipped]  = useState<Set<string>>(new Set())

  const isDone    = idx >= withPhone.length && idx > -1
  const current   = idx >= 0 && idx < withPhone.length ? withPhone[idx] : null
  const progress  = sentIds.size + skippedIds.size

  function openWhatsApp(i: number) {
    const inv = withPhone[i]
    if (!inv?.contactPhone) return
    const url = buildWhatsAppUrl(inv.contactPhone, buildMessage(inv, origin))
    // Reuse the same secondary window so the app stays in view
    window.open(url, 'wa_sender')
  }

  function start() {
    setIdx(0)
    openWhatsApp(0)
  }

  function advance() {
    const next = idx + 1
    if (next < withPhone.length) {
      setIdx(next)
      openWhatsApp(next)
    } else {
      setIdx(withPhone.length) // done
    }
  }

  function handleSent() {
    if (!current) return
    setSentIds(prev => new Set([...prev, current.id]))
    startTransition(async () => {
      await markInvitationSent(current.id)
      router.refresh()
    })
    advance()
  }

  function handleSkip() {
    if (!current) return
    setSkipped(prev => new Set([...prev, current.id]))
    advance()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-outfit font-semibold text-lg" style={{ color: 'var(--fg)' }}>
              Envío masivo — WhatsApp
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              {withPhone.length} con teléfono · {withoutPhone.length} sin teléfono (omitidos)
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* How it works */}
          {idx === -1 && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs text-blue-600">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-3.5 h-3.5" /> ¿Cómo funciona?
              </div>
              <p>
                Se abre WhatsApp Web con el mensaje listo en una ventana aparte.
                Presiona <kbd className="px-1 py-0.5 rounded bg-blue-500/20 font-mono text-[10px]">Enter</kbd> para enviar,
                regresa aquí y haz clic en <strong>Enviado →</strong>.
              </p>
              <p className="opacity-70">
                💡 Para automatización 100% sin clics, se requiere integrar <strong>whatsapp-web.js</strong> como servicio local (sin costo, ver documentación).
              </p>
            </div>
          )}

          {/* Current card */}
          {current && (
            <div
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
                Enviando ahora · {idx + 1} de {withPhone.length}
              </p>
              <p className="font-semibold text-base" style={{ color: 'var(--fg)' }}>{current.familyName}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>{current.contactPhone}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSent}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  <Check className="w-4 h-4" /> Enviado →
                </button>
                <button
                  onClick={handleSkip}
                  title="Omitir"
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border text-xs transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {isDone && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-semibold" style={{ color: 'var(--fg)' }}>¡Envío completado!</p>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
                {sentIds.size} enviados · {skippedIds.size} omitidos
              </p>
            </div>
          )}

          {/* Progress bar */}
          {idx >= 0 && withPhone.length > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--fg-muted)' }}>
                <span>Progreso</span>
                <span>{progress} / {withPhone.length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(progress / withPhone.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Queue list */}
          <div className="space-y-0.5 overflow-y-auto max-h-60">
            {withPhone.map((inv, i) => {
              const sent    = sentIds.has(inv.id)
              const skipped = skippedIds.has(inv.id)
              const active  = i === idx
              return (
                <div
                  key={inv.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${active ? 'border' : ''}`}
                  style={
                    active
                      ? { backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }
                      : {}
                  }
                >
                  <span
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-full"
                    style={
                      sent    ? { backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(34,197,94)' } :
                      skipped ? { backgroundColor: 'rgba(234,179,8,0.15)',  color: 'rgb(234,179,8)' } :
                      active  ? { backgroundColor: 'var(--border)', color: 'var(--fg)' } :
                                { color: 'var(--fg-muted)' }
                    }
                  >
                    {sent ? '✓' : skipped ? '–' : active ? '→' : i + 1}
                  </span>
                  <span
                    className={`flex-1 truncate ${sent || skipped ? 'line-through opacity-40' : ''}`}
                    style={{ color: 'var(--fg)' }}
                  >
                    {inv.familyName}
                  </span>
                  <span className="text-xs truncate max-w-[130px]" style={{ color: 'var(--fg-muted)' }}>
                    {inv.contactPhone}
                  </span>
                </div>
              )
            })}

            {withoutPhone.length > 0 && (
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs mt-1"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--fg-muted)' }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Sin teléfono (omitidos): {withoutPhone.map(i => i.familyName).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            {isDone ? 'Cerrar' : 'Cancelar'}
          </button>
          {idx === -1 && withPhone.length > 0 && (
            <button
              onClick={start}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Iniciar · {withPhone.length} mensajes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
