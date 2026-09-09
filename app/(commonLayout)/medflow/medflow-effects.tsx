'use client'

import confetti from 'canvas-confetti'
import { animate } from 'motion'
import { useLayoutEffect } from 'react'
import { LandingAmbientEffects } from '@/components/landing/landing-ambient-effects'

const confettiColors = ['#111111', '#ffffff', '#c4c4c4', '#b9c0cc', '#4A8A72', '#8a93a3']

export const MedFlowEffects = () => {
  useLayoutEffect(() => {
    const page = document.querySelector<HTMLElement>('.medflow-page')
    if (!page) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const cleanup: Array<() => void> = []

    const waitlistCard = page.querySelector<HTMLElement>('#waitlist')
    const waitlistLinks = Array.from(
      page.querySelectorAll<HTMLAnchorElement>('a[href="#waitlist"]')
    )
    let shakeTimer: ReturnType<typeof setTimeout> | undefined
    let shakeControl: { stop: () => void } | undefined
    const restartCardShake = () => {
      if (!waitlistCard) return
      shakeControl?.stop()
      if (reduce) return
      shakeControl = animate(
        waitlistCard,
        { x: [0, -1, 3, -7, 7, -7, 7, -7, 3, -1, 0] },
        { duration: 0.5, ease: [0.36, 0.07, 0.19, 0.97] }
      ) as { stop: () => void }
    }
    const handleWaitlistClick = () => {
      if (shakeTimer) clearTimeout(shakeTimer)
      shakeTimer = setTimeout(restartCardShake, reduce ? 0 : 450)
    }
    waitlistLinks.forEach((link) => {
      link.addEventListener('click', handleWaitlistClick)
    })
    cleanup.push(() => {
      if (shakeTimer) clearTimeout(shakeTimer)
      shakeControl?.stop()
      waitlistLinks.forEach((link) => {
        link.removeEventListener('click', handleWaitlistClick)
      })
    })

    const fireConfetti = () => {
      if (reduce) return

      confetti({
        colors: confettiColors,
        disableForReducedMotion: true,
        origin: { x: 0.5, y: 0.42 },
        particleCount: 150,
        spread: 360,
        startVelocity: 42,
        ticks: 180
      })
      confetti({
        angle: 66,
        colors: confettiColors,
        disableForReducedMotion: true,
        origin: { x: 0.02, y: 1 },
        particleCount: 70,
        spread: 52,
        startVelocity: 48,
        ticks: 170
      })
      confetti({
        angle: 114,
        colors: confettiColors,
        disableForReducedMotion: true,
        origin: { x: 0.98, y: 1 },
        particleCount: 70,
        spread: 52,
        startVelocity: 48,
        ticks: 170
      })
    }

    const success = page.querySelector<HTMLElement>('#mf-success')
    let hasFiredSuccessConfetti = false
    if (success && 'MutationObserver' in window) {
      const successObserver = new MutationObserver(() => {
        if (success.classList.contains('show') && !hasFiredSuccessConfetti) {
          hasFiredSuccessConfetti = true
          fireConfetti()
        }
      })
      successObserver.observe(success, { attributes: true, attributeFilter: ['class'] })
      cleanup.push(() => successObserver.disconnect())
    }

    return () => {
      cleanup.forEach((run) => {
        run()
      })
    }
  }, [])

  return (
    <LandingAmbientEffects
      canvasId="mf-particles"
      glowClassName="mf-cursor-glow"
      pageSelector=".medflow-page"
      particleColor={[120, 135, 160]}
      particleDensity={32}
    />
  )
}
