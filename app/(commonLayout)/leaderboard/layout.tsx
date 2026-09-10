import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { defaultLeaderboardSubtitle } from './components/shared/leaderboard-hero-toolbar'

/** Match the title and subtitle in the page's LeaderboardHero. */
export const metadata = createPageMetadata({
  title: 'Leaderboard',
  description: defaultLeaderboardSubtitle,
  canonical: `${SITE_DOMAIN}/leaderboard`
})

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
