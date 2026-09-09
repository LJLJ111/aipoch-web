import { DEFAULT_GITHUB_STAR_COUNT, homeHeroStats } from './home-data'
import { HomeDownload } from './home-download'
import { HomeGithubLink } from './home-github-link'
import { homeHeroArchitectureUrl } from './home-media-assets'
import { HomeModelMarquee } from './home-model-marquee'
import { HomeReveal, MotionPulseDot } from './home-motion'

export const HomeHero = ({ githubStars = DEFAULT_GITHUB_STAR_COUNT }: { githubStars?: number }) => (
  <section
    id="home-hero"
    className="relative flex flex-col overflow-hidden bg-[#f7f7f5] pt-[calc(var(--nav-h)+84px)] sm:pt-[calc(var(--nav-h)+179px)]"
  >
    <HomeReveal
      offset={false}
      delay={0.08}
      visibleInitially
      className="pointer-events-none absolute top-[146px] right-[max(0px,calc((100vw-1320px)/2))] hidden md:block"
    >
      <div
        aria-hidden="true"
        data-testid="home-hero-architecture"
        className="h-[774px] w-[980px] translate-x-[120px] bg-right-top bg-no-repeat opacity-[.50] blur-[.4px] [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.08)_26%,#000_58%,#000_100%)] md:bg-[length:760px_auto] lg:translate-x-[184px] xl:bg-[length:980px_auto]"
        style={{ backgroundImage: `url(${homeHeroArchitectureUrl})` }}
      />
    </HomeReveal>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f7f7f5] to-transparent" />
    <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-[clamp(16px,4vw,40px)]">
      <div data-testid="home-hero-content" className="mt-5 max-w-[1080px]">
        <HomeReveal
          visibleInitially
          className="mb-6 flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#565652]"
        >
          <MotionPulseDot className="size-2 rounded-full bg-[#f2c844] shadow-[0_0_0_5px_rgba(242,200,68,.13)]" />
          <span data-testid="home-hero-eyebrow-product" className="font-bold">
            AIPOCH PRODUCT
          </span>{' '}
          <span className="text-black/25">/</span> OPEN-SOURCE RESEARCH WORKBENCH
        </HomeReveal>
        <HomeReveal delay={0.1} visibleInitially>
          <h1 className="text-[46px] font-normal leading-[.8] text-[#111] sm:text-[66px] lg:text-[100px] lg:leading-[79.56px]">
            <span data-testid="home-hero-title" className="font-normal font-[Georgia,serif]">
              Science, Open to All
            </span>
          </h1>
        </HomeReveal>
        <HomeReveal delay={0.18} visibleInitially>
          <p
            data-testid="home-hero-description"
            className="mt-6 max-w-[620px] text-[15px] leading-[1.6] text-[#6b6b66] sm:mt-7"
          >
            Open-Science is AIPOCH&apos;s open-source, local-first AI research workbench.
            <br />
            It combines agent workflows, Python and R execution, scientific data
            <br />
            connectors, and traceable research artifacts in one inspectable workspace.
          </p>
        </HomeReveal>
        <HomeReveal delay={0.26} visibleInitially>
          <HomeDownload />
        </HomeReveal>
        <HomeReveal delay={0.34} visibleInitially>
          <HomeGithubLink initialStars={githubStars} />
        </HomeReveal>
        <HomeReveal delay={0.4} visibleInitially>
          {/* Keep the community signal and static capability snapshot together in the hero. */}
          <div
            data-testid="home-hero-stats"
            className="mt-12 grid max-w-[870px] grid-cols-2 sm:grid-cols-4"
          >
            {homeHeroStats.map((stat, index) => (
              <div
                key={stat.label}
                data-testid={'testId' in stat ? stat.testId : undefined}
                className={`flex min-h-[108px] flex-col items-center justify-center px-3 py-5 text-center ${index % 2 === 0 ? 'border-r border-black/10' : ''} ${index < 2 ? 'border-b border-black/10 sm:border-b-0' : ''} sm:border-r sm:border-black/10 sm:last:border-r-0`}
              >
                <strong className="font-mono text-[36px] leading-none text-[#202020]">
                  {stat.value}
                </strong>
                <span className="mt-2 font-mono text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.05em] text-[#858581]">
                  {stat.label}
                  {'detail' in stat ? (
                    <>
                      <br />
                      {stat.detail}
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </HomeReveal>
      </div>
    </div>
    <HomeReveal offset={false} delay={0.48} visibleInitially className="mt-16 w-full">
      <HomeModelMarquee />
    </HomeReveal>
  </section>
)
