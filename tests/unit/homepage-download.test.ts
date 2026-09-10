import { describe, expect, test } from 'bun:test'
import {
  type DownloadManifest,
  getHomepageManifestPlatformLinks,
  OPEN_SCIENCE_RELEASES_URL,
  resolveHomepageDownloadHref
} from '../../app/(commonLayout)/open-science/open-science-download-data'

const sampleManifest: DownloadManifest = {
  version: '0.2.0',
  downloads: {
    'mac-arm64': {
      url: 'https://cdn.example.com/open-science-mac-arm64.dmg',
      size: 172885330
    },
    'mac-x64': {
      url: 'https://cdn.example.com/open-science-mac-x64.dmg',
      size: 180000000
    },
    'win-x64': {
      url: 'https://cdn.example.com/open-science-win-x64.exe',
      size: 140501246
    }
  }
}

describe('homepage download manifest helpers', () => {
  test('resolveHomepageDownloadHref uses the recommended platform asset url', () => {
    expect(resolveHomepageDownloadHref(sampleManifest, 'mac-arm64')).toBe(
      'https://cdn.example.com/open-science-mac-arm64.dmg'
    )
    expect(resolveHomepageDownloadHref(sampleManifest, 'win-x64')).toBe(
      'https://cdn.example.com/open-science-win-x64.exe'
    )
  })

  test('resolveHomepageDownloadHref falls back to GitHub releases when missing', () => {
    expect(resolveHomepageDownloadHref(null, 'mac-arm64')).toBe(OPEN_SCIENCE_RELEASES_URL)
    expect(resolveHomepageDownloadHref(sampleManifest, 'linux-x64-deb')).toBe(
      OPEN_SCIENCE_RELEASES_URL
    )
  })

  test('getHomepageManifestPlatformLinks lists only assets with urls and formats detail', () => {
    expect(getHomepageManifestPlatformLinks(null, 'mac-arm64')).toEqual([])
    expect(getHomepageManifestPlatformLinks(sampleManifest, 'mac-arm64')).toEqual([
      {
        id: 'mac-arm64',
        url: 'https://cdn.example.com/open-science-mac-arm64.dmg',
        detail: '.dmg · 164.9 MB'
      },
      {
        id: 'mac-x64',
        url: 'https://cdn.example.com/open-science-mac-x64.dmg',
        detail: '.dmg · 171.7 MB'
      },
      {
        id: 'win-x64',
        url: 'https://cdn.example.com/open-science-win-x64.exe',
        detail: '.exe · 134 MB'
      }
    ])
  })
})
