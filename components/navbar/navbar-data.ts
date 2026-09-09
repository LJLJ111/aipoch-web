import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Dna,
  Download,
  FileCheck2,
  LayoutGrid,
  Sparkles,
  Trophy,
  Workflow
} from 'lucide-react'

export type NavBadge = 'Beta' | 'Soon'
export type NavBadgeTone = 'beta' | 'soon' | 'gray'

export type NavChild = {
  label: string
  href?: string
  description: string
  icon: LucideIcon
  disabled?: boolean
  badge?: NavBadge
  badgeTone?: NavBadgeTone
  iconClassName?: string
}

export type NavGroup = {
  type: 'group'
  label: string
  id: string
  children: NavChild[]
}

export type NavLink = {
  type: 'link'
  label: string
  href: string
}

export type NavItem = NavGroup | NavLink

export type NavAction = {
  label: string
  href: string
  emphasis?: boolean
}

export const isExternalNavHref = (href: string) => /^https?:\/\//.test(href)

export const navItems: NavItem[] = [
  { type: 'link', label: 'Open-Science', href: '/open-science' },
  {
    type: 'group',
    label: 'Product',
    id: 'product',
    children: [
      {
        label: 'MedFlow',
        href: '/medflow',
        description: 'Clinical research workflows',
        icon: Workflow,
        badge: 'Soon',
        badgeTone: 'soon',
        iconClassName:
          'border-[rgba(74,138,114,0.28)] bg-[rgba(74,138,114,0.12)] text-[#3f8268] group-hover:bg-[rgba(74,138,114,0.18)] group-hover:text-[#356f59]'
      },
      {
        label: 'Evova',
        description: 'Evidence evaluation platform',
        icon: Sparkles,
        disabled: true,
        badge: 'Soon',
        badgeTone: 'gray',
        iconClassName:
          'border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.12)] text-[#d97706] group-hover:bg-[rgba(217,119,6,0.18)] group-hover:text-[#b8650a]'
      }
    ]
  },
  {
    type: 'group',
    label: 'Agent Skills',
    id: 'agent-skills',
    children: [
      {
        label: 'Install',
        href: '/agent-skills',
        description: 'Install & run skills locally',
        icon: Download
      },
      {
        label: 'Skills Hub',
        href: '/agent-skills/list',
        description: 'Browse every medical skill',
        icon: LayoutGrid
      },
      {
        label: 'Leaderboard',
        href: '/leaderboard',
        description: 'Skill performance rankings',
        icon: Trophy
      },
      {
        label: 'Guides',
        href: '/guides',
        description: 'Tutorials & deployment docs',
        icon: BookOpen
      }
    ]
  },
  {
    type: 'group',
    label: 'Benchmark',
    id: 'benchmark',
    children: [
      {
        label: 'MedSkillAudit',
        href: '/medskillaudit',
        description: 'Audit & score skill quality',
        icon: FileCheck2
      },
      {
        label: 'MedFlow',
        description: 'Workflow benchmark suite',
        icon: Dna,
        disabled: true,
        badge: 'Soon',
        badgeTone: 'gray'
      }
    ]
  },
  { type: 'link', label: 'Blog', href: '/blog' }
  // Community route code is retained, but the public entry is hidden while the page returns 404.
  // { type: 'link', label: 'Community', href: '/community' }
]

export const navActions: NavAction[] = [
  { label: 'Docs', href: 'https://aipoch.com/docs/' },
  {
    label: 'Download',
    href: '/open-science/download',
    emphasis: true
  }
]

export const badgeClassNames: Record<NavBadgeTone, string> = {
  beta: 'border-[#b8dfc9] bg-[#e6f4ed] text-[#1a6b3c]',
  soon: 'border-[#e9d553] bg-[#f5ead0] text-[#7a6800]',
  gray: 'border-[#d6d6d6] bg-[#ececec] text-[#6b6b6b]'
}

export const isLinkActive = (pathname: string | null, href: string) => {
  return Boolean(pathname && (pathname === href || pathname.startsWith(`${href}/`)))
}

export const isGroupActive = (pathname: string | null, item: NavGroup) => {
  return item.children.some((child) => Boolean(child.href && isLinkActive(pathname, child.href)))
}

export const getActiveChildHref = (pathname: string | null, children: NavChild[]) => {
  const activeChildren = children.filter(
    (child) => child.href && isLinkActive(pathname, child.href)
  )

  return activeChildren.sort(
    (first, second) => (second.href?.length ?? 0) - (first.href?.length ?? 0)
  )[0]?.href
}

export const getActiveGroupIds = (pathname: string | null) => {
  return navItems
    .filter((item): item is NavGroup => item.type === 'group' && isGroupActive(pathname, item))
    .map((item) => item.id)
}
