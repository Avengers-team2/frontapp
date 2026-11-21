"use client"

import { useState } from "react";
import MyPageListHeader from "./MyPageListHeader";
import { MOCK_SUPPORT_BOOKMARKS } from "./mockData";

// 관심 지원사업 (지원사업 북마크) 목록
export default function MyBookmarkList() {
    const [keyword, setKeyword] = useState("");
    // TODO: 지원사업 북마크 API 연결 전이라 화면에서만 별표 토글
    const [items, setItems] = useState(MOCK_SUPPORT_BOOKMARKS);

    const list = items.filter((item) => item.title.includes(keyword) || item.org.includes(keyword));

    const toggleBookmark = (id: number) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item));
    }

    const buttonBase = "flex h-13 items-center justify-center rounded-xl";

    return (
        <section>
            <MyPageListHeader total={list.length} placeholder="관심 지원사업을 검색해 주세요" onSearch={setKeyword} />

            <div className="mt-15.25 h-0.5 bg-sub" />

            <ul>
                {list.map((item) => (
                    <li key={item.id} className="flex justify-between border-b-[1.2px] border-line-light pb-10 pt-8.5">
                        <div className="flex">
                            <p className={`w-32.5 shrink-0 font-outfit text-[38px] font-semibold leading-[1.1] ${item.dday <= 3 ? "text-danger" : "text-ink-900"}`}>
                                D-{item.dday}
                            </p>
                            <div>
                                <span className="inline-flex h-8.75 items-center rounded-full bg-surface px-3.5 text-[17px] font-medium text-ink-500">{item.tag}</span>
                                <p className="mt-6.5 text-[26px] font-bold leading-[1.4] text-ink-900">{item.title}</p>
                                <p className="mt-4 text-[19px] leading-normal text-ink-400">{item.org}</p>
                            </div>
                        </div>

                        <div className="mt-15 flex shrink-0 items-start gap-2.75">
                            <button
                                type="button"
                                onClick={() => toggleBookmark(item.id)}
                                aria-label={item.bookmarked ? "관심 해제" : "관심 등록"}
                                className={`${buttonBase} w-15 text-[22px] font-bold ${
                                    item.bookmarked
                                        ? "bg-main-dark text-white shadow-[0px_6px_16px_0px_rgba(19,40,74,0.25)]"
                                        : "border border-line bg-white text-ink-300 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                                }`}
                            >
                                {item.bookmarked ? "★" : "☆"}
                            </button>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${buttonBase} w-41.75 whitespace-pre border border-line bg-white text-[19px] font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]`}
                            >
                                {"공고 보기  ↗"}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
