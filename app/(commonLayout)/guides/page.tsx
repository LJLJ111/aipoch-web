import { redirect } from 'next/navigation'
import { getAllGuides } from '@/lib/guides'

export default async function GuidesIndexPage() {
  const guides = await getAllGuides()

  if (guides.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p>No guides found</p>
      </div>
    )
  }

  redirect(`/guides/${guides[0].slug}`)
}
