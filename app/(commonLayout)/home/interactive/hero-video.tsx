'use client'

import { useRef } from 'react'
import {
  openScienceHeroPosterUrl,
  openScienceHeroVideoUrl
} from '@/lib/open-science-media-assets'
import { usePlayWhenVisible } from '../home-motion'

export const HeroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { shouldPlay } = usePlayWhenVisible(videoRef, true)

  return (
    <div className="relative aspect-[1440/1080] min-w-0 overflow-hidden rounded-[16px] bg-white leading-[0] shadow-[0_32px_80px_rgba(20,30,60,.14),0_8px_26px_rgba(0,0,0,.06)]">
      <video
        ref={videoRef}
        data-testid="hero-video"
        className="block h-full w-full rounded-[inherit] bg-white object-cover"
        src={shouldPlay ? openScienceHeroVideoUrl : undefined}
        poster={openScienceHeroPosterUrl}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label="Open-Science workbench — an agent session producing traceable artifacts"
      />
    </div>
  )
}
