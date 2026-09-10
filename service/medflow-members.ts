import type { AxiosResponse } from 'axios'
import { isAxiosError } from 'axios'
import { apiClient } from './index'
import type { API } from './types'

const medFlowMemberSource = 'medflowpre'

interface MemberResponseData {
  message?: string
}

export interface SubmitMedFlowMemberInput {
  displayName: string
  email: string
}

export type SubmitMedFlowMemberResult =
  | {
      ok: true
      message: string
    }
  | {
      ok: false
      reason: 'failed' | 'rate_limited'
      message: string
    }

export type SubmitMedFlowMemberPost = (
  path: string,
  body: {
    display_name: string
    email: string
    source: typeof medFlowMemberSource
  }
) => Promise<AxiosResponse<API.GeneralResponse<MemberResponseData | null>>>

/** Submit a MedFlow waitlist entry: POST /v1/members. */
export const submitMedFlowMember = async (
  input: SubmitMedFlowMemberInput,
  post: SubmitMedFlowMemberPost = apiClient.post
): Promise<SubmitMedFlowMemberResult> => {
  try {
    const response = await post('/v1/members', {
      display_name: input.displayName,
      email: input.email,
      source: medFlowMemberSource
    })
    const body = response.data
    const backendMessage = body.data?.message || body.msg

    if (body.code === 20000) {
      return {
        ok: true,
        message: backendMessage || 'Success'
      }
    }

    return {
      ok: false,
      reason: 'failed',
      message: backendMessage || 'Request failed. Please try again later.'
    }
  } catch (error) {
    if (isAxiosError<API.GeneralResponse<MemberResponseData | null>>(error)) {
      const backendMessage = error.response?.data?.msg || error.response?.data?.data?.message
      if (error.response?.status === 429) {
        return {
          ok: false,
          reason: 'rate_limited',
          message: backendMessage || 'Too many requests from this IP. Please try again later.'
        }
      }

      return {
        ok: false,
        reason: 'failed',
        message: backendMessage || 'Request failed. Please try again later.'
      }
    }

    return {
      ok: false,
      reason: 'failed',
      message: 'Request failed. Please try again later.'
    }
  }
}
