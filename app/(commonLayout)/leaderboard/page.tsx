/** Overall /leaderboard: fetch the initial list and statistics on the server, then pass them to LeaderboardClient. */
import {
  buildOverallLeaderboardParams,
  DEFAULT_LEADERBOARD_FILTERS,
  fetchOverallLeaderboardServer,
  fetchOverallLeaderboardStatsServer,
  LEADERBOARD_PAGE_SIZE
} from '@/service/leaderboard-overall'
import { LeaderboardClient } from './components/overview/leaderboard-client'

export default async function LeaderboardPage() {
  const [initialPageData, initialStats] = await Promise.all([
    fetchOverallLeaderboardServer(
      buildOverallLeaderboardParams({
        ...DEFAULT_LEADERBOARD_FILTERS,
        page: 1,
        pageSize: LEADERBOARD_PAGE_SIZE
      })
    ),
    fetchOverallLeaderboardStatsServer()
  ])

  return <LeaderboardClient initialPageData={initialPageData} initialStats={initialStats} />
}
