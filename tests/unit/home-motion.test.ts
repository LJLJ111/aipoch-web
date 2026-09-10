import { describe, expect, test } from 'bun:test'
import { resolveHomeRevealAnimate } from '../../app/(commonLayout)/home/home-motion'

describe('resolveHomeRevealAnimate', () => {
  test('drops y after settle so re-renders do not keep translateY(0)', () => {
    expect(resolveHomeRevealAnimate({ reduce: false, shown: true, settled: true })).toEqual({
      opacity: 1
    })
  })

  test('defaults to opacity-only reveal without vertical movement', () => {
    expect(resolveHomeRevealAnimate({ reduce: false, shown: false, settled: false })).toEqual({
      opacity: 0
    })
    expect(resolveHomeRevealAnimate({ reduce: false, shown: true, settled: false })).toEqual({
      opacity: 1
    })
  })

  test('supports explicit y movement for reveals that opt in', () => {
    expect(
      resolveHomeRevealAnimate({ reduce: false, shown: false, settled: false, offset: true })
    ).toEqual({
      opacity: 0,
      y: 20
    })
    expect(
      resolveHomeRevealAnimate({ reduce: false, shown: true, settled: false, offset: true })
    ).toEqual({
      opacity: 1,
      y: 0
    })
  })

  test('skips y when the user prefers reduced motion', () => {
    expect(resolveHomeRevealAnimate({ reduce: true, shown: true, settled: false })).toEqual({
      opacity: 1
    })
  })
})
