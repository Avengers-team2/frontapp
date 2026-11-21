"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";

type HeaderAuthProps = {
    variant: "dark" | "white";
};

// 헤더 오른쪽 영역: 로그인 상태면 이름 첫 글자 아바타, 아니면 로그인/회원가입 버튼
export default function HeaderAuth({ variant }: HeaderAuthProps) {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // 서버 렌더링 결과와 맞추기 위해, 마운트 이후에만 로그인 상태를 반영
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (mounted && isAuthenticated && user) {
        const initial = user.user_name?.charAt(0) ?? "";
        const avatarClass = variant === "dark"
            ? "bg-[#5EF0DC] text-[#050B17]"
            : "bg-[#1F3A5F] text-white";

        return (
            <Link
                href="/my-page"
                aria-label="마이페이지"
                className={`flex justify-center items-center w-10 h-10 rounded-full font-bold ${avatarClass}`}
            >
                {initial}
            </Link>
        );
    }

    if (variant === "dark") {
        return (
            <div className="flex gap-[20px] font-bold">
                <Link
                    href={"/join"}
                    className="bg-white border-1 border-[#5EF0DC] rounded-[50px] px-5 py-3"
                >회원가입</Link>
                <Link
                    href={"/login"}
                    className="bg-[#5EF0DC] border-1 border-[#fff] rounded-[50px] px-5 py-3 shadow-[5px_3px_20px_1px_rgba(94,240,220,0.3)]"
                >로그인</Link>
            </div>
        );
    }

    return (
        <div className="flex gap-[20px] font-bold">
            <Link
                href={"/login"}
                className="bg-white text-[#3D4A5C] border border-[#E3E8EF] rounded-[50px] px-5 py-3 transition-colors hover:bg-[#1F3A5F] hover:text-white hover:border-[#1F3A5F]"
            >로그인</Link>
            <Link
                href={"/analysis"}
                className="bg-[#1F3A5F] text-white border border-[#1F3A5F] rounded-[50px] px-5 py-3 transition-colors hover:bg-white hover:text-[#1F3A5F]"
            >무료로 시작하기</Link>
        </div>
    );
}
