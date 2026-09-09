/**
 * Shared exports for the leaderboard UI:
 * - Utilities: isAnyFilterActive and skillHref.
 * - shared: hero/toolbar, row elements, and colors.
 * - overview: overall leaderboard filters, summary, and list.
 * - period: periodic leaderboard charts, list, and page shell.
 */
import type { OverallLeaderboardItem } from '@/service/leaderboard-overall'

/** Check whether any filter or search query is active for the indicator on the Filters button. */
export function isAnyFilterActive(
  hasCategoryFilter: boolean,
  q: string,
  ...rest: string[]
): boolean {
  if (hasCategoryFilter || q.trim()) return true
  return rest.some((v) => v.length > 0)
}

/** Resolve the destination for an overall leaderboard row. */
export function skillHref(item: OverallLeaderboardItem) {
  const slug = item.local_skill_slug?.trim() || item.skill_name
  return `/leaderboard/items/${encodeURIComponent(slug)}`
}

export { LeaderboardHero, LeaderboardToolbar, leaderboardTabLinkClass } from './shared/leaderboard-hero-toolbar'
export { LeaderboardFiltersPanel } from './overview/leaderboard-filters-panel'
export { LeaderboardSummaryCards, LeaderboardList } from './overview/leaderboard-overview-list'
