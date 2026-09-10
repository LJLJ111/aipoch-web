import { GithubIcon } from '@/components/svg-icons/github-icon'
import { homeCtaClasses } from '../home-cta'
import { ActionLink, HomeCtaLink } from '../home-cta-button'
import { ResearchWorkbench } from '../interactive'
import { HomeReveal } from '../home-motion'
import { SectionIntro } from '../home-primitives'
import { homeContainer, homeOpenScienceBand } from '../home-styles'

export const HomeWorkbenchSection = () => (
  <section id="open-science" className={homeOpenScienceBand}>
      <div className={homeContainer}>
        <SectionIntro
          titleTestId="workbench-title"
          layout="titleWide"
          dark
          eyebrow={
            <>
              §02 · Flagship <span className="text-[#5f6470]">/ the workbench</span>
            </>
          }
          title={
            <>
              Open-Science — the{' '}
              <br />
              open-source AI research{' '}
              <br />
              workbench
            </>
          }
          lead={
            <>
              <b className="text-white">Open-Science</b> is an open-source, model-agnostic AI
              workbench for scientific discovery. Create a project, describe a task in plain
              language, and let the agent read files, run code, search the web, call scientific data
              connectors, and return reports, tables, figures, and an inspectable activity history
              in one workspace.
            </>
          }
        />
        <ResearchWorkbench />
        <HomeReveal delay={0.09} className="mt-9 flex flex-wrap gap-3.5">
          <ActionLink href="https://github.com/aipoch/open-science" external light arrow={false}>
            <GithubIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>Explore Open-Science</span>
          </ActionLink>
          <HomeCtaLink href="/open-science" fill="black" className={homeCtaClasses.black.onDark}>
            <span>Download · macOS / Windows / Linux</span>
          </HomeCtaLink>
        </HomeReveal>
      </div>
  </section>
)
