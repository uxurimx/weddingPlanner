'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, MessageCircle, Check, SkipForward, AlertCircle,
  Wifi, WifiOff, Loader2, QrCode, Zap, MousePointer,
} from 'lucide-react'
import { markInvitationSent, type InvitationRow } from '@/db/actions/guests'

// ─── Phone helpers ────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10)                            return `52${digits}`
  if (digits.startsWith('52') && digits.length === 12) return digits
  if (digits.startsWith('1')  && digits.length === 11) return digits
  return digits
}

function buildMessage(inv: InvitationRow, origin: string): string {
  return (
    `¡Hola ${inv.contactName}! 💍\n\n` +
    `Estás invitado(a) a la boda de *Jahir & Gilliane* el *06 de junio de 2026*.\n\n` +
    `Aquí está tu invitación digital:\n` +
    `${origin}/i/${inv.token}\n\n` +
    `¡Esperamos contar contigo! 🥂`
  )
}

// ─── WhatsApp status type ─────────────────────────────────────────────────────

type WaState = 'disconnected' | 'connecting' | 'qr' | 'ready' | 'error'
interface WaStatus { state: WaState; qrData?: string; error?: string }

// ─── Connection panel ─────────────────────────────────────────────────────────

function WaConnectionPanel() {
  const [status, setStatus] = useState<WaStatus>({ state: 'disconnected' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    try {
      const r = await fetch('/api/whatsapp')
      const data: WaStatus = await r.json()
      setStatus(data)
      if (data.state === 'ready' || data.state === 'disconnected' || data.state === 'error') {
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = null
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    poll()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [poll])

  async function connect() {
    setStatus({ state: 'connecting' })
    await fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ action: 'connect' }), headers: { 'Content-Type': 'application/json' } })
    // Start polling every 2s until ready/error
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(poll, 2000)
  }

  async function disconnect() {
    await fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ action: 'disconnect' }), headers: { 'Content-Type': 'application/json' } })
    setStatus({ state: 'disconnected' })
  }

  return (
    <div
      className="p-4 rounded-2xl border space-y-3"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status.state === 'ready' && <Wifi className="w-4 h-4 text-emerald-500" />}
          {(status.state === 'connecting' || status.state === 'qr') && <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />}
          {(status.state === 'disconnected' || status.state === 'error') && <WifiOff className="w-4 h-4 text-red-400" />}
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            {status.state === 'ready'       && 'WhatsApp conectado ✓'}
            {status.state === 'connecting'  && 'Iniciando WhatsApp…'}
            {status.state === 'qr'          && 'Escanea el código QR'}
            {status.state === 'disconnected' && 'WhatsApp desconectado'}
            {status.state === 'error'        && 'Error de conexión'}
          </span>
        </div>

        {status.state === 'ready' ? (
          <button
            onClick={disconnect}
            className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Desconectar
          </button>
        ) : status.state === 'disconnected' || status.state === 'error' ? (
          <button
            onClick={connect}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            Conectar
          </button>
        ) : null}
      </div>

      {/* QR code */}
      {status.state === 'qr' && status.qrData && (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={status.qrData} alt="QR WhatsApp" className="w-52 h-52 rounded-xl" />
          <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
            Abre WhatsApp → Dispositivos vinculados → Escanear QR
          </p>
        </div>
      )}

      {/* Error */}
      {status.state === 'error' && status.error && (
        <p className="text-xs text-red-400">{status.error}</p>
      )}

      {/* Connecting hint */}
      {status.state === 'connecting' && (
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
          Lanzando Chromium… puede tardar 15-30 segundos la primera vez.
        </p>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

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

  // ── Mode toggle ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')

  // ── Manual mode state ────────────────────────────────────────────────────────
  const [idx, setIdx]            = useState<number>(-1)
  const [sentIds, setSentIds]    = useState<Set<string>>(new Set())
  const [skippedIds, setSkipped] = useState<Set<string>>(new Set())

  const isDone    = idx >= withPhone.length && idx > -1
  const current   = idx >= 0 && idx < withPhone.length ? withPhone[idx] : null
  const progress  = sentIds.size + skippedIds.size

  function openWaWeb(i: number) {
    const inv = withPhone[i]
    if (!inv?.contactPhone) return
    const phone = normalizePhone(inv.contactPhone)
    const text  = buildMessage(inv, origin)
    window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, 'wa_sender')
  }

  function startManual() { setIdx(0); openWaWeb(0) }

  function advance() {
    const next = idx + 1
    if (next < withPhone.length) { setIdx(next); openWaWeb(next) }
    else setIdx(withPhone.length)
  }

  function handleSent() {
    if (!current) return
    setSentIds(prev => new Set([...prev, current.id]))
    startTransition(async () => { await markInvitationSent(current.id); router.refresh() })
    advance()
  }

  function handleSkip() {
    if (!current) return
    setSkipped(prev => new Set([...prev, current.id]))
    advance()
  }

  // ── Auto mode state ──────────────────────────────────────────────────────────
  const [autoRunning, setAutoRunning]     = useState(false)
  const [autoProgress, setAutoProgress]  = useState(0)
  const [autoFailed, setAutoFailed]      = useState<string[]>([])
  const [autoDone, setAutoDone]          = useState(false)
  const [autoStatus, setAutoStatus]      = useState<WaState>('disconnected')
  const autoAbort = useRef(false)

  // Poll WA status when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return
    let id: ReturnType<typeof setInterval>
    const poll = async () => {
      try {
        const r = await fetch('/api/whatsapp')
        const d = await r.json() as { state: WaState }
        setAutoStatus(d.state)
      } catch { /* ignore */ }
    }
    poll()
    id = setInterval(poll, 2500)
    return () => clearInterval(id)
  }, [mode])

  async function startAuto() {
    setAutoRunning(true)
    setAutoProgress(0)
    setAutoFailed([])
    setAutoDone(false)
    autoAbort.current = false

    for (let i = 0; i < withPhone.length; i++) {
      if (autoAbort.current) break
      const inv = withPhone[i]
      if (!inv.contactPhone) continue

      try {
        const res = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action:  'send',
            phone:   normalizePhone(inv.contactPhone),
            message: buildMessage(inv, origin),
          }),
        })
        const data = await res.json() as { ok?: boolean; error?: string }
        if (data.ok) {
          await markInvitationSent(inv.id)
        } else {
          setAutoFailed(prev => [...prev, `${inv.familyName}: ${data.error ?? 'error'}`])
        }
      } catch (e) {
        setAutoFailed(prev => [...prev, `${inv.familyName}: ${String(e)}`])
      }

      setAutoProgress(i + 1)
      // Small delay between sends to avoid rate limiting
      await new Promise(r => setTimeout(r, 800))
    }

    setAutoRunning(false)
    setAutoDone(true)
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-xl flex flex-col max-h-[92vh]"
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

        {/* Mode toggle */}
        <div
          className="flex gap-1 p-1 m-4 mb-0 rounded-2xl self-start"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {([['manual', MousePointer, 'Manual'], ['auto', Zap, 'Automático']] as const).map(([m, Icon, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={
                mode === m
                  ? { backgroundColor: 'var(--bg)', color: 'var(--fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--fg-muted)' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">

          {/* ── MANUAL MODE ── */}
          {mode === 'manual' && (
            <>
              <p className="text-xs px-1" style={{ color: 'var(--fg-muted)' }}>
                Abre WhatsApp Web con el mensaje listo. Presiona <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd> para enviar, regresa y haz clic en <strong>Enviado →</strong>.
              </p>

              {/* Current card */}
              {current && (
                <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
                    Enviando · {idx + 1} / {withPhone.length}
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
                    <button onClick={handleSkip} title="Omitir" className="flex items-center justify-center px-3 py-2 rounded-xl border text-xs transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Done */}
              {isDone && (
                <div className="text-center py-4">
                  <Check className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold" style={{ color: 'var(--fg)' }}>¡Envío completado!</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>{sentIds.size} enviados · {skippedIds.size} omitidos</p>
                </div>
              )}

              {/* Progress */}
              {idx >= 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>
                    <span>Progreso</span><span>{progress} / {withPhone.length}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(progress / withPhone.length) * 100}%` }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── AUTO MODE ── */}
          {mode === 'auto' && (
            <>
              {/* Connection panel */}
              <WaConnectionPanel />

              {/* Auto send progress */}
              {(autoRunning || autoDone) && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>
                    <span>Enviando mensajes…</span>
                    <span>{autoProgress} / {withPhone.length}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(autoProgress / withPhone.length) * 100}%` }} />
                  </div>
                  {autoDone && (
                    <p className="text-xs mt-2 text-emerald-500 font-semibold">
                      ✓ Envío automático completado — {autoProgress - autoFailed.length} exitosos
                    </p>
                  )}
                  {autoFailed.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {autoFailed.map((f, i) => (
                        <p key={i} className="text-xs text-red-400">{f}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Queue list (both modes) */}
          {!autoDone && (
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {withPhone.map((inv, i) => {
                const sent    = sentIds.has(inv.id)
                const skipped = skippedIds.has(inv.id)
                const active  = mode === 'manual' && i === idx
                return (
                  <div key={inv.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${active ? 'border' : ''}`} style={active ? { backgroundColor: 'var(--surface)', borderColor: 'var(--border)' } : {}}>
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
                    <span className={`flex-1 truncate text-sm ${sent || skipped ? 'line-through opacity-40' : ''}`} style={{ color: 'var(--fg)' }}>
                      {inv.familyName}
                    </span>
                    <span className="text-xs truncate max-w-[130px]" style={{ color: 'var(--fg-muted)' }}>
                      {inv.contactPhone}
                    </span>
                  </div>
                )
              })}
              {withoutPhone.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs mt-1" style={{ backgroundColor: 'var(--surface)', color: 'var(--fg-muted)' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Sin teléfono: {withoutPhone.map(i => i.familyName).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
            {isDone || autoDone ? 'Cerrar' : 'Cancelar'}
          </button>

          {mode === 'manual' && idx === -1 && withPhone.length > 0 && (
            <button
              onClick={startManual}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Iniciar · {withPhone.length}
            </button>
          )}

          {mode === 'auto' && !autoRunning && !autoDone && (
            <button
              onClick={startAuto}
              disabled={autoStatus !== 'ready'}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={autoStatus !== 'ready' ? 'Conecta WhatsApp primero' : ''}
            >
              <Zap className="w-4 h-4" />
              Enviar automáticamente · {withPhone.length}
            </button>
          )}

          {mode === 'auto' && autoRunning && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando {autoProgress}/{withPhone.length}…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
