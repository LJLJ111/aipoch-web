/**
 * Normalized render model for imported open-science session packages.
 *
 * Shared between `scripts/import-session-package.ts` (producer) and the
 * use-cases renderer under `app/(commonLayout)/open-science/use-cases`
 * (consumer). Keep this file free of runtime code.
 */

export interface UseCaseAsset {
  url: string
  filename: string
  sizeBytes: number
  kind: string
}

export interface NormalizedOutput {
  type: string
  name?: string
  text?: string
  data?: Record<string, string>
  [key: string]: unknown
}

export interface NormalizedRun {
  runId: string
  status: string
  script?: string
  text?: string
  cellId?: string
  startedAt?: number
  endedAt?: number
  outputs: NormalizedOutput[]
}

export interface NormalizedActivity {
  id: string
  title: string
  providerToolName?: string
  toolKind?: string
  status: string
  toolDisposition?: string
  createdAt: number
  updatedAt: number
  input?: unknown
  output?: unknown
  contentBlocks?: unknown[]
  locations?: { path: string; line?: number | null }[]
  run?: NormalizedRun
  /** Present only in the essential tier when oversized payloads were shortened. */
  essentialTruncated?: boolean
}

export interface MessageArtifact {
  name: string
  mimeType?: string
  size?: number
  url?: string
  /** Essential tier only: the file ships in the full tier, so no URL here. */
  fullOnly?: boolean
}

export type TranscriptItem =
  | {
      type: 'message'
      id: string
      role: 'user' | 'assistant'
      content: string
      status: string
      createdAt: number
      completedAt?: number
      parts?: unknown[]
      artifacts?: MessageArtifact[]
    }
  | {
      type: 'elicitation'
      id: string
      message: string
      fields: unknown[]
      status: string
      createdAt: number
      /** Present when the user responded in the original session. */
      state?: string
      answers?: { fieldId: string; value: unknown }[]
      respondedAt?: number
    }
  | { type: 'activity-group'; id: string; activities: NormalizedActivity[] }

export interface UseCaseSession {
  schemaVersion: 1
  slug: string
  title: string
  description?: string
  projectName: string
  exportedAt: number
  sessionCreatedAt: number
  items: TranscriptItem[]
  assets: Record<string, UseCaseAsset>
  omissions: string[]
  excludedFiles: { storageKey: string; filename: string; sizeBytes: number }[]
}

export interface UseCaseIndexEntry {
  slug: string
  title: string
  description?: string
  exportedAt: number
  messageCount: number
  activityCount: number
  /** Whether a heavier full tier exists beyond the essential transcript. */
  hasFull?: boolean
  /** Approximate download size of the full tier (json + full-only assets). */
  fullSizeBytes?: number
}
