'use client'

import { marqueePrimary, marqueeSecondary } from '../home-data'
import { HomeMarqueeTrack } from '../home-motion'

const MarqueeRow = ({
  items,
  reverse = false,
  alternate = false
}: {
  items: readonly string[]
  reverse?: boolean
  alternate?: boolean
}) => (
  <div
    data-testid={alternate ? 'homepage-marquee-secondary' : 'homepage-marquee-primary'}
    className={`overflow-hidden border-y py-3.5 ${alternate ? '-mt-px border-black/15 bg-[#e8e8e8] text-[#111]' : 'border-black bg-[#111] text-white'}`}
    aria-hidden="true"
  >
    <HomeMarqueeTrack reverse={reverse} duration={alternate ? 44 : 38}>
      {[...items, ...items].map((item, index) => (
        <span
          className="flex items-center whitespace-nowrap font-mono text-[13px]"
          key={`${item}-${index}`}
        >
          {item}
          <span data-marquee-separator="true" className="mx-[22px] text-[#ecd44c]">
            /
          </span>
        </span>
      ))}
    </HomeMarqueeTrack>
  </div>
)

export const HomeMarquees = ({ skillsCount }: { skillsCount: number }) => {
  const currentMarqueeSecondary = [`${skillsCount}+ skills`, ...marqueeSecondary]

  return (
    <div>
      <MarqueeRow items={marqueePrimary} />
      <MarqueeRow items={currentMarqueeSecondary} reverse alternate />
    </div>
  )
}
