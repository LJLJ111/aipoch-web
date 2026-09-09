import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('agent skills hero', () => {
  test('hides the community CTA while keeping the skills CTA', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/(commonLayout)/agent-skills/components/hero-section.tsx'),
      'utf8'
    )
    const activeSource = source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

    expect(source).toContain('Explore Skills')
    expect(source).toContain('href="/agent-skills/list"')
    expect(source).toContain('Join Community')
    expect(source).toContain('href="/community"')
    expect(activeSource).not.toContain('Join Community')
    expect(activeSource).not.toContain('href="/community"')
  })
})
