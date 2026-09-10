import { SectionIntro } from '../home-primitives'
import { homeContainer, homeSection } from '../home-styles'
import { EcosystemFlow } from '../interactive'

export const HomeEcosystemSection = ({ skillsCount }: { skillsCount: number }) => (
  <section id="ecosystem" className={homeSection}>
    <div className={homeContainer}>
      <SectionIntro
        titleTestId="ecosystem-title"
        layout="balanced"
        eyebrow={
          <>
            §01 · Ecosystem <span className="text-[#8f8f8f]">/ signal flow</span>
          </>
        }
        title={
          <>
            The AIPOCH Ecosystem for <br />
            Scientific AI Workflows
          </>
        }
        lead={
          <>
            Open-Science handles workflow execution and orchestration, while medical research Skills
            define the domain knowledge and execution logic — audited before anything ships.
          </>
        }
      />
      <EcosystemFlow skillsCount={skillsCount} />
    </div>
  </section>
)
