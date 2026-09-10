import { isAxiosError } from 'axios'
import { apiClient } from './index'

// --- Fetch claim information ---

export interface ClaimAgent {
  id: string
  name: string
  description: string
  verification_code: string
  is_claimed: boolean
  created_at: string
}

export interface FetchClaimInfoResponse {
  code: number
  msg: string
  data: {
    success: boolean
    agent: ClaimAgent
  }
}

export async function fetchClaimInfo(token: string): Promise<FetchClaimInfoResponse> {
  const response = await apiClient.get<FetchClaimInfoResponse>('/v1/agent/claim', {
    params: { token }
  })
  return response.data
}

// --- Verification ---

export interface VerifyAgentParams {
  tweet_url: string
  verification_code: string
  claim_token: string
}

export interface VerifyAgentData {
  success: boolean
  x_handle?: string
  actor?: {
    id: number
    x_handle: string
    display_name: string
    avatar_url: string | null
    created_at: string
  }
  claim_status?: string
  error?: string
}

export interface VerifyAgentResponse {
  code: number
  msg: string
  data: VerifyAgentData
}

export async function verifyAgent(params: VerifyAgentParams): Promise<VerifyAgentResponse> {
  try {
    const response = await apiClient.post<VerifyAgentResponse>('/v1/agent/verify', params)
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const msg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        ''
      throw new Error(msg || `Verification failed (${error.response?.status || 'network error'}).`)
    }
    throw error
  }
}
