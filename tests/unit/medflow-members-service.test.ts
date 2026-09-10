import { describe, expect, test } from 'bun:test'
import type { AxiosResponse } from 'axios'

import { type SubmitMedFlowMemberPost, submitMedFlowMember } from '../../service/medflow-members'

const axiosResponse = <T>(data: T, status = 200): AxiosResponse<T> =>
  ({
    data,
    status,
    statusText: String(status),
    headers: {},
    config: {}
  }) as AxiosResponse<T>

describe('submitMedFlowMember', () => {
  test('posts the MedFlow waitlist payload to the members endpoint', async () => {
    const calls: Array<{ body: unknown; path: string }> = []
    const post: SubmitMedFlowMemberPost = async (path, body) => {
      calls.push({ path, body })
      return axiosResponse({
        code: 20000,
        msg: 'Success',
        data: { message: 'Email reserved.' }
      })
    }

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'user@example.com' },
      post
    )

    expect(calls).toEqual([
      {
        path: '/v1/members',
        body: {
          display_name: 'test-user',
          email: 'user@example.com',
          source: 'medflowpre'
        }
      }
    ])
    expect(result).toEqual({ ok: true, message: 'Email reserved.' })
  })

  test('treats the API duplicate-email success payload as a successful reservation', async () => {
    const post: SubmitMedFlowMemberPost = async () =>
      axiosResponse({
        code: 20000,
        msg: 'Success',
        data: { message: 'Email already reserved.' }
      })

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'user@example.com' },
      post
    )

    expect(result).toEqual({ ok: true, message: 'Email already reserved.' })
  })

  test('maps rate limiting to a retry-later result', async () => {
    const post: SubmitMedFlowMemberPost = async () => {
      throw {
        isAxiosError: true,
        response: {
          status: 429,
          data: {
            code: 429,
            msg: 'Too many requests from this IP. Retry after 3537 seconds',
            data: null
          }
        }
      }
    }

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'user2@example.com' },
      post
    )

    expect(result).toEqual({
      ok: false,
      reason: 'rate_limited',
      message: 'Too many requests from this IP. Retry after 3537 seconds'
    })
  })

  test('uses backend messages from failed HTTP responses', async () => {
    const post: SubmitMedFlowMemberPost = async () => {
      throw {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            code: 40000,
            msg: 'Email is already on the waitlist.',
            data: null
          }
        }
      }
    }

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'existing@example.com' },
      post
    )

    expect(result).toEqual({
      ok: false,
      reason: 'failed',
      message: 'Email is already on the waitlist.'
    })
  })

  test('prefers backend data messages from business failure responses', async () => {
    const post: SubmitMedFlowMemberPost = async () =>
      axiosResponse({
        code: 40000,
        msg: 'Request failed',
        data: { message: 'This email cannot join the MedFlow waitlist.' }
      })

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'blocked@example.com' },
      post
    )

    expect(result).toEqual({
      ok: false,
      reason: 'failed',
      message: 'This email cannot join the MedFlow waitlist.'
    })
  })

  test('maps unexpected API responses to a generic failure result', async () => {
    const post: SubmitMedFlowMemberPost = async () =>
      axiosResponse({
        code: 50000,
        msg: 'Service unavailable',
        data: null
      })

    const result = await submitMedFlowMember(
      { displayName: 'test-user', email: 'user@example.com' },
      post
    )

    expect(result).toEqual({
      ok: false,
      reason: 'failed',
      message: 'Service unavailable'
    })
  })
})
