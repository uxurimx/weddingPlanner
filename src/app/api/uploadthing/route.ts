import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from './core'
import type { NextRequest } from 'next/server'

// Force dynamic — prevents Next.js ISR caching
export const dynamic = 'force-dynamic'

const handlers = createRouteHandler({ router: ourFileRouter })

// Wrap handlers to add Cache-Control: no-store so Vercel's CDN edge
// never caches any response (including the ?slug= onUploadComplete callback)
export async function GET(req: NextRequest) {
  const res = await handlers.GET(req)
  const next = new Response(res.body, res)
  next.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return next
}

export async function POST(req: NextRequest) {
  const res = await handlers.POST(req)
  const next = new Response(res.body, res)
  next.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return next
}
