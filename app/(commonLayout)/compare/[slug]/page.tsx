import type { Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchCompareDetail } from '@/service/compare'
import { mapCompareDetailToViewModel } from './components/compare-mappers'
import { ComparePageView } from './components/compare-page-view'

async function loadComparePageData(slug: string) {
  try {
    const detail = await fetchCompareDetail(slug)
    if (!detail) {
      return null
    }

    const viewModel = mapCompareDetailToViewModel(detail)

    return {
      seo: detail.seo,
      viewModel
    }
  } catch (error) {
    unstable_rethrow(error)
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadComparePageData(slug)
  const canonical = `${SITE_DOMAIN}/compare/${slug}`

  if (!loaded) {
    return {
      ...createPageMetadata({
        title: 'Skill Comparison | AIPOCH',
        description: 'Compare AIPOCH skill evaluation results.',
        canonical
      }),
      robots: { index: false, follow: false }
    }
  }

  const title = loaded.seo?.title?.trim() || 'Skill Comparison | AIPOCH'
  const description = loaded.seo?.description?.trim() || 'Compare AIPOCH skill evaluation results.'

  return {
    ...createPageMetadata({ title, description, canonical }),
    keywords: loaded.seo?.keywords
  }
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const loaded = await loadComparePageData(slug)
    if (!loaded) notFound()

    return <ComparePageView compare={loaded.viewModel} />
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }
}
