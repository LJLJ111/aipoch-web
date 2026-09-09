import { JsonLd } from '@/components/json-ld'
import { fetchOpenScienceDownloadManifest } from '@/service/open-science-download'
import { OpenScienceCapabilities } from './open-science-capabilities'
import { OpenScienceCommunity } from './open-science-community'
import { OpenScienceFaq } from './open-science-faq'
import { OpenScienceHero } from './open-science-hero'
import { openScienceMetadata } from './open-science-metadata'
import { OpenScienceModels } from './open-science-models'
import { OpenScienceMotion } from './open-science-motion'
import { buildOpenSciencePageGraph } from './open-science-structured-data'
import { OpenScienceWorkflow } from './open-science-workflow'

export const metadata = openScienceMetadata
export const dynamic = 'force-dynamic'

export default async function OpenSciencePage() {
  // Use one release manifest per server request for both Schema and download links.
  const releaseManifest = await fetchOpenScienceDownloadManifest().catch(() => null)

  return (
    <>
      <JsonLd data={buildOpenSciencePageGraph({ releaseManifest })} />
      <OpenScienceMotion>
        <OpenScienceHero releaseManifest={releaseManifest} />
        <OpenScienceWorkflow />
        <OpenScienceCapabilities />
        <OpenScienceModels />
        <OpenScienceFaq />
        <OpenScienceCommunity />
      </OpenScienceMotion>
    </>
  )
}
