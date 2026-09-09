import { type SubmitMedFlowMemberResult, submitMedFlowMember } from '@/service/medflow-members'

const fieldErrorMessage = {
  invalidBoth: 'Please add your name and a valid email.',
  invalidEmail: "That email doesn't look right — please check it.",
  invalidName: 'Please tell us your name.'
} as const

export const medFlowEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type MedFlowFormValues = {
  consent: boolean
  email: string
  name: string
}

type SubmitMember = (input: {
  displayName: string
  email: string
}) => Promise<SubmitMedFlowMemberResult>

type MedFlowSubmitHandlerOptions = {
  isSubmittingRef: { current: boolean }
  replaceHash?: () => void
  setApiError: (message: string) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setResult: (result: SubmitMedFlowMemberResult | null) => void
  setSuccessName: (name: string) => void
  submitMember?: SubmitMember
}

export const medFlowValidationErrorMessage = (hasValidName: boolean, hasValidEmail: boolean) => {
  if (!hasValidName && !hasValidEmail) return fieldErrorMessage.invalidBoth
  if (!hasValidName) return fieldErrorMessage.invalidName
  if (!hasValidEmail) return fieldErrorMessage.invalidEmail
  return ''
}

export const createMedFlowSubmitAction = ({
  isSubmittingRef,
  replaceHash = () => {
    try {
      history.replaceState(null, '', '#joined')
    } catch {
      // Hash replacement is decorative; a browser refusing it should not block the success state.
    }
  },
  setApiError,
  setIsSubmitting,
  setResult,
  setSuccessName,
  submitMember = submitMedFlowMember
}: MedFlowSubmitHandlerOptions) => {
  return async ({ email, name }: MedFlowFormValues) => {
    if (isSubmittingRef.current) return

    const displayName = name.trim()
    const emailAddress = email.trim()
    setResult(null)

    isSubmittingRef.current = true
    setApiError('')
    setIsSubmitting(true)
    try {
      const nextResult = await submitMember({ displayName, email: emailAddress })
      setResult(nextResult)

      if (nextResult.ok) {
        const firstName = displayName.split(/\s+/)[0]
        setSuccessName(firstName)
        replaceHash()
        return
      }

      setApiError(nextResult.message)
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }
}
