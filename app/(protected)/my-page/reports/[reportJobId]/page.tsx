export default async function ReportsPage({ params }: { params: Promise<{ reportJobId: string }> }) {
  const { reportJobId } = await params;
  return <div>마이페이지 · 기획서 검토 · PDF 다운로드 {reportJobId}</div>;
}
