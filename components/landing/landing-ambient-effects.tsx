'use client'

import { useLayoutEffect, useRef } from 'react'

type Particle = {
  opacity: number
  radius: number
  speed: number
  theta: number
  x: number
  y: number
}

type LandingAmbientEffectsProps = {
  canvasId: string
  glowClassName: string
  pageSelector: string
  footerBuffer?: number
  glowRadius?: number
  isLoadedClassName?: string
  particleColor?: [number, number, number]
  particleDensity?: number
  particleSpeed?: [number, number]
  reveal?: boolean
}

export const LandingAmbientEffects = ({
  canvasId,
  footerBuffer = 120,
  glowClassName,
  glowRadius = 260,
  isLoadedClassName = 'is-loaded',
  pageSelector,
  particleColor = [120, 135, 160],
  particleDensity = 32,
  particleSpeed = [0.15, 0.5],
  reveal = false
}: LandingAmbientEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [particleRed, particleGreen, particleBlue] = particleColor
  const [minParticleSpeed, maxParticleSpeed] = particleSpeed

  useLayoutEffect(() => {
    const page = document.querySelector<HTMLElement>(pageSelector)
    if (!page) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const cleanup: Array<() => void> = []
    const animationFrame = requestAnimationFrame(() => page.classList.add(isLoadedClassName))
    cleanup.push(() => cancelAnimationFrame(animationFrame))

    if (reveal) {
      const revealElements = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (reduce || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => {
          element.classList.add('in')
        })
      } else {
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return
              entry.target.classList.add('in')
              revealObserver.unobserve(entry.target)
            })
          },
          { threshold: 0.16 }
        )
        revealElements.forEach((element) => {
          revealObserver.observe(element)
        })
        cleanup.push(() => revealObserver.disconnect())
      }
    }

    const glow = glowRef.current
    const handleMouseMove = (event: MouseEvent) => {
      if (!glow || !window.matchMedia?.('(pointer:fine)').matches) return
      const isOverFooter =
        event.target instanceof Element && Boolean(event.target.closest('footer'))
      const footerTop = document.querySelector('footer')?.getBoundingClientRect().top
      const pageBottom = page.getBoundingClientRect().bottom
      const glowCutoff = (footerTop ?? pageBottom) - glowRadius - footerBuffer
      if (isOverFooter || event.clientY >= glowCutoff) {
        glow.style.opacity = '0'
        return
      }
      glow.style.transform = `translate(${event.clientX}px,${event.clientY}px)`
      glow.style.opacity = '1'
    }
    const handleMouseOut = () => {
      if (glow) glow.style.opacity = '0'
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseout', handleMouseOut)
    cleanup.push(() => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
    })

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    let frame = 0
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const makeParticle = (anywhere: boolean): Particle => ({
      opacity: 0.08 + Math.random() * 0.32,
      radius: (0.5 + Math.random() * 1.7) * dpr,
      speed: (minParticleSpeed + Math.random() * (maxParticleSpeed - minParticleSpeed)) * dpr,
      theta: Math.random() * 6.28,
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10
    })

    const resetParticles = () => {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      particles = Array.from(
        { length: Math.min(46, Math.floor(window.innerWidth / particleDensity)) },
        () => makeParticle(true)
      )
    }

    const tickParticles = () => {
      if (!context) return
      context.clearRect(0, 0, width, height)
      particles = particles.map((particle) => {
        const next = {
          ...particle,
          theta: particle.theta + 0.02,
          y: particle.y - particle.speed
        }
        next.x += Math.sin(next.theta) * 0.18 * dpr
        const active = next.y < -10 ? makeParticle(false) : next
        const alpha = active.opacity * (0.6 + 0.4 * Math.sin(active.theta))
        context.beginPath()
        context.fillStyle = `rgba(${particleRed},${particleGreen},${particleBlue},${alpha.toFixed(3)})`
        context.arc(active.x, active.y, active.radius, 0, 6.2832)
        context.fill()
        return active
      })
      frame = requestAnimationFrame(tickParticles)
    }

    if (!reduce && canvas && context) {
      resetParticles()
      tickParticles()
      window.addEventListener('resize', resetParticles)
      cleanup.push(() => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resetParticles)
      })
    }

    return () => {
      page.classList.remove(isLoadedClassName)
      cleanup.forEach((run) => {
        run()
      })
    }
  }, [
    footerBuffer,
    glowRadius,
    isLoadedClassName,
    maxParticleSpeed,
    minParticleSpeed,
    pageSelector,
    particleBlue,
    particleDensity,
    particleGreen,
    particleRed,
    reveal
  ])

  return (
    <>
      <canvas ref={canvasRef} id={canvasId} />
      <div ref={glowRef} className={glowClassName} aria-hidden="true" />
    </>
  )
}
