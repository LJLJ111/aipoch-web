import { cn } from '@/lib/utils'

export function EvaluationStatusIcon({
  pass,
  warning = false,
  compact = false,
  className
}: {
  pass: boolean
  warning?: boolean
  compact?: boolean
  className?: string
}) {
  if (!pass) {
    return (
      <span aria-hidden className={cn(warning ? 'text-[#915600]' : 'text-[#b42318]', className)}>
        {warning ? '⚠' : '✗'}
      </span>
    )
  }
  return (
    // biome-ignore lint/performance/noImgElement: Preserve the exact Figma status SVG and its native size.
    <img
      src={compact ? '/figma/audit/a2941.svg' : '/figma/audit/ab2ec.svg'}
      alt=""
      width={compact ? 10 : 12}
      height={compact ? 10 : 12}
      className={cn('inline-block', className)}
    />
  )
}
