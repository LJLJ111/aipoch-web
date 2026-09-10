'use client'

import { ArrowRight, Terminal } from 'lucide-react'
import Link from 'next/link'
import { OpenClawInteractionCard } from './code-card'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[60px_60px]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-light leading-tight text-black md:text-6xl lg:text-7xl">
              The Ultimate
              <br />
              <span className="bg-[#ecd44c] px-2 py-1 -rotate-2 inline-block w-fit">Skills</span>
              <br />
              Hub for <br /> Medical Research
            </h1>
            <p className="max-w-lg text-sm text-black/50 leading-relaxed">
              Explore reusable medical knowledge units that researchers can run directly or that AI agents can invoke programmatically—making scientific work faster and smarter.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/agent-skills/list"
                className="bg-[#ea580c] text-white px-8 py-4 font-mono text-xs uppercase tracking-widest
                  hover:bg-orange-700 transition-colors flex items-center
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                  hover:translate-x-0.5 hover:translate-y-0.5 border border-black"
              >
                Explore Skills
                <ArrowRight className="ml-2 size-4" />
              </Link>
              {/*
              <Link
                href="/community"
                className="bg-white text-black px-8 py-4 font-mono text-xs uppercase tracking-widest
                  hover:bg-gray-50 transition-colors flex items-center
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                  hover:translate-x-0.5 hover:translate-y-0.5 border border-black"
              >
                Join Community
              </Link>
              */}
            </div>

            {/* Install command */}
            <a
              className="mt-4 inline-flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-mono w-fit"
              href="https://aipoch.com/skill.md"
              download="skill.md"
            >
              <Terminal className="h-4 w-4 text-white/60" />
              <span>aipoch/skill.md</span>
            </a>
          </div>

          {/* Right content - Code Card */}
          <div className="relative lg:px-12">
            <OpenClawInteractionCard />
          </div>
        </div>
      </div>
    </section>
  )
}
