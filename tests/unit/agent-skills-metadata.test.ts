import { describe, expect, mock, test } from 'bun:test'

process.env.SITE_DOMAIN = 'https://aipoch.com'

const actualSkills = await import('../../service/skills')

mock.module('@/service/skills', () => ({
  ...actualSkills,
  fetchSkillDetail: async (slug: string) => {
    if (slug === 'gsea') {
      return {
        title: 'GSEA',
        description: 'Gene set enrichment analysis skill for biomedical research agents.'
      }
    }
    throw new Error('not found')
  }
}))

describe('Agent Skills metadata', () => {
  test('self-canonicalizes the Agent Skills hub and list pages', async () => {
    const { metadata: hubMetadata } = await import('../../app/(commonLayout)/agent-skills/page')
    const { metadata: listMetadata } = await import(
      '../../app/(commonLayout)/agent-skills/list/layout'
    )

    expect(String(hubMetadata.alternates?.canonical)).toBe('https://aipoch.com/agent-skills')
    expect(String(hubMetadata.openGraph?.url)).toBe('https://aipoch.com/agent-skills')
    expect(String(listMetadata.alternates?.canonical)).toBe('https://aipoch.com/agent-skills/list')
    expect(String(listMetadata.openGraph?.url)).toBe('https://aipoch.com/agent-skills/list')
    expect(String(hubMetadata.twitter?.title)).toBe(String(hubMetadata.title))
    expect(String(hubMetadata.twitter?.description)).toBe(String(hubMetadata.description))
    expect(String(listMetadata.twitter?.title)).toBe(String(listMetadata.title))
    expect(String(listMetadata.twitter?.description)).toBe(String(listMetadata.description))
  })

  test('self-canonicalizes individual skill pages', async () => {
    const { generateMetadata } = await import('../../app/(commonLayout)/agent-skills/[slug]/page')
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'gsea' }) })

    expect(String(metadata.alternates?.canonical)).toBe('https://aipoch.com/agent-skills/gsea')
    expect(String(metadata.openGraph?.url)).toBe('https://aipoch.com/agent-skills/gsea')
    expect(metadata.title).toBe('GSEA | AIPOCH Agent Skill')
    expect(String(metadata.twitter?.title)).toBe(String(metadata.title))
    expect(String(metadata.twitter?.description)).toBe(String(metadata.description))
  })
})
