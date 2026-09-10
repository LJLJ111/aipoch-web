
import { redirect } from 'next/navigation'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export default async function LeaderboardWeeklyPage() {
  const data = await fetchPeriodLeaderboard('weekly')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="weekly" initialData={data} />
}
