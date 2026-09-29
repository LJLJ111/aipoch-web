import { describe, expect, test } from 'bun:test'

describe('claim page metadata', () => {
  test('identifies the claim flow without indexing or exposing token canonicals', async () => {
    const { metadata } = await import('../../app/(commonLayout)/claim/[token]/page')

    expect(metadata.title).toBe('Claim Your AIPOCH Profile')
    expect(metadata.description).toBe('Verify and claim your AIPOCH profile.')
    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(metadata.referrer).toBe('no-referrer')
    expect(metadata.alternates).toBeUndefined()
  })
})
