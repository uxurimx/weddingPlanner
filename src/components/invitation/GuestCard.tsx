'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

type Props = {
  familyName: string
  contactName: string
  totalPasses: number
  token: string
  status: string
}

export default function GuestCard({ familyName, contactName, totalPasses, token, status }: Props) {
  const isConfirmed = status === 'confirmed'
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (!isConfirmed) return
    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    QRCode.toDataURL(`${origin}/i/${token}`, {
      width: 220,
      margin: 2,
      color: { dark: '#4A6A88', light: '#FAFAF8' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [isConfirmed, token])

  if (isConfirmed) {
    return (
      <div className="text-center space-y-3 py-4">
        <p style={{ fontFamily: 'var(--font-dancing)', fontSize: '1.1rem', color: 'var(--w-blue)' }}>
          ¡Confirmado! Muestra este código al llegar
        </p>
        <div className="flex justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Invitación"
              width={180}
              height={180}
              style={{ imageRendering: 'pixelated', borderRadius: 12 }}
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center" style={{ color: 'var(--w-blue-light)' }}>
              <QrCode className="w-10 h-10 opacity-40" />
            </div>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
          {familyName} · {totalPasses} pase{totalPasses > 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-1 py-4">
      <p
        className="text-xs uppercase tracking-widest"
        style={{ color: 'var(--w-text-light)', letterSpacing: '0.2em' }}
      >
        Esta invitación es para
      </p>
      <p style={{ fontFamily: 'var(--font-dancing)', fontSize: '1.8rem', color: 'var(--w-blue)', lineHeight: 1.2 }}>
        {familyName}
      </p>
      <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>
        {contactName} · {totalPasses} pase{totalPasses > 1 ? 's' : ''}
      </p>
    </div>
  )
}
