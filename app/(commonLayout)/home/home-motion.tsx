'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'

export const homeEase = [0.2, 0.7, 0.2, 1] as const

const variantNames = { rest: 'rest', hover: 'hover' } as const

const revealViewport = { amount: 0.12, once: true, margin: '0px 0px -6% 0px' } as const

export const resolveHomeRevealAnimate = ({
  reduce,
  shown,
  settled,
  offset = false
}: {
  reduce: boolean
  shown: boolean
  settled: boolean
  offset?: boolean
}) => {
  // After settle, omit `y` so re-renders cannot put translateY(0) back on the layer.
  if (reduce || (shown && settled)) return { opacity: 1 }
  if (!offset) return { opacity: shown ? 1 : 0 }
  if (shown) return { opacity: 1, y: 0 }
  return { opacity: 0, y: 20 }
}

export const HomeReveal = ({
  children,
  className,
  delay = 0,
  visibleInitially = false,
  offset = false
}: {
  children: ReactNode
  className?: string
  delay?: number
  visibleInitially?: boolean
  offset?: boolean
}) => {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, revealViewport)
  const shown = visibleInitially || Boolean(reduce) || inView
  const [settled, setSettled] = useState(false)
  const mountInitial =
    reduce
      ? false
      : visibleInitially
        ? offset
          ? { opacity: 1, y: 20 }
          : { opacity: 1 }
        : offset
          ? { opacity: 0, y: 20 }
          : { opacity: 0 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={mountInitial}
      animate={resolveHomeRevealAnimate({ reduce: Boolean(reduce), shown, settled, offset })}
      transition={{
        duration: reduce ? 0 : visibleInitially ? 0.85 : 0.7,
        delay: reduce ? 0 : delay,
        ease: homeEase
      }}
      onAnimationComplete={() => shown && setSettled(true)}
      // Opacity alone still allows focus; inert keeps unrevealed blocks out of tab order.
      inert={shown ? undefined : true}
    >
      {children}
    </motion.div>
  )
}

export const MotionPulseDot = ({ className }: { className?: string }) => {
  const reduce = useReducedMotion()
  return (
    <motion.i
      className={className}
      aria-hidden
      animate={
        reduce
          ? undefined
          : {
              opacity: [0.35, 1, 0.35],
              scale: [0.85, 1, 0.85]
            }
      }
      transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export const MotionCursor = ({ className }: { className?: string }) => {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={className}
      aria-hidden
      animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
      transition={
        reduce
          ? undefined
          : { duration: 0.8, repeat: Infinity, ease: 'linear', times: [0, 0.48, 0.49, 1] }
      }
    />
  )
}

export const MotionFlowPulse = ({ className }: { className?: string }) => {
  const reduce = useReducedMotion()
  return (
    <motion.i
      className={className}
      aria-hidden
      initial={false}
      animate={
        reduce
          ? { left: '8px', opacity: 1 }
          : {
              left: ['8px', 'calc(100% - 16px)'],
              opacity: [0, 1, 1, 0]
            }
      }
      transition={
        reduce
          ? undefined
          : {
              duration: 2.6,
              repeat: Infinity,
              ease: homeEase,
              left: { duration: 2.6, ease: homeEase, repeat: Infinity },
              opacity: {
                duration: 2.6,
                ease: homeEase,
                repeat: Infinity,
                times: [0, 0.12, 0.88, 1]
              }
            }
      }
    />
  )
}

export const MediaLoadingShell = ({
  hidden,
  children
}: {
  hidden: boolean
  children: ReactNode
}) => {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3.5 overflow-hidden p-6 text-center bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02))]"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.35, ease: homeEase }}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <div className="relative z-[1] flex flex-col items-center gap-3.5">{children}</div>
    </motion.div>
  )
}

export const HomeMarqueeTrack = ({
  children,
  reverse = false,
  duration = 38
}: {
  children: ReactNode
  reverse?: boolean
  duration?: number
}) => {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="flex w-max will-change-transform"
      animate={reduce ? undefined : reverse ? { x: ['-50%', '0%'] } : { x: ['0%', '-50%'] }}
      transition={reduce ? undefined : { duration, ease: 'linear', repeat: Infinity }}
    >
      {children}
    </motion.div>
  )
}

export const usePlayWhenVisible = (
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) => {
  const inView = useInView(videoRef, { amount: 0.15 })
  const shouldPlay = enabled && inView

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!shouldPlay) {
      video.pause()
      return
    }
    void video.play().catch(() => undefined)
  }, [shouldPlay, videoRef])

  return { inView, shouldPlay }
}

export const ctaMotionVariants = {
  shell: {
    rest: { y: 0 },
    hover: { y: -2 }
  },
  fillYellow: {
    rest: { y: '101%' },
    hover: { y: '0%' }
  },
  fillBlack: {
    rest: { y: '101%' },
    hover: { y: '0%' }
  }
} as const

export const ctaVariantNames = variantNames
