import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import type { UseCaseIndexEntry } from '@/lib/use-case-types'
import { fetchUseCaseList } from '@/service/open-science-use-cases'

const headingClass = 'font-[Georgia,serif] font-normal tracking-normal'
const PAGE_SIZE = 6
/** Shared surface for the gallery grid, pagination, and bottom CTA. */
const surfaceClass = 'bg-[#f7f7f5]'

const pageTitle = 'Open-Science Use Cases | AIPOCH'
const pageDescription =
  'Explore selected science research packages and see how research questions become inspectable outputs through connected workflows of data, code, evidence, and conversation.'

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  canonical: `${SITE_DOMAIN}/open-science/use-cases`
})

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ page?: string }>
}

/** Sharp-corner gallery card: image on top, white title block below. */
const GalleryCard = ({ useCase }: { useCase: UseCaseIndexEntry }) => (
  <Link
    href={`/open-science/use-cases/${useCase.slug}`}
    className="group flex flex-col overflow-hidden border border-[#e4e4df] bg-white transition-colors hover:border-[#10110f]"
  >
    <div className="relative aspect-[16/10] overflow-hidden bg-[#e8e8e4]">
      {useCase.preview?.image ? (
        // biome-ignore lint/performance/noImgElement: local static preview asset, no Next image rewriting needed.
        <img
          src={useCase.preview.image}
          alt=""
          aria-hidden="true"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
    <div className="flex flex-1 flex-col gap-3 bg-white px-6 py-5">
      <h2 className={`${headingClass} line-clamp-2 text-[18px] leading-[1.35] text-[#10110f]`}>
        {useCase.title}
      </h2>
      <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-[#10110f]">
        View use case in AIPOCH Lab →
      </span>
    </div>
  </Link>
)

const pageHref = (page: number) =>
  page <= 1 ? '/open-science/use-cases' : `/open-science/use-cases?page=${page}`

const Pagination = ({ current, total }: { current: number; total: number }) => {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (pageCount <= 1) return null

  // Show first pages, ellipsis, and the last page — enough to demo the design chrome.
  const head = Array.from({ length: Math.min(pageCount, 4) }, (_, index) => index + 1)
  const showTail = pageCount > 5
  const showEllipsis = pageCount > 4

  const boxClass =
    'inline-flex min-h-10 min-w-10 items-center justify-center border border-[#e4e4df] bg-white px-3 text-[13px] text-[#10110f]'
  const activeClass =
    'inline-flex min-h-10 min-w-10 items-center justify-center border border-[#10110f] bg-[#10110f] px-3 text-[13px] text-white'
  const mutedClass =
    'inline-flex min-h-10 min-w-10 items-center justify-center border border-[#e4e4df] bg-white px-3 text-[13px] text-[#a0a09a]'

  return (
    <nav
      aria-label="Use case pages"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {current <= 1 ? (
        <span className={mutedClass}>Previous</span>
      ) : (
        <Link href={pageHref(current - 1)} className={boxClass}>
          Previous
        </Link>
      )}
      {head.map((page) =>
        page === current ? (
          <span key={page} className={activeClass} aria-current="page">
            {page}
          </span>
        ) : (
          <Link key={page} href={pageHref(page)} className={boxClass}>
            {page}
          </Link>
        )
      )}
      {showEllipsis ? <span className={boxClass}>…</span> : null}
      {showTail ? (
        current === pageCount ? (
          <span className={activeClass} aria-current="page">
            {pageCount}
          </span>
        ) : (
          <Link href={pageHref(pageCount)} className={boxClass}>
            {pageCount}
          </Link>
        )
      ) : null}
      {current >= pageCount ? (
        <span className={mutedClass}>Next</span>
      ) : (
        <Link href={pageHref(current + 1)} className={boxClass}>
          Next
        </Link>
      )}
    </nav>
  )
}

export default async function OpenScienceUseCasesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const useCases = await fetchUseCaseList()
  const loadFailed = useCases === null
  const pageCount = useCases ? Math.max(1, Math.ceil(useCases.length / PAGE_SIZE)) : 1
  const requested = Number.parseInt(params.page ?? '1', 10)
  const current = Number.isFinite(requested) ? Math.min(Math.max(1, requested), pageCount) : 1
  const visible = useCases?.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) ?? []

  return (
    <main id="top" className={`-mt-[var(--nav-h)] flex-1 ${surfaceClass} text-[#10110f]`}>
      <section className="pt-[var(--nav-h)]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center px-5 py-16 text-center sm:px-10 lg:py-[88px]">
          <h1 className={`${headingClass} text-[clamp(40px,5vw,56px)] leading-[1.08]`}>
            Use Case Gallery
          </h1>
          <p className="mt-5 max-w-[640px] text-[15px] leading-[1.65] text-[#73746e] sm:text-[16px]">
            Explore selected science research packages and see how research questions become
            inspectable outputs through connected workflows of data, code, evidence, and
            conversation.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-10 lg:px-[max(5vw,calc((100vw-1120px)/2))] lg:pb-20">
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
          <div className="border border-[#e4e4df] bg-white p-8 text-center">
            <p className="text-base text-[#777872]">No published use cases yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-7 md:grid-cols-2">
              {visible.map((useCase) => (
                <GalleryCard key={useCase.slug} useCase={useCase} />
              ))}
            </div>
            <Pagination current={current} total={useCases.length} />
          </>
        )}
      </section>

      <section className={`${surfaceClass} px-5 py-16 text-center sm:px-10 lg:py-20`}>
        <h2 className={`${headingClass} text-[clamp(26px,3vw,40px)] leading-[1.2]`}>
          Make your next research result easier to impact
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/open-science/download"
            className="inline-flex min-h-11 items-center bg-[#10110f] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#f2bd2f] hover:text-[#10110f]"
          >
            Get Started for Free
          </Link>
          <Link
            href="/open-science"
            className="inline-flex min-h-11 items-center border border-[#10110f] bg-white px-5 text-[13px] font-semibold text-[#10110f] transition-colors hover:bg-[#10110f] hover:text-white"
          >
            Watch Demo Video
          </Link>
        </div>
      </section>
    </main>
  )
}
