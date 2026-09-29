import { JsonLd } from '@/components/json-ld'
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
import {
  buildMedSkillAuditStructuredData,
  medSkillAuditMetadata
} from './medskillaudit-structured-data'

export const metadata = medSkillAuditMetadata

export default function MedSkillAuditPage() {
  return (
    <main className="min-h-screen bg-[#E9E9E9]">
      <JsonLd data={buildMedSkillAuditStructuredData()} />
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
