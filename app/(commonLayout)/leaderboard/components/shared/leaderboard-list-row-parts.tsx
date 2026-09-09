/**
 * Shared row elements for overall and periodic leaderboards.
 */
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scoreTone, toneBar, toneCircle, toneText } from './leaderboard-row-tone'

/** Rank: medals for positions 1-3, then #n. */
export function LeaderboardRankCell({ rank }: { rank: number }) {
  return (
    <div className="relative z-[1] text-center">
      {rank <= 3 ? (
        <span className="text-lg leading-none" aria-hidden>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </span>
      ) : (
        <span className="text-[13px] font-bold tracking-tight text-[#909090]">#{rank}</span>
      )}
    </div>
  )
}

/** Total score ring. */
export function LeaderboardTotalScoreCircle({ totalScore }: { totalScore: number }) {
  const totalTone = scoreTone(totalScore)
  return (
    <div className="relative z-[1] flex justify-center">
      <div
        className={cn(
          'flex size-[50px] shrink-0 flex-col items-center justify-center rounded-full border-2',
          toneCircle[totalTone]
        )}
      >
        <span className={cn('text-[17px] font-extrabold leading-none tracking-tight', toneText[totalTone])}>
          {Number.isInteger(totalScore) ? totalScore : totalScore.toFixed(1)}
        </span>
        <span className={cn('mt-px text-[9px] font-semibold opacity-65', toneText[totalTone])}>/100</span>
      </div>
    </div>
  )
}

/** Skill name, category label, and author. */
export function LeaderboardSkillMetaCell({
  title,
  category,
  author
}: {
  title: string
  category: string
  author: string
}) {
  return (
    <div className="relative z-[1] flex min-w-0 flex-col justify-center gap-1">
      <div className="truncate text-sm font-bold leading-snug tracking-tight text-[#111111]" title={title}>
        {title}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap rounded-none border border-[#DCDCDC] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#909090]">
          {category}
        </span>
        <span className="text-[11px] font-medium text-[#909090]">{author}</span>
      </div>
    </div>
  )
}

type MetricVisibility = 'always' | 'md-up'

/**
 * Core/Med cells: label on the left, score on the right, and score bar below.
 */
export function LeaderboardScoreMetricColumn({
  label,
  score,
  valueDisplay,
  visibility = 'always'
}: {
  label: string
  score: number
  valueDisplay: ReactNode
  visibility?: MetricVisibility
}) {
  const tone = scoreTone(score)
  return (
    <div
      className={cn(
        'relative z-[1] w-full min-w-0 flex-col justify-center gap-1',
        visibility === 'md-up' ? 'hidden md:flex' : 'flex'
      )}
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#909090]">{label}</span>
        <span className={cn('shrink-0 text-[11px] font-bold tabular-nums tracking-tight', toneText[tone])}>
          {valueDisplay}
        </span>
      </div>
      <div className="h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-[#DCDCDC]">
        <div
          className={cn('h-full rounded-full', toneBar[tone])}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  )
}

const leaderboardRowChevronBaseClass =
  'relative z-[1] mx-auto flex size-7 shrink-0 items-center justify-center rounded-none border border-[#DCDCDC] text-[#909090] transition-colors'

const leaderboardRowChevronStandaloneHoverClass =
  'hover:border-[#111111] hover:bg-[#E9E9E9] hover:text-[#111111]'

/** Separate link at the end of the row. */
export function LeaderboardRowChevronLink({ href, title = 'View skill' }: { href: string; title?: string }) {
  return (
    <Link
      href={href}
      title={title}
      className={cn(leaderboardRowChevronBaseClass, leaderboardRowChevronStandaloneHoverClass)}
    >
      <ChevronRight className="size-[13px]" strokeWidth={1.8} />
    </Link>
  )
}

// Trailing row arrow.
export function LeaderboardRowChevronEnd() {
  return (
    <span
      className={cn(leaderboardRowChevronBaseClass, leaderboardRowChevronStandaloneHoverClass)}
      aria-hidden
    >
      <ChevronRight className="size-[13px]" strokeWidth={1.8} />
    </span>
  )
}
