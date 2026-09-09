import { GithubIcon } from '@/components/svg-icons/github-icon'
import { ActionLink, HomeCtaLink } from '../home-cta-button'
import { homeCtaClasses } from '../home-cta'
import { HomeReveal } from '../home-motion'
import { Eyebrow } from '../home-primitives'
import { homeContainer } from '../home-styles'

export const HomeClosingSection = () => (
  <section id="close" className="bg-[#141519] text-white">
    <div className={`${homeContainer} py-[clamp(80px,12vh,140px)] text-center`}>
      <HomeReveal className="flex justify-center">
        <Eyebrow dark>§05 · The way you do research is changing</Eyebrow>
      </HomeReveal>
      <HomeReveal delay={0.09}>
        <h2
          data-testid="closing-title"
          className="mx-auto max-w-[16ch] text-[clamp(30px,5.4vw,66px)] font-extrabold leading-[1.02] tracking-[-0.035em]"
        >
          Open, auditable,{' '}
          <br />
          and{' '}
          <em className="relative inline-block italic after:absolute after:right-0 after:bottom-[.02em] after:left-0 after:h-[.09em] after:bg-[#ecd44c]">
            yours to run.
          </em>
        </h2>
      </HomeReveal>
      <HomeReveal delay={0.09}>
        <p className="mx-auto mt-[26px] max-w-[52ch] text-base leading-[1.7] text-[#b7bcc6]">
          Bring your curiosity — see what an open research harness makes possible. Describe a task,
          and let the agent do the work while you keep every action in view.
        </p>
      </HomeReveal>
      <HomeReveal delay={0.18} className="mt-[38px] flex flex-wrap justify-center gap-3.5">
        <ActionLink href="https://github.com/aipoch/open-science" external light arrow={false}>
          <GithubIcon className="size-4 shrink-0" aria-hidden="true" />
          <span>Explore Open-Science on GitHub</span>
        </ActionLink>
        <HomeCtaLink href="/open-science" fill="black" className={homeCtaClasses.black.onDarkLarge}>
          <span>Try Open-Science</span>
        </HomeCtaLink>
      </HomeReveal>
      <HomeReveal delay={0.18}>
        <p className="mx-auto mt-11 max-w-[72ch] border-t border-white/10 pt-[22px] text-[11.5px] leading-[1.7] text-[#5f6470]">
          All content on this site is provided for the sole purpose of assisting scientific research
          only, is not intended for clinical use in any way, and is not a substitute for professional
          opinion. If you rely on them in ways that could affect your significant interests, you must
          first have them reviewed and validated by a qualified professional.
        </p>
      </HomeReveal>
    </div>
  </section>
)
