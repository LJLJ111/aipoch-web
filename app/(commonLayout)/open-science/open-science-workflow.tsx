import type { StaticImageFileName } from '@/lib/static-assets'
import { OpenScienceImage } from './open-science-image'
import { OpenScienceSectionHeading, openScienceContainer } from './open-science-section'

const steps: { title: string; icon: StaticImageFileName; description: string }[] = [
  {
    title: 'Define',
    icon: 'open-science-define-6aaa1284.svg',
    description: 'Define a research question and provide the relevant files or context.'
  },
  {
    title: 'Plan',
    icon: 'open-science-plan-3b51af0c.svg',
    description:
      'Let an AI agent plan the work and delegate scoped tasks to Specialists or subagents when appropriate.'
  },
  {
    title: 'Execute',
    icon: 'open-science-execute-984f88d9.svg',
    description:
      'Search approved sources, inspect datasets, and run Python, R, shell commands, or research tools.'
  },
  {
    title: 'Inspect',
    icon: 'open-science-inspect-ab0f10a1.svg',
    description:
      'Create reports, tables, figures, and notebooks, then inspect them alongside execution records, provenance evidence, and optional Reviewer findings.'
  }
]

export function OpenScienceWorkflow() {
  return (
    <section className={`${openScienceContainer} py-16 lg:pt-[70px] lg:pb-20`}>
      <OpenScienceSectionHeading
        eyebrow="One workspace"
        title={
          <>
            One workspace from research question
            <br className="hidden lg:block" /> to traceable artifact
          </>
        }
      >
        Open-Science keeps research questions, project files, code execution, outputs,
        <br className="hidden lg:block" /> and review evidence together inside persistent projects.
        Agents can continue multi-step
        <br className="hidden lg:block" /> investigations and use specialized capabilities without
        separating the reasoning interface from the execution environment.
      </OpenScienceSectionHeading>
      <div className="border border-[#e7e5de]">
        <div data-open-science-reveal="0.08" className="p-4 sm:p-8">
          <OpenScienceImage
            asset="open-science-workflow-591fc2f0.webp"
            alt="Research workflow connecting Define, Plan, Execute and Inspect"
            sizes="(min-width: 1230px) 1116px, calc(100vw - 80px)"
            className="h-auto w-full rounded-lg"
          />
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-open-science-reveal={index * 0.06}
              className="border-t border-[#e7e5de] p-6 sm:odd:border-r lg:border-r lg:p-8 lg:last:border-r-0"
            >
              <OpenScienceImage asset={step.icon} sizes="21px" className="mb-4 size-[21px]" />
              <h3 className="text-lg font-medium leading-6">{step.title}</h3>
              <p className="mt-3 text-sm leading-[21px] text-[#6b6b66]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
