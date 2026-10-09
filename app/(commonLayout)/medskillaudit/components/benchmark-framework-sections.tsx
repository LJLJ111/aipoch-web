import { DesignIcon } from '@/components/design-icon'
import {
  benchmarkAnchors,
  complexityLevels,
  dynamicInputs,
  executionModes,
  outputArtifacts,
  overviewStages,
  pipelineSteps,
  skillCategories,
  staticDimensions,
  vetoGroups
} from '../benchmark-data'
import { BenchmarkSection, mutedTextClass, sectionCardClass } from './benchmark-section'

const indexLabel = (index: number) => String(index + 1).padStart(2, '0')

const overviewIcons = ['8b93c', 'a12fc', '448cc', 'c07c0']
const staticIcons = [...overviewIcons, 'edb64', 'd5307', 'cd9fe', '0b9e2']
const vetoIcons = ['d2478', '6941e', 'b507b', '0b456', 'd447f', '3d62b', '13da5', '660b7']
const inputIcons = ['43d9b', '7a958', '07800', '4f571', '3d96d', '4281d', '5cc22']

const vetoItemClass = (index: number) =>
  [
    'flex flex-col items-start gap-2 border-b border-black/10 px-5 py-3.5 sm:border-r sm:even:border-r-0',
    index >= 2 ? 'sm:border-b-0' : ''
  ]
    .filter(Boolean)
    .join(' ')

export const BenchmarkAnchorRail = () => (
  <nav
    aria-label="MedSkillAudit sections"
    className="sticky top-[var(--nav-h,80px)] z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur"
  >
    <div className="mx-auto flex max-w-[1200px] overflow-x-auto px-5 sm:px-8 md:px-10">
      {benchmarkAnchors.map((anchor) => (
        <a
          key={anchor.id}
          href={`#${anchor.id}`}
          className="whitespace-nowrap border-b-2 border-transparent px-4 py-[18px] text-xs font-medium text-[#61615c] transition-colors hover:bg-[#e7e5de] hover:text-black"
        >
          {anchor.label}
        </a>
      ))}
    </div>
  </nav>
)

export const BenchmarkOverviewSection = () => (
  <BenchmarkSection
    id="how"
    eyebrow="01 / Overview"
    title={
      <>
        How does <span className="font-normal italic text-[#61615c]">MedSkillAudit</span> work?
      </>
    }
    description={
      <>
        Medical research skills need safeguards that general-purpose evaluation misses — scientific
        integrity, methodological validity, reproducibility, and boundary safety. MedSkillAudit
        layers four checks into a single release-readiness verdict: two <strong>veto gates</strong>{' '}
        that can reject a skill outright, a <strong>static</strong> assessment of design and
        contract, and a <strong>dynamic</strong> assessment of real medical-task outputs. The two
        stages combine into one final quality score.
      </>
    }
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {overviewStages.map((stage, index) => (
        <article key={stage.title} className={sectionCardClass}>
          <div className="mb-5 flex size-10 items-center justify-center">
            <DesignIcon name={overviewIcons[index]} />
          </div>
          <h3 className="text-[15px] font-bold">{stage.title}</h3>
          <p className={`${mutedTextClass} mt-3`}>{stage.description}</p>
        </article>
      ))}
    </div>
  </BenchmarkSection>
)

export const BenchmarkVetoSection = () => (
  <BenchmarkSection
    id="veto"
    eyebrow="02 / Veto Gates"
    title={
      <>
        Two layers of <span>veto</span>.
      </>
    }
    description={
      <>
        To enforce strict quality control, MedSkillAudit is designed with two layers of veto
        mechanisms. Any failure in these checks may lead to immediate rejection of a skill —
        regardless of how well it scores elsewhere.
      </>
    }
  >
    <div className="grid gap-5 lg:grid-cols-2">
      {vetoGroups.map((group, groupIndex) => (
        <article key={group.title} className="flex flex-col border border-black/10 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#f7f7f5] px-5 py-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#61615c]">
                {group.kicker}
              </div>
              <h3 className="mt-1 text-lg font-bold">{group.title}</h3>
            </div>
          </div>
          <div className="grid flex-1 sm:grid-cols-2">
            {group.items.map((item, index) => (
              <div key={item.title} className={vetoItemClass(index)}>
                <DesignIcon name={vetoIcons[groupIndex * 4 + index]} />
                <div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className={`${mutedTextClass} mt-2`}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="flex min-h-14 items-center border-t border-black/10 px-5 py-3 text-xs text-[#61615c]">
            <strong className="mr-1 text-[#61615c]">Applies to:</strong> {group.appliesTo}
          </p>
        </article>
      ))}
    </div>
  </BenchmarkSection>
)

export const BenchmarkStaticSection = () => (
  <BenchmarkSection
    id="static"
    eyebrow="03 / Core Capability"
    title={
      <>
        Static evaluation{' '}
        <span className="inline-flex align-middle bg-[#111111] px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.02em] text-white">
          Design · 40%
        </span>
      </>
    }
    description="The static layer evaluates a skill's design and contract — 25 criteria drawn from ISO/IEC 25010, OpenSSF, and agent-specific practice — across eight key dimensions, producing a score out of 100."
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {staticDimensions.map((dimension, index) => (
        <article key={dimension.title} className={sectionCardClass}>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center bg-[#f7f7f5]">
              <DesignIcon name={staticIcons[index]} />
            </span>
            <span className="text-[10px] font-bold text-[#909090]">{indexLabel(index)}</span>
          </div>
          <h3 className="text-sm font-bold">{dimension.title}</h3>
          <p className={`${mutedTextClass} mt-2`}>{dimension.description}</p>
        </article>
      ))}
    </div>
  </BenchmarkSection>
)

export const BenchmarkDynamicSection = () => (
  <BenchmarkSection
    id="dynamic"
    eyebrow="04 / Medical Task"
    title={
      <>
        Dynamic evaluation{' '}
        <span className="inline-flex align-middle bg-[#e6e6e6] px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.02em] text-[#61615c]">
          Runtime · 60%
        </span>
      </>
    }
    description="The dynamic layer assesses the skill's actual outputs with layered criteria. The AI automatically generates inputs; the number in each category scales up or down with the skill's complexity. The seven inputs below represent the most comprehensive version of the test set."
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {dynamicInputs.map((input, index) => (
        <article key={input.title} className="min-w-0 border border-[#e7e5de] bg-white px-5 py-4">
          <div className="flex h-8 items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.02em] text-[#8a8983]">
            <DesignIcon name={inputIcons[index]} />
            <span>Input {index + 1}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold">{input.title}</h3>
          <p className="mt-2 text-[12px] leading-5 text-[#61615c]">{input.description}</p>
        </article>
      ))}
    </div>
    <h3 className="mt-8 mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-[#909090]">
      Skill Complexity Classification
    </h3>
    <div className="overflow-x-auto">
      <table className="min-w-[680px] w-full border-collapse border border-black/10 bg-white text-sm">
        <thead>
          <tr className="bg-[#f7f7f5] text-left text-[10px] uppercase tracking-[0.08em] text-[#61615c]">
            <th className="border-b border-black/10 px-4 py-3">Label</th>
            <th className="border-b border-black/10 px-4 py-3">Code / Rank</th>
            <th className="border-b border-black/10 px-4 py-3">Definition</th>
            <th className="border-b border-black/10 px-4 py-3">Generated Inputs</th>
          </tr>
        </thead>
        <tbody>
          {complexityLevels.map((level) => (
            <tr key={level.label} className="border-b border-black/10 last:border-b-0">
              <td className="px-4 py-4 font-bold">{level.label}</td>
              <td className="px-4 py-4">
                <span className="inline-flex size-7 items-center justify-center border border-black/10 bg-[#f7f7f5] font-bold">
                  {level.code}
                </span>
              </td>
              <td className="px-4 py-4 text-[#61615c]">{level.definition}</td>
              <td className="px-4 py-4 font-bold">{level.inputs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </BenchmarkSection>
)

export const BenchmarkPipelineSection = () => (
  <BenchmarkSection
    id="pipeline"
    eyebrow="06 / The Pipeline"
    title={
      <>
        Eight sequential <span className="font-normal italic text-[#61615c]">steps</span>.
      </>
    }
    description="Eight steps run in order — fail at Step 1 or Step 6, and the evaluation stops cold: the skill doesn't ship."
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pipelineSteps.map((step, index) => (
        <article key={step.title} className={sectionCardClass}>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center bg-[#e7e5de] px-2 py-1 text-[10px] font-bold uppercase text-[#61615c]">
              {index + 1}
            </span>
          </div>
          <h3 className="text-sm font-bold">{step.title}</h3>
          <p className={`${mutedTextClass} mt-2`}>{step.description}</p>
        </article>
      ))}
    </div>
    <div className="mt-8 flex flex-wrap gap-3">
      <span className="self-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#61615c]">
        Execution modes:
      </span>
      {executionModes.map((mode) => (
        <span
          key={mode.code}
          className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs text-[#61615c]"
        >
          <b className="inline-flex size-6 items-center justify-center bg-black text-white">
            {mode.code}
          </b>
          {mode.label}
        </span>
      ))}
      <span className="inline-flex items-center px-3 py-2 text-xs text-[#61615c]">
        Each output is checked with 3–5 boolean assertions (format · content · scope · safety ·
        completeness).
      </span>
    </div>
  </BenchmarkSection>
)

export const BenchmarkCategoriesSection = () => (
  <BenchmarkSection
    id="categories"
    eyebrow="07 / Skill Categories"
    title={
      <>
        Five categories, <span className="font-normal italic text-[#61615c]">one auditor</span>.
      </>
    }
    description="During classification, every skill is routed to one of five categories. The four research categories also pass through the Research Veto; the general “Other” category does not."
  >
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full border-collapse border border-black/10 bg-white text-sm">
        <thead>
          <tr className="bg-[#f7f7f5] text-left text-[10px] uppercase tracking-[0.08em] text-[#61615c]">
            <th className="border-b border-black/10 px-4 py-3">#</th>
            <th className="border-b border-black/10 px-4 py-3">Category</th>
            <th className="border-b border-black/10 px-4 py-3">Scope</th>
            <th className="border-b border-black/10 px-4 py-3">Research Veto</th>
          </tr>
        </thead>
        <tbody>
          {skillCategories.map((category, index) => (
            <tr key={category.category} className="border-b border-black/10 last:border-b-0">
              <td className="px-4 py-4 font-bold">{index + 1}</td>
              <td className="px-4 py-4 font-bold">{category.category}</td>
              <td className="px-4 py-4 text-[#61615c]">{category.scope}</td>
              <td className="px-4 py-4">
                <span
                  className={
                    category.researchVeto === 'Applies'
                      ? 'inline-flex items-center gap-2 font-bold text-[#61615c]'
                      : 'font-bold text-[#909090]'
                  }
                >
                  {category.researchVeto === 'Applies' ? (
                    <DesignIcon name={vetoIcons[index + 4]} />
                  ) : null}
                  {category.researchVeto}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </BenchmarkSection>
)

export const BenchmarkOutputsSection = () => (
  <BenchmarkSection
    id="outputs"
    eyebrow="08 / Output Artifacts"
    title={
      <>
        Two artifacts, <span>every run</span>.
      </>
    }
    description="Each audit produces a human-readable review and a machine-readable report for dashboards and tooling."
  >
    <div className="grid gap-4 md:grid-cols-2">
      {outputArtifacts.map((artifact) => (
        <article key={artifact.file} className={sectionCardClass}>
          <code className="inline-block max-w-full break-all border border-black/10 bg-[#f7f7f5] px-2 py-1 text-xs">
            {artifact.file}
          </code>
          <h3 className="mt-5 text-base font-bold">{artifact.title}</h3>
          <p className={`${mutedTextClass} mt-2`}>{artifact.description}</p>
        </article>
      ))}
    </div>
  </BenchmarkSection>
)
