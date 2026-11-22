"use client"

import { useState } from "react";
import MyPageListHeader from "./MyPageListHeader";
import MyPageToast from "./MyPageToast";
import { MOCK_REPORTS, ReportStatus } from "./mockData";
import useToast from "./useToast";

// 처리 상태 배지
const STATUS_STYLE: Record<ReportStatus, { label: string; className: string }> = {
    DONE: { label: "완료", className: "bg-sub-50 text-sub-700" },
    PROCESSING: { label: "처리 중", className: "bg-surface text-ink-500" },
    FAILED: { label: "실패", className: "bg-[#FEEDED] text-[#C02D2D]" },
};

// 기획서 검토 목록 — 완료된 것만 PDF 다운로드
export default function MyReportList() {
    const [keyword, setKeyword] = useState("");
    const { message, showToast } = useToast();

    // TODO: 기획서 검토 목록 API 연결 전이라 가짜 데이터에서 검색
    const reports = MOCK_REPORTS.filter((r) => r.file_name.includes(keyword));

    // TODO: report_export 다운로드 API 연결
    const handleDownloadClick = () => {
        showToast("검토 보고서를 내려받았어요");
    }

    return (
        <section>
            <MyPageToast message={message} />
            <MyPageListHeader total={reports.length} placeholder="검토한 기획서를 검색해 주세요" onSearch={setKeyword} />

            <div className="mt-6 h-0.5 bg-sub" />

            <ul>
                {reports.map((report) => {
                    const status = STATUS_STYLE[report.status];
                    return (
                        <li key={report.report_job_id} className="flex items-center justify-between border-b border-line-light py-6 pl-4.5 pr-7.5">
                            <div className="flex items-center gap-4">
                                <span className="flex h-9 items-center rounded-full bg-surface px-4 text-base font-medium text-ink-500">{report.file_type}</span>
                                <span className="text-xl font-medium text-ink-900">{report.file_name}</span>
                                <span className={`flex h-7.5 items-center rounded-full px-2.5 text-[15px] font-bold ${status.className}`}>{status.label}</span>
                            </div>
                            <div className="flex items-center gap-8">
                                {report.status === "DONE" && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadClick}
                                        className="flex h-10 items-center rounded-full border border-line bg-white px-4 text-base font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                                    >
                                        PDF 다운로드
                                    </button>
                                )}
                                <span className="text-base text-ink-300">{report.created_at}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="mt-7 text-lg leading-[1.6] text-ink-200">검토 보고서는 처리 상태가 완료인 기획서만 PDF로 다시 내려받을 수 있어요.</p>
        </section>
    );
}
