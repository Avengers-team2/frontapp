export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>게시판 · 글 수정 {id}</div>;
}
