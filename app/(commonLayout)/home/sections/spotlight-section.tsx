import { ArrowRight, BookOpen, Check } from 'lucide-react'
import Link from 'next/link'
import { HomeMedia } from '../home-media'
import { HomeReveal } from '../home-motion'
import type { HomeSpotlightContent } from '../home-spotlight-content'
import type { HomepageLastUpdated } from '../home-structured-data'
import { homeContainer } from '../home-styles'

export const HomeSpotlightSection = ({
  content,
  lastUpdated
}: {
  content: HomeSpotlightContent
  lastUpdated: HomepageLastUpdated
}) => (
  <section
    id="open-science-spotlight"
    className="relative overflow-hidden bg-[#141519] pt-[calc(var(--nav-h)+clamp(28px,4vh,48px))] pb-[clamp(28px,4vh,48px)] text-[#e7e9ee] before:pointer-events-none before:absolute before:-top-[300px] before:-right-[160px] before:h-[720px] before:w-[720px] before:rounded-full before:bg-[radial-gradient(circle,rgba(236,212,76,.16),transparent_70%)] before:blur-[110px] after:pointer-events-none after:absolute after:-bottom-[260px] after:-left-[140px] after:h-[560px] after:w-[560px] after:rounded-full after:bg-[radial-gradient(circle,rgba(74,138,114,.14),transparent_70%)] after:blur-[110px]"
  >
    <div className={`relative z-[1] ${homeContainer}`}>
      <HomeReveal offset={false} className="mx-auto mb-[clamp(15px,2.25vw,26px)] text-center">
        <h2
          data-testid="spotlight-title"
          className="text-[clamp(32px,5vw,60px)] font-extrabold leading-[1.04] tracking-[-0.038em] text-white"
        >
          See What’s New in Open-Science
        </h2>
        <p
          data-homepage-summary
          className="mx-auto mt-2 text-[clamp(14.5px,1.4vw,16.5px)] leading-[1.7] text-[#b7bcc6]"
        >
          Watch the latest release overview to explore new capabilities, workflow improvements, and
          fixes across the Open-Science research workbench.
        </p>
        <time
          data-testid="homepage-last-updated"
          dateTime={lastUpdated.dateTime}
          className="sr-only"
        >
          Last updated {lastUpdated.label}
        </time>

        <Link
          href="https://aipoch.com/docs/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="open-science-wiki-cta"
          className="group relative mt-[clamp(12px,1.6vw,17px)] flex items-center gap-[18px] overflow-hidden rounded-[16px] border border-[#ecd44c]/35 bg-[linear-gradient(100deg,rgba(236,212,76,.14),rgba(236,212,76,.04)_48%,rgba(255,255,255,.02))] p-4 pl-5 text-left transition duration-200 before:pointer-events-none before:absolute before:-top-40 before:-left-[70px] before:h-[460px] before:w-[460px] before:rounded-full before:bg-[radial-gradient(circle,rgba(236,212,76,.2),transparent_70%)] before:blur-[32px] hover:-translate-y-0.5 hover:border-[#ecd44c] hover:shadow-[0_20px_48px_rgba(0,0,0,.4)] max-sm:flex-wrap max-sm:gap-3.5 max-sm:p-4"
        >
          <span className="relative flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-[#ecd44c] text-[#111]">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <span className="relative min-w-0">
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ecd44c]">
              Documentation
            </span>
            <span className="mt-1 block text-[17px] font-extrabold tracking-[-0.025em] text-white">
              Open-Science Wiki
            </span>
            <span className="mt-[5px] block text-[12.5px] leading-[1.55] text-[#b7bcc6]">
              Installation, your first project, the workspace, every settings panel, and
              troubleshooting — kept in step with the current release.
            </span>
          </span>
          <span className="relative ml-auto inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#ecd44c] px-5 py-3 text-[13.5px] font-bold tracking-[-0.01em] text-[#111] transition group-hover:bg-[#f4e56e] max-sm:ml-0 max-sm:w-full max-sm:justify-center">
            Open the Wiki <ArrowRight className="size-[15px]" aria-hidden="true" />
          </span>
        </Link>
      </HomeReveal>

      <HomeReveal offset={false} delay={0.09} className="min-w-0">
        <div data-testid="spotlight-media-full-width">
          <HomeMedia media={content.media} />
        </div>
      </HomeReveal>

      {/* Equal-height cards: fixed 340px like design target */}
      <HomeReveal
        offset={false}
        delay={0.09}
        className="mt-[clamp(11px,1.5vw,17px)] grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 lg:grid-cols-3"
      >
        <article className="flex h-[340px] flex-col rounded-[16px] border border-[#ecd44c]/[.28] bg-[#ecd44c]/[.06] px-5 py-[22px] transition hover:-translate-y-[3px] hover:border-[#ecd44c]/50">
          <div className="mb-3.5 flex shrink-0 justify-between gap-2.5">
            <h2 className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#ecd44c]">
              Latest release
            </h2>
            {content.latestRelease.updateDate ? (
              <span className="font-mono text-[10px] whitespace-nowrap text-[#6e737d]">
                {content.latestRelease.updateDate}
              </span>
            ) : null}
          </div>
          {content.latestRelease.title ? (
            <div className="shrink-0 text-[22px] font-extrabold tracking-[-0.02em] text-white">
              {content.latestRelease.title}
            </div>
          ) : null}
          <div className="mt-2 -mr-5 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1.5 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35">
            {content.latestRelease.description ? (
              <p className="shrink-0 pr-3 text-[12.5px] leading-[1.6] text-[#a9aeb8]">
                {content.latestRelease.description}
              </p>
            ) : null}
            <ul className="mt-3.5 flex flex-col gap-[9px] text-xs leading-[1.5] text-[#b7bcc6]">
              {content.latestRelease.features.map(([title, text], index) => (
                <li className="flex gap-[9px] pr-3" key={`feature-${index}`}>
                  <i className="mt-1.5 size-[5px] shrink-0 rounded-full bg-[#ecd44c]" />
                  <span className="min-w-0 break-words">
                    <b className="font-semibold text-white">{title}</b> — {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="https://github.com/aipoch/open-science/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex shrink-0 items-center gap-[7px] border-t border-white/[.08] pt-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8b909b] transition hover:text-[#ecd44c]"
          >
            Full changelog <ArrowRight className="size-[13px]" />
          </Link>
        </article>
        <article
          data-testid="spotlight-read-watch"
          className="flex h-[340px] flex-col rounded-[16px] border border-white/[.12] bg-white/[.03] px-5 py-[22px] transition hover:-translate-y-[3px] hover:border-white/25"
        >
          <h2 className="mb-3.5 shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8b909b]">
            Read &amp; watch
          </h2>
          <div
            className="-mr-5 flex min-h-0 flex-1 flex-col divide-y divide-white/[.07] overflow-y-auto pr-1.5 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35"
            data-testid="spotlight-read-watch-list"
          >
            {content.readWatch.map((post) => (
              <Link
                href={post.url}
                key={post.url}
                className="block py-[11px] pr-3 transition hover:pl-[5px] first:pt-0 last:pb-0"
              >
                <b className="block text-[12.8px] font-semibold leading-[1.45] text-[#b7bcc6] transition hover:text-[#ecd44c]">
                  {post.title}
                </b>
                <span className="mt-[5px] flex justify-between gap-3 font-mono text-[10px] tracking-[0.02em] text-[#6e737d]">
                  <span className="min-w-0 truncate">{post.meta}</span>
                  <span className="shrink-0 whitespace-nowrap">{post.date}</span>
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-4 inline-flex shrink-0 items-center gap-[7px] border-t border-white/[.08] pt-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8b909b] transition hover:text-[#ecd44c]"
          >
            All posts <ArrowRight className="size-[13px]" />
          </Link>
        </article>
        <article className="flex h-[340px] flex-col rounded-[16px] border border-white/[.12] bg-white/[.03] px-5 py-[22px] transition hover:-translate-y-[3px] hover:border-white/25 md:col-span-2 lg:col-span-1">
          <h2 className="mb-3.5 shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8b909b]">
            What it does
          </h2>
          <ul className="-mr-5 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1.5 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35">
            {content.whatItDoes.map(([title, text], index) => (
              <li
                className="flex gap-2.5 pr-3 text-[12.3px] leading-[1.5] text-[#b7bcc6]"
                key={`what-it-does-${index}`}
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-[#7fb89e]" />
                <span className="min-w-0 break-words">
                  <b className="font-semibold text-white">{title}</b> — {text}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="https://github.com/aipoch/open-science#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex shrink-0 items-center gap-[7px] border-t border-white/[.08] pt-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8b909b] transition hover:text-[#ecd44c]"
          >
            Documentation <ArrowRight className="size-[13px]" />
          </Link>
        </article>
      </HomeReveal>
    </div>
  </section>
)
