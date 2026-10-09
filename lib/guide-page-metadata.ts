import { commonLayoutLastModified } from './common-layout-metadata'

export const GUIDE_LAYOUT_LAST_MODIFIED = '2026-10-08'

export function guidePageLastModified(contentDate?: string | null): string {
  const content = commonLayoutLastModified(contentDate)
  return Date.parse(content) > Date.parse(GUIDE_LAYOUT_LAST_MODIFIED)
    ? content
    : GUIDE_LAYOUT_LAST_MODIFIED
}
