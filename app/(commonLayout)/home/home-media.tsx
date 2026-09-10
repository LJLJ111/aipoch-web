'use client'

import { Play } from 'lucide-react'
import { useInView } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import type { HomeSpotlightMediaItem } from './home-spotlight-content'
import { MediaLoadingShell } from './home-motion'

const HAVE_CURRENT_DATA_READY_STATE = 2

export const isHomeVideoFrameReady = (readyState: number) =>
  readyState >= HAVE_CURRENT_DATA_READY_STATE

export const isHomeVideoPlaybackReady = (
  readyState: number,
  paused: boolean,
  ended: boolean,
  currentTime: number
) => isHomeVideoFrameReady(readyState) || (!paused && !ended && currentTime > 0)

export const isHomeImageFrameReady = (complete: boolean, naturalWidth: number) =>
  complete && naturalWidth > 0

export const isHomeMediaEventForActiveItem = (eventItemId: string, activeItemId: string) =>
  eventItemId !== '' && eventItemId === activeItemId

export const HomeMedia = ({ media }: { media: HomeSpotlightMediaItem[] }) => {
  const reactId = useId()
  const panelId = `${reactId}-panel`
  const initialId = media[0]?.id ?? ''
  const [active, setActive] = useState(initialId)
  const [mediaReady, setMediaReady] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  // Observe the stable shell — not the <video>, which unmounts on screenshot tabs.
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const activeItemIdRef = useRef('')
  const inView = useInView(containerRef, { amount: 0.15 })
  const activeItem = media.find((item) => item.id === active) ?? media[0]
  const activeItemId = activeItem?.id ?? ''
  activeItemIdRef.current = activeItemId
  const isVideo = activeItem?.kind === 'video'
  const isUnknown = activeItem?.kind === 'unknown'
  const tabId = (id: string) => `${reactId}-tab-${id}`
  const videoEnabled = Boolean(isVideo && activeItem?.url && !mediaError && !isUnknown)
  const attachSrc = videoEnabled
  const shouldPlay = videoEnabled && inView

  useEffect(() => {
    if (media.some((item) => item.id === active)) return
    setActive(media[0]?.id ?? '')
  }, [active, media])

  useEffect(() => {
    setMediaReady(false)
    // Unrecognized URLs stay as tabs but show the black unavailable panel immediately.
    setMediaError(isUnknown)
  }, [active, isUnknown])

  const markReady = (itemId: string) => {
    if (!isHomeMediaEventForActiveItem(itemId, activeItemIdRef.current)) return
    setMediaError(false)
    setMediaReady(true)
  }
  const markFailed = (itemId: string) => {
    if (!isHomeMediaEventForActiveItem(itemId, activeItemIdRef.current)) return
    setMediaError(true)
    setMediaReady(false)
  }
  const syncVideoIfReady = (itemId: string) => {
    const video = videoRef.current
    if (!video) return
    if (
      isHomeVideoPlaybackReady(video.readyState, video.paused, video.ended, video.currentTime)
    ) {
      markReady(itemId)
    }
  }

  // Cached clips may skip canplay/playing; sync the first decoded frame after mount/src attach.
  useEffect(() => {
    if (!attachSrc) return
    const video = videoRef.current
    if (!video) return

    const syncIfReady = () => {
      syncVideoIfReady(activeItemId)
    }

    syncIfReady()
    const timer = window.setTimeout(syncIfReady, 0)
    return () => window.clearTimeout(timer)
  }, [activeItem?.url, activeItemId, attachSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!shouldPlay) {
      video.pause()
      return
    }
    void video.play().then(() => syncVideoIfReady(activeItemId)).catch(() => undefined)
  }, [activeItem?.url, activeItemId, shouldPlay])

  // Cached images can be complete before React sees onLoad, so mirror the video readyState check.
  useEffect(() => {
    if (activeItem?.kind !== 'image' || mediaError || isUnknown) return
    const image = imageRef.current
    if (!image) return

    const syncIfReady = () => {
      if (isHomeImageFrameReady(image.complete, image.naturalWidth)) {
        markReady(activeItemId)
      }
    }

    syncIfReady()
    const timer = window.setTimeout(syncIfReady, 0)
    return () => window.clearTimeout(timer)
  }, [activeItem?.kind, activeItemId, mediaError, isUnknown])

  const selectTab = (id: string) => {
    setActive(id)
    requestAnimationFrame(() => {
      document.getElementById(tabId(id))?.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: 'smooth'
      })
    })
  }

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = media.findIndex((tab) => tab.id === active)
    if (currentIndex < 0) return

    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % media.length
    else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + media.length) % media.length
    } else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = media.length - 1
    else return

    event.preventDefault()
    const next = media[nextIndex]
    if (!next) return
    selectTab(next.id)
    document.getElementById(tabId(next.id))?.focus()
  }

  const overlayVisible = !mediaReady || mediaError || isUnknown

  if (media.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="min-w-0 overflow-hidden rounded-[16px] border border-white/10 bg-[#0f1013] shadow-[0_40px_90px_rgba(8,10,16,.45)]"
    >
      <div
        className="flex overflow-x-auto overscroll-x-contain border-b border-white/[.08] bg-[#141519] [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/[.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35"
        role="tablist"
        aria-label="Open-Science media previews"
        onKeyDown={onTabKeyDown}
      >
        {media.map((tab) => (
          <button
            type="button"
            role="tab"
            id={tabId(tab.id)}
            key={tab.id}
            aria-selected={active === tab.id}
            aria-controls={panelId}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            className={`shrink-0 border-b-2 px-[15px] py-3 font-mono text-[10.5px] tracking-[0.05em] transition ${active === tab.id ? 'border-[#ecd44c] text-white' : 'border-transparent text-[#7d828d] hover:text-[#c3c7d0]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="relative aspect-video overflow-hidden border-b border-white/[.07] bg-[#111216]"
      >
        <MediaLoadingShell hidden={!overlayVisible}>
          <div
            data-testid="home-media-loading"
            role="status"
            aria-live="polite"
            aria-hidden={!overlayVisible}
            className="flex flex-col items-center gap-3.5"
          >
            <div className="flex size-[62px] items-center justify-center rounded-full border border-white/22 bg-white/[.05]">
              <Play className="ml-0.5 size-[22px] fill-[#ecd44c] text-[#ecd44c]" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#e7e9ee]">Loading...</p>
            <p className="max-w-[44ch] font-mono text-[10.5px] leading-[1.6] text-[#6e737d]">
              Loading media, please wait…
            </p>
          </div>
        </MediaLoadingShell>

        {isVideo && activeItem?.url && !mediaError && !isUnknown ? (
          <video
            key={activeItem.id}
            ref={videoRef}
            className="absolute inset-0 z-[2] h-full w-full object-contain"
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={() => syncVideoIfReady(activeItemId)}
            onLoadedData={() => syncVideoIfReady(activeItemId)}
            onProgress={() => syncVideoIfReady(activeItemId)}
            onCanPlay={() => syncVideoIfReady(activeItemId)}
            onPlay={() => syncVideoIfReady(activeItemId)}
            onPlaying={() => syncVideoIfReady(activeItemId)}
            onTimeUpdate={() => syncVideoIfReady(activeItemId)}
            onError={() => markFailed(activeItemId)}
            src={attachSrc ? activeItem.url : undefined}
          >
            Your browser does not support the video element.
          </video>
        ) : activeItem?.url && !mediaError && !isUnknown && activeItem.kind === 'image' ? (
          // Fit the full screenshot inside the 16:9 frame without cropping.
          <img
            ref={imageRef}
            key={activeItem.id}
            src={activeItem.url}
            width={3840}
            height={1940}
            alt={activeItem.alt}
            loading="eager"
            className="absolute inset-0 z-[2] h-full w-full object-contain backface-hidden [transform:translateZ(0)] [image-rendering:-webkit-optimize-contrast]"
            onLoad={() => markReady(activeItemId)}
            onError={() => markFailed(activeItemId)}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-[9px] border-t border-white/[.07] px-[15px] py-[11px] font-mono text-[10.5px] leading-[1.5] text-[#7d828d]">
        <i className="size-[5px] shrink-0 rounded-full bg-[#ecd44c]" />
        {activeItem?.caption}
      </div>
    </div>
  )
}
