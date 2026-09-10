/**
 * Homepage Spotlight fixtures for Playwright (SSR).
 * Enabled when the Next server runs with E2E_HOMEPAGE_MOCK=1.
 */

import type { HomepagePublicConfig, HomepageReadWatchResponse } from '@/service/homepage'

export const homepageOpenScienceConfigFixture: HomepagePublicConfig = {
  release_version: 'v0.16.0',
  latest_release_update: 'Aug 16, 2026',
  latest_release_title: 'v0.16.0',
  latest_release_desc:
    'Adds a token usage dashboard, composer message queue, branching from completed agent messages, view-in-context artifact navigation, and CLI plan controls.',
  latest_release_features: [
    {
      title: 'Token usage dashboard',
      text: 'Summarizes tokens, sessions, projects, runs, and artifacts across Today, This week, Last 30 days, and All time with a 30-day'
    },
    {
      title: 'Composer message queue',
      text: 'Stages follow-up messages while a conversation runs, with edit, delete, reorder, and send-now controls.'
    },
    {
      title: 'Branch from agent messages',
      text: 'Starts a new idle session from any completed agent message while preserving conversation context.'
    }
  ],
  media: [
    {
      title: 'Product tour',
      url: 'https://statics.aipoch.com/public/operations/releases/0-16-0/OpenScienceUpdate0_16_0.mp4'
    },
    {
      title: 'Workflow demo',
      url: 'https://statics.aipoch.com/public/operations/releases/0-16-0/OpenScienceUpdate0_16_0.mp4?spotlight=workflow'
    },
    {
      title: 'Workspace',
      url: 'https://statics.aipoch.com/public/f/image/figma-5fcb02c8.webp'
    },
    {
      title: 'Projects',
      url: 'https://statics.aipoch.com/public/f/image/Project-f176542f.webp'
    },
    {
      title: 'Report',
      url: 'https://statics.aipoch.com/public/f/image/paper-fb87a969.webp'
    },
    {
      title: 'Artifacts',
      url: 'https://statics.aipoch.com/public/f/image/file-b2436cc8.webp'
    }
  ],
  what_it_does: [
    { title: 'Execution, not suggestions', text: 'runs commands, Python and R with your approval' },
    {
      title: 'Traceable artifacts',
      text: 'immutable versions with the evidence that produced them'
    },
    { title: 'Any model', text: 'built-in providers, custom gateways, or your own subscription' },
    { title: 'Local-first', text: 'project state stays on your computer' }
  ]
}

export const homepageReadWatchFixture: HomepageReadWatchResponse = {
  items: [
    {
      title: 'Release notes and changelog',
      category: 'Product',
      published_at: '2026-08-04T00:00:00.000Z',
      slug: 'release-notes'
    },
    {
      title: 'Guides — what is an agent skill',
      category: 'Guides',
      published_at: '2026-07-22T00:00:00.000Z',
      slug: 'what-is-a-skill'
    }
  ]
}

export const homepageSkillsCountFixture = 550

/** Resolve fixture payload for a homepage API path, or null if unmatched. */
export function resolveHomepageE2EFixture(path: string): unknown | null {
  const normalized = path.split('?')[0]?.replace(/\/$/, '') ?? ''
  if (normalized.endsWith('/v1/skills/total_count')) {
    return {
      total_skills: homepageSkillsCountFixture,
      total_authors: 3
    }
  }
  if (normalized.endsWith('/read-watch')) return homepageReadWatchFixture
  if (/\/v1\/homepage\/[^/]+$/.test(normalized)) return homepageOpenScienceConfigFixture
  return null
}
