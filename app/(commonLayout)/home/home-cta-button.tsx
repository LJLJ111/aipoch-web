'use client'

import { ArrowDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { homeCtaClasses } from './home-cta'
import { ctaMotionVariants, ctaVariantNames, homeEase } from './home-motion'

const hoverInkClass = (fill: 'yellow' | 'black') =>
  fill === 'yellow'
    ? 'hover:[&_svg]:text-[#111] hover:[&_span]:text-[#111]'
    : 'hover:[&>span]:text-white hover:[&_svg]:text-white'

const scrollToPageHash = (hash: string) => {
  const id = hash.replace(/^#/, '')
  if (!id) return
  const target = document.getElementById(id)
  if (!target) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  window.history.pushState(null, '', hash)
}

const hashLinkClick =
  (href: string, onClick?: React.MouseEventHandler<HTMLAnchorElement>) =>
  (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    event.preventDefault()
    scrollToPageHash(href)
  }

const CtaMotionShell = ({
  fill,
  className,
  children
}: {
  fill: 'yellow' | 'black'
  className: string
  children: ReactNode
}) => {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={`group relative inline-flex overflow-hidden ${className} ${hoverInkClass(fill)}`}
      initial={ctaVariantNames.rest}
      whileHover={reduce ? undefined : ctaVariantNames.hover}
      variants={ctaMotionVariants.shell}
      transition={{ duration: 0.2, ease: homeEase }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: fill === 'yellow' ? '#ecd44c' : '#111' }}
        variants={
          fill === 'yellow' ? ctaMotionVariants.fillYellow : ctaMotionVariants.fillBlack
        }
        transition={{ duration: 0.3, ease: homeEase }}
      />
      <span className="relative z-[1] inline-flex items-center gap-2.5">{children}</span>
    </motion.span>
  )
}

export const HomeCtaLink = ({
  fill,
  className,
  children,
  href,
  onClick,
  ...props
}: {
  fill: 'yellow' | 'black'
  className: string
  children: ReactNode
} & ComponentProps<typeof Link>) => {
  const hashHref = typeof href === 'string' && href.startsWith('#') ? href : null

  return (
    <Link
      {...props}
      href={href}
      className="inline-flex no-underline"
      onClick={hashHref ? hashLinkClick(hashHref, onClick) : onClick}
    >
      <CtaMotionShell fill={fill} className={className}>
        {children}
      </CtaMotionShell>
    </Link>
  )
}

export const HomeCtaAnchor = ({
  fill,
  className,
  children,
  ...props
}: {
  fill: 'yellow' | 'black'
  className: string
  children: ReactNode
} & ComponentProps<'a'>) => (
  <a {...props} className="inline-flex no-underline">
    <CtaMotionShell fill={fill} className={className}>
      {children}
    </CtaMotionShell>
  </a>
)

export const CtaHeroArrow = () => (
  <span className="inline-flex transition-transform duration-250 group-hover:translate-y-0.5">
    <ArrowDown className="size-4" aria-hidden="true" />
  </span>
)

export const ActionLink = ({
  href,
  children,
  light = false,
  external = false,
  arrow = true
}: {
  href: string
  children: React.ReactNode
  light?: boolean
  external?: boolean
  arrow?: boolean
}) => (
  <HomeCtaLink
    href={href}
    fill="yellow"
    className={homeCtaClasses.yellow.link(light)}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {children}
    {arrow ? <ArrowRight className="size-4 shrink-0" aria-hidden="true" /> : null}
  </HomeCtaLink>
)
