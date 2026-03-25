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
      <p className="text-[10px] uppercase tracking-[0.35em] mb-6" style={{ color: 'var(--w-text-muted)' }}>
        Con mucho amor, los invitan a su boda
      </p>
      <h1 className="font-outfit font-bold text-6xl mb-2" style={{ color: 'var(--w-text)' }}>
        {siteConfig.groomName}
      </h1>
      <p className="font-outfit text-3xl my-1" style={{ color: 'var(--w-gold)' }}>&amp;</p>
      <h1 className="font-outfit font-bold text-6xl mb-8" style={{ color: 'var(--w-text)' }}>
        {siteConfig.brideName}
      </h1>
      <Countdown weddingDate={siteConfig.weddingDate} />
      <p className="text-xs mt-10 uppercase tracking-[0.2em]" style={{ color: 'var(--w-text-muted)' }}>
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
