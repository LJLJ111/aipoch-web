'use client'

import { Globe, Paperclip, SlidersHorizontal } from 'lucide-react'
import { ScienceImportButton, ScienceImportFeedback } from './science-import-controls'

const tools = [
  { icon: Paperclip, label: 'Attach files in Open-Science' },
  { icon: Globe, label: 'Research tools in Open-Science' },
  { icon: SlidersHorizontal, label: 'Configure your research in Open-Science' }
]

/** The replay frame owns the transfer shared with its toolbar. */
export const ImportComposer = () => (
  <section
    aria-label="Import to Open-Science"
    className="mx-auto w-full max-w-4xl px-4 pb-8 pt-[26px] md:px-6 md:pb-12"
  >
    <div className="rounded-2xl border border-[#d8d9d2] bg-white px-4 py-3 shadow-[0_4px_24px_-12px_rgba(16,17,15,0.16)] sm:px-5">
      <textarea
        aria-label="Continue this research in the desktop app"
        placeholder="What would you explore next? Import this session to continue in Open-Science."
        disabled
        rows={3}
        className="block min-h-28 w-full resize-none border-0 bg-transparent text-[15px] leading-7 text-[#777872] placeholder:text-[#777872] disabled:cursor-default disabled:opacity-100 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-1">
          {tools.map(({ icon: Icon, label: toolLabel }) => (
            <button
              key={toolLabel}
              type="button"
              disabled
              aria-label={toolLabel}
              title={toolLabel}
              className="flex size-10 cursor-not-allowed items-center justify-center rounded-lg text-[#b2b3ad]"
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
          ))}
        </div>
        <ScienceImportButton />
      </div>
    </div>
    <ScienceImportFeedback />
  </section>
)
