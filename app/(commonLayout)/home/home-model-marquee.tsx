'use client'

import providers1 from './assets/providers-1.svg'
import providers2 from './assets/providers-2.svg'
import { HomeMarqueeTrack } from './home-motion'

const assetSrc = (asset: string | { src: string }) =>
  typeof asset === 'string' ? asset : asset.src

/** Equal visual gap between every logo (and between the two SVG strips). */
const LOGO_GAP_PX = 180

const providerStrips = [
  {
    src: assetSrc(providers1),
    alt: 'GPT, Claude, Grok, DeepSeek, Qwen, GLM and Kimi',
    intrinsicWidth: 1693
  },
  {
    src: assetSrc(providers2),
    alt: 'MiniMax, StepFun, MiMo, SenseNova, Doubao and OpenRouter',
    intrinsicWidth: 1583
  }
] as const

export const HomeModelMarquee = () => (
  <div
    data-testid="home-model-marquee"
    className="relative z-20 h-[72px] overflow-hidden border-t border-[#e8e8e3] bg-[#f7f7f5]"
  >
    <HomeMarqueeTrack duration={42}>
      {[false, true].flatMap((duplicate) =>
        providerStrips.map((strip, index) => (
          <div
            className="h-[72px] min-w-0 flex-none overflow-hidden"
            data-testid={duplicate ? undefined : `home-provider-strip-clip-${index + 1}`}
            key={`${strip.src}-${duplicate ? 'duplicate' : 'original'}`}
            style={{
              width: strip.intrinsicWidth,
              marginRight: LOGO_GAP_PX
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: local SVG marks should render without Next image rewriting. */}
            <img
              alt={duplicate ? '' : strip.alt}
              aria-hidden={duplicate}
              className="h-[72px] max-w-none flex-none"
              data-testid={duplicate ? undefined : `home-provider-strip-${index + 1}`}
              height={72}
              src={strip.src}
              style={{ width: strip.intrinsicWidth }}
              width={strip.intrinsicWidth}
            />
          </div>
        ))
      )}
    </HomeMarqueeTrack>
  </div>
)
