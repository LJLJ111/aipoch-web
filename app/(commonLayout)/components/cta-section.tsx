import { ArrowLink } from '@/components/arrow-link'

export function CTASection() {
  return (
    <section
      className="relative bg-[#1a1a1a] px-6 py-16 lg:px-8 lg:py-24"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left: Title */}
          <h2
            className="lg:col-span-3 text-2xl font-light leading-tight tracking-tight text-white md:text-3xl lg:text-6xl">
            A place to explore, innovate, and grow
          </h2>

          {/* Right: Description + CTA */}
          <div className="lg:col-span-2 flex flex-col justify-end">
            <p className="mb-6 max-w-sm leading-relaxed text-white/60">
              AIPOCH isn’t just a platform for work—it’s a space to explore, innovate, and grow. Bring your curiosity to
              see what's possible.
              <br />
              <br />
              <br />
              All content on this site is provided for the sole purpose of assisting scientific research only, is not
              intended for clinical use in any way, and is not substitute for professional opinion. If you rely on them
              in ways that could affect your significant interests, you must first have them reviewed and validated by a
              qualified professional.
            </p>
            <div>
              <ArrowLink
                href="/guides"
                leftClassName="bg-white text-black"
                rightClassName="text-white group-hover:text-black group-active:text-black"
                fillClassName="bg-white"
              >
                Add AIPOCH Skills to OpenClaw
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
