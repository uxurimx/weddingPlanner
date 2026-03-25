'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

export default function InvitationQR({ token }: { token: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const url = `${origin}/i/${token}`
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: '#4A5568', light: '#FDFCF8' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [token])

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="p-3 rounded-2xl border"
        style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
      >
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR Invitación"
            width={160}
            height={160}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div
            className="w-40 h-40 flex items-center justify-center"
            style={{ color: 'var(--w-text-muted)' }}
          >
            <QrCode className="w-8 h-8 opacity-30" />
          </div>
        )}
      </div>
      <p className="text-[10px] text-center" style={{ color: 'var(--w-text-light)' }}>
        Muestra este código al llegar al evento
      </p>
    </div>
  )
}
