export const dynamic = 'force-dynamic'

import { getCheckInStats, getCheckInList } from '@/db/actions/checkin'
import LiveCheckIn from './_components/LiveCheckIn'

export default async function LiveCheckInPage() {
  const [stats, guests] = await Promise.all([
    getCheckInStats(),
    getCheckInList(),
  ])

  return <LiveCheckIn initialStats={stats} initialGuests={guests} />
}
