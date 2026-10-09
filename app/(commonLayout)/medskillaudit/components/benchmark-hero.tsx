import { DesignIcon } from '@/components/design-icon'
import { benchmarkHero, benchmarkLinks, benchmarkStats } from '../benchmark-data'

export const BenchmarkHero = () => (
  <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20">
    {/* Hero introduces the benchmark and keeps the video as inspectable product evidence. */}
    <div className="mx-auto max-w-[900px] text-center">
      <div className="relative mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 bg-[#e6e6e6] px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-4 text-[#4d4d4d]">
        <span className="absolute top-0 -left-1 size-1 bg-[#8c8c8c]" aria-hidden />
        {benchmarkHero.eyebrow.map((item, index) => (
          <span key={item} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="h-3 w-px bg-black/15" aria-hidden /> : null}
            {item}
          </span>
        ))}
      </div>
      <h1 className="font-[Georgia] text-[40px] font-normal leading-[1.12] tracking-[-1.5px] sm:text-[56px] md:text-[64px] md:leading-[72px] md:tracking-[-2px]">
        What is <span className="italic">MedSkillAudit</span>?
      </h1>
      <p className="mx-auto mt-6 max-w-[700px] text-[15px] leading-6 text-[#61615c] sm:text-base">
        MedSkillAudit is a{' '}
        <strong className="font-bold text-[#111111]">
          domain-specific audit framework for medical research agent skills
        </strong>{' '}
        — it vets a skill&apos;s design and live behavior for release readiness before it is ever
        deployed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={benchmarkLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 border border-black bg-black px-5 text-sm font-semibold uppercase text-white transition-colors hover:bg-[#2A2A2A]"
        >
          <DesignIcon name="36c4d" size={16} />
          View on GitHub →
        </a>
        <a
          href={benchmarkLinks.paper}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 border border-[#e5e7eb] bg-white px-5 text-sm font-semibold uppercase text-black transition-colors hover:bg-black/5"
        >
          Read the Paper
        </a>
      </div>
      <div className="mt-5 inline-flex max-w-full overflow-x-auto bg-[#e7e5de] px-3 py-2 font-mono text-[12.5px] text-[#111]">
        <span className="mr-2">$</span>
        <code>{benchmarkHero.command}</code>
      </div>
    </div>

    <div className="mx-auto mt-12 max-w-[1000px]">
      <div className="border border-black bg-white shadow-[10px_10px_0_rgba(17,17,17,0.92)] sm:shadow-[14px_14px_0_rgba(17,17,17,0.92)]">
        <div className="flex min-h-11 items-center gap-3 border-b border-black/10 bg-[#f7f7f5] px-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#61615c]">
            {benchmarkHero.videoTitle}
          </span>
          <span className="ml-auto hidden items-center gap-1 bg-[#ffbd2e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#171717] sm:inline-flex">
            <DesignIcon name="d5888" size={14} />
            Live demo
          </span>
        </div>
        <video
          className="aspect-video w-full bg-black"
          controls
          preload="metadata"
          playsInline
          autoPlay
          loop
          muted
          aria-label={benchmarkHero.videoTitle}
        >
          <source src={benchmarkHero.videoSrc} type="video/mp4" />
          <a href={benchmarkHero.videoSrc}>Download the walkthrough video</a>.
        </video>
      </div>
      <p className="mt-7 text-center text-[12.5px] leading-6 text-[#61615c]">
        End-to-end run of the auditor — from{' '}
        <code className="font-mono text-xs text-[#61615c]">Skill Veto</code> through static scoring,
        dynamic medical-task testing, and the final release disposition.
      </p>
    </div>

    <div className="mt-14 grid border border-[#dad8ce] sm:grid-cols-2 lg:grid-cols-4">
      {benchmarkStats.map((stat, index) => (
        <div
          key={stat.label}
          className="relative border-b border-[#dad8ce] px-5 py-7 sm:even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
        >
          <div className="font-[Georgia] text-4xl font-normal leading-[44px] tracking-[-1.2px] text-[#111111]">
            {stat.value}
          </div>
          <DesignIcon
            name={['40715', 'a2fbe', 'df222', 'f7105'][index]}
            className="absolute right-5 top-7"
          />
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.02em] text-[#61615c]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </section>
)
