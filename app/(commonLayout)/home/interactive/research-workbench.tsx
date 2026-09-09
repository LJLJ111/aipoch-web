'use client'

import { useState } from 'react'
import { HomeReveal, MotionPulseDot } from '../home-motion'
import {
  previewCaption,
  previewCaptionDot,
  previewPaneSpacer,
  previewPaneTop,
  previewPanelBar,
  previewPanelShell,
  previewPulseDot,
  previewSessionLive,
  previewTabActive,
  previewTabBase,
  previewTabIdle,
  previewVmeta
} from '../home-styles'
import {
  ViewerPane,
  previewChrome,
  previewLabels,
  previewTabs,
  type PreviewTab
} from './preview-viewer-pane'

export const ResearchWorkbench = () => {
  const [framework, setFramework] = useState('claude')
  const [preview, setPreview] = useState<PreviewTab>('docs')
  const providers: Record<string, string> = {
    claude: 'Claude Subscription',
    opencode: 'Custom Gateway',
    codex: 'Codex Subscription'
  }
  const steps: Array<[PreviewTab, string, string]> = [
    ['docs', 'plan', 'Describe the task in plain language'],
    ['code', 'execute', 'Commands, Python, R, search, connectors'],
    ['data', 'produce', 'Reports, tables, figures, structures'],
    ['img', 'preview', 'Every result opens in place']
  ]

  return (
    <HomeReveal delay={0.09}>
      <div className="mt-[26px] flex flex-wrap items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#7d828d]">
        <span>Any model, no lock-in →</span>
        <div className="flex flex-wrap border border-white/15">
          {[
            ['claude', 'Claude Code'],
            ['opencode', 'OpenCode'],
            ['codex', 'Codex']
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setFramework(id)}
              className={`border-r border-white/15 px-4 py-[9px] text-xs normal-case transition last:border-r-0 ${framework === id ? 'bg-[#ecd44c] text-black' : 'bg-transparent text-[#c3c7d0] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span>
          provider: <b className="text-white/75">{providers[framework]}</b>
        </span>
      </div>
      <div className="mt-[clamp(36px,5vw,56px)] grid items-start gap-[clamp(20px,3vw,36px)] lg:grid-cols-[minmax(300px,340px)_1fr]">
        <div className="min-w-0 lg:max-w-[340px]">
          <div className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-1">
            {steps.map(([id, name, description], index) => (
              <button
                type="button"
                onClick={() => setPreview(id)}
                key={id}
                data-testid={`workbench-step-${id}`}
                className={`rounded-[13px] border px-[18px] py-4 text-left transition ${preview === id ? 'border-[#ecd44c] bg-[#ecd44c] text-[#111]' : 'border-white/10 bg-transparent text-[#c3c7d0] hover:border-white/30'}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">
                  step {String(index + 1).padStart(2, '0')}
                </span>
                <span className="block">
                  <b className="mt-[5px] block font-mono text-[17px] font-semibold">{name}</b>
                  <span className="mt-1 block text-[11.5px] leading-[1.45] opacity-80">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs leading-[1.6] text-[#8b909b]">
            Persistent notebook kernels (Python, R, REPL) and a shared terminal hold state across a
            session. Every action is visible, <b className="text-white">gated by your approval</b>,
            and open to review.
          </p>
        </div>
        <div data-testid="open-science-preview" className={previewPanelShell}>
          <div className={previewPanelBar}>
            <span>preview panel</span>
            <span className={previewSessionLive}>
              <MotionPulseDot className={previewPulseDot} /> session held
            </span>
          </div>
          <div className="flex shrink-0 flex-wrap border-b border-white/[.08]" role="tablist">
            {previewTabs.map((tab) => (
              <button
                role="tab"
                aria-selected={preview === tab}
                type="button"
                onClick={() => setPreview(tab)}
                key={tab}
                className={`${previewTabBase} ${preview === tab ? previewTabActive : previewTabIdle}`}
              >
                {previewLabels[tab]}
              </button>
            ))}
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="flex h-full min-h-0 flex-col p-[18px]">
              <div className={previewPaneTop}>
                <div className={previewCaption}>
                  <i className={previewCaptionDot} />
                  {previewChrome[preview].caption}
                </div>
                <ViewerPane active={preview} />
                <div className={previewVmeta}>
                  {previewChrome[preview].metadata.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div aria-hidden className={previewPaneSpacer} />
            </div>
          </div>
        </div>
      </div>
    </HomeReveal>
  )
}
