'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchOpenScienceDownloadManifest } from '@/service/open-science-download'
import {
  type DownloadKey,
  type DownloadManifest,
  getOpenScienceRecommendedDownloadKeys,
  OPEN_SCIENCE_RELEASES_URL
} from './open-science-download-data'
import { openScienceAction } from './open-science-section'

export function OpenScienceDownload({
  initialManifest
}: {
  initialManifest: DownloadManifest | null
}) {
  const [manifest, setManifest] = useState<DownloadManifest | null>(initialManifest)
  const [loading, setLoading] = useState(!initialManifest)
  const [device, setDevice] = useState({ userAgent: '', maxTouchPoints: 0 })

  useEffect(() => {
    setDevice({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints })
    // Preserve the server snapshot used by JSON-LD; retry in the browser only after an SSR failure.
    if (initialManifest) return

    const controller = new AbortController()
    void fetchOpenScienceDownloadManifest(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setManifest(value)
      })
      .catch(() => {
        if (!controller.signal.aborted) setManifest(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [initialManifest])

  const recommendedKeys = getOpenScienceRecommendedDownloadKeys(
    device.userAgent,
    manifest,
    device.maxTouchPoints
  )
  const platforms: { key: DownloadKey; label: string; detail: string }[] = [
    { key: 'win-x64', label: 'Windows', detail: 'x64' },
    { key: 'mac-arm64', label: 'Apple Silicon', detail: 'For M-series Macs' },
    { key: 'mac-x64', label: 'macOS Intel', detail: 'For Intel Macs' },
    {
      key: manifest?.downloads['linux-x64-appimage'] ? 'linux-x64-appimage' : 'linux-x64-deb',
      label: 'Linux',
      detail: manifest?.downloads['linux-x64-appimage'] ? 'x64 · AppImage' : 'x64 · .deb'
    }
  ]
  platforms.sort(
    (a, b) => Number(recommendedKeys.includes(b.key)) - Number(recommendedKeys.includes(a.key))
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${openScienceAction} cursor-pointer border-[#171717] bg-[#171717] text-white hover:bg-[#333]`}
        >
          <Download className="size-4 text-current" aria-hidden="true" />
          Download Open-Science
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[220px] rounded-lg border-[#e7e5de] bg-white p-1.5 text-[#111] shadow-lg motion-reduce:animate-none!"
      >
        {loading ? (
          <p role="status" className="p-3 text-sm text-[#6b6b66]">
            Loading downloads...
          </p>
        ) : null}
        {platforms.map((platform) => {
          const asset = manifest?.downloads[platform.key]
          if (!asset) return null
          const isRecommended = recommendedKeys.includes(platform.key)
          return (
            <DropdownMenuItem
              key={platform.key}
              asChild
              data-recommended={isRecommended ? 'true' : undefined}
              className="group flex cursor-pointer justify-between gap-4 rounded-md px-3 py-2 focus:bg-[#f3f3f0] focus:text-[#111] focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-inset"
            >
              <a href={asset.url}>
                <span>
                  <span className="block text-sm font-semibold">{platform.label}</span>
                  <span className="block text-xs leading-5 text-[#6b6b66]">{platform.detail}</span>
                  {isRecommended ? (
                    <span className="sr-only">Recommended for your operating system</span>
                  ) : null}
                </span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f3f3f0] group-focus:bg-[#111] group-focus:text-white">
                  <Download className="size-4 text-current" aria-hidden="true" />
                </span>
              </a>
            </DropdownMenuItem>
          )
        })}
        {!loading && !manifest ? (
          <>
            <p role="status" className="px-3 py-2 text-xs text-[#6b6b66]">
              Installers are temporarily unavailable.
            </p>
            <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
              <a href={OPEN_SCIENCE_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                View latest release
              </a>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
