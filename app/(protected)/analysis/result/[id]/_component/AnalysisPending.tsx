"use client";

import { Check, Loader2 } from "lucide-react";
import type { AnalysisStep } from "@/types/analysis-result";

interface AnalysisPendingProps {
  steps: AnalysisStep[];
  onCancel: () => void;
}

// 분석 중 모달. 결과 화면 위에 오버레이로 뜬다. steps의 status 값에 따라 아이콘과 문구가 바뀐다.
export default function AnalysisPending({ steps, onCancel }: AnalysisPendingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-pending-title"
        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sub-50 text-sub-700">
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          </div>
          <div>
            <h2 id="analysis-pending-title" className="text-xl font-bold text-ink-900">
              분석 중이에요
            </h2>
            <p className="text-sm text-ink-500">완료되면 결과 화면으로 넘어가요.</p>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <p className="mb-3 text-sm font-medium text-ink-500">분석 진행 단계</p>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li
                key={step.id}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                  step.status === "running" ? "bg-sub-50" : ""
                }`}
              >
                <StepIcon index={i} status={step.status} />
                <div className="flex-1">
                  <p className="font-bold text-ink-900">{step.title}</p>
                  <p className="text-sm text-ink-500">{step.description}</p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.status === "done"
                      ? "text-ink-500"
                      : step.status === "running"
                        ? "text-sub-700"
                        : "text-ink-300"
                  }`}
                >
                  {step.status === "done" ? "확인됨" : step.status === "running" ? "진행 중" : "대기"}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-8 rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink-700 hover:bg-surface"
        >
          ← 분석 취소 · 이전 페이지로
        </button>
      </div>
    </div>
  );
}

function StepIcon({ index, status }: { index: number; status: AnalysisStep["status"] }) {
  if (status === "done") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-ink-900 text-white">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex size-8 items-center justify-center gap-0.5 rounded-full border-2 border-sub-700 text-sub-700">
        <span className="size-1 rounded-full bg-current animate-[dot-blink_1.2s_linear_infinite]" style={{ animationDelay: "0s" }} />
        <span className="size-1 rounded-full bg-current animate-[dot-blink_1.2s_linear_infinite]" style={{ animationDelay: "-0.8s" }} />
        <span className="size-1 rounded-full bg-current animate-[dot-blink_1.2s_linear_infinite]" style={{ animationDelay: "-0.4s" }} />
      </span>
    );
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-surface text-sm font-bold text-ink-700">
      {index + 1}
    </span>
  );
}
