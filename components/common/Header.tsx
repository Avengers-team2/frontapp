"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
        header: "bg-white/40 border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        nav: "text-black",
        logo: logoDark,
        auth: "white" as const,
    },
};

// 스크롤을 이만큼 이상 움직였을 때만 방향을 바꾼다 (손떨림 같은 작은 움직임은 무시)
const SCROLL_DELTA = 6;
// 맨 위에서 이만큼 내려오기 전에는 숨기지 않는다
const HIDE_AFTER = 80;
// 스크롤이 멈추고 이 시간이 지나면 헤더가 다시 내려온다 (ms)
const SHOW_AFTER_IDLE = 250;

export default function Header() {
    const pathname = usePathname();
    const style = variantStyles[pathname === "/" ? "dark" : "white"];
    const headerRef = useRef<HTMLElement>(null);
    // 아래로 스크롤하면 위로 쇽 올라가 숨고, 위로 스크롤하거나 스크롤이 멈추면 다시 내려온다
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        let frame = 0;
        let idleTimer = 0;

        const update = () => {
            frame = 0;
            const y = window.scrollY;
            const delta = y - lastY;
            // 헤더 안에 포커스가 있으면(메뉴를 쓰는 중) 숨기지 않는다
            const busy = headerRef.current?.contains(document.activeElement) ?? false;

            if (y < HIDE_AFTER || delta < -SCROLL_DELTA) setHidden(false);
            else if (delta > SCROLL_DELTA && !busy) setHidden(true);
            if (Math.abs(delta) > SCROLL_DELTA) lastY = y;

            // 스크롤이 멈추면 잠시 뒤에 스르륵 다시 내려온다 (헤더를 누르려고 스크롤을 올릴 필요가 없게)
            window.clearTimeout(idleTimer);
            idleTimer = window.setTimeout(() => setHidden(false), SHOW_AFTER_IDLE);
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.cancelAnimationFrame(frame);
            window.clearTimeout(idleTimer);
        };
    }, []);

    return (
        <header
            ref={headerRef}
            // 숨을 때는 빠르게 쇽(0.2초), 다시 나올 때는 천천히 스르륵(0.5초)
            className={`fixed top-0 flex justify-center items-center w-full h-20 backdrop-blur-md backdrop-saturate-150 border-b px-[5%] font-noto z-100 transition-transform ease-out motion-reduce:transition-none ${
                hidden ? "-translate-y-full duration-200" : "translate-y-0 duration-500"
            } ${style.header}`}
        >
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
