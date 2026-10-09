import { http } from 'msw'
import { useCaseFullSessions, useCaseReplayIndex, useCaseSessions } from '../fixtures'
import { json, missing } from './shared'

/** Serve the existing replay API contract without requiring generated files on disk. */
export const useCaseHandlers = (origin: string) => [
  http.get(`${origin}/api/v1/open-science/use-cases`, () => json(useCaseReplayIndex)),
  http.get(`${origin}/api/v1/open-science/use-cases/:slug/transcript/full`, ({ params }) => {
    const session = useCaseFullSessions.find((item) => item.slug === params.slug)
    return session ? json(session) : missing()
  }),
  http.get(`${origin}/api/v1/open-science/use-cases/:slug/transcript`, ({ params }) => {
    const session = useCaseSessions.find((item) => item.slug === params.slug)
    return session ? json(session) : missing()
  }),
  http.get(`${origin}/api/v1/open-science/use-cases/:slug`, ({ params }) => {
    const session = useCaseSessions.find((item) => item.slug === params.slug)
    return session
      ? json({
          slug: session.slug,
          title: session.title,
          exportedAt: session.exportedAt,
          figureCount: 0
        })
      : missing()
  })
]
