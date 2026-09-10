import { describe, expect, test } from 'bun:test'
import {
  initialNavbarTheme,
  isDark,
  NAVBAR_ZONE_SELECTORS,
  type NavbarZone,
  opaqueRgb,
  resolveNavbarTheme
} from '../../components/navbar/navbar-adaptive-logic'

const zone = (top: number, bottom: number, dark: boolean): NavbarZone => ({
  el: {
    getBoundingClientRect: () => ({
      top,
      bottom,
      height: bottom - top,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
      toJSON: () => ({})
    })
  } as Element,
  dark
})

describe('navbar adaptive logic', () => {
  test('includes nested main sections and the site footer', () => {
    expect(NAVBAR_ZONE_SELECTORS).toContain('main section')
    expect(NAVBAR_ZONE_SELECTORS).toContain('main > *')
    expect(NAVBAR_ZONE_SELECTORS).toContain('footer')
    expect(NAVBAR_ZONE_SELECTORS).not.toContain('body > footer')
  })

  test('treats opaque dark backgrounds as dark', () => {
    expect(isDark([23, 24, 28])).toBe(true)
    expect(opaqueRgb('rgb(23, 24, 28)')).toEqual([23, 24, 28])
  })

  test('ignores transparent backgrounds', () => {
    expect(opaqueRgb('rgba(23, 24, 28, 0)')).toBeNull()
  })

  test('prefers the last matching zone at the probe line', () => {
    const zones = [zone(-200, 400, false), zone(20, 900, true), zone(910, 1600, false)]

    expect(resolveNavbarTheme(zones, 43)).toBe('dark')
    expect(resolveNavbarTheme(zones, 950)).toBe('light')
  })

  test('defaults to light when no zone contains the probe', () => {
    const zones = [zone(200, 400, true)]

    expect(resolveNavbarTheme(zones, 43)).toBe('light')
  })

  test('starts light before measured page zones take over', () => {
    expect(initialNavbarTheme('/')).toBe('light')
    expect(initialNavbarTheme('/open-science')).toBe('light')
    expect(initialNavbarTheme('/blog')).toBe('light')
  })
})
