import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { CompareDetailData } from '../../service/compare'

const rawResult = {
  meta: {
    skill_name: 'left-skill',
    category: 'Evidence Insight',
    description: 'Evidence workflow comparison.'
  },
  final: { score: 90, max: 100, static_weighted: 36, dynamic_weighted: 54 },
  static_score: { subtotal: 90, max: 100, categories: {} },
  dynamic_score: {
    execution_avg: 90,
    max: 100,
    assertion_pass_rate: { passed: 1, total: 1 },
    inputs: []
  },
  veto_gates: {
    skill_veto: {
      stability: 'PASS',
      contract: 'PASS',
      determinism: 'PASS',
      security: 'PASS'
    },
    research_veto: { applicable: false }
  },
  key_strengths: []
}

const skill = {
  rank_skill_id: 1,
  skill_name: 'left-skill',
  skill_title: 'Left Skill',
  skill_description: 'Left skill description.',
  category: 'Evidence Insight',
  skill_author: 'AIPOCH',
  total_score: 90,
  raw_result_json: rawResult
}

let compareDetail: CompareDetailData | null

mock.module('@/service/compare', () => ({
  fetchCompareDetail: async () => compareDetail
}))

describe('compare page metadata', () => {
  beforeEach(() => {
    compareDetail = {
      path: 'left-vs-right',
      left_skill: skill,
      right_skill: { ...skill, rank_skill_id: 2, skill_name: 'right-skill' },
      seo: {
        title: 'Left Skill vs Right Skill | AIPOCH',
        h1: 'Left Skill vs Right Skill',
        description: 'Compare two audited medical research skills.',
        keywords: ['skill comparison', 'medical research']
      }
    }
  })

  test('publishes complete page-specific metadata for a valid comparison', async () => {
    const { generateMetadata } = await import('../../app/(commonLayout)/compare/[slug]/page')
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'left-vs-right' })
    })
    const title = 'Left Skill vs Right Skill | AIPOCH'
    const description = 'Compare two audited medical research skills.'
    const canonical = 'https://aipoch.com/compare/left-vs-right'

    expect(metadata.title).toBe(title)
    expect(metadata.description).toBe(description)
    expect(String(metadata.alternates?.canonical)).toBe(canonical)
    expect(metadata.openGraph).toMatchObject({ title, description, url: canonical })
    expect(metadata.twitter).toMatchObject({ title, description })
    expect(metadata.keywords).toEqual(['skill comparison', 'medical research'])
  })

  test('prevents indexing when comparison data is unavailable', async () => {
    compareDetail = null
    const { generateMetadata } = await import('../../app/(commonLayout)/compare/[slug]/page')
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'missing-comparison' })
    })

    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
