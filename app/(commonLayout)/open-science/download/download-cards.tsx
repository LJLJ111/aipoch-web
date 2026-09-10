'use client'

import {
  type DownloadKey,
  type DownloadManifest,
  formatDownloadSize,
  getHomepageManifestPlatformLinks
} from '../open-science-download-data'

const installerCards: {
  key: DownloadKey
  platform: string
  format: string
  title: string
  architecture: string
  requirement: string
  analyticsEvent: string
}[] = [
  {
    key: 'mac-arm64',
    platform: 'MACOS',
    format: 'DMG',
    title: 'Apple Silicon',
    architecture: 'M1 or newer · ARM64',
    requirement: 'macOS 12 Monterey or later',
    analyticsEvent: 'download_mac_arm64'
  },
  {
    key: 'mac-x64',
    platform: 'MACOS',
    format: 'DMG',
    title: 'Intel',
    architecture: 'Intel processor · x64',
    requirement: 'macOS 12 Monterey or later',
    analyticsEvent: 'download_mac_x64'
  },
  {
    key: 'win-x64',
    platform: 'WINDOWS',
    format: 'EXE',
    title: 'Windows x64',
    architecture: '64-bit installer',
    requirement: 'Windows 10 or 11 · x64',
    analyticsEvent: 'download_windows_x64'
  },
  {
    key: 'linux-x64-deb',
    platform: 'LINUX',
    format: 'DEB',
    title: 'Linux',
    architecture: 'Debian package · amd64',
    requirement: '64-bit Debian / Ubuntu',
    analyticsEvent: 'download_linux_deb'
  }
]

export function DownloadCards({
  manifest,
  recommendedKey
}: {
  manifest: DownloadManifest
  recommendedKey: DownloadKey
}) {
  const orderedCards = getHomepageManifestPlatformLinks(manifest, recommendedKey).flatMap(
    ({ id }) => installerCards.filter((card) => card.key === id)
  )

  return (
    <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Open-Science installers">
      {orderedCards.map((card, index) => {
        const asset = manifest.downloads[card.key]
        if (!asset) return null
        const isRecommended = index === 0

        return (
          <li key={card.key} className="list-none">
            <article
              data-download-key={card.key}
              data-recommended={isRecommended ? 'true' : undefined}
              className={`relative flex min-h-[420px] flex-col bg-[#fbfbfa] p-6 sm:p-8 ${
                isRecommended
                  ? 'border border-[#d5b14f] shadow-[inset_0_3px_0_#f2bd2f]'
                  : 'border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-semibold tracking-[0.08em]">
                <span>{card.platform}</span>
                <span className="border border-[#dfdfda] px-2 py-1 text-[#777872]">
                  {card.format}
                </span>
              </div>
              {isRecommended ? (
                <p className="absolute top-[62px] right-7 bg-[#f2bd2f] px-2 py-[5px] font-mono text-[8px] font-semibold tracking-[0.08em] uppercase">
                  For your system
                </p>
              ) : null}
              <h3 className="mt-[58px] font-[Georgia,serif] text-[clamp(32px,2.55vw,43px)] font-normal leading-[1.1] tracking-normal">
                {card.title}
              </h3>
              <p className="mt-3 text-[14px] text-[#777872]">{card.architecture}</p>
              <dl className="mt-auto grid grid-cols-[1.4fr_0.6fr] gap-4 pt-[27px] pb-[19px]">
                <div className="border-t border-[#dfdfda] pt-3">
                  <dt className="font-mono text-[9px] tracking-[0.12em] text-[#777872] uppercase">
                    Requires
                  </dt>
                  <dd className="mt-1.5 text-xs leading-[1.4]">{card.requirement}</dd>
                </div>
                <div className="border-t border-[#dfdfda] pt-3">
                  <dt className="font-mono text-[9px] tracking-[0.12em] text-[#777872] uppercase">
                    File
                  </dt>
                  <dd className="mt-1.5 text-xs leading-[1.4]">{formatDownloadSize(asset.size)}</dd>
                </div>
              </dl>
              <a
                href={asset.url}
                data-analytics-event={card.analyticsEvent}
                onClick={() => window.gtag?.('event', card.analyticsEvent)}
                className="flex min-h-[54px] items-center justify-between bg-[#10110f] px-[18px] text-[13px] font-semibold text-[#fbfbfa] transition-colors hover:bg-[#dca510] hover:text-[#10110f]"
              >
                Download <span aria-hidden="true">↓</span>
              </a>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
