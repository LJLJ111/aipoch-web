import { describe, expect, test } from 'bun:test'
import {
  type DownloadManifest,
  getOpenScienceRecommendedDownloadKeys
} from '../../app/(commonLayout)/open-science/open-science-download-data'

const manifest: DownloadManifest = {
  version: '1.0.0',
  downloads: {
    'win-x64': { url: 'https://example.com/app.exe' },
    'mac-arm64': { url: 'https://example.com/arm.dmg' },
    'mac-x64': { url: 'https://example.com/intel.dmg' },
    'linux-x64-deb': { url: 'https://example.com/app.deb' },
    'linux-x64-appimage': { url: 'https://example.com/app.AppImage' }
  }
}

describe('Open-Science device recommendations', () => {
  test('recommends the available Windows installer', () => {
    expect(getOpenScienceRecommendedDownloadKeys('Windows NT 10.0; Win64; x64', manifest)).toEqual([
      'win-x64'
    ])
  })

  test('prefers AppImage on Linux and falls back to deb when AppImage is absent', () => {
    expect(getOpenScienceRecommendedDownloadKeys('X11; Linux x86_64', manifest)).toEqual([
      'linux-x64-appimage'
    ])
    expect(
      getOpenScienceRecommendedDownloadKeys('X11; Linux x86_64', {
        version: '1.0.0',
        downloads: { 'linux-x64-deb': manifest.downloads['linux-x64-deb'] }
      })
    ).toEqual(['linux-x64-deb'])
  })

  test('keeps both Mac architectures available without guessing from Intel Mac OS X', () => {
    expect(
      getOpenScienceRecommendedDownloadKeys('Macintosh; Intel Mac OS X 10_15_7', manifest)
    ).toEqual(['mac-arm64', 'mac-x64'])
  })

  test('does not recommend unavailable or unloaded installers', () => {
    expect(getOpenScienceRecommendedDownloadKeys('Windows NT 10.0', null)).toEqual([])
    expect(
      getOpenScienceRecommendedDownloadKeys('Windows NT 10.0', {
        version: '1.0.0',
        downloads: { 'mac-x64': manifest.downloads['mac-x64'] }
      })
    ).toEqual([])
    expect(
      getOpenScienceRecommendedDownloadKeys('Macintosh; Intel Mac OS X 10_15_7', {
        version: '1.0.0',
        downloads: { 'mac-x64': manifest.downloads['mac-x64'] }
      })
    ).toEqual(['mac-x64'])
  })

  test('does not recommend desktop installers on mobile, desktop-mode iPad, or unknown systems', () => {
    for (const userAgent of [
      'Linux; Android 14',
      'iPhone; CPU iPhone OS 17_0 like Mac OS X',
      'iPad; CPU OS 17_0 like Mac OS X',
      'Windows Phone 10.0; Android 6.0.1',
      'unknown'
    ])
      expect(getOpenScienceRecommendedDownloadKeys(userAgent, manifest)).toEqual([])
    expect(
      getOpenScienceRecommendedDownloadKeys('Macintosh; Intel Mac OS X 10_15_7', manifest, 5)
    ).toEqual([])
  })
})
