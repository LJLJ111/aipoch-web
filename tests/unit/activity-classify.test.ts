import { expect, test } from 'bun:test'
import {
  ALL_ACTIVITY_RENDERERS,
  classifyActivityRenderer
} from '../../app/(commonLayout)/open-science/use-cases/_components/activity-classify'
import { buildActivityDetails } from '../../app/(commonLayout)/open-science/use-cases/_components/activity-row'
import type { NormalizedActivity } from '../../lib/use-case-types'
import { COVERAGE_FIXTURE_RENDERERS } from '../../mocks/fixtures/use-case-coverage'

const activity = (overrides: Partial<NormalizedActivity>): NormalizedActivity => ({
  id: 'a1',
  title: '',
  status: 'completed',
  createdAt: 1,
  updatedAt: 2,
  ...overrides
})

test('classifies dotted and underscored notebook tool forms', () => {
  expect(
    classifyActivityRenderer(
      activity({ providerToolName: 'mcp.open-science-notebook.notebook_execute' })
    )
  ).toBe('notebook')
  expect(
    classifyActivityRenderer(
      activity({ providerToolName: 'mcp__open-science-notebook__notebook_execute' })
    )
  ).toBe('notebook')
  // Providers that keep the identity in the title instead of providerToolName.
  expect(
    classifyActivityRenderer(
      activity({ title: 'mcp.open-science-notebook.notebook_execute', providerToolName: undefined })
    )
  ).toBe('notebook')
  expect(
    classifyActivityRenderer(
      activity({ providerToolName: 'mcp.open-science-notebook.notebook_restart' })
    )
  ).toBe('notebook-control')
  expect(
    classifyActivityRenderer(
      activity({ providerToolName: 'mcp__open-science-notebook__notebook_state' })
    )
  ).toBe('notebook-control')
  expect(classifyActivityRenderer(activity({ providerToolName: 'mcp__acme__mystery_tool' }))).toBe(
    'generic-fallback'
  )
  // A lookalike server must not land in the notebook renderers.
  expect(
    classifyActivityRenderer(
      activity({ providerToolName: 'mcp.open-science-notebook-staging.notebook_execute' })
    )
  ).toBe('generic-fallback')
})

test('fixture corpus covers every shipped renderer', () => {
  expect([...COVERAGE_FIXTURE_RENDERERS].sort()).toEqual([...ALL_ACTIVITY_RENDERERS].sort())
})

test('kernel-run display names follow the resolved language', () => {
  const python = buildActivityDetails(
    activity({
      providerToolName: 'mcp.open-science-notebook.notebook_execute',
      input: { language: 'python', code: 'print("hi")' }
    }),
    {}
  )
  expect(python.displayName).toBe('Notebook run')
  expect(python.sections[0]).toMatchObject({ kind: 'code', label: 'Code', language: 'python' })

  const repl = buildActivityDetails(
    activity({
      providerToolName: 'mcp__open-science-notebook__repl_execute',
      input: { code: 'console.log(1)' }
    }),
    {}
  )
  expect(repl.displayName).toBe('Agent SDK')
  expect(repl.sections[0]).toMatchObject({ kind: 'code', language: 'javascript' })

  const bash = buildActivityDetails(
    activity({ providerToolName: 'mcp.open-science-notebook.bash_execute', input: { code: 'ls' } }),
    {}
  )
  expect(bash.displayName).toBe('Shell')
  expect(bash.sections[0]).toMatchObject({ kind: 'code', label: 'Command', language: 'bash' })

  // No explicit kernel field: the R heuristic picks up `<-`.
  const rCell = buildActivityDetails(
    activity({
      providerToolName: 'mcp.open-science-notebook.notebook_execute',
      input: { code: 'x <- c(1, 2)' }
    }),
    {}
  )
  expect(rCell.sections[0]).toMatchObject({ kind: 'code', language: 'r' })
})

test('notebook control tools render friendly summary cards', () => {
  const restart = buildActivityDetails(
    activity({
      providerToolName: 'mcp.open-science-notebook.notebook_restart',
      output: [
        { type: 'text', text: '{"status": "restarted", "kernelStatus": "idle", "cells": 3}' }
      ]
    }),
    {}
  )
  expect(restart.displayName).toBe('Restart notebook')
  const restartSummary = restart.sections[0]
  if (restartSummary.kind !== 'summary') throw new Error('expected a summary section')
  expect(restartSummary.summary.fields).toEqual([
    { label: 'Status', value: 'Restarted' },
    { label: 'Kernel', value: 'Idle' },
    { label: 'Cells', value: '3' }
  ])
  expect(restartSummary.summary.note).toBe('In-memory variables cleared. Run history preserved.')

  const state = buildActivityDetails(
    activity({
      providerToolName: 'mcp__open-science-notebook__notebook_state',
      output: '{"kernelStatus": "active", "cellCount": 2, "runCount": 1, "environmentCount": 1}'
    }),
    {}
  )
  expect(state.displayName).toBe('Notebook state')
  const stateSummary = state.sections[0]
  if (stateSummary.kind !== 'summary') throw new Error('expected a summary section')
  expect(stateSummary.summary.fields).toEqual([
    { label: 'Kernel', value: 'Active' },
    { label: 'Cells', value: '2' },
    { label: 'Runs', value: '1' },
    { label: 'Environments', value: '1' }
  ])
})

test('unknown tools keep their raw provider identity', () => {
  const details = buildActivityDetails(
    activity({ providerToolName: 'mcp__acme__mystery_tool', input: { a: 1 } }),
    {}
  )
  expect(details.displayName).toBe('mcp__acme__mystery_tool')
  // Without a provider name, fall back to the tool-kind label, then "Tool".
  expect(buildActivityDetails(activity({ toolKind: 'execute' }), {}).displayName).toBe('Terminal')
  expect(buildActivityDetails(activity({}), {}).displayName).toBe('Tool')
})
