import type { ReactNode } from 'react'
import { GuidesDirectory } from '@/components/guides-directory'
import { getAllGuides } from '@/lib/guides'

const GuidesLayout = async ({ children }: { children: ReactNode }) => {
  const guides = await getAllGuides()

  return (
    <div className="flex-1">
      {/* Left MODULES navigation, hidden on small screens. */}
      <aside className="hidden xl:block fixed left-6 xl:left-12 top-24 z-30 w-60">
        <GuidesDirectory guides={guides} />
      </aside>
      <div className="w-full">{children}</div>
    </div>
  )
}

export default GuidesLayout
