import { describe, expect, test } from 'bun:test'
import {
  benchmarkHero,
  benchmarkLinks,
  benchmarkStats,
  benchmarkCta,
  benchmarkDisclaimer,
  complexityLevels,
  dynamicInputs,
  outputArtifacts,
  overviewStages,
  pipelineSteps,
  scoreWeights,
  scoreThresholds,
  skillCategories,
  staticDimensions,
  vetoGroups,
  validationStudy
} from '../../app/(commonLayout)/medskillaudit/benchmark-data'

describe('benchmark content data', () => {
  test('keeps PRD-mandated benchmark metrics and links', () => {
    expect(benchmarkStats.map((stat) => stat.value)).toEqual(['75', '5', '25', '0.449 ICC'])
    expect(benchmarkLinks.github).toBe(
      'https://github.com/aipoch/medical-research-skills/tree/main/skill-auditor'
    )
    expect(benchmarkLinks.paper).toBe('https://arxiv.org/abs/2604.20441')
    expect('videoPoster' in benchmarkHero).toBe(false)
  })

  test('keeps the required audit framework shape', () => {
    expect(overviewStages).toHaveLength(4)
    expect(vetoGroups).toHaveLength(2)
    expect(staticDimensions).toHaveLength(8)
    expect(dynamicInputs).toHaveLength(7)
    expect(complexityLevels).toHaveLength(3)
    expect(pipelineSteps).toHaveLength(8)
    expect(skillCategories).toHaveLength(5)
    expect(outputArtifacts).toHaveLength(2)
    expect(pipelineSteps.some((step) => /Auto-Improvement/i.test(step.title))).toBe(false)
  })

  test('keeps scoring and validation study facts', () => {
    expect(scoreWeights).toEqual([
      { label: 'Static', value: 40 },
      { label: 'Dynamic', value: 60 }
    ])
    expect(validationStudy.paperId).toBe('arXiv:2604.20441')
    expect(validationStudy.keyResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: '0.449' }),
        expect.objectContaining({ value: '9.5' })
      ])
    )
  })

  test('uses the exact material copy for benchmark narrative text', () => {
    expect(benchmarkHero.lead).toBe(
      "MedSkillAudit is a domain-specific audit framework for medical research agent skills — it vets a skill's design and live behavior for release readiness before it is ever deployed."
    )
    expect(benchmarkHero.videoDescription).toBe(
      'End-to-end run of the auditor — from Skill Veto through static scoring, dynamic medical-task testing, and the final release disposition.'
    )
    expect(overviewStages[0].description).toBe(
      'Two layers of hard redlines. Any failure can immediately reject a skill — before scoring even begins.'
    )
    expect(vetoGroups[0].items[1].description).toBe(
      "File structure, manifest, and declared contract match the skill's actual behavior."
    )
    expect(dynamicInputs[5].description).toBe(
      'An input at or beyond declared scope — handle or refuse.'
    )
    expect(scoreThresholds.map((threshold) => threshold.range)).toEqual([
      '85–100',
      '75–84',
      '60–74',
      '< 60'
    ])
    expect(pipelineSteps[5].description).toBe(
      'For medical/research skills — flags data fabrication, diagnostic overreach, and methodology errors. one trigger ends the evaluation.'
    )
    expect(skillCategories[2].scope).toBe(
      'Code generation (R / Python), bioinformatics, machine learning.'
    )
    expect(outputArtifacts[1].description).toBe(
      'A schema-strict JSON record of scores, vetoes, and recommendations — ready for dashboards and tooling.'
    )
    expect(benchmarkCta.title).toBe('Audit your skill before you deploy it.')
    expect(benchmarkCta.description).toBe(
      'Run MedSkillAudit before you ship — domain-specific audit for medical research agent skills.'
    )
    expect(benchmarkCta.command).toBe('aipoch audit ./skills/my-skill --report json')
    expect(benchmarkDisclaimer).toBe(
      'MedSkillAudit is provided for the sole purpose of assisting scientific research. Its scores and dispositions are not a substitute for professional judgment, and audited skills must be reviewed by a qualified expert before any clinical use.'
    )
  })

  test('maps material inline SVGs to stable lucide icon names', () => {
    expect(overviewStages.map((stage) => stage.icon)).toEqual([
      'ShieldCheck',
      'FileText',
      'ChartNoAxesCombined',
      'Clock'
    ])
    expect(vetoGroups.flatMap((group) => group.items.map((item) => item.icon))).toEqual([
      'Power',
      'PanelTop',
      'RefreshCw',
      'Lock',
      'FlaskConical',
      'Globe2',
      'ChartColumn',
      'Code2'
    ])
    expect(staticDimensions.map((dimension) => dimension.icon)).toEqual([
      'CircleCheck',
      'Shield',
      'Zap',
      'ClipboardList',
      'UserRound',
      'Lock',
      'Crosshair',
      'PencilRuler'
    ])
  })
})
