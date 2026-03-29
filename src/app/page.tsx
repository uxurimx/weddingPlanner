export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { getPublicEventData } from '@/db/actions/public'
import InvitationView from '@/components/invitation/InvitationView'
import Countdown from '@/components/invitation/Countdown'

// Minimal fallback when no event data exists yet
function ComingSoon() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ backgroundColor: 'var(--w-cream)', color: 'var(--w-text)' }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.35em] mb-8"
        style={{ color: 'var(--w-text-muted)' }}
      >
        Con mucho amor, los invitan a su boda
      </p>
      <p
        style={{
          fontFamily: 'var(--font-script)',
          fontSize: '4.5rem',
          color: 'var(--w-blue)',
          lineHeight: 1.15,
        }}
      >
        {siteConfig.brideName} &amp; {siteConfig.groomName}
      </p>
      <div style={{ color: 'var(--w-blue-border)', margin: '20px 0' }}>
        <svg viewBox="0 0 200 16" style={{ width: 200, height: 16 }} fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M8,8 Q18,3 28,8 Q38,13 48,8 Q58,3 68,8" strokeWidth="1" />
          <line x1="74" y1="8" x2="88" y2="8" strokeWidth="0.8" />
          <path d="M92,2 L100,8 L92,14 L84,8 Z" strokeWidth="0.9" stroke="var(--w-blue)" fill="none" />
          <line x1="112" y1="8" x2="126" y2="8" strokeWidth="0.8" />
          <path d="M132,8 Q142,3 152,8 Q162,13 172,8 Q182,3 192,8" strokeWidth="1" />
        </svg>
      </div>
      <Countdown weddingDate={siteConfig.weddingDate} />
      <p
        className="text-[10px] mt-10 uppercase tracking-[0.25em]"
        style={{ color: 'var(--w-text-light)' }}
      >
        Sábado · 6 de Junio · 2026 · Culiacán, Sinaloa
      </p>
    </div>
  )
}

export default async function WeddingLandingPage() {
  const { userId } = await auth()
  const data = await getPublicEventData()

  return (
    <div style={{ backgroundColor: 'var(--w-cream)', minHeight: '100vh' }}>
      {/* Discreet admin link */}
      <div className="fixed top-4 right-4 z-50">
        {userId ? (
          <Link
            href="/overview"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-sm transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'rgba(250,246,238,0.85)',
              borderColor: 'var(--w-cream-border)',
              color: 'var(--w-text-muted)',
            }}
          >
            <Settings className="w-3 h-3" /> Admin
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs border backdrop-blur-sm transition-colors hover:opacity-60"
            style={{
              backgroundColor: 'rgba(250,246,238,0.5)',
              borderColor: 'transparent',
              color: 'var(--w-text-light)',
            }}
          >
            ·
          </Link>
        )}
      </div>

      {data ? <InvitationView {...data} /> : <ComingSoon />}
    </div>
  )
}
