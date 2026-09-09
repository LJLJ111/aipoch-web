'use client'

import { ArrowRight, Check, Copy } from 'lucide-react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { homeCtaClasses } from '../home-cta'
import { HomeCtaLink } from '../home-cta-button'
import { agentNames } from '../home-data'
import { HomeReveal } from '../home-motion'

const INSTALL_COMMAND =
  'Read https://aipoch.com/skill.md and follow the instructions to join Aipoch'

const primaryAgents = agentNames.slice(0, -1)
const compatibleAgentLabel = agentNames[agentNames.length - 1]

const SkillsCountUp = ({ skillsCount }: { skillsCount: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { amount: 0.5, once: true })
  // SSR shows the final count; animate only after the block enters view.
  const [count, setCount] = useState(skillsCount)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || reduce || startedRef.current) return
    startedRef.current = true

    setCount(0)
    const controls = animate(0, skillsCount, {
      duration: 1.1,
      // HTML prototype easeOutCubic: 1 - (1 - p)^3
      ease: (progress) => 1 - (1 - progress) ** 3,
      onUpdate: (value) => setCount(Math.round(value))
    })
    return () => controls.stop()
  }, [inView, reduce, skillsCount])

  return (
    <div
      ref={ref}
      data-testid="skills-count"
      aria-hidden="true"
      className="text-[clamp(80px,15vw,190px)] font-extrabold leading-[.8] tracking-[-0.06em]"
    >
      {count}
      <sup className="align-top text-[.34em] font-bold text-[#caa93a]">+</sup>
    </div>
  )
}

export const SkillsInteractive = ({
  children,
  skillsCount
}: {
  children: React.ReactNode
  skillsCount: number
}) => {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setCopyFailed(false)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
      setCopyFailed(true)
      window.setTimeout(() => setCopyFailed(false), 2000)
    }
  }

  return (
    <div>
      <HomeReveal className="grid items-end gap-[clamp(24px,5vw,80px)] lg:grid-cols-[auto_1fr]">
        <SkillsCountUp skillsCount={skillsCount} />
        <div>
          <h2 className="text-[clamp(24px,3.4vw,40px)] font-extrabold leading-none tracking-[-0.035em]">
            <span className="sr-only">{skillsCount}+ </span>
            medical research <br />
            agent skills
          </h2>
          <p className="mt-4 max-w-[62ch] text-[clamp(15px,1.5vw,18px)] leading-[1.7] text-[#555]">
            AIPOCH maintains a curated, open library of{' '}
            <b className="font-semibold text-[#111]">
              {skillsCount}+ reusable medical research skills
            </b>{' '}
            you can call the moment you need them — spanning the four areas most research turns
            actually pass through.
          </p>
        </div>
      </HomeReveal>
      {children}
      <HomeReveal
        delay={0.09}
        className="mt-[clamp(40px,6vw,64px)] grid gap-[clamp(28px,4vw,48px)] lg:grid-cols-2 lg:items-start"
      >
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#8f8f8f] uppercase">
            Works with the agents you already use
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {primaryAgents.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-3.5 py-2 font-mono text-[11px] font-medium text-[#111]"
              >
                <i className="size-1.5 shrink-0 rounded-full bg-[#5aa082]" aria-hidden />
                {name}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-dashed border-black/25 bg-white/60 px-3.5 py-2 font-mono text-[11px] text-[#555]">
              {compatibleAgentLabel}
            </span>
          </div>
          <HomeCtaLink
            href="/agent-skills/list"
            fill="yellow"
            className={`${homeCtaClasses.yellow.fill} mt-6`}
          >
            <span>Browse the Skills Library</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </HomeCtaLink>
        </div>
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#8f8f8f] uppercase">
            Add the full library to your agent · one command
          </p>
          <div
            data-testid="skills-install-terminal"
            className="mt-4 overflow-hidden rounded-[14px] border border-black/14 bg-[#141519] shadow-[0_24px_60px_rgba(0,0,0,.12)]"
          >
            <div className="flex items-center gap-1.5 border-b border-white/[.08] px-3.5 py-2.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
              <span className="ml-auto font-mono text-[10px] text-[#5f6470]">
                agent · paste to install
              </span>
            </div>
            <div className="px-4 py-5 font-mono text-[12.5px] leading-[1.65] text-[#e7e9ee]">
              <span className="text-[#ecd44c]">&gt; </span>
              {INSTALL_COMMAND}
            </div>
            <div className="flex flex-wrap items-center justify-start gap-3 border-t border-white/[.08] px-3.5 py-2.5">
              <button
                type="button"
                onClick={copyCommand}
                className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#c3c7d0] uppercase transition hover:text-white"
              >
                {copied ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <span className="font-mono text-[10px] text-[#5f6470]">SKILL.md · called with /</span>
            </div>
          </div>
          {copyFailed ? (
            <p className="mt-2 text-xs text-red-600">Copy failed — select and copy manually.</p>
          ) : null}
        </div>
      </HomeReveal>
    </div>
  )
}
