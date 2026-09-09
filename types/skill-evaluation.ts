/** Props for the skill detail evaluation section. */
export interface SkillEvaluation {
  overallScore: number
  overallTotal: number
  staticScore: number
  staticTotal: number
  dynamicPassed?: number
  dynamicTotal?: number
  evaluationReportUrl?: string | null
  coreCategories?: Array<{ key?: string; label: string; score: number; max: number }>
  medicalTasks?: Array<{
    label: string
    score: number
    passed: number
    total: number
    /** When present, color each dot by its `result` (for example, green for PASS); otherwise fill green/red from the left using passed/total. */
    assertions?: Array<{ result?: string }>
  }>
}
