import type { LeaderboardEvaluationPayload } from './leaderboard-evaluation'

/** Parse the API's `raw_result_json`, which may be a string or object, into a page payload. */
export function normalizeLeaderboardRawResult(raw: unknown): LeaderboardEvaluationPayload | null {
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const o = parsed as Record<string, unknown>

  const meta = o.meta
  if (meta === null || typeof meta !== 'object' || Array.isArray(meta)) return null
  if (typeof (meta as { skill_name?: unknown }).skill_name !== 'string') return null

  if (o.final === null || typeof o.final !== 'object' || Array.isArray(o.final)) return null
  if (o.static_score === null || typeof o.static_score !== 'object' || Array.isArray(o.static_score))
    return null
  if (o.dynamic_score === null || typeof o.dynamic_score !== 'object' || Array.isArray(o.dynamic_score))
    return null
  if (o.veto_gates === null || typeof o.veto_gates !== 'object' || Array.isArray(o.veto_gates))
    return null

  const key_strengths = Array.isArray(o.key_strengths)
    ? o.key_strengths.filter((x): x is string => typeof x === 'string')
    : []

  return {
    meta: meta as LeaderboardEvaluationPayload['meta'],
    final: o.final as LeaderboardEvaluationPayload['final'],
    static_score: o.static_score as LeaderboardEvaluationPayload['static_score'],
    dynamic_score: o.dynamic_score as LeaderboardEvaluationPayload['dynamic_score'],
    veto_gates: o.veto_gates as LeaderboardEvaluationPayload['veto_gates'],
    key_strengths,
    ...(o.recommendations !== undefined ? { recommendations: o.recommendations } : {})
  }
}
