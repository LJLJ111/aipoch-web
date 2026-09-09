'use client'

/**
 * Full periodic leaderboard list, with fewer columns than the overall leaderboard because Stats is omitted.
 */
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PeriodLeaderboardApiItem } from '@/service/leaderboard-period'
import { getLeaderboardSkillDisplayName, type OverallLeaderboardItem } from '@/service/leaderboard-overall'
import {
  LeaderboardRankCell,
  LeaderboardRowChevronEnd,
  LeaderboardScoreMetricColumn,
  LeaderboardSkillMetaCell,
  LeaderboardTotalScoreCircle
} from '../shared/leaderboard-list-row-parts'


const periodRowGrid =
  'grid grid-cols-[44px_64px_minmax(0,1fr)_150px_150px_28px] items-center gap-x-4 overflow-hidden rounded-none border border-[#E2E2E2] bg-white px-5 py-3'


function asOverallItem(item: PeriodLeaderboardApiItem): OverallLeaderboardItem {
  return {
    rank: item.rank,
    skill_name: item.skill_name,
    skill_title: item.skill_title ?? undefined,
    category: item.category,
    author: item.author,
    total_score: item.total_score,
    core_score: item.core_score,
    medical_score: item.medical_score
  }
}

function hrefForPeriodItem(item: PeriodLeaderboardApiItem) {
  const slug = item.result_path?.trim() || item.skill_name
  return `/leaderboard/items/${encodeURIComponent(slug)}`
}


function PeriodLeaderboardRow({ item }: { item: PeriodLeaderboardApiItem }) {
  const o = asOverallItem(item)
  const isTop10 = item.rank <= 10
  const t = isTop10 ? (11 - item.rank) / 10 : 0
  const bgOpacity = t * 0.05
  const accentOpacity = 0.15 + t * 0.25
  const displayName = getLeaderboardSkillDisplayName(o)

  const top10Style: CSSProperties | undefined = isTop10
    ? { boxShadow: `inset 3px 0 0 rgba(233, 213, 83, ${accentOpacity})` }
    : undefined

  const rowHref = hrefForPeriodItem(item)

  return (
    <Link
      href={rowHref}
      title="View skill"
      className={cn(
        periodRowGrid,
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
        label="Core"
        score={item.core_score}
        valueDisplay={item.core_score}
        visibility="md-up"
      />
      <LeaderboardScoreMetricColumn
        label="Medical"
        score={item.medical_score}
        valueDisplay={item.medical_score.toFixed(1)}
        visibility="md-up"
      />
      <LeaderboardRowChevronEnd />
    </Link>
  )
}

type LeaderboardPeriodListProps = {
  items: PeriodLeaderboardApiItem[]
}

/** Table header followed by PeriodLeaderboardRow entries. */
export function LeaderboardPeriodList({ items }: LeaderboardPeriodListProps) {
  return (
    <div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 hidden grid-cols-[44px_64px_minmax(0,1fr)_150px_150px_28px] gap-x-4 border-b-2 border-[#DCDCDC] px-5 pb-2 md:grid">
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Rank</div>
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Score</div>
            <div className="min-w-0 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">
              Skill
            </div>
            <div className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">Core Cap.</div>
            <div className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#909090]">
              Medical Task
            </div>
            <div className="shrink-0" aria-hidden />
          </div>
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <PeriodLeaderboardRow key={`${item.skill_name}-${item.rank}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
