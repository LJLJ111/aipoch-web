'use client'

import { useEffect, useRef, useState } from 'react'
import { type FieldErrors, useForm } from 'react-hook-form'
import type { SubmitMedFlowMemberResult } from '@/service/medflow-members'
import { MedFlowContent } from './medflow-content'
import { MedFlowEffects } from './medflow-effects'
import {
  createMedFlowSubmitAction,
  type MedFlowFormValues,
  medFlowEmailPattern,
  medFlowValidationErrorMessage
} from './medflow-submit'

export const MedFlowExperience = () => {
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitMedFlowMemberResult | null>(null)
  const [shouldFlashConsent, setShouldFlashConsent] = useState(false)
  const [successName, setSuccessName] = useState('')
  const isSubmittingRef = useRef(false)
  const {
    formState: { errors, touchedFields },
    handleSubmit,
    register,
    watch
  } = useForm<MedFlowFormValues>({
    defaultValues: {
      consent: false,
      email: '',
      name: ''
    },
    mode: 'onChange'
  })
  const name = watch('name').trim()
  const email = watch('email').trim()
  const hasConsent = watch('consent')
  const hasValidName = Boolean(name)
  const hasValidEmail = medFlowEmailPattern.test(email)
  const completedFields = Number(hasValidName) + Number(hasValidEmail)
  const progressPercent = completedFields === 0 ? 0 : completedFields === 1 ? 55 : 100
  const progressLabel =
    progressPercent === 0
      ? "0% — let's go"
      : progressPercent === 55
        ? '55% — almost there'
        : '100% — ready to launch'

  const handleInput = () => {
    setApiError('')
    if (hasConsent) setShouldFlashConsent(false)
  }

  const submitWaitlist = createMedFlowSubmitAction({
    isSubmittingRef,
    setApiError,
    setIsSubmitting,
    setResult,
    setSuccessName
  })
  const handleInvalidSubmit = (submitErrors: FieldErrors<MedFlowFormValues>) => {
    setResult(null)
    const fieldError = medFlowValidationErrorMessage(hasValidName, hasValidEmail)
    setApiError(fieldError)
    if (submitErrors.consent) {
      setShouldFlashConsent(false)
      window.setTimeout(() => {
        setShouldFlashConsent(true)
      }, 0)
    }
  }

  useEffect(() => {
    if (!result?.ok) return
    document.querySelector<HTMLElement>('#mf-success-title')?.focus()
  }, [result])

  return (
    <>
      <MedFlowEffects />
      <div className="mf-shell">
        <MedFlowContent
          apiError={apiError}
          consentFieldState={{
            hasError: Boolean(errors.consent),
            shouldFlash: shouldFlashConsent
          }}
          emailFieldState={{
            hasError: Boolean(errors.email),
            isComplete: hasValidEmail
          }}
          isSubmitting={isSubmitting}
          nameFieldState={{
            hasError: Boolean(errors.name),
            isComplete: hasValidName && Boolean(touchedFields.name || name)
          }}
          onInput={handleInput}
          onSubmit={handleSubmit(submitWaitlist, handleInvalidSubmit)}
          progressLabel={progressLabel}
          progressPercent={progressPercent}
          registerEmail={register('email', {
            pattern: {
              message: "That email doesn't look right — please check it.",
              value: medFlowEmailPattern
            },
            required: 'Please enter your email.',
            setValueAs: (value: string) => value.trim()
          })}
          registerConsent={register('consent', {
            required: 'Please agree to the data processing terms above to continue.'
          })}
          onConsentAnimationEnd={() => {
            setShouldFlashConsent(false)
          }}
          registerName={register('name', {
            required: 'Please tell us your name.',
            setValueAs: (value: string) => value.trim()
          })}
          result={result}
          successName={successName}
        />
      </div>
    </>
  )
}
