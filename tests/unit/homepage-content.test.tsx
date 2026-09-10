import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { formatCompactGithubCount } from '../../app/(commonLayout)/home/home-data'
import {
  isHomeImageFrameReady,
  isHomeMediaEventForActiveItem,
  isHomeVideoFrameReady,
  isHomeVideoPlaybackReady
} from '../../app/(commonLayout)/home/home-media'
import { HomePage } from '../../app/(commonLayout)/home/home-page'
import type { HomepagePublicConfig, HomepageReadWatchResponse } from '../../service/homepage'

const sampleOpenScienceConfig: HomepagePublicConfig = {
  release_version: 'v0.16.0',
  latest_release_update: 'Aug 16, 2026',
  latest_release_title: 'v0.16.0',
  latest_release_desc: 'Release description',
  latest_release_features: [
    {
      title: 'Branch a conversation',
      text: 'start a new session from any message path without touching the original'
    }
  ],
  media: [
    {
      title: 'Product tour',
      url: 'https://statics.aipoch.com/public/f/video/open-science-v0-10-0-9ca70918.mp4'
    },
    {
      title: 'Workspace',
      url: 'https://statics.aipoch.com/public/f/image/figma-5fcb02c8.webp'
    }
  ],
  what_it_does: [
    { title: 'Execution, not suggestions', text: 'runs commands, Python and R with your approval' }
  ]
}

const sampleReadWatch: HomepageReadWatchResponse = {
  items: [
    {
      title: 'Release notes and changelog',
      category: 'Product',
      published_at: '2026-08-04T00:00:00.000Z',
      slug: 'release-notes'
    }
  ]
}

/** Mimic crawlers that strip tags without inserting spaces for <br>/block boundaries. */
const seoPlainFromMarkup = (markup: string) =>
  markup
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const headingInnerMarkup = (html: string, pattern: RegExp) => {
  const match = html.match(pattern)
  return match?.[1] ?? ''
}

const headingOutlineFromMarkup = (html: string) =>
  Array.from(html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/g), ([, level, content]) => ({
    level: Number(level),
    text: seoPlainFromMarkup(content ?? '')
      .replace(/\s+/g, ' ')
      .trim()
  }))

describe('new homepage content parity', () => {
  test('formats GitHub counts with compact repository-style units', () => {
    expect(formatCompactGithubCount(999)).toBe('999')
    expect(formatCompactGithubCount(1200)).toBe('1.2K')
    expect(formatCompactGithubCount(3500)).toBe('3.5K')
    expect(formatCompactGithubCount(10000)).toBe('10K')
    expect(formatCompactGithubCount(999999)).toBe('1M')
    expect(formatCompactGithubCount(1250000)).toBe('1.3M')
  })

  test('renders the GitHub star count and static hero stats in the first screen', () => {
    const html = renderToStaticMarkup(<HomePage githubStars={3500} />)
    const heroMarkup = html.slice(
      html.indexOf('id="home-hero"'),
      html.indexOf('id="open-science-spotlight"')
    )
    const github = html.match(/<a[^>]*data-testid="home-github-link"[^>]*>/)?.[0] ?? ''

    expect(heroMarkup).toContain('data-testid="home-github-stars"')
    expect(heroMarkup).toContain('3.5K')
    expect(github).toContain('aria-label="Open-Science on GitHub, 3.5K stars"')
    expect(heroMarkup).toContain('data-testid="home-hero-stats"')
    expect(heroMarkup).toContain('OFFICIAL MODEL APIs')
    expect(heroMarkup).toContain('AGENT FRAMEWORKS')
    expect(heroMarkup).toContain('SCIENCE CONNECTORS')
    expect(heroMarkup).toContain('data-testid="home-hero-stat-skills"')
    expect(heroMarkup).toContain('>597</strong>')
  })

  test('keeps the hero stats borderless on top and bottom with larger type', () => {
    const html = renderToStaticMarkup(<HomePage githubStars={3500} />)
    const stats = html.match(/<div[^>]*data-testid="home-hero-stats"[^>]*>/)?.[0] ?? ''
    const github = html.match(/<a[^>]*data-testid="home-github-link"[^>]*>/)?.[0] ?? ''

    expect(stats).not.toContain('border-y')
    expect(html).toContain('text-[36px]')
    expect(html).toContain('text-[11px]')
    expect(github).toContain('px-6')
    expect(github).toContain('py-3')
    expect(github).toContain('gap-3.5')
    expect(github).toContain('tracking-[0.1em]')
    expect(html).toContain('ml-20 size-4 shrink-0')
  })

  test('matches GitHub bar top and bottom spacing against the hero stats gap', () => {
    const html = renderToStaticMarkup(<HomePage githubStars={3500} />)
    const github = html.match(/<a[^>]*data-testid="home-github-link"[^>]*>/)?.[0] ?? ''
    const stats = html.match(/<div[^>]*data-testid="home-hero-stats"[^>]*>/)?.[0] ?? ''

    expect(github).toContain('mt-12')
    expect(stats).toContain('mt-12')
  })

  test('keeps the server-rendered hero visible and interactive before hydration', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const heroMarkup = html.slice(
      html.indexOf('id="home-hero"'),
      html.indexOf('id="open-science-spotlight"')
    )

    expect(heroMarkup).not.toContain('inert=""')
    expect(heroMarkup).not.toContain('style="opacity:0"')
    expect(heroMarkup).not.toContain('role="menu"')
    expect(heroMarkup).not.toContain('role="menuitem"')
  })

  test('opens with the download hero and the two supplied provider SVG strips', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const heroIndex = html.indexOf('id="home-hero"')
    const spotlightIndex = html.indexOf('id="open-science-spotlight"')

    expect(heroIndex).toBeGreaterThan(-1)
    expect(spotlightIndex).toBeGreaterThan(heroIndex)
    expect(seoPlainFromMarkup(html)).toContain('Science, Open to All')
    expect(html).toContain('data-testid="home-platform-downloads"')

    expect(html).toContain('data-testid="home-provider-strip-1"')
    expect(html).toContain('data-testid="home-provider-strip-2"')
    expect(html.match(/data-testid="home-provider-strip-[12]"[^>]+src="[^"]+"/g)).toHaveLength(2)
    expect(html).not.toContain('data-model-provider=')
    expect(html).not.toContain('/home/provider-logos/')
  })

  test('treats the first decoded video frame as ready for hiding the media loader', () => {
    expect(isHomeVideoFrameReady(1)).toBe(false)
    expect(isHomeVideoFrameReady(2)).toBe(true)
    expect(isHomeVideoFrameReady(3)).toBe(true)
  })

  test('treats started video playback as ready even when load events are missed', () => {
    expect(isHomeVideoPlaybackReady(1, true, false, 2)).toBe(false)
    expect(isHomeVideoPlaybackReady(1, false, true, 2)).toBe(false)
    expect(isHomeVideoPlaybackReady(1, false, false, 0)).toBe(false)
    expect(isHomeVideoPlaybackReady(1, false, false, 0.2)).toBe(true)
    expect(isHomeVideoPlaybackReady(2, true, false, 0)).toBe(true)
  })

  test('treats cached images with decoded dimensions as ready for hiding the media loader', () => {
    expect(isHomeImageFrameReady(false, 3840)).toBe(false)
    expect(isHomeImageFrameReady(true, 0)).toBe(false)
    expect(isHomeImageFrameReady(true, 3840)).toBe(true)
  })

  test('ignores stale media events after switching spotlight tabs', () => {
    expect(isHomeMediaEventForActiveItem('media-1', 'media-1')).toBe(true)
    expect(isHomeMediaEventForActiveItem('media-1', 'media-2')).toBe(false)
    expect(isHomeMediaEventForActiveItem('', 'media-2')).toBe(false)
  })

  test('keeps spaces in SEO-stripped homepage headings across line breaks', () => {
    const html = renderToStaticMarkup(
      <HomePage openScienceConfig={sampleOpenScienceConfig} readWatch={sampleReadWatch} />
    )

    const spotlight = seoPlainFromMarkup(
      headingInnerMarkup(html, /data-testid="spotlight-title"[^>]*>([\s\S]*?)<\/h2>/)
    )
    const ecosystem = seoPlainFromMarkup(
      headingInnerMarkup(html, /data-testid="ecosystem-title"[^>]*>([\s\S]*?)<\/h2>/)
    )
    const workbench = seoPlainFromMarkup(
      headingInnerMarkup(html, /data-testid="workbench-title"[^>]*>([\s\S]*?)<\/h2>/)
    )
    const skills = seoPlainFromMarkup(
      headingInnerMarkup(
        html,
        /<h2\b[^>]*class="[^"]*text-\[clamp\(24px,3\.4vw,40px\)\][^"]*"[^>]*>([\s\S]*?)<\/h2>/
      )
    )
    const audit = seoPlainFromMarkup(
      headingInnerMarkup(html, /data-testid="audit-title"[^>]*>([\s\S]*?)<\/h2>/)
    )
    const closing = seoPlainFromMarkup(
      headingInnerMarkup(html, /data-testid="closing-title"[^>]*>([\s\S]*?)<\/h2>/)
    )

    expect(html).not.toContain('We create &quot;insight&quot; moments for medical research')
    expect(html).not.toContain('id="hero"')

    expect(spotlight).toContain('See What’s New in Open-Science')
    expect(spotlight).not.toMatch(/Newin/)

    expect(ecosystem).toContain('The AIPOCH Ecosystem for Scientific AI Workflows')
    expect(ecosystem).not.toMatch(/forScientific/)

    expect(workbench).toContain('Open-Science — the open-source AI research workbench')
    expect(workbench).not.toMatch(/theopen-source|researchworkbench/)

    expect(skills).toContain('medical research agent skills')
    expect(skills).not.toMatch(/researchagent/)

    expect(audit).toContain('MedSkillAudit — every skill is audited before it ships')
    expect(audit).not.toMatch(/skillis/)

    expect(closing).toContain('Open, auditable, and yours to run.')
    expect(closing).not.toMatch(/auditable,and/)
  })

  test('renders the approved homepage heading outline for crawlers and assistive technology', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(headingOutlineFromMarkup(html)).toEqual([
      { level: 1, text: 'Science, Open to All' },
      { level: 2, text: 'See What’s New in Open-Science' },
      { level: 2, text: 'Latest release' },
      { level: 2, text: 'Read & watch' },
      { level: 2, text: 'What it does' },
      { level: 2, text: 'The AIPOCH Ecosystem for Scientific AI Workflows' },
      { level: 3, text: 'Open-Science' },
      { level: 3, text: 'Medical Research Skills' },
      { level: 3, text: 'MedSkillAudit' },
      { level: 2, text: 'Open-Science — the open-source AI research workbench' },
      { level: 2, text: '550+ medical research agent skills' },
      { level: 3, text: 'Evidence Insights' },
      { level: 3, text: 'Protocol Design' },
      { level: 3, text: 'Data Analysis' },
      { level: 3, text: 'Academic Writing' },
      { level: 2, text: 'MedSkillAudit — every skill is audited before it ships' },
      { level: 3, text: 'Production Ready' },
      { level: 3, text: 'Limited Release' },
      { level: 3, text: 'Beta Only' },
      { level: 3, text: 'Reject' },
      { level: 2, text: 'Open, auditable, and yours to run.' }
    ])
    expect(html).not.toMatch(/<h[4-6]\b/)
  })

  test('hides the decorative skills count from assistive technology', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toMatch(/data-testid="skills-count"[^>]*aria-hidden="true"/)
  })

  test('keeps the complete Skills copy from the approved HTML prototype', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('medical research')
    expect(html).toContain('agent skills')
    expect(html).toContain('AIPOCH maintains a curated, open library of')
    expect(html).toContain('550+ reusable medical research skills')
    expect(seoPlainFromMarkup(html)).toContain(
      'you can call the moment you need them — spanning the four areas most research turns actually pass through.'
    )
    expect(html).toContain('Works with the agents you already use')
    expect(html).toContain('Add the full library to your agent · one command')
    expect(html).toContain('Browse the Skills Library')
    expect(html).toContain('data-testid="skills-install-terminal"')
    expect(html).toContain('SKILL.md · called with /')
  })

  test('keeps the full Documents preview steps from the approved HTML prototype', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('Load &amp; validate</b> — read <code')
    expect(html).toContain('check the schema, flag missing values.')
    expect(html).toContain('describe each arm (age, sex, comorbidity) in one table.')
    expect(html).toContain('regress outcome on arm with covariate adjustment.')
    expect(html).toContain('write summary tables and effect-size figures to the preview.')
  })

  test('uses open-science prototype icons for ecosystem and skill areas', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('lucide-flask-conical')
    expect(html).toContain('lucide-layout-grid')
    expect(html).toContain('lucide-file-check-corner')
    expect(html).toContain('lucide-book-open')
    expect(html).toContain('lucide-workflow')
    expect(html).toContain('lucide-chart-column')
    expect(html).toContain('lucide-pen-line')
    expect(html).not.toContain('lucide-network')
  })

  test('uses the filled GitHub mark from the open-science prototype', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91')
    expect(html).not.toContain('lucide-github')
  })

  test('places the GitHub repo link below the hero platform downloads', () => {
    const html = renderToStaticMarkup(<HomePage />)

    const downloadsIndex = html.indexOf('data-testid="home-platform-downloads"')
    const repoIndex = html.indexOf('github.com/aipoch/open-science')

    expect(downloadsIndex).toBeGreaterThan(-1)
    expect(repoIndex).toBeGreaterThan(downloadsIndex)
    expect(html).toContain('https://github.com/aipoch/open-science')
    expect(html).not.toContain('data-testid="open-science-mark"')
    expect(html).not.toContain('Verify the package against the checksums')
  })

  test('emphasizes the AIPOCH PRODUCT hero eyebrow label', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain(
      'data-testid="home-hero-eyebrow-product" class="font-bold">AIPOCH PRODUCT</span>'
    )
  })

  test('uses the serif display style for the updated hero title', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('data-testid="home-hero-title"')
    expect(html).toContain('Science, Open to All</span>')
    expect(html).toContain('lg:text-[100px]')
    expect(html).toContain('lg:leading-[79.56px]')
    expect(html).toContain('font-normal font-[Georgia,serif]')
    expect(html).not.toContain('tracking-[-0.055em]')
    expect(html).not.toContain('Meet Open-Science')
    expect(html).not.toContain('Built for scientific research')
    expect(html).not.toContain('font-instrument-serif')
  })

  test('keeps the 15px desktop hero description to three lines', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const descriptionOpen = html.match(/<p[^>]*data-testid="home-hero-description"[^>]*>/)?.[0]
    const descriptionBody =
      html.match(/<p[^>]*data-testid="home-hero-description"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? ''

    expect(descriptionOpen).toContain('max-w-[620px]')
    expect(descriptionOpen).toContain('text-[15px]')
    expect(descriptionOpen).not.toContain('lg:text-[18px]')
    expect(descriptionBody).toContain(
      'Open-Science is AIPOCH&#x27;s open-source, local-first AI research workbench.<br/>It combines agent workflows, Python and R execution, scientific data<br/>connectors, and traceable research artifacts in one inspectable workspace.'
    )
  })

  test('uses the supplied architecture background and provider strip order', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('hero-architecture')
    expect(html.indexOf('home-provider-strip-1')).toBeLessThan(
      html.indexOf('home-provider-strip-2')
    )
  })

  test('creates desktop breathing room between hero copy and the architecture', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('lg:translate-x-[184px]')
    expect(html).toContain('rgba(0,0,0,.08)_26%,#000_58%')
    expect(html).not.toContain('data-testid="home-hero-architecture-veil"')
  })

  test('softens the transparent model-only architecture asset to match the design', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('hero-architecture-fd6f4997.webp')
    expect(html).toContain('statics.aipoch.com/public/f/image/hero-architecture-fd6f4997.webp')
    expect(html).toContain('opacity-[.50]')
    expect(html).toContain('blur-[.4px]')
    expect(html).not.toContain("bg-[url('/home/hero-architecture.png')]")
  })

  test('crops embedded SVG whitespace so provider strips loop without a blank interval', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('min-w-0 flex-none overflow-hidden')
    expect(html).toContain(
      'data-testid="home-provider-strip-clip-1" style="width:1693px;margin-right:180px"'
    )
    expect(html).toContain(
      'data-testid="home-provider-strip-clip-2" style="width:1583px;margin-right:180px"'
    )
    expect(html).not.toContain('transform:translateX(-94px)')
    expect(html).not.toContain('transform:translateX(-171px)')
  })

  test('shows the shared filled GitHub mark inside the hero repository link', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const link = html.match(/<a[^>]*data-testid="home-github-link"[^>]*>([\s\S]*?)<\/a>/)?.[1]

    expect(link).toContain('M12 .5C5.65.5.5 5.65.5 12')
    expect(link).toContain('github.com/aipoch/open-science')
    expect(html.match(/<a[^>]*data-testid="home-github-link"[^>]*>/)?.[0]).not.toContain(
      'hover:bg-'
    )
    expect(html.match(/<a[^>]*data-testid="home-github-link"[^>]*>/)?.[0]).toContain(
      'hover:opacity-90'
    )
  })

  test('keeps the platform cards aligned with the download design', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('DOWNLOAD')
    expect(html).toContain('bg-[#f7f7f5]')
    expect(html).toContain('bg-[#111]')
  })

  test('renders the centered release hero and full-width Wiki CTA after the download hero', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const heroIndex = html.indexOf('id="home-hero"')
    const spotlightIndex = html.indexOf('id="open-science-spotlight"')
    const spotlightMarkup = html.slice(spotlightIndex, html.indexOf('id="ecosystem"'))

    expect(spotlightIndex).toBeGreaterThan(heroIndex)
    expect(spotlightMarkup).toContain('See What’s New in Open-Science')
    expect(spotlightMarkup).toContain(
      'Watch the latest release overview to explore new capabilities, workflow improvements, and fixes across the Open-Science research workbench.'
    )
    expect(spotlightMarkup).toContain('data-testid="open-science-wiki-cta"')
    expect(spotlightMarkup).toContain('href="https://aipoch.com/docs/"')
    expect(spotlightMarkup).toContain('data-testid="spotlight-media-full-width"')
    expect(spotlightMarkup).not.toContain('Get started in three steps')
  })

  test('keeps the original fixed-height scrollable release cards', () => {
    const html = renderToStaticMarkup(
      <HomePage openScienceConfig={sampleOpenScienceConfig} readWatch={sampleReadWatch} />
    )
    const spotlightMarkup =
      html.split('id="open-science-spotlight"')[1]?.split('id="ecosystem"')[0] ?? ''

    expect(spotlightMarkup.match(/h-\[340px\]/g)).toHaveLength(3)
    expect(spotlightMarkup.match(/overflow-y-auto/g)).toHaveLength(3)
    expect(spotlightMarkup).toContain('[scrollbar-width:thin]')
  })

  test('renders homepage API media and Read & watch without static fallback', () => {
    const html = renderToStaticMarkup(
      <HomePage openScienceConfig={sampleOpenScienceConfig} readWatch={sampleReadWatch} />
    )

    expect(html).toContain('Product tour')
    expect(html).toContain('Workspace')
    expect(html).toContain('loop')
    expect(html).toContain('Loading...')
    expect(html).toContain('Loading media, please wait…')
    expect(html).not.toContain('Product tour loading...')
    expect(html).toContain('data-testid="home-media-loading"')
    expect(html).toMatch(/data-testid="home-media-loading"[^>]*class="[^"]*items-center/)
    const spotlightMediaMarkup = html.split('aria-label="Open-Science media previews"')[1] ?? ''
    expect(spotlightMediaMarkup).toMatch(/<video\b[^>]*object-contain/)
    expect(spotlightMediaMarkup).not.toMatch(/<video\b[^>]*object-cover/)
    expect(html).toMatch(/role="tabpanel"[^>]*aspect-video/)
    expect(html).toContain('data-testid="spotlight-read-watch"')
    expect(html).toContain('Release notes and changelog')
    expect(html).toContain('href="/blog/release-notes"')
    expect(html).toContain('Product')
    expect(html).toContain('data-testid="spotlight-media-full-width"')
    expect(html).not.toContain('lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)]')
    expect(html).toContain('-mt-[var(--nav-h)]')
    expect(html).toContain('pt-[calc(var(--nav-h)+clamp(28px,4vh,48px))]')
  })

  test('ends the spotlight cleanly without the two marquee rows', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toMatch(
      /id="open-science-spotlight"[^>]*class="[^"]*pt-\[calc\(var\(--nav-h\)\+clamp\(28px,4vh,48px\)\)\][^"]*"/
    )
    expect(html).toMatch(
      /id="open-science-spotlight"[^>]*class="[^"]*pb-\[clamp\(28px,4vh,48px\)\][^"]*"/
    )
    expect(html).not.toContain('data-testid="homepage-marquee-primary"')
    expect(html).not.toContain('data-testid="homepage-marquee-secondary"')
  })

  test('fits screenshot media inside a 16:9 box without cropping', () => {
    const html = renderToStaticMarkup(
      <HomePage
        openScienceConfig={{
          ...sampleOpenScienceConfig,
          media: [
            {
              title: 'Workspace',
              url: 'https://statics.aipoch.com/public/f/image/figma-5fcb02c8.webp'
            }
          ]
        }}
        readWatch={sampleReadWatch}
      />
    )

    expect(html).toContain('figma-5fcb02c8.webp')
    expect(html).toMatch(/role="tabpanel"[^>]*aspect-video/)
    expect(html).toMatch(/<img\b[^>]*class="[^"]*\bobject-contain\b/)
    expect(html).toMatch(/<img\b[^>]*\[image-rendering:-webkit-optimize-contrast\]/)
    expect(html).toMatch(/<img\b[^>]*width="3840"/)
    expect(html).not.toMatch(/<img\b[^>]*(?:srcSet|srcset|sizes|decoding)=/)
    expect(html).not.toMatch(/<img\b[^>]*object-cover/)
  })

  test('omits media and read-watch items when APIs are missing', () => {
    const html = renderToStaticMarkup(<HomePage openScienceConfig={null} readWatch={null} />)

    expect(html).not.toContain('data-testid="home-media-loading"')
    expect(html).not.toContain('open-science-v0-10-0-9ca70918.mp4')
    expect(html).not.toContain('Release notes and changelog')
  })

  test('uses a single-column spotlight layout when media is empty', () => {
    const html = renderToStaticMarkup(
      <HomePage
        openScienceConfig={{ ...sampleOpenScienceConfig, media: [] }}
        readWatch={sampleReadWatch}
      />
    )

    expect(html).not.toContain('lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)]')
    expect(html).not.toContain('data-testid="home-media-loading"')
    expect(html).toContain('data-testid="spotlight-read-watch"')
  })

  test('keeps unrecognized media URLs as tabs with a black unavailable panel', () => {
    const html = renderToStaticMarkup(
      <HomePage
        openScienceConfig={{
          ...sampleOpenScienceConfig,
          media: [
            {
              title: '1111111111111111111111',
              url: 'https://statics.aipoch.com/public/f/image/paper-fb87a969.webp1'
            },
            ...sampleOpenScienceConfig.media
          ]
        }}
        readWatch={sampleReadWatch}
      />
    )

    expect(html).toContain('1111111111111111111111')
    expect(html).toContain('Product tour')
    expect(html).toContain('Loading...')
    expect(html).toContain('Loading media, please wait…')
    expect(html).not.toContain('Preview unavailable')
    expect(html).not.toContain('could not be loaded')
    expect(html).toContain('data-testid="home-media-loading"')
    expect(html).not.toContain(
      'src="https://statics.aipoch.com/public/f/image/paper-fb87a969.webp1"'
    )
  })

  test('keeps the download hero before the spotlight and later sections', () => {
    const html = renderToStaticMarkup(<HomePage />)

    const heroIndex = html.indexOf('id="home-hero"')
    const spotlightIndex = html.indexOf('id="open-science-spotlight"')
    const ecosystemIndex = html.indexOf('id="ecosystem"')

    expect(heroIndex).toBeGreaterThan(-1)
    expect(spotlightIndex).toBeGreaterThan(heroIndex)
    expect(ecosystemIndex).toBeGreaterThan(spotlightIndex)
    expect(html).not.toContain('id="hero"')
    expect(html).not.toContain('data-testid="hero-insight"')
    expect(html).not.toContain('data-testid="hero-video"')
    expect(html).not.toContain('data-testid="homepage-marquee-primary"')
    expect(html).not.toContain('data-testid="homepage-marquee-secondary"')
    expect(html).not.toContain('data-testid="hero-workbench-badge"')
  })

  test('renders the skills library count before scroll animation', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('data-testid="skills-count"')
    expect(html).toMatch(/data-testid="skills-count"[^>]*>[\s\S]*?550/)
  })

  test('keeps the closing section and medical disclaimer', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('data-testid="closing-title"')
    expect(html).toContain('Open, auditable,')
    expect(html).toContain('yours to run.')
    expect(html).toContain('not a substitute for professional')
  })

  test('skill area cards use open-science prototype hover transitions', () => {
    const html = renderToStaticMarkup(<HomePage />)
    const skillBlock =
      html.split('data-testid="skill-area-0"')[1]?.split('data-testid="skill-area-1"')[0] ?? ''

    expect(skillBlock).toContain('transition-[background]')
    expect(skillBlock).toContain('duration-[250ms]')
    expect(skillBlock).not.toContain('cursor-pointer')
    expect(skillBlock).toMatch(
      /skill-area-description"[^>]*duration-300[^>]*ease-\[cubic-bezier\(0\.2,0\.7,0\.2,1\)\]/
    )
    expect(skillBlock).toContain('lucide-book-open')
    expect(skillBlock).not.toMatch(/lucide-book-open[^>]*\btransition\b/)
  })
})
