import { describe, expect, test } from 'bun:test'
import { mapCompareDetailToViewModel } from '../../app/(commonLayout)/compare/[slug]/components/compare-mappers'
import type { CompareDetailData, CompareSkillDetail } from '../../service/compare'

const baseRawResult = {
  meta: {
    skill_name: 'demo-skill',
    category: 'Medical Research',
    description: 'Raw result description'
  },
  final: {
    score: 91.4,
    max: 100,
    static_weighted: 36,
    dynamic_weighted: 55
  },
  static_score: {
    subtotal: 90,
    max: 100,
    categories: {
      functional_suitability: {
        score: 11,
        max: 12,
        note: 'Covers the core functional requirements.'
      }
    }
  },
  dynamic_score: {
    execution_avg: 92,
    max: 100,
    assertion_pass_rate: {
      passed: 4,
      total: 5
    },
    inputs: [
      {
        total: 92,
        label: 'Evaluate a clinical evidence prompt.',
        type: 'Canonical',
        assertions_passed: 4,
        assertions_total: 5,
        note: 'Clear answer with minor omissions.'
      }
    ]
  },
  veto_gates: {
    skill_veto: {
      stability: 'PASS',
      contract: 'PASS',
      determinism: 'PASS',
      security: 'PASS'
    },
    research_veto: {
      applicable: false
    }
  },
  key_strengths: ['Clear medical research workflow.']
}

function createSkill(overrides: Partial<CompareSkillDetail> = {}): CompareSkillDetail {
  return {
    rank_skill_id: 1,
    skill_name: 'demo-skill',
    skill_title: 'Demo Skill',
    skill_description: 'Compare API description',
    category: 'Medical Research',
    skill_author: 'AIPOCH',
    total_score: 88.6,
    raw_result_json: baseRawResult,
    ...overrides
  }
}

function createCompareData(overrides: Partial<CompareDetailData> = {}): CompareDetailData {
  return {
    path: 'demo-vs-demo',
    left_skill: createSkill(),
    right_skill: createSkill({ rank_skill_id: 2, skill_name: 'right-demo' }),
    seo: null,
    ...overrides
  }
}

describe('mapCompareDetailToViewModel', () => {
  test('maps a renderable compare payload into left and right skill views', () => {
    const viewModel = mapCompareDetailToViewModel(createCompareData())

    expect(viewModel?.path).toBe('demo-vs-demo')
    expect(viewModel?.left.totalScore).toBe(89)
    expect(viewModel?.left.description).toBe('Compare API description')
    expect(viewModel?.right.rankSkillId).toBe(2)
  })

  test('falls back to an empty description when descriptive fields have no value', () => {
    const rawResultWithoutDescription = {
      ...baseRawResult,
      meta: {
        ...baseRawResult.meta,
        description: ''
      }
    }

    const viewModel = mapCompareDetailToViewModel(
      createCompareData({
        left_skill: createSkill({
          skill_description: null,
          raw_result_json: rawResultWithoutDescription
        })
      })
    )

    expect(viewModel?.left.description).toBe('')
  })
})
