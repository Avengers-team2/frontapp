"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalysisInsights } from "@/api/analysis/analysis.api";
import type { AnalysisInsights } from "@/types/analysis-insights";

export type InsightsState = {
  data?: AnalysisInsights;
  isLoading: boolean;
  failed: boolean; // 불러오지 못함. 이 영역만 숨기고 분석 결과 화면은 그대로 둔다 (503 모델 로드 실패, 422 미지원 업종 등)
};

// 추가 정보를 따로 불러온다. 처음엔 7초쯤 걸리므로 점수 화면을 먼저 그리고 이 영역은 스켈레톤을 보여준다.
// 점수 결과가 먼저 도착한 뒤(enabled)에 부르고, 같은 분석은 서버가 저장해서 두 번째부터 빠르다.
export function useAnalysisInsights(inputId: string, enabled: boolean): InsightsState {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analysisInsights", inputId],
    queryFn: () => getAnalysisInsights(inputId),
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
  return { data, isLoading: enabled && isLoading, failed: isError };
}
