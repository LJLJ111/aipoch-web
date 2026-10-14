'use client'

// Static port of the app's SentAnnotationCards (pdf-text / pdf-region) for the
// replay: quote cards clamp to three lines with an expand toggle, area cards
// show the cropped region image, and an activatable card opens the source PDF
// in the preview dialog.

import { FileText, ScanLine } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { MessagePdfAnnotation } from '@/lib/use-case-types'
import { useFilePreview } from './file-preview'

const QUOTE_PREVIEW_LINES = 3

const QuoteCard = ({ annotation }: { annotation: MessagePdfAnnotation }) => {
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  useLayoutEffect(() => {
    const quote = quoteRef.current
    if (!quote) return
    const style = window.getComputedStyle(quote)
    const lineHeight = Number.parseFloat(style.lineHeight)
    const previewHeight = Number.isFinite(lineHeight)
      ? lineHeight * QUOTE_PREVIEW_LINES
      : quote.clientHeight
    setCanExpand(quote.scrollHeight > previewHeight + 1)
    // Cards are keyed by annotation id upstream, so one measurement per mount.
  }, [])

  return (
    <>
      <blockquote
        ref={quoteRef}
        className={`mt-2 whitespace-pre-wrap break-words border-l-2 border-border-300 pl-2 text-[12px] leading-5 text-text-000/90 ${
          expanded ? '' : 'line-clamp-3'
        }`}
      >
        {annotation.content}
      </blockquote>
      {canExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation()
            setExpanded((current) => !current)
          }}
          className="mt-1 block text-[11px] font-medium text-text-300 transition-colors hover:text-text-000"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </>
  )
}

const AreaCard = ({ annotation }: { annotation: MessagePdfAnnotation }) => (
  <div
    className={`mt-2 ${annotation.image ? 'grid grid-cols-[5rem_minmax(0,1fr)] gap-2' : 'block'}`}
  >
    {annotation.image ? (
      // biome-ignore lint/performance/noImgElement: exported region crops render without rewriting.
      <img
        src={`data:${annotation.image.mimeType};base64,${annotation.image.data}`}
        alt=""
        className="h-14 w-20 rounded-md border border-border-200 bg-bg-100 object-cover"
      />
    ) : null}
    <span className="line-clamp-3 self-center whitespace-pre-wrap break-words text-[12px] leading-5 text-text-000/90">
      {annotation.content}
    </span>
  </div>
)

export const MessageAnnotationCards = ({
  annotations
}: {
  annotations: MessagePdfAnnotation[]
}) => {
  const openPreview = useFilePreview()
  return (
    <div className="mb-2 space-y-2">
      {annotations.map((annotation) => (
        <article
          key={annotation.id}
          className="overflow-hidden rounded-lg border border-border-200 bg-bg-000/80"
        >
          <button
            type="button"
            disabled={!annotation.url || !openPreview}
            aria-label="Show annotation source"
            onClick={() =>
              annotation.url &&
              openPreview?.({
                name: annotation.source,
                url: annotation.url,
                mimeType: 'application/pdf'
              })
            }
            className="group w-full p-2 text-left transition-colors hover:bg-bg-100 disabled:cursor-default"
          >
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-bg-200 text-text-100">
                {annotation.kind === 'area' ? (
                  <ScanLine className="size-3.5" aria-hidden="true" />
                ) : (
                  <FileText className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold text-text-000">
                  {annotation.kind === 'area' ? 'PDF area' : 'PDF quote'}
                </span>
                <span className="block truncate text-[11px] text-text-200">
                  {annotation.source}
                </span>
              </span>
            </div>
            {annotation.kind === 'area' ? (
              <AreaCard annotation={annotation} />
            ) : (
              <QuoteCard annotation={annotation} />
            )}
            {annotation.note ? (
              <span className="mt-2 block border-t border-border-200 pt-2 text-[12px] text-text-000">
                {annotation.note}
              </span>
            ) : null}
          </button>
        </article>
      ))}
    </div>
  )
}
