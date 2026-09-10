'use client'

import SectionSeparator from '@/app/(commonLayout)/components/section-separator'
import { ArrowLink } from '@/components/arrow-link'
import { OpenClawInteractionCard } from '../agent-skills/components/code-card'

const features = [
  {
    number: '01',
    title: 'Download Skills, Expand Your Knowledge',
    description:
      'Equip your AI agent with specialized skills to support scientific workflows, analyze data, and assist with medical research tasks.'
  },
  {
    number: '02',
    title: 'Explore Medical Research Skills by Category',
    description:
      'AIPOCH provides medical research skills across four core medical science areas: Evidence Insights, Protocol Design, Data Analysis, and Academic Writing.'
  }
]

export function ApproachSection() {
  return (
    <section id="approach" className="bg-[#e8e8e8] px-6 pb-16 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <SectionSeparator />

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Graphic */}
          <div className="flex relative w-full items-center justify-center lg:justify-start">
            <div className="w-full max-w-md lg:max-w-lg">
              <OpenClawInteractionCard />
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-2xl font-light leading-tight tracking-tight text-black md:text-3xl lg:text-5xl">
            Connect OpenClaw and Access All AIPOCH Skills
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-black/60">
            AIPOCH offers a growing library of medical research skills available for immediate use.
            </p>

            {/* Feature List */}
            <div className="mt-10 space-y-8">
              {features.map((feature) => (
                <div key={feature.number} className="border-b border-black/10 pb-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xs mt-0.5 font-medium text-black/40">
                      {feature.number}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-black">{feature.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-black/50">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <ArrowLink href="/agent-skills/list">Explore More Aipoch Agent Skills</ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
