import type { ReactNode } from 'react'

type BenchmarkShellProps = {
  children: ReactNode
}

export const BenchmarkShell = ({ children }: BenchmarkShellProps) => (
  <div className="bg-[#E9E9E9] text-[#111111]">
    <div className="border-b border-[#D4D4D4] bg-[linear-gradient(rgba(0,0,0,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.055)_1px,transparent_1px)] bg-[length:72px_72px]">
      {children}
    </div>
  </div>
)
