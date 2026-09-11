import { describe, expect, mock, test } from 'bun:test'

mock.module('@/service/leaderboard-results', () => ({
  fetchLeaderboardResultDetail: async () => ({
    data: {
      raw_result_json: {
        meta: {
          skill_name: 'Systematic Review Assistant',
          category: 'Evidence Insight',
          description: 'Audited skill for reproducible systematic review workflows.'
        },
        final: {},
        static_score: {},
        dynamic_score: {},
        veto_gates: {},
        key_strengths: []
      }
    }
  })
}))

describe('leaderboard item metadata', () => {
  test('uses item data for title, description, social metadata, and self-canonical', async () => {
    const { generateMetadata } = await import(
      '../../app/(commonLayout)/leaderboard/items/[slug]/page'
    )
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'systematic-review-assistant' })
    })
    const title = 'Systematic Review Assistant — Evaluation Results | AIPOCH'
    const description = 'Audited skill for reproducible systematic review workflows.'
    const canonical = 'https://aipoch.com/leaderboard/items/systematic-review-assistant'

    expect(metadata.title).toBe(title)
    expect(metadata.description).toBe(description)
    expect(String(metadata.alternates?.canonical)).toBe(canonical)
    expect(metadata.openGraph).toMatchObject({ title, description, url: canonical })
    expect(metadata.twitter).toMatchObject({ title, description })
  })

  test('self-canonicalizes each indexable period leaderboard', async () => {
    const periodPages = [
      {
        module: '../../app/(commonLayout)/leaderboard/daily/page',
        title: 'Daily Leaderboard | AIPOCH',
        description: 'Daily rankings for audited medical research agent skills.',
        canonical: 'https://aipoch.com/leaderboard/daily'
      },
      {
        module: '../../app/(commonLayout)/leaderboard/weekly/page',
        title: 'Weekly Leaderboard | AIPOCH',
        description: 'Weekly rankings for audited medical research agent skills.',
        canonical: 'https://aipoch.com/leaderboard/weekly'
      },
      {
        module: '../../app/(commonLayout)/leaderboard/monthly/page',
        title: 'Monthly Leaderboard | AIPOCH',
        description: 'Monthly rankings for audited medical research agent skills.',
        canonical: 'https://aipoch.com/leaderboard/monthly'
      }
    ] as const

    for (const periodPage of periodPages) {
      const { metadata } = await import(periodPage.module)

      expect(metadata.title).toBe(periodPage.title)
      expect(metadata.description).toBe(periodPage.description)
      expect(String(metadata.alternates?.canonical)).toBe(periodPage.canonical)
      expect(metadata.openGraph).toMatchObject({
        title: periodPage.title,
        description: periodPage.description,
        url: periodPage.canonical
      })
      expect(metadata.twitter).toMatchObject({
        title: periodPage.title,
        description: periodPage.description
      })
    }
  })
})
