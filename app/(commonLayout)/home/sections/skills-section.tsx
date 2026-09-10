import { BarChart3, BookOpen, PenLine, Workflow } from 'lucide-react'
import { skillAreas } from '../home-data'
import { HomeReveal } from '../home-motion'
import { Eyebrow } from '../home-primitives'
import { homeContainer, homeSection } from '../home-styles'
import { SkillsInteractive } from '../interactive'

export const HomeSkillsSection = ({ skillsCount }: { skillsCount: number }) => (
  <section id="skills" className={homeSection}>
    <div className={homeContainer}>
      <HomeReveal>
        <Eyebrow>
          §03 · Agent Skills <span className="text-[#8f8f8f]">/ the library</span>
        </Eyebrow>
      </HomeReveal>
      <SkillsInteractive skillsCount={skillsCount}>
        <HomeReveal
          delay={0.09}
          className="mt-[clamp(40px,6vw,64px)] grid overflow-hidden rounded-[16px] border border-black/14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {skillAreas.map(([title, description], index) => {
            const Icon = [BookOpen, Workflow, BarChart3, PenLine][index] ?? BookOpen
            return (
              <article
                key={title}
                data-testid={`skill-area-${index}`}
                className="group relative overflow-hidden border-r border-b border-black/14 bg-white px-6 pt-7 pb-[26px] transition-[background] duration-[250ms] hover:bg-[#111] hover:text-white sm:[&:nth-child(2n)]:max-lg:border-r-0 lg:[&:nth-child(4n)]:border-r-0"
              >
                <div className="font-mono text-[11px] text-[#8f8f8f] group-hover:text-[#7d828d]">
                  <span>0{index + 1}</span>
                </div>
                <div className="mt-5 mb-[22px] flex size-10 items-center justify-center rounded-[13px] border border-black/14 group-hover:border-white/25">
                  <Icon className="size-[22px] group-hover:text-[#ecd44c]" />
                </div>
                <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{title}</h3>
                <p
                  data-testid="skill-area-description"
                  className="mt-2 max-h-0 text-xs leading-[1.5] text-[#555] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:max-h-20 group-hover:text-[#b7bcc6] group-hover:opacity-100"
                >
                  {description}
                </p>
                <div className="absolute right-5 bottom-[22px] font-mono text-[11px] text-[#8f8f8f] group-hover:text-[#ecd44c]">
                  skills →
                </div>
              </article>
            )
          })}
        </HomeReveal>
      </SkillsInteractive>
    </div>
  </section>
)
