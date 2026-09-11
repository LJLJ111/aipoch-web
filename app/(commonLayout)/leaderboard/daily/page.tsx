import { redirect } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export const metadata = createPageMetadata({
  title: 'Daily Leaderboard | AIPOCH',
  description: 'Daily rankings for audited medical research agent skills.',
  canonical: `${SITE_DOMAIN}/leaderboard/daily`
})

export default async function LeaderboardDailyPage() {
  const data = await fetchPeriodLeaderboard('daily')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="daily" initialData={data} />
}
