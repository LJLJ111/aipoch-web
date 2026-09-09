import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

type layoutProps = {
  children: React.ReactNode
}

const commonLayout: React.FC<layoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col pt-[var(--nav-h)]">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default commonLayout
