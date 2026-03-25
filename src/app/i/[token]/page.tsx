export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInvitationByToken, trackView } from '@/db/actions/public'
import InvitationView from '@/components/invitation/InvitationView'

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const data = await getInvitationByToken(token)
  if (!data) return { title: 'Invitación' }

  const { couple, invitation } = data
  const groom = couple?.groomName || 'Jahir'
  const bride = couple?.brideName || 'Gilliane'

  return {
    title: `${groom} & ${bride} · 06.06.2026`,
    description: `${invitation.familyName} · ${invitation.totalPasses} pase${invitation.totalPasses > 1 ? 's' : ''} · Confirma tu asistencia`,
    openGraph: {
      title: `${groom} & ${bride} · Invitación de boda`,
      description: `Has sido invitado/a a la boda de ${groom} & ${bride} el Sábado 6 de Junio de 2026. Confirma tu asistencia.`,
      type: 'website',
    },
  }
}

export default async function PersonalizedInvitationPage({ params }: Props) {
  const { token } = await params
  const data = await getInvitationByToken(token)

  if (!data) notFound()

  // Track view (non-blocking)
  void trackView(token)

  return (
    <div style={{ backgroundColor: 'var(--w-cream)', minHeight: '100vh' }}>
      <InvitationView {...data} />
    </div>
  )
}
