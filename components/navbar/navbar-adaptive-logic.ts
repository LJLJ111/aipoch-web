export type NavTheme = 'light' | 'dark'

export type NavbarZone = {
  el: Element
  dark: boolean
}

/** Top-level page blocks, nested sections (e.g. /open-science), and the site footer. */
export const NAVBAR_ZONE_SELECTORS = 'main > *, main section, footer, body > section'

export function opaqueRgb(value: string): number[] | null {
  const match = /rgba?\(([^)]+)\)/.exec(value)
  if (!match) return null

  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(parseFloat)
  if (parts.length < 3) return null
  if (parts.length > 3 && (parts[3] ?? 0) < 0.5) return null

  return parts
}

export function isDark(rgb: number[]) {
  const [red = 0, green = 0, blue = 0] = rgb
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255 < 0.45
}

export function collectNavbarZones(document: Document, header: HTMLElement): NavbarZone[] {
  const seen = new Set<Element>()
  const zones: NavbarZone[] = []

  document.querySelectorAll(NAVBAR_ZONE_SELECTORS).forEach((el) => {
    if (el === header || header.contains(el) || seen.has(el)) return

    const rgb = opaqueRgb(getComputedStyle(el).backgroundColor)
    if (!rgb) return

    seen.add(el)
    zones.push({ el, dark: isDark(rgb) })
  })

  return zones
}

export function resolveNavbarTheme(zones: NavbarZone[], probe: number): NavTheme {
  let theme: NavTheme = 'light'

  for (const zone of zones) {
    const rect = zone.el.getBoundingClientRect()
    if (rect.height && rect.top <= probe && rect.bottom > probe) {
      theme = zone.dark ? 'dark' : 'light'
    }
  }

  return theme
}

export function initialNavbarTheme(_pathname: string): NavTheme {
  // Top-level pages start on light surfaces; measured zones take over after hydration.
  return 'light'
}
