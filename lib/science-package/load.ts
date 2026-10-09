import { waitForBrowserMock } from '../../mocks/ready'
import type { UseCasePackage, UseCaseSession } from '../use-case-types'
import type { PackageProgress } from './archive'
import type { WorkerReply } from './protocol'

export type ReplayState =
  | { status: 'loading'; progress: PackageProgress | { stage: 'metadata' } }
  | { status: 'ready'; data: UseCaseSession }
  | { status: 'error'; message: string }

export function loadReplay(slug: string, update: (state: ReplayState) => void) {
  const controller = new AbortController()
  const urls: string[] = []
  let worker: Worker | undefined
  let active = true
  const release = () => {
    worker?.terminate()
    worker = undefined
    for (const url of urls) URL.revokeObjectURL(url)
    urls.length = 0
  }
  const fail = (message: string) => {
    if (!active) return
    active = false
    controller.abort()
    release()
    console.error('[use-case-replay] load.failed', { slug, message })
    update({ status: 'error', message })
  }
  update({ status: 'loading', progress: { stage: 'metadata' } })
  void (async () => {
    try {
      await waitForBrowserMock()
      if (!active) return
      const response = await fetch(
        `/open-science/use-cases/${encodeURIComponent(slug)}/replay/dot-science`,
        {
          signal: controller.signal,
          cache: 'no-store'
        }
      )
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? `Package information failed (HTTP ${response.status}).`)
      }
      const info: UseCasePackage = await response.json()
      if (!active) return
      worker = new Worker(new URL('./replay.worker.ts', import.meta.url), { type: 'module' })
      worker.onerror = (event) =>
        fail(
          event.message ||
            'The package worker could not run. Retry or use a browser with Web Worker and gzip support.'
        )
      worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
        if (!active) return
        if (data.type === 'error') fail(data.message)
        else if (data.type === 'progress') update({ status: 'loading', progress: data.progress })
        else if (data.type === 'resources') {
          try {
            const mapping = Object.fromEntries(
              data.resources.map(({ id, blob }) => {
                const url = URL.createObjectURL(blob)
                urls.push(url)
                return [id, url]
              })
            )
            worker?.postMessage({ type: 'urls', urls: mapping })
          } catch (error) {
            fail(error instanceof Error ? error.message : 'Could not create package resources.')
          }
        } else {
          active = false
          console.info('[use-case-replay] load.complete', { slug })
          worker?.terminate()
          worker = undefined
          update({ status: 'ready', data: data.data })
        }
      }
      worker.postMessage({ type: 'load', slug, info })
    } catch (error) {
      if (active)
        fail(error instanceof Error ? error.message : 'Could not load package information.')
    }
  })()
  return () => {
    active = false
    controller.abort()
    release()
  }
}
