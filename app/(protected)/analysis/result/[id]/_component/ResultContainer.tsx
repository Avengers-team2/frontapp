"use client";

import { useRouter } from "next/navigation";
import AnalysisPending from "./AnalysisPending";
import MapPlaceholder from "./MapPlaceholder";
import PreStartupResult from "./result/PreStartupResult";
import { useMockAnalysisProgress } from "./useMockAnalysisProgress";

// 결과 레이아웃: 왼쪽 지도, 오른쪽 상세 패널.
// 분석 중에는 같은 레이아웃을 흐리게 깔고 AnalysisPending 모달을 위에 띄운다.
export default function ResultContainer() {
  const router = useRouter();
  const { isPending, steps, result } = useMockAnalysisProgress();

  return (
    <div className="relative min-h-screen bg-bg">
      <div
        className={`flex flex-col gap-6 p-4 lg:flex-row lg:p-8 ${
          isPending ? "pointer-events-none blur-sm" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <MapPlaceholder />
        </div>

        <aside className="w-full rounded-2xl bg-white p-6 shadow-sm lg:w-[480px] lg:shrink-0">
          {result ? (
            <PreStartupResult result={result} />
          ) : (
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded bg-surface" />
              <div className="h-4 w-full rounded bg-surface" />
              <div className="h-40 w-full rounded-xl bg-surface" />
            </div>
          )}
        </aside>
      </div>

      {isPending && (
        <AnalysisPending steps={steps} onCancel={() => router.push("/analysis")} />
      )}
    </div>
  );
}
