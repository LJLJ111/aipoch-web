import { Github, PlayCircle } from 'lucide-react'
import { benchmarkHero, benchmarkLinks, benchmarkStats } from '../benchmark-data'

export const BenchmarkHero = () => (
  <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20">
    {/* Hero introduces the benchmark and keeps the video as inspectable product evidence. */}
    <div className="mx-auto max-w-[900px] text-center">
      <div className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#555555]">
        <span className="size-1.5 rounded-full bg-emerald-700" aria-hidden />
        {benchmarkHero.eyebrow.map((item, index) => (
          <span key={item} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="h-3 w-px bg-black/15" aria-hidden /> : null}
            {item}
          </span>
        ))}
      </div>
      <h1 className="text-5xl font-bold leading-none tracking-normal sm:text-6xl md:text-[72px]">
        What is <span className="bg-primary px-2 italic">MedSkillAudit</span>?
      </h1>
      <p className="mx-auto mt-6 max-w-[700px] text-[15px] leading-7 text-[#555555] sm:text-base">
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
          className="inline-flex min-h-11 items-center gap-2 border border-black bg-black px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#2A2A2A]"
        >
          <Github className="size-4" aria-hidden />
          View on GitHub →
        </a>
        <a
          href={benchmarkLinks.paper}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 border border-black px-5 text-xs font-bold uppercase tracking-[0.06em] text-black transition-colors hover:bg-black/5"
        >
          Read the Paper
        </a>
      </div>
      <div className="mt-5 inline-flex max-w-full overflow-x-auto bg-[#151515] px-4 py-3 font-mono text-[12.5px] text-[#F1F1F1]">
        <span className="mr-2 text-primary">$</span>
        <code>{benchmarkHero.command}</code>
      </div>
    </div>

    <div className="mx-auto mt-12 max-w-[1000px]">
      <div className="border border-black bg-white shadow-[10px_10px_0_rgba(17,17,17,0.92)] sm:shadow-[14px_14px_0_rgba(17,17,17,0.92)]">
        <div className="flex min-h-11 items-center gap-3 border-b border-black/10 bg-[#E9E9E9] px-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-green-500" />
          </div>
          <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#707070]">
            {benchmarkHero.videoTitle}
          </span>
          <span className="ml-auto hidden items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-green-800 sm:inline-flex">
            <PlayCircle className="size-3.5" aria-hidden />
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
      <p className="mt-7 text-center text-[12.5px] leading-6 text-[#707070]">
        End-to-end run of the auditor — from{' '}
        <code className="font-mono text-xs text-[#555555]">Skill Veto</code> through static scoring,
        dynamic medical-task testing, and the final release disposition.
      </p>
    </div>

    <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4">
      {benchmarkStats.map((stat) => (
        <div
          key={stat.label}
          className="border-b border-black/10 px-5 py-7 sm:even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
        >
          <div className="text-4xl font-bold leading-none tracking-normal text-[#111111]">
            {stat.value}
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707070]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </section>
)
