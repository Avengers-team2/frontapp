"use client"

import { Search } from "lucide-react";
import { SubmitEvent, useState } from "react";

interface MyPageListHeaderProps {
    total: number;
    placeholder: string;
    onSearch: (keyword: string) => void;
}

// 목록 위쪽: "총 : N건" + 검색창 (엔터 또는 돋보기 버튼으로 검색)
export default function MyPageListHeader({total, placeholder, onSearch}: MyPageListHeaderProps) {
    const [input, setInput] = useState("");

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(input.trim());
    }

    return (
        <div className="flex h-15 items-center justify-between">
            <p className="text-[22px] font-bold text-ink-900">총 : {total}건</p>
            <form
                onSubmit={handleSubmit}
                className="flex h-15 w-105 items-center rounded-full border-[1.5px] border-[#CFE9E4] bg-white pl-7 pr-2 shadow-[0px_4px_14px_0px_rgba(43,179,163,0.08)] focus-within:border-sub"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[17px] text-ink-900 placeholder:text-[#9AA4B2] focus:outline-none"
                />
                <button type="submit" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-main-dark">
                    <Search className="size-3.5 text-white" strokeWidth={3} />
                </button>
            </form>
        </div>
    );
}
