import type { MetadataRoute } from 'next'

import { SITE_DOMAIN } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${SITE_DOMAIN}/sitemap.xml`
  }
}
