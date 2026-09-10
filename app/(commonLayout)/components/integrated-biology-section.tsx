import { CookieManagedYoutubeEmbed } from '@/components/youtube/cookie-managed-youtube-embed'

export function IntegratedBiologySection() {
  const videoId = 'QzEU8FPMgnI'

  return (
    <section className="bg-[#e8e8e8] px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Copy. */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-light tracking-tight text-black md:text-[35px] lg:text-[42px]">
            Support Your Research 24/7 with OpenClaw and AIPOCH Skills
          </h2>
          <p className="mt-6 mx-auto max-w-6xl text-sm leading-relaxed text-black/60 md:text-base">
            AIPOCH skills, used by AI agents like OpenClaw, continuously assist with various
            research tasks—helping you make progress anytime, around the clock.
          </p>
        </div>

        {/* YouTube embed. */}
        <div className="relative w-full overflow-hidden rounded-xl bg-[#e8e8e8] aspect-video">
          <CookieManagedYoutubeEmbed
            videoId={videoId}
            title="AIPOCH YouTube video"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  )
}
