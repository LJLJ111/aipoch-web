import { expect, test } from 'bun:test'
import { renderToReadableStream } from 'react-dom/server'
import { ActivityRow } from '../../app/(commonLayout)/open-science/use-cases/_components/activity-row'
import { SessionMessageItem } from '../../app/(commonLayout)/open-science/use-cases/_components/message-item'
import type { NormalizedActivity } from '../../lib/use-case-types'

const render = async (element: React.JSX.Element) =>
  new Response(await renderToReadableStream(element)).text()

const activity = (overrides: Partial<NormalizedActivity>): NormalizedActivity => ({
  id: 'a1',
  title: '',
  status: 'completed',
  createdAt: 1,
  updatedAt: 2,
  ...overrides
})

const planInput = {
  task_summary: 'Backtest the strategy and publish.',
  phases: [
    {
      name: 'P1',
      delegations: [
        { name: 'D1', steps: [{ title: 'Collect inputs', description: 'Gather datasets.' }] }
      ]
    }
  ],
  desired_outputs: [],
  feasibility: { confidence: 'high', rationale: 'Inputs are local.' }
}

test('plan rows start expanded only when the group opts in', async () => {
  const planActivity = activity({
    providerToolName: 'mcp.open-science-plan.generate_plan',
    input: planInput
  })
  const collapsed = await render(<ActivityRow activity={planActivity} assets={{}} />)
  expect(collapsed).toContain('Created execution plan')
  expect(collapsed).not.toContain('Backtest the strategy')
  const expanded = await render(<ActivityRow activity={planActivity} assets={{}} defaultExpanded />)
  expect(expanded).toContain('Backtest the strategy')
  expect(expanded).toContain('Collect inputs')
})

test('notebook figures render outside the collapsed row details', async () => {
  const notebookActivity = activity({
    providerToolName: 'mcp__open-science-notebook__notebook_execute',
    run: {
      runId: 'r1',
      status: 'completed',
      script: 'draw_coverage_figure()',
      outputs: [{ type: 'display', data: { 'image/png': 'blob:coverage-figure' } }]
    }
  })
  // Collapsed row: the figure is still visible, the code stays hidden.
  const html = await render(<ActivityRow activity={notebookActivity} assets={{}} />)
  expect(html).toContain('blob:coverage-figure')
  expect(html).not.toContain('draw_coverage_figure()')
})

test('failed assistant turns show a Failed footer; completed turns keep Completed', async () => {
  const base = {
    type: 'message' as const,
    id: 'm1',
    role: 'assistant' as const,
    content: 'partial answer',
    createdAt: 1788220800000
  }
  // No completedAt on the failed turn: falls back to createdAt.
  const failed = await render(
    <SessionMessageItem message={{ ...base, status: 'failed' }} showTurnCompletion />
  )
  expect(failed).toContain('Failed ·')
  expect(failed).not.toContain('Completed ·')
  const errored = await render(
    <SessionMessageItem message={{ ...base, status: 'error' }} showTurnCompletion />
  )
  expect(errored).toContain('Failed ·')
  const completed = await render(
    <SessionMessageItem
      message={{ ...base, status: 'complete', completedAt: 1788220801000 }}
      showTurnCompletion
    />
  )
  expect(completed).toContain('Completed ·')
  expect(completed).not.toContain('Failed ·')
})
