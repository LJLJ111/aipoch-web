import type { LeaderboardEvaluationPayload } from '@/app/(commonLayout)/leaderboard/items/[slug]/components/leaderboard-evaluation'
import { normalizeLeaderboardRawResult } from '@/app/(commonLayout)/leaderboard/items/[slug]/components/normalize-leaderboard-raw-result'
import {
  LEADERBOARD_CORE_CATEGORY_LABELS,
  LEADERBOARD_CORE_CATEGORY_ORDER
} from '@/lib/evaluation-styles'
import { scoreRatioBand, scoreRatioBandFromParts } from '@/lib/score-ratio-bands'
import type { CompareDetailData, CompareSkillDetail } from '@/service/compare'
import type {
  ComparePageViewModel,
  CompareSide,
  CompareSkillView,
  CompareTone
} from './compare-types'

export { LEADERBOARD_CORE_CATEGORY_LABELS, LEADERBOARD_CORE_CATEGORY_ORDER }

export function compareToneFromParts(score: number, max: number): CompareTone {
  return scoreRatioBandFromParts(score, max)
}

export function compareToneFromRatio(ratio: number): CompareTone {
  return scoreRatioBand(ratio)
}

export function buildDescriptionTitle(...parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ')
}

function mapSkill(skill: CompareSkillDetail, side: CompareSide): CompareSkillView {
  const payload = normalizeLeaderboardRawResult(
    skill.raw_result_json
  ) as LeaderboardEvaluationPayload

  const totalScore = Math.round(skill.total_score || payload.final.score || 0)
  const totalMax = payload.final.max || 100

  return {
    side,
    rankSkillId: skill.rank_skill_id,
    name: skill.skill_name || '',
    title: skill.skill_title || '',
    description: skill.skill_description?.trim() || payload.meta.description?.trim() || '',
    category: skill.category || '',
    author: skill.skill_author || '',
    totalScore,
    totalMax,
    payload
  }
}

export function mapCompareDetailToViewModel(data: CompareDetailData): ComparePageViewModel {
  const left = mapSkill(data.left_skill, 'left')
  const right = mapSkill(data.right_skill, 'right')

  return {
    path: data.path,
    left,
    right
  }
}
