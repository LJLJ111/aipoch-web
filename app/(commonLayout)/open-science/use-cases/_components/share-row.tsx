'use client'

import { Check, Facebook, Linkedin, Link as LinkIcon, Mail } from 'lucide-react'
import { useState } from 'react'
import { XIcon } from '@/components/svg-icons/x-icon'

// Brand marks not covered by lucide (Reddit) or requiring the filled glyph
// (WhatsApp) — compact single-path versions.
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.01 4.74c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25zm-2.65 1.1 2.85.6a.28.28 0 0 1 .22.33l-.02.06a1.25 1.25 0 1 1-.6-.22l-2.6-.55-.8 3.75c1.83.07 3.48.63 4.68 1.49.31-.31.73-.49 1.2-.49.97 0 1.76.79 1.76 1.75 0 .72-.43 1.34-1.01 1.62.03.17.04.34.04.52 0 2.21-2.41 4.02-5.39 4.02s-5.39-1.81-5.39-4.02c0-.17.01-.34.04-.52a1.75 1.75 0 0 1-1.01-1.62c0-.97.79-1.75 1.75-1.75.42 0 .79.15 1.07.39 1.16-.87 2.76-1.4 4.56-1.48l.85-4a.28.28 0 0 1 .34-.22zm-7.83 6.46c.89 0 1.6.67 1.6 1.5s-.71 1.49-1.6 1.49-1.6-.67-1.6-1.49.71-1.5 1.6-1.5zm4.39 0c.88 0 1.6.67 1.6 1.5s-.72 1.49-1.6 1.49-1.6-.67-1.6-1.49.72-1.5 1.6-1.5z" />
  </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.27-.2-.57-.34m-5.42 7.4h0a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.82 9.82 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88m8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.4z" />
  </svg>
)

interface ShareRowProps {
  /** Absolute canonical URL of the page being shared. */
  url: string
  title: string
}

const iconButtonClass =
  'inline-flex size-8 items-center justify-center rounded-full text-[#575853] transition-colors hover:bg-[#e8e8e4] hover:text-[#10110f]'

export const ShareRow = ({ url, title }: ShareRowProps) => {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    {
      name: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XIcon className="size-4" />
    },
    {
      name: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin className="size-4" aria-hidden="true" />
    },
    {
      name: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook className="size-4" aria-hidden="true" />
    },
    {
      name: 'Share on Reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: <RedditIcon className="size-4" />
    },
    {
      name: 'Share on WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <WhatsAppIcon className="size-4" />
    },
    {
      name: 'Share via email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <Mail className="size-4" aria-hidden="true" />
    }
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (insecure context) — leave the icon unchanged
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="pr-1 text-[13px] font-medium text-[#10110f]">Share:</span>
      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          rel="noreferrer"
          aria-label={target.name}
          title={target.name}
          className={iconButtonClass}
        >
          {target.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className={iconButtonClass}
      >
        {copied ? (
          <Check className="size-4 text-[#2d6a4f]" aria-hidden="true" />
        ) : (
          <LinkIcon className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
