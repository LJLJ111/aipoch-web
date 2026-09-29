import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

const MEDSKILLAUDIT_IMAGE =
  'https://statics.aipoch.com/public/f/image/medskillaudit-social-card-bcc353ec.png'
const AUTHORS = [
  'Yingyong Hou',
  'Xinyuan Lao',
  'Huimei Wang',
  'Qianyu Yao',
  'Wei Chen',
  'Bocheng Huang',
  'Fei Sun',
  'Yuxian Lv',
  'Weiqi Lei',
  'Xueqian Wen',
  'Pengfei Xia',
  'Zhujun Tan',
  'Shengyang Xie'
]

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
    expect(metadata.openGraph?.images).toEqual([
      {
        url: MEDSKILLAUDIT_IMAGE,
        width: 1280,
        height: 720,
        alt: 'MedSkillAudit — audit before deployment'
      }
    ])
    expect(metadata.twitter?.images).toEqual([MEDSKILLAUDIT_IMAGE])
  })

  test('links the page, software, and complete arXiv v1 citation in one JSON-LD graph', async () => {
    const { default: MedSkillAuditPage } = await import(
      '../../app/(commonLayout)/medskillaudit/page'
    )
    const html = renderToStaticMarkup(MedSkillAuditPage())
    const content = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]

    expect(content).toBeTruthy()
    const structuredData = JSON.parse(content ?? '{}') as {
      '@context'?: string
      '@graph'?: Record<string, unknown>[]
    }
    expect(structuredData['@context']).toBe('https://schema.org')
    const graph = structuredData['@graph'] ?? []
    expect(graph.map((entity) => entity['@type'])).toEqual([
      'Organization',
      'WebPage',
      'SoftwareApplication',
      'BreadcrumbList',
      'ScholarlyArticle'
    ])

    const webpage = graph.find((entity) => entity['@type'] === 'WebPage')
    const software = graph.find((entity) => entity['@type'] === 'SoftwareApplication')
    const article = graph.find((entity) => entity['@type'] === 'ScholarlyArticle')
    expect(webpage).toMatchObject({
      '@id': 'https://aipoch.com/medskillaudit#webpage',
      url: 'https://aipoch.com/medskillaudit',
      mainEntity: { '@id': 'https://aipoch.com/medskillaudit#software' }
    })
    expect(software).toMatchObject({
      '@id': 'https://aipoch.com/medskillaudit#software',
      name: 'MedSkillAudit',
      citation: { '@id': 'https://arxiv.org/abs/2604.20441' }
    })
    expect(article).toMatchObject({
      '@id': 'https://arxiv.org/abs/2604.20441',
      headline:
        'MedSkillAudit: A Domain-Specific Audit Framework for Medical Research Agent Skills',
      datePublished: '2026-04-22',
      version: 'v1',
      url: 'https://arxiv.org/abs/2604.20441',
      identifier: [
        {
          '@type': 'PropertyValue',
          propertyID: 'arXiv',
          value: 'arXiv:2604.20441',
          url: 'https://arxiv.org/abs/2604.20441'
        },
        {
          '@type': 'PropertyValue',
          propertyID: 'DOI',
          value: '10.48550/arXiv.2604.20441',
          url: 'https://doi.org/10.48550/arXiv.2604.20441'
        }
      ],
      sameAs: 'https://doi.org/10.48550/arXiv.2604.20441',
      publisher: {
        '@type': 'Organization',
        name: 'arXiv',
        url: 'https://arxiv.org'
      }
    })
    expect((article?.author as { name: string }[]).map((author) => author.name)).toEqual(AUTHORS)
  })
})
