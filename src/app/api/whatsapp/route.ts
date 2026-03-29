export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  getWaStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWaMessage,
} from '@/lib/whatsapp-client'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10)                           return `52${digits}`
  if (digits.startsWith('52') && digits.length === 12) return digits
  if (digits.startsWith('1')  && digits.length === 11) return digits
  return digits
}

// GET /api/whatsapp — returns current connection status + qr data URL
export async function GET() {
  return NextResponse.json(getWaStatus())
}

// POST /api/whatsapp — action dispatch
export async function POST(req: NextRequest) {
  const body = await req.json() as { action: string; phone?: string; message?: string }

  switch (body.action) {
    case 'connect':
      await connectWhatsApp()
      return NextResponse.json(getWaStatus())

    case 'disconnect':
      await disconnectWhatsApp()
      return NextResponse.json({ state: 'disconnected' })

    case 'send': {
      const { phone, message } = body
      if (!phone || !message) {
        return NextResponse.json({ error: 'phone y message son requeridos.' }, { status: 400 })
      }
      try {
        await sendWaMessage(normalizePhone(phone), message)
        return NextResponse.json({ ok: true })
      } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
      }
    }

    default:
      return NextResponse.json({ error: 'Acción desconocida.' }, { status: 400 })
  }
}
