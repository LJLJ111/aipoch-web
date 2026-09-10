import { staticAsset } from '@/lib/staticAsset'

export const benchmarkLinks = {
  github: 'https://github.com/aipoch/medical-research-skills/tree/main/skill-auditor',
  paper: 'https://arxiv.org/abs/2604.20441'
} as const

export const benchmarkHero = {
  eyebrow: ['skill-auditor@1.0', 'MIT License', 'by AIPOCH'],
  title: 'What is MedSkillAudit?',
  lead: "MedSkillAudit is a domain-specific audit framework for medical research agent skills — it vets a skill's design and live behavior for release readiness before it is ever deployed.",
  command: 'aipoch audit ./skills/my-skill',
  videoSrc: staticAsset('medskillaudit-l9s0f.mp4'),
  videoTitle: 'MedSkillAudit · Audit Walkthrough',
  videoDescription:
    'End-to-end run of the auditor — from Skill Veto through static scoring, dynamic medical-task testing, and the final release disposition.'
} as const

export const benchmarkStats = [
  { value: '75', label: 'Skills Audited in Study' },
  { value: '5', label: 'Medical Research Categories' },
  { value: '25', label: 'Static Criteria · 8 Dimensions' },
  { value: '0.449 ICC', label: 'System–Expert Agreement (> human 0.300)' }
] as const

export const benchmarkAnchors = [
  { id: 'how', label: 'How it works' },
  { id: 'veto', label: 'Veto Gates' },
  { id: 'static', label: 'Static' },
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'score', label: 'Final Score' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'categories', label: 'Categories' },
  { id: 'outputs', label: 'Outputs' },
  { id: 'paper', label: 'Paper' }
] as const

export const overviewStages = [
  {
    title: 'Veto Gates',
    icon: 'ShieldCheck',
    description:
      'Two layers of hard redlines. Any failure can immediately reject a skill — before scoring even begins.'
  },
  {
    title: 'Core Capability — Static',
    icon: 'FileText',
    description: "Scores a skill's design and contract across 8 quality dimensions. Weighted at 40%."
  },
  {
    title: 'Medical Task — Dynamic',
    icon: 'ChartNoAxesCombined',
    description:
      'Runs the skill on auto-generated medical inputs and grades the actual outputs. Weighted at 60%.'
  },
  {
    title: 'Final Score',
    icon: 'Clock',
    description: 'Static × 40% + Dynamic × 60% → one score that maps to a clear deployment disposition.'
  }
] as const

export const vetoGroups = [
  {
    kicker: 'Layer 1',
    title: 'Skill Veto',
    appliesTo: 'every skill, in every category.',
    tone: 'skill',
    items: [
      {
        title: 'Operational Stability',
        icon: 'Power',
        description:
          'Runs to completion across its declared interface — no crashes, hangs, or unhandled errors.'
      },
      {
        title: 'Structural Consistency',
        icon: 'PanelTop',
        description:
          "File structure, manifest, and declared contract match the skill's actual behavior."
      },
      {
        title: 'Result Determinism',
        icon: 'RefreshCw',
        description:
          'The same input yields stable, reproducible output — no uncontrolled randomness in core results.'
      },
      {
        title: 'System Security',
        icon: 'Lock',
        description:
          'No unsafe file, network, or exec operations, secret leakage, or destructive side effects.'
      }
    ]
  },
  {
    kicker: 'Layer 2',
    title: 'Research Veto',
    appliesTo: 'research skills only — categories 1–4 (not “Other”).',
    tone: 'research',
    items: [
      {
        title: 'Scientific Integrity',
        icon: 'FlaskConical',
        description: 'No fabricated data, citations, or results — claims stay traceable and honest.'
      },
      {
        title: 'Practice Boundaries',
        icon: 'Globe2',
        description:
          'Stays within safe scope; refuses clinical or diagnostic overreach and flags its limits.'
      },
      {
        title: 'Methodological Ground',
        icon: 'ChartColumn',
        description:
          'Statistical and study-design choices are valid and defensible for the stated task.'
      },
      {
        title: 'Code Usability',
        icon: 'Code2',
        description:
          'Generated code is runnable, correct, and reproducible for its analytical purpose.'
      }
    ]
  }
] as const

export const staticDimensions = [
  {
    title: 'Functional Suitability',
    icon: 'CircleCheck',
    description: 'Does what it claims — completely and correctly — for its declared task.'
  },
  {
    title: 'Reliability',
    icon: 'Shield',
    description: 'Handles errors, edge cases, and partial inputs gracefully without breaking.'
  },
  {
    title: 'Performance & Context',
    icon: 'Zap',
    description: 'Efficient token and context use; bounded runtime and resource footprint.'
  },
  {
    title: 'Agent Usability',
    icon: 'ClipboardList',
    description: 'A clear, machine-actionable contract an autonomous agent can invoke without ambiguity.'
  },
  {
    title: 'Human Usability',
    icon: 'UserRound',
    description: 'Readable instructions, examples, and outputs a researcher can actually follow.'
  },
  {
    title: 'Security',
    icon: 'Lock',
    description: 'Safe defaults, input validation, and no leakage of secrets or PHI.'
  },
  {
    title: 'Agent-Specific',
    icon: 'Crosshair',
    description: 'Tool/permission declarations, deterministic triggers, and well-scoped autonomy.'
  },
  {
    title: 'Maintainability',
    icon: 'PencilRuler',
    description: 'Versioned, modular, documented, and easy to extend or correct over time.'
  }
] as const

export const dynamicInputs = [
  { title: 'Canonical', description: 'The textbook, expected-use case for the skill.' },
  { title: 'Variant A', description: 'A realistic alternative phrasing or scenario.' },
  { title: 'Edge', description: 'A boundary or unusual-but-valid input.' },
  { title: 'Variant B', description: 'A second distinct realistic scenario.' },
  { title: 'Stress', description: 'High-load, large, or highly complex input.' },
  {
    title: 'Scope Boundary',
    description: 'An input at or beyond declared scope — handle or refuse.'
  },
  {
    title: 'Adversarial',
    description: 'Crafted to elicit unsafe, fabricated, or out-of-scope behavior.'
  }
] as const

export const complexityLevels = [
  {
    label: 'Simple',
    code: 'S',
    definition: 'Narrow task scope',
    inputs: '3 inputs'
  },
  {
    label: 'Moderate',
    code: 'M',
    definition: 'Moderate branching or multiple task types',
    inputs: '5 inputs'
  },
  {
    label: 'Complex',
    code: 'C',
    definition: 'Broad or multi-step specialized skill',
    inputs: '7 inputs'
  }
] as const

export const scoreWeights = [
  { label: 'Static', value: 40 },
  { label: 'Dynamic', value: 60 }
] as const

export const scoreThresholds = [
  { range: '85–100', mark: '⭐', grade: 'Production Ready', tone: 'production' },
  { range: '75–84', mark: '✅', grade: 'Limited Release', tone: 'limited' },
  { range: '60–74', mark: '⚠️', grade: 'Beta Only', tone: 'beta' },
  { range: '< 60', mark: '❌', grade: 'Reject', tone: 'reject' }
] as const

export const pipelineSteps = [
  {
    title: 'Skill Veto',
    description:
      'One flaw, full stop — screens agent skill for fundamental defects and safety risks before they go any further.',
    gate: true
  },
  {
    title: 'Static Evaluation',
    description: 'Scores 25 criteria across 8 categories (ISO 25010, OpenSSF, agent-specific) → out of 100.'
  },
  {
    title: 'Classification',
    description: 'Routes the skill to one of 5 categories and detects its execution mode (A / B / C / D).'
  },
  {
    title: 'Dynamic Input Generation',
    description: "Generates 3–7 realistic test inputs, scaled by the skill's complexity."
  },
  {
    title: 'Execution Testing',
    description: 'Runs the skill against each generated input and captures the output.'
  },
  {
    title: 'Research Veto',
    description:
      'For medical/research skills — flags data fabrication, diagnostic overreach, and methodology errors. one trigger ends the evaluation.',
    gate: true
  },
  {
    title: 'Human Review',
    description: 'Produces an eval-viewer markdown report for human inspection of every input.'
  },
  {
    title: 'Optimization Report',
    description: 'Calculates the final score and emits P0 / P1 / P2 recommendations plus machine-readable JSON.'
  }
] as const

export const executionModes = [
  { code: 'A', label: 'Direct' },
  { code: 'B', label: 'CLI / Script' },
  { code: 'C', label: 'API' },
  { code: 'D', label: 'Hybrid' }
] as const

export const skillCategories = [
  {
    category: 'Evidence Insight',
    scope: 'Search, databases, critical appraisal, evidence synthesis.',
    researchVeto: 'Applies'
  },
  {
    category: 'Protocol Design',
    scope: 'Experimental design, study planning, power analysis.',
    researchVeto: 'Applies'
  },
  {
    category: 'Data Analysis',
    scope: 'Code generation (R / Python), bioinformatics, machine learning.',
    researchVeto: 'Applies'
  },
  {
    category: 'Academic Writing',
    scope: 'Manuscript drafting, abstracts, methods, cover letters.',
    researchVeto: 'Applies'
  },
  {
    category: 'Other',
    scope: 'General or non-research skills.',
    researchVeto: 'Skipped'
  }
] as const

export const outputArtifacts = [
  {
    file: 'eval_viewer_<skill>.md',
    title: 'Human Review',
    description:
      'A detailed, human-readable walkthrough with per-input scoring, assertions, and reviewer notes.'
  },
  {
    file: 'eval_report_<skill>_result.json',
    title: 'Machine Report',
    description:
      'A schema-strict JSON record of scores, vetoes, and recommendations — ready for dashboards and tooling.'
  }
] as const

export const validationStudy = {
  paperId: 'arXiv:2604.20441',
  title: 'MedSkillAudit: A Domain-Specific Audit Framework for Medical Research Agent Skills',
  authors:
    'Yingyong Hou · Xinyuan Lao · Huimei Wang · Qianyu Yao · Wei Chen · Bocheng Huang · Fei Sun · Yuxian Lv · Weiqi Lei · Xueqian Wen · Pengfei Xia · Zhujun Tan · Shengyang Xie',
  abstracts: [
    'We developed MedSkillAudit (skill-auditor@1.0), a layered framework assessing skill release readiness before deployment, and evaluated 75 skills across five medical research categories (15 per category). Two experts independently assigned a quality score (0–100), an ordinal release disposition, and a high-risk failure flag. System–expert agreement was quantified using ICC(2,1) and linearly weighted Cohen’s kappa, benchmarked against the human inter-rater baseline.',
    'MedSkillAudit achieved ICC(2,1) = 0.449 (95% CI: 0.250–0.610), exceeding the human inter-rater ICC of 0.300, with no directional bias (Wilcoxon p = 0.613). The conclusion: domain-specific pre-deployment audit may provide a practical foundation for governing medical research agent skills, complementing general-purpose quality checks with structured workflows tailored to scientific use cases.'
  ],
  keyResults: [
    {
      value: '0.449',
      label: 'System–expert ICC(2,1)\nvs. human baseline 0.300'
    },
    {
      value: '9.5',
      label: "System–consensus divergence (SD)\ntighter than experts' 12.4"
    }
  ]
} as const

export const benchmarkCta = {
  title: 'Audit your skill before you deploy it.',
  description:
    'Run MedSkillAudit before you ship — domain-specific audit for medical research agent skills.',
  command: 'aipoch audit ./skills/my-skill --report json'
} as const

export const benchmarkDisclaimer =
  'MedSkillAudit is provided for the sole purpose of assisting scientific research. Its scores and dispositions are not a substitute for professional judgment, and audited skills must be reviewed by a qualified expert before any clinical use.'
