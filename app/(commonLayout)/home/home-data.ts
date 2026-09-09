export const facts = [
  { value: '3', label: 'Platforms' },
  { value: '14', label: 'Models' },
  { value: '18', label: 'Featured skills' },
  { value: '24', label: 'Connectors' }
] as const

export const marqueePrimary = [
  'Evidence synthesis',
  'Meta-analysis',
  'Protocol design',
  'SAP drafting',
  'Cohort matching',
  'Survival models',
  'PRISMA screening',
  'Effect sizes',
  'Data cleaning',
  'Reproducible pipelines',
  'Figure generation',
  'Citation-grade writing'
] as const

export const marqueeSecondary = [
  'Model-agnostic',
  'Local-first',
  'Open source',
  'SKILL.md',
  'Notebook kernels',
  'Life-science connectors',
  'Audited by MedSkillAudit',
  'Inspectable',
  'Approvable',
  'Traceable',
  'Reproducible'
] as const

export const DEFAULT_SKILL_LIBRARY_COUNT = 550

/** Fallback GitHub star count for the homepage when the API request fails. */
export const DEFAULT_GITHUB_STAR_COUNT = 3500

const compactGithubCountFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
})

/** Format GitHub counts using K/M notation with a fixed English locale, independent of system settings. */
export const formatCompactGithubCount = (value: number): string => {
  const count = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
  return compactGithubCountFormatter.format(count)
}

export const homeHeroStats = [
  { value: '15', label: 'OFFICIAL MODEL APIs', detail: '+ CUSTOM GATEWAY' },
  { value: '4', label: 'AGENT FRAMEWORKS' },
  { value: '597', label: 'SKILLS', testId: 'home-hero-stat-skills' },
  { value: '24', label: 'SCIENCE CONNECTORS' }
] as const

export const resolveSkillLibraryCount = (value?: number | null): number =>
  Number.isFinite(value) && Number(value) > 0
    ? Math.floor(Number(value))
    : DEFAULT_SKILL_LIBRARY_COUNT

export const skillAreas = [
  ['Evidence Insights', 'Literature synthesis, appraisal, and meta-analysis workflows.'],
  ['Protocol Design', 'Study protocols, endpoints, and statistical analysis plans.'],
  ['Data Analysis', 'Cleaning, modelling, and reproducible statistical pipelines.'],
  ['Academic Writing', 'Manuscripts, figures, and citation-grade reporting.']
] as const

export const agentNames = [
  'Claude Code',
  'Codex',
  'Open Code',
  'Hermes Agent',
  'OpenClaw',
  'any other SKILL.md-compatible agent'
] as const
