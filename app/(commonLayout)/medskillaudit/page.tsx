import type { Metadata } from 'next'
import { SITE_DOMAIN } from '@/lib/config'
import {
  BenchmarkAnchorRail,
  BenchmarkCategoriesSection,
  BenchmarkDynamicSection,
  BenchmarkOutputsSection,
  BenchmarkOverviewSection,
  BenchmarkPipelineSection,
  BenchmarkStaticSection,
  BenchmarkVetoSection
} from './components/benchmark-framework-sections'
import { BenchmarkHero } from './components/benchmark-hero'
import { BenchmarkPaperSection } from './components/benchmark-paper-section'
import { BenchmarkScoreSection } from './components/benchmark-score-section'
import { BenchmarkShell } from './components/benchmark-shell'

export const metadata: Metadata = {
  title: 'MedSkillAudit - Audit Framework for Medical Research Agent Skills · AIPOCH',
  description:
    'Learn how MedSkillAudit evaluates medical research agent skills with veto gates, static design scoring, dynamic medical-task testing, and expert-aligned release dispositions.',
  alternates: { canonical: `${SITE_DOMAIN}/medskillaudit` },
  openGraph: {
    type: 'article',
    url: `${SITE_DOMAIN}/medskillaudit`,
    siteName: 'AIPOCH',
    title: 'MedSkillAudit - Audit Framework for Medical Research Agent Skills · AIPOCH',
    description:
      'Learn how MedSkillAudit evaluates medical research agent skills with veto gates, static design scoring, dynamic medical-task testing, and expert-aligned release dispositions.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedSkillAudit - Audit Framework for Medical Research Agent Skills · AIPOCH',
    description:
      'Learn how MedSkillAudit evaluates medical research agent skills with veto gates, static design scoring, dynamic medical-task testing, and expert-aligned release dispositions.'
  }
}

export default function MedSkillAuditPage() {
  return (
    <main className="min-h-screen bg-[#E9E9E9]">
      <BenchmarkShell>
        <BenchmarkHero />
      </BenchmarkShell>
      <BenchmarkAnchorRail />
      <BenchmarkOverviewSection />
      <BenchmarkVetoSection />
      <BenchmarkStaticSection />
      <BenchmarkDynamicSection />
      <BenchmarkScoreSection />
      <BenchmarkPipelineSection />
      <BenchmarkCategoriesSection />
      <BenchmarkOutputsSection />
      <BenchmarkPaperSection />
    </main>
  )
}
