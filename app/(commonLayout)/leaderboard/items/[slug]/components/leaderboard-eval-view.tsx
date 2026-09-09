'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LEADERBOARD_CORE_CATEGORY_LABELS,
  LEADERBOARD_CORE_CATEGORY_ORDER,
  leaderboardCoreCapabilityTone,
  medicalToneCircleClass,
  medicalToneDetailCardBorderClass,
  medicalToneFromScore,
  medicalToneTextClass,
  medicalToneTopBarClass
} from '@/lib/evaluation-styles'
import { EvaluationScoreWidget } from '@/app/(commonLayout)/agent-skills/components/evaluation-overview'
import { ScoreHero } from '@/app/(commonLayout)/agent-skills/components/score-hero'
import type { LeaderboardEvalViewProps } from './build-leaderboard-eval-props'
import { MEDICAL_SCORE_GREEN_MIN, MEDICAL_SCORE_YELLOW_MIN } from '@/lib/map-score-detail'
import type { LeaderboardDynamicInput } from './leaderboard-evaluation'

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
    return { text: '✅ Correctly Declined', variant: 'green' }
  }
  const st = inputStatus(inp)
  if (st === 'pass') return { text: '✅ Pass', variant: 'green' }
  if (st === 'warn') return { text: '⚠️ Warning', variant: 'orange' }
  return { text: '❌ Fail', variant: 'red' }
}

const DEFAULT_BASIC_MAX = 40
const DEFAULT_SPECIALIZED_MAX = 60

/** Show Basic | Specialized | Total when specialized results exist; otherwise show Basic | Total. */
function MedicalInputScoreBreakdown({ inp }: { inp: LeaderboardDynamicInput }) {
  const basicLabel =
    inp.basic != null ? `${inp.basic}/${inp.basic_max ?? DEFAULT_BASIC_MAX}` : null
  const specLabel =
    inp.specialized != null
      ? `${inp.specialized}/${inp.specialized_max ?? DEFAULT_SPECIALIZED_MAX}`
      : null
  const hasSpecialized = inp.specialized !== undefined && inp.specialized !== null

  if (!hasSpecialized && basicLabel == null) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 text-[12px] text-[#555555]">
      {basicLabel != null ? (
        <>
          <span>
            Basic{' '}
            <strong className="font-mono font-bold text-[#111111]">{basicLabel}</strong>
          </span>
          <span className="text-[14px] text-[#C4C4C4]">|</span>
        </>
      ) : null}
      {hasSpecialized && specLabel != null ? (
        <>
          <span>
            Specialized{' '}
            <strong className="font-mono font-bold text-[#111111]">{specLabel}</strong>
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
    <div className="mb-3 overflow-hidden rounded-[3px] border border-[#E2E2E2]">
      {rows.map((a, j) => {
        const ok = a.result === 'PASS'
        return (
          <div
            key={j}
            className="flex items-start gap-2 border-b border-[#F0F0F0] px-[14px] py-[9px] text-[13px] leading-normal text-[#555555] last:border-b-0"
          >
            <span className="mt-px shrink-0 select-none text-[13px]">{ok ? '✅' : '❌'}</span>
            <span
              className="inline-block font-mono text-[12px] font-bold text-[#888888]"
              title={a.note ?? undefined}
            >
              A{j + 1}
            </span>
            <span
              title={a.text ?? undefined}
              className="line-clamp-2 min-w-0 flex-1 text-[13px]"
            >
              {a.text ?? ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function LeaderboardEvalView({
                                      data,
                                      breadcrumb,
                                      evaluation
                                    }: LeaderboardEvalViewProps) {
  const { meta, final, static_score: ss, dynamic_score: ds, veto_gates: vg, key_strengths: ks } = data
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
    <main className="flex-1 bg-[#E9E9E9] text-[#111111]">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-[7px] text-[12.5px] text-[#909090]"
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

        <section className="mb-7 rounded-[3px] border border-[#E2E2E2] bg-white px-6 py-8 lg:px-9">
          <div
            className={cn(
              'mb-6 flex flex-col gap-8 lg:flex-row lg:justify-between',
              descriptionText ? 'lg:items-end' : 'lg:items-start'
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded-[3px] border border-[#C7D2F0] bg-[#F0F4FF] px-[9px] py-[3px] text-[11px] font-semibold tracking-[0.04em] text-[#3B52A0]">
                  {meta.category}
                </span>
              </div>
              <h1 className="mb-3 text-[34px] font-bold leading-[1.15] tracking-[-0.6px] text-[#111111]">
                {meta.skill_name}
              </h1>
              {descriptionText ? (
                <p className="max-w-[780px] text-[14.5px] leading-[1.7] text-[#555555]">
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
                scoreTooltip={tooltip}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-[#DCDCDC] pt-5">
            <EvaluationScoreWidget evaluation={evaluation} />
          </div>

          <nav
            aria-label="Page sections"
            className="mt-6 flex flex-wrap gap-0 border-b border-[#DCDCDC]"
          >
            {SECTION_LINKS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="border-b-2 border-transparent px-[18px] py-[10px] text-[12.5px] font-medium text-[#555555] transition hover:text-[#111111]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </section>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-8">
            <section id="overview" className="rounded-[3px] border border-[#E2E2E2] bg-white px-8 py-7">
              <h2
                className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#DCDCDC] pb-3 text-[20px] font-bold tracking-[-0.3px] text-[#111111]">
                Veto Gates
                <span className="text-[13px] font-medium text-[#909090]">
                  Required pass for any deployment consideration
                </span>
              </h2>

              <div className="overflow-hidden rounded-[3px] border border-[#B8DFC9]">
                <div
                  className="flex items-center justify-between gap-3 border-b border-[#B8DFC9] bg-[#F0FAF5] px-5 py-4">
                  <span className="text-[13px] font-bold text-[#1A6B3C]">Skill Veto</span>
                  <span
                    className="rounded-[2px] border border-[#B8DFC9] bg-[#E6F4ED] px-[10px] py-[3px] text-[11px] font-bold text-[#1A6B3C]">
                    {allPass
                      ? `✓ All ${SKILL_VETO_ROWS.length} gates passed`
                      : '✗ Gate failure'}
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
                          'flex gap-4 border-[#E8F5EE] px-5 py-[18px]',
                          index % 2 === 0 ? 'md:border-r' : '',
                          index < 2 ? 'border-b' : ''
                        )}
                      >
                        <div
                          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1A6B3C] text-sm font-bold text-white">
                          {pass ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="mb-1 text-[12.5px] font-bold text-[#111111]">{row.name}</div>
                          <div
                            title={row.desc}
                            className="mb-2 line-clamp-3 text-[11.5px] leading-[1.5] text-[#666666]"
                          >
                            {row.desc}
                          </div>
                          <span
                            className={cn(
                              'inline-flex rounded-[2px] border px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em]',
                              pass
                                ? 'border-[#B8DFC9] bg-[#E6F4ED] text-[#1A6B3C]'
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
                <div className="mt-5 overflow-hidden rounded-[3px] border border-[#E2E2E2]">
                  <div
                    className="flex items-center justify-between gap-3 border-b border-[#E2E2E2] bg-[#FAFAFA] px-5 py-4">
                    <span className="text-[13px] font-bold text-[#111111]">Research Veto</span>
                    {vg.research_veto.applicable ? (
                      vg.research_veto.gate === 'PASS' ? (
                        <span
                          className="inline-flex rounded-[2px] border border-[#B8DFC9] bg-[#E6F4ED] px-[10px] py-[3px] text-[11px] font-bold text-[#1A6B3C]">
                          ✅ PASS — Applicable
                        </span>
                      ) : (
                        <span
                          className="inline-flex rounded-[2px] border border-[#FCA5A5] bg-[#FEE2E2] px-[10px] py-[3px] text-[11px] font-bold text-[#991B1B]">
                          ❌ FAIL — Applicable
                        </span>
                      )
                    ) : (
                      <span
                        className="inline-flex rounded-[2px] border border-[#D1D5DB] bg-[#F3F4F6] px-[10px] py-[3px] text-[11px] font-bold text-[#374151]">
                        N/A — Not Applicable
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[600px] w-full border-collapse text-[13px]">
                      <thead>
                      <tr
                        className="border-b border-[#E2E2E2] bg-[#FAFAFA] text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#888888]">
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
                            ? 'bg-[#F3F4F6] text-[#6B7280]'
                            : result === 'PASS'
                              ? 'bg-[#E6F4ED] text-[#1A6B3C]'
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                        return (
                          <tr key={key} className="border-b border-[#F5F5F5] last:border-b-0">
                            <td className="px-5 py-4 font-semibold text-[#111111]">{label}</td>
                            <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    'inline-block rounded-[2px] px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em]',
                                    pillCls
                                  )}
                                >
                                  {result}
                                </span>
                            </td>
                            <td className="px-5 py-4 text-[12px] leading-[1.6] text-[#555555]">
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

            <section id="review" className="rounded-[3px] border border-[#E2E2E2] bg-white px-8 py-7">
              <h2
                className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#DCDCDC] pb-3 text-[20px] font-bold tracking-[-0.3px] text-[#111111]">
                Core Capability
                <span className="text-[13px] font-medium text-[#909090]">
                  {ss.subtotal} / {ss.max} — {staticCategoryCount} Categories
                </span>
              </h2>

              <div className="space-y-2">
                {LEADERBOARD_CORE_CATEGORY_ORDER.map((key) => {
                  const cat = ss.categories[key]
                  if (!cat) return null
                  const ratio = cat.max > 0 ? cat.score / cat.max : 0
                  const pct = Math.round(ratio * 100)
                  const t = leaderboardCoreCapabilityTone(ratio)
                  return (
                    <div
                      key={`${key}-card`}
                      className="grid gap-4 rounded-[3px] border border-[#E2E2E2] bg-white px-[22px] py-[18px] transition hover:border-[#AEAEAE] md:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div>
                        <div className="mb-1.5 text-[14px] font-bold text-[#111111]">
                          {LEADERBOARD_CORE_CATEGORY_LABELS[key]}
                        </div>
                        <div
                          title={cat.note}
                          className="line-clamp-3 text-[12.5px] leading-[1.55] text-[#909090]"
                        >
                          {cat.note}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-[7px] md:items-end">
                        <span
                          className="inline-flex rounded-[2px] border px-2 py-[2px] text-[10px] font-bold"
                          style={{
                            borderColor: t.fill,
                            color: t.text,
                            background: `${t.fill}14`
                          }}
                        >
                          {cat.score} / {cat.max}
                        </span>
                        <div className="h-[6px] w-[100px] overflow-hidden rounded-full bg-[#E5E7EB]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: t.fill }}
                          />
                        </div>
                        <span className="text-[11px] text-[#909090]">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                className="mt-2 flex items-center justify-between rounded-[3px] border border-[#E2E2E2] bg-[#F9F9F9] px-[22px] py-[14px]">
                <span className="text-[13.5px] font-bold text-[#111111]">Core Capability Total</span>
                <span className="font-mono text-[16px] font-extrabold text-[#92400E]">
                  {ss.subtotal} / {ss.max}
                </span>
              </div>
            </section>

            <section id="evals" className="rounded-[3px] border border-[#E2E2E2] bg-white px-8 py-7">
              <h2
                className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#DCDCDC] pb-3 text-[20px] font-bold tracking-[-0.3px] text-[#111111]">
                Medical Task
                <span className="text-[13px] font-medium text-[#909090]">
                  Execution Average: {ds.execution_avg} / {ds.max} — Assertions:{' '}
                  {ds.assertion_pass_rate.passed}/{ds.assertion_pass_rate.total} Passed
                </span>
              </h2>

              <div
                className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] items-stretch gap-3 [grid-auto-rows:1fr]">
                {medicalInputs.map((inp, i) => {
                  const tone = medicalToneFromScore(inp.total)
                  const tc = medicalToneTextClass(tone)
                  const bar = medicalToneTopBarClass(tone)
                  return (
                    <div
                      key={`${inp.label}-${i}`}
                      className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#E2E2E2] bg-white px-[14px] py-4 text-center transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    >
                      <div className={cn('absolute inset-x-0 top-0 h-[3px] rounded-t-[3px]', bar)} />
                      <div className={cn('mb-1 shrink-0 text-[28px] font-bold leading-none', tc)}>{inp.total}</div>
                      <div className="mb-1 shrink-0 text-[10px] uppercase tracking-[0.08em] text-[#888888]">
                        {inp.type ?? `Input ${i + 1}`}
                      </div>
                      <div className="flex min-h-0 flex-1 items-center py-1">
                        <div
                          title={inp.label}
                          className="line-clamp-5 min-w-0 break-words text-left text-[11px] leading-[1.4] text-[#555555] [overflow-wrap:anywhere]"
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
                        'mb-3 rounded-[3px] border bg-white px-7 py-6 last:mb-0',
                        medicalToneDetailCardBorderClass(tone)
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-[14px]">
                        <div
                          className={cn(
                            'flex size-[52px] shrink-0 items-center justify-center rounded-full border-2 font-mono text-[18px] font-extrabold',
                            medicalToneCircleClass(tone)
                          )}
                        >
                          {inp.total}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-[5px] flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex rounded-[2px] border border-[#D1D5DB] bg-[#F3F4F6] px-2 py-[2px] text-[10px] font-semibold text-[#374151]">
                              {inp.type ?? 'Input'}
                            </span>
                            <span
                              className={cn(
                                'inline-flex rounded-[2px] border px-2 py-[2px] text-[10px] font-semibold',
                                statusBadge.variant === 'green' &&
                                'border-[#B8DFC9] bg-[#E6F4ED] text-[#1A6B3C]',
                                statusBadge.variant === 'orange' &&
                                'border-[#F6D860] bg-[#FEF3C7] text-[#92400E]',
                                statusBadge.variant === 'red' &&
                                'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]'
                              )}
                            >
                              {statusBadge.text}
                            </span>
                          </div>
                          <div
                            title={inp.label}
                            className="line-clamp-2 break-words text-[15px] font-bold leading-tight text-[#111111] [overflow-wrap:anywhere]"
                          >
                            {inp.label}
                          </div>
                        </div>
                      </div>
                      {inp.note ? (
                        <p
                          title={inp.note}
                          className="mt-3 mb-4 line-clamp-2 text-[13px] leading-[1.65] text-[#555555]"
                        >
                          {inp.note}
                        </p>
                      ) : null}
                      <MedicalInputScoreBreakdown inp={inp} />
                      <MedicalInputAssertionsList inp={inp} />
                      <div className="text-[12px] font-semibold text-[#909090]">
                        Pass rate: {inp.assertions_passed} / {inp.assertions_total}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                className="mt-2 flex items-center justify-between rounded-[3px] border border-[#E2E2E2] bg-[#F9F9F9] px-[22px] py-[14px]">
                <span className="text-[13.5px] font-bold text-[#111111]">Medical Task Total</span>
                <span className="font-mono text-[16px] font-extrabold text-[#92400E]">
                  {ds.execution_avg} / {ds.max}
                </span>
              </div>
            </section>

            <section id="strengths" className="rounded-[3px] border border-[#E2E2E2] bg-white px-8 py-7">
              <h2
                className="mb-6 border-b border-[#DCDCDC] pb-3 text-[20px] font-bold tracking-[-0.3px] text-[#111111]">
                Key Strengths
              </h2>
              <ul className="space-y-0">
                {ks.map((s, index) => (
                  <li
                    key={`${s.slice(0, 24)}-${index}`}
                    className="flex gap-3 border-b border-[#F5F5F5] py-[13px] last:border-b-0"
                  >
                    <span className="mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#1A6B3C]" />
                    <span className="text-[13.5px] leading-[1.6] text-[#555555]">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[90px] lg:self-start">
            <div className="rounded-[3px] border border-[#E2E2E2] bg-white px-[22px] py-5">
              <div className="mb-[14px] text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#909090]">
                Evaluation Details
              </div>
              <div className="space-y-2 text-[12.5px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#909090]">Evaluated</span>
                  <span className="text-right font-medium text-[#111111]">{meta.evaluated_on ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#909090]">Evaluator</span>
                  <span className="text-right font-medium text-[#111111]">{meta.evaluator_version ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#909090]">Execution Mode</span>
                  <span className="text-right font-medium text-[#111111]">{meta.execution_mode ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#909090]">Complexity</span>
                  <span className="text-right font-medium text-[#111111]">{meta.complexity ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#909090]">Inputs</span>
                  <span className="text-right font-medium text-[#111111]">{meta.n_inputs ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[3px] border border-[#E2E2E2] bg-white px-[22px] py-5">
              <div className="mb-[14px] text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#909090]">
                Final Score
              </div>
              <div className="space-y-2 text-[12px] text-[#555555]">
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
                <div
                  className="mt-1 flex items-center justify-between gap-4 border-t border-[#DCDCDC] pt-2 text-[13px] font-bold text-[#111111]">
                  <span>Total</span>
                  <span className="font-mono text-[14px]">
                    {Math.round(final.score)} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[3px] border border-[#E2E2E2] bg-white px-[22px] py-5">
              <div className="mb-[14px] text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#909090]">
                Table of Contents
              </div>
              <ul className="space-y-[2px]">
                {SECTION_LINKS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-[7px] border-b border-[#F5F5F5] py-[5px] text-[12.5px] text-[#555555] transition hover:text-[#111111]"
                    >
                      <span className="text-[11px] text-[#909090]">→</span>
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
