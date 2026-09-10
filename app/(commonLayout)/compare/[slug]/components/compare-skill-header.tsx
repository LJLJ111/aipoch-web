import { cn } from '@/lib/utils'
import { buildDescriptionTitle, compareToneFromParts } from './compare-mappers'
import type { CompareSkillView, CompareTone } from './compare-types'

interface CompareSkillHeaderProps {
  left: CompareSkillView
  right: CompareSkillView
}

const SCORE_TONE_CLASS: Record<CompareTone, string> = {
  green: 'border-[#B8DFC9] bg-[#E6F4ED] text-[#1A6B3C]',
  orange: 'border-[#F6D860] bg-[#FEF3C7] text-[#92400E]',
  red: 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]'
}

function categoryBadgeClass(category: string): string {
  return category.trim().toLowerCase() === 'other'
    ? 'border-[#D1D5DB] bg-[#F3F4F6] text-[#374151]'
    : 'border-[#C7D2F0] bg-[#F0F4FF] text-[#3B52A0]'
}

function ScoreCircle({ skill }: { skill: CompareSkillView }) {
  const tone = compareToneFromParts(skill.totalScore, skill.totalMax)

  return (
    <div
      className={cn(
        'flex size-[110px] shrink-0 flex-col items-center justify-center rounded-full border-[2.5px]',
        SCORE_TONE_CLASS[tone]
      )}
      title={`${skill.totalScore} / ${skill.totalMax}`}
    >
      <span className="font-mono text-[38px] font-extrabold leading-none tracking-[-1px]">
        {skill.totalScore}
      </span>
      <span className="my-1 h-px w-[30px] bg-current" />
      <span className="font-mono text-[12px] font-semibold leading-none">{skill.totalMax}</span>
    </div>
  )
}

function SkillPanel({ skill, side }: { skill: CompareSkillView; side: 'left' | 'right' }) {
  const description = buildDescriptionTitle(skill.description)

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col px-6 py-7 md:px-8',
        side === 'left' ? 'border-b border-[#E2E2E2] lg:border-r lg:border-b-0' : ''
      )}
    >
      {/* Mirror the right skill summary on desktop; keep both summaries left-aligned on mobile. */}
      <div
        className={cn(
          'mb-4 flex flex-col gap-5 sm:flex-row sm:items-center',
          side === 'right' && 'lg:flex-row-reverse'
        )}
      >
        <div className={cn('min-w-0 flex-1', side === 'right' && 'lg:text-right')}>
          <div
            className={cn(
              'mb-2.5 flex flex-wrap items-center gap-2',
              side === 'right' && 'lg:justify-end'
            )}
          >
            <span
              className={cn(
                'inline-flex rounded-[3px] border px-[9px] py-[3px] text-[10.5px] font-semibold tracking-[0.04em]',
                side === 'right' && 'lg:order-2',
                categoryBadgeClass(skill.category)
              )}
            >
              {skill.category}
            </span>
            <span
              className={cn(
                'text-[11px] font-medium text-[#909090]',
                side === 'right' && 'lg:order-1'
              )}
            >
              {skill.author}
            </span>
          </div>
          <h2 className="break-words text-[22px] font-bold leading-[1.25] tracking-[-0.4px] text-[#111111]">
            {skill.name}
          </h2>
        </div>
        <ScoreCircle skill={skill} />
      </div>

      <p
        title={description}
        className={cn(
          'line-clamp-4 text-[12.5px] leading-[1.65] text-[#555555]',
          side === 'right' && 'lg:text-right'
        )}
      >
        {description}
      </p>
    </section>
  )
}

export function CompareSkillHeader({ left, right }: CompareSkillHeaderProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-[3px] border border-[#E2E2E2] bg-white lg:grid lg:grid-cols-2">
      <SkillPanel skill={left} side="left" />
      <SkillPanel skill={right} side="right" />
    </div>
  )
}
