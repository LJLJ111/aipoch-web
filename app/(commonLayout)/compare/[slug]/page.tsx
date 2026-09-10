import type { Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'
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
  const seo = loaded?.seo

  return {
    title: seo?.title || 'Skill Comparison | AIPOCH',
    description: seo?.description || 'Compare AIPOCH skill evaluation results.',
    keywords: seo?.keywords
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
