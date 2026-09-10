/**
 * Derive green/orange row tones from the score, then map them to progress bar, text, and score ring classes.
 * Scores of 85 or higher use green.
 */
export const toneBar = {
  green: 'bg-[#22C55E]',
  orange: 'bg-[#F59E0B]'
} as const

export const toneText = {
  green: 'text-[#1A6B3C]',
  orange: 'text-[#92400E]'
} as const

export const toneCircle = {
  green: 'border-[#B8DFC9] bg-[#E6F4ED]',
  orange: 'border-[#F6D860] bg-[#FEF3C7]'
} as const

export function scoreTone(s: number): 'green' | 'orange' {
  if (s >= 85) return 'green'
  return 'orange'
}
