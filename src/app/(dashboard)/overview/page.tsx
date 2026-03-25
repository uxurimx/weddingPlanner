export const dynamic = 'force-dynamic'

import { currentUser } from '@clerk/nextjs/server'
import { siteConfig } from '@/config/site'
import { getDashboardStats, getActivityFeed } from '@/db/actions/overview'
import OverviewDashboard from './_components/OverviewDashboard'

function getDaysUntilWedding(): number {
  const wedding = new Date(siteConfig.weddingDate)
  const now = new Date()
  const diff = wedding.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default async function OverviewPage() {
  const [user, stats, feed] = await Promise.all([
    currentUser(),
    getDashboardStats(),
    getActivityFeed(15),
  ])

  const greeting = user?.firstName ? `Hola, ${user.firstName}.` : 'Bienvenido.'
  const daysLeft  = getDaysUntilWedding()

  return (
    <OverviewDashboard
      stats={stats}
      feed={feed}
      greeting={greeting}
      daysLeft={daysLeft}
    />
  )
}
