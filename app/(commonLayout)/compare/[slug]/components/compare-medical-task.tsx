import { cn } from '@/lib/utils'
import type { LeaderboardDynamicInput } from '@/app/(commonLayout)/leaderboard/items/[slug]/components/leaderboard-evaluation'
import { type MedicalTone, medicalToneFromScore } from '@/lib/evaluation-styles'
import { buildDescriptionTitle } from './compare-mappers'
import type { CompareSkillView } from './compare-types'

interface CompareMedicalTaskProps {
  left: CompareSkillView
  right: CompareSkillView
}

const MEDICAL_TONE_CLASS: Record<MedicalTone, { edge: string; fill: string; text: string }> = {
  green: {
    edge: '#22C55E',
    fill: 'bg-[#22C55E]',
    text: 'text-[#1A6B3C]'
  },
  orange: {
    edge: '#F59E0B',
    fill: 'bg-[#F59E0B]',
    text: 'text-[#B45309]'
  },
  red: {
    edge: '#EF4444',
    fill: 'bg-[#EF4444]',
    text: 'text-[#991B1B]'
  }
}

function inputLabel(input: LeaderboardDynamicInput, index: number): string {
  return input.type?.trim() || `Input ${index + 1}`
}

function assertionMark(input: LeaderboardDynamicInput): string {
  return input.assertions_passed >= input.assertions_total ? '✓' : '△'
}

function MedicalHeaderSide({ skill, side }: { skill: CompareSkillView; side: 'left' | 'right' }) {
  const dynamicScore = skill.payload.dynamic_score

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2.5',
        side === 'left' ? 'justify-start lg:justify-end' : 'justify-start'
      )}
    >
      {side === 'left' ? (
        <>
          <span className="font-mono text-[13px] font-bold text-[#111111]">
            {dynamicScore.assertion_pass_rate.passed} / {dynamicScore.assertion_pass_rate.total}{' '}
            Passed
          </span>
          <InputSquares inputs={dynamicScore.inputs} side={side} />
        </>
      ) : (
        <>
          <InputSquares inputs={dynamicScore.inputs} side={side} />
          <span className="font-mono text-[13px] font-bold text-[#111111]">
            {dynamicScore.assertion_pass_rate.passed} / {dynamicScore.assertion_pass_rate.total}{' '}
            Passed
          </span>
        </>
      )}
    </div>
  )
}

function InputSquares({
  inputs,
  side
}: {
  inputs: LeaderboardDynamicInput[]
  side: 'left' | 'right'
}) {
  return (
    <div className={cn('flex gap-1', side === 'left' && 'flex-row-reverse')}>
      {inputs.map((input, index) => {
        const tone = medicalToneFromScore(input.total)

        return (
          <span
            key={`${input.label}-${index}`}
            title={`${inputLabel(input, index)}: ${input.assertions_passed}/${input.assertions_total} ${assertionMark(input)}`}
            className={cn('size-[18px] shrink-0 rounded-[2px]', MEDICAL_TONE_CLASS[tone].fill)}
          />
        )
      })}
    </div>
  )
}

function ScoreBlock({
  input,
  index,
  side
}: {
  input: LeaderboardDynamicInput
  index: number
  side: 'left' | 'right'
}) {
  const tone = medicalToneFromScore(input.total)
  const typeLabel = input.type?.trim()
  const inputIndexLabel = `Input ${index + 1}`

  return (
    <div
      className={cn(
        'flex w-[72px] shrink-0 self-stretch overflow-hidden border-[#E2E2E2] px-1.5 py-2.5',
        'flex-col items-center justify-center gap-[2px]',
        side === 'left' ? 'border-l' : 'border-r',
        MEDICAL_TONE_CLASS[tone].text
      )}
    >
      <span className="font-mono text-[24px] font-extrabold leading-none">{input.total}</span>
      <div className="flex max-w-full flex-col items-center gap-[1px] text-center text-[8px] font-bold uppercase leading-[1.15] tracking-[0.06em]">
        {typeLabel ? (
          <span title={typeLabel} className="line-clamp-2 max-w-full break-words">
            {typeLabel}
          </span>
        ) : null}
        <span className="max-w-full break-words">{inputIndexLabel}</span>
      </div>
      <span className="mt-0.5 font-mono text-[10.5px] font-bold tracking-[0.03em]">
        {input.assertions_passed}/{input.assertions_total} {assertionMark(input)}
      </span>
    </div>
  )
}

function MedicalInputCard({
  input,
  index,
  side,
  className
}: {
  input: LeaderboardDynamicInput
  index: number
  side: 'left' | 'right'
  className?: string
}) {
  const description = buildDescriptionTitle(input.label, input.note)
  const tone = medicalToneFromScore(input.total)

  return (
    <div className={cn('flex min-h-20 min-w-0 items-stretch', className)}>
      {/* Use text|score on the left and score|text on the right, keeping the thick colored border at the center. */}
      <div
        className={cn(
          'flex h-full w-full overflow-hidden rounded-[3px] border border-[#E2E2E2] bg-white',
          side === 'left' ? 'flex-row border-r-[3px]' : 'flex-row border-l-[3px]'
        )}
        style={
          side === 'left'
            ? { borderRightColor: MEDICAL_TONE_CLASS[tone].edge }
            : { borderLeftColor: MEDICAL_TONE_CLASS[tone].edge }
        }
      >
        {side === 'right' ? <ScoreBlock input={input} index={index} side={side} /> : null}
        <div className="min-w-0 flex-1 px-4 py-3.5">
          <p
            title={description}
            className={cn(
              'line-clamp-4 text-[11.5px] leading-[1.6] text-[#555555]',
              side === 'left' && 'lg:text-right'
            )}
          >
            {description}
          </p>
        </div>
        {side === 'left' ? <ScoreBlock input={input} index={index} side={side} /> : null}
      </div>
    </div>
  )
}

function MedicalInputPlaceholder({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('hidden min-h-20 min-w-0 lg:block', className)}>
      <div className="h-full rounded-[3px] border border-transparent" />
    </div>
  )
}

export function CompareMedicalTask({ left, right }: CompareMedicalTaskProps) {
  const leftInputs = left.payload.dynamic_score.inputs
  const rightInputs = right.payload.dynamic_score.inputs
  const maxRows = Math.max(leftInputs.length, rightInputs.length)

  return (
    <section className="rounded-[3px] border border-[#E2E2E2] bg-white px-5 py-6 md:px-8">
      <div className="grid gap-3 border-b border-[#DCDCDC] pb-3 lg:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] lg:items-center lg:gap-4">
        <MedicalHeaderSide skill={left} side="left" />
        <h2 className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111] lg:text-center">
          Medical Task
        </h2>
        <MedicalHeaderSide skill={right} side="right" />
      </div>

      <div className="flex flex-col gap-5 py-5">
        {Array.from({ length: maxRows }, (_, index) => {
          const leftInput = leftInputs[index]
          const rightInput = rightInputs[index]

          return (
            // On desktop, align matching input indices in the same grid row so both cards share a height.
            <div
              key={`medical-row-${index}`}
              className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-0"
            >
              {leftInput ? (
                <MedicalInputCard input={leftInput} index={index} side="left" className="lg:pr-5" />
              ) : (
                <MedicalInputPlaceholder className="lg:pr-5" />
              )}
              <div aria-hidden="true" className="hidden bg-[#E2E2E2] lg:block" />
              {rightInput ? (
                <MedicalInputCard
                  input={rightInput}
                  index={index}
                  side="right"
                  className="lg:pl-5"
                />
              ) : (
                <MedicalInputPlaceholder className="lg:pl-5" />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
