'use client'

import { cn } from '@/lib/utils'
import { medicalScoreBadgeClass, medicalScoreSummarySquareClass } from '@/lib/evaluation-styles'
import { coreCapabilityBarStyle, scoreRatioBandFromParts } from '@/lib/score-ratio-bands'
import type { SkillEvaluation } from '@/types/skill-evaluation'
import { ScoreHero } from './score-hero'

export type { SkillEvaluation }

const staticHeaderFillClass = {
  green: 'bg-[#22C55E]',
  orange: 'bg-[#F59E0B]',
  red: 'bg-[#EF4444]'
} as const

/** A single Medical Task assertion: green for PASS, red otherwise. */
function isMedicalAssertionPass(result: string | undefined): boolean {
  return result?.trim().toUpperCase() === 'PASS'
}

type EvaluationPanels = {
  staticScore: number
  staticTotal: number
  staticPct: number
  staticHeaderTone: 'green' | 'orange' | 'red'
  coreRows: Array<{
    rowKey: string
    label: string
    score: number
    max: number
    widthPct: number
    fill: string
    text: string
  }>
  passedDisplay: number
  totalDisplay: number
  medicalRows: Array<{
    label: string
    score: number
    passed: number
    total: number
    assertions?: Array<{ result?: string }>
  }>
}

function buildEvaluationPanels(evaluation: SkillEvaluation): EvaluationPanels {
  const {
    staticScore,
    staticTotal,
    dynamicPassed,
    dynamicTotal,
    coreCategories: coreOverride,
    medicalTasks: medicalOverride
  } = evaluation

  const staticPct = staticTotal > 0 ? (staticScore / staticTotal) * 100 : 0
  const staticHeaderTone = scoreRatioBandFromParts(staticScore, staticTotal)

  const coreRows = (coreOverride ?? []).map((c, index) => {
    const ratio = c.max > 0 ? c.score / c.max : 0
    const rowKey = (c.key && String(c.key).trim()) || `core-${index}`
    return {
      rowKey,
      label: c.label,
      score: c.score,
      max: c.max,
      ...coreCapabilityBarStyle(ratio)
    }
  })

  const passedDisplay = dynamicPassed ?? 0
  const totalDisplay = dynamicTotal ?? 0

  const medicalRows = medicalOverride ?? []

  return {
    staticScore,
    staticTotal,
    staticPct,
    staticHeaderTone,
    coreRows,
    passedDisplay,
    totalDisplay,
    medicalRows
  }
}

function CoreCapabilityPanel({
  p,
  className
}: {
  p: EvaluationPanels
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[13px] font-bold text-[#111111]">Core Capability</div>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="whitespace-nowrap text-[12.5px] font-bold text-[#111111]">
            {Number.isInteger(p.staticScore) ? p.staticScore : p.staticScore.toFixed(1)} /{' '}
            {p.staticTotal}
          </span>
          <div className="h-1.5 w-[110px] shrink-0 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div
              className={cn('h-full rounded-full', staticHeaderFillClass[p.staticHeaderTone])}
              style={{ width: `${Math.min(100, p.staticPct)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[7px]">
        {p.coreRows.map((row) => (
          <div
            key={row.rowKey}
            className="rounded-[3px] border border-[#E2E2E2] bg-white px-[11px] py-[9px]"
          >
            <div className="mb-1.5 text-[10px] font-semibold text-[#555555]">{row.label}</div>
            <div className="mb-[5px] h-1 overflow-hidden rounded-[3px] bg-[#EEEEEE]">
              <div
                className="h-full rounded-[3px]"
                style={{ width: `${row.widthPct}%`, background: row.fill }}
              />
            </div>
            <div className="text-[11px] font-bold" style={{ color: row.text }}>
              {row.score} / {row.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MedicalTaskPanel({ p, className }: { p: EvaluationPanels; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] font-bold text-[#111111]">Medical Task</div>
        <div className="flex items-center gap-2.5">
          <span className="whitespace-nowrap text-[12.5px] font-bold text-[#111111]">
            {p.passedDisplay} / {p.totalDisplay} Passed
          </span>
          <div className="flex gap-1">
            {p.medicalRows.slice(0, 8).map((row, i) => (
              <span
                key={i}
                className={cn(
                  'h-[15px] w-[15px] shrink-0 rounded-[2px]',
                  medicalScoreSummarySquareClass(row.score)
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-[3px] border border-black/[0.07] bg-black/3 p-1.5">
        {p.medicalRows.map((row, idx) => (
          <div
            key={`${row.label}-${idx}`}
            className={cn(
              'flex min-h-0 flex-1 items-center justify-between gap-3 px-1 py-0',
              idx < p.medicalRows.length - 1 && 'border-b border-black/6'
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-[7px]">
              <span
                className={cn(
                  'flex h-[19px] w-7 shrink-0 items-center justify-center rounded-[3px] text-[10px] font-bold',
                  medicalScoreBadgeClass(row.score)
                )}
              >
                {row.score}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[10.5px] text-[#555555]"
                title={row.label}
              >
                {row.label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 pl-0.5">
              {(row.assertions && row.assertions.length > 0
                ? row.assertions
                : Array.from({ length: row.total }, (_, i) => ({
                    result: i < row.passed ? 'PASS' : 'FAIL'
                  }))
              ).map((item, i) => (
                <span
                  key={i}
                  className={cn(
                    'inline-block size-3 rounded-full transition-transform hover:scale-[1.3]',
                    isMedicalAssertionPass(item.result) ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                  )}
                />
              ))}
              <span className="ml-[3px] text-[9.5px] font-bold text-[#888888]">
                {row.passed}/{row.total}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const scoreWidgetCoreClassName =
  'min-w-0 flex-1 border-b border-[#E2E2E2] bg-white p-5 lg:border-b-0 lg:border-r lg:px-6 lg:py-5'

const scoreWidgetMedicalClassName = 'flex min-w-0 flex-1 flex-col bg-white p-5 lg:px-6 lg:py-5'

export interface EvaluationScoreWidgetProps {
  evaluation: SkillEvaluation
  /** `full` uses two columns; `core` and `medical` use one each within the skill page's three-column layout. */
  segment?: 'full' | 'core' | 'medical'
}

export function EvaluationScoreWidget({
  evaluation,
  segment = 'full'
}: EvaluationScoreWidgetProps) {
  const p = buildEvaluationPanels(evaluation)

  if (segment === 'core') {
    return <CoreCapabilityPanel p={p} className={scoreWidgetCoreClassName} />
  }

  if (segment === 'medical') {
    return <MedicalTaskPanel p={p} className={scoreWidgetMedicalClassName} />
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[3px] border border-[#E2E2E2] bg-white md:flex-row">
      <CoreCapabilityPanel
        p={p}
        className="min-w-0 flex-1 border-b border-[#E2E2E2] p-5 md:border-b-0 md:border-r md:px-6 md:py-5"
      />
      <MedicalTaskPanel p={p} className="flex min-w-0 flex-1 flex-col p-5 md:px-6 md:py-5" />
    </div>
  )
}

export interface EvaluationOverviewProps {
  evaluation: SkillEvaluation
  className?: string
}

export function EvaluationOverview({ evaluation, className }: EvaluationOverviewProps) {
  const { overallScore, overallTotal, evaluationReportUrl } = evaluation

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#E2E2E2] bg-white lg:flex-row lg:items-stretch',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 flex-col items-center justify-center border-b border-[#E2E2E2] px-5 py-6',
          'lg:w-[min(240px,22%)] lg:min-w-[200px] lg:border-b-0 lg:border-r'
        )}
      >
        <ScoreHero
          score={overallScore}
          total={overallTotal}
          evaluationReportUrl={evaluationReportUrl}
          className="justify-center"
        />
      </div>
      <EvaluationScoreWidget evaluation={evaluation} segment="core" />
      <EvaluationScoreWidget evaluation={evaluation} segment="medical" />
    </div>
  )
}
