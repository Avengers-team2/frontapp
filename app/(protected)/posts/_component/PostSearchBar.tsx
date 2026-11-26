"use client"

import { PostSort, PostSortLabel } from "@/enums/post.enum";
import useAuthStore from "@/stores/useAuthStore";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

interface PostSearchBarProps {
    keyword: string;
    sort: PostSort;
    onKeywordChange: (keyword: string) => void;
    onSortChange: (sort: PostSort) => void;
}

// 검색창 + 정렬 드롭다운 + 글쓰기 버튼
export default function PostSearchBar({keyword, sort, onKeywordChange, onSortChange}: PostSearchBarProps) {

    const router = useRouter()
    const user = useAuthStore((state) => state.user);

    // 입력 중인 검색어 (엔터 전까지는 목록에 반영 안 함)
    const [input, setInput] = useState(keyword);

    // 엔터 → 검색
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onKeywordChange(input.trim());
    }

    // 글쓰기 버튼 클릭 → 로그인했으면 작성 페이지, 안 했으면 로그인 화면
    const handleWriteClick = () => {
        if (!user) return router.push("/login");
        router.push("/posts/write")
    }

    return (
        <div className="flex items-center gap-3">
            <form onSubmit={handleSubmit} className="flex w-84 items-center gap-2.25 rounded-full border border-[#CFE9E4] bg-white px-4.5 py-3.5 focus-within:border-sub">
                <Search className="size-4.5 shrink-0 text-ink-500" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="제목, 내용으로 검색"
                    className="w-full bg-transparent text-base text-ink-900 placeholder:text-[#9AA4B2] focus:outline-none"
                />
            </form>

            {/* 기본 화살표는 숨기고(appearance-none) ▾ 를 따로 배치 */}
            <div className="relative">
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value as PostSort)}
                    className="h-9.5 w-34 appearance-none rounded-xl border border-line bg-white pl-4.5 pr-8 text-base text-ink-700 focus:outline-none"
                >
                    {Object.values(PostSort).map((s) => (
                        <option key={s} value={s}>{PostSortLabel[s]}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-4.5 top-1/2 -translate-y-1/2 text-xs text-ink-700">▾</span>
            </div>

            <button
                type="button"
                onClick={handleWriteClick}
                className="h-9.5 rounded-full bg-linear-to-r from-main-dark via-[#1D5466] via-55% to-sub px-5 text-base font-bold text-white"
            >
                글쓰기
            </button>
        </div>
    );
}
