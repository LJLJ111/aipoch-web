import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { SkillCard } from '../../app/(commonLayout)/agent-skills/list/components/skill-card'
import type { Skill } from '../../service/skills'

const baseSkill: Skill = {
  path: '/skills/demo',
  id: 'skill-1',
  name: 'demo-skill',
  title: 'Demo Skill',
  description: 'Demo description',
  categories: ['Protocol Design'],
  tags: ['tag-a'],
  icon: '',
  author: {
    name: 'AIPOCH',
    avatar_url: '',
    org: 'AIPOCH'
  },
  stats: {
    views: 12,
    downloads: 34
  },
  updated_at: '2026-03-12',
  score: 86.6
}

describe('skill card', () => {
  test('rounds the displayed score badge', () => {
    const html = renderToStaticMarkup(<SkillCard skill={baseSkill} />)

    expect(html).toContain('>87</span>')
    expect(html).not.toContain('>86.6</span>')
  })
})
