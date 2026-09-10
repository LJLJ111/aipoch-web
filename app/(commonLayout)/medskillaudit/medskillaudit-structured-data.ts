import { buildAipochOrganizationSchema } from '@/lib/aipoch-organization'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { validationStudy } from './benchmark-data'

export const medSkillAuditSeo = {
  title: 'MedSkillAudit - Audit Framework for Medical Research Agent Skills · AIPOCH',
  description:
    'Learn how MedSkillAudit evaluates medical research agent skills with veto gates, static design scoring, dynamic medical-task testing, and expert-aligned release dispositions.'
} as const

const pageUrl = `${SITE_DOMAIN}/medskillaudit`
const organizationId = `${SITE_DOMAIN}/#organization`
const webpageId = `${pageUrl}#webpage`
const softwareId = `${pageUrl}#software`
const breadcrumbId = `${pageUrl}#breadcrumb`
const arxivUrl = 'https://arxiv.org/abs/2604.20441'
const doi = '10.48550/arXiv.2604.20441'
const doiUrl = `https://doi.org/${doi}`

export const medSkillAuditSocialImage = {
  url: `${SITE_DOMAIN}/medskillaudit/medskillaudit-social-card.png`,
  width: 1280,
  height: 720,
  alt: 'MedSkillAudit — audit before deployment'
} as const

export const medSkillAuditMetadata = createPageMetadata({
  ...medSkillAuditSeo,
  canonical: pageUrl,
  type: 'article',
  image: medSkillAuditSocialImage
})

/** Keep the structured citation tied to the paper facts rendered on this page. */
export const buildMedSkillAuditStructuredData = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@graph': [
    buildAipochOrganizationSchema(),
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: pageUrl,
      name: medSkillAuditSeo.title,
      description: medSkillAuditSeo.description,
      about: { '@id': organizationId },
      breadcrumb: { '@id': breadcrumbId },
      mainEntity: { '@id': softwareId }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': softwareId,
      name: 'MedSkillAudit',
      description: medSkillAuditSeo.description,
      url: pageUrl,
      applicationCategory: 'Scientific Research Software',
      softwareVersion: 'skill-auditor@1.0',
      provider: { '@id': organizationId },
      mainEntityOfPage: { '@id': webpageId },
      citation: { '@id': arxivUrl }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AIPOCH', item: SITE_DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'MedSkillAudit', item: pageUrl }
      ]
    },
    {
      '@type': 'ScholarlyArticle',
      '@id': arxivUrl,
      headline: validationStudy.title,
      author: validationStudy.authors.split(' · ').map((name) => ({ '@type': 'Person', name })),
      datePublished: '2026-04-22',
      version: 'v1',
      url: arxivUrl,
      sameAs: doiUrl,
      identifier: [
        {
          '@type': 'PropertyValue',
          propertyID: 'arXiv',
          value: validationStudy.paperId,
          url: arxivUrl
        },
        {
          '@type': 'PropertyValue',
          propertyID: 'DOI',
          value: doi,
          url: doiUrl
        }
      ],
      image: medSkillAuditSocialImage.url,
      abstract: validationStudy.abstracts.join(' '),
      publisher: {
        '@type': 'Organization',
        name: 'arXiv',
        url: 'https://arxiv.org'
      },
      mainEntityOfPage: { '@id': webpageId }
    }
  ]
})
