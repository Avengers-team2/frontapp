"use client"

import { getMyAnalysesApi } from "@/app/(protected)/my-page/_lib/myAnalysis.api";
import { useQuery } from "@tanstack/react-query";

interface AnalysisAttachSelectProps {
    selectedId: number | null;
    onSelect: (analysisId: number | null) => void;
}

// 분석 결과 첨부 (선택) — 내 분석 목록(GET /analyses/me) 중 하나 고르기
// TODO: 게시글에 분석을 연결할 백엔드 컬럼이 생기면 선택값(input_id)을 글 작성 요청에 넣기
export default function AnalysisAttachSelect({selectedId, onSelect}: AnalysisAttachSelectProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["myAnalyses"],
        queryFn: getMyAnalysesApi,
    });
    const analyses = data?.data ?? [];

    return (
        <div>
            <p className="text-base font-bold text-ink-900">분석 결과 첨부 (선택)</p>

            <div className="mt-2.75 flex flex-col gap-2.75">
                {isLoading && <p className="text-base text-ink-300">불러오는 중...</p>}
                {!isLoading && analyses.length === 0 && (
                    <p className="text-base text-ink-300">아직 저장한 분석이 없어요.</p>
                )}
                {analyses.map((analysis) => {
                    const isSelected = selectedId === analysis.input_id;
                    return (
                        <button
                            key={analysis.input_id}
                            type="button"
                            onClick={() => onSelect(isSelected ? null : analysis.input_id)}
                            className={`flex w-full items-center justify-between rounded-xl border bg-white px-5 py-4 text-left ${
                                isSelected ? "border-[#CFE9E4]" : "border-line-light"
                            }`}
                        >
                            <span className="flex items-center gap-3.5">
                                {isSelected ? (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-sub">
                                        <span className="size-2 rounded-full bg-ink-900" />
                                    </span>
                                ) : (
                                    <span className="size-5 rounded-full border-[1.5px] border-main" />
                                )}
                                <span className="whitespace-pre text-base font-medium text-ink-900">{analysis.label}</span>
                            </span>
                            <span className="text-base text-ink-300">{analysis.summary}</span>
                        </button>
                    );
                })}
                <p className="text-base text-ink-300">마이페이지에 저장한 분석 결과만 첨부할 수 있어요.</p>
            </div>
        </div>
    );
}
