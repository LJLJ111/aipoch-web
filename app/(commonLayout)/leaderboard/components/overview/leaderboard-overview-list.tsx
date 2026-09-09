import type { CSSProperties, ReactNode, RefObject } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Download, Eye } from 'lucide-react'
import type { OverallLeaderboardItem, OverallLeaderboardPagination } from '@/service/leaderboard-overall'
import { getLeaderboardSkillDisplayName } from '@/service/leaderboard-overall'
import {
  LeaderboardRankCell,
  LeaderboardRowChevronEnd,
  LeaderboardScoreMetricColumn,
  LeaderboardSkillMetaCell,
  LeaderboardTotalScoreCircle
} from '../shared/leaderboard-list-row-parts'

type Summary = {
  maxScore: number | '—'
  minScore: number | '—'
  avgTotal: string
  avgCore: string
  avgMed: string
  top1Name: string
}

type LeaderboardSummaryCardsProps = { summary: Summary }

const leaderboardSummaryStatCardRoot =
  'rounded-none border border-[#E2E2E2] bg-white px-5 py-4'
const leaderboardSummaryStatLabel =
  'mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]'
const leaderboardSummaryStatValue =
  'text-[28px] font-extrabold leading-none tracking-tight text-[#111111]'
const leaderboardSummaryStatFooter = 'mt-1 text-[11px] text-[#909090]'

/** A single summary card, such as Highest or Avg, used only within LeaderboardSummaryCards. */
function LeaderboardSummaryStatCard({
  title,
  value,
  footer,
  className,
  footerClassName,
}: {
  title: string
  value: ReactNode
  footer: ReactNode
  className?: string
  footerClassName?: string
}) {
  return (
    <div className={cn(leaderboardSummaryStatCardRoot, className)}>
      <div className={leaderboardSummaryStatLabel}>{title}</div>
      <div className={leaderboardSummaryStatValue}>{value}</div>
      <div className={footerClassName ?? leaderboardSummaryStatFooter}>{footer}</div>
    </div>
  )
}

/** Overall leaderboard summary above the list: highest and average scores, Core/Med weights, and score ranges. */
export function LeaderboardSummaryCards({ summary }: LeaderboardSummaryCardsProps) {
  const hasRange =
    typeof summary.maxScore === 'number' && typeof summary.minScore === 'number'

  return (
    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <LeaderboardSummaryStatCard
        title="Highest Score"
        value={summary.maxScore}
        footer={summary.top1Name}
        footerClassName={cn(leaderboardSummaryStatFooter, 'truncate')}
      />
      <LeaderboardSummaryStatCard
        title="Avg Total Score"
        value={summary.avgTotal}
        footer="overall average"
      />
      <LeaderboardSummaryStatCard
        title="Avg Core Cap."
        value={summary.avgCore}
        footer="out of 100 (40% weight)"
      />
      <LeaderboardSummaryStatCard
        title="Avg Med. Task"
        value={summary.avgMed}
        footer="out of 100 (60% weight)"
      />
      <LeaderboardSummaryStatCard
        title="Score Range"
        value={hasRange ? `${summary.minScore}–${summary.maxScore}` : '—'}
        footer={hasRange ? `min ${summary.minScore} / max ${summary.maxScore}` : ''}
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  )
}

/** Overall leaderboard columns: rank, total score ring, skill, Core bar, Med bar, views/downloads, and arrow. */
const leaderboardListRowGridClass =
  'grid grid-cols-[44px_64px_minmax(0,1fr)_155px_155px_88px_28px] items-center gap-x-4 overflow-hidden rounded-none border border-[#E2E2E2] bg-white px-5 py-3'

const skeletonMuted = 'rounded-none bg-black/5'

/** Loading skeleton row with the same column widths as LeaderboardRow. */
function LeaderboardSkeletonRow() {
  return (
    <div className={leaderboardListRowGridClass} aria-hidden>
      <div className="flex justify-center">
        <Skeleton className={cn('h-4 w-7', skeletonMuted)} />
      </div>
      <div className="flex justify-center">
        <Skeleton className={cn('size-[50px] shrink-0 rounded-full', skeletonMuted)} />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className={cn('h-4 w-[min(100%,220px)] max-w-full', skeletonMuted)} />
        <div className="flex flex-wrap gap-2">
          <Skeleton className={cn('h-5 w-16', skeletonMuted)} />
          <Skeleton className={cn('h-4 w-24', skeletonMuted)} />
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col justify-center gap-2">
        <Skeleton className={cn('h-3 w-20', skeletonMuted)} />
        <Skeleton className={cn('h-1.5 w-full rounded-full', skeletonMuted)} />
      </div>
      <div className="flex w-full min-w-0 flex-col justify-center gap-2">
        <Skeleton className={cn('h-3 w-20', skeletonMuted)} />
        <Skeleton className={cn('h-1.5 w-full rounded-full', skeletonMuted)} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className={cn('h-3 w-9', skeletonMuted)} />
        <Skeleton className={cn('h-3 w-9', skeletonMuted)} />
      </div>
      <div className="flex justify-center">
        <Skeleton className={cn('size-7 rounded-none', skeletonMuted)} />
      </div>
    </div>
  )
}

/** Multiple skeleton rows for the initial load or loading more items. */
function LeaderboardSkeletonRows({ count, idPrefix }: { count: number; idPrefix: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <LeaderboardSkeletonRow key={`${idPrefix}-${i}`} />
      ))}
    </>
  )
}

/**
 * Overall leaderboard row: a gold border and pale yellow gradient highlight the Top 10; cells come from leaderboard-list-row-parts.
 * Only the overall leaderboard includes the Stats column for views and downloads.
 */
function LeaderboardRow({
  item,
  hrefForItem
}: {
  item: OverallLeaderboardItem
  hrefForItem: (item: OverallLeaderboardItem) => string
}) {
  const isTop10 = item.rank <= 10
  const t = isTop10 ? (11 - item.rank) / 10 : 0
  const bgOpacity = t * 0.05
  const accentOpacity = 0.15 + t * 0.25
  const displayName = getLeaderboardSkillDisplayName(item)
  const views = item.stats?.views ?? 0
  const downloads = item.stats?.downloads ?? 0
  const top10Style: CSSProperties | undefined = isTop10
    ? {
        boxShadow: `inset 3px 0 0 rgba(233, 213, 83, ${accentOpacity})`
      }
    : undefined

  const rowHref = hrefForItem(item)

  return (
    <Link
      href={rowHref}
      title="View skill"
      className={cn(
        leaderboardListRowGridClass,
        'relative text-inherit no-underline transition-[border-color,box-shadow] hover:border-[#BBBBBB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]'
      )}
      style={top10Style}
    >
      {isTop10 ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-none"
          style={{
            background: `linear-gradient(105deg, rgba(233, 213, 83, ${bgOpacity}) 0%, rgba(233, 213, 83, ${bgOpacity * 0.35}) 45%, transparent 82%)`
          }}
        />
      ) : null}

      <LeaderboardRankCell rank={item.rank} />
      <LeaderboardTotalScoreCircle totalScore={item.total_score} />
      <LeaderboardSkillMetaCell title={displayName} category={item.category} author={item.author} />
      <LeaderboardScoreMetricColumn
        label="Core Cap."
        score={item.core_score}
        valueDisplay={item.core_score}
      />
      <LeaderboardScoreMetricColumn
        label="Med. Task"
        score={item.medical_score}
        valueDisplay={item.medical_score.toFixed(1)}
      />

      <div className="relative z-[1] flex w-full min-w-0 flex-col items-end justify-center gap-1">
        <div className="flex w-full items-center justify-end gap-1.5 text-[11.5px] text-[#909090]">
          <Eye className="size-[11px] shrink-0" strokeWidth={1.8} aria-hidden />
          <span className="min-w-[28px] text-right text-xs font-semibold tabular-nums text-[#555555]">{views}</span>
        </div>
        <div className="flex w-full items-center justify-end gap-1.5 text-[11.5px] text-[#909090]">
          <Download className="size-[11px] shrink-0" strokeWidth={1.8} aria-hidden />
          <span className="min-w-[28px] text-right text-xs font-semibold tabular-nums text-[#555555]">{downloads}</span>
        </div>
      </div>

      <LeaderboardRowChevronEnd />
    </Link>
  )
}

type LeaderboardListProps = {
  listError: boolean
  listLoading: boolean
  items: OverallLeaderboardItem[]
  firstPagePagination: OverallLeaderboardPagination | undefined
  hasNextPage: boolean
  isFetchingNextPage: boolean
  loadMoreRef: RefObject<HTMLDivElement | null>
  hrefForItem: (item: OverallLeaderboardItem) => string
}

/** Overall leaderboard table: header, data rows, loadMoreRef placeholder, and loaded item count. */
export function LeaderboardList({
  listError,
  listLoading,
  items,
  firstPagePagination,
  hasNextPage,
  isFetchingNextPage,
  loadMoreRef,
  hrefForItem
}: LeaderboardListProps) {
  return (
    <>
      {listError ? (
        <p className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load. Check your connection or try again later.
        </p>
      ) : null}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="mb-1 grid grid-cols-[44px_64px_minmax(0,1fr)_155px_155px_88px_28px] items-center gap-x-4 border-b-2 border-[#DCDCDC] px-5 pb-2">
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Rank</div>
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Score</div>
            <div className="min-w-0 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">
              Skill
            </div>
            <div className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">
              Core Capability (40%)
            </div>
            <div className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">
              Medical Task (60%)
            </div>
            <div className="text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Stats</div>
            <div className="shrink-0" aria-hidden />
          </div>

          <div
            className="relative flex min-h-[120px] flex-col gap-1"
            aria-busy={listLoading || isFetchingNextPage}
          >
            {listLoading ? (
              <>
                <span className="sr-only">Loading leaderboard</span>
                <LeaderboardSkeletonRows count={8} idPrefix="lb-initial" />
              </>
            ) : items.length === 0 ? (
              <div className="py-14 text-center text-sm text-[#909090]">
                <strong className="mb-1.5 block text-base font-bold text-[#555555]">No results found</strong>
                Try adjusting your filters or search query.
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <LeaderboardRow key={`${item.skill_name}-${item.rank}`} item={item} hrefForItem={hrefForItem} />
                ))}
                {isFetchingNextPage ? (
                  <>
                    <span className="sr-only">Loading more results</span>
                    <LeaderboardSkeletonRows count={3} idPrefix="lb-more" />
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 text-sm text-[#555555]">
          <p className="text-center text-xs text-[#909090]">
            {firstPagePagination ? `Loaded ${items.length} / ${firstPagePagination.total_count}` : null}
          </p>
          {isFetchingNextPage ? (
            <p className="text-xs text-[#909090]">Loading more…</p>
          ) : !hasNextPage ? (
            <p className="text-xs text-[#909090]">All results loaded</p>
          ) : null}
          <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
        </div>
      ) : null}
    </>
  )
}
