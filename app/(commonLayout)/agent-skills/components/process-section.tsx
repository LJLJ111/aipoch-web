'use client'

import { Step } from './step'

const processSteps = [
  {
    number: '01',
    title: 'DISCOVER',
    description:
      'Explore skills your research team can use directly, or that AI agents can autonomously invoke.'
  },
  {
    number: '02',
    title: 'CONNECT',
    description:
      'Access structured skill files that can be used by humans or programmatically called by AI agents.'
  },
  {
    number: '03',
    title: 'OPERATE',
    description:
      'Let humans or AI agents execute skills to turn questions into structured scientific results.'
  }
]

export function ProcessSection() {
  return (
    <section className="py-20 lg:py-42">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Step index="02" name="Process" className="mb-4 inline-block" />
          <h2 className="mb-4 text-4xl font-light text-black md:text-6xl">
            Accelerate <em className="font-serif italic">Discovery</em>
          </h2>
          <p className="text-sm text-black/40">
            From questions to evidence, executed by humans or AI agents.
          </p>
        </div>

        {/* Process steps */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="absolute left-0 right-0 top-6 hidden lg:block">
            <div className="mx-auto h-px w-2/3 border-t border-dashed border-black/10"></div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-4">
            {processSteps.map((step, index) => (
              <div
                key={step.number}
                className="relative group flex flex-col items-center text-center"
              >
                {/* Step number circle */}
                <div
                  className="relative z-10 mb-6 flex size-12 items-center justify-center rounded-full 
                border-2 border-black/80 bg-white group-hover:bg-primary transition-all duration-300 group-hover:border-primary"
                >
                  <span className="text-sm font-medium text-black">{step.number}</span>
                </div>

                {/* Step content */}
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-black">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm text-black/60">{step.description}</p>

                {/* Arrow between steps - mobile only */}
                {index < processSteps.length - 1 && (
                  <div className="mt-6 flex items-center justify-center lg:hidden">
                    <div className="h-8 w-px bg-black/10"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
