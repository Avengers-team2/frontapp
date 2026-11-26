"use client"

import { getMyPostsApi } from "@/api/post/post.api";
import { getMyReportJobsApi, getReportExportUrlApi } from "@/api/report/report.api";
import { PostCategoryLabel } from "@/enums/post.enum";
import { ReportJobStatus } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { getMyAnalysesApi } from "../_lib/myAnalysis.api";
import { getMySupportBookmarksApi, MY_SUPPORT_BOOKMARKS_QUERY_KEY } from "../_lib/myBookmark.api";
import MyPageToast from "./MyPageToast";
import useToast from "./useToast";

const PREVIEW_SIZE = 3; // 섹션마다 미리 보여줄 개수

// 날짜 → "2026-11-04" 형식
const formatDate = (value: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

// 기획서 처리 상태 배지 (MyReportList와 같은 기준)
const getStatusStyle = (status: ReportJobStatus) => {
    if (status === "COMPLETED") return { label: "완료", className: "bg-sub-50 text-sub-700" };
    if (status === "FAILED") return { label: "실패", className: "bg-[#FEEDED] text-[#C02D2D]" };
    return { label: "처리 중", className: "bg-surface text-ink-500" };
}

const chipClass = "flex h-9 shrink-0 items-center rounded-full bg-surface px-4 text-base font-medium text-ink-500";
const rowClass = "flex items-center justify-between border-b border-line-light py-6 pl-4.5 pr-7.5";

interface OverviewSectionProps {
    title: string;
    moreHref: string;
    isLoading: boolean;
    isError: boolean;
    isEmpty: boolean;
    emptyText: string;
    children: ReactNode;
}

// 섹션 한 덩어리: 제목 + 더보기 > / 청록 선 / 미리보기 목록 (없으면 안내 문구)
function OverviewSection({title, moreHref, isLoading, isError, isEmpty, emptyText, children}: OverviewSectionProps) {
    return (
        <section>
            <div className="flex items-end justify-between pb-3">
                <h2 className="text-[22px] font-bold text-ink-900">{title}</h2>
                <Link href={moreHref} className="text-base text-ink-400 hover:text-ink-900">더보기 &gt;</Link>
            </div>
            <div className="h-0.5 bg-sub" />
            {isLoading ? (
                <p className="border-b border-line-light py-14 text-center text-lg text-ink-300">불러오는 중...</p>
            ) : isError ? (
                <p className="border-b border-line-light py-14 text-center text-lg text-ink-300">목록을 불러오지 못했어요.</p>
            ) : isEmpty ? (
                <p className="border-b border-line-light py-14 text-center text-lg text-ink-300">{emptyText}</p>
            ) : (
                <ul>{children}</ul>
            )}
        </section>
    );
}

// 마이페이지 · 내 정보 — 내 분석 / 관심 지원사업 / 내가 쓴 글 / 기획서 검토 미리보기
export default function MyPageOverview() {
    const { message, showToast } = useToast();

    // 내 분석 (GET /analyses/me) — 프로필 숫자와 같은 queryKey라 한 번만 불러옴
    const analysesQuery = useQuery({
        queryKey: ["myAnalyses"],
        queryFn: getMyAnalysesApi,
    });
    const analyses = (analysesQuery.data?.data ?? []).slice(0, PREVIEW_SIZE);

    // 관심 지원사업 (GET /bookmarks/support/me) — 프로필 숫자와 같은 queryKey
    const bookmarksQuery = useQuery({
        queryKey: [MY_SUPPORT_BOOKMARKS_QUERY_KEY, ""],
        queryFn: () => getMySupportBookmarksApi(""),
        staleTime: 0,
    });
    const bookmarks = (bookmarksQuery.data?.data ?? []).slice(0, PREVIEW_SIZE);

    // 내가 쓴 글 (GET /post/me, 1페이지 3개)
    const postsQuery = useQuery({
        queryKey: ["myPostsPreview"],
        queryFn: () => getMyPostsApi(1, PREVIEW_SIZE),
    });
    const posts = postsQuery.data?.data?.items ?? [];

    // 기획서 검토 (GET /reports/jobs, 1페이지 3개)
    const reportsQuery = useQuery({
        queryKey: ["myReportJobsPreview"],
        queryFn: () => getMyReportJobsApi(1, PREVIEW_SIZE),
    });
    const reports = reportsQuery.data?.data?.items ?? [];

    // PDF 다운로드 (MyReportList와 같은 방식)
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const handleDownloadClick = async (reportJobId: number) => {
        setDownloadingId(reportJobId);
        try {
            const res = await getReportExportUrlApi(reportJobId);
            const url = res.data?.downloadUrl;
            if (!url) throw new Error("다운로드 주소를 받지 못했어요.");
            window.location.href = url;
            showToast("검토 보고서를 내려받았어요");
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "검토 보고서를 내려받지 못했어요.");
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <div className="flex flex-col gap-16">
            <MyPageToast message={message} />

            <OverviewSection
                title="내 분석"
                moreHref="/my-page/analyses"
                isLoading={analysesQuery.isLoading}
                isError={!!analysesQuery.error}
                isEmpty={analyses.length === 0}
                emptyText="저장한 분석이 없어요."
            >
                {analyses.map((analysis) => (
                    <li key={analysis.input_id} className={rowClass}>
                        <span className="truncate text-xl font-medium text-ink-900">{analysis.label}</span>
                        <span className="shrink-0 text-base text-ink-300">{analysis.summary}</span>
                    </li>
                ))}
            </OverviewSection>

            <OverviewSection
                title="관심 지원사업"
                moreHref="/my-page/bookmarks"
                isLoading={bookmarksQuery.isLoading}
                isError={!!bookmarksQuery.error}
                isEmpty={bookmarks.length === 0}
                emptyText="관심 지원사업이 없어요."
            >
                {bookmarks.map((item) => (
                    <li key={item.bookmark_id} className="border-b border-line-light">
                        {item.detail_url ? (
                            <a href={item.detail_url} target="_blank" rel="noopener noreferrer" className={rowClass + " border-b-0"}>
                                <span className="flex min-w-0 items-center gap-4">
                                    {item.category && <span className={chipClass}>{item.category}</span>}
                                    <span className="truncate text-xl font-medium text-ink-900">{item.title}</span>
                                </span>
                                <span className="shrink-0 text-base text-ink-300">{item.end_date ? `마감 ${item.end_date}` : "상시"}</span>
                            </a>
                        ) : (
                            <div className={rowClass + " border-b-0"}>
                                <span className="flex min-w-0 items-center gap-4">
                                    {item.category && <span className={chipClass}>{item.category}</span>}
                                    <span className="truncate text-xl font-medium text-ink-300">{item.title}</span>
                                </span>
                                <span className="shrink-0 text-base text-ink-300">마감</span>
                            </div>
                        )}
                    </li>
                ))}
            </OverviewSection>

            <OverviewSection
                title="내가 쓴 글"
                moreHref="/my-page/posts"
                isLoading={postsQuery.isLoading}
                isError={!!postsQuery.error}
                isEmpty={posts.length === 0}
                emptyText="작성한 글이 없어요."
            >
                {posts.map((post) => (
                    <li key={post.post_id} className="border-b border-line-light">
                        <Link href={`/posts/${post.post_id}`} className={rowClass + " border-b-0"}>
                            <span className="flex min-w-0 items-center gap-4">
                                <span className={chipClass}>{PostCategoryLabel[post.post_category]}</span>
                                <span className="truncate text-xl font-medium text-ink-900">{post.post_title}</span>
                            </span>
                            <span className="shrink-0 text-base text-ink-300">{formatDate(post.post_created_at)}</span>
                        </Link>
                    </li>
                ))}
            </OverviewSection>

            <OverviewSection
                title="기획서 검토"
                moreHref="/my-page/reports"
                isLoading={reportsQuery.isLoading}
                isError={!!reportsQuery.error}
                isEmpty={reports.length === 0}
                emptyText="검토한 기획서가 없어요."
            >
                {reports.map((report) => {
                    const status = getStatusStyle(report.reportJobStatus);
                    return (
                        <li key={report.reportJobId} className={rowClass}>
                            <span className="flex min-w-0 items-center gap-4">
                                <span className={chipClass}>{report.reportJobFileType.toUpperCase()}</span>
                                <span className="truncate text-xl font-medium text-ink-900">{report.reportJobFileName}</span>
                                <span className={`flex h-7.5 shrink-0 items-center rounded-full px-2.5 text-[15px] font-bold ${status.className}`}>{status.label}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-8">
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
                            </span>
                        </li>
                    );
                })}
            </OverviewSection>
        </div>
    );
}
