/**
 * WhatsApp Web.js singleton — only used in API routes (server-side, Node.js runtime).
 * Persists across hot reloads in dev via globalThis.
 */

import type { Client as WaClient } from 'whatsapp-web.js'

export type WaState = 'disconnected' | 'connecting' | 'qr' | 'ready' | 'error'

interface WaGlobal {
  client:  WaClient | undefined
  state:   WaState
  qrData:  string | undefined   // data URL converted from raw qr string
  error:   string | undefined
}

declare global {
  // eslint-disable-next-line no-var
  var __wa: WaGlobal | undefined
}

function g(): WaGlobal {
  if (!globalThis.__wa) {
    globalThis.__wa = { client: undefined, state: 'disconnected', qrData: undefined, error: undefined }
  }
  return globalThis.__wa!
}

export function getWaStatus(): { state: WaState; qrData?: string; error?: string } {
  const { state, qrData, error } = g()
  return { state, qrData, error }
}

export async function connectWhatsApp(): Promise<void> {
  const ctx = g()
  if (ctx.state === 'ready' || ctx.state === 'connecting') return

  // Destroy stale client if any
  if (ctx.client) {
    try { await ctx.client.destroy() } catch { /* ignore */ }
    ctx.client = undefined
  }

  ctx.state   = 'connecting'
  ctx.qrData  = undefined
  ctx.error   = undefined

  // Dynamic import to avoid bundling in client code
  const { Client, LocalAuth } = await import('whatsapp-web.js')
  const QRCode = await import('qrcode')

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.whatsapp-session' }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      headless: true,
    },
  })

  ctx.client = client

  client.on('qr', async (qr: string) => {
    try {
      ctx.qrData = await QRCode.toDataURL(qr, { width: 280 })
      ctx.state  = 'qr'
    } catch { /* ignore */ }
  })

  client.on('ready', () => {
    ctx.state  = 'ready'
    ctx.qrData = undefined
  })

  client.on('auth_failure', () => {
    ctx.state  = 'error'
    ctx.error  = 'Autenticación fallida. Intenta reconectar.'
    ctx.client = undefined
  })

  client.on('disconnected', () => {
    ctx.state  = 'disconnected'
    ctx.qrData = undefined
    ctx.client = undefined
  })

  // initialize() blocks until browser closes; run in background
  client.initialize().catch((err: unknown) => {
    ctx.state = 'error'
    ctx.error = String(err)
    ctx.client = undefined
  })
}

export async function disconnectWhatsApp(): Promise<void> {
  const ctx = g()
  if (ctx.client) {
    try { await ctx.client.destroy() } catch { /* ignore */ }
    ctx.client = undefined
  }
  ctx.state  = 'disconnected'
  ctx.qrData = undefined
  ctx.error  = undefined
}

export async function sendWaMessage(phone: string, message: string): Promise<void> {
  const ctx = g()
  if (ctx.state !== 'ready' || !ctx.client) {
    throw new Error('WhatsApp no está conectado.')
  }
  const chatId = `${phone}@c.us`
  await ctx.client.sendMessage(chatId, message)
}
