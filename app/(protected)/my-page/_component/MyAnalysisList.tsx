"use client"

import ErrorComponent from "@/components/common/ErrorComponent";
import Loading from "@/components/common/Loading";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMyAnalysesApi } from "../_lib/myAnalysis.api";
import MyPageListHeader from "./MyPageListHeader";

// 내 분석 (저장한 분석 목록) — 체크한 2곳 비교하기
export default function MyAnalysisList() {
    const [keyword, setKeyword] = useState("");
    const [checkedIds, setCheckedIds] = useState<number[]>([]);

    // 내 분석 목록 (GET /analyses/me, 최근 10개까지만 옴 / 점수·저장일은 아직 응답에 없음)
    const { data, isLoading, error } = useQuery({
        queryKey: ["myAnalyses"],
        queryFn: getMyAnalysesApi,
    });
    const analyses = (data?.data ?? []).filter((a) => a.label.includes(keyword) || a.summary.includes(keyword));

    // 체크 / 체크 해제 (최대 2곳)
    const toggleCheck = (id: number) => {
        setCheckedIds((prev) => {
            if (prev.includes(id)) return prev.filter((v) => v !== id);
            if (prev.length >= 2) return prev; // 비교는 2곳까지
            return [...prev, id];
        });
    }

    // TODO: 비교 페이지가 생기면 이동 (분석 결과 쪽 담당)
    const handleCompareClick = () => {
        window.alert("비교 페이지는 준비 중이에요.");
    }

    return (
        <section>
            <MyPageListHeader total={analyses.length} placeholder="저장한 분석을 검색해 주세요" onSearch={setKeyword} />

            <div className="mt-6 h-0.5 bg-sub" />

            {isLoading ? (
                <Loading />
            ) : error ? (
                <ErrorComponent />
            ) : analyses.length === 0 ? (
                <p className="py-20 text-center text-lg text-ink-300">저장한 분석이 없어요.</p>
            ) : (
            <ul>
                {analyses.map((analysis) => {
                    const isChecked = checkedIds.includes(analysis.input_id);
                    return (
                        <li key={analysis.input_id} className="flex items-center justify-between border-b border-line-light py-6 pl-4.5 pr-7.5">
                            <label className="flex cursor-pointer items-center gap-5">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCheck(analysis.input_id)}
                                    className="sr-only"
                                />
                                {isChecked ? (
                                    <span className="flex size-5.5 items-center justify-center rounded-md bg-main-dark text-sm font-bold text-white">✓</span>
                                ) : (
                                    <span className="size-5.5 rounded-md border-[1.5px] border-[#C9D2DC] bg-white" />
                                )}
                                <span className="text-xl font-medium text-ink-900">{analysis.label}</span>
                            </label>
                            <span className="text-base text-ink-300">{analysis.summary}</span>
                        </li>
                    );
                })}
            </ul>
            )}

            <div className="mt-7 flex items-center justify-between">
                <p className="text-lg leading-[1.6] text-ink-200">삭제하면 저장한 분석이 사라져요. 삭제 전에 대상을 다시 확인해 주세요.</p>
                <button
                    type="button"
                    onClick={handleCompareClick}
                    disabled={checkedIds.length !== 2}
                    className="flex h-14 items-center whitespace-pre rounded-full bg-linear-to-r from-main-dark via-[#1D5466] via-55% to-sub px-7.5 text-[19px] font-bold text-white disabled:opacity-40"
                >
                    {`선택한 ${checkedIds.length}곳 비교하기  →`}
                </button>
            </div>
        </section>
    );
}
