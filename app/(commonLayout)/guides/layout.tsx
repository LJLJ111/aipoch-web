import type { ReactNode } from 'react'

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return <div className="flex-1 bg-[#f6f6f4]">{children}</div>
}
