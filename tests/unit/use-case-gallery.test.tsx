import { expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { UseCaseIndexEntry } from '../../lib/use-case-types'

const entries: UseCaseIndexEntry[] = Array.from({ length: 15 }, (_, index) => ({
  slug: `research-${index + 1}`,
  title: `Research case ${index + 1}`,
  preview: { image: `/case-${index + 1}.png` }
}))
let result: UseCaseIndexEntry[] | null = entries
mock.module('@/service/open-science-use-cases.server', () => ({
  fetchUseCaseList: async () => result
}))
const { default: UseCasesPage } = await import(
  '../../app/(commonLayout)/open-science/use-cases/page'
)
const render = async (page?: string) =>
  renderToStaticMarkup(await UseCasesPage({ searchParams: Promise.resolve({ page }) }))

test('server-renders the first batch with real case links and a progressive loading fallback', async () => {
  result = entries
  const html = await render()
  expect(html).toContain('href="/open-science/use-cases/research-6"')
  expect(html).not.toContain('href="/open-science/use-cases/research-7"')
  expect(html).toContain('href="/open-science/use-cases?page=2#use-case-grid"')
  expect(html).toContain('Showing 6 of 15 use cases')
  expect(html).not.toContain('Use case pages')
  expect(html).not.toContain('View use case in AIPOCH Lab')
})

test('old page links reveal cumulative batches and clamp invalid or excessive page numbers', async () => {
  result = entries
  expect(await render('2')).toContain('Showing 12 of 15 use cases')
  expect(await render('999')).toContain('Showing 15 of 15 use cases')
  for (const page of ['-2', 'invalid', '0']) {
    expect(await render(page)).toContain('Showing 6 of 15 use cases')
  }
  const last = await render('3')
  expect(last).toContain('All use cases loaded')
  expect(last).not.toContain('Load more use cases')
  expect(last).toContain('href="/open-science/use-cases/research-1"')
  expect(last).toContain('href="/open-science/use-cases/research-15"')
})

test('keeps full long titles in accessible links even when their visible text is clamped', async () => {
  const title =
    'A long research title about scientific evidence, reproducible analysis, and sharing research records across projects and computers'
  result = [{ slug: 'long-title', title }]
  const html = await render()
  expect(html).toContain(`title="${title}"`)
  expect(html).toContain(title)
  expect(html).toContain('line-clamp-2')
})

test('keeps empty and failed catalog states distinct without a loading control', async () => {
  result = []
  const empty = await render()
  expect(empty).toContain('No published use cases yet.')
  expect(empty).not.toContain('Load more use cases')
  result = null
  const failed = await render()
  expect(failed).toContain('Use cases could not be loaded right now.')
  expect(failed).not.toContain('No published use cases yet.')
  expect(failed).not.toContain('Load more use cases')
})
