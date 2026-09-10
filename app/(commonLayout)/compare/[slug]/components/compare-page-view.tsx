import { CompareCoreCapability } from './compare-core-capability'
import { CompareMedicalTask } from './compare-medical-task'
import { CompareSkillHeader } from './compare-skill-header'
import type { ComparePageViewModel } from './compare-types'

interface ComparePageViewProps {
  compare: ComparePageViewModel
}

export function ComparePageView({ compare }: ComparePageViewProps) {
  return (
    <main className="flex-1 bg-[#E9E9E9] text-[#111111]">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-10 md:px-10">
        <h1 className="sr-only">Skill Comparison</h1>
        <CompareSkillHeader left={compare.left} right={compare.right} />
        <CompareCoreCapability left={compare.left} right={compare.right} />
        <CompareMedicalTask left={compare.left} right={compare.right} />
      </div>
    </main>
  )
}
