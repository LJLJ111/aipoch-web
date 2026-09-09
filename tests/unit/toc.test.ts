import { describe, expect, test } from 'bun:test'
import { extractToc } from '../../lib/toc'

describe('extractToc', () => {
  test('extracts headings from markdown containing numeric angle-bracket text', async () => {
    const toc = await extractToc(`
# Abstract Summarizer

## Common Pitfalls

- Too short (<150 words) -> Missing key information

## References
`)

    expect(toc.map((item) => item.value)).toEqual(['Common Pitfalls', 'References'])
  })
})
