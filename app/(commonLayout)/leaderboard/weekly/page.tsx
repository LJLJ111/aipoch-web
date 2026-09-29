import { redirect } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export const metadata = createPageMetadata({
  title: 'Weekly Leaderboard | AIPOCH',
  description: 'Weekly rankings for audited medical research agent skills.',
  canonical: `${SITE_DOMAIN}/leaderboard/weekly`
})

export default async function LeaderboardWeeklyPage() {
  const data = await fetchPeriodLeaderboard('weekly')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="weekly" initialData={data} />
}
