import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchUseCaseList } from '@/service/open-science-use-cases'

const kickerClass =
  'relative inline-block w-fit bg-[#e8e8e6] px-[9px] py-1.5 font-mono text-[9px] font-semibold leading-[1.5] tracking-[0.04em] text-[#575853] uppercase after:absolute after:-top-[3px] after:-right-[3px] after:size-1 after:bg-[#f2bd2f]'
const headingClass = 'font-[Georgia,serif] font-normal tracking-normal'
const sectionPaddingClass =
  'px-5 py-20 sm:px-10 sm:py-24 lg:px-[max(5.5vw,calc((100vw-1320px)/2))] lg:py-32'

const pageTitle = 'Open-Science Use Cases | AIPOCH'
const pageDescription =
  'Read-only replays of real Open-Science research sessions, exported with their full conversation, tool activity, and produced artifacts.'

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  canonical: `${SITE_DOMAIN}/open-science/use-cases`
})

export const dynamic = 'force-dynamic'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric'
})

export default async function OpenScienceUseCasesPage() {
  const useCases = await fetchUseCaseList()
  const loadFailed = useCases === null

  return (
    <main id="top" className="-mt-[var(--nav-h)] flex-1 bg-[#f5f5f3] text-[#10110f]">
      <section className="border-b border-[#dfdfda] pt-[var(--nav-h)]">
        <div className="mx-auto flex max-w-[1260px] flex-col items-start px-5 py-20 sm:px-10 lg:py-[104px]">
          <p className={kickerClass}>OPEN-SCIENCE / USE CASES</p>
          <h1
            className={`${headingClass} mt-[26px] max-w-[1160px] text-[clamp(40px,5vw,72px)] leading-[1.02]`}
          >
            Real research sessions, replayed end to end.
          </h1>
          <p className="mt-[30px] max-w-[700px] text-[clamp(16px,1.3vw,20px)] leading-[1.55] text-[#73746e]">
            Each use case is an exported Open-Science session: the full conversation, every tool
            call, and the artifacts the agent produced — inspectable step by step.
          </p>
        </div>
      </section>

      <section className={sectionPaddingClass}>
        {loadFailed ? (
          <div className="border border-[#a14a3a]/40 bg-[#faf3f1] p-8 text-center">
            <p className="text-base font-medium text-[#a14a3a]">
              Use cases could not be loaded right now.
            </p>
            <p className="mt-2 text-sm text-[#777872]">
              The content service is unavailable — please try again later.
            </p>
          </div>
        ) : useCases.length === 0 ? (
          <div className="border border-[#dfdfda] bg-[#fbfbfa] p-8 text-center">
            <p className="text-base text-[#777872]">No published use cases yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/open-science/use-cases/${useCase.slug}`}
                className="group flex flex-col border border-[#dfdfda] bg-white p-7 transition-colors hover:border-[#10110f]"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#777872]">
                  {dateFormatter.format(new Date(useCase.exportedAt))}
                </p>
                <h2 className="mt-4 line-clamp-3 text-[19px] font-semibold leading-[1.35]">
                  {useCase.title}
                </h2>
                {useCase.description ? (
                  <p className="mt-3 line-clamp-2 text-[14px] leading-[1.6] text-[#777872]">
                    {useCase.description}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#777872]">
                    {useCase.messageCount} messages · {useCase.activityCount} activities
                  </span>
                  <span
                    className="text-[13px] font-semibold underline decoration-[#10110f] underline-offset-4"
                    aria-hidden="true"
                  >
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
