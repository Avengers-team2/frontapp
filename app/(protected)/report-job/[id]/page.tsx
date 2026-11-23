import { Suspense } from "react";

interface Params {
  params: Promise<{ id: string }>;
}

// params는 여기서 await 하지 않고 Suspense 안쪽 컴포넌트에서 꺼낸다 (cacheComponents Blocking Route 방지)
export default function ReportJobPage({ params }: Params) {
  return (
    <Suspense fallback={null}>
      <ReportJobContent params={params} />
    </Suspense>
  );
}

async function ReportJobContent({ params }: Params) {
  const { id } = await params;
  return <div>report-job · 검토 결과 {id}</div>;
}
