'use client'

import { useCookieConsentStore } from '@/components/cookie-consent'

type CookieManagedYoutubeEmbedProps = {
  videoId: string
  title: string
  className?: string
}

const buildEmbedUrl = ({
  videoId,
  embeddedMedia
}: {
  videoId: string
  embeddedMedia: boolean
}) => {
  // All YouTube iframes use the privacy-enhanced domain; embeddedMedia only controls playback behavior.
  const host = 'www.youtube-nocookie.com'
  const params = new URLSearchParams({ rel: '0' })

  // embeddedMedia controls autoplay and looping without switching to the standard YouTube domain.
  if (embeddedMedia) {
    params.set('autoplay', '1')
    params.set('mute', '1')
    params.set('loop', '1')
    params.set('playlist', videoId)
  }

  return `https://${host}/embed/${encodeURIComponent(videoId)}?${params.toString()}`
}

export function CookieManagedYoutubeEmbed({
  videoId,
  title,
  className
}: CookieManagedYoutubeEmbedProps) {
  const hasHydrated = useCookieConsentStore((state) => state.hasHydrated)
  const embeddedMedia = useCookieConsentStore((state) => state.embeddedMedia)

  // Force the privacy-safe URL before hydration so neither SSR HTML nor the initial client render contacts the marketing domain.
  const embedUrl = buildEmbedUrl({
    videoId,
    embeddedMedia: hasHydrated ? embeddedMedia : false
  })

  return (
    <iframe
      src={embedUrl}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={className}
    />
  )
}
