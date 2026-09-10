import type { Metadata } from 'next'
import { defaultLeaderboardSubtitle } from './components/shared/leaderboard-hero-toolbar'

/** Match the title and subtitle in the page's LeaderboardHero. */
export const metadata: Metadata = {
  title: 'Leaderboard',
  description: defaultLeaderboardSubtitle
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
