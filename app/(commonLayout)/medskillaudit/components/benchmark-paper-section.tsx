import {
  benchmarkCta,
  benchmarkDisclaimer,
  benchmarkLinks,
  validationStudy
} from '../benchmark-data'
import { BenchmarkSection } from './benchmark-section'

export const BenchmarkPaperSection = () => (
  <>
    <BenchmarkSection id="paper" eyebrow="09 / Validation Study" title={validationStudy.title} dark>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="font-mono text-xs text-primary">{validationStudy.paperId}</div>
          <p className="mt-5 text-sm leading-7 text-white/55">{validationStudy.authors}</p>
          <p className="mt-7 text-[13.5px] leading-7 text-white/75">
            We developed{' '}
            <strong className="font-bold text-primary">MedSkillAudit (skill-auditor@1.0)</strong>, a
            layered framework assessing skill release readiness before deployment, and evaluated{' '}
            <strong className="font-bold text-primary">75 skills</strong> across five medical
            research categories (15 per category). Two experts independently assigned a quality
            score (0–100), an ordinal release disposition, and a high-risk failure flag.
            System–expert agreement was quantified using ICC(2,1) and linearly weighted Cohen&apos;s
            kappa, benchmarked against the human inter-rater baseline.
          </p>
          <p className="mt-7 text-[13.5px] leading-7 text-white/75">
            MedSkillAudit achieved{' '}
            <strong className="font-bold text-primary">ICC(2,1) = 0.449</strong> (95% CI:
            0.250–0.610), exceeding the human inter-rater ICC of 0.300, with no directional bias
            (Wilcoxon p = 0.613). The conclusion: domain-specific pre-deployment audit may provide a
            practical foundation for governing medical research agent skills, complementing
            general-purpose quality checks with structured workflows tailored to scientific use
            cases.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={benchmarkLinks.paper}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.06em] text-black transition-colors hover:bg-primary/90"
            >
              Read on arXiv →
            </a>
            <a
              href={benchmarkLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border border-white/30 px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-white"
            >
              View skill-auditor
            </a>
          </div>
        </div>
        <aside className="border border-white/15 bg-white/[0.04] p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
            Key Results
          </h3>
          <div className="mt-5 divide-y divide-white/10">
            {validationStudy.keyResults.map((result) => (
              <div key={result.value} className="flex items-start justify-between gap-5 py-5">
                <span className="text-3xl font-bold text-green-500">{result.value}</span>
                <span className="max-w-[260px] whitespace-pre-line text-right text-xs leading-5 text-white/60">
                  {result.label}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </BenchmarkSection>

    <section className="bg-[#E9E9E9]">
      <div className="mx-auto max-w-[1200px] px-5 py-14 text-center sm:px-8 md:px-10 md:py-20">
        <h2 className="text-4xl font-bold tracking-normal sm:text-5xl">
          Audit your skill <em className="font-normal text-[#555555]">before</em> you deploy it.
        </h2>
        <p className="mx-auto mt-5 max-w-[600px] text-[15px] leading-7 text-[#555555]">
          {benchmarkCta.description}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={benchmarkLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border border-black bg-black px-5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#2A2A2A]"
          >
            Get skill-auditor →
          </a>
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 items-center gap-2 border border-black px-5 text-xs font-bold uppercase tracking-[0.06em] text-black transition-colors hover:bg-black/5"
          >
            Evaluate a Skill
          </button>
        </div>
        <div className="mt-6 inline-flex max-w-full overflow-x-auto bg-[#151515] px-4 py-3 font-mono text-[12.5px] text-[#F1F1F1]">
          <span className="mr-2 text-primary">$</span>
          <code>{benchmarkCta.command}</code>
        </div>
      </div>
      <p className="mx-auto max-w-[980px] px-5 pb-8 text-center text-xs leading-6 text-[#707070] sm:px-8 md:px-10">
        {benchmarkDisclaimer}
      </p>
    </section>
  </>
)
