import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import type { MessageArtifact } from '@/lib/use-case-types'
import { fetchUseCaseFullTranscript } from '@/service/open-science-use-cases'
import { ArtifactPreviewButton } from '../_components/file-preview'

const kickerClass =
  'relative inline-block w-fit bg-[#e8e8e6] px-[9px] py-1.5 font-mono text-[9px] font-semibold leading-[1.5] tracking-[0.04em] text-[#575853] uppercase after:absolute after:-top-[3px] after:-right-[3px] after:size-1 after:bg-[#f2bd2f]'
const headingClass = 'font-[Georgia,serif] font-normal tracking-normal'
const sectionPaddingClass =
  'px-5 py-20 sm:px-10 sm:py-24 lg:px-[max(5.5vw,calc((100vw-1320px)/2))] lg:py-32'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric'
})

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params
  const useCase = await fetchUseCaseFullTranscript(id)
  if (!useCase) return {}
  const title = `${useCase.title} | Open-Science Use Cases`
  return createPageMetadata({
    title,
    description:
      useCase.description ?? `Read-only replay of the Open-Science session "${useCase.title}".`,
    canonical: `${SITE_DOMAIN}/open-science/use-cases/${id}`
  })
}

export default async function OpenScienceUseCaseIntroPage({ params }: PageProps) {
  const { id } = await params
  const useCase = await fetchUseCaseFullTranscript(id)
  if (!useCase) notFound()

  const messageCount = useCase.items.filter((item) => item.type === 'message').length
  // Count elicitation activities too, matching the index entry's activityCount.
  const activityCount = useCase.items.reduce(
    (total, item) =>
      item.type === 'activity-group'
        ? total + item.activities.length
        : item.type === 'elicitation'
          ? total + 1
          : total,
    0
  )
  const artifacts: MessageArtifact[] = useCase.items.flatMap((item) =>
    item.type === 'message' ? (item.artifacts ?? []) : []
  )

  return (
    <main id="top" className="-mt-[var(--nav-h)] flex-1 bg-[#f5f5f3] text-[#10110f]">
      <section className="border-b border-[#dfdfda] pt-[var(--nav-h)]">
        <div className="mx-auto flex max-w-[1260px] flex-col items-start px-5 py-20 sm:px-10 lg:py-[104px]">
          <p className={kickerClass}>OPEN-SCIENCE / USE CASE</p>
          <h1
            className={`${headingClass} mt-[26px] max-w-[1160px] text-[clamp(32px,4vw,58px)] leading-[1.08]`}
          >
            {useCase.title}
          </h1>
          {useCase.description ? (
            <p className="mt-[26px] max-w-[760px] text-[clamp(15px,1.2vw,18px)] leading-[1.6] text-[#73746e]">
              {useCase.description}
            </p>
          ) : null}
          <div className="mt-9 flex w-fit flex-wrap items-center gap-x-[18px] gap-y-3 border border-[#dfdfda] bg-white/80 px-[17px] py-[13px] font-mono text-[11px]">
            <span className="text-[#777872]">
              Exported {dateFormatter.format(new Date(useCase.exportedAt))}
            </span>
            <strong className="tracking-[0.05em]">{messageCount} messages</strong>
            <strong className="tracking-[0.05em]">{activityCount} activities</strong>
            <span className="text-[#777872]">Project · {useCase.projectName}</span>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/open-science/use-cases/${useCase.slug}/replay`}
              className="inline-flex min-h-12 items-center bg-[#10110f] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#f2bd2f] hover:text-[#10110f]"
            >
              Replay the session →
            </Link>
            <Link
              href="/open-science/use-cases"
              className="text-[13px] font-semibold underline decoration-[#10110f] underline-offset-4"
            >
              All use cases
            </Link>
          </div>
        </div>
      </section>

      <section className={sectionPaddingClass}>
        <div className="mb-[52px] flex flex-col items-start gap-6">
          <p className={kickerClass}>PRODUCED ARTIFACTS</p>
          <h2 className={`${headingClass} text-[clamp(28px,3vw,44px)] leading-[1.1]`}>
            Files this session produced.
          </h2>
          <p className="max-w-[700px] text-[15px] leading-[1.65] text-[#777872]">
            Every file below was written by the agent during the session and is bundled with the
            export. Images, Markdown, CSV, JSON, text, and PDF files preview right here in the
            browser; other types download directly. You can also replay the session to see exactly
            when and why each one was created.
          </p>
        </div>
        {artifacts.length === 0 ? (
          <div className="border border-[#dfdfda] bg-[#fbfbfa] p-8 text-center">
            <p className="text-base text-[#777872]">This session produced no downloadable files.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[#10110f]">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="font-mono text-[10px] uppercase text-[#777872]">
                  <th className="border-b border-[#dfdfda] px-4 py-4 font-medium">File</th>
                  <th className="border-b border-[#dfdfda] px-4 py-4 font-medium">Type</th>
                  <th className="border-b border-[#dfdfda] px-4 py-4 font-medium">Size</th>
                  <th className="border-b border-[#dfdfda] px-4 py-4 font-medium">Preview</th>
                  <th className="border-b border-[#dfdfda] px-4 py-4 font-medium">Download</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {artifacts.map((artifact) => (
                  <tr key={`${artifact.name}-${artifact.url ?? ''}`}>
                    <th className="border-b border-[#dfdfda] px-4 py-4 font-semibold">
                      {artifact.name}
                    </th>
                    <td className="border-b border-[#dfdfda] px-4 py-4 font-mono text-xs text-[#777872]">
                      {artifact.mimeType ?? '—'}
                    </td>
                    <td className="border-b border-[#dfdfda] px-4 py-4 font-mono text-xs text-[#777872]">
                      {typeof artifact.size === 'number' ? formatBytes(artifact.size) : '—'}
                    </td>
                    <td className="border-b border-[#dfdfda] px-4 py-4">
                      {artifact.url ? (
                        <ArtifactPreviewButton
                          file={{
                            name: artifact.name,
                            url: artifact.url,
                            mimeType: artifact.mimeType
                          }}
                        />
                      ) : (
                        <span className="text-[#777872]">Not bundled</span>
                      )}
                    </td>
                    <td className="border-b border-[#dfdfda] px-4 py-4">
                      {artifact.url ? (
                        <a
                          href={artifact.url}
                          download={artifact.name}
                          className="underline decoration-[#10110f] underline-offset-4"
                        >
                          Download ↓
                        </a>
                      ) : (
                        <span className="text-[#777872]">Not bundled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-center border-t border-[#dfdfda] bg-[#efefec] px-5 py-16 text-center sm:px-10">
        <h2
          className={`${headingClass} max-w-[820px] text-[clamp(26px,2.6vw,40px)] leading-[1.15]`}
        >
          Watch the agent search, compute, and write — step by step.
        </h2>
        <Link
          href={`/open-science/use-cases/${useCase.slug}/replay`}
          className="mt-8 inline-flex min-h-12 items-center bg-[#10110f] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#f2bd2f] hover:text-[#10110f]"
        >
          Replay the session →
        </Link>
      </section>
    </main>
  )
}
