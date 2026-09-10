'use client'

/**
 * Client for daily, weekly, and monthly leaderboards (/leaderboard/daily|weekly|monthly).
 * Charts and list.
 */
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { LeaderboardPeriodCharts } from './leaderboard-period-charts'
import { LeaderboardPeriodList } from './leaderboard-period-list'
import { LeaderboardHero, LeaderboardToolbar } from '..'
import {
  fetchPeriodLeaderboardVisibility,
  leaderboardPeriodKeys,
  type LeaderboardPeriod,
  type PeriodLeaderboardData,
  type PeriodLeaderboardVisibility
} from '@/service/leaderboard-period'

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
}

type LeaderboardPeriodClientProps = {
  period: LeaderboardPeriod
  /** Fetched by the Server Component for the corresponding route. */
  initialData: PeriodLeaderboardData
}

function firstVisiblePeriod(v: PeriodLeaderboardVisibility): LeaderboardPeriod | null {
  if (v.daily) return 'daily'
  if (v.weekly) return 'weekly'
  if (v.monthly) return 'monthly'
  return null
}

function isPeriodVisible(period: LeaderboardPeriod, v: PeriodLeaderboardVisibility): boolean {
  if (period === 'daily') return v.daily
  if (period === 'weekly') return v.weekly
  return v.monthly
}

function numOrDash(v: number | null | undefined): number | '—' {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return Math.round(Number(v))
}

/** Periodic leaderboard shell: hero with two statistics, toolbar, charts, and the full list. */
export function LeaderboardPeriodClient({ period: periodFromPath, initialData }: LeaderboardPeriodClientProps) {
  const router = useRouter()

  const visibilityQuery = useQuery({
    queryKey: leaderboardPeriodKeys.visibility(),
    queryFn: fetchPeriodLeaderboardVisibility,
    staleTime: 5 * 60 * 1000
  })
  const visibility = visibilityQuery.data

  useEffect(() => {
    if (visibilityQuery.isLoading || !visibility) return
    if (firstVisiblePeriod(visibility) == null) {
      router.replace('/leaderboard')
      return
    }
    if (!isPeriodVisible(periodFromPath, visibility)) {
      router.replace('/leaderboard')
    }
  }, [visibilityQuery.isLoading, visibility, periodFromPath, router])

  const headerStats = useMemo(
    () => ({
      total: '—' as const,
      top: numOrDash(initialData.stats.max_score),
      avg: numOrDash(initialData.stats.avg_score)
    }),
    [initialData.stats.avg_score, initialData.stats.max_score]
  )

  const label = PERIOD_LABEL[periodFromPath]
  const chartHeading = `Rankings — ${label}`
  const listHeading = `${label} — Full List`

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#E9E9E9] text-[#111111] antialiased">
      {/* Hero banner uses the overall leaderboard title and description, with two statistics columns. */}
      <LeaderboardHero statsLayout="two" headerStats={headerStats} />

      <div className="sticky top-[73px] z-40 bg-[#E9E9E9]">
        {/* Toolbar with API-controlled Daily/Weekly/Monthly tabs. */}
        <LeaderboardToolbar
          active={periodFromPath}
          visibility={visibility}
          visibilityLoading={visibilityQuery.isLoading}
        />
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-7 sm:px-8 md:px-10 md:pb-20">
        {visibilityQuery.isError ? (
          <p className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Failed to load period settings. Please try again later.
          </p>
        ) : null}

        <div className="mb-6 border-b border-[#DCDCDC] pb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#909090]">
          {chartHeading}
        </div>

        {/* Charts: Top 20 bars and a scatter plot, with color thresholds of 75 and 45. */}
        <LeaderboardPeriodCharts items={initialData.items} avgScore={initialData.stats.avg_score} />

        {/* List: header, data rows, and empty state. */}
        <div className="mb-3 mt-6 border-b border-[#DCDCDC] pb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#909090]">
          {listHeading}
        </div>
        {initialData.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#909090]">No entries for this period yet.</p>
        ) : (
          <LeaderboardPeriodList items={initialData.items} />
        )}
      </div>
    </div>
  )
}
