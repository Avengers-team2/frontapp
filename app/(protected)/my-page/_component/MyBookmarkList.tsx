"use client"

import { bookmarkKey, SUPPORT_BOOKMARKS_QUERY_KEY, toggleSupportBookmark } from "@/api/support/support.api";
import ErrorComponent from "@/components/common/ErrorComponent";
import Loading from "@/components/common/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMySupportBookmarksApi, MY_SUPPORT_BOOKMARKS_QUERY_KEY, MySupportBookmarkItem } from "../_lib/myBookmark.api";
import MyPageListHeader from "./MyPageListHeader";

// 날짜 → "2026.10.19" / 같은 해면 끝 날짜는 "11.12"
const formatDate = (value: string, withYear: boolean) => {
    const [y, m, d] = value.split("-");
    return withYear ? `${y}.${m}.${d}` : `${m}.${d}`;
}

// 기관 · 접수 기간 한 줄 (값이 없는 부분은 빼고)
const toOrgLine = (item: MySupportBookmarkItem) => {
    const parts: string[] = [];
    if (item.organization) parts.push(item.organization);
    if (item.start_date && item.end_date) {
        const sameYear = item.start_date.slice(0, 4) === item.end_date.slice(0, 4);
        parts.push(`접수 ${formatDate(item.start_date, true)} – ${formatDate(item.end_date, !sameYear)}`);
    } else if (item.end_date) {
        parts.push(`마감 ${formatDate(item.end_date, true)}`);
    }
    return parts.join(" · ");
}

// D-day 표시 (마감·정보 없음 / 당일 / 상시)
const toDdayLabel = (item: MySupportBookmarkItem) => {
    if (!item.is_available || (item.dday !== null && item.dday < 0)) return "마감";
    if (item.dday === null) return "상시";
    if (item.dday === 0) return "D-DAY";
    return `D-${item.dday}`;
}

// 관심 지원사업 (지원사업 북마크) 목록 — GET /bookmarks/support/me
export default function MyBookmarkList() {
    const [keyword, setKeyword] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: [MY_SUPPORT_BOOKMARKS_QUERY_KEY, keyword],
        queryFn: () => getMySupportBookmarksApi(keyword),
        staleTime: 0, // 들어올 때마다 새로 불러오기 (지원사업 페이지에서 등록한 것도 바로 보이게)
    });
    const list = data?.data ?? [];

    const [pendingKey, setPendingKey] = useState<string | null>(null);

    // 관심 해제 (POST /bookmarks/support 토글) → 목록·개수 바로 새로 불러와서 목록에서 빠짐
    const toggleBookmark = async (item: MySupportBookmarkItem) => {
        const key = bookmarkKey(item.source, item.source_id);
        setPendingKey(key);
        try {
            await toggleSupportBookmark(item.source, item.source_id);
            await queryClient.invalidateQueries({ queryKey: [MY_SUPPORT_BOOKMARKS_QUERY_KEY] }); // 목록·프로필 개수
            queryClient.invalidateQueries({ queryKey: SUPPORT_BOOKMARKS_QUERY_KEY }); // 지원사업 페이지 별표도 맞추기
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "관심 지원사업을 저장하지 못했어요.");
        } finally {
            setPendingKey(null);
        }
    }

    const buttonBase = "flex h-13 items-center justify-center rounded-xl";

    return (
        <section>
            <MyPageListHeader total={list.length} placeholder="관심 지원사업을 검색해 주세요" onSearch={setKeyword} />

            <div className="mt-15.25 h-0.5 bg-sub" />

            {isLoading ? (
                <Loading />
            ) : error ? (
                <ErrorComponent />
            ) : list.length === 0 ? (
                <p className="py-20 text-center text-lg text-ink-300">관심 등록한 지원사업이 없어요.</p>
            ) : (
            <ul>
                {list.map((item) => {
                    const key = bookmarkKey(item.source, item.source_id);
                    const ddayLabel = toDdayLabel(item);
                    const isUrgent = item.is_available && item.dday !== null && item.dday >= 0 && item.dday <= 3;
                    const isClosed = ddayLabel === "마감";
                    return (
                        <li key={item.bookmark_id} className="flex justify-between border-b-[1.2px] border-line-light pb-10 pt-8.5">
                            <div className="flex">
                                <p className={`w-32.5 shrink-0 font-outfit text-[38px] font-semibold leading-[1.1] ${
                                    isClosed ? "text-ink-300" : isUrgent ? "text-danger" : "text-ink-900"
                                }`}>
                                    {ddayLabel}
                                </p>
                                <div>
                                    {item.category && (
                                        <span className="inline-flex h-8.75 items-center rounded-full bg-surface px-3.5 text-[17px] font-medium text-ink-500">{item.category}</span>
                                    )}
                                    <p className={`mt-6.5 text-[26px] font-bold leading-[1.4] ${isClosed ? "text-ink-300" : "text-ink-900"}`}>{item.title}</p>
                                    <p className="mt-4 text-[19px] leading-normal text-ink-400">{toOrgLine(item)}</p>
                                </div>
                            </div>

                            <div className="mt-15 flex shrink-0 items-start gap-2.75">
                                <button
                                    type="button"
                                    onClick={() => toggleBookmark(item)}
                                    disabled={pendingKey === key}
                                    aria-label="관심 해제"
                                    className={`${buttonBase} w-15 bg-main-dark text-[22px] font-bold text-white shadow-[0px_6px_16px_0px_rgba(19,40,74,0.25)] disabled:opacity-40`}
                                >
                                    ★
                                </button>
                                {item.detail_url ? (
                                    <a
                                        href={item.detail_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${buttonBase} w-41.75 whitespace-pre border border-line bg-white text-[19px] font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]`}
                                    >
                                        {"공고 보기  ↗"}
                                    </a>
                                ) : (
                                    <span className={`${buttonBase} w-41.75 border border-line bg-white text-[19px] font-semibold text-ink-300`}>
                                        링크 없음
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            )}
        </section>
    );
}
