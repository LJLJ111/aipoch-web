import {
  type DownloadManifest,
  isValidDownloadManifest,
  OPEN_SCIENCE_DOWNLOAD_KEYS,
  OPEN_SCIENCE_DOWNLOAD_MANIFEST_URL
} from '@/app/(commonLayout)/open-science/open-science-download-data'

const OPEN_SCIENCE_MANIFEST_TIMEOUT_MS = 5_000

/** Keep only fields consumed by the page before crossing the server/client boundary. */
function normalizeDownloadManifest(manifest: DownloadManifest): DownloadManifest {
  const downloads: DownloadManifest['downloads'] = {}
  for (const key of OPEN_SCIENCE_DOWNLOAD_KEYS) {
    const asset = manifest.downloads[key]
    if (!asset) continue
    downloads[key] = {
      url: asset.url,
      ...(asset.size === undefined ? {} : { size: asset.size }),
      ...(asset.sha256 === undefined ? {} : { sha256: asset.sha256 })
    }
  }

  return {
    version: manifest.version,
    ...(manifest.releaseDate === undefined ? {} : { releaseDate: manifest.releaseDate }),
    downloads
  }
}

function readE2EManifest(value: string): DownloadManifest | null {
  try {
    const manifest = JSON.parse(value) as unknown
    return isValidDownloadManifest(manifest) ? normalizeDownloadManifest(manifest) : null
  } catch {
    return null
  }
}

export async function fetchOpenScienceDownloadManifest(
  signal?: AbortSignal
): Promise<DownloadManifest> {
  const e2eManifest = process.env.E2E_OPEN_SCIENCE_MANIFEST
  if (e2eManifest && process.env.NODE_ENV !== 'production') {
    const manifest = readE2EManifest(e2eManifest)
    if (manifest) return manifest
  }

  // Load the stable app manifest directly from the CDN once per page visit.
  const response = await fetch(OPEN_SCIENCE_DOWNLOAD_MANIFEST_URL, {
    cache: 'no-store',
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(OPEN_SCIENCE_MANIFEST_TIMEOUT_MS)])
      : AbortSignal.timeout(OPEN_SCIENCE_MANIFEST_TIMEOUT_MS)
  })
  if (!response.ok) throw new Error('Failed to load Open-Science download manifest.')

  const manifest = (await response.json()) as unknown
  if (!isValidDownloadManifest(manifest)) {
    throw new Error('Invalid Open-Science download manifest.')
  }

  return normalizeDownloadManifest(manifest)
}
