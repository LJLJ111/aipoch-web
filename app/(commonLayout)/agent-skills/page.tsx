import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { SITE_DOMAIN } from '@/lib/config'
import { HeroSection } from './components/hero-section'
import { IntroSection } from './components/intro-section'
import { ProcessSection } from './components/process-section'

const agentSkillsPageUrl = `${SITE_DOMAIN}/agent-skills`

export const metadata: Metadata = {
  title: 'AIPOCH | Your Hub for Medical Research Agent Skills',
  description:
    'Run AIPOCH skills directly or programmatically with AI agents — changing the way you do medical research.',
  alternates: { canonical: agentSkillsPageUrl },
  openGraph: {
    type: 'website',
    url: agentSkillsPageUrl,
    siteName: 'AIPOCH',
    title: 'AIPOCH | Your Hub for Medical Research Agent Skills',
    description:
      'Run AIPOCH skills directly or programmatically with AI agents — changing the way you do medical research.'
  }
}

const agentSkillsItemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AIPOCH Agent Skills',
  description:
    'Run AIPOCH skills directly or programmatically with AI agents — changing the way you do medical research.',
  url: `${SITE_DOMAIN}/agent-skills`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      url: `${SITE_DOMAIN}/agent-skills/list`,
      name: 'Browse All Medical Research AI Skills'
    }
  ]
} as const

export default function AgentSkillsPage() {
  return (
    <main className="min-h-screen">
      <JsonLd data={agentSkillsItemListSchema} />
      <HeroSection />
      <IntroSection />
      <ProcessSection />
    </main>
  )
}
