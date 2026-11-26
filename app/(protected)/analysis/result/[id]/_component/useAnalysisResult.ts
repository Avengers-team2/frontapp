"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, runAnalysis } from "@/api/analysis/analysis.api";
import { toLoginHref } from "@/lib/loginRedirect";
import type { Analysis } from "@/types/analysis";
import type { AnalysisStep } from "@/types/analysis-result";
import { toPreStartupView } from "./analysisResult.mapper";

const UNSUPPORTED_MSG = "지원하지 않는 업종이거나 예측 데이터가 없는 조합이에요";

// 개발 모드(strict mode)에서 같은 id 로 두 번 실행되지 않게 진행 중인 요청을 공유한다
const inflight = new Map<string, Promise<Analysis>>();

function runOnce(id: string) {
  let p = inflight.get(id);
  if (!p) {
    p = runAnalysis(id).finally(() => inflight.delete(id));
    inflight.set(id, p);
  }
  return p;
}

// 존재하지 않는 상권·업종 코드(invalidInput)면 서버가 400 + "존재하지 않는 …" 문구로 답한다
function isInvalidInput(err: unknown): boolean {
  return err instanceof ApiError && err.status === 400 && typeof err.message === "string" && err.message.includes("존재하지 않는");
}

// 422 는 서버가 detail 문구를 준다. 문자열이 아니면 기본 문구를 쓴다.
function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 422) {
      return typeof err.message === "string" && err.message && !err.message.includes("[object")
        ? err.message
        : UNSUPPORTED_MSG;
    }
    return err.message || "분석 결과를 불러오지 못했어요.";
  }
  return err instanceof Error ? err.message : "분석 결과를 불러오지 못했어요.";
}

// 열릴 때 분석을 실행하고(저장된 결과가 있으면 서버가 재사용), 응답을 화면용으로 바꿔 돌려준다.
export function useAnalysisResult(id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaName = searchParams.get("areaName");
  const industry = searchParams.get("industry");

  const [raw, setRaw] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false); // 존재하지 않는 상권 또는 업종
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let alive = true;
    runOnce(id)
      .then((data) => {
        if (!alive) return;
        setRaw(data);
        setIsPending(false);
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push(toLoginHref());
          return;
        }
        if (isInvalidInput(err)) setInvalid(true);
        else setError(toMessage(err));
        setIsPending(false);
      });
    return () => {
      alive = false;
    };
  }, [id, router]);

  const steps: AnalysisStep[] = [
    { id: "input", title: "입력 조건 확인", description: "입력한 조건을 확인했어요.", status: "done" },
    {
      id: "data",
      title: "상권 데이터 확인 및 분석",
      description: "선택한 지역과 업종의 데이터를 분석하고 있어요.",
      status: isPending ? "running" : "done",
    },
    {
      id: "result",
      title: "결과 정리",
      description: "분석이 끝나면 결과를 보여드려요.",
      status: isPending ? "waiting" : "done",
    },
  ];

  const result = useMemo(
    () => (raw ? toPreStartupView(raw, { areaName, industry }) : null),
    [raw, areaName, industry],
  );

  return { isPending, steps, result, error, invalid };
}
