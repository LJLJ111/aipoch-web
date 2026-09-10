import { WebRadarIcon } from '@/components/svg-icons'

export function HeroSection() {
  return (
    <section
      className="relative bg-[#e8e8e8]
      bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]
      bg-size-[60px_60px] px-6 pt-32 pb-16 lg:px-8 lg:pt-40 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          {/* Main Title */}
          <h1 className="max-w-4xl text-4xl font-normal leading-[1.1] tracking-tight text-black md:text-5xl lg:text-7xl">
            We create
            <br />
            <span className="relative z-10 font-light font-mono italic text-black bg-primary px-2 pr-4">
              &ldquo;insight&rdquo;
            </span>
            <br />
            moments for <br /> medical research.
          </h1>

          {/* Subtitle */}
          <p className="mt-8 max-w-md text-sm leading-relaxed text-black/60">
            <strong>Enable OpenClaw🦞</strong>: One click to join and access all AIPOCH medical research skills to assist your research workflow.
          </p>
        </div>

        <div className="flex justify-center md:justify-end md:flex-1">
          <WebRadarIcon className="size-64 md:size-96 animate-[spin_30s_linear_infinite]" />
        </div>
      </div>
    </section>
  )
}
