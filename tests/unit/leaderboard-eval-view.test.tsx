import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeaderboardEvalView } from '../../app/(commonLayout)/leaderboard/items/[slug]/components/leaderboard-eval-view'
import type { LeaderboardEvaluationPayload } from '../../app/(commonLayout)/leaderboard/items/[slug]/components/leaderboard-evaluation'
import type { SkillEvaluation } from '../../types/skill-evaluation'

const longMedicalTaskLabel =
  'Evaluate whether the skill correctly handles a long patient scenario with multiple constraints, contraindications, requested citations, and a refusal boundary when the prompt asks for unsafe clinical advice.'
const longMedicalTaskNote =
  'The response identifies the safety boundary and gives general educational guidance, but it misses several requested caveats and does not explain why the unsafe clinical instruction should be declined.'
const longAssertionText =
  'The answer should explicitly decline the unsafe clinical request, explain the reason in patient-safe language, and redirect to general educational information without giving step-by-step treatment instructions.'
const longCoreCapabilityNote =
  'The skill covers the core workflow and produces structured output, but the implementation needs more consistent handling of edge cases, clearer recovery behavior, and stronger evidence that repeated executions remain stable.'
const longResearchVetoDetail =
  'The submission references relevant research-style constraints, but the evaluation detail remains lengthy enough that it should be visually capped in the table while preserving the complete text for inspection.'
const skillVetoDescription = 'System remains stable across varied inputs and edge cases'

function renderLeaderboardEvalView() {
  const data: LeaderboardEvaluationPayload = {
    meta: {
      skill_name: 'Demo Skill',
      category: 'Medical Research'
    },
    veto_gates: {
      skill_veto: {
        stability: 'PASS',
        contract: 'PASS',
        determinism: 'PASS',
        security: 'PASS'
      },
      research_veto: {
        applicable: true,
        gate: 'PASS',
        scientific_integrity: {
          result: 'PASS',
          detail: longResearchVetoDetail
        }
      }
    },
    static_score: {
      subtotal: 80,
      max: 100,
      categories: {
        functional_suitability: {
          score: 32,
          max: 40,
          note: longCoreCapabilityNote
        }
      }
    },
    dynamic_score: {
      execution_avg: 75,
      max: 100,
      assertion_pass_rate: { passed: 3, total: 4 },
      inputs: [
        {
          total: 75,
          label: longMedicalTaskLabel,
          type: 'Scenario',
          assertions_passed: 3,
          assertions_total: 4,
          note: longMedicalTaskNote,
          assertions: [{ text: longAssertionText, result: 'PASS' }]
        }
      ]
    },
    final: {
      score: 77,
      max: 100,
      static_weighted: 32,
      dynamic_weighted: 45
    },
    key_strengths: ['Handles safe medical guidance clearly.']
  }

  const evaluation: SkillEvaluation = {
    overallScore: 77,
    overallTotal: 100,
    staticScore: 80,
    staticTotal: 100,
    dynamicPassed: 3,
    dynamicTotal: 4,
    evaluationReportUrl: null
  }

  return renderToStaticMarkup(<LeaderboardEvalView data={data} evaluation={evaluation} />)
}

describe('leaderboard eval view', () => {
  test('clamps the medical task summary label and exposes the full label in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain('line-clamp-5')
    expect(html).toContain(`title="${longMedicalTaskLabel}"`)
  })

  test('clamps the medical task detail label to two lines', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${longMedicalTaskLabel}" class="line-clamp-2`)
  })

  test('clamps the medical task note to two lines and exposes the full note in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${longMedicalTaskNote}" class="mt-3 mb-4 line-clamp-2`)
  })

  test('clamps the medical task assertion text to two lines and exposes the full text in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${longAssertionText}" class="line-clamp-2`)
  })

  test('clamps the core capability note to three lines and exposes the full note in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${longCoreCapabilityNote}" class="line-clamp-3`)
  })

  test('clamps the research veto detail to three lines and exposes the full detail in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${longResearchVetoDetail}" class="line-clamp-3`)
  })

  test('clamps the skill veto description to three lines and exposes the full description in title', () => {
    const html = renderLeaderboardEvalView()

    expect(html).toContain(`title="${skillVetoDescription}" class="mb-2 line-clamp-3`)
  })
})
