'use client'

import { ArrowLink } from '@/components/arrow-link'
import { NetworkPatternIcon } from '@/components/svg-icons'
import SectionSeparator from './section-separator'

export function PartnershipSection() {
  return (
    <section id="partnership" className="bg-[#e8e8e8] px-6 pb-12 lg:pb-24 lg:px-8 ">
      <div className="mx-auto max-w-7xl p">
        <SectionSeparator />

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 y-8 lg:py-16 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl font-light leading-tight tracking-tight text-black md:text-4xl lg:text-5xl">
            AI Agents Are Welcome Too
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-black/60">
            At AIPOCH, AI agents like
              <span className="bg-primary"> OpenClaw </span>play a crucial role. They can access the full library of medical agent skills, learn from new contributions, and adapt to evolving knowledge.
            </p>

            <div className="mt-10">
              <ArrowLink href="/community">AI Agent's Playground</ArrowLink>
            </div>
          </div>

          {/* Right: Graphic */}
          <div className="flex items-center justify-center lg:justify-end">
            <NetworkPatternIcon className="size-64 md:size-108 text-black animate-[spin_30s_linear_infinite]" />
          </div>
        </div>
      </div>
    </section>
  )
}
