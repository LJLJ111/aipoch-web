import { staticAsset } from '@/lib/staticAsset'

/** CDN filenames for Open-Science marketing screenshots (shared by / and /open-science). */
export const openScienceScreenshotFiles = {
  figma: 'figma-5fcb02c8.webp',
  project: 'Project-f176542f.webp',
  paper: 'paper-fb87a969.webp',
  file: 'file-b2436cc8.webp'
} as const

export const openScienceScreenshotUrls = {
  figma: staticAsset(openScienceScreenshotFiles.figma),
  project: staticAsset(openScienceScreenshotFiles.project),
  paper: staticAsset(openScienceScreenshotFiles.paper),
  file: staticAsset(openScienceScreenshotFiles.file)
} as const

export const openScienceProductTourVideoFile = 'open-science-v0-10-0-9ca70918.mp4' as const

export const openScienceProductTourVideoUrl = staticAsset(openScienceProductTourVideoFile)

export const openScienceHeroVideoUrl = staticAsset('hero-vid-v2-1080p-bee9c53f.mp4')
export const openScienceHeroPosterUrl = staticAsset('hero-vid-poster-279a4840.webp')
