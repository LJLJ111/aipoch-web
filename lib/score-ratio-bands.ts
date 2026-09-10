/** Ratio bands for compact Core bars on skill pages: green at 75% or above, orange at 45% or above, otherwise red. See `evaluation-styles` for leaderboard lists. */
export const SCORE_RATIO_GREEN_MIN = 0.75
export const SCORE_RATIO_ORANGE_MIN = 0.45

export type ScoreRatioBand = 'green' | 'orange' | 'red'

export function scoreRatioBand(ratio: number): ScoreRatioBand {
  if (ratio >= SCORE_RATIO_GREEN_MIN) return 'green'
  if (ratio >= SCORE_RATIO_ORANGE_MIN && ratio < SCORE_RATIO_GREEN_MIN) return 'orange'
  return 'red'
}

export function scoreRatioBandFromParts(score: number, max: number): ScoreRatioBand {
  const r = max > 0 ? score / max : 0
  return scoreRatioBand(r)
}

const CORE_BAR_TONE: Record<ScoreRatioBand, { fill: string; text: string }> = {
  green: { fill: '#1A6B3C', text: '#1A6B3C' },
  orange: { fill: '#B45309', text: '#B45309' },
  red: { fill: '#991B1B', text: '#991B1B' }
}

export function coreCapabilityBarStyle(ratio: number): {
  widthPct: number
  fill: string
  text: string
} {
  const widthPct = Math.min(100, ratio * 100)
  const tone = CORE_BAR_TONE[scoreRatioBand(ratio)]
  return { widthPct, fill: tone.fill, text: tone.text }
}

export function coreCapabilityTextTone(ratio: number): { fill: string; text: string } {
  return CORE_BAR_TONE[scoreRatioBand(ratio)]
}
