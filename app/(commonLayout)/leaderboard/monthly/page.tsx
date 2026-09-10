
import { redirect } from 'next/navigation'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export default async function LeaderboardMonthlyPage() {
  const data = await fetchPeriodLeaderboard('monthly')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="monthly" initialData={data} />
}
