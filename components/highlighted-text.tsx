import { cn } from '@/lib/utils'

interface HighlightedTextProps {
  /** Text content to display. */
  content: string
  /** Keywords to highlight. */
  keywords: string[]
  /** CSS class for highlighted text; defaults to the primary background color. */
  highlightClassName?: string
  /** CSS class for the container element. */
  className?: string
}

/**
 * Text highlighting component.
 * Match and highlight the supplied keywords exactly within the content.
 *
 * @example
 * <HighlightedText
 *   content="Literature Review"
 *   keywords={['Review']}
 *   highlightClassName="bg-primary"
 * />
 *
 * @example
 * <HighlightedText
 *   content="Systematic Review and Meta Analysis"
 *   keywords={['Review', 'Analysis']}
 * />
 */
export function HighlightedText({
  content,
  keywords,
  highlightClassName = 'bg-primary',
  className
}: HighlightedTextProps) {
  // Return the original text when no keywords are provided.
  if (!keywords.length) {
    return <span className={className}>{content}</span>
  }

  // Build a regular expression that matches all keywords.
  // Escape special regular expression characters in each keyword.
  const escapedKeywords = keywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  // Sort by descending length to match longer keywords first and avoid partial matches.
  escapedKeywords.sort((a, b) => b.length - a.length)

  // Match any keyword in a capture group so splitting preserves the matched text.
  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'g')

  // Split the text.
  const parts = content.split(pattern)

  // Use a Set for fast membership checks.
  const keywordSet = new Set(keywords)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = keywordSet.has(part)

        if (isMatch) {
          return (
            <span key={index} className={cn(highlightClassName)}>
              {part}
            </span>
          )
        }

        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
