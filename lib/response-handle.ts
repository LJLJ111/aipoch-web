import type { API } from '@/service/types'

export function isErrorResponse<T>(res: API.GeneralResponse<T> | API.ErrorResponse): res is API.ErrorResponse {
  return res.code >= 400
}
