import { describe, expect, test } from 'bun:test'

describe('MedSkillAudit metadata', () => {
  test('uses the MedSkillAudit route for canonical and sharing URLs', async () => {
    const { metadata } = await import('../../app/(commonLayout)/medskillaudit/page')

    const canonicalUrl = String(metadata.alternates?.canonical)
    const openGraphUrl = String(metadata.openGraph?.url)

    expect(metadata.title).toContain('MedSkillAudit')
    expect(canonicalUrl).toEndWith('/medskillaudit')
    expect(openGraphUrl).toEndWith('/medskillaudit')
    expect(canonicalUrl).not.toContain('/benchmark')
    expect(openGraphUrl).not.toContain('/benchmark')
  })
})
