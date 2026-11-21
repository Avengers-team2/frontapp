"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";

const NAV_ITEMS = [
    { href: "/about", label: "서비스 소개" },
    { href: "/analysis", label: "분석도구" },
    { href: "/support", label: "지원사업" },
    { href: "/posts", label: "게시판" },
    { href: "/report-job", label: "기획서 AI 분석" },
];

export default function Header() {
    const pathname = usePathname();
    const { isAuthenticated, member } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const initial = member?.user_nickname?.charAt(0) ?? "";

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-white">
            <div className="mx-auto flex h-[90px] max-w-[1440px] items-center justify-between px-6">
                <Link href="/" aria-label="StartFit 홈">
                    <Image src="/assets/images/header/logo.svg" alt="StartFit" width={168} height={44} priority />
                </Link>

                <nav className="flex gap-12">
                    {NAV_ITEMS.map(({ href, label }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`text-[19px] font-bold transition-colors ${
                                    active ? "text-sub-700" : "text-ink-800 hover:text-sub-700"
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex w-[168px] justify-end">
                    {mounted && isAuthenticated ? (
                        <Link
                            href="/my-page"
                            aria-label="마이페이지"
                            className="flex size-10 items-center justify-center rounded-full bg-sub-700 text-[15px] font-bold text-white"
                        >
                            {initial}
                        </Link>
                    ) : (
                        <Link href="/login" className="text-[15px] font-semibold text-ink-600 hover:text-ink-900">
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
