import {
  LEADERBOARD_CORE_CATEGORY_LABELS,
  LEADERBOARD_CORE_CATEGORY_ORDER
} from '@/lib/evaluation-styles'
import type { SkillEvaluation } from '@/types/skill-evaluation'
import type { LeaderboardEvaluationPayload } from './leaderboard-evaluation'

/** Map a leaderboard payload to the skill page's `SkillEvaluation`. */
export function mapLeaderboardPayloadToSkillEvaluation(
  data: LeaderboardEvaluationPayload,
  options: { leaderboardSlug: string }
): SkillEvaluation {
  const { static_score: ss, dynamic_score: ds, final } = data

  const coreCategories = LEADERBOARD_CORE_CATEGORY_ORDER.flatMap((key) => {
    const cat = ss.categories[key]
    if (!cat) return []
    return [
      {
        key,
        label: LEADERBOARD_CORE_CATEGORY_LABELS[key],
        score: cat.score,
        max: cat.max
      }
    ]
  })

  const medicalTasks = ds.inputs.map((inp) => ({
    label: inp.label,
    score: Math.round(inp.total),
    passed: inp.assertions_passed,
    total: inp.assertions_total,
    assertions: inp.assertions
  }))

  return {
    overallScore: Math.round(final.score),
    overallTotal: final.max ?? 100,
    staticScore: ss.subtotal,
    staticTotal: ss.max,
    dynamicPassed: ds.assertion_pass_rate.passed,
    dynamicTotal: ds.assertion_pass_rate.total,
    evaluationReportUrl: `/leaderboard/items/${encodeURIComponent(options.leaderboardSlug)}`,
    coreCategories,
    medicalTasks
  }
}
