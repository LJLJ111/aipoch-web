import '@/components/landing/landing-effects.css'
import './medflow.css'
import { MedFlowExperience } from './medflow-experience'
import { medFlowMetadata } from './medflow-metadata'

export const metadata = medFlowMetadata

const MedFlowPage = () => {
  return (
    <main
      id="top"
      className="medflow-page min-h-screen overflow-hidden bg-[#E9E9E9] text-[#111111]"
    >
      <MedFlowExperience />
    </main>
  )
}

export default MedFlowPage
