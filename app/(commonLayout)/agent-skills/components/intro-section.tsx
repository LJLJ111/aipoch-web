'use client'

import { cn } from '@/lib/utils'
import { Dna, FileSearchCorner, Microscope } from 'lucide-react'
import Link from 'next/link'
import { Step } from './step'

const introCards = [
  {
    icon: Dna,
    title: 'What are Skills?',
    description:
      'Understand how skills package biomedical expertise into executable units that humans can use — and AI agents can invoke autonomously.',
    iconColor: 'text-red-500',
    containerBg: 'bg-red-100/50',
    href: '/guides/what-is-a-skill'
  },
  {
    icon: Microscope,
    title: 'Getting Started',
    description:
      'Run skills manually in your research workflow, or integrate them with AI agents to execute tasks automatically.',
    iconColor: 'text-blue-600',
    containerBg: 'bg-blue-100/50',
    href: '/guides/get-started-with-skills'
  },
  {
    icon: FileSearchCorner,
    title: 'Create a Skill',
    description:
      'Design custom skills that humans can use and that AI agents can invoke directly in real research environments.',
    iconColor: 'text-emerald-600',
    containerBg: 'bg-emerald-100/50',
    href: '/guides/build-your-own-skill'
  }
]

export function IntroSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:gap-8 items-baseline">
          <Step index="01" name="Introduction" />
          <h2 className="text-4xl font-light text-black md:text-5xl">New to Skills?</h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {introCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={cn(
                'border px-8 py-6 flex flex-col gap-6 border-black/20 rounded-none bg-white/60 hover:border-black/60 transition-colors'
              )}
            >
              <div className={cn('flex size-10 items-center justify-center', card.containerBg)}>
                <card.icon className={cn('size-6', card.iconColor)} />
              </div>
              <h3 className="text-base font-medium text-black">{card.title}</h3>
              <p className="text-sm leading-relaxed text-black/60">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
