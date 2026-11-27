"use client"

import { useEffect, useState } from "react";
import { FIT } from "../_lib/fit";
import { getReportResult, isWeak, type ReportResult } from "../_lib/reportExport";
import Reveal from "../_components/Reveal";
import ScoreGauge from "../_components/ScoreGauge";
import ScoreCards from "../_components/ScoreCards";
import ReportViewer from "../_components/ReportViewer";
import FixList from "../_components/FixList";
import ReportError from "../_components/ReportError";

type Props = {
    jobId: number | null;
    failed?: boolean;
};

type Tab = "original" | "report";

export default function ReportExport({ jobId, failed = false }: Props) {
    const [state, setState] = useState<"loading" | "done" | "error">("loading");
    const [data, setData] = useState<ReportResult | null>(null);
    const [tab, setTab] = useState<Tab>("report");

    useEffect(() => {
    if (failed) {
        setState("error");
        return;
    }
    let alive = true;
    getReportResult(jobId)
        .then((res) => {
            if (!alive) return;
            setData(res);
            setState("done");
        })
        .catch(() => alive && setState("error"));
    return () => {
        alive = false;
    };
}, [jobId, failed]);

    const weakItems = data ? data.items.filter((item) => isWeak(item.score)) : [];

    return (
        // pt: 헤더 높이 (업로드 화면과 동일)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                {state === "error" && <ReportError jobId={jobId} />}

                {state === "loading" && (
                    <div className="flex flex-col items-center justify-center h-[800px]">
                        <span className="w-[40px] h-[40px] rounded-full border-[3px] border-[#2bb3a3]/20 border-t-[#2bb3a3] animate-spin" />
                        <p className="mt-[20px] text-[19px] text-[#6b6b6b]">검토 결과를 불러오고 있어요</p>
                    </div>
                )}

                {state === "done" && data && (
                    <div className="w-[1440px] mx-auto pt-[109px] pb-[258px]">
                        {/* 페이지 제목 */}
                        <Reveal>
                            <h1 className="text-center text-[48px] font-bold leading-[1.3] text-[#111]">기획서 검토 결과</h1>
                            <p className="mt-[19px] text-center text-[19px] leading-[1.5] text-[#6b6b6b]">
                                AI 심사위원 관점으로 {data.items.length}개 항목을 평가했어요.
                            </p>
                        </Reveal>
                        <div className="mt-[101px] h-[1.2px] bg-[#e6ebf1]" />

                        {/* 분석 완료 */}
                        <Reveal delay={200} className="mt-[45px] text-center">
                            <p className="text-[36px] font-bold text-[#1a3b71]">[{data.fileName}]</p>
                            <p className="mt-[25px] text-[48px] font-bold text-[#1a3b71]">분석 완료 !</p>
                            <p className="mt-[38px] text-[19px] text-[#6b6b6b]">
                                {data.items.length}개 항목 · 항목별 100점 기준
                            </p>
                        </Reveal>

                        {/* 종합 점수 게이지 (화면에 들어오면 스스로 떠오름) */}
                        <div className="mt-[94px]">
                            <ScoreGauge score={data.total} grade={data.totalGrade} />
                        </div>

                        {/* 보완할 항목 안내 */}
                        <Reveal delay={300} className="mt-[-5px] flex items-center justify-center gap-[16px]">
                            {weakItems.length > 0 ? (
                                <>
                                    <span className="h-[44px] px-[20px] flex items-center rounded-full bg-[#fff4df] text-[18px] font-bold text-[#b9770e]">
                                        보완할 항목 {weakItems.length}개
                                    </span>
                                    <span className="text-[18px] text-[#5b6577]">
                                        {weakItems.map((item) => item.name).join(", ")}을 먼저 보완해 보세요.
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="h-[44px] px-[20px] flex items-center rounded-full bg-[#e6f8f5] text-[18px] font-bold text-[#0b7468]">
                                        보완할 항목 없음
                                    </span>
                                    <span className="text-[18px] text-[#5b6577]">모든 항목이 기준 점수를 넘었어요.</span>
                                </>
                            )}
                        </Reveal>

                        {/* 항목별 점수 카드 (화면에 들어오면 하나씩 떠오름) */}
                        <div className="mt-[36px]">
                            <ScoreCards items={data.items} />
                        </div>

                        {/* 탭 + 보고서 + 보완할 점 */}
                        <Reveal className="mt-[160px]">
                            <div className="flex gap-[58px] border-b border-[#dde3ea]">
                                {[
                                    { key: "original" as Tab, label: "원본 기획서" },
                                    { key: "report" as Tab, label: "검토 보고서" },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setTab(t.key)}
                                        className={`relative pb-[14px] text-[18px] font-semibold cursor-pointer transition-colors ${
                                            tab === t.key ? "text-[#111]" : "text-[#6b6b6b] hover:text-[#111]"
                                        }`}
                                    >
                                        {t.label}
                                        <span
                                            className={`absolute left-0 right-0 bottom-[-2px] h-[3px] rounded-[2px] bg-[#13284a] transition-transform duration-300 origin-left ${
                                                tab === t.key ? "scale-x-100" : "scale-x-0"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="mt-[42px] flex gap-[66px]">
                                <ReportViewer data={data} tab={tab} />
                                <FixList fixes={data.fixes} />
                            </div>
                        </Reveal>
                    </div>
                )}
            </section>
        </div>
    );
}