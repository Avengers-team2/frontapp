"use client";

import { useEffect, useState } from "react";
import type { AnalysisStep } from "@/types/analysis-result";
import { PRE_STARTUP_MOCK } from "./preStartupResult.mock";

// 백엔드 연동 전 임시 진행 상태. 각 단계가 끝나는 시점(ms)을 기준으로 stage가 올라간다.
const STEP_DEFS: Omit<AnalysisStep, "status">[] = [
  { id: "input", title: "입력 조건 확인", description: "신사동 · 커피 전문점 조건을 확인했어요." },
  { id: "data", title: "상권 데이터 확인 및 분석", description: "선택한 지역과 업종의 데이터를 확인하고 있어요." },
  { id: "result", title: "결과 정리", description: "분석이 끝나면 결과를 보여드려요." },
];
const STAGE_DONE_AT_MS = [800, 3500, 5000];

export function useMockAnalysisProgress() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = STAGE_DONE_AT_MS.map((ms, i) =>
      setTimeout(() => setStage(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const isPending = stage < STEP_DEFS.length;

  const steps: AnalysisStep[] = STEP_DEFS.map((def, i) => ({
    ...def,
    status: i < stage ? "done" : i === stage ? "running" : "waiting",
  }));

  return {
    isPending,
    steps,
    result: isPending ? null : PRE_STARTUP_MOCK,
  };
}
