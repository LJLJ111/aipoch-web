'use client'

/**
 * Periodic leaderboard charts (Recharts): Top 20 bars and a scatter plot, with color thresholds of 75 and 45.
 */
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { PeriodLeaderboardApiItem } from '@/service/leaderboard-period'
import { getLeaderboardSkillDisplayName, type OverallLeaderboardItem } from '@/service/leaderboard-overall'

/** Prefer skill_title, falling back to skill_name. */
function periodItemDisplayName(item: PeriodLeaderboardApiItem): string {
  return getLeaderboardSkillDisplayName({
    skill_name: item.skill_name,
    skill_title: item.skill_title ?? undefined
  } as OverallLeaderboardItem)
}

/** Truncate long titles on the bar chart's X axis.*/
function axisShortLabel(text: string, maxLen = 22): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`
}

function barColor(total: number): string {
  if (total >= 75) return 'rgba(34,197,94,0.78)'
  if (total >= 45) return 'rgba(245,158,11,0.75)'
  return 'rgba(239,68,68,0.75)'
}

function dotColor(total: number): { fill: string; stroke: string } {
  if (total >= 75) return { fill: 'rgba(34,197,94,0.82)', stroke: '#16a34a' }
  if (total >= 45) return { fill: 'rgba(245,158,11,0.82)', stroke: '#d97706' }
  return { fill: 'rgba(239,68,68,0.82)', stroke: '#b91c1c' }
}

type LeaderboardPeriodChartsProps = {
  items: PeriodLeaderboardApiItem[]
  avgScore: number | null
}

/** Display both charts side by side, stacking them on small screens. */
export function LeaderboardPeriodCharts({ items, avgScore }: LeaderboardPeriodChartsProps) {
  const barData = useMemo(
    () =>
      items.map((d) => {
        const full = periodItemDisplayName(d)
        return {
          name: axisShortLabel(full),
          total: d.total_score,
          fullName: full
        }
      }),
    [items]
  )

  const scatterData = useMemo(
    () =>
      items.map((d) => {
        const full = periodItemDisplayName(d)
        return {
          rank: d.rank,
          total: d.total_score,
          name: axisShortLabel(full),
          fullName: full
        }
      }),
    [items]
  )

  const yAxisRange = useMemo(() => {
    const totals = items.map((item) => item.total_score)
    if (avgScore != null) totals.push(avgScore)

    if (totals.length === 0) {
      return { min: 0, max: 100 }
    }

    const min = Math.max(0, Math.floor(Math.min(...totals) - 5))
    const max = Math.min(100, Math.ceil(Math.max(...totals) + 5))
    return {
      min,
      max: Math.max(min + 1, max)
    }
  }, [avgScore, items])

  const yAxisDomain = useMemo(
    (): [number, number] => [yAxisRange.min, yAxisRange.max],
    [yAxisRange.max, yAxisRange.min]
  )

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col rounded-none border border-[#E2E2E2] bg-white px-6 pb-4 pt-6">
        <div className="mb-4">
          <div className="mb-1 text-sm font-bold tracking-tight text-[#111111]">
            Top 20 Skills — Total Score
          </div>
          <div className="text-xs leading-relaxed text-[#909090]">Sorted high to low.</div>
        </div>
        <div className="relative min-h-[320px] w-full flex-1">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={barData}
              margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(220,220,220,0.7)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: '#777777' }}
                interval={0}
                angle={-40}
                textAnchor="end"
                height={92}
                tickLine={false}
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ fontSize: 10, fill: '#909090' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'Total Score',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 4,
                  style: { fill: '#909090', fontSize: 10 }
                }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as { total: number; fullName: string }
                  return (
                    <div className="rounded-none border border-[#E2E2E2] bg-white px-3 py-2 text-xs shadow-md">
                      <div className="font-semibold text-[#111111]">{p.fullName}</div>
                      <div className="text-[#555555]">Total: {p.total}</div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="total" radius={[2, 2, 0, 0]} maxBarSize={48}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={barColor(entry.total)} stroke="transparent" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3.5 text-[11px] text-[#555555]">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm bg-[rgba(34,197,94,0.78)]" />
            ≥ 75
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm bg-[rgba(245,158,11,0.75)]" />
            ≥ 45
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm bg-[rgba(239,68,68,0.75)]" />
            &lt; 45
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-none border border-[#E2E2E2] bg-white px-6 pb-4 pt-6">
        <div className="mb-4">
          <div className="mb-1 text-sm font-bold tracking-tight text-[#111111]">
            Score Distribution (Scatter)
          </div>
          <div className="text-xs leading-relaxed text-[#909090]">
            Each dot is a skill&apos;s total score. Dashed line = period average. Hover a dot for details.
          </div>
        </div>
        <div className="relative min-h-[320px] w-full flex-1">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 8, right: 64, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(220,220,220,0.7)" />
              <XAxis
                type="number"
                dataKey="rank"
                domain={[1, 20]}
                ticks={[1, 5, 9, 13, 17, 20]}
                tick={{ fontSize: 10, fill: '#909090' }}
                tickFormatter={(value: number) => `#${value}`}
                tickLine={false}
                axisLine={{ stroke: 'rgba(220,220,220,0.9)' }}
                label={{ value: 'Rank', position: 'bottom', offset: 0, style: { fill: '#909090', fontSize: 10 } }}
              />
              <YAxis
                type="number"
                dataKey="total"
                domain={yAxisDomain}
                tick={{ fontSize: 10, fill: '#909090' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(220,220,220,0.9)' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as {
                    rank: number
                    total: number
                    name: string
                    fullName: string
                  }
                  const col = dotColor(p.total)
                  return (
                    <div className="flex items-center gap-2.5 rounded-none border border-[#E2E2E2] bg-white py-1.5 pl-2 pr-3 text-xs shadow-md">
                      <div
                        className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-extrabold"
                        style={{ background: col.fill, borderColor: col.stroke, color: col.stroke }}
                      >
                        {p.total}
                      </div>
                      <span className="max-w-[220px] font-semibold leading-snug text-[#111111]">{p.fullName}</span>
                    </div>
                  )
                }}
              />
              {avgScore != null ? (
                <ReferenceLine
                  y={avgScore}
                  stroke="#909090"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: `avg ${avgScore.toFixed(1)}`,
                    position: 'right',
                    fill: '#909090',
                    fontSize: 9
                  }}
                />
              ) : null}
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((d, i) => {
                  const c = dotColor(d.total)
                  return <Cell key={`sc-${d.rank}-${i}`} fill={c.fill} stroke={c.stroke} />
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3.5 text-[11px] text-[#555555]">
          <span className="flex items-center gap-1.5">
            <svg width="22" height="10" className="shrink-0" aria-hidden>
              <circle cx="5" cy="5" r="4" fill="rgba(34,197,94,0.82)" stroke="#16a34a" strokeWidth="1.2" />
            </svg>
            ≥ 75
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="22" height="10" className="shrink-0" aria-hidden>
              <circle cx="5" cy="5" r="4" fill="rgba(245,158,11,0.82)" stroke="#d97706" strokeWidth="1.2" />
            </svg>
            ≥ 45
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="22" height="10" className="shrink-0" aria-hidden>
              <circle cx="5" cy="5" r="4" fill="rgba(239,68,68,0.82)" stroke="#b91c1c" strokeWidth="1.2" />
            </svg>
            &lt; 45
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="22" height="10" className="shrink-0" aria-hidden>
              <line x1="1" y1="5" x2="21" y2="5" stroke="#909090" strokeWidth="1.5" strokeDasharray="4,3" />
            </svg>
            Average
          </span>
        </div>
      </div>
    </div>
  )
}
