/** Shared Tailwind fragments for the marketing homepage. */

export const homeMainShell =
  'min-w-0 overflow-x-clip bg-[#e8e8e8] text-[#111] [background-image:linear-gradient(rgba(0,0,0,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.025)_1px,transparent_1px)] [background-size:56px_56px] [&_a]:cursor-pointer [&_button:not(:disabled)]:cursor-pointer [&_[role=button]]:cursor-pointer [&_[role=tab]]:cursor-pointer [&_button[aria-label="Close platforms menu"]]:cursor-default' as const


export const homeContainer =
  'mx-auto w-full max-w-[1320px] px-4 sm:px-[clamp(16px,4vw,40px)]' as const

export const homeSection = 'border-b border-black/10 py-[clamp(36px,6vh,64px)]' as const

export const homeOpenScienceBand =
  'border-b border-white/10 bg-[#141519] py-[clamp(36px,6vh,64px)] text-white' as const

export const previewPanelShell =
  'flex h-[460px] min-h-[460px] min-w-0 flex-col overflow-hidden rounded-[16px] border border-white/[.12] bg-[#0f1013]' as const

export const previewPanelBar =
  'flex shrink-0 items-center gap-2 border-b border-white/[.08] px-3.5 py-[11px] font-mono text-[10px] uppercase tracking-[0.1em] text-[#7d828d]' as const

export const previewSessionLive = 'ml-auto inline-flex items-center gap-1.5 text-[#5aa082]' as const

export const previewPulseDot = 'size-1.5 rounded-full bg-[#5aa082]' as const

export const previewTabBase =
  'shrink-0 border-b-2 px-[13px] py-2.5 font-mono text-[10.5px] tracking-[0.04em]' as const

export const previewTabActive = 'border-[#ecd44c] text-white' as const

export const previewTabIdle = 'border-transparent text-[#7d828d] hover:text-[#c3c7d0]' as const

export const previewCaption = 'flex items-center gap-2 font-mono text-[10px] text-[#7d828d]' as const

export const previewCaptionDot = 'size-[5px] shrink-0 rounded-full bg-[#ecd44c]' as const

export const previewVmeta =
  'flex flex-wrap gap-3.5 border-t border-dashed border-white/10 pt-2.5 font-mono text-[10px] text-[#5f6470]' as const

export const previewPaneTop = 'flex shrink-0 flex-col gap-2' as const

export const previewPaneSpacer = 'min-h-0 flex-1' as const
