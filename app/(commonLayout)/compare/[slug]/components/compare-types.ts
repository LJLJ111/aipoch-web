import type { LeaderboardEvaluationPayload } from '@/app/(commonLayout)/leaderboard/items/[slug]/components/leaderboard-evaluation'

export type CompareSide = 'left' | 'right'
export type CompareTone = 'green' | 'orange' | 'red'

export interface CompareSkillView {
  side: CompareSide
  rankSkillId: number
  name: string
  title: string
  description: string
  category: string
  author: string
  totalScore: number
  totalMax: number
  payload: LeaderboardEvaluationPayload
}

export interface ComparePageViewModel {
  path: string
  left: CompareSkillView
  right: CompareSkillView
}
