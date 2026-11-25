"use client"

import { getMyReportJobsApi, getReportExportUrlApi } from "@/api/report/report.api";
import ErrorComponent from "@/components/common/ErrorComponent";
import Loading from "@/components/common/Loading";
import { ReportJobStatus } from "@/types/report";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Pagination from "../../posts/_component/Pagination";
import MyPageListHeader from "./MyPageListHeader";
import MyPageToast from "./MyPageToast";
import useToast from "./useToast";

const PAGE_SIZE = 10;

// 처리 상태 배지 (완료·실패 외 진행 단계는 모두 "처리 중")
const STATUS_DONE = { label: "완료", className: "bg-sub-50 text-sub-700" };
const STATUS_PROCESSING = { label: "처리 중", className: "bg-surface text-ink-500" };
const STATUS_FAILED = { label: "실패", className: "bg-[#FEEDED] text-[#C02D2D]" };

const getStatusStyle = (status: ReportJobStatus) => {
    if (status === "COMPLETED") return STATUS_DONE;
    if (status === "FAILED") return STATUS_FAILED;
    return STATUS_PROCESSING;
}

// 날짜 → "2026-11-04" 형식
const formatDate = (value: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

// 기획서 검토 목록 (GET /reports/jobs) — 완료된 것만 PDF 다운로드
export default function MyReportList() {
    const [page, setPage] = useState(1);
    const { message, showToast } = useToast();

    const { data, isLoading, error } = useQuery({
        queryKey: ["myReportJobs", page],
        queryFn: () => getMyReportJobsApi(page, PAGE_SIZE),
        placeholderData: keepPreviousData
    });

    const pageData = data?.data;
    const reports = pageData?.items ?? [];

    // TODO: /reports/jobs에 keyword가 생기면 검색 연결 (희수에게 요청 예정)
    const handleSearch = () => {}

    // PDF 다운로드: 링크 발급(GET /reports/jobs/{id}/export) → 그 주소로 이동하면 바로 내려받기
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const handleDownloadClick = async (reportJobId: number) => {
        setDownloadingId(reportJobId);
        try {
            const res = await getReportExportUrlApi(reportJobId);
            const url = res.data?.downloadUrl;
            if (!url) throw new Error("다운로드 주소를 받지 못했어요.");
            window.location.href = url; // S3가 attachment로 내려줘서 페이지 이동 없이 파일만 받아짐
            showToast("검토 보고서를 내려받았어요");
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "검토 보고서를 내려받지 못했어요.");
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <section>
            <MyPageToast message={message} />
            <MyPageListHeader total={pageData?.total_count ?? 0} placeholder="검토한 기획서를 검색해 주세요" onSearch={handleSearch} />

            <div className="mt-6 h-0.5 bg-sub" />

            {isLoading ? (
                <Loading />
            ) : error ? (
                <ErrorComponent />
            ) : reports.length === 0 ? (
                <p className="py-20 text-center text-lg text-ink-300">검토한 기획서가 없어요.</p>
            ) : (
                <ul>
                    {reports.map((report) => {
                        const status = getStatusStyle(report.reportJobStatus);
                        return (
                            <li key={report.reportJobId} className="flex items-center justify-between border-b border-line-light py-6 pl-4.5 pr-7.5">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-9 items-center rounded-full bg-surface px-4 text-base font-medium text-ink-500">{report.reportJobFileType.toUpperCase()}</span>
                                    <span className="text-xl font-medium text-ink-900">{report.reportJobFileName}</span>
                                    <span className={`flex h-7.5 items-center rounded-full px-2.5 text-[15px] font-bold ${status.className}`}>{status.label}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                    {report.reportJobStatus === "COMPLETED" && (
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadClick(report.reportJobId)}
                                            disabled={downloadingId === report.reportJobId}
                                            className="flex h-10 items-center rounded-full border border-line bg-white px-4 text-base font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)] disabled:opacity-40"
                                        >
                                            {downloadingId === report.reportJobId ? "준비 중..." : "PDF 다운로드"}
                                        </button>
                                    )}
                                    <span className="text-base text-ink-300">{formatDate(report.reportJobCreatedAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Pagination page={page} totalPages={pageData?.total_pages} onPageChange={setPage} />

            <p className="mt-7 text-lg leading-[1.6] text-ink-200">검토 보고서는 처리 상태가 완료인 기획서만 PDF로 다시 내려받을 수 있어요.</p>
        </section>
    );
}
