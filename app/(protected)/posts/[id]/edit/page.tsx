export default async function EditPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return <div>게시판 · 글 수정 {postId}</div>;
}
