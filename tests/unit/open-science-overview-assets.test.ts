import { expect, test } from 'bun:test'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const overviewDir = join(import.meta.dir, '../../public/open-science')
const overviewPath = join(overviewDir, 'overview.html')
const assetsDir = join(overviewDir, 'assets')

test('shares extracted image assets between the bilingual overview documents', async () => {
  const overview = await readFile(overviewPath, 'utf8')
  const assets = await readdir(assetsDir)

  expect(overview).not.toContain('data:image/')
  expect(assets.length).toBeGreaterThan(0)
  expect(assets.every((asset) => overview.includes(`/open-science/assets/${asset}`))).toBe(true)
})

test('keeps bilingual Open-Science branding hyphenated on one line', async () => {
  const overview = await readFile(overviewPath, 'utf8')
  const highlightedBrand = String.raw`<span class=\"highlight-text en\">Open-Science</span>`

  expect(overview.split(highlightedBrand)).toHaveLength(3)
  expect(overview.split('<strong>Open-Science</strong>')).toHaveLength(3)
  expect(overview).not.toMatch(/Open(?:<\/span>)?<br>Science/)
})
