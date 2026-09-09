
import { redirect } from 'next/navigation'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export default async function LeaderboardDailyPage() {
  const data = await fetchPeriodLeaderboard('daily')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="daily" initialData={data} />
}
