"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { SearchScope } from "@/api/support/support.api";

const SCOPES: { value: SearchScope; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "title", label: "공고명" },
    { value: "organization", label: "기관명" },
];

type SearchBarProps = {
    onSearch: (keyword: string, scope: SearchScope) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [keyword, setKeyword] = useState("");
    const [scope, setScope] = useState<SearchScope>("all");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSearch(keyword.trim(), scope);
            }}
            className="flex w-full max-w-240 items-center gap-4"
        >
            <div className="relative">
                <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as SearchScope)}
                    aria-label="검색 범위"
                    className="h-15 w-34 appearance-none rounded-full border-[1.5px] border-[#CFE9E4] bg-white pl-6 pr-10 text-[17px] text-ink-700 focus:border-sub focus:outline-none"
                >
                    {SCOPES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-ink-700">▾</span>
            </div>

            <div className="flex h-15 flex-1 items-center rounded-full border-[1.5px] border-[#CFE9E4] bg-white pl-7 pr-2 shadow-[0px_4px_14px_0px_rgba(43,179,163,0.08)] focus-within:border-sub">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="지원사업명이나 키워드로 검색"
                    className="min-w-0 flex-1 bg-transparent text-[17px] text-ink-900 placeholder:text-[#9AA4B2] focus:outline-none"
                />
                <button type="submit" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-main-dark px-6 text-[17px] font-bold text-white">
                    <Search className="size-4" strokeWidth={3} />
                    검색
                </button>
            </div>
        </form>
    );
}
