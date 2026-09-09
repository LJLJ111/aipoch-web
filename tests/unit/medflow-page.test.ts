import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { MedFlowContent } from '../../app/(commonLayout)/medflow/medflow-content'
import MedFlowPage from '../../app/(commonLayout)/medflow/page'
import type { SubmitMedFlowMemberResult } from '../../service/medflow-members'

const expectedSeoTitle = 'MedFlow — A new signal is coming · AIPOCH'
const expectedSeoDescription =
  'MedFlow is the next signal from AIPOCH. A new way to turn the complexity of medical research into clarity you can trust. Arriving July 2026 — join the waitlist.'

const textFromMarkup = (markup: string) =>
  markup
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

const h1TextByClass = (html: string, className: string) => {
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const h1Markup = html.match(
    new RegExp(`<h1\\b[^>]*class="[^"]*\\b${escapedClassName}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/h1>`)
  )?.[1]

  return textFromMarkup(h1Markup ?? '')
}

const cssRule = (css: string, selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? ''
}

const renderMedFlowContent = ({
  apiError = '',
  consentFieldState = { hasError: false, shouldFlash: false },
  isSubmitting = false,
  result = null,
  successName = ''
}: {
  apiError?: string
  consentFieldState?: {
    hasError: boolean
    shouldFlash: boolean
  }
  isSubmitting?: boolean
  result?: SubmitMedFlowMemberResult | null
  successName?: string
} = {}) =>
  renderToStaticMarkup(
    createElement(MedFlowContent, {
      apiError,
      consentFieldState,
      emailFieldState: { hasError: false, isComplete: false },
      isSubmitting,
      nameFieldState: { hasError: false, isComplete: false },
      onConsentAnimationEnd: () => {},
      onInput: () => {},
      onSubmit: () => {},
      progressLabel: "0% — let's go",
      progressPercent: 0,
      registerEmail: {
        name: 'email',
        onBlur: async () => undefined,
        onChange: async () => undefined,
        ref: () => {}
      },
      registerName: {
        name: 'name',
        onBlur: async () => undefined,
        onChange: async () => undefined,
        ref: () => {}
      },
      registerConsent: {
        name: 'consent',
        onBlur: async () => undefined,
        onChange: async () => undefined,
        ref: () => {}
      },
      result,
      successName
    })
  )

describe('MedFlow page', () => {
  test('uses the requested SEO title and description across metadata tags', async () => {
    const { medFlowMetadata: metadata } = await import(
      '../../app/(commonLayout)/medflow/medflow-metadata'
    )

    const canonicalUrl = String(metadata.alternates?.canonical)
    const openGraphUrl = String(metadata.openGraph?.url)

    expect(metadata.title).toBe(expectedSeoTitle)
    expect(metadata.description).toBe(expectedSeoDescription)
    expect(metadata.openGraph?.title).toBe(expectedSeoTitle)
    expect(metadata.openGraph?.description).toBe(expectedSeoDescription)
    expect(metadata.twitter?.title).toBe(expectedSeoTitle)
    expect(metadata.twitter?.description).toBe(expectedSeoDescription)
    expect(canonicalUrl).toEndWith('/medflow')
    expect(canonicalUrl).toStartWith('https://aipoch.com')
    expect(openGraphUrl).toEndWith('/medflow')
    expect(openGraphUrl).toStartWith('https://aipoch.com')
  })

  test('renders the MedFlow teaser content without embedding a custom header or footer', () => {
    const html = renderToStaticMarkup(createElement(MedFlowPage))
    const text = textFromMarkup(html)

    expect(h1TextByClass(html, 'mf-title').replace(/\s+/g, '')).toBe('MEDFLOW')
    expect(html).toContain('aria-label="MedFlow"')
    expect(html.match(/aria-hidden="true" style="filter:blur\(8px\);opacity:0/g)?.length).toBe(7)
    expect(text).toContain('A new signal is coming')
    expect(text).toContain(
      "We're engineering a new way to turn the complexity of research into clarity you can trust."
    )
    expect(text).toContain('Coming Soon · July 2026')
    expect(text).toContain('Not just faster . Built to be certain .')
    expect(text).toContain('Reproducible')
    expect(text).toContain('Verifiable')
    expect(text).toContain('Traceable')
    expect(html).not.toContain('<header')
    expect(html).not.toContain('<footer')
  })

  test('renders the waitlist form and local success state copy', () => {
    const html = renderToStaticMarkup(createElement(MedFlowPage))
    const text = textFromMarkup(html)

    expect(html).toContain('id="waitlist"')
    expect(html).toContain('name="name"')
    expect(html).toContain('name="email"')
    expect(html).toContain('name="consent"')
    expect(text).toContain('Be first in line.')
    expect(text).toContain('Request early access')
    expect(text).not.toContain('No spam — one email when MedFlow is ready.')
    expect(text).toContain(
      "You hereby acknowledge and agree that your above data will be processed by AIPOCH PTE. LTD. for the purpose of processing your request and sending you a trial activation code when MedFlow's private beta is ready."
    )
    expect(html).toContain('href="https://aipoch.com/privacy-policy"')
    expect(text).toContain("You're on the list!")
    expect(text).toContain('🔑 Your activation code ships at launch')
    expect(text).not.toContain('Your activation code ships at launch — July 2026')
    expect(html).not.toContain('aria-label="Activation code"')
    expect(text).toContain('Join our Discord')
    expect(text).toContain('Follow @aipoch_ai')
  })

  test('keeps consent validation separate from field alert copy', () => {
    const html = renderMedFlowContent({
      consentFieldState: { hasError: true, shouldFlash: true }
    })
    const consentMarkup = html.match(/<label\b[^>]*id="f-consent"[\s\S]*?<\/label>/)?.[0] ?? ''

    expect(consentMarkup).toContain('mf-consent err flash')
    expect(consentMarkup).toContain('aria-invalid="true"')
    expect(consentMarkup).not.toContain('aria-describedby=')
  })

  test('keeps shimmer on the hero CTA but not on the form submit button', () => {
    const html = renderToStaticMarkup(createElement(MedFlowPage))
    const submitButtonMarkup = html.match(/<button\b[^>]*id="mf-btn"[\s\S]*?<\/button>/)?.[0] ?? ''

    expect(html).toContain('landing-action landing-action-dark landing-shimmer-loop mf-cta')
    expect(html).toContain('landing-action-ghost mf-cta-discord')
    expect(html).toContain('landing-action landing-action-dark mf-btn')
    expect(html).not.toContain('<span class="landing-shimmer')
    expect(html).toContain('landing-shimmer-loop')
    expect(submitButtonMarkup).toContain('Request early access')
    expect(submitButtonMarkup).not.toContain('landing-shimmer')
  })

  test('keeps shared action button text in an explicit content layer', () => {
    const html = renderToStaticMarkup(createElement(MedFlowPage))

    expect(html).toContain('class="landing-action-content"')
    expect(html).toContain('Join the waitlist')
    expect(html).toContain('Request early access')
    expect(html).toContain('Join Discord')
    expect(html).toContain('Join our Discord')
    expect(html).toContain('Follow @aipoch_ai')
  })

  test('reuses shared landing action effects instead of local button hover rules', () => {
    const sharedCss = readFileSync('components/landing/landing-effects.css', 'utf8')
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')

    expect(sharedCss).toContain('.landing-action {')
    expect(sharedCss).toContain('.landing-action:hover')
    expect(sharedCss).toContain('.landing-action-ghost:hover')
    expect(sharedCss).toContain('--landing-action-foreground')
    expect(sharedCss).toContain('color: var(--landing-action-foreground)')
    expect(sharedCss).toContain('.landing-action-content svg')
    expect(css).not.toContain('.mf-cta:hover')
    expect(css).not.toContain('.mf-btn:hover')
    expect(css).not.toContain('.mf-cta-discord:hover')
    expect(css).not.toContain('.mf-social-btn:hover')
  })

  test('only truncates the dynamic success name instead of the whole heading', () => {
    const html = renderMedFlowContent({
      result: { ok: true, message: 'Email reserved.' },
      successName: '220986544444444444444444444444444444444'
    })
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const successTitleRule = cssRule(css, '.mf-success-title')
    const successNameRule = cssRule(css, '.mf-success-name')

    expect(html).toContain('class="mf-success-title"')
    expect(html).toContain('class="mf-success-prefix"')
    expect(html).toContain('class="mf-success-name"')
    expect(html).toContain('class="mf-success-suffix"')
    expect(successTitleRule).not.toContain('truncate')
    expect(successTitleRule).toContain('overflow-visible')
    expect(successNameRule).toContain('truncate')
    expect(successNameRule).toContain('min-w-0')
  })

  test('renders a destructive alert shell for backend waitlist errors', () => {
    const idleHtml = renderToStaticMarkup(createElement(MedFlowPage))
    const errorHtml = renderMedFlowContent({ apiError: 'Email is already on the waitlist.' })

    expect(idleHtml).not.toContain('data-slot="alert"')
    expect(idleHtml).not.toContain('MedFlow request failed')
    expect(errorHtml).toContain('data-slot="alert"')
    expect(errorHtml).toContain('data-slot="alert-title"')
    expect(errorHtml).toContain('data-slot="alert-description"')
    expect(errorHtml).toContain('MedFlow request failed')
    expect(errorHtml).toContain('Email is already on the waitlist.')
  })

  test('removes the completed form from accessibility navigation after success', () => {
    const html = renderMedFlowContent({
      result: { ok: true, message: 'Email reserved.' },
      successName: 'Avery'
    })

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('inert=""')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('class="mf-success show"')
  })

  test('keeps the success checkmark clear of clipped scroll edges', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const successRule = cssRule(css, '.mf-success')
    const successInnerRule = cssRule(css, '.mf-success-in')
    const checkRule = cssRule(css, '.mf-check')
    const successTitleRule = cssRule(css, '.mf-success-title')

    expect(successRule).toContain('py-[clamp(38px,6vw,58px)]')
    expect(successInnerRule).not.toContain('my-auto')
    expect(successInnerRule).toContain('min-h-full')
    expect(checkRule).toContain('mt-2')
    expect(checkRule).toContain('shrink-0')
    expect(successTitleRule).toContain('leading-[1.16]')
    expect(successTitleRule).toContain('py-1')
    expect(css).toContain(
      '.mf-btn {\n  @apply min-h-[56px] cursor-pointer border-0 px-[34px] py-[19px] text-[15px];'
    )
  })

  test('keeps the success layer above the submitted form controls', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const successRule = cssRule(css, '.mf-success')

    expect(successRule).toContain('z-20')
  })

  test('keeps the success status label legible at small sizes', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const statusTagRule = cssRule(css, '.mf-success .secondary .tag')

    expect(statusTagRule).toContain('text-[11px]')
    expect(statusTagRule).toContain('tracking-[.16em]')
    expect(statusTagRule).toContain('subpixel-antialiased')
    expect(statusTagRule).toContain('color: var(--mf-muted)')
  })

  test('gives the MedFlow hero enough width for the waitlist card beside the title', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const heroInnerRule = cssRule(css, '.mf-hero-inner')

    expect(heroInnerRule).toContain('max-w-[1240px]')
    expect(heroInnerRule).toContain('grid-cols-[minmax(0,1.04fr)_minmax(340px,400px)]')
  })

  test('uses yellow only for selection and signal pulse while keeping the static accent muted', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const content = readFileSync('app/(commonLayout)/medflow/medflow-content.tsx', 'utf8')
    const selectionRule = cssRule(css, '.medflow-page ::selection')

    expect(css).toContain('--mf-gold: #97a0af;')
    expect(css).toContain('--mf-selection: #e9d553;')
    expect(selectionRule).toContain('background: var(--mf-selection)')
    expect(content).toContain('rgba(233, 213, 83, 0.45)')
    expect(content).toContain('rgba(233, 213, 83, 0)')
  })

  test('skips confetti animation when reduced motion is requested', () => {
    const effects = readFileSync('app/(commonLayout)/medflow/medflow-effects.tsx', 'utf8')

    expect(effects).toContain('if (reduce) return')
    expect(effects).toContain("from 'canvas-confetti'")
    expect(effects).not.toContain('type ConfettiPart')
    expect(effects).not.toContain('getContext')
  })

  test('uses react-hook-form for waitlist field state and validation', () => {
    const experience = readFileSync('app/(commonLayout)/medflow/medflow-experience.tsx', 'utf8')
    const content = readFileSync('app/(commonLayout)/medflow/medflow-content.tsx', 'utf8')
    const effects = readFileSync('app/(commonLayout)/medflow/medflow-effects.tsx', 'utf8')
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')

    expect(experience).toContain("from 'react-hook-form'")
    expect(experience).toContain('useForm<MedFlowFormValues>')
    expect(experience).toContain('handleSubmit')
    expect(experience).toContain('setShouldFlashConsent')
    expect(content).toContain('nameFieldState')
    expect(content).toContain('emailFieldState')
    expect(content).toContain('shouldFlash')
    expect(content).toContain('progressPercent')
    expect(effects).not.toContain("querySelector<HTMLInputElement>('#mf-name')")
    expect(effects).not.toContain("addEventListener('input'")
    expect(css).toContain('@keyframes mf-consent-flash')
    expect(css).toContain('.mf-consent.flash .txt')
    expect(cssRule(css, '.mf-consent.err .txt')).not.toContain('color:')
  })

  test('drives page-level MedFlow animations through motion instead of local CSS keyframes', () => {
    const css = readFileSync('app/(commonLayout)/medflow/medflow.css', 'utf8')
    const content = readFileSync('app/(commonLayout)/medflow/medflow-content.tsx', 'utf8')
    const effects = readFileSync('app/(commonLayout)/medflow/medflow-effects.tsx', 'utf8')

    expect(css).not.toContain('@keyframes mf-letter')
    expect(css).not.toContain('@keyframes mf-rise')
    expect(css).not.toContain('@keyframes mf-card-shake')
    expect(css).not.toContain('@keyframes mf-pop')
    expect(css).not.toContain('@keyframes mf-draw')
    expect(css).not.toContain('.medflow-page [data-reveal].in')
    expect(content).toContain("from 'motion/react'")
    expect(content).toContain('whileInView')
    expect(effects).toContain("from 'motion'")
    expect(effects).toContain('{ x: [0, -1, 3, -7, 7, -7, 7, -7, 3, -1, 0] }')
  })
})
