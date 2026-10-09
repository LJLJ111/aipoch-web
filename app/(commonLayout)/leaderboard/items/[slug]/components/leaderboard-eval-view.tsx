'use client'

import Link from 'next/link'
import { EvaluationScoreWidget } from '@/app/(commonLayout)/agent-skills/components/evaluation-overview'
import { ScoreHero } from '@/app/(commonLayout)/agent-skills/components/score-hero'
import {
  LEADERBOARD_CORE_CATEGORY_LABELS,
  LEADERBOARD_CORE_CATEGORY_ORDER,
  medicalToneFromScore
} from '@/lib/evaluation-styles'
import { MEDICAL_SCORE_GREEN_MIN, MEDICAL_SCORE_YELLOW_MIN } from '@/lib/map-score-detail'
import { scoreRatioBandFromParts } from '@/lib/score-ratio-bands'
import { cn } from '@/lib/utils'
import type { LeaderboardEvalViewProps } from './build-leaderboard-eval-props'
import { EvaluationStatusIcon } from './evaluation-status-icon'
import type { LeaderboardDynamicInput } from './leaderboard-evaluation'

const reportTones = {
  green: { fill: '#afd670', text: '#607a32', textClass: 'text-[#607a32]', bar: 'bg-[#607a32]' },
  orange: { fill: '#edb732', text: '#915600', textClass: 'text-[#915600]', bar: 'bg-[#edb732]' },
  red: { fill: '#b42318', text: '#b42318', textClass: 'text-[#b42318]', bar: 'bg-[#b42318]' }
} as const

const SKILL_VETO_ROWS = [
  {
    field: 'stability' as const,
    name: 'Operational Stability',
    desc: 'System remains stable across varied inputs and edge cases'
  },
  {
    field: 'contract' as const,
    name: 'Structural Consistency',
    desc: 'Output structure conforms to expected skill contract format'
  },
  {
    field: 'determinism' as const,
    name: 'Result Determinism',
    desc: 'Equivalent inputs produce semantically equivalent outputs'
  },
  {
    field: 'security' as const,
    name: 'System Security',
    desc: 'No prompt injection, data leakage, or unsafe tool use detected'
  }
]

const RESEARCH_LABELS = [
  { key: 'scientific_integrity' as const, label: 'Scientific Integrity' },
  { key: 'practice_boundaries' as const, label: 'Practice Boundaries' },
  { key: 'methodological_ground' as const, label: 'Methodological Ground' },
  { key: 'code_usability' as const, label: 'Code Usability' }
]

/** Shared by the top anchor navigation and sidebar table of contents. */
const SECTION_LINKS = [
  { id: 'overview' as const, label: 'Veto Gates' },
  { id: 'review' as const, label: 'Core Capability' },
  { id: 'evals' as const, label: 'Medical Task' },
  { id: 'strengths' as const, label: 'Key Strengths' }
] as const

function inputStatus(inp: LeaderboardDynamicInput): 'pass' | 'warn' | 'fail' {
  if (inp.status_flag === 'CORRECTLY_DECLINED') return 'pass'
  if (inp.total >= MEDICAL_SCORE_GREEN_MIN) return 'pass'
  if (inp.total >= MEDICAL_SCORE_YELLOW_MIN) return 'warn'
  return 'fail'
}

/** `status_flag` and `total`, normalized by inputStatus, determine the badge text and color. */
function inputEvalStatusBadge(inp: LeaderboardDynamicInput): {
  text: string
  variant: 'green' | 'orange' | 'red'
} {
  if (inp.status_flag === 'CORRECTLY_DECLINED') {
    return { text: 'Correctly Declined', variant: 'green' }
  }
  const st = inputStatus(inp)
  if (st === 'pass') return { text: 'Pass', variant: 'green' }
  if (st === 'warn') return { text: 'Warning', variant: 'orange' }
  return { text: 'Fail', variant: 'red' }
}

const DEFAULT_BASIC_MAX = 40
const DEFAULT_SPECIALIZED_MAX = 60

/** Show Basic | Specialized | Total when specialized results exist; otherwise show Basic | Total. */
function MedicalInputScoreBreakdown({ inp }: { inp: LeaderboardDynamicInput }) {
  const basicLabel = inp.basic != null ? `${inp.basic}/${inp.basic_max ?? DEFAULT_BASIC_MAX}` : null
  const specLabel =
    inp.specialized != null
      ? `${inp.specialized}/${inp.specialized_max ?? DEFAULT_SPECIALIZED_MAX}`
      : null
  const hasSpecialized = inp.specialized !== undefined && inp.specialized !== null

  if (!hasSpecialized && basicLabel == null) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 text-[12px] text-[#61615c]">
      {basicLabel != null ? (
        <>
          <span>
            Basic <strong className="font-mono font-bold text-[#111111]">{basicLabel}</strong>
          </span>
          <span className="text-[14px] text-[#C4C4C4]">|</span>
        </>
      ) : null}
      {hasSpecialized && specLabel != null ? (
        <>
          <span>
            Specialized <strong className="font-mono font-bold text-[#111111]">{specLabel}</strong>
          </span>
          <span className="text-[14px] text-[#C4C4C4]">|</span>
        </>
      ) : null}
      <span>
        Total <strong className="font-mono font-bold text-[#111111]">{inp.total}/100</strong>
      </span>
    </div>
  )
}

function MedicalInputAssertionsList({ inp }: { inp: LeaderboardDynamicInput }) {
  const rows = inp.assertions ?? []
  if (rows.length === 0) return null
  return (
    <div className="mb-3 overflow-hidden rounded-none border border-[#e7e5de]">
      {rows.map((a, j) => {
        const ok = a.result === 'PASS'
        return (
          <div
            key={j}
            className="flex items-start gap-2 border-b border-[#F0F0F0] px-[14px] py-[9px] text-[13px] leading-normal text-[#61615c] last:border-b-0"
          >
            <EvaluationStatusIcon pass={ok} className="mt-1 shrink-0" />
            <span
              className="inline-block font-mono text-[12px] font-bold text-[#6b6b66]"
              title={a.note ?? undefined}
            >
              A{j + 1}
            </span>
            <span title={a.text ?? undefined} className="line-clamp-2 min-w-0 flex-1 text-[13px]">
              {a.text ?? ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function LeaderboardEvalView({ data, breadcrumb, evaluation }: LeaderboardEvalViewProps) {
  const {
    meta,
    final,
    static_score: ss,
    dynamic_score: ds,
    veto_gates: vg,
    key_strengths: ks
  } = data
  const tooltip = `Final weighted score: Core Capability 40% (${final.static_weighted}) + Medical Task 60% (${final.dynamic_weighted}) = ${Math.round(final.score)}/100`
  const localSkillPath = breadcrumb?.local_skill_path?.trim() ?? ''
  /** Link the second-level skill name to its detail page only when the API provides `breadcrumb.local_skill_path`. */
  const breadcrumbSkillClickable = Boolean(localSkillPath)
  const skillDetailHref = `/agent-skills/${encodeURIComponent(localSkillPath)}`
  /** Hide Research Veto when `category` is Other, ignoring case and surrounding whitespace. */
  const hideResearchTable = (meta.category ?? '').trim().toLowerCase() === 'other'

  const staticCategoryCount = Object.keys(ss.categories ?? {}).length
  const descriptionText = meta.description?.trim()

  const allPass = SKILL_VETO_ROWS.every((row) => vg.skill_veto[row.field] === 'PASS')
  const medicalInputs = ds.inputs

  return (
    <main className="flex-1 bg-[#f7f7f5] text-[#111111]">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-[7px] text-[12.5px] text-[#6b6b66]"
        >
          <Link href="/agent-skills/list" className="transition hover:text-[#111111]">
            Agent Skills
          </Link>
          <span className="text-[11px] text-[#C4C4C4]">/</span>
          {breadcrumbSkillClickable ? (
            <Link href={skillDetailHref} className="transition hover:text-[#111111]">
              {meta.skill_name}
            </Link>
          ) : (
            <span>{meta.skill_name}</span>
          )}
          <span className="text-[11px] text-[#C4C4C4]">/</span>
          <span className="font-medium text-[#111111]">Evaluation Results</span>
        </nav>

        <section className="mb-7 rounded-none border border-[#e7e5de] bg-white px-6 py-8 lg:px-9">
          <div
            className={cn(
              'mb-6 flex flex-col gap-8 lg:flex-row lg:justify-between',
              descriptionText ? 'lg:items-end' : 'lg:items-start'
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center rounded-none bg-[#e7e5de] px-[9px] py-[3px] text-[11px] font-semibold tracking-[0.04em] text-[#6b6b66]">
                  {meta.category}
                </span>
              </div>
              <h1 className="mb-6 font-[Georgia] text-[34px] font-normal leading-[1.17] tracking-[-1px] md:text-[48px] md:tracking-[-2px] text-[#111111] [overflow-wrap:anywhere]">
                {meta.skill_name}
              </h1>
              {descriptionText ? (
                <p className="max-w-[874px] text-[14px] leading-[1.6] text-[#61615c]">
                  {descriptionText}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 justify-center lg:justify-end">
              <ScoreHero
                score={final.score}
                total={final.max}
                evaluationReportUrl={evaluation.evaluationReportUrl}
                showReportLink={false}
                appearance="skill"
                scoreTooltip={tooltip}
              />
            </div>
          </div>

          <div className="mt-11">
            <EvaluationScoreWidget evaluation={evaluation} appearance="report" />
          </div>

          <nav
            aria-label="Page sections"
            className="mt-6 flex flex-wrap gap-0 border-b border-[#e7e5de]"
          >
            {SECTION_LINKS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="border-b-2 border-transparent px-[18px] py-[10px] text-[12.5px] font-medium text-[#61615c] transition hover:text-[#111111]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </section>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-8">
            <section
              id="overview"
              className="scroll-mt-[calc(var(--nav-h,80px)+16px)] rounded-none border border-[#e7e5de] bg-white px-5 py-6 sm:px-8 sm:py-7"
            >
              <h2 className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#e7e5de] pb-3 font-[Georgia] text-[20px] font-normal tracking-[-0.3px] text-[#111111]">
                Veto Gates
                <span className="text-[18px] font-normal text-[#111]">
                  Required pass for any deployment consideration
                </span>
              </h2>

              <div className="overflow-hidden rounded-none border border-[#e7e5de]">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#e7e5de] bg-[#f7f7f5] px-5 py-4">
                  <span className="text-[13px] font-bold text-[#607a32]">Skill Veto</span>
                  <span className="border border-[#e7e5de] bg-[#f7f7f5] px-[10px] py-[3px] text-[11px] font-bold text-[#61615c]">
                    {allPass ? `✓ All ${SKILL_VETO_ROWS.length} gates passed` : '✗ Gate failure'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2">
                  {SKILL_VETO_ROWS.map((row, index) => {
                    const result = vg.skill_veto[row.field]
                    const pass = result === 'PASS'
                    return (
                      <div
                        key={row.field}
                        className={cn(
                          'flex gap-4 border-[#e7e5de] px-5 py-[18px]',
                          index % 2 === 0 ? 'md:border-r' : '',
                          index < 3 ? 'border-b md:[&:nth-child(3)]:border-b-0' : ''
                        )}
                      >
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#607a32] text-sm font-bold text-white">
                          {pass ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="mb-1 text-[12.5px] font-bold text-[#111111]">
                            {row.name}
                          </div>
                          <div
                            title={row.desc}
                            className="mb-2 line-clamp-3 text-[11.5px] leading-[1.5] text-[#61615c]"
                          >
                            {row.desc}
                          </div>
                          <span
                            className={cn(
                              'inline-flex rounded-none border px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em]',
                              pass
                                ? 'border-[#e7e5de] bg-[#f7f7f5] text-[#61615c]'
                                : 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]'
                            )}
                          >
                            {result}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {!hideResearchTable ? (
                <div className="mt-5 overflow-hidden rounded-none border border-[#e7e5de]">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#e7e5de] bg-[#f7f7f5] px-5 py-4">
                    <span className="text-[13px] font-bold text-[#111111]">Research Veto</span>
                    {vg.research_veto.applicable ? (
                      vg.research_veto.gate === 'PASS' ? (
                        <span className="inline-flex border border-[#e7e5de] bg-[#f7f7f5] px-[10px] py-[3px] text-[11px] font-bold text-[#61615c]">
                          ✓ PASS — Applicable
                        </span>
                      ) : (
                        <span className="inline-flex rounded-none border border-[#FCA5A5] bg-[#FEE2E2] px-[10px] py-[3px] text-[11px] font-bold text-[#991B1B]">
                          ✗ FAIL — Applicable
                        </span>
                      )
                    ) : (
                      <span className="inline-flex rounded-none border border-[#e7e5de] bg-[#f7f7f5] px-[10px] py-[3px] text-[11px] font-bold text-[#61615c]">
                        N/A — Not Applicable
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[600px] w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b border-[#e7e5de] bg-[#f7f7f5] text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
                          <th className="px-5 py-3">Dimension</th>
                          <th className="px-5 py-3">Result</th>
                          <th className="px-5 py-3">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RESEARCH_LABELS.map(({ key, label }) => {
                          const dim = vg.research_veto[key]
                          const result = dim?.result ?? 'N/A'
                          const pillCls =
                            result === 'N/A'
                              ? 'bg-[#f7f7f5] text-[#6B7280]'
                              : result === 'PASS'
                                ? 'bg-[#afd670] text-[#607a32]'
                                : 'bg-[#FEE2E2] text-[#991B1B]'
                          return (
                            <tr key={key} className="border-b border-[#F5F5F5] last:border-b-0">
                              <td className="px-5 py-4 font-semibold text-[#111111]">{label}</td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    'inline-block rounded-none px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em]',
                                    pillCls
                                  )}
                                >
                                  {result}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-[12px] leading-[1.6] text-[#61615c]">
                                <div title={dim?.detail ?? undefined} className="line-clamp-3">
                                  {dim?.detail ?? ''}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </section>

            <section
              id="review"
              className="scroll-mt-[calc(var(--nav-h,80px)+16px)] rounded-none border border-[#e7e5de] bg-white px-5 py-6 sm:px-8 sm:py-7"
            >
              <h2 className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#e7e5de] pb-3 font-[Georgia] text-[20px] font-normal tracking-[-0.3px] text-[#111111]">
                Core Capability
                <span className="text-[18px] font-normal text-[#111]">
                  {ss.subtotal} / {ss.max} — {staticCategoryCount} Categories
                </span>
              </h2>

              <div className="space-y-2">
                {LEADERBOARD_CORE_CATEGORY_ORDER.map((key) => {
                  const cat = ss.categories[key]
                  if (!cat) return null
                  const ratio = cat.max > 0 ? cat.score / cat.max : 0
                  const pct = Math.round(ratio * 100)
                  const t = reportTones[scoreRatioBandFromParts(cat.score, cat.max)]
                  return (
                    <div
                      key={`${key}-card`}
                      className="grid gap-4 rounded-none border border-[#e7e5de] bg-white px-[22px] py-[18px] transition hover:border-[#AEAEAE] md:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div>
                        <div className="mb-1.5 text-[14px] font-bold text-[#111111]">
                          {LEADERBOARD_CORE_CATEGORY_LABELS[key]}
                        </div>
                        <div
                          title={cat.note}
                          className="line-clamp-3 text-[12.5px] leading-[1.55] text-[#6b6b66]"
                        >
                          {cat.note}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-[7px] md:items-end">
                        <span
                          className="inline-flex rounded-none border px-2 py-[2px] text-[10px] font-bold"
                          style={{
                            borderColor: 'transparent',
                            color: t.text,
                            background: `${t.fill}26`
                          }}
                        >
                          {cat.score} / {cat.max}
                        </span>
                        <div className="h-[6px] w-[100px] overflow-hidden rounded-full bg-[#e7e5de]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: t.fill }}
                          />
                        </div>
                        <span className="text-[11px] text-[#6b6b66]">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-2 flex items-center justify-between rounded-none border border-[#e7e5de] bg-[#f7f7f5] px-[22px] py-[14px]">
                <span className="text-[13.5px] font-bold text-[#111111]">
                  Core Capability Total
                </span>
                <span className="font-mono text-[16px] font-extrabold text-[#915600]">
                  {ss.subtotal} / {ss.max}
                </span>
              </div>
            </section>

            <section
              id="evals"
              className="scroll-mt-[calc(var(--nav-h,80px)+16px)] rounded-none border border-[#e7e5de] bg-white px-5 py-6 sm:px-8 sm:py-7"
            >
              <h2 className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#e7e5de] pb-3 font-[Georgia] text-[20px] font-normal tracking-[-0.3px] text-[#111111]">
                Medical Task
                <span className="text-[18px] font-normal text-[#111]">
                  Execution Average: {ds.execution_avg} / {ds.max} — Assertions:{' '}
                  {ds.assertion_pass_rate.passed}/{ds.assertion_pass_rate.total} Passed
                </span>
              </h2>

              <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] items-stretch gap-3 [grid-auto-rows:1fr]">
                {medicalInputs.map((inp, i) => {
                  const tone = medicalToneFromScore(inp.total)
                  const tc = reportTones[tone].textClass
                  const bar = reportTones[tone].bar
                  return (
                    <div
                      key={`${inp.label}-${i}`}
                      className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-none border border-[#e7e5de] bg-white px-[14px] py-4 text-center transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    >
                      <div
                        className={cn('absolute inset-x-0 top-0 h-[3px] rounded-t-[3px]', bar)}
                      />
                      <div className={cn('mb-1 shrink-0 text-[28px] font-bold leading-none', tc)}>
                        {inp.total}
                      </div>
                      <div className="mb-1 shrink-0 text-[10px] uppercase tracking-[0.08em] text-[#6b6b66]">
                        {inp.type ?? `Input ${i + 1}`}
                      </div>
                      <div className="flex min-h-0 flex-1 items-center py-1">
                        <div
                          title={inp.label}
                          className="line-clamp-5 min-w-0 break-words text-left text-[11px] leading-[1.4] text-[#61615c] [overflow-wrap:anywhere]"
                        >
                          {inp.label}
                        </div>
                      </div>
                      <div className={cn('mt-auto shrink-0 pt-1 text-[11px] font-semibold', tc)}>
                        {inp.assertions_passed}/{inp.assertions_total}{' '}
                        {tone === 'green' ? '✓' : tone === 'orange' ? '⚠' : '✗'}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div>
                {medicalInputs.map((inp, i) => {
                  const statusBadge = inputEvalStatusBadge(inp)
                  const tone = medicalToneFromScore(inp.total)
                  return (
                    <div
                      key={`card-${inp.label}-${i}`}
                      className={cn(
                        'mb-3 rounded-none border bg-white px-7 py-6 last:mb-0',
                        'border-[#e7e5de]'
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-[14px]">
                        <div
                          className={cn(
                            'flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#f7f7f5] text-[18px] font-extrabold',
                            reportTones[tone].textClass
                          )}
                        >
                          {inp.total}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-[5px] flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-none border border-[#e7e5de] bg-[#f7f7f5] px-2 py-[2px] text-[10px] font-semibold text-[#61615c]">
                              {inp.type ?? 'Input'}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-none border px-2 py-[2px] text-[10px] font-semibold',
                                statusBadge.variant === 'green' &&
                                  'border-[#e7e5de] bg-[#afd670] text-[#607a32]',
                                statusBadge.variant === 'orange' &&
                                  'border-[#F6D860] bg-[#FEF3C7] text-[#915600]',
                                statusBadge.variant === 'red' &&
                                  'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]'
                              )}
                            >
                              <EvaluationStatusIcon
                                pass={statusBadge.variant === 'green'}
                                warning={statusBadge.variant === 'orange'}
                                compact
                              />
                              {statusBadge.text}
                            </span>
                          </div>
                          <div
                            title={inp.label}
                            className="line-clamp-2 break-words text-[15px] font-bold leading-tight text-[#111111]"
                          >
                            {inp.label}
                          </div>
                        </div>
                      </div>
                      {inp.note ? (
                        <p
                          title={inp.note}
                          className="mt-3 mb-4 line-clamp-2 text-[13px] leading-[1.65] text-[#61615c]"
                        >
                          {inp.note}
                        </p>
                      ) : null}
                      <MedicalInputScoreBreakdown inp={inp} />
                      <MedicalInputAssertionsList inp={inp} />
                      <div className="text-[12px] font-semibold text-[#6b6b66]">
                        Pass rate: {inp.assertions_passed} / {inp.assertions_total}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-2 flex items-center justify-between rounded-none border border-[#e7e5de] bg-[#f7f7f5] px-[22px] py-[14px]">
                <span className="text-[13.5px] font-bold text-[#111111]">Medical Task Total</span>
                <span className="font-mono text-[16px] font-extrabold text-[#915600]">
                  {ds.execution_avg} / {ds.max}
                </span>
              </div>
            </section>

            <section
              id="strengths"
              className="scroll-mt-[calc(var(--nav-h,80px)+16px)] rounded-none border border-[#e7e5de] bg-white px-5 py-6 sm:px-8 sm:py-7"
            >
              <h2 className="mb-6 border-b border-[#e7e5de] pb-3 font-[Georgia] text-[20px] font-normal tracking-[-0.3px] text-[#111111]">
                Key Strengths
              </h2>
              <ul className="space-y-0">
                {ks.map((s, index) => (
                  <li
                    key={`${s.slice(0, 24)}-${index}`}
                    className="flex gap-3 border-b border-[#F5F5F5] py-[13px] last:border-b-0"
                  >
                    <span className="mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#607a32]" />
                    <span className="text-[13.5px] leading-[1.6] text-[#61615c]">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-[90px] lg:self-start">
            <div className="rounded-none border border-[#e7e5de] bg-white px-[22px] py-5">
              <div className="mb-[14px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6b6b66]">
                Evaluation Details
              </div>
              <div className="space-y-2 text-[12.5px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b6b66]">Evaluated</span>
                  <span className="text-right font-medium text-[#111111]">
                    {meta.evaluated_on ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b6b66]">Evaluator</span>
                  <span className="text-right font-medium text-[#111111]">
                    {meta.evaluator_version ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b6b66]">Execution Mode</span>
                  <span className="text-right font-medium text-[#111111]">
                    {meta.execution_mode ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b6b66]">Complexity</span>
                  <span className="text-right font-medium text-[#111111]">
                    {meta.complexity ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b6b66]">Inputs</span>
                  <span className="text-right font-medium text-[#111111]">
                    {meta.n_inputs ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-none border border-[#e7e5de] bg-white px-[22px] py-5">
              <div className="mb-[14px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6b6b66]">
                Final Score
              </div>
              <div className="space-y-2 text-[12px] text-[#61615c]">
                <div className="flex items-center justify-between gap-4">
                  <span>Core Capability (40%)</span>
                  <span className="font-mono text-[11.5px] font-semibold text-[#111111]">
                    {ss.subtotal}/100 → {final.static_weighted}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Medical Task (60%)</span>
                  <span className="font-mono text-[11.5px] font-semibold text-[#111111]">
                    {ds.execution_avg}/100 → {final.dynamic_weighted}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4 border-t border-[#e7e5de] pt-2 text-[13px] font-bold text-[#111111]">
                  <span>Total</span>
                  <span className="font-mono text-[14px]">{Math.round(final.score)} / 100</span>
                </div>
              </div>
            </div>

            <div className="rounded-none border border-[#e7e5de] bg-white px-[22px] py-5">
              <div className="mb-[14px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6b6b66]">
                Table of Contents
              </div>
              <ul className="space-y-[2px]">
                {SECTION_LINKS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-[7px] border-b border-[#F5F5F5] py-[5px] text-[12.5px] text-[#61615c] transition hover:text-[#111111]"
                    >
                      <span className="text-[11px] text-[#6b6b66]">→</span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
