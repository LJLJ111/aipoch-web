'use client'

import { FileCheck2, FlaskConical, LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { HomeReveal, MotionFlowPulse } from '../home-motion'

const buildEcosystemCopy = (skillsCount: number) => ({
  os: {
    tag: 'Open-Science',
    text: (
      <>
        <b>Open-Science</b> is an open-source, model-agnostic AI workbench for scientific discovery.
        Create a project, describe a task in plain language, and let the agent read files, run code,
        search the web, call scientific data connectors, and return reports, tables, figures, and an
        inspectable activity history in one workspace.
      </>
    )
  },
  skills: {
    tag: 'Agent Skills',
    text: (
      <>
        AIPOCH maintains a curated, open library of{' '}
        <b>{skillsCount}+ reusable medical research skills</b> spanning Evidence Insights, Protocol
        Design, Data Analysis, and Academic Writing — the four areas most research turns actually
        pass through.
      </>
    )
  },
  audit: {
    tag: 'MedSkillAudit',
    text: (
      <>
        <b>MedSkillAudit</b> is a domain-specific audit framework that decides whether a medical
        research agent skill is <b>release-ready before deployment</b> — governing scientific
        integrity, methodological soundness, reproducibility, and safety boundaries that
        general-purpose evaluation misses.
      </>
    )
  }
})

export const EcosystemFlow = ({ skillsCount }: { skillsCount: number }) => {
  const [active, setActive] = useState<'os' | 'skills' | 'audit'>('os')
  const ecosystemCopy = buildEcosystemCopy(skillsCount)
  const nodes = [
    [
      'os',
      '01 · workbench',
      'Open-Science',
      'Workflow execution and orchestration.',
      'role',
      'orchestrator'
    ],
    [
      'skills',
      '02 · library',
      'Medical Research Skills',
      'Domain knowledge and execution logic.',
      'count',
      `${skillsCount}+`
    ],
    [
      'audit',
      '03 · release gate',
      'MedSkillAudit',
      'Audited release-ready before deployment.',
      'gate',
      'pass / reject'
    ]
  ] as const
  // Match open-science prototype glyphs: flask / grid / file-check.
  const icons = [FlaskConical, LayoutGrid, FileCheck2]

  return (
    <HomeReveal delay={0.09}>
      <div className="grid items-stretch lg:grid-cols-[1fr_92px_1fr_92px_1fr]">
        {nodes.map(([id, tag, title, description, statLabel, stat], index) => {
          const selected = active === id
          const Icon = icons[index] ?? FlaskConical
          return (
            <div className="contents" key={id}>
              {index > 0 ? (
                <div className="relative flex h-11 items-center justify-center lg:h-auto">
                  <i className="absolute top-2 bottom-2 left-1/2 w-px bg-black lg:top-1/2 lg:right-2 lg:bottom-auto lg:left-2 lg:h-px lg:w-auto" />
                  <MotionFlowPulse className="absolute size-2 rounded-full bg-[#ecd44c] shadow-[0_0_0_4px_rgba(236,212,76,.25)]" />
                </div>
              ) : null}
              <button
                data-testid={`ecosystem-node-${id}`}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(id)}
                className={`rounded-[16px] border bg-white px-6 py-[26px] text-left transition hover:-translate-y-[3px] hover:border-black hover:shadow-[0_16px_40px_rgba(20,30,60,.1)] ${selected ? 'border-black shadow-[inset_0_0_0_1px_#111]' : 'border-black/15'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`flex size-11 items-center justify-center rounded-[13px] border ${selected ? 'border-black bg-black text-white' : 'border-black/15'}`}
                  >
                    <Icon className="size-[22px]" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                    {tag}
                  </span>
                </div>
                <h3 className="mt-4 text-[19px] font-extrabold">{title}</h3>
                <p className="mt-2 text-[13px] leading-[1.55] text-[#555]">{description}</p>
                <div className="mt-4 flex justify-between border-t border-black/[.08] pt-3.5 font-mono text-[11px] text-[#8f8f8f]">
                  {statLabel}
                  <b className="font-semibold text-black">{stat}</b>
                </div>
              </button>
            </div>
          )
        })}
      </div>
      <div
        data-testid="ecosystem-detail"
        className="mt-5 flex flex-col items-start gap-[22px] rounded-[16px] border border-black bg-[#111] px-[clamp(20px,3vw,34px)] py-[26px] text-[#e7e9ee] sm:flex-row"
      >
        <span className="mt-[3px] shrink-0 rounded-full bg-[#ecd44c] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#111]">
          {ecosystemCopy[active].tag}
        </span>
        <p className="text-[14.5px] leading-[1.7] text-[#c3c7d0] [&_b]:font-semibold [&_b]:text-white">
          {ecosystemCopy[active].text}
        </p>
      </div>
    </HomeReveal>
  )
}
