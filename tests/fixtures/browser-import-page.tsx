import { createRoot } from 'react-dom/client'
import { ImportComposer } from '../../app/(commonLayout)/open-science/use-cases/_components/import-composer'
import {
  ScienceImportButton,
  ScienceImportFeedback,
  ScienceImportProvider
} from '../../app/(commonLayout)/open-science/use-cases/_components/science-import-controls'

const root = createRoot(document.getElementById('root') as HTMLElement)
const packageInfo = {
  url: '/download.science',
  importUrl: '/package.science',
  filename: 'test.science',
  sizeBytes: new URLSearchParams(window.location.search).has('unknownSize') ? 0 : 64 * 1024,
  sha256: ''
}
root.render(
  window.location.pathname === '/detail' ? (
    <ScienceImportProvider packageInfo={packageInfo}>
      <section aria-label="Research actions">
        <ScienceImportButton variant="detail" />
        <ScienceImportFeedback />
      </section>
      <p>Research findings between the two entry points.</p>
      <section aria-label="Research actions">
        <ScienceImportButton variant="detail" />
        <ScienceImportFeedback />
      </section>
    </ScienceImportProvider>
  ) : (
    <ScienceImportProvider packageInfo={packageInfo}>
      <section aria-label="Replay import actions">
        <ScienceImportButton variant="toolbar" />
        <ScienceImportFeedback compact />
      </section>
      <ImportComposer />
    </ScienceImportProvider>
  )
)
Object.assign(window, { unmountImport: () => root.unmount() })
