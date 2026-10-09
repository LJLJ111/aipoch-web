'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadReplay, type ReplayState } from '@/lib/science-package/load'
import { SessionTranscript } from './session-transcript'

const TopBar = ({ slug }: { slug: string }) => (
  <div className="sticky top-[var(--nav-h)] z-10 border-b border-[#dfdfda] bg-[#fafaf8]/90 backdrop-blur-sm">
    <div className="mx-auto flex min-h-[47px] w-full max-w-4xl items-center gap-3 px-4 py-2.5 md:px-6">
      <Link
        href={`/open-science/use-cases/${slug}`}
        className="shrink-0 text-[13px] font-medium text-[#575853] transition-colors hover:text-[#10110f]"
      >
        ← Back to overview
      </Link>
      <span className="ml-auto hidden truncate text-right text-[11px] uppercase tracking-[0.04em] text-[#90908a] sm:inline">
        Read-only replay of an exported Open-Science session
      </span>
    </div>
  </div>
)

const labels = {
  metadata: 'Fetching package information…',
  downloading: 'Downloading research package…',
  verifying: 'Verifying SHA-256…',
  parsing: 'Parsing research session…'
}

export const ReplayView = ({ slug }: { slug: string }) => {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<ReplayState>({
    status: 'loading',
    progress: { stage: 'metadata' }
  })
  useEffect(() => {
    void attempt
    return loadReplay(slug, setState)
  }, [slug, attempt])
  const progress = state.status === 'loading' ? state.progress : undefined
  const percent =
    progress?.stage === 'downloading' && progress.total && progress.loaded !== undefined
      ? Math.min(100, Math.floor((progress.loaded / progress.total) * 100))
      : undefined
  return (
    <main id="top" className="-mt-[var(--nav-h)] flex-1 bg-[#fafaf8] pt-[var(--nav-h)]">
      <TopBar slug={slug} />
      {state.status === 'ready' ? (
        <SessionTranscript session={state.data} />
      ) : state.status === 'error' ? (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div role="alert">
            <p className="font-medium">This use case could not be loaded.</p>
            <p className="mt-2 text-sm text-[#777872]">{state.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-4 rounded-full border px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-16 text-center">
          <p role="status" aria-live="polite">
            {labels[state.progress.stage]}
          </p>
          <progress
            aria-label={labels[state.progress.stage]}
            max={100}
            value={percent}
            className="w-64"
          />
          {percent !== undefined && <p className="text-sm tabular-nums">{percent}%</p>}
          <p className="text-sm text-[#777872]">
            Large research packages can take a while. Keep this page open.
          </p>
        </div>
      )}
    </main>
  )
}
