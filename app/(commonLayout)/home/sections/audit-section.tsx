import { ArrowRight, Check, CircleAlert, Clock3, Flag, Shield, X } from 'lucide-react'
import { homeCtaClasses } from '../home-cta'
import { HomeCtaLink } from '../home-cta-button'
import { HomeReveal } from '../home-motion'
import { SectionIntro } from '../home-primitives'
import { homeContainer, homeSection } from '../home-styles'

export const HomeAuditSection = () => (
  <section id="audit" className={homeSection}>
      <div className={homeContainer}>
        <SectionIntro
          titleTestId="audit-title"
          eyebrow={
            <>
              §04 · Benchmark <span className="text-[#8f8f8f]">/ release gate</span>
            </>
          }
          title={
            <>
              MedSkillAudit — every skill{' '}
              <br />
              is audited before it ships
            </>
          }
          lead={
            <>
              A skill is only as trustworthy as the review behind it.{' '}
              <b className="text-black">MedSkillAudit</b> is a domain-specific audit framework that
              decides whether a medical research agent skill is{' '}
              <b className="text-black">release-ready before deployment</b> — governing scientific
              integrity, methodological soundness, reproducibility, and safety boundaries that
              general-purpose evaluation misses.
            </>
          }
        />
        <HomeReveal
          delay={0.09}
          className="mt-[clamp(32px,5vw,48px)] flex flex-wrap items-center gap-3 text-[13px] font-semibold"
        >
          <span className="inline-flex items-center gap-[9px] rounded-full border border-black/14 bg-white px-[17px] py-[11px]">
            <i className="size-1.5 rounded-full bg-black/30" />
            Skill submitted
          </span>
          <span className="text-[#8f8f8f]" aria-hidden="true">
            →
          </span>
          <span className="inline-flex items-center gap-[9px] rounded-full border border-black bg-black px-[17px] py-[11px] text-white">
            <i className="size-1.5 rounded-full bg-[#ecd44c]" />
            MedSkillAudit release gate
          </span>
          <span className="text-[#8f8f8f]" aria-hidden="true">
            →
          </span>
          <span className="inline-flex items-center gap-[9px] rounded-full border border-black/14 bg-white px-[17px] py-[11px]">
            <i className="size-1.5 rounded-full bg-black/30" />
            AIPOCH library
          </span>
        </HomeReveal>
        <HomeReveal delay={0.09} className="mt-[22px] grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              'ready',
              'Production Ready',
              'w-full',
              'bg-[#1a6b3c]',
              'bg-[#e6f4ed] border-[#b8dfc9] text-[#1a6b3c]',
              Check
            ],
            [
              'limited',
              'Limited Release',
              'w-[70%]',
              'bg-[#92400e]',
              'bg-[#fef3c7] border-[#f6d860] text-[#92400e]',
              CircleAlert
            ],
            [
              'beta',
              'Beta Only',
              'w-[45%]',
              'bg-[#374151]',
              'bg-[#f3f4f6] border-[#d1d5db] text-[#374151]',
              Clock3
            ],
            [
              'reject',
              'Reject',
              'w-[18%]',
              'bg-[#991b1b]',
              'bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]',
              X
            ]
          ].map(([id, label, widthClass, color, palette, Icon]) => (
            <article
              data-testid={`audit-disposition-${id}`}
              className={`rounded-[16px] border px-5 py-[22px] transition hover:-translate-y-[3px] ${String(palette)}`}
              key={String(label)}
            >
              <div className="mb-3.5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.1em] opacity-70">
                disposition <Icon className="size-[18px]" />
              </div>
              <h3 className="text-base font-extrabold tracking-[-0.02em]">{String(label)}</h3>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/[.08]">
                <i className={`block h-full rounded-full ${String(color)} ${String(widthClass)}`} />
              </div>
            </article>
          ))}
        </HomeReveal>
        <HomeReveal delay={0.09} className="mt-[22px] grid gap-3 lg:grid-cols-3">
          {(
            [
              {
                key: 'score',
                title: 'Quality score',
                text: 'Assigned alongside the release disposition for every audited skill.',
                iconClass: 'border border-[#b8dfc9] bg-[#e6f4ed] text-[#1a6b3c]',
                letter: 'A' as string | null,
                Icon: null as typeof Flag | null
              },
              {
                key: 'flag',
                title: 'High-risk failure flag',
                text: 'Raised when a skill breaches scientific integrity or safety boundaries.',
                iconClass: 'border border-[#fca5a5] bg-[#fee2e2] text-[#991b1b]',
                letter: null,
                Icon: Flag
              },
              {
                key: 'shield',
                title: 'Cleared before install',
                text: 'What you install is what has already passed review.',
                iconClass: 'border border-black/14 bg-[#e8e8e8] text-[#111]',
                letter: null,
                Icon: Shield
              }
            ] as const
          ).map((card) => (
            <article
              className="flex items-center gap-3.5 rounded-[16px] border border-black/14 bg-white p-[18px]"
              key={card.key}
            >
              <span
                className={`flex size-[50px] shrink-0 items-center justify-center rounded-[13px] text-[15px] font-extrabold ${card.iconClass}`}
              >
                {card.letter ? card.letter : card.Icon ? <card.Icon className="size-5" /> : null}
              </span>
              <div>
                <b className="block text-[13px] font-bold">{card.title}</b>
                <p className="mt-[3px] text-[11.5px] leading-[1.45] text-[#555]">{card.text}</p>
              </div>
            </article>
          ))}
        </HomeReveal>
        <HomeReveal className="mt-8">
          <HomeCtaLink href="/medskillaudit" fill="black" className={homeCtaClasses.black.onLight}>
            <span>Explore MedSkillAudit</span>
            <ArrowRight className="size-4" />
          </HomeCtaLink>
        </HomeReveal>
      </div>
  </section>
)
