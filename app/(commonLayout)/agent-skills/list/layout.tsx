import { JsonLd } from '@/components/json-ld'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchSkillsForServer } from '@/service/skills'
import { AGENT_SKILLS_LIST_DESCRIPTION } from './agent-skills-list-content'

const agentSkillsListUrl = `${SITE_DOMAIN}/agent-skills/list`

export const metadata = createPageMetadata({
  title: 'AIPOCH Skills List — Browse All Medical Research AI Skills',
  description: AGENT_SKILLS_LIST_DESCRIPTION,
  canonical: agentSkillsListUrl
})

export default async function ListLayout({ children }: { children: React.ReactNode }) {
  const skillsData = await fetchSkillsForServer({ page: 1, page_size: 20 })
  const items = skillsData?.items ?? []
  const total = skillsData?.total ?? 0

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AIPOCH Skills — Medical Research Agent Skills',
    description: AGENT_SKILLS_LIST_DESCRIPTION,
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
