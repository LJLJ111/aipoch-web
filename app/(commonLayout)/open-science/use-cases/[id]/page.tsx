import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import type { MessageArtifact, UseCaseIndexEntry } from '@/lib/use-case-types'
import { fetchUseCaseAssetText } from '@/service/open-science-use-case-assets'
import { fetchUseCaseList, fetchUseCaseTranscript } from '@/service/open-science-use-cases'
import { SessionMarkdown } from '../_components/session-markdown'
import { ShareRow } from '../_components/share-row'

// Markdown styles come from app/globals.css → session-transcript.css; do not
// re-import that file here — Turbopack panics compiling it as a page CSS entry.

const headingClass = 'font-[Georgia,serif] font-normal tracking-normal'
// Same horizontal shell as the V2 gallery grid (~1120px content column).
const shellClass = 'mx-auto w-full px-5 sm:px-10 lg:px-[max(5vw,calc((100vw-1120px)/2))]'
/** Shared surface for related research and the bottom CTA. */
const surfaceClass = 'bg-[#f7f7f5]'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric'
})

/** Compact "Dec 2025" label for related-card meta rows. */
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric'
})

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params
  const [useCase, index] = await Promise.all([fetchUseCaseTranscript(id), fetchUseCaseList()])
  if (!useCase) return {}
  const title = `${useCase.title} | Open-Science Use Cases`
  // Social share cards need an absolute image URL; relative mock paths only
  // work locally, which is fine for development.
  const previewImage = index?.find((entry) => entry.slug === id)?.preview?.image
  return createPageMetadata({
    title,
    description:
      useCase.description ?? `Read-only replay of the Open-Science session "${useCase.title}".`,
    canonical: `${SITE_DOMAIN}/open-science/use-cases/${id}`,
    ...(previewImage
      ? {
          image: {
            url: previewImage.startsWith('http') ? previewImage : `${SITE_DOMAIN}${previewImage}`,
            width: 1200,
            height: 630,
            alt: useCase.title
          }
        }
      : {})
  })
}

/** Related card per the V2 design: image, category + date meta, title,
 *  description, optional impact bar, and write-up / report / session links. */
const RelatedCard = ({ useCase }: { useCase: UseCaseIndexEntry }) => {
  const detailHref = `/open-science/use-cases/${useCase.slug}`
  return (
    <div className="group flex flex-col overflow-hidden border border-[#e4e4df] bg-white transition-colors hover:border-[#10110f]">
      <Link href={detailHref} className="block aspect-[16/10] overflow-hidden bg-[#e8e8e4]">
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
      </Link>
      <div className="flex flex-1 flex-col gap-3 bg-white px-4 py-4">
        {useCase.category ? (
          <div className="flex items-center justify-between gap-2 text-[13px] text-[#575853]">
            <span className="bg-[#eceae4] px-1.5 py-0.5">{useCase.category}</span>
            <span>{shortDateFormatter.format(new Date(useCase.exportedAt))}</span>
          </div>
        ) : null}
        <h3 className={`${headingClass} line-clamp-2 text-[16px] leading-[1.35] text-[#10110f]`}>
          <Link href={detailHref} className="transition-colors hover:text-[#575853]">
            {useCase.title}
          </Link>
        </h3>
        {useCase.description ? (
          <p className="line-clamp-3 text-[13px] leading-[1.6] text-[#73746e]">
            {useCase.description}
          </p>
        ) : null}
        {useCase.impact ? (
          <div className="bg-[#fdf3d7] px-3 py-2">
            <p className="font-mono text-[13px] font-semibold text-[#10110f]">
              {useCase.impact.timeBefore} → {useCase.impact.timeAfter}
            </p>
            {useCase.impact.costNote ? (
              <p className="mt-0.5 text-[12px] text-[#575853]">{useCase.impact.costNote}</p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[13px] font-medium text-[#10110f]">
          <Link href={detailHref} className="transition-colors hover:text-[#575853]">
            Read the write-up →
          </Link>
          {useCase.report?.url ? (
            <a
              href={useCase.report.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[#575853]"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              PDF
            </a>
          ) : null}
          <Link
            href={`${detailHref}/replay`}
            className="transition-colors hover:text-[#575853]"
          >
            Session
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function OpenScienceUseCaseIntroPage({ params }: PageProps) {
  const { id } = await params
  // Intro only needs the essential tier (artifacts + metadata); the full
  // conversation payload is reserved for the replay page.
  const [useCase, index] = await Promise.all([fetchUseCaseTranscript(id), fetchUseCaseList()])
  if (!useCase) notFound()

  const artifacts: MessageArtifact[] = useCase.items.flatMap((item) =>
    item.type === 'message' ? (item.artifacts ?? []) : []
  )
  // Article body = largest markdown deliverable from the exported session.
  const report = artifacts
    .filter((artifact) => artifact.url && artifact.name.toLowerCase().endsWith('.md'))
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))[0]
  const figureCount = artifacts.filter((artifact) => artifact.mimeType?.startsWith('image/')).length
  const heroImage = artifacts.find(
    (artifact) => artifact.mimeType?.startsWith('image/') && artifact.url
  )
  const indexEntry = index?.find((entry) => entry.slug === useCase.slug)
  const category = indexEntry?.category
  const related =
    index?.filter((entry) => entry.slug !== useCase.slug).slice(0, 3) ?? ([] as UseCaseIndexEntry[])
  // Publisher-designated report wins; otherwise the largest markdown artifact.
  const reportUrl = indexEntry?.report?.url ?? report?.url
  const reportPageCount = indexEntry?.report?.pageCount
  const reportMarkdown = report?.url ? await fetchUseCaseAssetText(report.url) : null

  return (
    // One continuous surface (#f7f7f5) for header, article, related, and CTA.
    <main id="top" className={`-mt-[var(--nav-h)] flex-1 ${surfaceClass} text-[#10110f]`}>
      <section className="pt-[var(--nav-h)]">
        <div className={`${shellClass} pb-12 pt-14 lg:pt-16`}>
          <Link
            href="/open-science/use-cases"
            className="text-[13px] font-medium text-[#73746e] transition-colors hover:text-[#10110f]"
          >
            ← Use Cases
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#90908a]">
            {category ? (
              <>
                <span className="bg-[#f2bd2f]/30 px-1.5 py-0.5 text-[#10110f]">{category}</span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <span>{dateFormatter.format(new Date(useCase.exportedAt))}</span>
            {reportPageCount ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{reportPageCount}-page report</span>
              </>
            ) : null}
            {figureCount > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {figureCount} {figureCount === 1 ? 'figure' : 'figures'}
                </span>
              </>
            ) : null}
          </div>

          <h1 className={`${headingClass} mt-4 text-[clamp(32px,4.2vw,52px)] leading-[1.1]`}>
            {useCase.title}
          </h1>

          {useCase.description ? (
            <p className="mt-5 max-w-[760px] text-[16px] leading-[1.65] text-[#5c5d57]">
              {useCase.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {reportUrl ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 bg-[#10110f] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#f2bd2f] hover:text-[#10110f]"
              >
                <FileText className="size-4" aria-hidden="true" />
                Read the full report
              </a>
            ) : null}
            <Link
              href={`/open-science/use-cases/${useCase.slug}/replay`}
              className="inline-flex min-h-11 items-center border border-[#10110f] bg-white px-5 text-[13px] font-semibold text-[#10110f] transition-colors hover:bg-[#10110f] hover:text-white"
            >
              View the research session
            </Link>
          </div>

          {heroImage?.url ? (
            <div className="mt-10 overflow-hidden border border-[#e4e4df] bg-white">
              {/* biome-ignore lint/performance/noImgElement: exported artifact asset, no Next image rewriting needed. */}
              <img
                src={heroImage.url}
                alt={heroImage.name}
                className="mx-auto max-h-[420px] w-auto max-w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </section>

      {reportMarkdown ? (
        <section className="pb-14">
          {/* osp-session brings markdown tokens; kill its default #fafaf8 fill so this
              block shares the page surface (#f7f7f5) with Related research below. */}
          <div className={`${shellClass} osp-session ![background:transparent]`}>
            <h2 className={`${headingClass} mb-6 text-[28px] leading-[1.2]`}>
              What this research found
            </h2>
            <SessionMarkdown content={reportMarkdown} />
          </div>
        </section>
      ) : useCase.description ? (
        <section className="pb-14">
          <div className={shellClass}>
            <h2 className={`${headingClass} text-[28px] leading-[1.2]`}>
              What this research found
            </h2>
            <p className="mt-4 max-w-[760px] text-[16px] leading-[1.7] text-[#3f403b]">
              {useCase.description}
            </p>
          </div>
        </section>
      ) : null}

      {/* How this research was produced + share row (per the V2 design). */}
      <section className="border-t border-[#e4e4df] py-12">
        <div className={shellClass}>
          <h2 className={`${headingClass} text-[24px] leading-[1.25]`}>
            How this research was produced
          </h2>
          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.7] text-[#5c5d57]">
            AIPOCH planned and ran this
            {category ? ` ${category.toLowerCase()}` : ''} investigation end to end — searching the
            literature, producing the figures, and drafting the report. The full session transcript
            is available to inspect.
          </p>
          <div className="mt-5">
            <ShareRow
              url={`${SITE_DOMAIN}/open-science/use-cases/${useCase.slug}`}
              title={useCase.title}
            />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className={shellClass}>
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className={`${headingClass} text-[28px] leading-[1.2]`}>Related research</h2>
            <Link
              href="/open-science/use-cases"
              className="text-[13px] font-medium text-[#575853] underline underline-offset-4"
            >
              View all →
            </Link>
          </div>
          {related.length === 0 ? (
            <p className="text-sm text-[#777872]">No other published use cases yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry) => (
                <RelatedCard key={entry.slug} useCase={entry} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-10">
        <h2 className={`${headingClass} text-[clamp(24px,2.8vw,36px)] leading-[1.2]`}>
          Run this kind of analysis on your own question
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.6] text-[#73746e]">
          Start a session and see how an AI co-scientist accelerates your research. Pay-as-you-go,
          no subscription required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/open-science"
            className="inline-flex min-h-11 items-center bg-[#10110f] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#f2bd2f] hover:text-[#10110f]"
          >
            Try AIPOCH Web
          </Link>
          <Link
            href="/open-science/use-cases"
            className="inline-flex min-h-11 items-center border border-[#10110f] bg-white px-5 text-[13px] font-semibold text-[#10110f] transition-colors hover:bg-[#10110f] hover:text-white"
          >
            Browse all use cases
          </Link>
        </div>
      </section>
    </main>
  )
}
