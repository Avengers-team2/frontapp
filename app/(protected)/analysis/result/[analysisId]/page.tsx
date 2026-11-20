export default async function ResultPage({ params }: { params: Promise<{ analysisId: string }> }) {
  const { analysisId } = await params;
  return <div>analysis/result · 분석 결과 {analysisId}</div>;
}
