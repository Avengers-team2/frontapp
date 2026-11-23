"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AnalysisPending from "./AnalysisPending";
import MapContainer from "./MapContainer";
import PreStartupResult from "./result/PreStartupResult";
import { useMockAnalysisProgress } from "./useMockAnalysisProgress";
import "../../../../../../keyframes/analysis-result.keyframe.css";


export default function ResultContainer() {
  const router = useRouter();
  const { isPending, steps, result } = useMockAnalysisProgress();

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {html.style.overflow = prev;};
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-20 overflow-hidden bg-bg">
      {/* 지도 컴포넌트 */}
      <div className={`absolute inset-0 ${isPending ? "pointer-events-none blur-sm" : ""}`}>
        <MapContainer />
      </div>

      {/* 분석창 영역 */}
      <div className={`absolute bottom-4 right-4 top-25 flex w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white shadow-xl lg:w-[480px] ${
          isPending ? "pointer-events-none blur-sm" : ""
        }`}
      >
        <div
          // 기본스크롤 설정
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
        >
          {result ? (
            <PreStartupResult result={result} />
          ) : (
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded bg-surface" />
              <div className="h-4 w-full rounded bg-surface" />
              <div className="h-40 w-full rounded-xl bg-surface" />
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <AnalysisPending steps={steps} onCancel={() => router.push("/analysis")} />
      )}
    </div>
  );
}
