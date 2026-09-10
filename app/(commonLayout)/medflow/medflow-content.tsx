'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircleIcon, CheckIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import type { AnimationEventHandler, FormEvent, FormEventHandler } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import type { SubmitMedFlowMemberResult } from '@/service/medflow-members'

const discordUrl = 'https://discord.gg/zxQAYjReRv'
const xUrl = 'https://x.com/aipoch_ai'
const medFlowLetters = ['M', 'E', 'D', 'F', 'L', 'O', 'W']
const checkIconStrokeWidth = 3
const signalPulseShadow = [
  '0 0 0 0 rgba(233, 213, 83, 0.45)',
  '0 0 0 12px rgba(233, 213, 83, 0)',
  '0 0 0 12px rgba(233, 213, 83, 0)'
]
const easeOut = 'easeOut' as const

const DiscordIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
)

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const pillars = [
  {
    number: '01',
    title: 'Reproducible',
    body: 'The same question, taken down the same path, returns the same answer — today, and a year from now.'
  },
  {
    number: '02',
    title: 'Verifiable',
    body: "Confidence isn't an afterthought. It's built in long before you ever begin."
  },
  {
    number: '03',
    title: 'Traceable',
    body: 'Every step is accounted for and open to scrutiny — ready for any reviewer, any question.'
  }
] as const

type MedFlowContentProps = {
  apiError: string
  consentFieldState: {
    hasError: boolean
    shouldFlash: boolean
  }
  emailFieldState: {
    hasError: boolean
    isComplete: boolean
  }
  isSubmitting: boolean
  nameFieldState: {
    hasError: boolean
    isComplete: boolean
  }
  onConsentAnimationEnd: AnimationEventHandler<HTMLLabelElement>
  onInput: FormEventHandler<HTMLFormElement>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  progressLabel: string
  progressPercent: number
  registerConsent: UseFormRegisterReturn<'consent'>
  registerEmail: UseFormRegisterReturn<'email'>
  registerName: UseFormRegisterReturn<'name'>
  result: SubmitMedFlowMemberResult | null
  successName: string
}

export const MedFlowContent = ({
  apiError,
  consentFieldState,
  emailFieldState,
  isSubmitting,
  nameFieldState,
  onConsentAnimationEnd,
  onInput,
  onSubmit,
  progressLabel,
  progressPercent,
  registerConsent,
  registerEmail,
  registerName,
  result,
  successName
}: MedFlowContentProps) => {
  const isSuccess = Boolean(result?.ok)
  const reduceMotion = useReducedMotion()
  const heroRise = (delay: number) => ({
    animate: { opacity: 1, y: 0 },
    initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: {
      delay: reduceMotion ? 0 : delay,
      duration: reduceMotion ? 0 : 0.8,
      ease: easeOut
    }
  })
  const reveal = (delayStep = 0) => ({
    initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: {
      delay: reduceMotion ? 0 : delayStep * 0.08,
      duration: reduceMotion ? 0 : 0.7,
      ease: easeOut
    },
    viewport: { amount: 0.16, once: true },
    whileInView: { opacity: 1, y: 0 }
  })

  return (
    <section className="mf-hero landing-grid-ambient landing-grid-drift">
      <div className="mf-hero-inner">
        <div className="mf-hero-copy">
          <motion.div className="mf-eyebrow" {...heroRise(0.1)}>
            <motion.span
              className="dot"
              animate={reduceMotion ? undefined : { boxShadow: signalPulseShadow }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 2.6, ease: 'easeOut', repeat: Number.POSITIVE_INFINITY }
              }
            />
            A new signal is coming
          </motion.div>
          <h1 className="mf-title" aria-label="MedFlow">
            {medFlowLetters.map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                aria-hidden="true"
                animate={{ filter: 'blur(0px)', opacity: 1, rotateX: 0, y: 0 }}
                initial={
                  reduceMotion
                    ? { filter: 'blur(0px)', opacity: 1, rotateX: 0, y: 0 }
                    : { filter: 'blur(8px)', opacity: 0, rotateX: 40, y: 28 }
                }
                transition={{
                  delay: reduceMotion ? 0 : 0.3 + index * 0.07,
                  duration: reduceMotion ? 0 : 0.9,
                  ease: [0.2, 0.7, 0.2, 1]
                }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <motion.p className="mf-tagline" {...heroRise(0.85)}>
            We're engineering a new way to turn the complexity of research into clarity you can
            trust.
          </motion.p>
          <motion.div className="mf-meta" {...heroRise(1)}>
            <span className="bar" />
            <span className="label">Coming Soon</span>
            <span className="sep">·</span>
            <span className="label">July 2026</span>
          </motion.div>
          <motion.div className="mf-cta-row" {...heroRise(1.15)}>
            <a
              className="landing-action landing-action-dark landing-shimmer-loop mf-cta"
              href="#waitlist"
            >
              <span className="landing-action-content">
                Join the waitlist <span className="arw">→</span>
              </span>
            </a>
            <a
              className="landing-action-ghost mf-cta-discord"
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord community"
            >
              <span className="landing-action-content">
                <DiscordIcon />
                Join Discord
              </span>
            </a>
            <span className="mf-cta-note">Be among the first to get in.</span>
          </motion.div>

          <div className="mf-concept-head">
            <motion.div className="mf-kicker" data-reveal {...reveal()}>
              What it stands for
            </motion.div>
            <motion.h2 className="mf-lead" data-reveal data-d="1" {...reveal(1)}>
              Not just <em>faster</em>.
              <br />
              Built to be <em>certain</em>.
            </motion.h2>
            <motion.p className="mf-lead-sub" data-reveal data-d="2" {...reveal(2)}>
              MedFlow is the next signal from AIPOCH. We're not ready to reveal everything yet — but
              we can tell you what it's built on. Three things we refuse to compromise on.
            </motion.p>
          </div>
        </div>

        <div className="mf-form-col">
          <motion.div className="mf-wl-card" id="waitlist" data-reveal {...reveal()}>
            <div className="mf-wl-inner">
              <div className="mf-wl-kicker">
                <span className="dot" />
                Waitlist
              </div>
              <h2>Be first in line.</h2>
              <p className="lead">
                When MedFlow opens its private beta, everyone on the waitlist becomes one of our{' '}
                <strong>first testers</strong>. Leave your name and email — the moment we launch,
                your <strong>activation code</strong> lands straight in your inbox.
              </p>

              <form
                aria-hidden={isSuccess}
                className="mf-form"
                id="mf-form"
                inert={isSuccess}
                noValidate
                onInput={onInput}
                onSubmit={onSubmit}
              >
                <div className="mf-prog" aria-hidden="true">
                  <div className="track">
                    <div className="fill" id="mf-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="pct" id="mf-pct">
                    {progressLabel}
                  </span>
                </div>

                <div className="mf-fields">
                  <div
                    className={[
                      'mf-field',
                      nameFieldState.isComplete ? 'ok' : '',
                      nameFieldState.hasError ? 'err' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    id="f-name"
                  >
                    <Input
                      type="text"
                      id="mf-name"
                      placeholder="Name"
                      autoComplete="name"
                      aria-invalid={nameFieldState.hasError}
                      aria-describedby={nameFieldState.hasError ? 'mf-err' : undefined}
                      required
                      {...registerName}
                    />
                    <label htmlFor="mf-name">Your name</label>
                    <span className="tick" aria-hidden="true">
                      <CheckIcon strokeWidth={checkIconStrokeWidth} />
                    </span>
                  </div>
                  <div
                    className={[
                      'mf-field',
                      emailFieldState.isComplete ? 'ok' : '',
                      emailFieldState.hasError ? 'err' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    id="f-email"
                  >
                    <Input
                      type="email"
                      id="mf-email"
                      placeholder="Email"
                      autoComplete="email"
                      aria-invalid={emailFieldState.hasError}
                      aria-describedby={emailFieldState.hasError ? 'mf-err' : undefined}
                      required
                      {...registerEmail}
                    />
                    <label htmlFor="mf-email">Email address</label>
                    <span className="tick" aria-hidden="true">
                      <CheckIcon strokeWidth={checkIconStrokeWidth} />
                    </span>
                  </div>
                </div>
                <div className={apiError ? 'mf-alert-wrap show' : 'mf-alert-wrap'} id="mf-err">
                  {apiError ? (
                    <Alert variant="destructive" className="mf-alert">
                      <AlertCircleIcon />
                      <AlertTitle>MedFlow request failed</AlertTitle>
                      <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                  ) : null}
                </div>

                <label
                  className={[
                    'mf-consent',
                    consentFieldState.hasError ? 'err' : '',
                    consentFieldState.shouldFlash ? 'flash' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  id="f-consent"
                  onAnimationEnd={onConsentAnimationEnd}
                >
                  <input
                    type="checkbox"
                    id="mf-consent"
                    aria-invalid={consentFieldState.hasError}
                    {...registerConsent}
                  />
                  <span className="txt">
                    You hereby acknowledge and agree that your above data will be processed by
                    AIPOCH PTE. LTD. for the purpose of processing your request and sending you a
                    trial activation code when MedFlow's private beta is ready. For additional
                    information please check our{' '}
                    <a
                      href="https://aipoch.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <div className="mf-submit">
                  <Button
                    type="submit"
                    className="landing-action landing-action-dark mf-btn"
                    id="mf-btn"
                    disabled={isSubmitting}
                  >
                    <span className="landing-action-content">
                      {isSubmitting ? 'Submitting...' : 'Request early access'}{' '}
                      <span className="arw">→</span>
                    </span>
                  </Button>
                </div>
              </form>
            </div>

            <motion.div
              className={isSuccess ? 'mf-success show' : 'mf-success'}
              id="mf-success"
              role="status"
              aria-live="polite"
              animate={
                isSuccess
                  ? { opacity: 1, scale: 1, visibility: 'visible' }
                  : { opacity: 0, scale: 0.96, visibility: 'hidden' }
              }
              initial={false}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            >
              <div className="mf-success-in">
                <motion.div
                  className="mf-check"
                  animate={
                    isSuccess
                      ? { opacity: 1, rotate: 0, scale: 1 }
                      : { opacity: 0, rotate: -30, scale: 0 }
                  }
                  initial={false}
                  transition={{
                    delay: isSuccess && !reduceMotion ? 0.12 : 0,
                    duration: reduceMotion ? 0 : 0.6,
                    ease: [0.2, 1.5, 0.4, 1]
                  }}
                >
                  <CheckIcon strokeWidth={checkIconStrokeWidth} />
                </motion.div>
                <h2 className="mf-success-title" id="mf-success-title" tabIndex={-1}>
                  {successName ? (
                    <>
                      <span className="mf-success-prefix">You're in,&nbsp;</span>
                      <span className="mf-success-name">{successName}</span>
                      <span className="mf-success-suffix">!</span>
                    </>
                  ) : (
                    "You're on the list!"
                  )}
                </h2>
                <p id="mf-success-msg">
                  When MedFlow enters beta, you'll be among the very first to get in.
                </p>
                <p>
                  Keep an eye on your inbox — that's where your <strong>activation code</strong>{' '}
                  will arrive.
                </p>
                <div className="code-note">
                  <span aria-hidden="true">🔑</span>
                  <span>Your activation code ships at launch</span>
                </div>
                <p className="mf-follow-hint">
                  While you wait — <b>join the community</b> and follow along:
                </p>
                <div className="mf-social-row">
                  <a
                    className="landing-action-ghost mf-social-btn"
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join our Discord community"
                  >
                    <span className="landing-action-content">
                      <DiscordIcon />
                      Join our Discord
                    </span>
                  </a>
                  <a
                    className="landing-action-ghost mf-social-btn"
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow AIPOCH on X (Twitter)"
                  >
                    <span className="landing-action-content">
                      <XIcon />
                      Follow @aipoch_ai
                    </span>
                  </a>
                </div>
                <div className="secondary">
                  <span className="tag">Signal received</span>
                  <Link href="/">Explore AIPOCH →</Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mf-pillars-wrap">
        <div className="mf-pillars">
          {pillars.map((pillar, index) => (
            <motion.div
              className="mf-pillar"
              data-reveal
              data-d={index + 1}
              key={pillar.title}
              {...reveal(index + 1)}
            >
              <div className="n">{pillar.number}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
