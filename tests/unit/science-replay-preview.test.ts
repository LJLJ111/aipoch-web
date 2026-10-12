import { expect, test } from 'bun:test'
import {
  buildCsvPreviewModel,
  canOpenInNewTab,
  previewKindFor
} from '../../app/(commonLayout)/open-science/use-cases/_components/file-preview'
import { resolveAssetLinkTarget } from '../../app/(commonLayout)/open-science/use-cases/_components/session-markdown-streamdown'

test('previewKindFor classifies files by extension and MIME', () => {
  expect(previewKindFor('plot.svg')).toBe('image')
  expect(previewKindFor('data.csv')).toBe('csv')
  expect(previewKindFor('notes.md')).toBe('markdown')
  expect(previewKindFor('archive.zip')).toBeNull()
  expect(previewKindFor('点这里看结果')).toBeNull()
})

test('SVG blobs render inline but never open as a top-level document', () => {
  expect(canOpenInNewTab({ name: 'plot.svg', url: 'blob:x' })).toBe(false)
  expect(canOpenInNewTab({ name: 'plot', url: 'blob:x', mimeType: 'image/svg+xml' })).toBe(false)
  expect(canOpenInNewTab({ name: 'plot.png', url: 'blob:x' })).toBe(true)
  expect(canOpenInNewTab({ name: 'report.pdf', url: 'blob:x' })).toBe(true)
})

test('markdown asset links recover the real filename from the URL fragment', () => {
  // Labels like "点这里看结果" have no extension; the parser appends the real
  // name as `#<filename>`, and the fragment must be stripped before fetching.
  expect(
    resolveAssetLinkTarget('blob:https://site.test/uuid#data%20set.csv', '点这里看结果')
  ).toEqual({
    name: 'data set.csv',
    url: 'blob:https://site.test/uuid'
  })
  expect(resolveAssetLinkTarget('blob:https://site.test/uuid#figure-01.png', 'Figure')).toEqual({
    name: 'figure-01.png',
    url: 'blob:https://site.test/uuid'
  })
})

test('markdown asset links fall back to the URL name, then to nothing', () => {
  // Locally imported packages link /use-cases/… paths whose basename is real.
  expect(
    resolveAssetLinkTarget('/use-cases/case/objects/coverage_report.md', 'See the results')
  ).toEqual({ name: 'coverage_report.md', url: '/use-cases/case/objects/coverage_report.md' })
  // A label without an extension and a blob URL without a fragment cannot be
  // previewed: return null so the click keeps the browser default behavior.
  expect(resolveAssetLinkTarget('blob:https://site.test/uuid', '点这里看结果')).toBeNull()
  expect(resolveAssetLinkTarget('blob:https://site.test/uuid#archive.zip', '下载')).toBeNull()
})

test('csv preview model caps rows and columns and flags hidden ones', () => {
  const wide =
    `${Array.from({ length: 26 }, (_, i) => `col${i + 1}`).join(',')}\n` +
    `${Array.from({ length: 26 }, (_, i) => `v${i + 1}`).join(',')}\n`.repeat(3)
  const wideModel = buildCsvPreviewModel(wide)
  expect(wideModel?.headers).toHaveLength(24)
  expect(wideModel?.columnCount).toBe(26)
  expect(wideModel?.hiddenColumnCount).toBe(2)
  expect(wideModel?.rowCount).toBe(3)
  expect(wideModel?.totalKnown).toBe(true)

  const tall = `a,b\n${'1,2\n'.repeat(105)}`
  const tallModel = buildCsvPreviewModel(tall)
  expect(tallModel?.rows).toHaveLength(100)
  expect(tallModel?.rowCount).toBe(105)
  expect(tallModel?.totalKnown).toBe(false)
  expect(tallModel?.headers).toEqual(['a', 'b'])
  expect(tallModel?.hiddenColumnCount).toBe(0)

  // Ragged rows: the column count follows the widest row; short rows pad out.
  const ragged = buildCsvPreviewModel('a,b,c\n1\n2,2,2,2')
  expect(ragged?.columnCount).toBe(4)
  expect(ragged?.headers).toEqual(['a', 'b', 'c', ''])

  expect(buildCsvPreviewModel('')).toBeUndefined()
})
