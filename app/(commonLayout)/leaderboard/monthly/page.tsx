import { redirect } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchPeriodLeaderboard } from '@/service/leaderboard-period'
import { LeaderboardPeriodClient } from '../components/period/leaderboard-period-client'

export const metadata = createPageMetadata({
  title: 'Monthly Leaderboard | AIPOCH',
  description: 'Monthly rankings for audited medical research agent skills.',
  canonical: `${SITE_DOMAIN}/leaderboard/monthly`
})

export default async function LeaderboardMonthlyPage() {
  const data = await fetchPeriodLeaderboard('monthly')
  if (!data || !data.is_visible) {
    redirect('/leaderboard')
  }
  return <LeaderboardPeriodClient period="monthly" initialData={data} />
}
