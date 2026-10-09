import type {
  MessageArtifact,
  NormalizedActivity,
  NormalizedOutput,
  NormalizedRun,
  TranscriptItem,
  UseCaseAsset,
  UseCaseSession
} from '../use-case-types'
import { readArchive, readJson } from './archive'

interface ManifestInventoryEntry {
  path: string
  sizeBytes: number
  checksum: string
  storageKey?: string
  kind: string
}

interface Manifest {
  format: string
  schemaVersion: number
  requiredFeatures?: string[]
  createdAt: number
  source: { projectId: string; sessionId: string; projectName: string; title: string }
  inventory: ManifestInventoryEntry[]
  excludedFiles: { storageKey: string; filename: string; sizeBytes: number }[]
  omissions: { kind: string; description: string }[]
}

type JsonObject = Record<string, unknown>

interface SessionRecord extends JsonObject {
  title: string
  description?: string
  createdAt: number
  messages: JsonObject[]
  conversationGraph?: { activities?: JsonObject[] }
  artifacts?: JsonObject[]
}

interface RecordsFile extends JsonObject {
  tables: Record<string, JsonObject[]>
}

const buildSanitizer = (session: SessionRecord, runDocument: JsonObject | undefined) => {
  const prefixes: string[] = []
  const cwd = typeof session.cwd === 'string' ? session.cwd : ''
  if (cwd.startsWith('/')) prefixes.push(cwd)
  for (const key of ['notebookSessionRoot', 'dataRoot', 'workspaceCwd']) {
    const value = runDocument?.[key]
    if (typeof value === 'string' && value.startsWith('/')) prefixes.push(value)
  }
  const sanitize = (text: string): string => {
    let out = text
    for (const prefix of prefixes.sort((a, b) => b.length - a.length)) {
      out = out.split(prefix).join('$DATA')
    }
    // Scrub any remaining home-directory paths.
    return out.replace(/\/Users\/[^/"]+\//g, '/Users/***/')
  }
  const deep = (value: unknown): unknown => {
    if (typeof value === 'string') return sanitize(value)
    if (Array.isArray(value)) return value.map(deep)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value as JsonObject).map(([k, v]) => [k, deep(v)]))
    }
    return value
  }
  return { sanitize, deep }
}

// ---------------------------------------------------------------------------
// Blob selection — only copy what the renderer can reference
// ---------------------------------------------------------------------------

// MIME types for package resources; previews also use the original filename.
const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  txt: 'text/plain',
  zip: 'application/zip',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

const SKIP_BLOB = [
  /\/\.provenance\/message-snapshots\//,
  /\/\.provenance\/[^/]+\/versions\/[^/]+\/(evidence|execution)\.json$/,
  /\/cache\//,
  /\/run\.json$/,
  /^execution-file-evidence\//
]

// Extensions the static server can serve with a displayable Content-Type.
// Essential-tier limits: blobs larger than this ship only in the full tier, and
// any single string longer than this is shortened with a visible marker.
const ESSENTIAL_ASSET_MAX_BYTES = 2 * 1024 ** 2
const ESSENTIAL_TEXT_MAX_CHARS = 24 * 1024
const ESSENTIAL_TRUNCATION_MARK =
  '\n… [shortened in the essential view — load the full version for the complete payload]'

const hasOversizedString = (value: unknown): boolean => {
  if (typeof value === 'string') return value.length > ESSENTIAL_TEXT_MAX_CHARS
  if (Array.isArray(value)) return value.some(hasOversizedString)
  if (value && typeof value === 'object') {
    return Object.values(value as JsonObject).some(hasOversizedString)
  }
  return false
}

const truncateOversizedStrings = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.length > ESSENTIAL_TEXT_MAX_CHARS
      ? value.slice(0, ESSENTIAL_TEXT_MAX_CHARS) + ESSENTIAL_TRUNCATION_MARK
      : value
  }
  if (Array.isArray(value)) return value.map(truncateOversizedStrings)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonObject).map(([key, entry]) => [
        key,
        truncateOversizedStrings(entry)
      ])
    )
  }
  return value
}

export async function parsePackage(archive: Blob, slug: string) {
  const objects = await readArchive(archive)
  const manifest = await readJson<Manifest>(objects.get('manifest.json'), 'manifest.json')
  if (manifest.format !== 'open-science-session' || manifest.schemaVersion !== 1)
    throw new Error('Unsupported .science manifest format or schema version.')
  if (
    !Array.isArray(manifest.inventory) ||
    !manifest.source ||
    typeof manifest.source.title !== 'string'
  )
    throw new Error('Invalid package manifest.')
  for (const feature of manifest.requiredFeatures ?? []) {
    if (!['literature', 'ro-crate'].includes(feature))
      throw new Error(`Unsupported required feature: ${feature}`)
  }
  const inventoried = new Set<string>()
  for (const entry of manifest.inventory) {
    if (inventoried.has(entry.path)) throw new Error(`Duplicate inventory entry: ${entry.path}`)
    inventoried.add(entry.path)
    const file = objects.get(entry.path)
    if (!file || file.blob.size !== entry.sizeBytes || file.checksum !== entry.checksum)
      throw new Error(`Package inventory verification failed: ${entry.path}`)
  }
  for (const path of objects.keys()) {
    if (path !== 'manifest.json' && !inventoried.has(path))
      throw new Error(`Unverified archive entry: ${path}`)
  }
  const sessionFile = await readJson<{ version: number; session: SessionRecord }>(
    objects.get('session.json'),
    'session.json'
  )
  if (
    sessionFile.version !== 2 ||
    !sessionFile.session ||
    !Array.isArray(sessionFile.session.messages)
  )
    throw new Error('Unsupported or invalid session.json.')
  const records = objects.has('records.json')
    ? await readJson<RecordsFile>(objects.get('records.json'), 'records.json')
    : undefined
  const pkg = { manifest, sessionFile, records, objects }
  const session = sessionFile.session
  const resources: { id: string; blob: Blob }[] = []
  const resource = (blob: Blob, filename: string) => {
    const id = `science-asset:${resources.length}`
    const extension = filename.split('.').pop()?.toLowerCase() ?? ''
    // HTML and SVG must not become executable same-origin blob documents.
    const type = extension === 'svg' ? 'text/plain' : (MIME_BY_EXT[extension] ?? 'text/plain')
    resources.push({ id, blob: blob.slice(0, blob.size, type) })
    return id
  }
  // --- assets: storageKey -> public url -----------------------------------
  // Blob names carry a real extension (resolved from records.json or the
  // storage key) so the static server returns a displayable Content-Type
  // instead of application/octet-stream for images and documents.
  const filenameByStorageKey = new Map<string, string>()
  for (const table of ['ArtifactVersion', 'UploadVersion'] as const) {
    for (const row of pkg.records?.tables[table] ?? []) {
      const key = row.contentStorageKey
      const filename = row.filename ?? row.originalFilename
      if (typeof key === 'string' && typeof filename === 'string') {
        filenameByStorageKey.set(key, filename)
      }
    }
  }
  const assets: Record<string, UseCaseAsset> = Object.create(null)
  for (const entry of manifest.inventory) {
    const storageKey = entry.storageKey
    if (!storageKey) continue
    if (SKIP_BLOB.some((pattern) => pattern.test(storageKey))) continue
    const bytes = pkg.objects.get(entry.path)
    if (!bytes) continue
    const filename =
      filenameByStorageKey.get(storageKey) ?? storageKey.split('/').pop() ?? entry.path
    assets[storageKey] = {
      url: resource(bytes.blob, filename),
      filename,
      sizeBytes: entry.sizeBytes,
      kind: entry.kind
    }
  }

  // --- notebook run document ----------------------------------------------
  const runEntry = manifest.inventory.find((e) => e.storageKey?.endsWith('/run.json'))
  const runDocument = runEntry
    ? await readJson<JsonObject>(pkg.objects.get(runEntry.path), runEntry.path)
    : undefined
  const { sanitize, deep } = buildSanitizer(session, runDocument)

  // Correlate notebook runs by executionInvocationId; extract base64 figures.
  const runsByInvocation = new Map<string, NormalizedRun>()
  let figureIndex = 0
  for (const run of (runDocument?.runs as JsonObject[] | undefined) ?? []) {
    const invocationId = run.executionInvocationId
    if (typeof invocationId !== 'string') continue
    const outputs: NormalizedOutput[] = []
    for (const output of (run.outputs as JsonObject[] | undefined) ?? []) {
      const normalized = { ...(deep(output) as NormalizedOutput) }
      const image = normalized.data?.['image/png']
      if (image && !image.startsWith('/')) {
        figureIndex += 1
        const filename = `figure-${String(figureIndex).padStart(2, '0')}.png`
        const bytes = Uint8Array.from(atob(image), (char) => char.charCodeAt(0))
        normalized.data = {
          ...normalized.data,
          'image/png': resource(new Blob([bytes]), filename)
        }
      }
      outputs.push(normalized)
    }
    runsByInvocation.set(invocationId, {
      runId: String(run.runId ?? ''),
      status: String(run.status ?? ''),
      script: typeof run.script === 'string' ? sanitize(run.script) : undefined,
      text: typeof run.text === 'string' ? sanitize(run.text) : undefined,
      cellId: typeof run.cellId === 'string' ? run.cellId : undefined,
      startedAt: typeof run.startedAt === 'number' ? run.startedAt : undefined,
      endedAt: typeof run.endedAt === 'number' ? run.endedAt : undefined,
      outputs
    })
  }

  // --- activities ------------------------------------------------------------
  const graphActivities = pkg.sessionFile.session.conversationGraph?.activities ?? []
  const activityItems: { ts: number; item: TranscriptItem }[] = []
  for (const activity of graphActivities) {
    const ts =
      typeof activity.sortIndex === 'number' ? activity.sortIndex : Number(activity.createdAt)
    const elicitation = activity.elicitation as JsonObject | undefined
    if (elicitation) {
      activityItems.push({
        ts,
        item: {
          type: 'elicitation',
          id: String(activity.id),
          message: sanitize(String(elicitation.message ?? '')),
          fields: (deep(elicitation.fields) as unknown[]) ?? [],
          status: String(activity.status ?? 'completed'),
          createdAt: Number(activity.createdAt),
          state: typeof elicitation.state === 'string' ? elicitation.state : undefined,
          answers: deep(elicitation.answers) as { fieldId: string; value: unknown }[] | undefined,
          respondedAt:
            typeof elicitation.respondedAt === 'number' ? elicitation.respondedAt : undefined
        }
      })
      continue
    }
    const invocationId =
      typeof activity.executionInvocationId === 'string'
        ? activity.executionInvocationId
        : undefined
    const normalized: NormalizedActivity = {
      id: String(activity.id),
      title: sanitize(String(activity.title ?? '')),
      providerToolName:
        typeof activity.providerToolName === 'string' ? activity.providerToolName : undefined,
      toolKind: typeof activity.toolKind === 'string' ? activity.toolKind : undefined,
      status: String(activity.status ?? 'completed'),
      toolDisposition:
        typeof activity.toolDisposition === 'string' ? activity.toolDisposition : undefined,
      createdAt: Number(activity.createdAt),
      updatedAt: Number(activity.updatedAt),
      input: deep(activity.rawInput),
      output: deep(activity.rawOutput),
      contentBlocks: deep(activity.toolContent) as unknown[] | undefined,
      locations: deep(activity.toolLocations) as NormalizedActivity['locations'],
      run: invocationId ? runsByInvocation.get(invocationId) : undefined
    }
    activityItems.push({
      ts,
      item: { type: 'activity-group', id: normalized.id, activities: [normalized] }
    })
  }

  // --- session-level artifacts (cards below messages) ------------------------
  // Each assistant message lists the artifact version ids it produced; the app
  // pins the cards to that message, so resolve per-message instead of lumping
  // everything onto the final one.
  const sessionArtifacts: MessageArtifact[] = []
  const artifactByVersionId = new Map<string, MessageArtifact>()
  for (const artifact of session.artifacts ?? []) {
    const storageKey =
      typeof artifact.path === 'string' ? artifact.path.replace(/^\$DATA\//, '') : undefined
    const asset = storageKey ? assets[storageKey] : undefined
    const normalized: MessageArtifact = {
      name: String(artifact.name ?? 'file'),
      mimeType: typeof artifact.mimeType === 'string' ? artifact.mimeType : undefined,
      size: typeof artifact.size === 'number' ? artifact.size : undefined,
      url: asset?.url
    }
    sessionArtifacts.push(normalized)
    if (typeof artifact.id === 'string') artifactByVersionId.set(artifact.id, normalized)
  }

  // --- messages ---------------------------------------------------------------
  // Relative markdown links in message content point at workspace files; rewrite
  // them to the exported asset URLs so the web renderer can serve the bytes.
  const assetUrlByFilename = new Map<string, string>()
  for (const [storageKey, asset] of Object.entries(assets)) {
    const filename = storageKey.split('/').pop()
    if (filename && !assetUrlByFilename.has(filename)) assetUrlByFilename.set(filename, asset.url)
  }
  for (const artifact of sessionArtifacts) {
    if (artifact.url) assetUrlByFilename.set(artifact.name, artifact.url)
  }
  const resolveMessageLinks = (content: string): string =>
    content.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
      if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return match
      let filename = href
      try {
        filename = decodeURIComponent(href)
      } catch {
        // keep the raw href when it is not valid percent-encoding
      }
      const url = assetUrlByFilename.get(filename)
      return url ? `[${label}](${url})` : match
    })
  const messageItems: { ts: number; item: TranscriptItem }[] = session.messages.map((message) => {
    const artifactIds = Array.isArray(message.artifactIds)
      ? (message.artifactIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : []
    const messageArtifacts = artifactIds
      .map((id) => artifactByVersionId.get(id))
      .filter((artifact): artifact is MessageArtifact => Boolean(artifact))
    return {
      ts: Number(message.createdAt),
      item: {
        type: 'message',
        id: String(message.id),
        role: message.role === 'user' ? 'user' : 'assistant',
        content: resolveMessageLinks(sanitize(String(message.content ?? ''))),
        status: String(message.status ?? 'complete'),
        createdAt: Number(message.createdAt),
        completedAt: typeof message.completedAt === 'number' ? message.completedAt : undefined,
        parts: deep(message.parts) as unknown[] | undefined,
        artifacts: messageArtifacts.length > 0 ? messageArtifacts : undefined
      }
    }
  })

  // --- timeline: merge by timestamp, fold consecutive activities into groups ---
  const merged = [...messageItems, ...activityItems].sort((a, b) => a.ts - b.ts)
  const items: TranscriptItem[] = []
  for (const { item } of merged) {
    const last = items[items.length - 1]
    if (item.type === 'activity-group' && last?.type === 'activity-group') {
      last.activities.push(...item.activities)
    } else {
      items.push(item)
    }
  }

  const model: UseCaseSession = {
    schemaVersion: 1,
    slug,
    title: sanitize(manifest.source.title || session.title),
    description: session.description ? sanitize(session.description) : undefined,
    projectName: manifest.source.projectName,
    exportedAt: manifest.createdAt,
    sessionCreatedAt: Number(session.createdAt),
    items,
    assets,
    omissions: (manifest.omissions ?? []).map((o) => sanitize(o.description)),
    excludedFiles: manifest.excludedFiles ?? []
  }

  // Both views are derived from the same parsed package.
  // The essential tier keeps the whole conversation but shortens oversized tool
  // payloads and drops large file blobs, so the default transcript stays readable.
  const essentialAssetUrls = new Set(
    Object.values(assets)
      .filter((asset) => asset.sizeBytes <= ESSENTIAL_ASSET_MAX_BYTES)
      .map((asset) => asset.url)
  )
  const fullOnlyAssetBytes = Object.values(assets)
    .filter((asset) => asset.sizeBytes > ESSENTIAL_ASSET_MAX_BYTES)
    .reduce((sum, asset) => sum + asset.sizeBytes, 0)

  let truncatedActivityCount = 0
  const essentialItems: TranscriptItem[] = items.map((item) => {
    if (item.type === 'message') {
      if (!item.artifacts?.length) return item
      return {
        ...item,
        artifacts: item.artifacts.map((artifact) => {
          const inEssential = Boolean(
            artifact.url && essentialAssetUrls.has(artifact.url as string)
          )
          return {
            ...artifact,
            url: inEssential ? artifact.url : undefined,
            // A file that exists in the full tier but exceeds the essential
            // asset budget is "full only"; files missing from both tiers
            // (excluded at export time) get no marker.
            fullOnly: Boolean(artifact.url) && !inEssential ? true : undefined
          }
        })
      }
    }
    if (item.type !== 'activity-group') return item
    return {
      ...item,
      activities: item.activities.map((activity) => {
        const truncated = hasOversizedString([
          activity.input,
          activity.output,
          activity.contentBlocks,
          activity.run
        ])
        if (!truncated) return activity
        truncatedActivityCount += 1
        return {
          ...activity,
          input: truncateOversizedStrings(activity.input) as NormalizedActivity['input'],
          output: truncateOversizedStrings(activity.output) as NormalizedActivity['output'],
          contentBlocks: truncateOversizedStrings(
            activity.contentBlocks
          ) as NormalizedActivity['contentBlocks'],
          run: truncateOversizedStrings(activity.run) as NormalizedActivity['run'],
          essentialTruncated: true
        }
      })
    }
  })
  const essentialAssets = Object.fromEntries(
    Object.entries(assets).filter(([, asset]) => essentialAssetUrls.has(asset.url))
  )
  const essentialModel: UseCaseSession = {
    ...model,
    items: essentialItems,
    assets: essentialAssets,
    omissions:
      truncatedActivityCount > 0 || fullOnlyAssetBytes > 0
        ? [
            ...model.omissions,
            'Large tool payloads and files over 2 MiB are shortened in the essential view; load the full version for everything.'
          ]
        : model.omissions
  }

  return { essential: essentialModel, full: model, resources }
}
