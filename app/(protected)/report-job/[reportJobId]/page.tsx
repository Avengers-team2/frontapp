export default async function ReportJobPage({ params }: { params: Promise<{ reportJobId: string }> }) {
  const { reportJobId } = await params;
  return <div>report-job · 검토 결과 {reportJobId}</div>;
}
