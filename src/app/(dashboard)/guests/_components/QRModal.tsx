'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { X, Download, Copy, Check, MessageCircle } from 'lucide-react'
import type { InvitationRow } from '@/db/actions/guests'

export default function QRModal({
  invitation,
  onClose,
}: {
  invitation: Pick<InvitationRow, 'token' | 'familyName' | 'contactName' | 'contactPhone' | 'invitationNumber'>
  onClose: () => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
  }, [])

  const url = origin ? `${origin}/i/${invitation.token}` : ''

  useEffect(() => {
    if (!url) return
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: '#2A3A4A', light: '#FAFAF9' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [url])

  function download() {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `qr-${invitation.familyName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = qrDataUrl
    link.click()
  }

  function copyLink() {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const msg = encodeURIComponent(
    `¡Hola ${invitation.contactName}! 💍\n\nTe compartimos tu invitación digital para nuestra boda:\n\n${url}\n\nAhí encontrarás todos los detalles del evento. ¡Esperamos verte! 🥂`
  )
  const phone = invitation.contactPhone?.replace(/\D/g, '') ?? ''
  const whatsappHref = `https://wa.me/${phone ? phone : ''}?text=${msg}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-2)]"
        >
          <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
        </button>

        {/* Header */}
        <div className="text-center mb-5 pr-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            #{String(invitation.invitationNumber ?? 0).padStart(3, '0')}
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--fg)' }}>{invitation.familyName}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{invitation.contactName}</p>
        </div>

        {/* QR */}
        <div className="flex justify-center mb-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded-xl"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div
              className="w-[200px] h-[200px] rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface-2)' }}
            >
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* URL */}
        <p className="text-[10px] text-center break-all mb-5 px-2" style={{ color: 'var(--fg-muted)' }}>
          {url || '…'}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={download}
            disabled={!qrDataUrl}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors hover:border-indigo-500/50 disabled:opacity-40"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
          <button
            onClick={copyLink}
            disabled={!url}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors hover:border-indigo-500/50 disabled:opacity-40"
            style={{
              borderColor: 'var(--border)',
              color: copied ? 'rgb(34,197,94)' : 'var(--fg-muted)',
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
          <a
            href={url ? whatsappHref : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors hover:border-emerald-500/50"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
