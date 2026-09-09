import { mapLeaderboardPayloadToSkillEvaluation } from './map-leaderboard-payload-to-skill-evaluation'
import type { SkillEvaluation } from '@/types/skill-evaluation'
import type { LeaderboardEvaluationPayload } from './leaderboard-evaluation'

export interface LeaderboardBreadcrumb {
  local_skill_path?: string
}

export interface LeaderboardEvalViewProps {
  data: LeaderboardEvaluationPayload
  breadcrumb?: LeaderboardBreadcrumb
  evaluation: SkillEvaluation
}

export function buildLeaderboardEvalProps(
  data: LeaderboardEvaluationPayload,
  leaderboardSlug: string,
  options?: { breadcrumb?: LeaderboardBreadcrumb }
): LeaderboardEvalViewProps {
  return {
    data,
    breadcrumb: options?.breadcrumb,
    evaluation: mapLeaderboardPayloadToSkillEvaluation(data, { leaderboardSlug })
  }
}
