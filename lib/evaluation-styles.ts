import { MEDICAL_SCORE_GREEN_MIN, MEDICAL_SCORE_YELLOW_MIN } from '@/lib/map-score-detail'
import { scoreRatioBand, type ScoreRatioBand } from '@/lib/score-ratio-bands'

/** Leaderboard static_score category order and labels, matching the mapping to SkillEvaluation.coreCategories. */
export const LEADERBOARD_CORE_CATEGORY_ORDER = [
  'functional_suitability',
  'reliability',
  'performance_context',
  'agent_usability',
  'human_usability',
  'security',
  'maintainability',
  'agent_specific'
] as const

export type LeaderboardCoreCategoryKey = (typeof LEADERBOARD_CORE_CATEGORY_ORDER)[number]

export const LEADERBOARD_CORE_CATEGORY_LABELS: Record<LeaderboardCoreCategoryKey, string> = {
  functional_suitability: 'Functional Suitability',
  reliability: 'Reliability',
  performance_context: 'Performance & Context',
  agent_usability: 'Agent Usability',
  human_usability: 'Human Usability',
  security: 'Security',
  maintainability: 'Maintainability',
  agent_specific: 'Agent-Specific'
}

/** Bar and text colors for the leaderboard's Core Capability list; the skill sidebar uses score-ratio-bands. */
const LEADERBOARD_CORE_TONE: Record<ScoreRatioBand, { fill: string; text: string }> = {
  green: { fill: '#22C55E', text: '#15803D' },
  orange: { fill: '#FBBF24', text: '#CA8A04' },
  red: { fill: '#F87171', text: '#DC2626' }
}

export function leaderboardCoreCapabilityTone(ratio: number): { fill: string; text: string } {
  return LEADERBOARD_CORE_TONE[scoreRatioBand(ratio)]
}

/** Medical score bands based on total (at least 70 / at least 40), matching the skill page's Evaluation widget. */
export type MedicalTone = 'green' | 'orange' | 'red'

export function medicalToneFromScore(score: number): MedicalTone {
  if (score >= MEDICAL_SCORE_GREEN_MIN) return 'green'
  if (score >= MEDICAL_SCORE_YELLOW_MIN) return 'orange'
  return 'red'
}

export function medicalScoreBadgeClass(score: number): string {
  if (score >= MEDICAL_SCORE_GREEN_MIN) return 'bg-[#E6F4ED] text-[#1A6B3C]'
  if (score >= MEDICAL_SCORE_YELLOW_MIN) return 'bg-[#FEF3C7] text-[#92400E]'
  return 'bg-[#FEE2E2] text-[#991B1B]'
}

export function medicalScoreSummarySquareClass(score: number): string {
  if (score >= MEDICAL_SCORE_GREEN_MIN) return 'bg-[#22C55E]'
  if (score >= MEDICAL_SCORE_YELLOW_MIN) return 'bg-[#F59E0B]'
  return 'bg-[#EF4444]'
}

const CIRCLE: Record<MedicalTone, string> = {
  green: 'border-[#B8DFC9] bg-[#E6F4ED] text-[#1A6B3C]',
  orange: 'border-[#F6D860] bg-[#FEF3C7] text-[#92400E]',
  red: 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]'
}

const TEXT: Record<MedicalTone, string> = {
  green: 'text-[#1A6B3C]',
  orange: 'text-[#92400E]',
  red: 'text-[#991B1B]'
}

const TOP_BAR: Record<MedicalTone, string> = {
  green: 'bg-[#22C55E]',
  orange: 'bg-[#F59E0B]',
  red: 'bg-[#EF4444]'
}

export function medicalToneCircleClass(tone: MedicalTone): string {
  return CIRCLE[tone]
}

export function medicalToneTextClass(tone: MedicalTone): string {
  return TEXT[tone]
}

export function medicalToneTopBarClass(tone: MedicalTone): string {
  return TOP_BAR[tone]
}

const DETAIL_CARD_BORDER: Record<MedicalTone, string> = {
  green: 'border-[#E2E2E2]',
  orange: 'border-[#F6D860]',
  red: 'border-[#FCA5A5]'
}

export function medicalToneDetailCardBorderClass(tone: MedicalTone): string {
  return DETAIL_CARD_BORDER[tone]
}
