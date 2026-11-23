"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoDark from "@/public/assets/images/header/logo.svg"
import logoWhite from "@/public/assets/images/header/logo-w.svg"
import HeaderAuth from "@/components/auth/HeaderAuth";

// 메인(/)은 다크 헤더, 그 외 서브페이지는 화이트 헤더
const variantStyles = {
    dark: {
        header: "bg-[rgba(5,11,23,0.45)] border-white/10",
        nav: "text-white",
        logo: logoWhite,
        auth: "dark" as const,
    },
    white: {
        header: "bg-white/70 border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        nav: "text-[#3D4A5C]",
        logo: logoDark,
        auth: "white" as const,
    },
};

export default function Header() {
    const pathname = usePathname();
    const style = variantStyles[pathname === "/" ? "dark" : "white"];

    return (
        <header className={`fixed top-0 flex justify-center items-center w-full h-20 backdrop-blur-md backdrop-saturate-150 border-b px-[5%] font-noto z-100 ${style.header}`}>
            <div className="relative flex justify-between items-center w-full max-w-[1440px]">
                <Link href="/">
                    <Image src={style.logo} alt="" />
                </Link>

                <ul className={`absolute left-1/2 -translate-x-1/2 flex gap-[30px] font-semibold ${style.nav}`}>
                    <li><Link href="/about" className="transition-colors hover:text-[#5EF0DC]">서비스 소개</Link></li>
                    <li><Link href="/analysis" className="transition-colors hover:text-[#5EF0DC]">상권 분석</Link></li>
                    <li><Link href="/support" className="transition-colors hover:text-[#5EF0DC]">지원사업</Link></li>
                    <li><Link href="/report-job" className="transition-colors hover:text-[#5EF0DC]">기획서 AI 분석</Link></li>
                    <li><Link href="/posts" className="transition-colors hover:text-[#5EF0DC]">게시판</Link></li>
                </ul>

                <HeaderAuth variant={style.auth} />
            </div>
        </header>
    );
}
