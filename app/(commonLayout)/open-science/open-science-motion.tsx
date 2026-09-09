'use client'

import { inView } from 'motion'
import { animate } from 'motion/mini'
import { type ReactNode, useEffect, useRef } from 'react'

const observeReveals = (root: HTMLElement) => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return

  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-open-science-reveal]'))
  const revealed = new WeakSet<Element>()
  const animations = new Map<HTMLElement, ReturnType<typeof animate>>()

  const finish = (element: HTMLElement) => {
    animations.get(element)?.cancel()
    animations.delete(element)
    // Return layout and focus layers to their original CSS after the entrance animation.
    element.style.removeProperty('opacity')
    element.style.removeProperty('transform')
  }

  // Server HTML stays visible; only animate an element when it first enters the viewport.
  const stopObserving = inView(
    elements,
    (element) => {
      if (!(element instanceof HTMLElement)) return
      if (revealed.has(element) || reduceMotion.matches || element.contains(document.activeElement))
        return
      revealed.add(element)
      const animation = animate(
        element,
        {
          opacity: [0, 1],
          transform: ['translateY(16px)', 'none']
        },
        {
          duration: 0.6,
          delay: Number(element.dataset.openScienceReveal) || 0,
          ease: [0.2, 0.7, 0.2, 1]
        }
      )
      animations.set(element, animation)
      void animation.then(() => {
        if (animations.get(element) === animation) finish(element)
      })
    },
    { amount: 0.12 }
  )

  const finishFocused = (event: FocusEvent) => {
    if (!(event.target instanceof Node)) return
    for (const element of elements) {
      if (!element.contains(event.target)) continue
      revealed.add(element)
      finish(element)
    }
  }
  const finishAll = () => {
    stopObserving()
    for (const element of animations.keys()) finish(element)
  }
  const onMotionPreferenceChange = () => {
    if (reduceMotion.matches) finishAll()
  }

  root.addEventListener('focusin', finishFocused)
  reduceMotion.addEventListener('change', onMotionPreferenceChange)
  return () => {
    finishAll()
    root.removeEventListener('focusin', finishFocused)
    reduceMotion.removeEventListener('change', onMotionPreferenceChange)
  }
}

export const OpenScienceMotion = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current) return observeReveals(ref.current)
  }, [])

  return (
    <main ref={ref} id="top" className="-mt-[var(--nav-h)] min-w-0 bg-[#f6f6f4] text-[#111]">
      {children}
    </main>
  )
}
