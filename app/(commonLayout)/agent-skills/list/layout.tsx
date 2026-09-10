import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { SITE_DOMAIN } from '@/lib/config'
import { fetchSkillsForServer } from '@/service/skills'

const agentSkillsListUrl = `${SITE_DOMAIN}/agent-skills/list`

export const metadata: Metadata = {
  title: 'AIPOCH Skills List — Browse All Medical Research AI Skills',
  description:
    'Browse all AIPOCH medical research skills across Academic Writing, Data Analysis, Evidence Insights, Protocol Design, and more.',
  alternates: { canonical: agentSkillsListUrl },
  openGraph: {
    type: 'website',
    url: agentSkillsListUrl,
    siteName: 'AIPOCH',
    title: 'AIPOCH Skills List — Browse All Medical Research AI Skills',
    description:
      'Browse all AIPOCH medical research skills across Academic Writing, Data Analysis, Evidence Insights, Protocol Design, and more.'
  }
}

export default async function ListLayout({ children }: { children: React.ReactNode }) {
  const skillsData = await fetchSkillsForServer({ page: 1, page_size: 20 })
  const items = skillsData?.items ?? []
  const total = skillsData?.total ?? 0

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AIPOCH Skills — Medical Research Agent Skills',
    description:
      'Packaged workflows that accelerate biomedical research and clinical operations. Browse skills across Academic Writing, Data Analysis, Evidence Insights, Protocol Design, and more.',
    url: `${SITE_DOMAIN}/agent-skills/list`,
    numberOfItems: total,
    itemListElement: items.map(
      (skill: { id: string; name: string; path?: string; title: string }, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_DOMAIN}/agent-skills/${skill.path ?? skill.name}`,
        name: skill.title || skill.name
      })
    )
  }

  return (
    <>
      <JsonLd data={itemListSchema} />
      {children}
    </>
  )
}
