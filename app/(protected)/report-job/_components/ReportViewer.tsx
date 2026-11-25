"use client";

import { useState } from "react";
import type { ReportResult } from "../_lib/reportExport";
import { ApiError, getReportExportUrl } from "../_lib/reportJob";
import Image from "next/image";

type Props = {
    data: ReportResult;
    tab: "original" | "report";
};

export default function ReportViewer({ data, tab }: Props) {
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    // 백엔드에서 S3 임시 다운로드 주소를 받아 바로 내려받기
    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const { downloadUrl } = await getReportExportUrl(data.jobId);
            // S3 주소가 "첨부파일로 받기"로 설정돼 있어서 이동하면 페이지는 그대로 두고 파일만 내려받아져요
            window.location.href = downloadUrl;
            showToast("✓ 검토 보고서를 내려받았어요");
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                alert("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
            } else {
                alert(e instanceof Error ? e.message : "보고서를 내려받지 못했어요. 잠시 후 다시 시도해 주세요.");
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="w-[885px] shrink-0">
            {/* 다운로드 완료 토스트 */}
            {toast && (
                <div className="fixed top-[120px] left-1/2 -translate-x-1/2 z-[100] px-[28px] py-[16px] rounded-full bg-[#13284a] text-[16px] font-semibold text-white shadow-lg animate-in fade-in duration-300">
                    {toast}
                </div>
            )}
            {/* 상단 파일 바 */}
            <div className="flex items-center justify-between h-[88px] pl-[19px] pr-[50px] border-[1.2px] border-[#cfcfcf] bg-white">
                <div>
                    <p className="text-[19px] font-semibold leading-[1.5] text-[#111]">
                        {tab === "report" ? data.pdf.fileName : data.fileName}
                    </p>
                    <p className="text-[18px] leading-[1.5] text-[#6b6b6b]">
                        {tab === "report" ? `PDF · ${data.pdf.pages}쪽 · ${data.pdf.size}` : "원본 기획서"}
                    </p>
                </div>
                {tab === "report" && (
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="group disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-[8px] h-[56px] px-[26px] rounded-full bg-[#13284a] text-[16px] font-semibold text-white cursor-pointer transition-colors hover:bg-[#1d3a66] active:scale-[0.97]"
                    >
                        {downloading ? "준비 중..." : "PDF 내려받기"}
                        <Image
                            src="/assets/icons/pdf_arrow_icon.svg"
                            alt=""
                            width={18}
                            height={18}
                            unoptimized
                            className="transition-transform duration-300 group-hover:translate-y-[2px]"
                        />
                    </button>
                )}
            </div>

            {/* 종이 영역 */}
            <div className="min-h-[1022px] pt-[66px] pb-[76px] border-[1.2px] border-t-0 border-[#cfcfcf] bg-[#f5f5f5]">
                {tab === "report" ? (
                    <article key="report" className="w-[768px] mx-auto p-[48px] bg-white animate-in fade-in duration-500">
                        <p className="text-[17px] leading-[1.5] text-[#6b6b6b]">StartFit 기획서 AI 검토 보고서</p>
                        <h2 className="mt-[9px] text-[29px] font-bold leading-[1.4] text-[#111]">{data.title}</h2>
                        <p className="mt-[10px] text-[17px] leading-[1.5] text-[#6b6b6b]">
                            검토일 {data.reviewedAt} · {data.items.length}개 항목 · 항목별 100점 기준
                        </p>

                        <h3 className="mt-[26px] text-[20px] font-bold leading-[1.5] text-[#111]">1. 종합 의견</h3>
                        <p className="mt-[7px] text-[19px] leading-[1.7] text-[#2b2b2b]">{data.summary}</p>

                        <h3 className="mt-[34px] text-[20px] font-bold leading-[1.5] text-[#111]">2. 항목별 점수</h3>
                        <ul className="mt-[10px] border-b-[1.2px] border-[#e3e3e3]">
                            {data.items.map((item) => (
                                <li
                                    key={item.name}
                                    className="flex items-center justify-between h-[48px] border-t-[1.2px] border-[#e3e3e3] text-[18px] leading-[1.5]"
                                >
                                    <span className="text-[#2b2b2b]">{item.name}</span>
                                    <span className="font-semibold text-[#111]">{item.score} / 100</span>
                                </li>
                            ))}
                        </ul>

                        <h3 className="mt-[32px] text-[20px] font-bold leading-[1.5] text-[#111]">3. 보완할 점</h3>
                        <ul className="mt-[7px]">
                            {data.fixes.map((fix) => (
                                <li key={fix.item} className="text-[19px] leading-[1.7] text-[#2b2b2b]">
                                    — {fix.item}: {fix.text}
                                </li>
                            ))}
                        </ul>
                    </article>
                ) : data.originalUrl ? (
                    <iframe
                        key="original"
                        src={data.originalUrl}
                        title="원본 기획서"
                        className="block w-[768px] h-[880px] mx-auto bg-white"
                    />
                ) : (
                    <div
                        key="original"
                        className="flex items-center justify-center w-[768px] h-[880px] mx-auto bg-white text-[19px] text-[#6b6b6b] animate-in fade-in duration-500"
                    >
                        원본 기획서 미리보기는 백엔드 연결 후 표시돼요.
                    </div>
                )}
            </div>
        </div>
    );
}