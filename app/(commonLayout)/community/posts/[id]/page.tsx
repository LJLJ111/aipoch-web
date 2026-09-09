import { PostDetail } from '../../components/post-detail'

interface CommunityPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { id } = await params
  return <PostDetail postId={id} />
}
