import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  EvaluationOverview,
  type SkillEvaluation
} from '../../app/(commonLayout)/agent-skills/components/evaluation-overview'

function renderOverview(evaluation: SkillEvaluation) {
  return renderToStaticMarkup(<EvaluationOverview evaluation={evaluation} />)
}

describe('evaluation overview', () => {
  test('rounds the overall score shown inside the score circle', () => {
    const html = renderOverview({
      overallScore: 86.6,
      overallTotal: 100,
      staticScore: 70,
      staticTotal: 100,
      dynamicPassed: 3,
      dynamicTotal: 5,
      evaluationReportUrl: '/agent-skills/demo/eval-result'
    })

    expect(html).toContain('>87</span>')
    expect(html).not.toContain('>86.6</span>')
  })

  test('uses the eval-result progress bar colors for static and dynamic scores', () => {
    const html = renderOverview({
      overallScore: 86,
      overallTotal: 100,
      staticScore: 70,
      staticTotal: 100,
      dynamicPassed: 3,
      dynamicTotal: 5,
      medicalTasks: [{ label: 'Demo task', score: 30, passed: 3, total: 5 }],
      evaluationReportUrl: '/agent-skills/demo/eval-result'
    })

    expect(html).toContain('bg-[#F59E0B]')
    expect(html).toContain('bg-[#EF4444]')
    expect(html).not.toContain('bg-[#FB923C]')
    expect(html).not.toContain('bg-[#FBBF24]')
  })
})
