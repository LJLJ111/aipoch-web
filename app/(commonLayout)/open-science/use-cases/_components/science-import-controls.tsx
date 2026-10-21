'use client'

import { ArrowUpRight } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  createScienceImport,
  type ImportState,
  INITIAL_IMPORT_STATE
} from '@/lib/science-package/browser-import'
import type { UseCasePackage } from '@/lib/use-case-types'

type ImportSession = ReturnType<typeof createScienceImport>
const ImportContext = createContext<{
  state: ImportState
  session: RefObject<ImportSession | null>
  packageInfo: UseCasePackage
} | null>(null)

/** Own one transfer for every import entry point on the page. Dispose it on navigation. */
export const ScienceImportProvider = ({
  packageInfo,
  children
}: {
  packageInfo?: UseCasePackage
  children: ReactNode
}) => {
  const [state, setState] = useState<ImportState>(INITIAL_IMPORT_STATE)
  const session = useRef<ReturnType<typeof createScienceImport> | null>(null)
  const filename = packageInfo?.filename
  const importUrl = packageInfo?.importUrl ?? packageInfo?.url
  useEffect(() => {
    setState(INITIAL_IMPORT_STATE)
    if (!importUrl || !filename) return
    const current = createScienceImport({ url: importUrl, filename }, setState)
    session.current = current
    return () => {
      current.dispose()
      session.current = null
    }
  }, [importUrl, filename])
  return (
    <ImportContext.Provider value={packageInfo ? { state, session, packageInfo } : null}>
      {/* Announce the shared transfer once; each visible feedback area stays readable. */}
      {packageInfo ? (
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {[state.message, state.launchError].filter(Boolean).join(' ')}
        </p>
      ) : null}
      {children}
    </ImportContext.Provider>
  )
}

const useScienceImport = () => {
  const value = useContext(ImportContext)
  if (!value) throw new Error('Import controls require a science package provider')
  return value
}

/** Share action dispatch and progress across the composer and overview buttons. */
export const ScienceImportButton = ({
  variant = 'composer'
}: {
  variant?: 'composer' | 'detail' | 'toolbar'
}) => {
  const { state, session, packageInfo } = useScienceImport()
  const busy = ['checking', 'opening', 'downloading', 'sending', 'canceling'].includes(state.phase)
  const downloading = state.phase === 'downloading'
  const sending = state.phase === 'sending'
  const progressing = downloading || (sending && state.loaded !== undefined)
  const total = state.total ?? (downloading ? packageInfo.sizeBytes : undefined)
  const percent =
    total && total > 0 && state.loaded !== undefined
      ? Math.min(100, Math.floor((state.loaded / total) * 100))
      : undefined
  const progressText = percent !== undefined ? `${percent}%` : '—%'
  const progressLabel = downloading ? 'Downloading .science package' : 'Sending to Open-Science'
  // Keep each entry point's default wording when cancellation or failure allows a fresh start.
  const defaultLabel = variant === 'detail' ? 'Open in Open-Science' : 'Continue in Open-Science'
  const label =
    state.phase === 'checking'
      ? 'Checking Open-Science…'
      : state.phase === 'opening'
        ? 'Waiting for Open-Science…'
        : sending
          ? 'Sending to Open-Science…'
          : state.phase === 'canceling'
            ? 'Canceling…'
            : state.phase === 'received'
              ? 'Open Open-Science'
              : state.action === 'resume'
                ? 'I’ve opened Open-Science'
                : state.action === 'open'
                  ? 'Open Open-Science'
                  : state.needsApp
                    ? 'Try again'
                    : defaultLabel

  return (
    <button
      type="button"
      aria-label={progressing ? `${progressLabel}: ${progressText}` : undefined}
      disabled={busy || !state.action}
      onClick={() => {
        if (state.action === 'prepare') void session.current?.prepareAndOpen()
        else if (state.action === 'resume') void session.current?.resume()
        else if (state.action === 'open') void session.current?.open()
        else if (state.action === 'launch') session.current?.openApp()
      }}
      className={
        variant === 'toolbar'
          ? 'inline-flex h-9 -my-1.5 items-center justify-center gap-2 bg-[#10110f] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#4a4b46] active:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10110f] disabled:cursor-default max-sm:ml-auto'
          : variant === 'detail'
            ? 'inline-flex min-h-11 items-center justify-center gap-2 bg-[#10110f] px-5 py-1 text-[13px] font-semibold text-white transition-colors hover:bg-[#4a4b46] active:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10110f] disabled:cursor-default'
            : 'inline-flex min-h-10 w-full items-center justify-center gap-3 rounded-xl bg-[#10110f] px-5 py-1 text-sm font-semibold text-white transition-colors hover:bg-[#34352f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10110f] disabled:cursor-default sm:w-auto sm:min-w-56'
      }
    >
      {progressing ? (
        <span
          className={
            variant === 'toolbar'
              ? 'flex w-full flex-col items-center'
              : 'flex w-full flex-col items-center gap-1'
          }
        >
          <span
            className={
              variant === 'toolbar'
                ? 'text-[13px] leading-4 tabular-nums'
                : 'text-sm leading-4 tabular-nums'
            }
          >
            {progressText}
          </span>
          <small
            className={
              variant === 'toolbar'
                ? 'text-[10px] font-normal leading-3 text-white/80'
                : 'text-[11px] font-normal leading-4 text-white/80'
            }
          >
            {progressLabel}
          </small>
        </span>
      ) : (
        <>
          {label}
          <ArrowUpRight
            className={variant === 'toolbar' ? 'size-4 shrink-0' : 'size-5 shrink-0'}
            aria-hidden="true"
          />
        </>
      )}
    </button>
  )
}

/** Keep every recovery action and browser permission hint beside each entry point. */
export const ScienceImportFeedback = ({ compact = false }: { compact?: boolean }) => {
  const {
    state,
    session,
    packageInfo: { url, filename }
  } = useScienceImport()
  const busy = ['checking', 'opening', 'downloading', 'sending', 'canceling'].includes(state.phase)
  const needsApp = state.needsApp
  const downloadPrompt = 'download it first'
  const inlineDownload = needsApp && state.message?.endsWith(`${downloadPrompt}.`)
  const waitingTimedOut = state.phase === 'ready' && state.action === 'resume'
  const opening = state.phase === 'opening' || state.action === 'resume'
  // The sticky toolbar shows only the current guidance; completed transfers need no permissions.
  const showPermissionHint = !compact || !state.message || opening
  const message =
    compact && state.phase === 'received' ? 'File sent. Confirm in Open-Science.' : state.message
  return (
    <>
      {showPermissionHint ? (
        <p className={`${compact ? '' : 'mt-1.5'} text-xs leading-5 text-[#777872]`}>
          {compact
            ? opening
              ? 'Choose Open and allow local network access if prompted.'
              : 'Allow app and local network access if prompted. Keep this page open.'
            : opening
              ? 'If your browser asks to open Open-Science, choose Open. You may also need to allow local network access.'
              : 'You may need to allow your browser to open Open-Science and access your local network. Keep this page open until the file is sent.'}
        </p>
      ) : null}
      <div className="space-y-2 text-[13px] leading-6 text-[#777872]">
        <div className="flex items-center gap-x-4">
          <p
            role={state.phase === 'error' || state.phase === 'unsupported' ? 'alert' : 'status'}
            aria-live="off"
            className={
              state.phase === 'error'
                ? 'text-status-failure-foreground'
                : state.phase === 'unsupported'
                  ? 'text-status-warning-foreground'
                  : !state.message
                    ? 'sr-only'
                    : undefined
            }
          >
            {inlineDownload ? (
              <>
                {state.message?.slice(0, -`${downloadPrompt}.`.length)}
                <a
                  href="/open-science/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  {downloadPrompt}
                </a>
                .
              </>
            ) : (
              message
            )}{' '}
            {state.phase === 'received' ? (
              <span>
                {compact ? '' : 'Clicked Cancel by mistake? '}
                <button
                  type="button"
                  onClick={() => void session.current?.retryImport()}
                  className="font-medium text-[#10110f] underline underline-offset-4"
                >
                  {compact ? 'Retry import' : 'Retry the import.'}
                </button>
              </span>
            ) : null}
          </p>
          {busy ? (
            <button
              type="button"
              disabled={state.phase === 'canceling'}
              onClick={() => session.current?.cancel()}
              className="min-h-10 shrink-0 whitespace-nowrap font-medium text-[#10110f] underline underline-offset-4 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
        {state.launchError ? (
          <p role="alert" aria-live="off" className="text-status-failure-foreground">
            {state.launchError}
          </p>
        ) : null}
        {waitingTimedOut ? (
          <p>
            If Open-Science does not open,{' '}
            <a
              href={url}
              download={filename}
              className="font-medium text-[#10110f] underline underline-offset-4"
            >
              download the .science package
            </a>{' '}
            and double-click it to open it with your installed Open-Science app. You can also choose
            “Open with” and select Open-Science. If you haven’t installed it yet,{' '}
            <a
              href="/open-science/download"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#10110f] underline underline-offset-4"
            >
              Download Open-Science
            </a>{' '}
            and install it first.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {needsApp && !waitingTimedOut && !inlineDownload ? (
            <a
              href="/open-science/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center font-medium text-[#10110f] underline underline-offset-4"
            >
              Download Open-Science
            </a>
          ) : null}
          {state.action === 'resume' ? (
            <button
              type="button"
              onClick={() => void session.current?.open()}
              className="min-h-10 font-medium text-[#10110f] underline underline-offset-4"
            >
              Open Open-Science
            </button>
          ) : null}
          {(state.phase === 'error' && state.action === 'open') || state.action === 'resume' ? (
            <button
              type="button"
              onClick={() => session.current?.restart()}
              className="min-h-10 font-medium text-[#10110f] underline underline-offset-4"
            >
              Start a new transfer
            </button>
          ) : null}
        </div>
      </div>
    </>
  )
}
