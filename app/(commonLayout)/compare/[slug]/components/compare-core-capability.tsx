import { cn } from '@/lib/utils'
import {
  compareToneFromParts,
  compareToneFromRatio,
  LEADERBOARD_CORE_CATEGORY_LABELS,
  LEADERBOARD_CORE_CATEGORY_ORDER
} from './compare-mappers'
import type { CompareSkillView, CompareTone } from './compare-types'

interface CompareCoreCapabilityProps {
  left: CompareSkillView
  right: CompareSkillView
}

const CORE_TONE_CLASS: Record<CompareTone, { fill: string; pill: string; text: string }> = {
  green: {
    fill: 'bg-[#22C55E]',
    pill: 'border-[#B8DFC9] bg-[#E6F4ED] text-[#1A6B3C]',
    text: 'text-[#1A6B3C]'
  },
  orange: {
    fill: 'bg-[#F59E0B]',
    pill: 'border-[#F6D860] bg-[#FEF3C7] text-[#92400E]',
    text: 'text-[#B45309]'
  },
  red: {
    fill: 'bg-[#EF4444]',
    pill: 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]',
    text: 'text-[#991B1B]'
  }
}

function percent(score: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)))
}

function CoreSummary({ skill, side }: { skill: CompareSkillView; side: 'left' | 'right' }) {
  const staticScore = skill.payload.static_score
  const pct = percent(staticScore.subtotal, staticScore.max)
  const tone = compareToneFromParts(staticScore.subtotal, staticScore.max)

  return (
    <div
      className={cn(
        'flex items-center gap-2.5',
        side === 'left' ? 'justify-start lg:justify-end' : 'justify-start'
      )}
    >
      {side === 'left' ? (
        <>
          <div className="h-[7px] w-full max-w-[180px] overflow-hidden rounded-full bg-[#E5E7EB] [transform:scaleX(-1)]">
            <div
              className={cn('h-full rounded-full', CORE_TONE_CLASS[tone].fill)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[14.5px] font-extrabold text-[#111111]">
            {staticScore.subtotal} / {staticScore.max}
          </span>
        </>
      ) : (
        <>
          <span className="font-mono text-[14.5px] font-extrabold text-[#111111]">
            {staticScore.subtotal} / {staticScore.max}
          </span>
          <div className="h-[7px] w-full max-w-[180px] overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className={cn('h-full rounded-full', CORE_TONE_CLASS[tone].fill)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function CoreCategorySide({
  skill,
  categoryKey,
  side
}: {
  skill: CompareSkillView
  categoryKey: (typeof LEADERBOARD_CORE_CATEGORY_ORDER)[number]
  side: 'left' | 'right'
}) {
  const category = skill.payload.static_score.categories[categoryKey]
  const score = category?.score || 0
  const max = category?.max || 0
  const note = category?.note || ''
  const pct = percent(score, max)
  const tone = compareToneFromRatio(max > 0 ? score / max : 0)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1.5',
        side === 'left' ? 'items-start lg:items-end' : 'items-start'
      )}
    >
      {/* Mirror the left progress bar so it grows outward from the center line. */}
      <div
        className={cn(
          'flex w-full min-w-0 items-center gap-1.5 lg:gap-3',
          side === 'left' ? 'justify-start lg:justify-end' : 'justify-start'
        )}
      >
        {side === 'left' ? (
          <>
            <div className="h-[5.5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#E5E7EB] [transform:scaleX(-1)] lg:w-[120px] lg:flex-none">
              <div
                className={cn('h-full rounded-full', CORE_TONE_CLASS[tone].fill)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={cn(
                'w-[58px] shrink-0 rounded-[3px] border px-1.5 py-[2px] text-center font-mono text-[11px] font-bold lg:w-[62px]',
                CORE_TONE_CLASS[tone].pill
              )}
            >
              {score} / {max}
            </span>
            <span
              className={cn(
                'w-9 shrink-0 text-right text-[12.5px] font-bold lg:w-11',
                CORE_TONE_CLASS[tone].text
              )}
            >
              {pct}%
            </span>
          </>
        ) : (
          <>
            <span
              className={cn(
                'w-9 shrink-0 text-left text-[12.5px] font-bold lg:w-11',
                CORE_TONE_CLASS[tone].text
              )}
            >
              {pct}%
            </span>
            <span
              className={cn(
                'w-[58px] shrink-0 rounded-[3px] border px-1.5 py-[2px] text-center font-mono text-[11px] font-bold lg:w-[62px]',
                CORE_TONE_CLASS[tone].pill
              )}
            >
              {score} / {max}
            </span>
            <div className="h-[5.5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#E5E7EB] lg:w-[120px] lg:flex-none">
              <div
                className={cn('h-full rounded-full', CORE_TONE_CLASS[tone].fill)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>
      <p
        title={note}
        className={cn(
          'line-clamp-4 max-w-[300px] text-[11px] leading-[1.55] text-[#909090]',
          side === 'left' && 'lg:text-right'
        )}
      >
        {note}
      </p>
    </div>
  )
}

export function CompareCoreCapability({ left, right }: CompareCoreCapabilityProps) {
  return (
    <section className="mb-4 rounded-[3px] border border-[#E2E2E2] bg-white px-5 py-6 md:px-8">
      <div className="grid gap-3 border-b border-[#DCDCDC] pb-3 lg:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] lg:items-center lg:gap-4">
        <CoreSummary skill={left} side="left" />
        <h2 className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111] lg:text-center">
          Core Capability
        </h2>
        <CoreSummary skill={right} side="right" />
      </div>

      <div>
        {LEADERBOARD_CORE_CATEGORY_ORDER.map((categoryKey) => (
          <div
            key={categoryKey}
            className="grid gap-3 border-b border-[#F3F3F3] py-3.5 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] lg:gap-4"
          >
            <CoreCategorySide skill={left} categoryKey={categoryKey} side="left" />
            <div className="flex items-start justify-start pt-[3px] lg:justify-center">
              <span className="text-left text-[11px] font-semibold leading-[1.4] text-[#555555] lg:text-center">
                {LEADERBOARD_CORE_CATEGORY_LABELS[categoryKey]}
              </span>
            </div>
            <CoreCategorySide skill={right} categoryKey={categoryKey} side="right" />
          </div>
        ))}
      </div>
    </section>
  )
}
