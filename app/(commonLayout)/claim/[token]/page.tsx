import { ClaimForm } from './claim-form'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params

  return <ClaimForm token={token} />
}
