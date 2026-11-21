"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
    const [address, setAddress] = useState("");
    const router = useRouter();

    // 체크 시작 → 분석(조건 입력) 페이지로 주소 전달
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!address.trim()) return;
        router.push(`/analysis?address=${encodeURIComponent(address)}`);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center w-[560px] h-[64px] pl-[21px] pr-[9px] rounded-[14px] bg-black/35 border-[1px] border-white/14 backdrop-blur-[12px]"
        >
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="계약하려는 주소나 동네를 입력하세요"
                className="flex-1 bg-transparent text-[16px] text-white placeholder:text-white outline-none"
            />
            <button
                type="submit"
                className="w-[113px] h-[50px] rounded-[12px] bg-[#ffc875] font-bold text-[16px] text-[#1a1206]"
            >
                체크 시작
            </button>
        </form>
    );
}