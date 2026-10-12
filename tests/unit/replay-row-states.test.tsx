import { expect, test } from 'bun:test'
import { renderToReadableStream } from 'react-dom/server'
import { SessionActivityGroup } from '../../app/(commonLayout)/open-science/use-cases/_components/activity-group'
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

test('notebook outputs collapse behind a closed details toggle while code stays open', async () => {
  const notebookActivity = activity({
    providerToolName: 'mcp__open-science-notebook__notebook_execute',
    run: {
      runId: 'r1',
      status: 'completed',
      script: 'print("coverage line")',
      outputs: [{ type: 'stream', name: 'stdout', text: 'coverage stream output' }]
    }
  })
  const html = await render(<ActivityRow activity={notebookActivity} assets={{}} defaultExpanded />)
  // Code section renders open; the stream output sits in a closed <details>
  // (the browser hides <details> content until opened; SSR HTML includes it).
  expect(html).toContain('print(&quot;coverage line&quot;)')
  expect(html).toContain('<details class=')
  expect(html).toContain('<summary')
  expect(html).not.toContain('<details open')
})

test('notebook code sections carry a line-number gutter', async () => {
  const notebookActivity = activity({
    providerToolName: 'mcp__open-science-notebook__notebook_execute',
    run: { runId: 'r2', status: 'completed', script: 'a = 1\nb = 2', outputs: [] }
  })
  const html = await render(<ActivityRow activity={notebookActivity} assets={{}} defaultExpanded />)
  expect(html.match(/grid grid-cols-\[auto_minmax\(0,1fr\)\]/g)?.length).toBe(2)
})

test('truncated activities disclose it below the expanded sections', async () => {
  const truncated = activity({
    providerToolName: 'mcp__acme__truncated_tool',
    essentialTruncated: true,
    input: { payload: 'x' }
  })
  const html = await render(<ActivityRow activity={truncated} assets={{}} defaultExpanded />)
  expect(html).toContain('Output truncated')
})

test('user messages render collapsed with the clamp applied', async () => {
  const longMessage = {
    type: 'message' as const,
    id: 'u1',
    role: 'user' as const,
    content: Array.from({ length: 20 }, (_, i) => `coverage line ${i + 1}`).join('\n'),
    status: 'complete',
    createdAt: 1788220800000
  }
  const html = await render(<SessionMessageItem message={longMessage} />)
  expect(html).toContain('line-clamp-[12]')
  expect(html).toContain('coverage line 20')
})

test('plan card starts compact: clamped summary, five steps, collapsed descriptions', async () => {
  const sevenSteps = {
    task_summary: 'Backtest the strategy and publish the report with all artifacts attached.',
    phases: [
      {
        name: 'P1',
        delegations: [
          {
            name: 'D1',
            steps: Array.from({ length: 7 }, (_, i) => ({
              title: `Coverage step ${i + 1}`,
              description: `Coverage step ${i + 1} description.`
            }))
          }
        ]
      }
    ],
    desired_outputs: [],
    feasibility: { confidence: 'high', rationale: 'Coverage rationale.' }
  }
  const planActivity = activity({
    providerToolName: 'mcp.open-science-plan.generate_plan',
    input: sevenSteps
  })
  const html = await render(<ActivityRow activity={planActivity} assets={{}} defaultExpanded />)
  // The summary clamp applies only after measurement proves overflow, so SSR
  // renders unclamped without the toggle; steps still start at five.
  expect(html).not.toContain('line-clamp-3')
  expect(html).not.toContain('Show full task')
  expect(html).toContain('Coverage step 5')
  expect(html).not.toContain('Coverage step 6')
  // React SSR splits text nodes with <!-- --> markers; strip them to assert prose.
  expect(html.replace(/<!-- -->/g, '')).toContain('+ 2 more steps')
  expect(html).toContain('Expand all')
  // Descriptions start collapsed behind the step toggle.
  expect(html).not.toContain('Coverage step 1 description.')
  expect(html).toContain('High confidence')
})

test('plan groups without a generate_plan row fall back to the generic title', async () => {
  const stepUpdate = activity({
    providerToolName: 'mcp.open-science-plan.update_step_status',
    input: { step_id: 'p3', status: 'completed' }
  })
  // A plan group holding only step updates is not a "created plan" event.
  const withoutPlan = await render(
    <SessionActivityGroup activities={[stepUpdate]} assets={{}} planGroup />
  )
  expect(withoutPlan).not.toContain('Created execution plan')
  const withPlan = await render(
    <SessionActivityGroup
      activities={[
        activity({ providerToolName: 'mcp.open-science-plan.generate_plan', input: planInput }),
        stepUpdate
      ]}
      assets={{}}
      planGroup
    />
  )
  expect(withPlan).toContain('Created execution plan')
})
