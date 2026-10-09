import type { ReactNode } from 'react'

export function BenchmarkShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[#f7f7f5] text-[#111]">
      {/* biome-ignore lint/performance/noImgElement: Keep the Figma artwork edge-aligned and scale its original proportions with the viewport. */}
      <img
        src="/figma/audit/75fa7.png"
        alt=""
        width={1672}
        height={941}
        className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
