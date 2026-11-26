import LoginGuard from "@/components/common/LoginGuard";
import { Suspense } from "react";

interface Params {
  params: Promise<{ id: string }>;
}

// params는 여기서 await 하지 않고 Suspense 안쪽 컴포넌트에서 꺼낸다 (cacheComponents Blocking Route 방지)
export default function ReportsPage({ params }: Params) {
  return (
    <LoginGuard>
      <Suspense fallback={null}>
        <ReportsContent params={params} />
      </Suspense>
    </LoginGuard>
  );
}

async function ReportsContent({ params }: Params) {
  const { id } = await params;
  return <div>마이페이지 · 기획서 검토 · PDF 다운로드 {id}</div>;
}
