"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalysisPending from "./AnalysisPending";
import { useAnalysisInsights } from "./useAnalysisInsights";
import { useAreaStores } from "./useAreaStores";
import MapContainer from "./MapContainer";
import PreStartupResult from "./result/PreStartupResult";
import { useAnalysisResult } from "./useAnalysisResult";
import "../../../../../../keyframes/analysis-result.keyframe.css";


export default function ResultContainer({ id }: { id: string }) {
  const router = useRouter();
  const { isPending, steps, result, error, invalid } = useAnalysisResult(id);

  // 선택 업종의 점포 (지도 마커 + 경쟁 현황 카드). 분석 결과를 기다리지 않고, 업종 코드를 알게 되면 바로 부른다.
  // 점포를 못 불러와도 분석 결과 화면은 막지 않는다.
  const searchParams = useSearchParams();
  const stores = useAreaStores(searchParams.get("area"), result?.industryCode, searchParams.get("brand"));

  // 추가 정보(업종 순위, 매출 추세, 다른 업종 추천, 상권 비교, 프랜차이즈 비중). 점수 결과가 먼저 나온 뒤 따로 불러온다.
  const insights = useAnalysisInsights(id, !!result);

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
        <MapContainer stores={stores} />
      </div>

      {/* 분석창 영역 */}
      <div className={`absolute bottom-4 right-4 top-25 flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-xl lg:w-[480px] ${
          isPending ? "pointer-events-none blur-sm" : ""
        }`}
      >
        <div
          // 기본스크롤 설정
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
        >
          {result ? (
            <PreStartupResult result={result} stores={stores} insights={insights} />
          ) : invalid ? (
            <div className="space-y-4 py-10 text-center">
              <p className="text-base font-bold text-ink-900">존재하지 않는 상권 또는 업종입니다</p>
              <p className="text-sm text-ink-500">선택한 조건을 다시 확인해 주세요.</p>
              <button
                type="button"
                onClick={() => router.push("/analysis")}
                className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-surface"
              >
                선택 화면으로 돌아가기
              </button>
            </div>
          ) : error ? (
            <p className="text-sm font-medium text-danger">{error}</p>
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
