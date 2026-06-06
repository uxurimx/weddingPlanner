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

  // ─── Canvas download ──────────────────────────────────────────────────────

  function download() {
    if (!qrDataUrl) return

    const CARD_W = 600
    const CARD_H = 800
    const canvas  = document.createElement('canvas')
    canvas.width  = CARD_W
    canvas.height = CARD_H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#FAFAF9'
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Outer border
    ctx.strokeStyle = '#DDD8D0'
    ctx.lineWidth = 2
    ctx.beginPath()
    const r = 24
    ctx.moveTo(r, 0)
    ctx.lineTo(CARD_W - r, 0)
    ctx.quadraticCurveTo(CARD_W, 0, CARD_W, r)
    ctx.lineTo(CARD_W, CARD_H - r)
    ctx.quadraticCurveTo(CARD_W, CARD_H, CARD_W - r, CARD_H)
    ctx.lineTo(r, CARD_H)
    ctx.quadraticCurveTo(0, CARD_H, 0, CARD_H - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.stroke()

    // Couple names — script-style using italic serif
    ctx.textAlign = 'center'
    ctx.fillStyle = '#2A3A4A'
    ctx.font = 'italic 52px Georgia, serif'
    ctx.fillText('Jahir & Gilliane', CARD_W / 2, 100)

    // Date
    ctx.font = '600 22px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#6B6760'
    ctx.fillText('06 · 06 · 2026', CARD_W / 2, 138)

    // Separator line
    ctx.strokeStyle = '#DDD8D0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 162)
    ctx.lineTo(CARD_W - 80, 162)
    ctx.stroke()

    // QR image — async draw
    const img = new Image()
    img.onload = () => {
      const QR_SIZE = 300
      const qrX = (CARD_W - QR_SIZE) / 2
      const qrY = 185

      // QR background card
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(qrX - 16, qrY - 16, QR_SIZE + 32, QR_SIZE + 32, 16)
      ctx.fill()
      ctx.strokeStyle = '#E8E4DE'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.drawImage(img, qrX, qrY, QR_SIZE, QR_SIZE)

      // Family name
      ctx.textAlign = 'center'
      ctx.fillStyle = '#2A3A4A'
      ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
      ctx.fillText(invitation.familyName, CARD_W / 2, qrY + QR_SIZE + 68)

      // Invitation number
      const numStr = `#${String(invitation.invitationNumber ?? 0).padStart(3, '0')}`
      ctx.font = '500 16px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = '#9A948E'
      ctx.fillText(numStr, CARD_W / 2, qrY + QR_SIZE + 98)

      // Divider
      ctx.strokeStyle = '#E8E4DE'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(CARD_W / 2 - 60, qrY + QR_SIZE + 116)
      ctx.lineTo(CARD_W / 2 + 60, qrY + QR_SIZE + 116)
      ctx.stroke()

      // Contact name + passes info
      ctx.font = '500 18px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = '#6B6760'
      ctx.fillText(invitation.contactName, CARD_W / 2, qrY + QR_SIZE + 148)

      // Download
      const filename = `invitacion-${invitation.familyName.replace(/\s+/g, '-').toLowerCase()}.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = qrDataUrl
  }

  // ─── Copy link ────────────────────────────────────────────────────────────

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
