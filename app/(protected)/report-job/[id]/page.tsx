export default async function ReportJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>report-job · 검토 결과 {id}</div>;
}
