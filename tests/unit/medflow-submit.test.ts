import { describe, expect, mock, test } from 'bun:test'

import {
  createMedFlowSubmitAction,
  medFlowValidationErrorMessage
} from '../../app/(commonLayout)/medflow/medflow-submit'
import type { SubmitMedFlowMemberResult } from '../../service/medflow-members'

describe('createMedFlowSubmitAction', () => {
  test('guards against duplicate submits before React disables the button', async () => {
    let resolveSubmit: (result: SubmitMedFlowMemberResult) => void = () => {}
    const submitMember = mock(
      () =>
        new Promise<SubmitMedFlowMemberResult>((resolve) => {
          resolveSubmit = resolve
        })
    )
    const setApiError = mock()
    const setIsSubmitting = mock()
    const setResult = mock()
    const setSuccessName = mock()
    const replaceHash = mock()
    const isSubmittingRef = { current: false }
    const submitWaitlist = createMedFlowSubmitAction({
      isSubmittingRef,
      replaceHash,
      setApiError,
      setIsSubmitting,
      setResult,
      setSuccessName,
      submitMember
    })

    const firstSubmit = submitWaitlist({
      consent: true,
      email: 'avery@example.com',
      name: 'Avery Researcher'
    })
    const secondSubmit = submitWaitlist({
      consent: true,
      email: 'avery@example.com',
      name: 'Avery Researcher'
    })
    resolveSubmit({ ok: true, message: 'Email reserved.' })
    await Promise.all([firstSubmit, secondSubmit])

    expect(submitMember).toHaveBeenCalledTimes(1)
    expect(isSubmittingRef.current).toBe(false)
    expect(setSuccessName).toHaveBeenCalledWith('Avery')
    expect(replaceHash).toHaveBeenCalledTimes(1)
  })

  test('provides validation messages for react-hook-form invalid submit results', () => {
    expect(medFlowValidationErrorMessage(false, false)).toBe(
      'Please add your name and a valid email.'
    )
    expect(medFlowValidationErrorMessage(false, true)).toBe('Please tell us your name.')
    expect(medFlowValidationErrorMessage(true, false)).toBe(
      "That email doesn't look right — please check it."
    )
    expect(medFlowValidationErrorMessage(true, true)).toBe('')
  })
})
