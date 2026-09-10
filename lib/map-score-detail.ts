import type {

  ScoreDetail,

  SkillScoreDynamicInputSummary

} from '@/service/skills'

import type { SkillEvaluation } from '@/types/skill-evaluation'



/** Medical Task score thresholds. */

export const MEDICAL_SCORE_GREEN_MIN = 70

export const MEDICAL_SCORE_YELLOW_MIN = 40



function dynamicInputsFromScoreDetail(sd: ScoreDetail): SkillScoreDynamicInputSummary[] {

  const raw = sd.dynamic_score?.inputs

  return Array.isArray(raw) ? raw : []

}



function assertionPassRateFromScoreDetail(sd: ScoreDetail): { passed: number; total: number } {

  const ar = sd.dynamic_score?.assertion_pass_rate

  if (ar != null && typeof ar.passed === 'number' && typeof ar.total === 'number') {

    return { passed: ar.passed, total: ar.total }

  }

  return { passed: 0, total: 0 }

}



export interface MapScoreDetailOptions {

  /** The skill detail API's `score_result_url`, a sibling of `score_detail`, appended directly after `/leaderboard/items/`. */

  scoreResultUrl?: string | null

}



/** Convert `score_detail` to `SkillEvaluation` using `dynamic_score.inputs` and `assertion_pass_rate`. */

export function mapScoreDetailToSkillEvaluation(

  sd: ScoreDetail,

  skillName: string,

  options?: MapScoreDetailOptions

): SkillEvaluation {

  const staticScore = sd.static_score_total ?? 0

  const staticTotal = sd.static_score_max ?? 100



  const inputs = dynamicInputsFromScoreDetail(sd)

  const { passed: dynamicPassed, total: dynamicTotal } = assertionPassRateFromScoreDetail(sd)



  const coreCategories = (sd.static_categories ?? []).map((c) => ({

    key: c.key,

    label: c.label,

    score: c.score ?? 0,

    max: c.max ?? 0

  }))



  const medicalTasks = inputs.map((input) => {

    const labelPart = input.label?.trim()

    const label = labelPart || `Input ${input.index}`



    return {

      label,

      score: Math.round(input.score ?? 0),

      passed: input.assertions_passed ?? 0,

      total: input.assertions_total ?? 0,

      assertions: input.assertions

    }

  })



  const trimmedSkillResult = options?.scoreResultUrl?.trim()

  const trimmedDetailReport = sd.evaluation_report_url?.trim()

  const fallbackSegment = sd.leaderboard_slug ?? skillName



  const evaluationReportUrl = trimmedSkillResult

    ? `/leaderboard/items/${trimmedSkillResult}`

    : trimmedDetailReport

      ? `/leaderboard/items/${trimmedDetailReport}`

      : `/leaderboard/items/${fallbackSegment}`



  return {

    overallScore: sd.score ?? 0,

    overallTotal: sd.max ?? 100,

    staticScore,

    staticTotal,

    dynamicPassed,

    dynamicTotal,

    evaluationReportUrl,

    coreCategories,

    medicalTasks

  }

}


