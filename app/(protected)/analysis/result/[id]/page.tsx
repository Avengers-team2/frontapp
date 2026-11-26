import { Suspense } from "react";
import ResultContainer from "./_component/ResultContainer";

interface Params {
  params: Promise<{ id: string }>;
}

// params는 여기서 await 하지 않고 Suspense 안쪽 컴포넌트에서 꺼낸다 (cacheComponents Blocking Route 방지)
export default function ResultPage({ params }: Params) {
  return (
    <Suspense fallback={null}>
      <ResultLoader params={params} />
    </Suspense>
  );
}

async function ResultLoader({ params }: Params) {
  const { id } = await params;
  // id가 바뀌면 상태를 새로 시작하도록 key를 준다. 실제 조회 연동 시 이 값을 사용한다.
  return <ResultContainer key={id} id={id} />;
}
